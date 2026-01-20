let refreshPromise: Promise<string | null> | null = null;

export async function refreshAuthToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('authToken', token);
        return token;
      }
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem('authToken');
  
  const makeRequest = async (authToken: string) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${authToken}`
      }
    });
  };

  let response = await makeRequest(token!);

  if (response.status === 401) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }

  return response;
}
