export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { date, dayName, season, weather, radiusDesc, ageDesc, isRainy } = req.body;

  if (!date) return res.status(400).json({ error: 'Missing parameters' });

  const prompt = `Du bist ein Familienfreizeitberater für die Region Dresden/Sachsen.
Datum: ${dayName}, ${date}. Jahreszeit: ${season}.
Wetter: ${weather}.${isRainy ? ' Schlechtes Wetter – bevorzuge Indoor-Aktivitäten!' : ' Gutes Außenwetter.'}
Zielgruppe: Familien ${ageDesc}.
Suchradius: ${radiusDesc}.

Erstelle exakt 12 Familienaktivitäten als JSON-Array. Kategorien: natur, kultur, sport, kreativ, event, ausflug, camping.

Altersgerecht auf die Zielgruppe angepasst. Echte konkrete Orte nutzen.

JSON-Felder pro Eintrag:
{"title":"max 5 Wörter","category":"natur|kultur|sport|kreativ|event|ausflug|camping","icon":"Emoji","location":"Ortsname","distanceKm":0,"isIndoor":false,"description":"2-3 Sätze, konkret, kindgerecht","cost":"kostenlos|kostenpflichtig","costDetail":"z.B. Eintritt frei","tip":"1 Eltern-Tipp","ageNote":"z.B. 4–8 Jahre","bookingUrl":null,"promoCode":null}

Echte Orte: Hellerau, Großer Garten, Bastei, Festung Königstein, Karl-May-Museum Radebeul, Zoo Leipzig, Belantis, Spreewelten Lübbenau, Tropical Islands, Cospudener See, Bärwalder See, Burg Stolpen, Erlebnisbergwerk Freiberg, Tierpark Radebeul, Miniaturpark Klein-Erzgebirge, Campingpark Oberrabenstein.

Ca. 50% kostenlos. NUR JSON-Array, kein Text davor/danach.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'API error' });
    }

    const data = await response.json();
    const text = data.content.map(i => i.text || '').join('');
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: 'No JSON in response' });

    const activities = JSON.parse(match[0]);
    return res.status(200).json({ activities });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
