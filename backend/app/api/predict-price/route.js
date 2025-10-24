/**
 * API route to get AI price predictions for house listings
 * Communicates with Python Flask API
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Call Python Flask API (use 127.0.0.1 instead of localhost to avoid IPv6 issues)
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';
    const response = await fetch(`${pythonApiUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return Response.json(
        { error: error.error || 'Failed to get prediction' },
        { 
          status: response.status,
          headers: corsHeaders 
        }
      );
    }
    
    const prediction = await response.json();
    return Response.json(prediction, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Price prediction error:', error);
    return Response.json(
      { error: 'Failed to connect to prediction service' },
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
}

// Health check
export async function GET() {
  try {
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';
    const response = await fetch(`${pythonApiUrl}/health`);
    const data = await response.json();
    
    return Response.json({
      status: 'ok',
      python_api: data
    }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { status: 'error', message: 'Python API not reachable' },
      { 
        status: 503,
        headers: corsHeaders 
      }
    );
  }
}
