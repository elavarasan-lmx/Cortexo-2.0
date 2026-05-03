import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users } from '@cortexo/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GET /api/profile — Get the current user's profile from the NextAuth session.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const user = result[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err: unknown) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

/**
 * PUT /api/profile — Update the current user's name and/or email.
 */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, phone } = body as { name?: string; email?: string; phone?: string };

    // Validate: at least one field must be present and non-empty (phone can be empty to clear it)
    const hasName = typeof name === 'string' && name.trim().length > 0;
    const hasEmail = typeof email === 'string' && email.trim().length > 0;
    const hasPhone = phone !== undefined; // phone can be '' to clear

    if (!hasName && !hasEmail && !hasPhone) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
    }

    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    const updateData: Record<string, string | null> = {};
    if (hasName) updateData.name = name!.trim();
    if (hasEmail) updateData.email = email!.trim();
    if (hasPhone) updateData.phone = phone ? phone.trim() : null;

    await db.update(users).set(updateData).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (err: unknown) {
    console.error('Profile PUT error:', err);
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

/**
 * POST /api/profile — Change password.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body as { currentPassword: string; newPassword: string };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    const result = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const user = result[0];

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Cannot change password for OAuth accounts' }, { status: 400 });
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password and save
    const newHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err: unknown) {
    console.error('Password change error:', err);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}

/* ─── Password Helpers ─── */
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Legacy bcrypt support
    if (hash.startsWith('$2')) {
      import('bcryptjs').then(({ compare }) => compare(password, hash).then(resolve)).catch(reject);
      return;
    }
    const [salt, storedHash] = hash.split(':');
    if (!salt || !storedHash) return resolve(false);
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(key.toString('hex') === storedHash);
    });
  });
}
