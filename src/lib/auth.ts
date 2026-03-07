import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET || 'dev-secret-change-me');

export async function createToken(user: string): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ user: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { user: string };
  } catch {
    return null;
  }
}

export function validateCredentials(user: string, pass: string): boolean {
  const adminUser = import.meta.env.ADMIN_USER || 'admin';
  const adminPass = import.meta.env.ADMIN_PASS || 'changeme';
  return user === adminUser && pass === adminPass;
}
