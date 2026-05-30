const BASE_URL = (process.env.NEXT_PUBLIC_DIRECT_API_URL || '/api').replace(/\/$/, '');

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    // Handle auth errors globally if needed
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Redirect to login or dispatch event
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `API request failed (${response.status})`);
  }
  
  // Return null if no content
  if (response.status === 204) return null;
  
  return response.json();
}
