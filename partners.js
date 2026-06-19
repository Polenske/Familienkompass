// In production, replace the in-memory store with a real DB (e.g. Vercel KV, Supabase, PlanetScale)
// For demo purposes we use a module-level array (resets on cold start)
let partners = [
  {
    id: 'demo1',
    name: 'Kletterpark Pirna',
    category: 'Sport & Klettern',
    description: 'Deutschlands größter Kletterwald mit 9 Parcours für alle Altersgruppen. Sicherheitstraining inklusive.',
    location: 'Pirna',
    distanceKm: 25,
    price: 'ab 12€ p.P.',
    url: 'https://example.com',
    ages: ['7-10', '11-14', '14-16'],
    promoCode: 'FKOMPASS15',
    promoLabel: '15% Rabatt exklusiv für FamilienKompass-Leser',
    email: 'demo@example.com',
    status: 'active',
    sponsored: true,
    createdAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - public: return active partners
  if (req.method === 'GET') {
    const active = partners.filter(p => p.status === 'active');
    return res.status(200).json({ partners: active });
  }

  // POST - submit new partner application (public)
  if (req.method === 'POST') {
    const { name, category, description, location, distanceKm, price, url, ages, promoCode, promoLabel, email, contact } = req.body;
    if (!name || !email || !description) {
      return res.status(400).json({ error: 'Name, E-Mail und Beschreibung sind Pflichtfelder.' });
    }
    const newPartner = {
      id: Date.now().toString(),
      name, category, description, location,
      distanceKm: distanceKm || 0,
      price, url, ages: ages || [], promoCode, promoLabel, email, contact,
      status: 'pending',
      sponsored: false,
      createdAt: new Date().toISOString()
    };
    partners.push(newPartner);
    return res.status(201).json({ success: true, id: newPartner.id });
  }

  // PUT - admin: update partner status (protected)
  if (req.method === 'PUT') {
    const adminKey = req.headers.authorization?.replace('Bearer ', '');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Nicht autorisiert.' });
    }
    const { id, status, sponsored } = req.body;
    const partner = partners.find(p => p.id === id);
    if (!partner) return res.status(404).json({ error: 'Nicht gefunden.' });
    if (status !== undefined) partner.status = status;
    if (sponsored !== undefined) partner.sponsored = sponsored;
    return res.status(200).json({ success: true, partner });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
