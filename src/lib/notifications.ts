import nodemailer from 'nodemailer';

export interface CommentNotificationInput {
  storyTitle: string;
  authorName: string;
  commentContent: string;
}

/**
 * Sanitize header strings against newline/CRLF/control-character header injection.
 */
export function sanitizeHeader(input: string): string {
  if (!input) return '';
  return input.replace(/[\r\n\x00-\x1F\x7F]+/g, ' ').trim();
}

/**
 * Sends a plain-text notification email when a new reader reflection is submitted.
 *
 * Requirements:
 * - Best-effort execution with a 5-second timeout.
 * - Plain text only (no HTML).
 * - Sanitized subject/name (no header injection).
 * - Never includes commenter email.
 * - Never includes direct approve/delete links.
 * - Skips silently with server log if SMTP env vars are missing.
 * - Never throws an uncaught error.
 */
export async function sendCommentNotification(
  input: CommentNotificationInput
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const notifyTo = process.env.NOTIFY_TO;
    const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');

    // 1. Verify required environment variables
    if (!host || !portStr || !user || !pass || !notifyTo || !siteUrl) {
      console.log(
        '[notifications] Email notification skipped: SMTP or SITE_URL environment variables are not fully configured.'
      );
      return { success: false, skipped: true, error: 'SMTP configuration incomplete' };
    }

    const port = parseInt(portStr, 10);
    if (isNaN(port)) {
      console.log('[notifications] Email notification skipped: Invalid SMTP_PORT.');
      return { success: false, skipped: true, error: 'Invalid SMTP_PORT' };
    }

    const recipients = notifyTo
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (recipients.length === 0) {
      console.log('[notifications] Email notification skipped: No valid recipients in NOTIFY_TO.');
      return { success: false, skipped: true, error: 'No valid recipients' };
    }

    // 2. Sanitize fields against header injection
    const cleanTitle = sanitizeHeader(input.storyTitle || 'Untitled Chapter');
    const cleanAuthor = sanitizeHeader(input.authorName || 'Anonymous Reader');

    // 3. Format plain text content (first 300 characters, no HTML, no commenter email)
    const commentSnippet = (input.commentContent || '').slice(0, 300);
    const adminUrl = `${siteUrl}/admin/comments`;

    const subject = `New comment on "${cleanTitle}" is waiting for approval`;
    const body = `A new reader reflection has been submitted and is awaiting approval.

Story: ${cleanTitle}
Commenter: ${cleanAuthor}

Reflection (first 300 chars):
${commentSnippet}

Moderate reflections in the author studio:
${adminUrl}
`;

    // 4. Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // True for 465, false for 587 or other ports
      auth: {
        user,
        pass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    // 5. Send with strict 5-second timeout
    const sendPromise = transporter.sendMail({
      from: `"Dust & Dazzle" <${user}>`,
      to: recipients,
      subject,
      text: body,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP send timed out after 5 seconds')), 5000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log(`[notifications] Successfully dispatched comment notification to: ${recipients.join(', ')}`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[notifications] Failed to send email notification:', errorMsg);
    // Best-effort: return false without throwing
    return { success: false, error: errorMsg };
  }
}
