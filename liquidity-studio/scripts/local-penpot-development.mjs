// CLI-only adapter. No secret/config path enters browser responses or child env.
export async function localPenpotDevelopment({configurationPath,platform}) {
 if(!configurationPath)return undefined;
 const {rejectDeployment}=await import('./local-development-support.mjs');rejectDeployment(process.env);
 const {createDevelopmentPenpotStoryDesigns}=await import('../server/penpot-story-development.js');
 return createDevelopmentPenpotStoryDesigns({store:platform.store,identity:platform.identity,configurationPath});
}
