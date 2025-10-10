'use client';
import CapXLogo from '@/public/static/images/capx_minimalistic_logo.svg';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

/**
 * OAuth callback page (clean flow)
 *
 * Responsibilities
 * 1) Read oauth_token and oauth_verifier from the URL
 * 2) Ask the backend which hostname owns this oauth_token (POST /api/check)
 * 3) If the token belongs to another host, hard-redirect to that host's /oauth
 * 4) If it belongs to this host, sign in once with NextAuth credentials
 * 5) Navigate to /home on success, or to / on error
 *
 * Notes
 * - Single effect with hasRunRef prevents duplicate work under React StrictMode
 * - We use redirect: false in signIn to keep navigation control here
 * - Cross-host navigation uses window.location.assign to avoid client router races
 */
function OAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState<string>('Iniciando...');
  const hasRunRef = useRef(false);

  const oauth_verifier = searchParams?.get('oauth_verifier') ?? '';
  const oauth_token_request = searchParams?.get('oauth_token') ?? '';

  // Clean up temporary storage whenever we're authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      localStorage.removeItem('oauth_token');
      localStorage.removeItem('oauth_token_secret');
    }
  }, [status, session]);

  useEffect(() => {
    if (!oauth_token_request || !oauth_verifier) {
      setMessage('Parâmetros de OAuth ausentes.');
      router.push('/');
      return;
    }

    // Ensure the effect runs only once per mount (guards StrictMode double invoke)
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        setMessage('Verificando host de origem...');
        const response = await fetch('/api/check/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: oauth_token_request }),
        });
        if (!response.ok) throw new Error('Falha ao verificar token');
        const result: any = await response.json();

        // Compute the current host (with port when present) to compare with result.extra
        let hostname = `${document.location.hostname}`;
        if (document.location.port) hostname += `:${document.location.port}`;

        // Ensure the request token is stored for the credentials sign-in below
        const existing = localStorage.getItem('oauth_token');
        if (existing !== oauth_token_request) {
          localStorage.setItem('oauth_token', oauth_token_request);
        }

        // If token belongs to a different host, redirect there and stop
        if (result.extra !== hostname) {
          const protocol = result.extra.includes('toolforge.org') ? 'https' : 'http';
          const target = `${protocol}://${result.extra}/oauth?oauth_token=${oauth_token_request}&oauth_verifier=${oauth_verifier}`;
          if (!cancelled) {
            setMessage('Redirecionando para o host correto...');
            window.location.assign(target);
          }
          return;
        }

        // Host matches this instance → try to complete the login
        const oauth_token_secret = localStorage.getItem('oauth_token_secret');
        if (!oauth_token_secret) {
          setMessage('Sessão expirada. Tente novamente.');
          router.push('/');
          return;
        }

        // If the user already has a valid session, just go home
        if (status === 'authenticated') {
          setMessage('Login já realizado. Redirecionando...');
          router.push('/home');
          return;
        }

        setMessage('Finalizando login...');
        const res = await signIn('credentials', {
          oauth_token: oauth_token_request,
          oauth_token_secret,
          oauth_verifier,
          stored_token: oauth_token_request,
          stored_token_secret: oauth_token_secret,
          redirect: false, // keep control here
          callbackUrl: '/home',
        });

        if (res?.error) {
          setMessage(`Erro: ${res.error}`);
          router.push('/');
          return;
        }

        setMessage('Redirecionando...');
        router.push('/home');
      } catch (error) {
        console.error('OAuth error:', error);
        if (!cancelled) {
          setMessage('Erro durante autenticação.');
          router.push('/');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [oauth_token_request, oauth_verifier, router, status]);

  return (
    <section className="flex w-screen h-screen font-montserrat">
      <div className="flex flex-wrap w-1/2 mx-auto my-auto">
        <div className="flex w-fit mx-auto mb-4">
          <Image priority src={CapXLogo} alt="Capacity Exchange logo image." className="w-16" />
        </div>
        <div className="flex w-full text-center mb-4">
          <h1 className="w-full">{message}</h1>
        </div>
        <div className="flex w-fit mx-auto">
          <div className="mx-auto animate-spin ease-linear h-8 w-8 rounded-full border-8 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-capx-primary-blue"></div>
        </div>
      </div>
    </section>
  );
}

// Simple loading component that doesn't depend on theme context
function OAuthLoading() {
  return (
    <section className="flex w-screen h-screen font-montserrat">
      <div className="flex flex-wrap w-1/2 mx-auto my-auto">
        <div className="flex w-fit mx-auto mb-4">
          <Image priority src={CapXLogo} alt="Capacity Exchange logo image." className="w-16" />
        </div>
        <div className="flex w-full text-center mb-4">
          <h1 className="w-full">Loading...</h1>
        </div>
        <div className="flex w-fit mx-auto">
          <div className="mx-auto animate-spin ease-linear h-8 w-8 rounded-full border-8 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-capx-primary-blue"></div>
        </div>
      </div>
    </section>
  );
}

export default function OAuth() {
  return (
    <SessionProvider>
      <Suspense fallback={<OAuthLoading />}>
        <OAuthContent />
      </Suspense>
    </SessionProvider>
  );
}
