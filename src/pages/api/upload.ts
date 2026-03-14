import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const ext = path.extname(file.name) || '.png';
    const safeName = `photo-${Date.now()}${ext}`;
    const destDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(destDir, safeName), buffer);

    return new Response(JSON.stringify({ path: `/images/${safeName}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
