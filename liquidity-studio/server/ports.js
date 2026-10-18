/**
 * Dependency Inversion Layer: Core Ports / Interfaces (server/ports.js)
 *
 * High-level business workflows (Batch Producing Drafts, Multi-Format Formatting,
 * Backlog & Content Calendar Management, Silent Eval & Backpropagation Logging)
 * depend ONLY on these abstract Port contracts—never on concrete GCP or third-party SDKs.
 */

export class AIProviderPort {
  /**
   * @param {{ systemInstruction: string, prompt: string, responseSchema: object, traceMeta?: object }} params
   * @returns {Promise<{ output: any, trace: object }>}
   */
  async generateStructured(params) {
    throw new Error(
      "AIProviderPort.generateStructured() must be implemented by an adapter",
    );
  }
  getConfig() {
    throw new Error(
      "AIProviderPort.getConfig() must be implemented by an adapter",
    );
  }
  updateConfig(patch) {
    throw new Error(
      "AIProviderPort.updateConfig() must be implemented by an adapter",
    );
  }
}

export class BacklogCalendarRepositoryPort {
  async getBrandProfile() {
    throw new Error("Not implemented");
  }
  async updateBrandProfile(patch) {
    throw new Error("Not implemented");
  }
  async listBacklog() {
    throw new Error("Not implemented");
  }
  async addBacklogStory(story) {
    throw new Error("Not implemented");
  }
  async updateStoryStatus(storyId, status, scheduledDay) {
    throw new Error("Not implemented");
  }
  async saveCampaignDraft(storyId, campaign) {
    throw new Error("Not implemented");
  }
  async getCalendarSchedule() {
    throw new Error("Not implemented");
  }
}

export class TelemetryEvalSinkPort {
  evaluateCampaignSilent(campaign) {
    throw new Error("Not implemented");
  }
  recordGenerationTrace(payload) {
    throw new Error("Not implemented");
  }
  recordMarketerAction(payload) {
    throw new Error("Not implemented");
  }
  recordBatchJob(job) {
    throw new Error("Not implemented");
  }
  getSnapshot() {
    throw new Error("Not implemented");
  }
  exportBackpropJsonl() {
    throw new Error("Not implemented");
  }
}

/**
 * SQLite/Firestore consumers await every operation. update callbacks are
 * synchronous retry-safe JSON mutations, executed atomically by the adapter.
 * Request/job services authorize scope before selecting any durable key.
 * Cloud artifacts also implement uploadArtifact(scope,id,bytes,contentType),
 * downloadArtifact(scope,reference), and deleteArtifact(scope,reference).
 */
export class DurableStorePort {
  async get(key) {
    throw new Error("Not implemented");
  }
  async update(key, mutate) {
    throw new Error("Not implemented");
  }
  /** Delete one record only when a synchronous predicate over it and 0–7
   * server-selected guard records succeeds in the same storage transaction. */
  async deleteIf(key, guardKeys, predicate) {
    throw new Error("Not implemented");
  }
  async delete(key) {
    throw new Error("Not implemented");
  }
  /** Atomically read/replace 1–8 server-selected keys, total JSON <=4 MiB.
   * Callback receives ordered values (missing = null), returns ordered replacements,
   * must be pure/synchronous and may retry. No async work or side effects inside.
   */
  async transact(keys, mutate) {
    throw new Error("Not implemented");
  }
  async keys(prefix) {
    throw new Error("Not implemented");
  }
  async backup(destination) {
    throw new Error("Not implemented");
  }
  async close() {
    throw new Error("Not implemented");
  }
}
