/**
 * Context Graph & Schema Registry for Liquidity Studio v0 (server/context-graph.js)
 *
 * Central source of truth for the Quality Assurance (QA) Loop:
 *   1. Formal JSON Schemas for every domain & telemetry entity
 *   2. Prior Art, Documentation & Internal Work Reference Registry
 *   3. Typed Graph Nodes (PriorArt, JTBD, Schema, Port, Adapter, Service, Route, Screen)
 *   4. Directed Relationship Edges connecting every layer of the stack
 *   5. Programmatic Schema & Graph Integrity Validators used by the QA Loop
 */

export const CONTEXT_GRAPH = {
  version: '1.0.0-v0',
  updatedAt: '2026-10-17T09:50:00Z',
  title: 'Liquidity Studio v0 — Full-Stack Context Graph & QA Specification',

  // =========================================================================
  // 1. REFERENCE LINKS: PRIOR ART, DOCUMENTATION & INTERNAL ARTIFACTS
  // =========================================================================
  references: [
    {
      id: 'ref_pomelli',
      type: 'prior_art_ui',
      title: 'Google Labs Pomelli — AI Marketing & Business Profile Studio',
      url: 'https://labs.google.com/u/0/pomelli/review',
      summary: 'Benchmark for our Marketer Studio UI: warm obsidian charcoal (#141513), serif italic headers, Brand Overview bento grid (Logo, Fonts, Palette), sage status pills, and right-hand conversational Studio Agent co-pilot with zero ML jargon.'
    },
    {
      id: 'ref_thebag_guidance',
      type: 'founder_guidance',
      title: 'Founder Guidance & @thebag Content Breakdown Model (new_file_1)',
      artifactPath: 'new_file_1',
      summary: 'Core editorial thesis ("They cover the lifestyle. We follow the liquidity. Don\'t show what she bought. Break down what she owns."), 4 Global User Value Groups, 5 Financial Content Pillars, and hard-number density rules.'
    },
    {
      id: 'ref_deslopped_rfc',
      type: 'architecture_rfc',
      title: 'De-Slopped Production RFC v0 (RFC-v0-LIQUIDITY-STUDIO.md vs new_file)',
      artifactPath: 'liquidity-studio/RFC-v0-LIQUIDITY-STUDIO.md',
      summary: 'Replaces bloated YOLOv8/GraphSAGE/HDBSCAN/IRT psychometric theater from new_file with off-the-shelf GCP Cloud Run, Vertex AI/Gemini Structured Outputs, Hexagonal DI Ports, and silent implicit preference logging.'
    },
    {
      id: 'ref_gcp_cloud_run',
      type: 'gcp_documentation',
      title: 'Google Cloud Run — Serverless Container Deployment',
      url: 'https://cloud.google.com/run/docs',
      summary: 'Hosts the single Docker container (Dockerfile) serving both the compiled frontend (dist/) and Node.js DI API server on PORT 8080.'
    },
    {
      id: 'ref_gemini_structured_outputs',
      type: 'gcp_documentation',
      title: 'Vertex AI / Gemini API — Structured JSON Outputs (responseSchema)',
      url: 'https://ai.google.dev/gemini-api/docs/structured-output',
      summary: 'Enforces strict schema adherence when generating the 4-format campaign pack (Infographic, Carousel, IG Story, Reel) in a single call.'
    },
    {
      id: 'ref_gcp_cloud_scheduler',
      type: 'gcp_documentation',
      title: 'Google Cloud Scheduler — Managed Cron Triggers',
      url: 'https://cloud.google.com/scheduler/docs',
      summary: 'Triggers POST /api/admin/run-weekly-batch every Monday at 09:00 UTC to batch-produce the week\'s draft campaigns.'
    },
    {
      id: 'ref_gcp_logging_bigquery',
      type: 'gcp_documentation',
      title: 'Cloud Logging to BigQuery Sink — Zero-Ops Telemetry Pipeline',
      url: 'https://cloud.google.com/logging/docs/export/configure_export_v2',
      summary: 'Routes structured JSON traces and implicit human preference records into BigQuery for offline backpropagation jobs.'
    },
    {
      id: 'ref_hexagonal_di',
      type: 'software_pattern',
      title: 'Hexagonal Architecture (Ports & Adapters) & Dependency Inversion',
      url: 'https://alistair.cockburn.us/hexagonal-architecture/',
      summary: 'Decouples core JTBD services (server/container.js) from concrete AI gateways and storage backends via abstract Ports (server/ports.js).'
    },
    {
      id: 'ref_dpo_backprop',
      type: 'ml_reference',
      title: 'Direct Preference Optimization (DPO) — Implicit Human Feedback Pairs',
      url: 'https://arxiv.org/abs/2305.18290',
      summary: 'Theoretical foundation for pairing rawGeneration (baseline LLM output) with humanFinalVersion (marketer inline edit + export) in backprop-preferences.jsonl.'
    }
  ],

  // =========================================================================
  // 2. FORMAL JSON SCHEMAS FOR ALL CORE ENTITIES
  // =========================================================================
  schemas: {
    BrandProfileSchema: {
      $id: 'BrandProfileSchema',
      type: 'object',
      required: ['brandName', 'websiteUrl', 'tagline', 'fonts', 'colors'],
      properties: {
        brandName: { type: 'string', minLength: 2 },
        websiteUrl: { type: 'string', pattern: '^https?://' },
        tagline: { type: 'string', minLength: 10 },
        fonts: {
          type: 'object',
          required: ['heading', 'body'],
          properties: {
            heading: { type: 'string' },
            body: { type: 'string' }
          }
        },
        colors: {
          type: 'array',
          minItems: 4,
          items: {
            type: 'object',
            required: ['name', 'hex'],
            properties: {
              name: { type: 'string' },
              hex: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
            }
          }
        }
      }
    },

    BacklogStorySchema: {
      $id: 'BacklogStorySchema',
      type: 'object',
      required: ['id', 'title', 'category', 'trendBadge', 'status', 'scheduledDay', 'verifiedFacts'],
      properties: {
        id: { type: 'string' },
        title: { type: 'string', minLength: 5 },
        category: { type: 'string' },
        trendBadge: { type: 'string' },
        status: { type: 'string', enum: ['In Backlog', 'Ready for Campaign', 'Draft Ready', 'Scheduled', 'Exported'] },
        scheduledDay: { type: 'string', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        verifiedFacts: { type: 'array', minItems: 1, items: { type: 'string' } }
      }
    },

    CalendarSlotSchema: {
      $id: 'CalendarSlotSchema',
      type: 'object',
      required: ['day', 'items'],
      properties: {
        day: { type: 'string', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        items: { type: 'array', items: { $ref: 'BacklogStorySchema' } }
      }
    },

    Campaign4FormatPackSchema: {
      $id: 'Campaign4FormatPackSchema',
      type: 'object',
      required: ['infographic', 'carousel', 'story', 'reel'],
      properties: {
        infographic: {
          type: 'object',
          required: ['headline', 'statRows', 'bottomTakeaway', 'caption'],
          properties: {
            headline: { type: 'string' },
            statRows: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
            bottomTakeaway: { type: 'string' },
            caption: { type: 'string' }
          }
        },
        carousel: {
          type: 'object',
          required: ['coverHook', 'slides'],
          properties: {
            coverHook: { type: 'string' },
            slides: { type: 'array', minItems: 4, maxItems: 4 }
          }
        },
        story: {
          type: 'object',
          required: ['hookBanner', 'keyStatHighlight', 'interactiveStickerPrompt'],
          properties: {
            hookBanner: { type: 'string' },
            keyStatHighlight: { type: 'string' },
            interactiveStickerPrompt: { type: 'string' }
          }
        },
        reel: {
          type: 'object',
          required: ['spokenHook0to3s', 'beats', 'closingCta'],
          properties: {
            spokenHook0to3s: { type: 'string' },
            beats: { type: 'array', minItems: 3, maxItems: 3 },
            closingCta: { type: 'string' }
          }
        }
      }
    },

    GenerationTraceSchema: {
      $id: 'GenerationTraceSchema',
      type: 'object',
      required: ['traceId', 'timestamp', 'provider', 'model', 'latencyMs', 'status', 'evalScore', 'evalPass'],
      properties: {
        traceId: { type: 'string' },
        timestamp: { type: 'string' },
        provider: { type: 'string' },
        model: { type: 'string' },
        latencyMs: { type: 'number', minimum: 0 },
        status: { type: 'string', enum: ['success', 'error'] },
        evalScore: { type: 'number', minimum: 0, maximum: 100 },
        evalPass: { type: 'boolean' }
      }
    },

    BackpropPreferencePairSchema: {
      $id: 'BackpropPreferencePairSchema',
      type: 'object',
      required: ['recordId', 'timestamp', 'storyId', 'storyTitle', 'humanSignal', 'rawGeneration', 'humanFinalVersion'],
      properties: {
        recordId: { type: 'string' },
        timestamp: { type: 'string' },
        storyId: { type: 'string' },
        storyTitle: { type: 'string' },
        humanSignal: { type: 'string' },
        rawGeneration: { type: ['object', 'null'] },
        humanFinalVersion: { type: ['object', 'null'] }
      }
    },

    AIGatewayConfigSchema: {
      $id: 'AIGatewayConfigSchema',
      type: 'object',
      required: ['provider', 'model', 'gatewayUrl'],
      properties: {
        provider: { type: 'string' },
        model: { type: 'string' },
        gatewayUrl: { type: 'string' }
      }
    }
  },

  // =========================================================================
  // 3. TYPED GRAPH NODES ACROSS ALL 8 ARCHITECTURAL LAYERS
  // =========================================================================
  nodes: [
    // Layer 1: JTBDs
    { id: 'jtbd_1_batch', layer: 'JTBD', label: 'JTBD #1: Weekly Batch Producing Content Drafts', file: 'server/container.js' },
    { id: 'jtbd_2_formatter', layer: 'JTBD', label: 'JTBD #2: Multi-Format Channel Formatting & Export (Infographic, Carousel, Story, Reel)', file: 'server/domain.js' },
    { id: 'jtbd_3_calendar', layer: 'JTBD', label: 'JTBD #3: Curating & Managing Content Backlog & Mon-Sun Calendar', file: 'server/container.js' },
    { id: 'jtbd_4_observability', layer: 'JTBD', label: 'JTBD #4: Silent Eval, DI Gateway Federation & Backprop Preference Logging', file: 'server/observability.js' },

    // Layer 2: Ports (Dependency Inversion Interfaces)
    { id: 'port_ai', layer: 'Port', label: 'AIProviderPort', file: 'server/ports.js' },
    { id: 'port_repo', layer: 'Port', label: 'BacklogCalendarRepositoryPort', file: 'server/ports.js' },
    { id: 'port_telemetry', layer: 'Port', label: 'TelemetryEvalSinkPort', file: 'server/ports.js' },

    // Layer 3: Concrete Adapters
    { id: 'adapter_ai_gateway', layer: 'Adapter', label: 'AIGateway (GCP Vertex/Gemini + OpenAI Gateway Federation)', file: 'server/gateway.js' },
    { id: 'adapter_repo_firestore', layer: 'Adapter', label: 'InMemoryGCPFirestoreAdapter', file: 'server/container.js' },
    { id: 'adapter_telemetry_engine', layer: 'Adapter', label: 'ObservabilityEngine (Silent 4-Format Eval + DPO Logger)', file: 'server/observability.js' },

    // Layer 4: DI Services
    { id: 'svc_batch', layer: 'Service', label: 'batchProductionService', file: 'server/container.js' },
    { id: 'svc_formatter', layer: 'Service', label: 'multiFormatFormatterService', file: 'server/container.js' },
    { id: 'svc_backlog_cal', layer: 'Service', label: 'backlogCalendarService', file: 'server/container.js' },
    { id: 'svc_admin_obs', layer: 'Service', label: 'adminObservabilityService', file: 'server/container.js' },

    // Layer 5: HTTP API Routes
    { id: 'route_bootstrap', layer: 'Route', label: 'GET /api/studio/bootstrap', file: 'server/index.js' },
    { id: 'route_brand_profile', layer: 'Route', label: 'POST /api/studio/brand-profile', file: 'server/index.js' },
    { id: 'route_backlog', layer: 'Route', label: 'POST /api/studio/backlog', file: 'server/index.js' },
    { id: 'route_schedule', layer: 'Route', label: 'POST /api/studio/schedule', file: 'server/index.js' },
    { id: 'route_generate', layer: 'Route', label: 'POST /api/studio/generate-campaign', file: 'server/index.js' },
    { id: 'route_save_edit', layer: 'Route', label: 'POST /api/studio/save-edit', file: 'server/index.js' },
    { id: 'route_export', layer: 'Route', label: 'POST /api/studio/export-asset', file: 'server/index.js' },
    { id: 'route_admin_overview', layer: 'Route', label: 'GET /api/admin/overview', file: 'server/index.js' },
    { id: 'route_admin_gateway', layer: 'Route', label: 'POST /api/admin/gateway-config', file: 'server/index.js' },
    { id: 'route_admin_batch', layer: 'Route', label: 'POST /api/admin/run-weekly-batch', file: 'server/index.js' },
    { id: 'route_admin_jsonl', layer: 'Route', label: 'GET /api/admin/backprop-jsonl', file: 'server/index.js' },
    { id: 'route_admin_graph', layer: 'Route', label: 'GET /api/admin/context-graph', file: 'server/index.js' },

    // Layer 6: UI Screens (Marketer Surface M1-M4 + Founder Admin Surface A1-A4)
    { id: 'screen_m1_brand', layer: 'Screen', surface: 'marketer', label: 'Screen M1: Brand Overview Bento Grid', file: 'src/App.svelte' },
    { id: 'screen_m2_backlog', layer: 'Screen', surface: 'marketer', label: 'Screen M2: Weekly Social Listener & Content Backlog', file: 'src/App.svelte' },
    { id: 'screen_m3_calendar', layer: 'Screen', surface: 'marketer', label: 'Screen M3: Weekly Content Calendar (Mon-Sun)', file: 'src/App.svelte' },
    { id: 'screen_m4_exporter', layer: 'Screen', surface: 'marketer', label: 'Screen M4: Multi-Format Campaign Studio & Agent Co-Pilot', file: 'src/App.svelte' },
    { id: 'screen_a1_gateway', layer: 'Screen', surface: 'admin', label: 'Screen A1: DI Adapter & Multi-Federation Gateway Switchboard', file: 'src/App.svelte' },
    { id: 'screen_a2_batch', layer: 'Screen', surface: 'admin', label: 'Screen A2: Weekly Batch & Silent Eval Trace Monitor', file: 'src/App.svelte' },
    { id: 'screen_a3_backprop', layer: 'Screen', surface: 'admin', label: 'Screen A3: Implicit Human Feedback & Backprop JSONL Exporter', file: 'src/App.svelte' },
    { id: 'screen_a4_context_graph', layer: 'Screen', surface: 'admin', label: 'Screen A4: Interactive Context Graph & QA Loop Explorer', file: 'src/App.svelte' }
  ],

  // =========================================================================
  // 4. DIRECTED RELATIONSHIP EDGES (TRACEABILITY ACROSS STACK)
  // =========================================================================
  edges: [
    // Prior Art -> JTBDs & Screens
    { from: 'jtbd_1_batch', to: 'ref_gcp_cloud_scheduler', relation: 'GROUNDED_IN_DOC' },
    { from: 'jtbd_2_formatter', to: 'ref_thebag_guidance', relation: 'DERIVED_FROM_PRIOR_ART' },
    { from: 'jtbd_2_formatter', to: 'ref_gemini_structured_outputs', relation: 'GROUNDED_IN_DOC' },
    { from: 'jtbd_3_calendar', to: 'ref_pomelli', relation: 'DERIVED_FROM_PRIOR_ART' },
    { from: 'jtbd_4_observability', to: 'ref_dpo_backprop', relation: 'GROUNDED_IN_DOC' },
    { from: 'jtbd_4_observability', to: 'ref_hexagonal_di', relation: 'GROUNDED_IN_DOC' },

    // Adapters -> Ports (IMPLEMENTS_PORT)
    { from: 'adapter_ai_gateway', to: 'port_ai', relation: 'IMPLEMENTS_PORT' },
    { from: 'adapter_repo_firestore', to: 'port_repo', relation: 'IMPLEMENTS_PORT' },
    { from: 'adapter_telemetry_engine', to: 'port_telemetry', relation: 'IMPLEMENTS_PORT' },

    // Services -> Ports (DEPENDS_ON_PORT)
    { from: 'svc_batch', to: 'port_ai', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_batch', to: 'port_repo', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_batch', to: 'port_telemetry', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_formatter', to: 'port_ai', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_formatter', to: 'port_repo', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_formatter', to: 'port_telemetry', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_backlog_cal', to: 'port_repo', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_backlog_cal', to: 'port_telemetry', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_admin_obs', to: 'port_ai', relation: 'DEPENDS_ON_PORT' },
    { from: 'svc_admin_obs', to: 'port_telemetry', relation: 'DEPENDS_ON_PORT' },

    // Services -> JTBDs (FULFILLS_JTBD)
    { from: 'svc_batch', to: 'jtbd_1_batch', relation: 'FULFILLS_JTBD' },
    { from: 'svc_formatter', to: 'jtbd_2_formatter', relation: 'FULFILLS_JTBD' },
    { from: 'svc_backlog_cal', to: 'jtbd_3_calendar', relation: 'FULFILLS_JTBD' },
    { from: 'svc_admin_obs', to: 'jtbd_4_observability', relation: 'FULFILLS_JTBD' },

    // Routes -> Services (INVOKES_SERVICE)
    { from: 'route_bootstrap', to: 'svc_backlog_cal', relation: 'INVOKES_SERVICE' },
    { from: 'route_brand_profile', to: 'svc_backlog_cal', relation: 'INVOKES_SERVICE' },
    { from: 'route_backlog', to: 'svc_backlog_cal', relation: 'INVOKES_SERVICE' },
    { from: 'route_schedule', to: 'svc_backlog_cal', relation: 'INVOKES_SERVICE' },
    { from: 'route_generate', to: 'svc_formatter', relation: 'INVOKES_SERVICE' },
    { from: 'route_save_edit', to: 'svc_formatter', relation: 'INVOKES_SERVICE' },
    { from: 'route_export', to: 'svc_formatter', relation: 'INVOKES_SERVICE' },
    { from: 'route_admin_overview', to: 'svc_admin_obs', relation: 'INVOKES_SERVICE' },
    { from: 'route_admin_gateway', to: 'svc_admin_obs', relation: 'INVOKES_SERVICE' },
    { from: 'route_admin_batch', to: 'svc_batch', relation: 'INVOKES_SERVICE' },
    { from: 'route_admin_jsonl', to: 'svc_admin_obs', relation: 'INVOKES_SERVICE' },
    { from: 'route_admin_graph', to: 'svc_admin_obs', relation: 'INVOKES_SERVICE' },

    // Screens -> Routes (CONSUMES_ROUTE)
    { from: 'screen_m1_brand', to: 'route_bootstrap', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_m1_brand', to: 'route_brand_profile', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_m2_backlog', to: 'route_backlog', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_m2_backlog', to: 'route_generate', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_m3_calendar', to: 'route_schedule', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_m4_exporter', to: 'route_generate', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_m4_exporter', to: 'route_save_edit', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_m4_exporter', to: 'route_export', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_a1_gateway', to: 'route_admin_overview', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_a1_gateway', to: 'route_admin_gateway', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_a2_batch', to: 'route_admin_batch', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_a3_backprop', to: 'route_admin_jsonl', relation: 'CONSUMES_ROUTE' },
    { from: 'screen_a4_context_graph', to: 'route_admin_graph', relation: 'CONSUMES_ROUTE' }
  ]
};

/**
 * Lightweight, zero-dependency JSON Schema & Graph Integrity Validator for the QA Loop.
 */
export function validateEntityAgainstSchema(entity, schemaName) {
  const schema = CONTEXT_GRAPH.schemas[schemaName];
  if (!schema) throw new Error(`Unknown schema in Context Graph: ${schemaName}`);
  const errors = [];

  if (schema.type === 'object') {
    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
      return { valid: false, errors: [`Expected object for ${schemaName}`] };
    }
    for (const reqKey of schema.required || []) {
      if (entity[reqKey] === undefined) {
        errors.push(`${schemaName} missing required property "${reqKey}"`);
      }
    }
    for (const [propKey, propRules] of Object.entries(schema.properties || {})) {
      const val = entity[propKey];
      if (val === undefined || val === null) continue;
      if (propRules.type === 'string' && typeof val !== 'string') {
        errors.push(`${schemaName}.${propKey} must be string`);
      }
      if (propRules.type === 'number' && typeof val !== 'number') {
        errors.push(`${schemaName}.${propKey} must be number`);
      }
      if (propRules.type === 'boolean' && typeof val !== 'boolean') {
        errors.push(`${schemaName}.${propKey} must be boolean`);
      }
      if (propRules.type === 'array') {
        if (!Array.isArray(val)) {
          errors.push(`${schemaName}.${propKey} must be array`);
        } else {
          if (propRules.minItems !== undefined && val.length < propRules.minItems) {
            errors.push(`${schemaName}.${propKey} has ${val.length} items, minItems is ${propRules.minItems}`);
          }
          if (propRules.maxItems !== undefined && val.length > propRules.maxItems) {
            errors.push(`${schemaName}.${propKey} has ${val.length} items, maxItems is ${propRules.maxItems}`);
          }
        }
      }
      if (propRules.enum && !propRules.enum.includes(val)) {
        errors.push(`${schemaName}.${propKey} value "${val}" not in enum [${propRules.enum.join(', ')}]`);
      }
      if (propRules.pattern && typeof val === 'string' && !new RegExp(propRules.pattern).test(val)) {
        errors.push(`${schemaName}.${propKey} value "${val}" does not match pattern ${propRules.pattern}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function verifyContextGraphTopology() {
  const validIds = new Set([
    ...CONTEXT_GRAPH.nodes.map((n) => n.id),
    ...CONTEXT_GRAPH.references.map((r) => r.id),
    ...Object.keys(CONTEXT_GRAPH.schemas)
  ]);

  const danglingEdges = [];
  for (const edge of CONTEXT_GRAPH.edges) {
    if (!validIds.has(edge.from) || !validIds.has(edge.to)) {
      danglingEdges.push(edge);
    }
  }

  const connectedNodeIds = new Set();
  for (const edge of CONTEXT_GRAPH.edges) {
    connectedNodeIds.add(edge.from);
    connectedNodeIds.add(edge.to);
  }

  const orphanNodes = CONTEXT_GRAPH.nodes.filter((n) => !connectedNodeIds.has(n.id));

  return {
    valid: danglingEdges.length === 0 && orphanNodes.length === 0,
    stats: {
      referencesCount: CONTEXT_GRAPH.references.length,
      schemasCount: Object.keys(CONTEXT_GRAPH.schemas).length,
      nodesCount: CONTEXT_GRAPH.nodes.length,
      edgesCount: CONTEXT_GRAPH.edges.length,
      danglingEdgesCount: danglingEdges.length,
      orphanNodesCount: orphanNodes.length
    },
    danglingEdges,
    orphanNodes
  };
}
