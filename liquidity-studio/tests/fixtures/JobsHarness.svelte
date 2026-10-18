<script>
  import JobsPane from "../../src/components/JobsPane.svelte";
  let scopeKey = $state("org_default:brand_default");
  async function request(path, options = {}) {
    const scope = scopeKey.split(":");
    const response = await fetch(
      `${path}?organizationId=${scope[0]}&brandId=${scope[1]}`,
      {
        ...options,
        headers: { "Content-Type": "application/json" },
        body: options.body,
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw Object.assign(Error(data.error), { status: response.status });
    return data;
  }
</script>
<button onclick={()=>scopeKey=scopeKey.endsWith('brand_default')?'org_default:brand_vedic':'org_default:brand_default'}>Switch fixture brand</button>
<JobsPane {request} {scopeKey}/>
