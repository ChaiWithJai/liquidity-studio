import { randomUUID } from 'node:crypto';
import { campaignFromApprovedClaims, getApprovedClaims, validateCampaign, ContentIntegrityError } from './source-integrity.js';

const PROVIDERS = new Set(['gcp-gemini', 'gcp-vertex', 'openai-gateway']);
const CONFIG_FIELDS = ['provider', 'model', 'gatewayUrl', 'projectId', 'location', 'allowSynthetic', 'temperature', 'timeoutMs', 'maxOutputTokens'];

export class AIGateway {
  constructor(config = {}) {
    this.fetch = config.fetch || globalThis.fetch;
    this.accessTokenProvider = config.accessTokenProvider;
    this.config = {
      provider: process.env.AI_PROVIDER || 'gcp-gemini',
      model: process.env.AI_MODEL || 'gemini-3.8-flash',
      gatewayUrl: process.env.AI_GATEWAY_URL || '',
      projectId: process.env.GOOGLE_CLOUD_PROJECT || '',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      allowSynthetic: process.env.AI_ALLOW_SYNTHETIC === 'true',
      temperature: 0.2, timeoutMs: 15000, maxOutputTokens: 4096
    };
    this.updateConfig(config);
  }

  getConfig() { return { ...this.config }; }

  updateConfig(patch = {}) {
    const next = { ...this.config };
    for (const field of CONFIG_FIELDS) if (patch[field] !== undefined) next[field] = patch[field];
    if (!PROVIDERS.has(next.provider) || typeof next.model !== 'string' || !/^[a-zA-Z0-9._/-]+$/.test(next.model)) throw new Error('Invalid AI provider/model configuration');
    if (typeof next.allowSynthetic !== 'boolean' || !Number.isFinite(next.temperature) || next.temperature < 0 || next.temperature > 2 || !Number.isInteger(next.timeoutMs) || next.timeoutMs < 10 || next.timeoutMs > 60000 || !Number.isInteger(next.maxOutputTokens) || next.maxOutputTokens < 128 || next.maxOutputTokens > 8192) throw new Error('Invalid AI limits');
    if (next.gatewayUrl) {
      let url;
      try { url = new URL(next.gatewayUrl); } catch { throw new Error('Invalid gateway URL'); }
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Gateway URL must use HTTPS without credentials or query parameters');
    }
    if (next.provider === 'gcp-vertex' && (!/^[a-zA-Z0-9-]+$/.test(next.projectId) || !/^[a-z0-9-]+$/.test(next.location))) throw new Error('Vertex requires explicit project and location');
    this.config = next;
    return this.getConfig();
  }

  async generateStructured({ systemInstruction, prompt, responseSchema, traceMeta = {} }) {
    const startedAt = Date.now();
    const { provider, model, timeoutMs, maxOutputTokens, temperature } = this.config;
    // Do not spread arbitrary caller metadata into status/provider/error fields.
    const meta = Object.fromEntries(['operation', 'storyId', 'organizationId', 'brandId', 'contentDomain'].filter(key => typeof traceMeta[key] === 'string').map(key => [key, traceMeta[key]]));
    const baseTrace = () => ({ ...meta, traceId: randomUUID(), timestamp: new Date().toISOString(), provider, model, latencyMs: Date.now() - startedAt, promptChars: (prompt || '').length });
    let claims;
    try { claims = getApprovedClaims(traceMeta.story); } catch (error) {
      throw Object.assign(error, { trace: { ...baseTrace(), status: 'error', error: error.code } });
    }
    const finish = (output, mode, reason = null) => {
      validateCampaign(output, traceMeta.story);
      const provenance = { mode, reason, requiresReview: true, source: 'approved-source-excerpts', claimIds: claims.map(claim => claim.id), sources: claims.map(({ id, sourceUrl }) => ({ claimId: id, sourceUrl })), factualAccuracy: 'not_assessed' };
      return { output: { ...output, provenance }, trace: { ...baseTrace(), provider: mode === 'synthetic' ? 'offline-synthetic' : provider, status: mode === 'synthetic' ? 'degraded' : 'success', provenance } };
    };
    const controller = new AbortController();
    let timer;
    const deadline = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Object.assign(new Error('AI request timed out'), { code: 'PROVIDER_TIMEOUT' })); }, timeoutMs); });
    try {
      const request = async () => {
        const headers = { 'Content-Type': 'application/json' };
        let url;
        let body;
        if (provider === 'gcp-gemini') {
          const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
          if (!key) throw Object.assign(new Error('AI credentials are missing; synthetic generation is disabled'), { code: 'PROVIDER_CREDENTIALS_MISSING' });
          const base = this.config.gatewayUrl || 'https://generativelanguage.googleapis.com/v1beta';
          url = `${base.replace(/\/$/, '')}/models/${model.replace(/^models\//, '')}:generateContent`;
          headers['x-goog-api-key'] = key;
          body = { systemInstruction: { parts: [{ text: systemInstruction }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens, responseMimeType: 'application/json', responseSchema } };
        } else {
          let token;
          let base;
          if (provider === 'gcp-vertex') {
            token = this.accessTokenProvider ? await this.accessTokenProvider({ signal: controller.signal }) : process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
            if (!token && process.env.AI_VERTEX_USE_METADATA === 'true') {
              const tokenResponse = await this.fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', { headers: { 'Metadata-Flavor': 'Google' }, signal: controller.signal });
              if (!tokenResponse.ok) throw new Error('Metadata identity unavailable');
              token = (await tokenResponse.json()).access_token;
            }
            base = `https://${this.config.location === 'global' ? '' : `${this.config.location}-`}aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${this.config.location}/endpoints/openapi`;
          } else {
            token = process.env.AI_GATEWAY_KEY;
            base = this.config.gatewayUrl;
            if (!base) throw Object.assign(new Error('Gateway endpoint is required'), { code: 'PROVIDER_CONFIG_INVALID' });
          }
          if (!token) throw Object.assign(new Error('AI credentials are missing; synthetic generation is disabled'), { code: 'PROVIDER_CREDENTIALS_MISSING' });
          headers.Authorization = `Bearer ${token}`;
          url = `${base.replace(/\/$/, '')}/chat/completions`;
          body = { model: provider === 'gcp-vertex' ? `google/${model.replace(/^google\//, '')}` : model, temperature, max_tokens: maxOutputTokens, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: prompt }] };
        }
        const response = await this.fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal, redirect: 'error' });
        if (!response.ok) throw Object.assign(new Error('Provider request failed'), { code: 'PROVIDER_HTTP_ERROR' });
        if (Number(response.headers?.get?.('content-length')) > 128000) throw new Error('Provider response exceeds limit');
        let text;
        if (response.body?.getReader) {
          const reader = response.body.getReader();
          const chunks = [];
          let bytes = 0;
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              bytes += value.byteLength;
              if (bytes > 128000) { await reader.cancel(); throw new Error('Provider response exceeds limit'); }
              chunks.push(Buffer.from(value));
            }
            text = Buffer.concat(chunks).toString('utf8');
          } finally { reader.releaseLock(); }
        } else {
          text = await response.text();
          if (Buffer.byteLength(text) > 128000) throw new Error('Provider response exceeds limit');
        }
        const data = JSON.parse(text);
        const raw = provider === 'gcp-gemini' ? data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') : data?.choices?.[0]?.message?.content;
        return JSON.parse(raw || '{}');
      };
      return finish(await Promise.race([request(), deadline]), 'provider');
    } catch (error) {
      const code = error instanceof ContentIntegrityError ? error.code : ['PROVIDER_TIMEOUT', 'PROVIDER_CREDENTIALS_MISSING', 'PROVIDER_HTTP_ERROR', 'PROVIDER_CONFIG_INVALID'].includes(error.code) ? error.code : 'PROVIDER_RESPONSE_INVALID';
      if (this.config.allowSynthetic) return finish(campaignFromApprovedClaims(traceMeta.story), 'synthetic', code);
      const message = code === 'PROVIDER_CREDENTIALS_MISSING' ? 'AI credentials are missing; synthetic generation is disabled' : code === 'UNSUPPORTED_GENERATED_CLAIM' ? 'Generated claims failed approved source validation' : 'AI generation failed; check provider configuration or retry';
      throw Object.assign(new Error(message), { code, trace: { ...baseTrace(), status: 'error', error: code } });
    } finally { clearTimeout(timer); }
  }
}
