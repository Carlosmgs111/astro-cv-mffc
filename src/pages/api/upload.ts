import type { APIRoute } from 'astro';
import { getOctokit, repo } from '../../lib/github';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'png';
    const safeName = `photo-${Date.now()}.${ext}`;
    const filePath = `public/images/${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString('base64');

    const octokit = getOctokit();

    // Check if file already exists (get SHA for update)
    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: repo.owner,
        repo: repo.repo,
        path: filePath,
        ref: repo.branch,
      });
      if (!Array.isArray(data) && data.type === 'file') {
        sha = data.sha;
      }
    } catch {
      // File doesn't exist yet, that's fine
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.owner,
      repo: repo.repo,
      path: filePath,
      message: `cms: upload ${safeName}`,
      content,
      branch: repo.branch,
      ...(sha ? { sha } : {}),
    });

    return new Response(JSON.stringify({ path: `/images/${safeName}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const message = err?.message || String(err);
    console.error('Upload error:', message);
    return new Response(JSON.stringify({ error: 'Upload failed', detail: message }), { status: 500 });
  }
};
