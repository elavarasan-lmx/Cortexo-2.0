/**
 * Push Notifications Service — Sprint 3 (F58–F61)
 *
 * Multi-channel notification dispatcher with per-user preference checking.
 * Channels: in-app (DB), email (existing lib/email.ts), push (FCM), Slack (webhook).
 */

import { getDb } from './db.js';
import {
  notifications,
  notificationPreferences,
  pushTokens,
} from '@cortexo/db/schema';
import { eq, and } from 'drizzle-orm';

// ─── Types ──────────────────────────────────────────────────────────

/** All notification events that the system can fire */
export type NotificationEvent =
  | 'deploy.success'
  | 'deploy.failed'
  | 'deploy.rollback'
  | 'error.new'
  | 'error.spike'
  | 'error.resolved'
  | 'scan.complete'
  | 'code_review.complete'
  | 'rca.complete'
  | 'fix.propagated'
  | 'health.degraded'
  | 'alert.triggered'
  | 'agent.complete'
  | 'security.vulnerability';

interface NotificationPayload {
  event: NotificationEvent;
  orgId: string;
  userId?: string;         // if targeting specific user; null = all org users
  title: string;
  message: string;
  link?: string;           // in-app navigation link
  data?: Record<string, unknown>;
}

interface UserChannels {
  inApp: boolean;
  email: boolean;
  push: boolean;
  slack: boolean;
}

// ─── Default preferences (when no custom prefs exist) ───────────────

const DEFAULT_CHANNELS: UserChannels = {
  inApp: true,
  email: false,
  push: false,
  slack: false,
};

// Events that default to email+inApp even without explicit preference
const HIGH_PRIORITY_EVENTS: NotificationEvent[] = [
  'deploy.failed',
  'error.spike',
  'health.degraded',
  'security.vulnerability',
];

// ─── Main Dispatcher ────────────────────────────────────────────────

/**
 * Dispatch a notification across all channels based on user preferences.
 * This is the single entry point for the entire notification system.
 */
export async function dispatchNotification(payload: NotificationPayload): Promise<void> {
  const { event, orgId, userId, title, message, link, data } = payload;

  console.log(`[Notifications] Dispatching: ${event} → "${title}"`);

  const db = await getDb();

  // Determine target users
  let targetUserIds: string[] = [];
  if (userId) {
    targetUserIds = [userId];
  } else {
    // TODO: Query all org members when user management is complete
    // For now, if no specific userId, create org-wide in-app notification
    try {
      await db.insert(notifications).values({
        orgId,
        userId: orgId, // placeholder — should be each org member
        type: event,
        title,
        message,
        link,
      } as any);
    } catch {
      /* best effort */
    }
    return;
  }

  // For each target user, check preferences and dispatch
  for (const uid of targetUserIds) {
    const channels = await getUserChannels(uid, event);

    // In-App notification
    if (channels.inApp) {
      await sendInApp(orgId, uid, event, title, message, link);
    }

    // Email notification
    if (channels.email) {
      await sendEmail(uid, title, message, data);
    }

    // Push notification (FCM)
    if (channels.push) {
      await sendPush(uid, title, message, data);
    }

    // Slack notification
    if (channels.slack) {
      await sendSlack(orgId, title, message, link);
    }
  }
}

// ─── Channel Implementations ────────────────────────────────────────

/** Save in-app notification to DB */
async function sendInApp(
  orgId: string, userId: string, event: string,
  title: string, message: string, link?: string,
): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(notifications).values({
      orgId,
      userId,
      type: event,
      title,
      message,
      link,
    } as any);
  } catch (err) {
    console.error('[Notifications/InApp] Failed:', err);
  }
}

/** Send email via existing email service */
async function sendEmail(
  userId: string, title: string, body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    // Use existing email.ts lib if available
    const emailLib = await import('./email.js').catch(() => null);
    if (emailLib && (emailLib as any).sendEmail) {
      await (emailLib as any).sendEmail({
        to: userId, // TODO: resolve userId → email address
        subject: `[Cortexo] ${title}`,
        text: body,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; border-radius: 12px 12px 0 0;">
              <h2 style="color: white; margin: 0; font-size: 18px;">🔔 ${title}</h2>
            </div>
            <div style="padding: 20px; background: #f9fafb; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
              <p style="color: #374151; font-size: 14px; line-height: 1.6;">${body}</p>
              ${data ? `<pre style="background: #1f2937; color: #e5e7eb; padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>` : ''}
            </div>
          </div>
        `,
      });
    } else {
      console.log(`[Notifications/Email] Email lib not available — skipping email to ${userId}`);
    }
  } catch (err) {
    console.error('[Notifications/Email] Failed:', err);
  }
}

/** Send push notification via FCM */
async function sendPush(
  userId: string, title: string, body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    const db = await getDb();

    // Get all push tokens for this user
    const tokens = await db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, userId));

    if (tokens.length === 0) return;

    const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
    if (!FCM_SERVER_KEY) {
      console.log('[Notifications/Push] FCM_SERVER_KEY not configured — skipping');
      return;
    }

    // Send to each registered device
    for (const tokenRow of tokens) {
      try {
        const res = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${FCM_SERVER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: tokenRow.token,
            notification: { title, body },
            data: data || {},
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[Notifications/Push] FCM error for token ${tokenRow.id}:`, errText);

          // Remove invalid token
          if (res.status === 400 || errText.includes('InvalidRegistration')) {
            await db.delete(pushTokens).where(eq(pushTokens.id, tokenRow.id));
            console.log(`[Notifications/Push] Removed invalid token ${tokenRow.id}`);
          }
        }

        // Update last used timestamp
        await db.update(pushTokens)
          .set({ lastUsedAt: new Date() })
          .where(eq(pushTokens.id, tokenRow.id));
      } catch (err) {
        console.error(`[Notifications/Push] Error sending to token ${tokenRow.id}:`, err);
      }
    }
  } catch (err) {
    console.error('[Notifications/Push] Failed:', err);
  }
}

/** Send Slack webhook notification */
async function sendSlack(
  orgId: string, title: string, text: string, link?: string,
): Promise<void> {
  try {
    // TODO: Look up Slack webhook URL from integrations table for this org
    const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
    if (!SLACK_WEBHOOK) {
      console.log('[Notifications/Slack] No webhook configured — skipping');
      return;
    }

    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `*${title}*\n${text}${link ? `\n<${link}|View in Cortexo>` : ''}`,
      }),
    });
  } catch (err) {
    console.error('[Notifications/Slack] Failed:', err);
  }
}

// ─── Preference Lookup ──────────────────────────────────────────────

/** Get effective notification channels for a user + event */
async function getUserChannels(userId: string, event: NotificationEvent): Promise<UserChannels> {
  try {
    const db = await getDb();
    const [pref] = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.event, event),
        ),
      )
      .limit(1);

    if (pref) {
      return {
        inApp: pref.inApp ?? true,
        email: pref.email ?? false,
        push: pref.push ?? false,
        slack: pref.slack ?? false,
      };
    }

    // No explicit preference — use defaults
    if (HIGH_PRIORITY_EVENTS.includes(event)) {
      return { inApp: true, email: true, push: false, slack: false };
    }

    return DEFAULT_CHANNELS;
  } catch {
    return DEFAULT_CHANNELS;
  }
}

// ─── Preference Management ──────────────────────────────────────────

/** Get all preferences for a user */
export async function getPreferences(userId: string) {
  const db = await getDb();
  return db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
}

/** Upsert a notification preference */
export async function upsertPreference(
  userId: string,
  event: string,
  channels: Partial<UserChannels>,
): Promise<void> {
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.event, event),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(notificationPreferences)
      .set(channels)
      .where(eq(notificationPreferences.id, existing.id));
  } else {
    await db.insert(notificationPreferences).values({
      userId,
      event,
      inApp: channels.inApp ?? true,
      email: channels.email ?? false,
      push: channels.push ?? false,
      slack: channels.slack ?? false,
    });
  }
}
