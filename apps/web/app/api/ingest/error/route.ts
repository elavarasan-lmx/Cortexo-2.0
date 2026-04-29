import { NextResponse } from 'next/server';

/**
 * Error ingestion is handled by the Fastify API server.
 * SDKs should send errors to: POST http://localhost:4000/v1/ingest/error
 */
export async function POST() {
  return NextResponse.json({
    message: 'Error ingest is handled by the API server at :4000/v1/ingest/error',
    redirect: process.env.API_URL + '/v1/ingest/error',
  }, { status: 307 });
}
