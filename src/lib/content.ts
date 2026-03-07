import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ContentItem<T = Record<string, unknown>> {
  slug: string;
  data: T;
  body: string;
  html: string;
}

export function getItem<T = Record<string, unknown>>(
  collection: string,
  slug: string
): ContentItem<T> | null {
  let filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(CONTENT_DIR, `${collection}.md`);
    if (!fs.existsSync(filePath)) return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    data: data as T,
    body: content,
    html: marked.parse(content, { async: false }) as string,
  };
}

export function listCollection<T = Record<string, unknown>>(
  collection: string
): ContentItem<T>[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const items = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    return getItem<T>(collection, slug)!;
  });
  return items.sort((a, b) => ((a.data as any).order ?? 0) - ((b.data as any).order ?? 0));
}

export function getSingleton<T = Record<string, unknown>>(
  name: string
): ContentItem<T> | null {
  const filePath = path.join(CONTENT_DIR, `${name}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug: name,
    data: data as T,
    body: content,
    html: marked.parse(content, { async: false }) as string,
  };
}

export function writeItem(
  collection: string,
  slug: string,
  data: Record<string, unknown>,
  body: string
): void {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.md`);
  const content = matter.stringify(body, data);
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function writeSingleton(
  name: string,
  data: Record<string, unknown>,
  body: string
): void {
  const filePath = path.join(CONTENT_DIR, `${name}.md`);
  const content = matter.stringify(body, data);
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function deleteItem(collection: string, slug: string): boolean {
  const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
