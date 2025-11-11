// Netlify Function: /api/search?q=...
// Requires env vars: GOOGLE_CSE_KEY, GOOGLE_CSE_CX
export async function handler(event) {
  const q = (event.queryStringParameters.q || "").slice(0, 200);
  if (!q) return { statusCode: 400, body: JSON.stringify({ error: "missing q" }) };

  const key = process.env.GOOGLE_CSE_KEY;
  const cx  = process.env.GOOGLE_CSE_CX;
  if (!key || !cx) return { statusCode: 501, body: JSON.stringify({ error: "search not configured" }) };

  const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    // Return only title/link to keep response tiny
    const items = (data.items || []).map(x => ({ title: x.title, link: x.link }));
    return { statusCode: 200, body: JSON.stringify({ items }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "search failed" }) };
  }
}
