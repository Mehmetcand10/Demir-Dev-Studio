import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();

  await supabase.auth.signOut({ scope: "global" });

  // Çıkış bitince Müşteriyi site anasayfasına fırlat
  return NextResponse.redirect(new URL('/', req.url), {
    status: 302,
  });
}
