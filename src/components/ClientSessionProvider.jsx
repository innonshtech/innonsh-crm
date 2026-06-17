'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

let refreshPromise = null;

export default function ClientSessionProvider({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Keep reference to the original fetch function
    const originalFetch = window.fetch;

    // Override the global fetch function
    window.fetch = async function (...args) {
      let response = await originalFetch(...args);

      // Extract url to verify if it's an authorization/refresh request
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

      // If the request returns 401 and is not a login or refresh request itself
      if (
        response.status === 401 &&
        !url.includes('/api/auth/login') &&
        !url.includes('/api/auth/refresh')
      ) {
        // If there's no ongoing refresh call, start one
        if (!refreshPromise) {
          refreshPromise = originalFetch('/api/auth/refresh', { method: 'POST' })
            .then((refreshRes) => {
              refreshPromise = null;
              return refreshRes.ok;
            })
            .catch((err) => {
              refreshPromise = null;
              console.error('Session refresh error:', err);
              return false;
            });
        }

        // Await the active refresh promise (either the current one or the concurrent one)
        const isSuccess = await refreshPromise;

        if (isSuccess) {
          // Retry the original request
          response = await originalFetch(...args);
        } else {
          // Refresh failed (or refresh token expired/revoked), redirect to login
          router.push('/login');
        }
      }

      return response;
    };

    // Restore the original fetch function on component unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  return children;
}
