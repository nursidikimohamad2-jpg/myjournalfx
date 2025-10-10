
/* ===== (BARU) — Tambah field URL untuk gambar + Paste global ===== */
function injectUrlBarUnder(areaEl, kind){
  if(!areaEl) return;
  const id = kind==='before' ? 'editImgBeforeUrl' : 'editImgAfterUrl';
  if (document.getElementById(id)) return; // sudah dibuat

  const wrap = document.createElement('div');
  wrap.className = 'mt-2 flex gap-2';
 wrap.innerHTML = `
  <input id="${id}" type="url" 
    placeholder="Tempel link gambar (https://… atau data:image/…)" 
    class="w-full rounded-xl border border-slate-300 bg-white text-slate-900 
           px-3 py-2 text-sm placeholder-slate-500 
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
  <button type="button" 
    class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500">
    Muat
  </button>
`;

  areaEl.insertAdjacentElement('afterend', wrap);

  const input = wrap.querySelector('input');
  const btn   = wrap.querySelector('button');

  const loader = async () => {
    const url = (input.value||'').trim();
    if (!isLikelyImageURL(url)) { alert('Link tidak valid. Pakai URL file gambar langsung.'); return; }
    const b64 = await urlToBase64Smart(url);
    if (b64) setImagePreview(kind, b64);
  };

  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); loader(); }});
  btn.addEventListener('click', loader);

  input.addEventListener('focus', ()=>{ lastImgKind = kind; });
}

// inject URL bar bila ada drop zone
injectUrlBarUnder(dropBefore, 'before');
injectUrlBarUnder(dropAfter,  'after');

// Global paste: jika ada URL gambar di clipboard, muat ke area terakhir yang aktif
window.addEventListener('paste', async (e)=>{
  const t = (e.clipboardData || window.clipboardData)?.getData?.('text') || '';
  if (isLikelyImageURL(t)){
    const b64 = await urlToBase64Smart(t.trim());
    if (b64) setImagePreview(lastImgKind, b64);
  }
});

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
  updateActiveProjectUI();
  calcSim();
