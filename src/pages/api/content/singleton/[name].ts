import type { APIRoute } from 'astro';
import { getSingleton, writeSingleton } from '../../../../lib/content';
import { heroSchema } from '../../../../lib/schemas';

const singletonSchemas: Record<string, any> = {
  hero: heroSchema,
};

export const GET: APIRoute = async ({ params }) => {
  const { name } = params;
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
  }

  const item = await getSingleton(name);
  if (!item) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({
    ...item.data,
    body: item.body,
    html: item.html,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { name } = params;
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const { content: mdBody, ...frontmatter } = body;

    const schema = singletonSchemas[name];
    if (schema) {
      const result = schema.safeParse(frontmatter);
      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error.flatten() }), { status: 400 });
      }
    }

    await writeSingleton(name, frontmatter, mdBody ?? '');

    return new Response(JSON.stringify({ ok: true, ...frontmatter }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }
};
