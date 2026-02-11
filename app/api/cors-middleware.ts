import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to add CORS headers to API responses
 * This can be wrapped around any API handler
 */
export function withCors(handler: (req: NextRequest) => Promise<Response>) {
  return async function (req: NextRequest) {
    // Get the origin from the request headers
    const origin = req.headers.get('origin') || '*';

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Client-Info',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Call the original handler
    const response = await handler(req);

    // Create a NextResponse from the original response
    const nextResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', origin);
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Client-Info');
    nextResponse.headers.set('Access-Control-Allow-Credentials', 'true');

    return nextResponse;
  };
}

/**
 * Helper function to create a response with CORS headers
 */
export function corsResponse(body: any, status: number = 200, headers: Record<string, string> = {}) {
  const origin = headers['origin'] || '*';

  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Client-Info',
      'Access-Control-Allow-Credentials': 'true',
      ...headers,
    },
  });
}
