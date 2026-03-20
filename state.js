export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const GH_TOKEN = process.env.GITHUB_TOKEN;
  const GH_OWNER = 'serahnb2';
  const GH_REPO  = 'sera-tracker';
  const GH_FILE  = 'state.json';
  const GH_API   = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE}`;
  const headers  = { 'Authorization': `token ${GH_TOKEN}`, 'Content-Type': 'application/json' };

  // GET: 현재 상태 읽기
  if (req.method === 'GET') {
    try {
      const r = await fetch(GH_API, { headers });
      const d = await r.json();
      if (d.content) {
        const decoded = JSON.parse(Buffer.from(d.content, 'base64').toString('utf-8'));
        res.status(200).json({ state: decoded, sha: d.sha });
      } else {
        res.status(200).json({ state: null, sha: null });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // PUT: 상태 저장
  else if (req.method === 'PUT') {
    try {
      const { state, sha } = req.body;
      const content = Buffer.from(JSON.stringify(state)).toString('base64');
      const body = { message: 'update: project state', content, ...(sha ? { sha } : {}) };
      const r = await fetch(GH_API, { method: 'PUT', headers, body: JSON.stringify(body) });
      const d = await r.json();
      res.status(r.status).json({ sha: d.content?.sha });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
