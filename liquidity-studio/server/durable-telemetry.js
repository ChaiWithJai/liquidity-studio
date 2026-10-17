import {ObservabilityEngine} from './observability.js';
export class DurableTelemetry extends ObservabilityEngine {
 constructor(repo){super();this.repo=repo;}
 record(method,args){let result;this.repo.mutate(state=>{Object.assign(this,state.telemetry);result=super[method](...args);state.telemetry={traces:this.traces,batchJobs:this.batchJobs,backpropDataset:this.backpropDataset};return state;});return result;}
 recordGenerationTrace(payload){return this.record('recordGenerationTrace',[payload]);}
 recordMarketerAction(payload){return this.record('recordMarketerAction',[payload]);}
 recordBatchJob(payload){return this.record('recordBatchJob',[payload]);}
 getSnapshot(){Object.assign(this,this.repo.read().telemetry);const snapshot=super.getSnapshot();return {...snapshot,jobs:this.repo.read().jobs,usageEvents:this.repo.read().usage.length,preflights:this.repo.read().preflights.slice(-25)};}
 allFeedback(){return this.repo.read().telemetry.backpropDataset;}
}
