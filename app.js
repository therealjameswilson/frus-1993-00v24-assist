const notes=document.querySelector("#notes");const key=`frus-notes:${document.body.dataset.docId}`;if(notes){notes.value=localStorage.getItem(key)||"";notes.addEventListener("input",()=>localStorage.setItem(key,notes.value))}for(const button of document.querySelectorAll("[data-copy]")){button.addEventListener("click",async()=>{await navigator.clipboard.writeText(button.dataset.copy);const old=button.textContent;button.textContent="Copied";setTimeout(()=>button.textContent=old,1200)})}const data=window.FRUS_RESEARCH;const lanes=document.querySelector('[data-render="lanes"]');if(lanes&&data){lanes.innerHTML=data.lanes.map(lane=>`<article class="card"><span class="tag">${lane.status}</span><h3>${lane.label}</h3><p>${lane.next_action}</p></article>`).join("")}const sourceLinks=document.querySelector('[data-render="source-links"]');if(sourceLinks&&data){sourceLinks.innerHTML=data.source_leads.map(lead=>`<a class="source" href="${lead.url}" rel="noreferrer"><strong>${lead.label}</strong><span>${lead.category}</span></a>`).join("")}const gaps=document.querySelector('[data-render="gaps"]');if(gaps&&data){gaps.innerHTML=data.gap_register.map(gap=>`<article class="gap"><h3>${gap.area}</h3><p><strong>Fix:</strong> ${gap.fix}</p><p><strong>Status:</strong> ${gap.status}</p></article>`).join("")}for(const button of document.querySelectorAll(".tab-button")){button.addEventListener("click",()=>{for(const item of document.querySelectorAll(".tab-button"))item.setAttribute("aria-pressed",String(item===button));for(const panel of document.querySelectorAll("[data-panel]"))panel.hidden=panel.dataset.panel!==button.dataset.tab})}const exportButton=document.querySelector("[data-export]");if(exportButton&&data){exportButton.addEventListener("click",async()=>{await navigator.clipboard.writeText(JSON.stringify(data,null,2));const old=exportButton.textContent;exportButton.textContent="Copied JSON";setTimeout(()=>exportButton.textContent=old,1200)})}

// Render the existing dataset tables from the same data that Export JSON uses.
// Local working notes retain the original per-volume storage key.
(() => {
  const research = window.FRUS_RESEARCH;
  if (!research) return;
  const input = document.querySelector('#dataset-search');
  const count = document.querySelector('#dataset-search-count');
  const bodyFor = name => document.querySelector(`[data-panel="${name}"] tbody`);
  const textNode = (tag, text) => { const node = document.createElement(tag); node.textContent = text || ''; return node; };
  const link = (text, url) => {
    if (!/^https:\/\//.test(url || '')) return textNode('span', text);
    const node = textNode('a', text); node.href = url; node.rel = 'noreferrer'; return node;
  };
  function cell(...children) {
    const td = document.createElement('td');
    for (const child of children) td.append(typeof child === 'string' ? document.createTextNode(child) : child);
    return td;
  }
  function row(...cells) { const tr = document.createElement('tr'); tr.append(...cells); return tr; }
  function evidence(item) {
    const details = document.createElement('details');
    details.append(textNode('summary', 'Page evidence, date and source gaps'));
    details.append(textNode('p', item.dateEvidence));
    details.append(textNode('p', item.gap));
    const pages = document.createElement('p');
    pages.append('Physical PDF pages: ');
    (item.pages || []).forEach((page, i) => {
      if (i) pages.append(' · ');
      pages.append(link(String(page), item.pdfUrl + '#page=' + page));
    });
    details.append(pages);
    (item.searchableText || []).slice(0, 3).forEach(page => details.append(textNode('p', 'PDF p. ' + page.page + ': ' + (page.text || '').slice(0, 1400))));
    if (item.copyCitation) {
      const copy = textNode('button', 'Copy source citation');
      copy.type = 'button';
      copy.addEventListener('click', async () => { await navigator.clipboard.writeText(item.copyCitation); copy.textContent = 'Copied'; setTimeout(() => copy.textContent = 'Copy source citation', 1200); });
      details.append(copy);
    }
    details.append(textNode('p', 'Pending compiler selection. Extracted page text/OCR requires facsimile verification; no archival provenance is inferred.'));
    return details;
  }
  const matches = (item, query) => !query || JSON.stringify(item).toLocaleLowerCase().includes(query);
  function render() {
    const query = (input?.value || '').trim().toLocaleLowerCase();
    const sources = research.source_leads.filter(item => matches(item, query));
    const docs = research.document_candidates.filter(item => matches(item, query));
    const chronology = research.chronology.filter(item => matches(item, query));
    bodyFor('sources')?.replaceChildren(...sources.map(item => row(cell(link(item.label, item.url)), cell(item.category), cell(item.use), cell(item.status))));
    bodyFor('documents')?.replaceChildren(...docs.map(item => {
      const release = item.releaseEvidence;
      const title = cell(link(item.title, item.url));
      title.append(textNode('p', item.date));
      const action = release ? cell(textNode('p', release.summary), textNode('p', 'Compiler use: ' + release.compilerUse), evidence({...release, searchableText:item.searchableText, copyCitation:item.copyCitation})) : cell(item.action);
      return row(title, cell(item.repository), cell(item.status), action);
    }));
    bodyFor('chronology')?.replaceChildren(...chronology.sort((a,b)=>a.date.localeCompare(b.date)).map(item => {
      const details = cell(item.note);
      if (item.pages) {
        const pages = textNode('p', 'Physical PDF pages: ');
        item.pages.forEach((p, i)=>{ if(i) pages.append(' · '); pages.append(link(String(p), item.source+'#page='+p)); });
        details.append(pages);
      }
      return row(cell(item.date), cell(link(item.label, item.source)), details, cell(item.status));
    }));
    if (count) count.textContent = `${docs.length} of ${research.document_candidates.length} document rows; ${chronology.length} chronology rows; ${sources.length} source rows. Search covers all three tabs.`;
    const tableCount = document.querySelector('[data-table-count]');
    if (tableCount) tableCount.textContent = String(research.source_leads.length + research.document_candidates.length + research.chronology.length + research.persons.length);
  }
  input?.addEventListener('input', render);
  render();
})();
