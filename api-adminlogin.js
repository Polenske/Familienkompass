export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Passwort fehlt.' });

  const isValid = password === process.env.ADMIN_SECRET;
  if (!isValid) return res.status(401).json({ error: 'Falsches Passwort.' });

  // Simple token: in production use JWT
  return res.status(200).json({ token: process.env.ADMIN_SECRET });
}
