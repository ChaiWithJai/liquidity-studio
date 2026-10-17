import {DurableStore} from './storage.js';
import {IdentityService} from './auth.js';
import {ScopedRepository} from './repository.js';
import {DurableTelemetry} from './durable-telemetry.js';
import {AIGateway} from './gateway.js';
import {createAppContainer} from './container.js';
export function createPlatform({store=new DurableStore()}={}){
 const identity=new IdentityService(store);const ready=identity.provisionFromEnvironment();
 return {store,identity,ready,async forScope(scope){
  await ready;
  const repo=new ScopedRepository(store,scope);
  const aiGateway=new AIGateway((await repo.read()).gatewayConfig||{});
  const container=createAppContainer({repo,aiGateway,telemetry:new DurableTelemetry(repo)});
  return container;
 }};
}
