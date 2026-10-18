<script>
  import Icon from './Icon.svelte';
  let {nodes,edges,selectedId,onselect,onmove,planIds=[]}= $props();
  let zoom=$state(1),pan=$state({x:0,y:0}),drag=$state(null),surface;
  const nodeFor=id=>nodes.find(n=>n.id===id);
  function pointerDown(e){if(e.button!==0||e.target.closest('button,[data-edge]'))return;drag={kind:'pan',x:e.clientX,y:e.clientY,pan:{...pan}};e.currentTarget.setPointerCapture(e.pointerId);}
  function nodeDown(e,node){if(e.button!==0)return;e.stopPropagation();drag={kind:'node',id:node.id,x:e.clientX,y:e.clientY,start:{x:node.x,y:node.y},moved:false};e.currentTarget.setPointerCapture(e.pointerId);}
  function move(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.kind==='pan'){pan={x:drag.pan.x+dx,y:drag.pan.y+dy};}else if(Math.abs(dx)+Math.abs(dy)>5){drag.moved=true;onmove(drag.id,{x:Math.max(10,Math.min(90,drag.start.x+dx/surface.clientWidth/zoom*100)),y:Math.max(12,Math.min(88,drag.start.y+dy/surface.clientHeight/zoom*100))});}}
  function end(){const moved=drag?.moved;drag=null;return moved;}
  function fit(){zoom=1;pan={x:0,y:0};}
  function wheel(e){if(e.ctrlKey||e.metaKey){e.preventDefault();zoom=Math.max(.65,Math.min(1.6,zoom-e.deltaY*.003));}}
</script>
<div class="graph-canvas" bind:this={surface} role="region" aria-label="Opportunity graph. Tab through nodes and routes. Drag empty space to pan." onpointerdown={pointerDown} onpointermove={move} onpointerup={()=>end()} onpointercancel={()=>end()} onwheel={wheel}>
  <div class="graph-world" style:transform={`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}>
    <svg class="connections" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-label="Graph relationships">
      <defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#b9c2c0"/></marker><marker id="arrow-active" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#467966"/></marker></defs>
      {#each edges as edge (edge.id)}
        {@const a=nodeFor(edge.from)}{@const b=nodeFor(edge.to)}
        {#if a&&b}
          {@const d=`M${a.x*10},${a.y*6.5} C${(a.x+b.x)*5},${a.y*6.5} ${(a.x+b.x)*5},${b.y*6.5} ${b.x*10},${b.y*6.5}`}
          <path class="edge-line" class:chosen={selectedId===edge.id} class:match={edge.kind==='match'} d={d} marker-end={selectedId===edge.id?'url(#arrow-active)':'url(#arrow)'}/>
          {#if edge.kind==='route'}<path class="edge-hit" data-edge={edge.id} d={d} role="button" tabindex="0" aria-label={`Inspect route ${edge.name}`} onclick={()=>onselect(edge.id)} onkeydown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onselect(edge.id);}}}/>{/if}
        {/if}
      {/each}
    </svg>
    {#each nodes as node (node.id)}
      <button class="graph-node" class:chosen={selectedId===node.id} class:artist={node.kind==='artist'} class:person={node.kind==='person'} style:left={`${node.x}%`} style:top={`${node.y}%`} data-node-id={node.id} aria-label={`Explore ${node.name}, ${node.kind}`} aria-pressed={selectedId===node.id} onpointerdown={e=>nodeDown(e,node)} onpointermove={e=>{e.stopPropagation();move(e);}} onpointerup={e=>{e.stopPropagation();const moved=end();if(!moved)onselect(node.id);}} onpointercancel={()=>end()} onclick={e=>{if(e.detail===0)onselect(node.id);}}>
        <span class="node-icon"><Icon name={node.kind==='region'?'globe':node.kind==='artist'?'music':'person'} size={18}/></span>
        <span class="node-text"><strong>{node.name}</strong><small>{node.kind==='region'?node.subtitle:node.kind==='artist'?'Emerging artist':'Possible collaborator'}</small></span>
        {#if planIds.includes(node.id)}<span class="node-added"><Icon name="check" size={12}/></span>{/if}
      </button>
    {/each}
  </div>
  <div class="graph-key"><span><i class="region-dot"></i> Region</span><span><i class="artist-dot"></i> Artist</span><span><i class="person-dot"></i> Collaborator</span></div>
  <div class="graph-controls"><button aria-label="Zoom out" onclick={()=>zoom=Math.max(.65,zoom-.15)}><Icon name="minus"/></button><span>{Math.round(zoom*100)}%</span><button aria-label="Zoom in" onclick={()=>zoom=Math.min(1.6,zoom+.15)}><Icon name="plus"/></button><span class="divider"></span><button aria-label="Fit graph" onclick={fit}><Icon name="fit"/></button></div>
</div>
