import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppContainer } from './container.js';
import { checkReadiness } from './operational-health.js';
import { startServer } from './runtime.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');

export function createHttpServer(appContainer = createAppContainer()) {
  const {
    backlogCalendarService,
    multiFormatFormatterService,
    batchProductionService,
    adminObservabilityService
  } = appContainer.services;

  function sendJson(res, status, payload) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
  }

  function readJsonBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (err) {
          reject(err);
        }
      });
      req.on('error', reject);
    });
  }

  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });

    if (req.method === 'GET' && req.url === '/healthz') {
      return sendJson(res, 200, { status: 'alive' });
    }
    if (req.method === 'GET' && req.url === '/readyz') {
      const readiness = await checkReadiness(appContainer);
      return sendJson(res, readiness.status === 'ready' ? 200 : 503, readiness);
    }

    // SURFACE 1: MARKETER STUDIO ROUTES
    if (req.method === 'GET' && req.url === '/api/studio/bootstrap') {
      const data = await backlogCalendarService.getStudioBootstrap();
      return sendJson(res, 200, data);
    }

    if (req.method === 'POST' && req.url === '/api/studio/brand-profile') {
      try {
        const body = await readJsonBody(req);
        const data = await backlogCalendarService.updateBrandProfile(body);
        return sendJson(res, 200, data);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (req.method === 'POST' && req.url === '/api/studio/backlog') {
      try {
        const body = await readJsonBody(req);
        const data = await backlogCalendarService.addStory(body);
        return sendJson(res, 201, data);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (req.method === 'POST' && req.url === '/api/studio/schedule') {
      try {
        const body = await readJsonBody(req);
        const data = await backlogCalendarService.scheduleStory(body);
        return sendJson(res, 200, data);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (req.method === 'POST' && req.url === '/api/studio/generate-campaign') {
      try {
        const { storyId } = await readJsonBody(req);
        const { story, campaign } = await multiFormatFormatterService.generateCampaignForStory(storyId);
        const { backlog, calendar } = await backlogCalendarService.getStudioBootstrap();
        return sendJson(res, 200, { story, campaign, backlog, calendar });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (req.method === 'POST' && req.url === '/api/studio/save-edit') {
      try {
        const body = await readJsonBody(req);
        const result = await multiFormatFormatterService.saveInlineEdit(body);
        return sendJson(res, 200, result);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (req.method === 'POST' && req.url === '/api/studio/export-asset') {
      try {
        const body = await readJsonBody(req);
        const result = await multiFormatFormatterService.exportFormattedAsset(body);
        return sendJson(res, 200, result);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // SURFACE 2: FOUNDER ADMIN & OBSERVABILITY ROUTES
    if (req.method === 'GET' && req.url === '/api/admin/overview') {
      return sendJson(res, 200, adminObservabilityService.getOverview());
    }

    if (req.method === 'POST' && req.url === '/api/admin/gateway-config') {
      try {
        const patch = await readJsonBody(req);
        return sendJson(res, 200, adminObservabilityService.updateGatewayConfig(patch));
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (req.method === 'POST' && req.url === '/api/admin/run-weekly-batch') {
      try {
        const result = await batchProductionService.runWeeklyBatch({ maxStories: 1 });
        return sendJson(res, 200, result);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (req.method === 'GET' && req.url === '/api/admin/backprop-jsonl') {
      const jsonl = adminObservabilityService.exportBackpropDatasetJsonl();
      res.writeHead(200, {
        'Content-Type': 'application/x-ndjson',
        'Content-Disposition': 'attachment; filename="backprop-preferences.jsonl"'
      });
      return res.end(jsonl);
    }

    if (req.method === 'GET' && req.url === '/api/admin/context-graph') {
      return sendJson(res, 200, adminObservabilityService.getContextGraph());
    }

    const requestedPath = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(DIST_DIR, path.normalize(requestedPath));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.json': 'application/json'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      return fs.createReadStream(filePath).pipe(res);
    }

    sendJson(res, 404, { error: 'Not found' });
  });
}

// Start server if run directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer(createHttpServer());
}
