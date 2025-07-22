export function withCORS(handler) {
  return async (request, ...args) => {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      });
    }
    const response = await handler(request, ...args);
    // Always create a new Headers object to ensure CORS headers are set
    const headers = new Headers(response.headers || {});
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    // Return a new Response with the merged headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
} 
