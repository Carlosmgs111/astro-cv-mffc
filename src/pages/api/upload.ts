import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'png';
    const safeName = `photo-${Date.now()}.${ext}`;

    const blob = await put(safeName, file, { access: 'public' });

    return new Response(JSON.stringify({ path: blob.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
