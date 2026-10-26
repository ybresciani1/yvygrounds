// Serves Seed-Game so tools/card-art/render.js can paint its models into card art and save them (see render.js).
import fs from 'node:fs';
import path from 'node:path';
const OUT = 'C:/Workspace/YvyGrounds/cards/art';
export default {
  root: 'C:/Workspace/Seed-Game',
  server: { port: 5188, strictPort: true },
  plugins: [{
    name: 'card-art-save',
    configureServer(s) {
      s.middlewares.use('/__cards.html', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end('<!doctype html><meta charset="utf-8"><title>card art</title><body style="margin:0;background:#444;display:flex;flex-wrap:wrap;gap:4px"><script type="module" src="/src/.cardArtRender.js"></script>');
      });
      s.middlewares.use('/__save', (req, res) => {
        const name = new URL(req.url, 'http://x').searchParams.get('name');
        if (!/^[a-z0-9-]+\.(webp|png)$/.test(name || '')) { res.statusCode = 400; return res.end('bad name'); }
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => { fs.writeFileSync(path.join(OUT, name), Buffer.concat(chunks)); res.end('ok'); });
      });
    },
  }],
};
