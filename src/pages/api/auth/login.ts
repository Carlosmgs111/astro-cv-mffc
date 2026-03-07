import type { APIRoute } from 'astro';
import { validateCredentials, createToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { user, pass } = body;

    if (!user || !pass) {
      return new Response(JSON.stringify({ error: 'User and pass required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!validateCredentials(user, pass)) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = await createToken(user);

    cookies.set('token', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
