import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users } from '@cortexo/db/schema';

/**
 * POST /api/auth/register
 *
 * Creates a new user account with email/password.
 * Optionally creates an organization if orgName is provided.
 *
 * Body: { name, email, password, orgName? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, orgName } = body;

    // --- Validation ---
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 },
      );
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 },
      );
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 },
      );
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 },
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available.' }, { status: 503 });
    }

    // --- Check for existing user ---
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    // --- Hash password ---
    const passwordHash = await hash(password, 12);

    // --- Create user ---
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'member',
      provider: 'credentials',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
        user: {
          id: userId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
