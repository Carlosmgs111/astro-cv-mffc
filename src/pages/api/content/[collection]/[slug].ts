import type { APIRoute } from 'astro';
import { getItem, writeItem, deleteItem } from '../../../../lib/content';
import { schemas } from '../../../../lib/schemas';

export const GET: APIRoute = async ({ params }) => {
  const { collection, slug } = params;
  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug required' }), { status: 400 });
  }

  const item = await getItem(collection, slug);
  if (!item) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({
    slug: item.slug,
    ...item.data,
    body: item.body,
    html: item.html,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { collection, slug } = params;
  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug required' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const { content: mdBody, ...frontmatter } = body;

    const schema = schemas[collection];
    if (schema) {
      const result = schema.safeParse(frontmatter);
      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error.flatten() }), { status: 400 });
      }
    }

    await writeItem(collection, slug, frontmatter, mdBody || '');

    return new Response(JSON.stringify({ slug, ...frontmatter }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const { collection, slug } = params;
  if (!collection || !slug) {
    return new Response(JSON.stringify({ error: 'Collection and slug required' }), { status: 400 });
  }

  const deleted = await deleteItem(collection, slug);
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
