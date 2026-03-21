import { createServer, type Server } from 'node:http';

type StartOptions = {
  port?: number;
  host?: string;
};

export type ServiceHandle = {
  server: Server;
  host: '127.0.0.1';
  port: number;
};

const LOCALHOST = '127.0.0.1' as const;

export async function startService(options: StartOptions = {}): Promise<ServiceHandle> {
  const requestedHost = options.host ?? LOCALHOST;

  if (requestedHost !== LOCALHOST) {
    throw new Error('localhost only policy: service must bind to 127.0.0.1');
  }

  const server = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy' }));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 0, LOCALHOST, () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('failed to bind service address');
  }

  return {
    server,
    host: LOCALHOST,
    port: address.port,
  };
}
