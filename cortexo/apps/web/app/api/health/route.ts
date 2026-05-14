/**
 * Next.js Health Check Endpoint
 *
 * Used by Docker, load-balancers, and uptime monitors to verify the
 * web application is alive and serving requests.
 *
 * GET /api/health → { status: 'ok', timestamp: ISO, uptime: seconds }
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'cortexo-web',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
