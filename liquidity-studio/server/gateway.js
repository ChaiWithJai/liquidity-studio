/**
 * Pluggable Multi-Federation AI Gateway Abstraction (server/gateway.js)
 *
 * Designed so the container runs out-of-the-box on GCP (Vertex AI / Gemini API)
 * and can federate to ANY AI Gateway (LiteLLM, Cloudflare AI Gateway, OpenRouter,
 * Apigee, or custom vLLM) via config or environment variables without code changes.
 */

export class AIGateway {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || process.env.AI_PROVIDER || 'gcp-gemini', // 'gcp-gemini' | 'gcp-vertex' | 'openai-gateway'
      model: config.model || process.env.AI_MODEL || 'gemini-3.8-flash',
      gatewayUrl: config.gatewayUrl || process.env.AI_GATEWAY_URL || 'https://generativelanguage.googleapis.com/v1beta',
      projectId: config.projectId || process.env.GOOGLE_CLOUD_PROJECT || 'liquidity-media-gcp',
      location: config.location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      allowSynthetic: config.allowSynthetic ?? process.env.AI_ALLOW_SYNTHETIC === 'true',
      temperature: config.temperature ?? 0.4
    };
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(patch = {}) {
    this.config = { ...this.config, ...patch };
    return this.getConfig();
  }

  async generateStructured({ systemInstruction, prompt, responseSchema, traceMeta = {} }) {
    const startedAt = Date.now();
    const { provider, model, gatewayUrl, temperature } = this.config;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

    try {
      let parsedOutput;
      let resolvedModel = model;

      if (provider === 'openai-gateway') {
        // Multi-federation path for any OpenAI-compatible AI Gateway (LiteLLM, Cloudflare, OpenRouter)
        const res = await fetch(`${gatewayUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.AI_GATEWAY_KEY ? { Authorization: `Bearer ${process.env.AI_GATEWAY_KEY}` } : {})
          },
          body: JSON.stringify({
            model,
            temperature,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt }
            ]
          })
        });
        if (!res.ok) throw new Error(`Gateway HTTP ${res.status}: ${await res.text()}`);
        const data = await res.json();
        parsedOutput = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      } else if (apiKey) {
        // Default Off-The-Shelf GCP Gemini / Vertex AI Path with API key
        const candidates = [model];
        let res;
        let lastErr = '';
        for (const candidate of candidates) {
          resolvedModel = candidate;
          const url = `${gatewayUrl.replace(/\/$/, '')}/models/${candidate}:generateContent?key=${apiKey}`;
          res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature,
                responseMimeType: 'application/json',
                responseSchema
              }
            })
          });
          if (res.ok) break;
          lastErr = await res.text();
        }
        if (!res || !res.ok) {
          throw new Error(`GCP Gemini HTTP ${res?.status}: ${lastErr}`);
        }
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        parsedOutput = JSON.parse(rawText);
      } else {
        // Synthetic generation requires explicit operator opt-in.
        if (!this.config.allowSynthetic) throw new Error('AI credentials are missing; synthetic generation is disabled');
        parsedOutput = synthesizeFallbackCampaign(prompt, traceMeta);
        resolvedModel = `${model}-offline-synthetic`;
      }

      validateCampaign(parsedOutput, traceMeta.story);
      const synthetic = resolvedModel.endsWith('-offline-synthetic');
      const provenance = { mode: synthetic ? 'synthetic' : 'provider', requiresReview: true, source: 'supplied-story-facts', reason: synthetic ? 'missing-credentials' : null };
      parsedOutput.provenance = provenance;
      const latencyMs = Date.now() - startedAt;
      return {
        output: parsedOutput,
        trace: {
          traceId: `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          provider: synthetic ? 'offline-synthetic' : provider,
          model: resolvedModel,
          latencyMs,
          status: synthetic ? 'degraded' : 'success',
          provenance,
          promptChars: (prompt || '').length,
          ...traceMeta
        }
      };
    } catch (err) {
      // If external call failed and we can fall back to synthetic output
      if (this.config.allowSynthetic && prompt && responseSchema) {
        try {
          const parsedOutput = synthesizeFallbackCampaign(prompt, traceMeta);
          const provenance = { mode: 'synthetic', requiresReview: true, source: 'supplied-story-facts', reason: 'provider-failure' };
          parsedOutput.provenance = provenance;
          const latencyMs = Date.now() - startedAt;
          return {
            output: parsedOutput,
            trace: {
              traceId: `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              timestamp: new Date().toISOString(),
              provider: 'fallback-synthetic',
              model: `${model}-fallback`,
              latencyMs,
              status: 'degraded',
              provenance,
              fallbackReason: 'Provider request or output validation failed',
              promptChars: (prompt || '').length,
              ...traceMeta
            }
          };
        } catch (fallbackError) {
          err = fallbackError;
        }
      }

      const latencyMs = Date.now() - startedAt;
      throw Object.assign(new Error(err.message), {
        trace: {
          traceId: `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          provider,
          model,
          latencyMs,
          status: 'error',
          error: err.message,
          ...traceMeta
        }
      });
    }
  }
}

function synthesizeFallbackCampaign(prompt = '', traceMeta = {}) {
  const story = traceMeta.story || {};
  const rawTitle = story.title || (prompt.match(/Story Title:\s*([^\n]+)/)?.[1]) || 'Brand Ownership Breakdown';
  const rawFacts = story.verifiedFacts || [];

  let facts = rawFacts.length ? [...rawFacts] : [];
  if (!facts.length) {
    const factsBlock = prompt.match(/Verified Facts:\s*([\s\S]+?)(?=\n\nReturn|$)/)?.[1];
    if (factsBlock) {
      facts = factsBlock.split('\n').map((l) => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
    }
  }
  if (!facts.length) throw new Error('At least one supplied fact is required');
  const [f1, f2 = f1, f3 = f1] = facts;
  const headline = rawTitle.toUpperCase();
  return {
    infographic: { headline, statRows: [f1, f2, f3], bottomTakeaway: 'Review the supplied facts and their sources before publishing.', caption: rawTitle },
    carousel: { coverHook: headline, slides: [f1, f2, f3, 'Review the original sources before publishing.'].map((fact, i) => ({ slideNumber: i + 1, title: i === 3 ? 'Source review' : 'Reported fact', bodyMetric: fact, visualNote: 'Source fact text card' })) },
    story: { hookBanner: headline, keyStatHighlight: f1, interactiveStickerPrompt: 'Which detail would you investigate next?' },
    reel: { spokenHook0to3s: rawTitle, beats: [f1, f2, f3].map((fact, i) => ({ timecode: ['0:00-0:05', '0:05-0:15', '0:15-0:30'][i], voiceover: fact, onScreenText: fact, bRollDirection: 'Source fact text card' })), closingCta: 'Read the original sources before sharing.' }
  };
}

// Check the shared shape and reject unsupported numeric claims before saving.
// This is a conservative guard, not a substitute for editorial fact checking.
function validateCampaign(output, story) {
  if (!output || !Array.isArray(output.infographic?.statRows) || output.infographic.statRows.length !== 3 ||
      !Array.isArray(output.carousel?.slides) || output.carousel.slides.length !== 4 ||
      !output.story || !Array.isArray(output.reel?.beats) || output.reel.beats.length !== 3) {
    throw new Error('Invalid campaign structure');
  }
  const textFields = (value, fields) => value && fields.every(field => typeof value[field] === 'string' && value[field].trim());
  if (!textFields(output.infographic, ['headline', 'bottomTakeaway', 'caption']) ||
      !output.infographic.statRows.every(value => typeof value === 'string' && value.trim()) ||
      !textFields(output.carousel, ['coverHook']) ||
      !output.carousel.slides.every((slide, i) => slide?.slideNumber === i + 1 && textFields(slide, ['title', 'bodyMetric', 'visualNote'])) ||
      !textFields(output.story, ['hookBanner', 'keyStatHighlight', 'interactiveStickerPrompt']) ||
      !textFields(output.reel, ['spokenHook0to3s', 'closingCta']) ||
      !output.reel.beats.every(beat => textFields(beat, ['timecode', 'voiceover', 'onScreenText', 'bRollDirection']))) {
    throw new Error('Invalid campaign field types');
  }
  if (!story) return;
  const facts = story.verifiedFacts || [];
  const allowed = new Set((facts.join(' ') + ' ' + story.title).match(/\d+(?:[.,]\d+)*/g) || []);
  const copy = [output.infographic, output.story, output.carousel.slides.map(({ title, bodyMetric }) => ({ title, bodyMetric })), output.reel.spokenHook0to3s, output.reel.beats.map(({ voiceover, onScreenText }) => ({ voiceover, onScreenText })), output.reel.closingCta];
  for (const number of JSON.stringify(copy).match(/\d+(?:[.,]\d+)*/g) || []) {
    if (!allowed.has(number)) throw new Error('Campaign contains an unsupported numeric claim');
  }
  for (const slide of output.carousel.slides) {
    if (/gross margin/i.test(slide.title) && !facts.some(f => /gross margin/i.test(f) && f === slide.bodyMetric)) {
      throw new Error('Gross margin label lacks a matching source fact');
    }
  }
}
