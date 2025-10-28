type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    console.log('Received bug report:', body);
    // TODO: wire to email/Supabase/third-party service. Waiting for Andrew to set up company email :(.
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Report API error', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
