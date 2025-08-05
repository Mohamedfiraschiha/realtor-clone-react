// List of allowed origins (add your production domains here)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://realtor-clone-react-4ziu-fdely25nb-firas-projects-2065c173.vercel.app',
  'https://realtor-clone-react-4ziu-1pkvwrn2b-firas-projects-2065c173.vercel.app',
  'https://realtor-clone-react-4ziu.vercel.app',
  'https://realtor-clone-react-4ziu-ezoxls83q-firas-projects-2065c173.vercel.app'
];

export function withCORS(handler) {
  return async (request, ...args) => {
    // Get the origin from the request
    const origin = request.headers.get('origin');
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || !origin;
    const allowedOrigin = isAllowedOrigin ? (origin || ALLOWED_ORIGINS[0]) : '';
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Vary': 'Origin'
        },
      });
    }

    try {
      const response = await handler(request, ...args);
      
      // Create a new Headers object to ensure CORS headers are set
      const headers = new Headers(response.headers || {});
      
      // Set CORS headers for the response
      if (isAllowedOrigin) {
        headers.set('Access-Control-Allow-Origin', allowedOrigin);
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('Access-Control-Allow-Credentials', 'true');
        headers.set('Vary', 'Origin');
      }
      
      // Return a new Response with the merged headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      // Log the error and rethrow it
      console.error('Error in CORS middleware:', error);
      throw error;
    }
  };
}