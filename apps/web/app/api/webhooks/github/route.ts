import { NextResponse } from 'next/server';

/**
 * GitHub webhooks are handled by the Fastify API server.
 * This route proxies/redirects to the API if needed.
 * 
 * Production webhook URL: POST http://localhost:4000/v1/webhooks/github
 */
export async function POST() {
  return NextResponse.json({
    message: 'Webhooks are handled by the API server at :4000/v1/webhooks/github',
    redirect: process.env.API_URL + '/v1/webhooks/github',
  }, { status: 307 });
}
