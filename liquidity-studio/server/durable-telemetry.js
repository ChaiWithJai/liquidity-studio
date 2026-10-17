import { ObservabilityEngine } from "./observability.js";
export class DurableTelemetry extends ObservabilityEngine {
  constructor(repo) {
    super();
    this.repo = repo;
  }
  async record(method, args) {
    const scope = {
      organizationId: this.repo.scope.organizationId,
      brandId: this.repo.scope.brandId,
    };
    if (method === "recordGenerationTrace") {
      const payload = args[0];
      args = [
        {
          ...payload,
          trace: {
            ...payload.trace,
            contentPresetId:
              payload.trace.brandId || this.repo.scope.preset || null,
            ...scope,
          },
        },
      ];
    }
    let result;
    await this.repo.mutate((state) => {
      Object.assign(this, state.telemetry);
      result = super[method](...args);
      Object.assign(result, scope);
      if (method === "recordGenerationTrace") {
        Object.assign(this.backpropDataset[0], scope);
      }
      state.telemetry = {
        traces: this.traces,
        batchJobs: this.batchJobs,
        backpropDataset: this.backpropDataset,
      };
      return state;
    });
    return result;
  }
  recordGenerationFailure(payload) {
    return this.record("recordGenerationFailure", [payload]);
  }
  recordGenerationTrace(payload) {
    return this.record("recordGenerationTrace", [payload]);
  }
  recordMarketerAction(payload) {
    return this.record("recordMarketerAction", [payload]);
  }
  recordBatchJob(payload) {
    return this.record("recordBatchJob", [payload]);
  }
  async getSnapshot() {
    const state = await this.repo.read();
    Object.assign(this, state.telemetry);
    const snapshot = super.getSnapshot();
    return {
      ...snapshot,
      jobs: state.jobs,
      usageEvents: state.usage.length,
      preflights: state.preflights.slice(-25),
      operationalEvents: (state.operationalEvents || []).slice(-100),
    };
  }
  async allFeedback() {
    return (await this.repo.read()).telemetry.backpropDataset;
  }
}
