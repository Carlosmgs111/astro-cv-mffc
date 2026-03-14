import matter from 'gray-matter';
import { marked } from 'marked';
import { getOctokit, repo } from './github';

// --- Cache with TTL ---
const CACHE_TTL = 60_000; // 60 seconds
const cache = new Map<string, { data: unknown; ts: number }>();

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function cacheSet(key: string, data: unknown): void {
  cache.set(key, { data, ts: Date.now() });
}

function cacheInvalidate(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

// --- GitHub helpers ---

/** Fetch a single file's content (utf-8) and its SHA. */
async function fetchFile(path: string): Promise<{ content: string; sha: string } | null> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path,
      ref: repo.branch,
    });
    if (Array.isArray(data) || data.type !== 'file') return null;
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha };
  } catch (e: any) {
    if (e.status === 404) return null;
    throw e;
  }
}

/** List file names in a directory. */
async function listDir(dirPath: string): Promise<string[]> {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path: dirPath,
      ref: repo.branch,
    });
    if (!Array.isArray(data)) return [];
    return data
      .filter((entry) => entry.type === 'file' && entry.name.endsWith('.md'))
      .map((entry) => entry.name);
  } catch (e: any) {
    if (e.status === 404) return [];
    throw e;
  }
}

/** Create or update a file in the repo (creates a commit). */
async function putFile(path: string, content: string, message: string): Promise<void> {
  const octokit = getOctokit();
  // Get current SHA if file exists (needed for updates)
  const existing = await fetchFile(path);
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: repo.owner,
    repo: repo.repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch: repo.branch,
    ...(existing ? { sha: existing.sha } : {}),
  });
}

/** Delete a file from the repo (creates a commit). */
async function removeFile(path: string, message: string): Promise<boolean> {
  const existing = await fetchFile(path);
  if (!existing) return false;
  const octokit = getOctokit();
  await octokit.rest.repos.deleteFile({
    owner: repo.owner,
    repo: repo.repo,
    path,
    message,
    sha: existing.sha,
    branch: repo.branch,
  });
  return true;
}

// --- Parse helper ---

function parseMarkdown<T>(raw: string, slug: string): ContentItem<T> {
  const { data, content } = matter(raw);
  return {
    slug,
    data: data as T,
    body: content,
    html: marked.parse(content, { async: false }) as string,
  };
}

// --- Public API (same exports, now async) ---

export interface ContentItem<T = Record<string, unknown>> {
  slug: string;
  data: T;
  body: string;
  html: string;
}

export async function getItem<T = Record<string, unknown>>(
  collection: string,
  slug: string
): Promise<ContentItem<T> | null> {
  const cacheKey = `item:${collection}:${slug}`;
  const cached = cacheGet<ContentItem<T>>(cacheKey);
  if (cached) return cached;

  // Try collection file first, then singleton-style
  let file = await fetchFile(`content/${collection}/${slug}.md`);
  if (!file) {
    file = await fetchFile(`content/${collection}.md`);
    if (!file) return null;
  }

  const item = parseMarkdown<T>(file.content, slug);
  cacheSet(cacheKey, item);
  return item;
}

export async function listCollection<T = Record<string, unknown>>(
  collection: string
): Promise<ContentItem<T>[]> {
  const cacheKey = `list:${collection}`;
  const cached = cacheGet<ContentItem<T>[]>(cacheKey);
  if (cached) return cached;

  const files = await listDir(`content/${collection}`);
  const items: ContentItem<T>[] = [];

  for (const fileName of files) {
    const slug = fileName.replace(/\.md$/, '');
    const file = await fetchFile(`content/${collection}/${fileName}`);
    if (file) {
      items.push(parseMarkdown<T>(file.content, slug));
    }
  }

  items.sort((a, b) => ((a.data as any).order ?? 0) - ((b.data as any).order ?? 0));
  cacheSet(cacheKey, items);
  return items;
}

export async function getSingleton<T = Record<string, unknown>>(
  name: string
): Promise<ContentItem<T> | null> {
  const cacheKey = `singleton:${name}`;
  const cached = cacheGet<ContentItem<T>>(cacheKey);
  if (cached) return cached;

  const file = await fetchFile(`content/${name}.md`);
  if (!file) return null;

  const item = parseMarkdown<T>(file.content, name);
  cacheSet(cacheKey, item);
  return item;
}

export async function writeItem(
  collection: string,
  slug: string,
  data: Record<string, unknown>,
  body: string
): Promise<void> {
  const fileContent = matter.stringify(body, data);
  await putFile(
    `content/${collection}/${slug}.md`,
    fileContent,
    `cms: update ${collection}/${slug}`
  );
  cacheInvalidate(`list:${collection}`);
  cacheInvalidate(`item:${collection}:${slug}`);
}

export async function writeSingleton(
  name: string,
  data: Record<string, unknown>,
  body: string
): Promise<void> {
  const fileContent = matter.stringify(body, data);
  await putFile(
    `content/${name}.md`,
    fileContent,
    `cms: update ${name}`
  );
  cacheInvalidate(`singleton:${name}`);
}

export async function deleteItem(collection: string, slug: string): Promise<boolean> {
  const deleted = await removeFile(
    `content/${collection}/${slug}.md`,
    `cms: delete ${collection}/${slug}`
  );
  if (deleted) {
    cacheInvalidate(`list:${collection}`);
    cacheInvalidate(`item:${collection}:${slug}`);
  }
  return deleted;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
