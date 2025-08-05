// List of allowed origins (add your production domains here)
const allowedOrigins = [
  'http://localhost:3000',
  'https://realtor-clone-react-4ziu-ezoxls83q-firas-projects-2065c173.vercel.app',
  'https://realtor-clone-react-4ziu-fdely25nb-firas-projects-2065c173.vercel.app'
];

export function withCORS(handler) {
  return async (request, ...args) => {
    // Get the origin from the request
    const origin = request.headers.get('origin');
    const isAllowedOrigin = allowedOrigins.includes(origin) || !origin;
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Vary': 'Origin'
        },
      });
    }

    // Process the request
    const response = await handler(request, ...args);
    
    // Create new headers for the response
    const headers = new Headers(response.headers || {});
    
    // Set CORS headers
    if (isAllowedOrigin) {
      headers.set('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      headers.set('Access-Control-Allow-Credentials', 'true');
      headers.set('Vary', 'Origin');
    }

    // Return the response with CORS headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}