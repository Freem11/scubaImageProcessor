import http from 'node:http';
import type { Options } from './src/entity/options.ts';
import { DiveSiteReviewPhotosProcessor } from './src/processor/basic/DiveSiteReviewPhotosProcessor.ts';
import { DiveSiteProcessor } from './src/processor/basic/diveSiteProcessor.ts';
import { DiveShopProcessor } from './src/processor/basic/diveShopProcessor.ts';
import { SealifePhotoProcessor } from './src/processor/basic/SealifePhotoProcessor.ts';
import { UserProfileProcessor } from './src/processor/basic/userProfileProcessor.ts';
import { initProjectConfig } from './src/util/initProjectConfig.ts';

// ---------------------------------------------------------------------------
// Project config — same variants as scubaseasons.ts
// ---------------------------------------------------------------------------

const options: Options = {
  name:                 'scubaseasons',
  initialImageVariants: [
    { name: 'sm', format: 'webp', width: 240,  params: ['-strip', '-quality', '75'] },
    { name: 'md', format: 'webp', width: 480,  params: ['-strip', '-quality', '75'] },
    { name: 'lg', format: 'webp', width: 960,  params: ['-strip', '-quality', '75'] },
    { name: 'xl', format: 'webp', width: 1920, params: ['-strip', '-quality', '75'] },
  ],
};

const projectConfig = initProjectConfig(options);

// ---------------------------------------------------------------------------
// Table → processor map
// ---------------------------------------------------------------------------

function getProcessor(tableName: string) {
  switch (tableName) {
    case 'diveSiteReviewPhotos': return new DiveSiteReviewPhotosProcessor(projectConfig);
    case 'diveSites':            return new DiveSiteProcessor(projectConfig);
    case 'shops':                return new DiveShopProcessor(projectConfig);
    case 'UserProfiles':         return new UserProfileProcessor(projectConfig);
    case 'photos':               return new SealifePhotoProcessor(projectConfig);
    default:                     return null;
  }
}

// ---------------------------------------------------------------------------
// HTTP server — no Express needed, plain Node http is sufficient
// ---------------------------------------------------------------------------

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const PORT           = process.env.PORT ?? 3000;

// Catch any unhandled promise rejections to prevent server crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err?.message ?? err);
});
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/process-image') {
    res.writeHead(404);
    res.end();
    return;
  }

  // Verify secret if configured
  if (WEBHOOK_SECRET && req.headers['x-webhook-secret'] !== WEBHOOK_SECRET) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Read body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload: { table?: string; record?: { id?: number } };
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const tableName = payload?.table;
    const recordId  = payload?.record?.id;

    if (!tableName || !recordId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing table or record.id' }));
      return;
    }

    const processor = getProcessor(tableName);
    if (!processor) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Unsupported table: ${tableName}` }));
      return;
    }

    // Respond immediately — don't make the DB trigger wait on processing
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ received: true, table: tableName, id: recordId }));

    // Process in background
    console.log(`[${tableName}:${recordId}] processing triggered`);
    processor.process()
      .then(images => {
        console.log(`[${tableName}:${recordId}] done`, images.map(i => i.id));
      })
      .catch(err => {
        console.error(`[${tableName}:${recordId}] error:`, err?.message ?? err);
      });
  });
});

server.listen(PORT, () => {
  console.log(`process-image server listening on port ${PORT}`);
});
