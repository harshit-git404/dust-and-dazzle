import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables from .env.local, then fallback to .env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function runTestNotification() {
  console.log('--- Dust & Dazzle: Test Notification Email ---');

  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const notifyTo = process.env.NOTIFY_TO;
  const siteUrl = (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://dust-and-dazzle.vercel.app'
  ).replace(/\/+$/, '');

  // Log non-sensitive status (NEVER print the password)
  console.log(`SMTP_HOST: ${host ? host : '[NOT SET]'}`);
  console.log(`SMTP_PORT: ${portStr ? portStr : '[NOT SET]'}`);
  console.log(`SMTP_USER: ${user ? user : '[NOT SET]'}`);
  console.log(`SMTP_PASS: ${pass ? '[SET (hidden)]' : '[NOT SET]'}`);
  console.log(`NOTIFY_TO: ${notifyTo ? notifyTo : '[NOT SET]'}`);
  console.log(`SITE_URL : ${siteUrl}`);

  if (!host || !portStr || !user || !pass || !notifyTo) {
    console.error(
      '\n❌ FAILURE: Missing required environment variables. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_TO.'
    );
    process.exit(1);
  }

  const port = parseInt(portStr, 10);
  if (isNaN(port)) {
    console.error('\n❌ FAILURE: SMTP_PORT is not a valid number.');
    process.exit(1);
  }

  const recipients = notifyTo
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.error('\n❌ FAILURE: NOTIFY_TO contains no valid email addresses.');
    process.exit(1);
  }

  const subject = '[TEST] Dust & Dazzle Notification Verification';
  const body = `This is a test notification from Dust & Dazzle to verify your SMTP configuration.

If you received this email, new reader reflection notifications are configured correctly.

Author Studio Moderation URL:
${siteUrl}/admin/comments
`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      family: 4,
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 6000,
    });

    console.log('\nSending test email...');

    const sendPromise = transporter.sendMail({
      from: `"Dust & Dazzle (Test)" <${user}>`,
      to: recipients,
      subject,
      text: body,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP connection timed out after 5s')), 5000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log(`\n✅ SUCCESS: Test email successfully sent to: ${recipients.join(', ')}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ FAILURE: Failed to send test email. Error: ${message}`);
    process.exit(1);
  }
}

runTestNotification();
