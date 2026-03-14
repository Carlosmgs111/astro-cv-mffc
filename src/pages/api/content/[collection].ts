import type { APIRoute } from 'astro';
import { listCollection, writeItem, slugify } from '../../../lib/content';
import { schemas } from '../../../lib/schemas';

export const GET: APIRoute = async ({ params }) => {
  const { collection } = params;
  if (!collection) {
    return new Response(JSON.stringify({ error: 'Collection required' }), { status: 400 });
  }

  const items = await listCollection(collection);
  return new Response(JSON.stringify(items.map((item) => ({
    slug: item.slug,
    ...item.data,
    body: item.body,
    html: item.html,
  }))), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const { collection } = params;
  if (!collection) {
    return new Response(JSON.stringify({ error: 'Collection required' }), { status: 400 });
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

    const slugSource = frontmatter.title || frontmatter.name || frontmatter.degree || frontmatter.label || 'item';
    const slug = slugify(slugSource);

    await writeItem(collection, slug, frontmatter, mdBody || '');

    return new Response(JSON.stringify({ slug, ...frontmatter }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }
};
