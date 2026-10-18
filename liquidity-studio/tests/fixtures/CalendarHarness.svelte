<script>
  import WorkspaceCalendar from "../../src/components/WorkspaceCalendar.svelte";
  import { createWorkspaceClient } from "../../src/lib/workspace-client.js";
  let brandId = $state("brand_default");
  let selected = $state("");
  function makeClient(brand) {
    const scope = new URLSearchParams({
      organizationId: "org_default",
      brandId: brand,
    });
    return createWorkspaceClient({
      scopeKey: `fixture-founder:org_default:${brand}`,
      request: async (path, options = {}) => {
        const response = await fetch(
          path + (path.includes("?") ? "&" : "?") + scope,
          {
            ...options,
            credentials: "same-origin",
            headers: {
              ...(options.body ? { "Content-Type": "application/json" } : {}),
              ...options.headers,
            },
          },
        );
        const data = await response.json();
        if (!response.ok)
          throw Object.assign(new Error(data.error || "Fixture request failed"), {
            status: response.status,
          });
        return data;
      },
    });
  }
  let client = $state.raw(makeClient("brand_default"));
  function switchBrand() {
    client.dispose();
    selected = "";
    client = makeClient(brandId);
  }
</script>
<div style="padding:1rem"><p>Isolated test fixture · explicit development auth · no production data</p><label>Fixture brand<select aria-label="Fixture brand" bind:value={brandId} onchange={switchBrand}><option value="brand_default">Liquidity fixture</option><option value="brand_vedic">CWJ fixture</option></select></label><p>Selected story: {selected}</p><WorkspaceCalendar {client} scopeKey={client.scopeKey} onOpenStory={async id=>{await client.ensureStories([id]);selected=client.getStory(id)?.title||id;}}/></div>
