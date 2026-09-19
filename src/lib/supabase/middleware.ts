import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase keys are not set up yet, protect /admin by redirecting to /login
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection for /admin: unauthenticated visitors or non-authors are redirected to /login
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const { data: isAuthor } = await supabase.rpc('is_author');
    if (isAuthor === false) {
      const { data: authorRecord } = await supabase
        .from('authors')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!authorRecord) {
        await supabase.auth.signOut();
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // If already logged in and author, visiting /login redirects straight to /admin
  if (request.nextUrl.pathname === '/login' && user) {
    const { data: isAuthor } = await supabase.rpc('is_author');
    if (isAuthor) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}
