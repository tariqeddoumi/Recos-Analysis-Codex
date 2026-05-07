import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const runtime = 'nodejs';

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  expiresIn: z.number().int().positive().optional(),
});

function getPublicSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request) {
  const parsed = sessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Session Supabase invalide.' }, { status: 400 });
  }

  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase.auth.getUser(parsed.data.accessToken);

  if (error || !data.user) {
    return NextResponse.json({ error: 'Token Supabase refusé.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const maxAge = Math.max(60, Math.min(parsed.data.expiresIn ?? 3600, 60 * 60 * 8));

  response.cookies.set('sb-access-token', parsed.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  if (parsed.data.refreshToken) {
    response.cookies.set('sb-refresh-token', parsed.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
