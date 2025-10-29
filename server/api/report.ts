type VercelRequest = any;
type VercelResponse = any;
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    const REPORT_SECRET = process.env.REPORT_SECRET;
    if (REPORT_SECRET) {
      const provided = req.headers['x-report-key'] || req.headers['x-report-key'.toLowerCase()];
      if (provided !== REPORT_SECRET) {
        console.warn('Unauthorized report attempt');
        return res.status(401).json({ ok: false, error: 'Unauthorized' });
      }
    }
    console.log('Received bug report:', body);
    const subject = body.subject || `New bug report from ${body.name || 'unknown'}`;
    const messageLines: string[] = [];
    if (body.name) messageLines.push(`Name: ${body.name}`);
    if (body.email) messageLines.push(`Email: ${body.email}`);
    if (body.outfitId) messageLines.push(`Outfit ID: ${body.outfitId}`);
    messageLines.push('---');
    messageLines.push(body.message || body.description || '(no description)');
    const message = messageLines.join('\n');

    try {
      await supabaseAdmin.from('reports').insert([
        {
          user_id: body.userId || null,
          name: body.name || null,
          email: body.email || null,
          subject,
          message,
        },
      ]);
      console.log('Report stored in Supabase reports table');
    } catch (dbErr) {
      console.error('Failed to store report in Supabase', dbErr);
    }

    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const TO_EMAIL = process.env.REPORT_TO_EMAIL || 'strat.develop@gmail.com';
    const FROM_EMAIL = process.env.REPORT_FROM_EMAIL || `noreply@${process.env.VERCEL_URL || 'fashion-app.local'}`;

    if (DISCORD_WEBHOOK) {
      try {
        const payload = {
          content: `**Bug report**\n**From:** ${body.name || 'anon'} <${body.email || 'no-email'}>\n**Subject:** ${subject}\n\n${message}`,
        };
        const fetchImpl = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;
        const r = await fetchImpl(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!r.ok) {
          const text = await r.text();
          console.error('Discord webhook send failed', r.status, text);
        } else {
          console.log('Report sent to Discord webhook');
          return res.status(200).json({ ok: true, webhook: 'discord' });
        }
      } catch (e) {
        console.error('Discord webhook error', e);
      }
    }

    if (SENDGRID_API_KEY) {
      try {
        const payload = {
          personalizations: [
            {
              to: [{ email: TO_EMAIL }],
              subject: subject,
            },
          ],
          from: { email: FROM_EMAIL },
          content: [
            {
              type: 'text/plain',
              value: message,
            },
          ],
        };

        const fetchImpl = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;
        const r = await fetchImpl('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (!r.ok) {
          const text = await r.text();
          console.error('SendGrid send failed', r.status, text);
          return res.status(500).json({ ok: false, error: 'SendGrid send failed', detail: text });
        }

        console.log('Report emailed to', TO_EMAIL);
        return res.status(200).json({ ok: true, emailed: true });
      } catch (e) {
        console.error('SendGrid error', e);
      }
    }

    console.log('Report (not emailed, not set or send failed):', { to: TO_EMAIL, from: FROM_EMAIL, subject, message });
    return res.status(200).json({ ok: true, emailed: false });
  } catch (e) {
    console.error('Report API error', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
