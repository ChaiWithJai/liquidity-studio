import { ObservabilityEngine } from "./observability.js";
export class DurableTelemetry extends ObservabilityEngine {
  constructor(repo) {
    super();
    this.repo = repo;
  }
  async record(method, args) {
    let result;
    await this.repo.mutate((state) => {
      Object.assign(this, state.telemetry);
      result = super[method](...args);
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
