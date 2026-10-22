import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 8000);
const apiUrl = process.env.API_URL || 'http://127.0.0.1:8002';
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);

    if (pathname.startsWith('/api/')) {
      const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await readRequestBody(request);
      const apiResponse = await fetch(`${apiUrl}${pathname}`, {
        method: request.method,
        headers: { 'Content-Type': request.headers['content-type'] || 'application/json' },
        body,
      });
      response.writeHead(apiResponse.status, {
        'Content-Type': apiResponse.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      });
      response.end(Buffer.from(await apiResponse.arrayBuffer()));
      return;
    }

    const requestedPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = resolve(root, `.${requestedPath}`);

    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const contents = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream' });
    response.end(contents);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Portfolio running at http://localhost:${port}`);
});

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks);
}
