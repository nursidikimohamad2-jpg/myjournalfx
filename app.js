/* =========================
   RR JOURNAL — APP.JS (SIAP PAKAI)
   ========================= */

/* ===== util DOM ===== */
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);
const uid = () => Math.random().toString(36).slice(2, 9);

/* ===== refs ===== */
const form = $('#tradeForm');
const rPointEl = $('#rPoint'), tp1El = $('#tp1Display'), tp2El = $('#tp2Display'), tp3El = $('#tp3Display');
const pBox1 = $('#pBox1'), pBox2 = $('#pBox2'), pBox3 = $('#pBox3'), totalTxBox = $('#totalTxBox');
const tradeList = $('#tradeList'), totR1El = $('#totR1'), totR2El = $('#totR2'), totR3El = $('#totR3');

const exportBtn = $('#exportBtn'), importInput = $('#importInput'), clearBtn = $('#clearBtn');
const exportHtmlBtn = $('#exportHtmlBtn');
const exportDeckBtn = $('#exportDeckBtn');

/* ===== Simulasi Balance ===== */
const baseInput = $('#baseInput');
const riskInput = $('#riskInput');
const rValBox = $('#rValBox');
const simBalBox = $('#simBalBox');
const pnlMoneyBox = $('#pnlMoneyBox');

/* ===== Projects ===== */
const saveProjectBtn = $('#saveProjectBtn');
const openProjectsBtn = $('#openProjectsBtn');
const saveToActiveBtn = $('#saveToActiveBtn');

const projectsModal = $('#projectsModal');
const projectsList  = $('#projectsList');
const closeProjects = $('#closeProjects');

const saveProjectModal = $('#saveProjectModal');
const saveProjectName  = $('#saveProjectName');
const saveProjectNotes = $('#saveProjectNotes');
const cancelSaveProject = $('#cancelSaveProject');
const confirmSaveProject = $('#confirmSaveProject');

/* ===== Edit Modal + Gambar ===== */
const editModal = $('#editModal');
const editForm  = $('#editForm');
const editCancel = $('#editCancel');

const editImgBefore = $('#editImgBefore');
const editImgBeforeData = $('#editImgBeforeData');
const editImgBeforePreview = $('#editImgBeforePreview');
const btnClearImgBefore = $('#btnClearImgBefore');
const btnViewImgBefore = $('#btnViewImgBefore');
const dropBefore = $('#dropBefore');

const editImgAfter = $('#editImgAfter');
const editImgAfterData = $('#editImgAfterData');
const editImgAfterPreview = $('#editImgAfterPreview');
const btnClearImgAfter = $('#btnClearImgAfter');
const btnViewImgAfter = $('#btnViewImgAfter');
const dropAfter = $('#dropAfter');

const imgViewer = $('#imgViewer');
const imgViewerImg = $('#imgViewerImg');
const imgViewerClose = $('#imgViewerClose');

/* ===== storage keys ===== */
const STORE            = 'rr_journal_active_v1';
const STORE_PROJ       = 'rr_journal_projects_v1';
const ACTIVE_ID_KEY    = 'rr_active_project_id';
const ACTIVE_NAME_KEY  = 'rr_active_project_name';
const STORE_SETTINGS   = 'rr_journal_settings_v1';

/* ===== storage helpers ===== */
const load = () => JSON.parse(localStorage.getItem(STORE) || '[]');
const save = (d) => localStorage.setItem(STORE, JSON.stringify(d));

const loadProj = () => {
  try { return JSON.parse(localStorage.getItem(STORE_PROJ) || '[]'); }
  catch { localStorage.removeItem(STORE_PROJ); return []; }
};
const saveProj = (p) => localStorage.setItem(STORE_PROJ, JSON.stringify(p));

const loadSettings = () => { try { return JSON.parse(localStorage.getItem(STORE_SETTINGS) || '{}'); } catch { return {}; } };
const saveSettings = (s) => localStorage.setItem(STORE_SETTINGS, JSON.stringify(s));

/* ===== helpers umum ===== */
const fmtDT     = (s) => (s ? s.replace('T', ' ') : '');
const toDTInput = (s) => (!s ? '' : (s.includes('T') ? s : s.replace(' ', 'T')));
const nowISO    = () => new Date().toISOString();
const fmtMoney  = (n) => (isFinite(n) ? n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
const slugify   = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'report';

/* ===== SYMBOL & PRECISION ===== */
const SYMBOLS = [
  "EURUSD","GBPUSD","AUDUSD","NZDUSD","USDJPY","USDCHF","USDCAD",
  "EURGBP","EURCHF","EURJPY","EURCAD","EURAUD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPCAD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCAD","AUDCHF",
  "NZDJPY","NZDCAD","NZDCHF",
  "CADJPY","CHFJPY","CADCHF",
  "XAUUSD","XAGUSD","US100"
];
const normalizeSymbol = (s) => (s || '').toUpperCase().replace(/[^A-Z]/g, '').trim();
function precisionForSymbol(symRaw){
  const s = normalizeSymbol(symRaw); if(!s) return 5;
  const MAP = { XAUUSD:2, XAGUSD:3, US100:1 };
  if (MAP[s] != null) return MAP[s];
  if (s.endsWith('JPY')) return 3;
  return 5;
}
const stepForPrecision = (p) => Number(`1e-${p}`);
const roundTo = (n, prec) => { const f = Math.pow(10, prec); return Math.round(Number(n || 0) * f) / f; };
const toFixedBy = (n, prec) => (Number.isFinite(n) ? Number(n).toFixed(prec) : (0).toFixed(prec));

/* ===== Dropdown symbol ===== */
function populateSelectOptions(selectEl, list){
  selectEl.innerHTML = '';
  const ph = document.createElement('option');
  ph.value = ''; ph.textContent = '-- pilih symbol --'; ph.disabled = true; ph.selected = true;
  selectEl.appendChild(ph);
  list.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    selectEl.appendChild(opt);
  });
}
function ensureSymbolDropdownForAdd(){
  if (!form) return;
  const old = form.querySelector('[name="symbol"]');
  if (!old) return;
  if (old.tagName.toLowerCase() === 'select'){ populateSelectOptions(old, SYMBOLS); return; }
  const sel = document.createElement('select');
  sel.id = old.id || 'symbol'; sel.name = old.name || 'symbol'; sel.className = old.className; sel.required = true;
  populateSelectOptions(sel, SYMBOLS);
  old.replaceWith(sel);
}
function ensureSymbolDropdownForEdit(){
  if (!editForm) return;
  const old = editForm.querySelector('[name="symbol"]');
  if (!old) return;
  if (old.tagName.toLowerCase() === 'select'){ populateSelectOptions(old, SYMBOLS); return; }
  const sel = document.createElement('select');
  sel.name = 'symbol'; sel.id = old.id || 'editSymbol'; sel.className = old.className; sel.required = true;
  populateSelectOptions(sel, SYMBOLS);
  old.replaceWith(sel);
}

/* ===== Apply precision ===== */
function applyPriceFormatToAddForm(){
  if(!form) return;
  const p   = precisionForSymbol(form.symbol.value);
  const ph  = p>0 ? ('0.' + '0'.repeat(p)) : '0';
  const st  = stepForPrecision(p);
  if(form.entry_price){ form.entry_price.step = st; form.entry_price.placeholder = ph; }
  if(form.stop_loss){   form.stop_loss.step   = st; form.stop_loss.placeholder   = ph; }
  calcPreview(Number(form.entry_price.value), Number(form.stop_loss.value), form.side.value, p);
}
function applyPriceFormatToEditForm(){
  if(!editForm) return;
  const p   = precisionForSymbol(editForm.symbol.value);
  const ph  = p>0 ? ('0.' + '0'.repeat(p)) : '0';
  const st  = stepForPrecision(p);
  if(editForm.entry_price){ editForm.entry_price.step = st; editForm.entry_price.placeholder = ph; }
  if(editForm.stop_loss){   editForm.stop_loss.step   = st; editForm.stop_loss.placeholder   = ph; }
}

/* ===== Active Project badge ===== */
function setActiveProject(id='', name=''){
  localStorage.setItem(ACTIVE_ID_KEY, id || '');
  localStorage.setItem(ACTIVE_NAME_KEY, name || '');
  const has = !!id;
  if (saveToActiveBtn){
    saveToActiveBtn.classList.toggle('hidden', !has);
    if (has) saveToActiveBtn.textContent = `Simpan (${name})`;
  }
}
function getActiveProject(){ return { id: localStorage.getItem(ACTIVE_ID_KEY)||'', name: localStorage.getItem(ACTIVE_NAME_KEY)||'' }; }

/* ===== Preview R & TP ===== */
function calcPreview(entry, sl, side, precHint){
  const ok = Number.isFinite(entry) && Number.isFinite(sl);
  const prec = (precHint ?? precisionForSymbol(form?.symbol?.value || ''));
  if (!ok){
    rPointEl.textContent='0.00';
    tp1El.textContent=tp2El.textContent=tp3El.textContent='0.00';
    return;
  }
  const d = Math.abs(entry - sl);
  rPointEl.textContent = toFixedBy(roundTo(d, prec), prec);
  const tp1 = side==='LONG'? entry+d : entry-d;
  const tp2 = side==='LONG'? entry+2*d : entry-2*d;
  const tp3 = side==='LONG'? entry+3*d : entry-3*d;
  tp1El.textContent = toFixedBy(roundTo(tp1, prec), prec);
  tp2El.textContent = toFixedBy(roundTo(tp2, prec), prec);
  tp3El.textContent = toFixedBy(roundTo(tp3, prec), prec);
}

/* ===== R helpers ===== */
function rByResult(res){
  switch(res){
    case 'SL':  return [-1,-1,-1];
    case 'TP1': return [ 1,-1,-1];
    case 'TP2': return [ 1, 2,-1];
    case 'TP3': return [ 1, 2, 3];
    default:    return [ 0, 0, 0];
  }
}
function levelFromResult(res){
  switch(res){ case 'TP3':return 3; case 'TP2':return 2; case 'TP1':return 1; case 'SL':return 0; default:return null; }
}
function netROf(res){
  if(res==='SL')  return -1;
  if(res==='TP1') return  1;
  if(res==='TP2') return  2;
  if(res==='TP3') return  3;
  return 0;
}
function rCell(n){
  const c = n>0 ? 'text-emerald-400' : (n<0 ? 'text-rose-400' : 'text-slate-400');
  return `<span class="${c}">${String(n)}</span>`;
}

/* ===== table row ===== */
function rowHTML(t){
  const [r1,r2,r3] = rByResult(t.result||'');
  const prec = precisionForSymbol(t.symbol);
  const fmt  = v => toFixedBy(Number(v), prec);
  const symbolClean = normalizeSymbol(t.symbol);

  const resultSel = `
    <select data-id="${t.id}" data-field="result"
      class="bg-slate-900/70 border border-slate-700 rounded-lg px-2 py-1">
      <option value=""   ${!t.result?'selected':''}>-</option>
      <option value="SL" ${t.result==='SL'?'selected':''}>SL</option>
      <option value="TP1"${t.result==='TP1'?'selected':''}>TP1</option>
      <option value="TP2"${t.result==='TP2'?'selected':''}>TP2</option>
      <option value="TP3"${t.result==='TP3'?'selected':''}>TP3</option>
    </select>`;
  const buttons = `
    <div class="flex items-center gap-2 justify-center">
      <button data-id="${t.id}" data-action="edit"
        class="bg-slate-900/70 border border-slate-700 rounded-lg px-2 py-1" title="Edit">✏️</button>
      <button data-id="${t.id}" data-action="del"
        class="bg-slate-900/70 border border-slate-700 rounded-lg px-2 py-1 hover:bg-rose-600 hover:text-white" title="Hapus">🗑</button>
    </div>`;
  return `
    <td class="px-3 py-2">${fmtDT(t.setup_date||'')}</td>
    <td class="px-3 py-2">${symbolClean}</td>
    <td class="px-3 py-2 text-center">${t.side}</td>
    <td class="px-3 py-2 text-right">${fmt(t.entry_price)}</td>
    <td class="px-3 py-2 text-right">${fmt(t.stop_loss)}</td>
    <td class="px-3 py-2 text-right">${rCell(r1)}</td>
    <td class="px-3 py-2 text-right">${rCell(r2)}</td>
    <td class="px-3 py-2 text-right">${rCell(r3)}</td>
    <td class="px-3 py-2 text-right">${resultSel}</td>
    <td class="px-3 py-2 text-left">${t.note || ''}</td>
    <td class="px-3 py-2">${buttons}</td>
  `;
}

/* ===== refresh UI + prob & sim ===== */
function refresh(){
  const data = load();
  tradeList.innerHTML = '';
  totalTxBox.textContent = String(data.length);

  let tR1=0,tR2=0,tR3=0, nDone=0, n1=0, n2=0, n3=0, rnet=0;

  data.forEach(t=>{
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-900/40 transition-colors';
    tr.innerHTML = rowHTML(t);
    tradeList.appendChild(tr);

    const [r1,r2,r3] = rByResult(t.result||''); tR1+=r1; tR2+=r2; tR3+=r3;
    rnet += netROf(t.result||'');
    const lvl = levelFromResult(t.result||'');
    if(lvl!==null){ nDone++; if(lvl>=1) n1++; if(lvl>=2) n2++; if(lvl>=3) n3++; }
  });

  const setTot=(el,v)=>{ el.textContent=String(v); el.className='px-3 py-2 text-right font-semibold '+(v>0?'text-emerald-400':(v<0?'text-rose-400':'')); };
  setTot(totR1El,tR1); setTot(totR2El,tR2); setTot(totR3El,tR3);

  const pct = x => (nDone>0?Math.round(x/nDone*100):0)+'%';
  pBox1.textContent = pct(n1); pBox2.textContent = pct(n2); pBox3.textContent = pct(n3);

  calcSim(rnet);
}

/* ===== CRUD (pure) ===== */
function addTrade(obj){ const data = load(); data.push(obj); save(data); }
function updateTrade(id, patch){
  const data = load(); const i = data.findIndex(x=>x.id===id);
  if(i<0) return; data[i] = { ...data[i], ...patch }; save(data);
}
function deleteTrade(id){ const data = load().filter(x=>x.id!==id); save(data); }

/* ===== Edit Modal ===== */
function openEdit(id){
  const t = load().find(x=>x.id===id); if(!t) return;
  ensureSymbolDropdownForEdit();
  editForm.id.value = id;
  editForm.setup_date.value = toDTInput(t.setup_date || '');
  editForm.symbol.value = normalizeSymbol(t.symbol || '');
  editForm.side.value = t.side || 'LONG';
  editForm.entry_price.value = t.entry_price ?? 0;
  editForm.stop_loss.value  = t.stop_loss  ?? 0;

  setImagePreview('before', t.img_before_data || '');
  setImagePreview('after',  t.img_after_data  || '');

  applyPriceFormatToEditForm();
  editModal.classList.remove('hidden'); editModal.classList.add('flex');
}
function closeEdit(){ editModal.classList.add('hidden'); editModal.classList.remove('flex'); }

/* ===== Projects ===== */
function renderProjects(){
  const items = loadProj();
  projectsList.innerHTML = '';
  if(items.length === 0){
    projectsList.innerHTML = `<div class="text-slate-400">Belum ada project.</div>`;
    return;
  }
  items.forEach(p=>{
    const div = document.createElement('div');
    const created = p.createdAt?.replace('T',' ').slice(0,16) || '-';
    const updated = p.updatedAt?.replace('T',' ').slice(0,16) || '-';
    div.className = 'bg-slate-900/70 ring-1 ring-white/10 rounded-xl p-4 flex flex-wrap items-center gap-3';
    div.innerHTML = `
      <div class="flex-1">
        <div class="font-semibold">${p.name}</div>
        <div class="text-slate-400 text-sm">Transaksi: ${p.trades.length} • Catatan: ${p.notes||'-'}</div>
        <div class="text-slate-500 text-xs">Dibuat: ${created} • Update: ${updated}</div>
      </div>
      <div class="flex items-center gap-2">
        <button data-id="${p.id}" data-act="open" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg">Lanjut Journal</button>
        <button data-id="${p.id}" data-act="del" class="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded-lg">Hapus</button>
      </div>
    `;
    projectsList.appendChild(div);
  });
}
function openProjects(){ renderProjects(); projectsModal.classList.remove('hidden'); projectsModal.classList.add('flex'); }
function closeProjectsModal(){ projectsModal.classList.add('hidden'); projectsModal.classList.remove('flex'); }

function openSaveProjectModal(){
  if(saveProjectName)  saveProjectName.value  = '';
  if(saveProjectNotes) saveProjectNotes.value = '';
  saveProjectModal.classList.remove('hidden'); saveProjectModal.classList.add('flex');
  setTimeout(()=>saveProjectName?.focus(),50);
}
function closeSaveProjectModal(){ saveProjectModal.classList.add('hidden'); saveProjectModal.classList.remove('flex'); }

/* ===== EVENTS: ADD FORM ===== */
form?.addEventListener('input', applyPriceFormatToAddForm);
form?.addEventListener('change', (e)=>{ if(e.target && e.target.name==='symbol') applyPriceFormatToAddForm(); });

form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const keep = getSettings();

  const symbol = normalizeSymbol(form.symbol.value || '');
  const side   = form.side.value;
  const entry  = Number(form.entry_price.value);
  const sl     = Number(form.stop_loss.value);
  const prec   = precisionForSymbol(symbol);

  if(!symbol || !Number.isFinite(entry) || !Number.isFinite(sl)){ alert('Isi minimal: Symbol, Entry, Stop Loss.'); return; }
  if(entry === sl){ alert('Entry dan Stop Loss tidak boleh sama.'); return; }

  addTrade({
    id: uid(),
    symbol,
    side,
    entry_price: roundTo(entry, prec),
    stop_loss:   roundTo(sl,   prec),
    setup_date: form.setup_date.value || '',
    note: form.note.value || '',
    result: '',
    img_before_data: '',
    img_after_data: ''
  });

  form.reset();
  setSettings(keep);
  calcPreview(NaN, NaN, side, prec); // reset preview
  calcSim();

  refresh();

  // === AUTO SCROLL KE BAWAH PADA TABLE WRAPPER (.table-scroll)
  const tbl = document.querySelector('.table-scroll');
  if (tbl){
    setTimeout(()=> tbl.scrollTo({ top: tbl.scrollHeight, behavior: 'smooth' }), 60);
  }
});

/* tombol reset form -> jangan hapus modal/risk */
form?.addEventListener('reset', ()=>{
  const s = loadSettings();
  setTimeout(()=>{ setSettings(s); calcSim(); }, 0);
});

/* ===== EVENTS: TABLE & EDIT ===== */
tradeList.addEventListener('change', (e)=>{
  const sel = e.target.closest('select[data-id]');
  if(sel){ updateTrade(sel.dataset.id, { [sel.dataset.field || 'result']: sel.value }); refresh(); }
});
tradeList.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-action]'); if(!btn) return;
  const id = btn.dataset.id;
  if(btn.dataset.action==='del'){ deleteTrade(id); refresh(); }
  if(btn.dataset.action==='edit'){ openEdit(id); }
});

editCancel?.addEventListener('click', closeEdit);
editForm?.symbol?.addEventListener('input', applyPriceFormatToEditForm);
editForm?.addEventListener('change', (e)=>{ if(e.target && e.target.name==='symbol') applyPriceFormatToEditForm(); });
editForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const symbol = normalizeSymbol(editForm.symbol.value || '');
  const prec   = precisionForSymbol(symbol);

  updateTrade(editForm.id.value, {
    setup_date: editForm.setup_date.value || '',
    symbol,
    side: editForm.side.value,
    entry_price: roundTo(Number(editForm.entry_price.value)||0, prec),
    stop_loss:   roundTo(Number(editForm.stop_loss.value)||0,  prec),
    img_before_data: (editImgBeforeData?.value || ''),
    img_after_data:  (editImgAfterData?.value || '')
  });
  closeEdit(); refresh();
});

document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){ closeEdit(); closeProjectsModal(); closeSaveProjectModal(); closeLightbox(); }
});

/* ===== Export/Import/Clear ===== */
exportBtn?.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(load(), null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='rr-journal.json';
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 0);
});
importInput?.addEventListener('change', async (e)=>{
  const f = e.target.files[0]; if(!f) return;
  try{
    const txt = await f.text(); const data = JSON.parse(txt);
    if(Array.isArray(data)) save(data);
  }catch{}
  importInput.value=''; refresh();
});
clearBtn?.addEventListener('click', ()=>{
  if(confirm('Hapus semua data jurnal aktif?')){
    localStorage.removeItem(STORE);
    refresh();
  }
});

/* ===== Projects: Save / Open / Delete ===== */
saveProjectBtn?.addEventListener('click', openSaveProjectModal);
cancelSaveProject?.addEventListener('click', closeSaveProjectModal);
confirmSaveProject?.addEventListener('click', ()=>{
  const trades = load();
  if (!trades.length){ alert('Belum ada data jurnal untuk disimpan.'); return; }

  const name = (saveProjectName.value || '').trim();
  if (!name){ alert('Nama Project wajib diisi.'); saveProjectName.focus(); return; }

  const notes = (saveProjectNotes.value || '').trim();
  const projects = loadProj();
  const existing = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  const snapshot = JSON.parse(JSON.stringify(trades));
  const settings = getSettings();

  if (existing){
    if(!confirm(`Project "${existing.name}" sudah ada.\nUpdate isi project ini?`)) return;
    existing.trades = snapshot;
    existing.notes  = notes;
    existing.settings = settings;
    existing.updatedAt = nowISO();
    saveProj(projects);
    setActiveProject(existing.id, existing.name);
  } else {
    const item = {
      id: uid(), name,
      createdAt: nowISO(), updatedAt: nowISO(),
      notes, trades: snapshot, settings
    };
    projects.unshift(item);
    saveProj(projects);
    setActiveProject(item.id, item.name);
  }

  save([]);       // kosongkan jurnal aktif setelah di-archive
  refresh();
  closeSaveProjectModal();
  openProjects();
});
openProjectsBtn?.addEventListener('click', openProjects);
closeProjects?.addEventListener('click', closeProjectsModal);
projectsList?.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-act]'); if(!btn) return;
  const id = btn.dataset.id; const projects = loadProj();
  const item = projects.find(p=>p.id===id); if(!item) return;

  if(btn.dataset.act==='open'){
    save(item.trades); refresh(); closeProjectsModal();
    setActiveProject(item.id, item.name);
    if(item.settings){ setSettings(item.settings); calcSim(); }
  } else if(btn.dataset.act==='del'){
    if(confirm(`Hapus project "${item.name}"?`)){
      saveProj(projects.filter(p=>p.id!==id));
      const act = getActiveProject();
      if(act.id===id) setActiveProject('', '');
      renderProjects();
    }
  }
});

/* ===== Simulasi Balance ===== */
function getSettings(){
  return {
    base: parseFloat(baseInput?.value) || 0,
    risk: parseFloat(riskInput?.value) || 0
  };
}
function setSettings({ base=0, risk=0 }={}){
  if(baseInput) baseInput.value = (base ?? '');
  if(riskInput) riskInput.value = (risk ?? '');
  saveSettings({ base, risk });
}
function currentOneR(){ const s = getSettings(); return s.base * (s.risk/100); }
function calcSim(){
  const s = getSettings();
  saveSettings(s);
  const oneR = currentOneR();
  const rTotal = load().reduce((acc,t)=>{ const [x1,x2,x3]=rByResult((t.result||'')); return acc + x1 + x2 + x3; }, 0);
  const pnl  = oneR * rTotal;
  const eq   = s.base + pnl;

  if(rValBox)     rValBox.textContent     = fmtMoney(oneR);
  if(pnlMoneyBox) pnlMoneyBox.textContent = (pnl>=0? '+' : '') + fmtMoney(pnl);
  if(simBalBox)   simBalBox.textContent   = fmtMoney(eq);

  [pnlMoneyBox, simBalBox].forEach(el=>{
    if(!el) return;
    el.classList.remove('text-emerald-400','text-rose-400');
    const v = el===pnlMoneyBox ? pnl : eq - s.base;
    el.classList.add(v>=0 ? 'text-emerald-400' : 'text-rose-400');
  });
}

/* ===== Export HTML ringkas ===== */
function downloadTextFile(filename, text, mime='text/html'){
  try{
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); },0);
  }catch(err){ console.error('Download failed:', err); alert('Gagal membuat file export.'); }
}
function computeStats(trades){
  let nDone=0,n1=0,n2=0,n3=0, r1=0,r2=0,r3=0,rnet=0;
  const dates=[]; const counts = { SL:0, TP1:0, TP2:0, TP3:0 };
  trades.forEach(t=>{
    if(t.setup_date) dates.push(t.setup_date);
    const res=t.result||''; const [x1,x2,x3]=rByResult(res);
    r1+=x1; r2+=x2; r3+=x3; rnet+=netROf(res);
    const lvl=levelFromResult(res); if(lvl!==null){ nDone++; if(lvl>=1)n1++; if(lvl>=2)n2++; if(lvl>=3)n3++; }
    if(res==='SL')counts.SL++; if(res==='TP1')counts.TP1++; if(res==='TP2')counts.TP2++; if(res==='TP3')counts.TP3++;
  });
  const arr=dates.slice().sort(); const min=arr[0]?.replace('T',' ')||''; const max=arr[arr.length-1]?.replace('T',' ')||'';
  const { base, risk } = getSettings(); const oneR = base*(risk/100);
  return {
    total: trades.length,
    prob: { tp1:nDone?Math.round(n1/nDone*100):0, tp2:nDone?Math.round(n2/nDone*100):0, tp3:nDone?Math.round(n3/nDone*100):0 },
    rsum: { r1, r2, r3 },
    rsumTotal: rnet,
    range:{ min, max },
    results:{ counts, wins: counts.TP1+counts.TP2+counts.TP3 },
    sim:{ base, risk, oneR, pnl: oneR*rnet, equity: base + oneR*rnet }
  };
}
function buildReportHTML({ projectName, createdAt, stats }){
  const css = `
  body{margin:0;background:#0b1220;color:#e2e8f0;font:14px/1.5 system-ui,Inter}
  .wrap{max-width:1024px;margin:0 auto;padding:24px}
  .grid{display:grid;gap:12px}
  .g4{grid-template-columns:repeat(4,1fr)}
  .card{background:#0f172a;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px}
  .muted{color:#94a3b8}
  .big{font-size:22px;font-weight:700}
  `;
  const fmt = (n)=> (+n).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
  const sign = (n)=> n>=0?'style="color:#10b981"':'style="color:#f43f5e"';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${projectName}</title><style>${css}</style></head><body><div class="wrap">
    <div class="card"><h1>${projectName}</h1><div class="muted">Dibuat: ${createdAt} • Rentang: ${stats.range.min||'-'} — ${stats.range.max||'-'}</div></div>
    <div class="grid g4" style="margin-top:12px">
      <div class="card"><div class="muted">Transaksi</div><div class="big">${stats.total}</div></div>
      <div class="card"><div class="muted">Prob ≥ TP1</div><div class="big">${stats.prob.tp1}%</div></div>
      <div class="card"><div class="muted">Prob ≥ TP2</div><div class="big">${stats.prob.tp2}%</div></div>
      <div class="card"><div class="muted">Prob ≥ TP3</div><div class="big">${stats.prob.tp3}%</div></div>
    </div>
    <div class="grid g4" style="margin-top:12px">
      <div class="card"><div class="muted">Total R (Net)</div><div class="big" ${sign(stats.rsumTotal)}>${stats.rsumTotal}</div></div>
      <div class="card"><div class="muted">1R (USD)</div><div class="big">$${fmt(stats.sim.oneR)}</div></div>
      <div class="card"><div class="muted">P/L (USD)</div><div class="big" ${sign(stats.sim.pnl)}>$${fmt(stats.sim.pnl)}</div></div>
      <div class="card"><div class="muted">Equity</div><div class="big">$${fmt(stats.sim.equity)}</div></div>
    </div>
  </div></body></html>`;
}
exportHtmlBtn?.addEventListener('click', ()=>{
  try{
    const trades = load();
    const { name } = getActiveProject();
    const projectName = name || 'Jurnal Aktif';
    const stats = computeStats(trades);
    const html  = buildReportHTML({ projectName, createdAt:new Date().toLocaleString('id-ID'), stats });
    const fname = `rr-report-${slugify(projectName)}.html`;
    downloadTextFile(fname, html, 'text/html');
  }catch(e){ console.error(e); alert('Export HTML gagal.'); }
});

/* ===== Export PRESENTASI (pakai tombol #exportDeckBtn dari HTML) ===== */
function buildPresentationHTML({ projectName, createdAt, trades, stats }){
  const css = `
  :root{--bg:#0b1220;--panel:#0f172a;--text:#e2e8f0;--ring:rgba(255,255,255,.08);--pos:#10b981;--neg:#f43f5e}
  *{box-sizing:border-box} body{margin:0;background:#07111f;color:var(--text);font:14px/1.5 system-ui,Inter}
  .wrap{max-width:1180px;margin:0 auto;padding:28px} .cards{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:16px 0 22px}
  .card{background:rgba(15,23,42,.88);border:1px solid var(--ring);border-radius:12px;padding:14px;min-height:72px;display:flex;flex-direction:column;gap:6px}
  .k{font-size:12px;color:#94a3b8}.v{font-weight:700;font-size:18px}
  .block{background:rgba(15,23,42,.88);border:1px solid var(--ring);border-radius:14px;padding:16px;margin:14px 0}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .thumb{background:#0b1628;border:1px solid var(--ring);height:240px;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .thumb>img{max-width:100%;max-height:100%;object-fit:contain}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:.2rem .55rem;border-radius:999px;border:1px solid var(--ring);font-size:12px}
  .LONG{background:#032a3a;color:#aaf;border-color:#0ea5e9}.SHORT{background:#3a1a1a;color:#ffd6d6;border-color:#f97316}
  .TP1,.TP2,.TP3{background:rgba(16,185,129,.1);color:#a7f3d0;border-color:#10b981}.SL{background:rgba(244,63,94,.1);color:#fecaca;border-color:#f43f5e}
  table.meta{width:100%;border-collapse:separate;border-spacing:0 8px} table.meta td{padding:8px 10px;border-radius:8px;background:#0c172a;border:1px solid var(--ring)}
  table.meta td.k{width:25%} .right{text-align:right} .pos{color:#10b981}.neg{color:#f43f5e}
  @media (max-width:900px){ .row{grid-template-columns:1fr}.cards{grid-template-columns:repeat(2,1fr)} }
  `;
  const fmt = (n)=> (+n).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
  const sign = (n)=> n>=0?'pos':'neg';

  // running pnl
  const oneR = stats.sim.oneR;
  let runR = 0, runP = 0, runEq = stats.sim.base;

  const header = `
    <h1 style="margin:0 0 6px">${projectName}</h1>
    <div style="color:#94a3b8">Rentang: ${stats.range.min||'-'} — ${stats.range.max||'-'} • Dibuat: ${createdAt}</div>
    <div class="cards">
      <div class="card"><div class="k">Transaksi</div><div class="v">${stats.total}</div></div>
      <div class="card"><div class="k">Total R (Net)</div><div class="v ${sign(stats.rsumTotal)}">${stats.rsumTotal}</div></div>
      <div class="card"><div class="k">1R (USD)</div><div class="v">$${fmt(stats.sim.oneR)}</div></div>
      <div class="card"><div class="k">P/L (USD)</div><div class="v ${sign(stats.sim.pnl)}">$${fmt(stats.sim.pnl)}</div></div>
      <div class="card"><div class="k">Equity</div><div class="v">$${fmt(stats.sim.equity)}</div></div>
    </div>
  `;

  const body = (trades||[]).map(t=>{
    const sym = normalizeSymbol(t.symbol);
    const prec = precisionForSymbol(sym);
    const entry = +t.entry_price || 0;
    const sl    = +t.stop_loss || 0;
    const d     = Math.abs(entry - sl);
    const tp1   = t.side==='LONG'? entry+d   : entry-d;
    const tp2   = t.side==='LONG'? entry+2*d : entry-2*d;
    const tp3   = t.side==='LONG'? entry+3*d : entry-3*d;
    const [r1,r2,r3] = rByResult(t.result||'');
    const rnet = netROf(t.result||'');

    // running
    runR += rnet; runP = runR * oneR; runEq = stats.sim.base + runP;

    const price = (v)=> toFixedBy(v, prec);
    const imgBefore = t.img_before_data || '';
    const imgAfter  = t.img_after_data  || '';

    return `
      <div class="block">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="font-weight:700">${sym}</div>
          <span class="badge ${t.side}">${t.side}</span>
          ${t.result ? `<span class="badge ${t.result}">${t.result}</span>` : ''}
          <div style="color:#94a3b8">• ${fmtDT(t.setup_date||'')}</div>
        </div>
        <div class="row">
          <div>
            <div class="thumb">${imgBefore ? `<img src="${imgBefore}" alt="Sebelum">` : `<svg width="100%" height="100%" viewBox="0 0 600 240"><path d="M20,90 L140,130 L280,60 L420,170 L580,110" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/></svg>`}</div>
            <div style="color:#94a3b8;font-size:12px;margin-top:6px">Sebelum</div>
          </div>
          <div>
            <div class="thumb">${imgAfter ? `<img src="${imgAfter}" alt="Sesudah">` : `<svg width="100%" height="100%" viewBox="0 0 600 240"><path d="M20,140 L210,150 L360,160 L580,110" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/></svg>`}</div>
            <div style="color:#94a3b8;font-size:12px;margin-top:6px">Sesudah</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-top:12px">
          <div style="flex:1">
            <table class="meta">
              <tr><td class="k">Entry</td><td class="right">${price(entry)}</td><td class="k">TP1</td><td class="right">${price(tp1)}</td><td class="k">R1</td><td class="right ${r1===0?'':(r1>0?'pos':'neg')}">${r1}</td></tr>
              <tr><td class="k">Stop Loss</td><td class="right">${price(sl)}</td><td class="k">TP2</td><td class="right">${price(tp2)}</td><td class="k">R2</td><td class="right ${r2===0?'':(r2>0?'pos':'neg')}">${r2}</td></tr>
              <tr><td class="k">Δ (Entry–SL)</td><td class="right">${price(d)}</td><td class="k">TP3</td><td class="right">${price(tp3)}</td><td class="k">R3</td><td class="right ${r3===0?'':(r3>0?'pos':'neg')}">${r3}</td></tr>
              <tr><td class="k">R (Net)</td><td class="right ${sign(rnet)}">${rnet}</td><td class="k">Equity (sim)</td><td class="right">$${fmt(runEq)}</td><td class="k">P/L (sim)</td><td class="right ${sign(runP)}">${runP>=0?'+':''}$${fmt(runP)}</td></tr>
            </table>
          </div>
          <div style="flex:1">
            <div style="background:#0c172a;border:1px solid var(--ring);border-radius:8px;padding:10px 12px;min-height:120px">
              <div class="k" style="margin-bottom:6px">Evaluasi</div>
              <div>${(t.note||'—').replace(/\n/g,'<br>')}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${projectName} — Presentasi</title><style>${css}</style></head><body><div class="wrap">
    ${header}
    ${body}
  </div></body></html>`;
}

exportDeckBtn?.addEventListener('click', ()=>{
  try{
    const trades = load();
    const { name } = getActiveProject();
    const projectName = name || 'Jurnal Aktif';
    const stats = computeStats(trades);
    const html  = buildPresentationHTML({ projectName, createdAt:new Date().toLocaleString('id-ID'), trades, stats });
    const fname = `rr-presentasi-${slugify(projectName)}.html`;
    downloadTextFile(fname, html, 'text/html');
  }catch(e){ console.error(e); alert('Export Presentasi gagal.'); }
});

/* ====== Gambar & Lightbox (minimal) ====== */
const MAX_IMG_BYTES = 3 * 1024 * 1024;
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve('');
    if(file.size > MAX_IMG_BYTES){ alert('Gambar terlalu besar (>~3MB).'); return resolve(''); }
    const fr = new FileReader(); fr.onload = ()=>resolve(fr.result); fr.onerror = reject; fr.readAsDataURL(file);
  });
}
function setImagePreview(kind, base64){
  const set = (dataEl, imgEl, clearBtn, viewBtn) => {
    if (base64){
      dataEl.value = base64; imgEl.src = base64; imgEl.classList.remove('hidden');
      clearBtn.classList.remove('hidden'); viewBtn.classList.remove('hidden');
    } else {
      dataEl.value = ''; imgEl.src = ''; imgEl.classList.add('hidden');
      clearBtn.classList.add('hidden'); viewBtn.classList.add('hidden');
    }
  };
  if(kind==='before'){
    set(editImgBeforeData, editImgBeforePreview, btnClearImgBefore, btnViewImgBefore);
  }else{
    set(editImgAfterData, editImgAfterPreview, btnClearImgAfter, btnViewImgAfter);
  }
}
async function handlePickFile(inputEl, kind){
  const file = inputEl.files?.[0]; if(!file) return;
  const b64  = await fileToBase64(file);
  if (b64) setImagePreview(kind, b64);
  inputEl.value = '';
}
function openLightbox(src){ if(!src) return; imgViewerImg.src = src; imgViewer.classList.remove('hidden'); imgViewer.classList.add('flex'); }
function closeLightbox(){ imgViewer.classList.add('hidden'); imgViewer.classList.remove('flex'); imgViewerImg.src=''; }

editImgBefore?.addEventListener('change', ()=> handlePickFile(editImgBefore,'before'));
editImgAfter ?.addEventListener('change', ()=> handlePickFile(editImgAfter,'after'));
btnClearImgBefore?.addEventListener('click', ()=> setImagePreview('before',''));
btnClearImgAfter ?.addEventListener('click', ()=> setImagePreview('after',''));
btnViewImgBefore ?.addEventListener('click', ()=> openLightbox(editImgBeforeData.value));
btnViewImgAfter  ?.addEventListener('click', ()=> openLightbox(editImgAfterData.value));
imgViewerClose   ?.addEventListener('click', closeLightbox);
imgViewer        ?.addEventListener('click', (e)=>{ if(e.target===imgViewer) closeLightbox(); });

/* ===== URL Params (opsional) ===== */
(function applyURLParams(){
  if (!window.URLSearchParams || !form) return;
  const q = new URLSearchParams(location.search);
  const set = (name, conv=v=>v) => { if(q.has(name) && form[name]!==undefined) form[name].value = conv(q.get(name)); };
  set('symbol', v=>v||''); set('side', v=>(v==='SHORT'?'SHORT':'LONG'));
  set('setup_date', v=>v||''); set('entry_price', v=>v||''); set('stop_loss', v=>v||''); set('note', v=>v||'');
})();

/* ===== Init ===== */
(function init(){
  ensureSymbolDropdownForAdd();
  ensureSymbolDropdownForEdit();

  const s = loadSettings();
  if(baseInput) baseInput.value = (s.base ?? '');
  if(riskInput) riskInput.value = (s.risk ?? '');
  baseInput?.addEventListener('input', ()=> calcSim());
  riskInput?.addEventListener('input', ()=> calcSim());

  applyPriceFormatToAddForm();
  refresh();
  calcSim();

  openProjectsBtn?.addEventListener('click', openProjects);
  closeProjects?.addEventListener('click', closeProjectsModal);
})();
