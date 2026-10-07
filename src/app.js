(function () {
  'use strict';

  /* ---------- Letters and tables ----------
     Letter indices: 0 = space, 1-22 = א..ת, 23-27 = ך ם ן ף ץ  */
  const HEB = ' אבגדהוזחטיכלמנסעפצקרשתךםןףץ';
  const IDX = new Map();
  for (let i = 1; i < HEB.length; i++) IDX.set(HEB[i], i);
  const SOFIT_BASE = { 23: 11, 24: 13, 25: 14, 26: 17, 27: 18 };
  const base = (v) => SOFIT_BASE[v] || v;

  const ATBASH = [0, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const ALBAM = [0, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const GEM = {
    abs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 20, 40, 50, 80, 90],
    ord: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 11, 13, 14, 17, 18],
    red: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 2, 4, 5, 8, 9]
  };
  const GEM_SOFIT = {
    abs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    ord: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    red: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  };
  // Spelled-out letter names; the first option for each letter is the default.
  const MILUI = [null,
    [[1, 12, 26]],
    [[2, 10, 22], [2, 22]],
    [[3, 10, 13, 12], [3, 13, 12]],
    [[4, 12, 22], [4, 12, 10, 22]],
    [[5, 1], [5, 10], [5, 5]],
    [[6, 6], [6, 10, 6], [6, 1, 6]],
    [[7, 10, 25]],
    [[8, 10, 22], [8, 22]],
    [[9, 10, 22], [9, 22]],
    [[10, 6, 4]],
    [[11, 26]],
    [[12, 13, 4]],
    [[13, 24]],
    [[14, 6, 25]],
    [[15, 13, 23]],
    [[16, 10, 25]],
    [[17, 1], [17, 10], [17, 5]],
    [[18, 4, 10], [18, 4, 10, 19]],
    [[19, 6, 26]],
    [[20, 10, 21], [20, 21]],
    [[21, 25], [21, 10, 25]],
    [[22, 6], [22, 10, 6], [22, 1, 6]]
  ];

  const BOOKS = [
    ['בראשית', 'Bereishit', 'Genesis'], ['שמות', 'Shemot', 'Exodus'], ['ויקרא', 'Vayikra', 'Leviticus'],
    ['במדבר', 'Bamidbar', 'Numbers'], ['דברים', 'Devarim', 'Deuteronomy'],
    ['יהושע', 'Yehoshua', 'Joshua'], ['שופטים', 'Shoftim', 'Judges'], ['שמואל א', 'Shmuel I', 'I_Samuel'],
    ['שמואל ב', 'Shmuel II', 'II_Samuel'], ['מלכים א', 'Melachim I', 'I_Kings'], ['מלכים ב', 'Melachim II', 'II_Kings'],
    ['ישעיהו', 'Yeshayahu', 'Isaiah'], ['ירמיהו', 'Yirmiyahu', 'Jeremiah'], ['יחזקאל', 'Yechezkel', 'Ezekiel'],
    ['הושע', 'Hoshea', 'Hosea'], ['יואל', 'Yoel', 'Joel'], ['עמוס', 'Amos', 'Amos'], ['עובדיה', 'Ovadiah', 'Obadiah'],
    ['יונה', 'Yonah', 'Jonah'], ['מיכה', 'Michah', 'Micah'], ['נחום', 'Nachum', 'Nahum'], ['חבקוק', 'Chavakuk', 'Habakkuk'],
    ['צפניה', 'Tzefaniah', 'Zephaniah'], ['חגי', 'Chaggai', 'Haggai'], ['זכריה', 'Zechariah', 'Zechariah'],
    ['מלאכי', 'Malachi', 'Malachi'],
    ['תהלים', 'Tehillim', 'Psalms'], ['משלי', 'Mishlei', 'Proverbs'], ['איוב', 'Iyov', 'Job'],
    ['שיר השירים', 'Shir HaShirim', 'Song_of_Songs'], ['רות', 'Ruth', 'Ruth'], ['איכה', 'Eichah', 'Lamentations'],
    ['קהלת', 'Kohelet', 'Ecclesiastes'], ['אסתר', 'Esther', 'Esther'], ['דניאל', 'Daniel', 'Daniel'],
    ['עזרא', 'Ezra', 'Ezra'], ['נחמיה', 'Nechemiah', 'Nehemiah'], ['דברי הימים א', 'Divrei HaYamim I', 'I_Chronicles'],
    ['דברי הימים ב', 'Divrei HaYamim II', 'II_Chronicles']
  ];
  const SECTIONS = [['Torah', 'תורה', 0, 5], ['Nevi’im', 'נביאים', 5, 26], ['Ketuvim', 'כתובים', 26, 39]];

  // English keys typed with an English OS layout can be turned into Hebrew. Letters that already arrive
  // as Hebrew (a native Hebrew OS layout) are never touched.
  const LAYOUTS = {
    // Israeli standard (SI-1452): the letters printed on Israeli keyboards.
    il: { e: 'ק', r: 'ר', t: 'א', y: 'ט', u: 'ו', i: 'ן', o: 'ם', p: 'פ', a: 'ש', s: 'ד', d: 'ג', f: 'כ', g: 'ע',
      h: 'י', j: 'ח', k: 'ל', l: 'ך', ';': 'ף', z: 'ז', x: 'ס', c: 'ב', v: 'ה', b: 'נ', n: 'מ', m: 'צ', ',': 'ת', '.': 'ץ' },
    // Phonetic (QWERTY): letters by sound; Shift gives the final forms.
    ph: { a: 'א', b: 'ב', g: 'ג', d: 'ד', h: 'ה', v: 'ו', u: 'ו', o: 'ו', z: 'ז', j: 'ח', x: 'ח', t: 'ט', y: 'י', i: 'י',
      k: 'כ', c: 'כ', l: 'ל', m: 'מ', n: 'נ', s: 'ס', e: 'ע', p: 'פ', f: 'פ', w: 'ש', q: 'ק', r: 'ר',
      K: 'ך', C: 'ך', M: 'ם', N: 'ן', P: 'ף', F: 'ף', X: 'ץ', T: 'ת' }
  };
  const LAYOUT_CHARS = { il: /[a-z;,.]/gi, ph: /[a-z]/gi };
  let keymap = 'il';

  const $ = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString('en-US');
  const toText = (arr) => { let s = ''; for (const x of arr) s += HEB[x]; return s; };

  /* ---------- Substitutions and counting ---------- */
  function miluiOnce(vals, sel) {
    const out = [];
    for (const v of vals) {
      if (v === 0) out.push(0);
      else for (const x of sel[base(v)]) out.push(x);
      out.push(0); // a space between spelled-out letters
    }
    return out;
  }
  function applyMilui(vals, o) {
    let r = miluiOnce(vals, o.sel);
    if (o.milui === 2) r = miluiOnce(r, o.sel);
    return r;
  }
  function substitute(arr, o) {
    let v = arr;
    if (o.milui && o.mfirst) v = applyMilui(v, o);
    if (o.alpha !== 'none') {
      const T = o.alpha === 'atbash' ? ATBASH : ALBAM;
      v = v.map((x) => T[base(x)]);
    }
    if (o.milui && !o.mfirst) v = applyMilui(v, o);
    return v;
  }
  function gematria(arr, o) {
    const T = (o.sofit ? GEM_SOFIT : GEM)[o.method];
    let s = 0;
    for (const x of arr) s += T[x];
    return s;
  }
  const isPlain = (o) => o.alpha === 'none' && !o.milui;
  const keyOf = (arr) => { let s = ''; for (const x of arr) s += String.fromCharCode(64 + x); return s; };

  function parseQuery(str) {
    const out = [];
    let gap = false;
    for (const ch of str.replace(/[־\-\s]+/g, ' ')) {
      if (ch === ' ') { if (out.length) gap = true; continue; }
      const i = IDX.get(ch);
      if (i) { if (gap) { out.push(0); gap = false; } out.push(i); }
    }
    return out;
  }

  /* ---------- Tanach data ---------- */
  const words = [];      // word id -> Uint8Array of letter indices
  const wordText = [];   // word id -> string
  const verses = [];     // { b, c, v, w: Int32Array, alt: Int32Array|null }
  const bookRange = [];  // [first verse index, end]

  function loadData() {
    const raw = $('tanach-data').textContent;
    const ids = new Map();
    const encode = (text) => {
      const parts = text.split(' ');
      const out = new Int32Array(parts.length);
      for (let i = 0; i < parts.length; i++) {
        const w = parts[i];
        let id = ids.get(w);
        if (id === undefined) {
          id = words.length; ids.set(w, id); wordText.push(w);
          const a = new Uint8Array(w.length);
          for (let j = 0; j < w.length; j++) a[j] = IDX.get(w[j]);
          words.push(a);
        }
        out[i] = id;
      }
      return out;
    };
    let b = -1, refs = null;
    for (const line of raw.split('\n')) {
      if (!line) continue;
      const sp = line.indexOf(' ');
      if (line[0] === '@') {
        if (b >= 0) bookRange[b][1] = verses.length;
        b = +line.slice(1); bookRange[b] = [verses.length, 0]; refs = new Map();
      } else if (line[0] === '!') {
        verses[refs.get(line.slice(1, sp))].alt = encode(line.slice(sp + 1));
      } else {
        const ref = line.slice(0, sp), k = ref.indexOf(':');
        refs.set(ref, verses.length);
        verses.push({ b, c: +ref.slice(0, k), v: +ref.slice(k + 1), w: encode(line.slice(sp + 1)), alt: null });
      }
    }
    bookRange[b][1] = verses.length;
  }

  /* ---------- Nikud (parsed the first time it is shown) ----------
     Same line order as the plain text. Tokens are separated by spaces; a token ending in a maqaf joins
     the next word, and "ketiv|qere" carries the read form (spaces inside it written as "_"). */
  let nikud = null, nikudAlt = null;
  function loadNikud() {
    if (nikud) return;
    nikud = new Array(verses.length); nikudAlt = new Map();
    let vi = 0, refs = null;
    for (const line of $('nikud-data').textContent.split('\n')) {
      if (!line) continue;
      const sp = line.indexOf(' ');
      if (line[0] === '@') refs = new Map();
      else if (line[0] === '!') nikudAlt.set(refs.get(line.slice(1, sp)), line.slice(sp + 1));
      else { refs.set(line.slice(0, sp), vi); nikud[vi++] = line.slice(sp + 1); }
    }
    if (vi !== verses.length) throw new Error('nikud text does not line up with the verses');
  }
  function nikudWord(t) {
    const bar = t.indexOf('|');
    return bar < 0 ? t : t.slice(0, bar) + `<span class="qere">[${t.slice(bar + 1).replace(/_/g, ' ')}]</span>`;
  }

  /* ---------- Options UI ---------- */
  function optionPanel(p) {
    const r = (name, val, label, checked) =>
      `<label><input type="radio" name="${p}-${name}" id="${p}-${name}-${val}" value="${val}"${checked ? ' checked' : ''}> ${label}</label>`;
    let milui = '';
    for (let i = 1; i <= 22; i++) {
      milui += `<div><span class="l">${HEB[i]}</span>`;
      MILUI[i].forEach((opt, j) => {
        milui += `<label><input type="radio" name="${p}-ml-${i}" id="${p}-ml-${i}-${j}" value="${j}"${j ? '' : ' checked'}>${toText(opt)}</label>`;
      });
      milui += '</div>';
    }
    return `
      <div class="field"><span>Alphabet</span><div class="radios">
        ${r('alpha', 'none', 'None', true)}${r('alpha', 'atbash', 'Atbash <span lang="he">את״בש</span>')}${r('alpha', 'albam', 'Albam <span lang="he">אל״בם</span>')}
      </div></div>
      <div class="field"><span>Gematria</span><div class="radios">
        ${r('method', 'abs', 'Absolute', true)}${r('method', 'ord', 'Ordinal')}${r('method', 'red', 'Reduced')}
        <label class="check"><input type="checkbox" id="${p}-sofit"> Final letters ך–ץ as 500–900</label>
      </div></div>
      <div class="field"><span>Milui</span><div class="radios">
        ${r('milui', '0', 'None', true)}${r('milui', '1', 'Milui')}${r('milui', '2', 'Milui of milui')}
        <label class="check"><input type="checkbox" id="${p}-mfirst"> Milui before alphabet swap</label>
      </div></div>
      <div class="field"><span></span><div>
        <button class="linkbtn" type="button" id="${p}-mlToggle" aria-expanded="false">Choose letter spellings</button>
        <div class="milui" id="${p}-ml" hidden>${milui}</div>
      </div></div>`;
  }
  function readOpts(p) {
    const val = (name) => document.querySelector(`input[name="${p}-${name}"]:checked`).value;
    const sel = [null];
    for (let i = 1; i <= 22; i++) sel.push(MILUI[i][+val('ml-' + i)]);
    return { alpha: val('alpha'), method: val('method'), sofit: $(p + '-sofit').checked, milui: +val('milui'), mfirst: $(p + '-mfirst').checked, sel };
  }
  function describeOpts(o) {
    const parts = [];
    if (o.alpha !== 'none') parts.push(o.alpha === 'atbash' ? 'Atbash' : 'Albam');
    if (o.method !== 'abs') parts.push(o.method === 'ord' ? 'Ordinal' : 'Reduced');
    if (o.sofit) parts.push('final letters 500–900');
    if (o.milui) parts.push(o.milui === 2 ? 'milui of milui' : 'milui');
    return parts.join(', ');
  }

  function buildBooks() {
    let html = '';
    for (const [en, he, a, z] of SECTIONS) {
      html += `<fieldset><legend>${en} <span lang="he" style="font-family:var(--font-he);font-weight:400;color:var(--muted)">${he}</span>
        <button class="linkbtn" type="button" data-sec="${a}-${z}">Toggle</button></legend><div class="booklist">`;
      for (let i = a; i < z; i++) {
        html += `<label><input type="checkbox" id="bk-${i}" checked> ${BOOKS[i][1]}<span class="he" lang="he">${BOOKS[i][0]}</span></label>`;
      }
      html += '</div></fieldset>';
    }
    $('books').innerHTML = html;
  }
  const scopeAll = () => $('scope-all').checked;
  function selectedBooks() {
    return BOOKS.map((_, i) => scopeAll() || $('bk-' + i).checked);
  }

  function buildKeyboard() {
    const order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23, 12, 13, 24, 14, 25, 15, 16, 17, 26, 18, 27, 19, 20, 21, 22];
    let html = '';
    for (const i of order) html += `<button type="button" data-k="${i}" aria-label="${HEB[i]}"><b>${HEB[i]}</b><small>${GEM.abs[i]}</small></button>`;
    html += '<button type="button" class="wide" data-k="space">Space</button><button type="button" class="wide" data-k="back">⌫ Delete</button>';
    $('kbd').innerHTML = html;
  }

  /* ---------- Search ---------- */
  let tableKey = null, wordVals = null, wordKeys = null;
  function prepareTables(o, mode) {
    const key = mode + JSON.stringify(o);
    if (key === tableKey) return;
    if (mode === 'g') {
      wordVals = new Int32Array(words.length);
      for (let i = 0; i < words.length; i++) wordVals[i] = gematria(substitute(words[i], o), o);
    } else {
      wordKeys = new Array(words.length);
      for (let i = 0; i < words.length; i++) wordKeys[i] = keyOf(substitute(words[i], o));
    }
    tableKey = key;
  }

  // Every run of consecutive words inside one verse whose total equals the target
  // (gematria mode), or whose words spell the query exactly (text mode).
  function findMatches(s, target, qKey) {
    prepareTables(s.tnO, s.mode);
    const hv = [], hs = [], he = [];
    const L = qKey.length;
    for (let b = 0; b < BOOKS.length; b++) {
      if (!s.books[b]) continue;
      const [first, end] = bookRange[b];
      for (let vi = first; vi < end; vi++) {
        const vs = verses[vi];
        const w = (s.trad === 'ash' && vs.alt) ? vs.alt : vs.w;
        const n = w.length;
        for (let a = 0; a < n; a++) {
          if (s.mode === 'g') {
            let sum = 0;
            for (let e = a; e < n; e++) {
              sum += wordVals[w[e]];
              if (sum >= target) { if (sum === target) { hv.push(vi); hs.push(a); he.push(e); } break; }
            }
          } else {
            let str = '';
            for (let e = a; e < n; e++) {
              str = e === a ? wordKeys[w[e]] : str + '@' + wordKeys[w[e]];
              if (str.length >= L) { if (str === qKey) { hv.push(vi); hs.push(a); he.push(e); } break; }
            }
          }
        }
      }
    }
    return { hv, hs, he };
  }

  let state = null;

  function currentSettings() {
    return {
      mode: $('mode-t').checked ? 't' : 'g',
      trad: $('trad-alp').checked ? 'alp' : 'ash',
      inO: readOpts('in'),
      tnO: readOpts('tn'),
      books: selectedBooks()
    };
  }

  function search() {
    const raw = $('q').value;
    const s = currentSettings();
    const numeric = s.mode === 'g' && /^\s*\d+\s*$/.test(raw);
    const qIdx = numeric ? [] : parseQuery(raw);
    if (!numeric && !qIdx.length) {
      showMessage('Type a Hebrew word or phrase' + (s.mode === 'g' ? ', or a number,' : '') + ' and press Search.');
      return;
    }
    if (!s.books.some(Boolean)) { showMessage('No books are selected. Choose at least one book under Advanced options.'); return; }
    const t0 = performance.now();
    const qSub = numeric ? [] : substitute(qIdx, s.inO);
    const target = numeric ? parseInt(raw, 10) : gematria(qSub, s.inO);
    if (s.mode === 'g' && target <= 0) { showMessage('That value is 0, so nothing can match. Try a larger number.'); return; }
    const { hv, hs, he } = findMatches(s, target, keyOf(qSub));
    state = { ...s, raw, numeric, qIdx, qSub, target, hv, hs, he, page: 1, ms: performance.now() - t0 };
    render();
  }

  /* ---------- Rendering ---------- */
  function showMessage(msg, err) {
    state = null;
    $('results').innerHTML = `<div class="status${err ? ' err' : ''}">${msg}</div>`;
  }

  function pagerHTML(total, page, last, per, withSize) {
    if (!total) return '';
    return `<div class="pager">
      <button type="button" data-pg="1" ${page <= 1 ? 'disabled' : ''}>First</button>
      <button type="button" data-pg="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Previous</button>
      <span class="pos">Page ${fmt(page)} of ${fmt(last)}</span>
      <button type="button" data-pg="${page + 1}" ${page >= last ? 'disabled' : ''}>Next</button>
      <button type="button" data-pg="${last}" ${page >= last ? 'disabled' : ''}>Last</button>
      ${withSize ? `<label class="pos" for="per">Per page</label><select id="per">${[100, 200, 300, 400, 500].map((n) => `<option${n === per ? ' selected' : ''}>${n}</option>`).join('')}</select>` : ''}
    </div>`;
  }

  let perPage = 100;
  let showNikud = false;
  function render() {
    const st = state;
    if (!st) return;
    const showNums = $('dispNums') ? $('dispNums').checked : false;
    const showSub = $('dispSub') ? $('dispSub').checked : false;
    const total = st.hv.length;
    const last = Math.max(1, Math.ceil(total / perPage));
    st.page = Math.min(Math.max(1, st.page), last);
    const from = (st.page - 1) * perPage, to = Math.min(total, from + perPage);

    let qLabel;
    if (st.numeric) qLabel = `<span class="num">${fmt(st.target)}</span>`;
    else {
      const qText = (showSub && !isPlain(st.inO) ? toText(st.qSub) : toText(st.qIdx)).trim();
      qLabel = `${qText}<span class="num">${st.mode === 'g' ? '= ' : ''}${fmt(st.target)}</span>`;
    }
    const scope = st.books.every(Boolean) ? 'all of Tanach' : `${st.books.filter(Boolean).length} selected books`;
    const desc = [describeOpts(st.inO) && 'input: ' + describeOpts(st.inO), describeOpts(st.tnO) && 'Tanach: ' + describeOpts(st.tnO)].filter(Boolean).join(' · ');
    const anySub = !isPlain(st.inO) || !isPlain(st.tnO);
    const nikudBlocked = showNums || (showSub && !isPlain(st.tnO));
    const useNikud = showNikud && !nikudBlocked;
    if (useNikud) loadNikud();

    let html = `<div class="rhead">
      <div class="summary">
        <div class="q" lang="he">${qLabel}</div>
        <div class="meta">${fmt(total)} ${total === 1 ? 'match' : 'matches'} in ${scope}${total ? ` · showing ${fmt(from + 1)}–${fmt(to)}` : ''} · ${st.ms < 1000 ? Math.max(1, Math.round(st.ms)) + ' ms' : (st.ms / 1000).toFixed(1) + ' s'}${desc ? ' · ' + desc : ''}</div>
      </div>
      <div class="display">
        <label class="check"${nikudBlocked ? ' title="Turn off the other display options to see nikud"' : ''}><input type="checkbox" id="dispNik"${showNikud ? ' checked' : ''}${nikudBlocked ? ' disabled' : ''}> Show nikud</label>
        <label class="check"><input type="checkbox" id="dispNums"${showNums ? ' checked' : ''}> Show each word's value</label>
        ${anySub ? `<label class="check"><input type="checkbox" id="dispSub"${showSub ? ' checked' : ''}> Show substituted letters</label>` : ''}
      </div>
    </div>`;
    html += pagerHTML(total, st.page, last, perPage, true);

    if (!total) {
      html += `<div class="ledger"><div class="empty">No ${st.mode === 'g' ? 'phrase in a single verse adds up to ' + fmt(st.target) : 'exact match for this phrase'}${st.books.every(Boolean) ? '' : ' in the selected books'}.</div></div>`;
    } else {
      const sep = showSub && st.tnO.milui ? '-' : ' ';
      const cache = new Map();
      const wordOut = (id) => {
        let r = cache.get(id);
        if (r === undefined) {
          const sub = (showNums || showSub) && !isPlain(st.tnO) ? substitute(words[id], st.tnO) : words[id];
          r = showNums ? fmt(gematria(sub, st.tnO)) : (showSub ? toText(sub).trim() : wordText[id]);
          cache.set(id, r);
        }
        return r;
      };
      html += '<div class="ledger">';
      for (let i = from; i < to; i++) {
        const vs = verses[st.hv[i]], a = st.hs[i], e = st.he[i];
        const w = (st.trad === 'ash' && vs.alt) ? vs.alt : vs.w;
        let text = '';
        if (useNikud) {
          const toks = ((st.trad === 'ash' && vs.alt) ? nikudAlt.get(st.hv[i]) : nikud[st.hv[i]]).split(' ');
          for (let k = 0; k < toks.length; k++) {
            if (k && !toks[k - 1].endsWith('־')) text += ' ';
            if (k === a) text += '<mark>';
            text += nikudWord(toks[k]);
            if (k === e) text += '</mark>';
          }
          text += '׃';
        } else {
          for (let k = 0; k < w.length; k++) {
            if (k) text += sep;
            if (k === a) text += '<mark>';
            text += wordOut(w[k]);
            if (k === e) text += '</mark>';
          }
        }
        const bk = BOOKS[vs.b];
        html += `<article class="hit"><div class="ref"><span class="bk" lang="he">${bk[0]}</span><span class="cv">${bk[1]} ${vs.c}:${vs.v}</span>
          <a href="https://www.sefaria.org/${bk[2]}.${vs.c}.${vs.v}?lang=he" target="_blank" rel="noopener">Open in Sefaria ↗</a></div>
          <div class="verse${showNums ? ' nums' : ''}" lang="he">${text}</div></article>`;
      }
      html += '</div>';
      html += pagerHTML(total, st.page, last, perPage, false);
    }
    $('results').innerHTML = html;
  }

  /* ---------- Live preview ---------- */
  function updateLive() {
    const raw = $('q').value;
    const mode = $('mode-t').checked ? 't' : 'g';
    const live = $('live');
    if (mode === 'g' && /^\s*\d+\s*$/.test(raw)) { live.innerHTML = `Searching for phrases worth <span class="val">${fmt(parseInt(raw, 10))}</span>`; return; }
    const idx = parseQuery(raw);
    if (!idx.length) { live.textContent = ''; return; }
    const o = readOpts('in');
    const sub = substitute(idx, o);
    let html = `Value <span class="val">${fmt(gematria(sub, o))}</span>`;
    const letters = sub.filter((x) => x);
    if (isPlain(o) && letters.length <= 14) {
      const T = (o.sofit ? GEM_SOFIT : GEM)[o.method];
      html += `<span class="sub" lang="he">${letters.map((x) => HEB[x] + ' ' + T[x]).join(' · ')}</span>`;
    } else if (!isPlain(o)) {
      html += `<span class="sub" lang="he">${toText(sub).trim()}</span>`;
    }
    if (mode === 't' && /[כמנפצ](\s|$)/.test(raw.trim() + ' ')) {
      html += '<span>Tip: a word ending in כ מ נ פ צ usually needs its final form (ך ם ן ף ץ) to match.</span>';
    }
    live.innerHTML = html;
  }

  function updateOptState() {
    const s = currentSettings();
    const bits = [s.trad === 'ash' ? 'Ashkenazi/Sephardi text' : 'Aleppo text'];
    bits.push(s.books.every(Boolean) ? 'all books' : s.books.filter(Boolean).length + ' books');
    const i = describeOpts(s.inO), t = describeOpts(s.tnO);
    if (i) bits.push('input: ' + i);
    if (t) bits.push('Tanach: ' + t);
    $('optState').textContent = bits.join(' · ');
    $('books').classList.toggle('disabled', scopeAll());
  }

  /* ---------- Wiring ---------- */
  function runSearch() {
    const btn = $('go');
    btn.disabled = true; btn.textContent = 'Searching…';
    setTimeout(() => {
      try { search(); } catch (err) { showMessage('Something went wrong while searching: ' + err.message, true); }
      btn.disabled = false; btn.textContent = 'Search';
    }, 20);
  }

  function init() {
    $('optInput').insertAdjacentHTML('beforeend', optionPanel('in'));
    $('optTanach').insertAdjacentHTML('beforeend', optionPanel('tn'));
    ['in', 'tn'].forEach((p) => {
      $(p + '-mlToggle').addEventListener('click', (ev) => {
        const box = $(p + '-ml'); box.hidden = !box.hidden;
        ev.currentTarget.setAttribute('aria-expanded', String(!box.hidden));
        ev.currentTarget.textContent = box.hidden ? 'Choose letter spellings' : 'Hide letter spellings';
      });
    });
    buildBooks();
    buildKeyboard();

    const q = $('q');
    q.addEventListener('input', () => {
      const map = LAYOUTS[keymap], re = LAYOUT_CHARS[keymap];
      if (map && !/\d/.test(q.value) && re.test(q.value)) {
        const pos = q.selectionStart;
        q.value = q.value.replace(re, (c) => map[c] || map[c.toLowerCase()] || '');
        try { q.setSelectionRange(pos, pos); } catch (e) { /* not focused */ }
      }
      updateLive();
    });
    const keymapSel = $('keymap');
    try { const k = localStorage.getItem('tgs-keymap'); if (k in LAYOUTS || k === 'off') keymap = k; } catch (err) { /* storage unavailable */ }
    keymapSel.value = keymap;
    keymapSel.addEventListener('change', () => {
      keymap = keymapSel.value;
      try { localStorage.setItem('tgs-keymap', keymap); } catch (err) { /* storage unavailable */ }
    });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !$('go').disabled) runSearch(); });
    $('go').addEventListener('click', runSearch);

    $('kbd').addEventListener('click', (e) => {
      const k = e.target.closest('button');
      if (!k) return;
      const v = k.dataset.k;
      if (v === 'back') q.value = q.value.slice(0, -1);
      else if (v === 'space') q.value += ' ';
      else q.value += HEB[+v];
      updateLive();
    });
    $('kbdToggle').addEventListener('click', (e) => {
      const kb = $('kbd'); kb.hidden = !kb.hidden;
      e.currentTarget.setAttribute('aria-expanded', String(!kb.hidden));
      e.currentTarget.textContent = kb.hidden ? 'Show Hebrew keyboard' : 'Hide Hebrew keyboard';
      if (e.isTrusted) { try { localStorage.setItem('tgs-kbd', kb.hidden ? '0' : '1'); } catch (err) { /* storage unavailable */ } }
    });
    let kbdPref = null;
    try { kbdPref = localStorage.getItem('tgs-kbd'); } catch (err) { /* storage unavailable */ }
    if (kbdPref === '0' || (kbdPref === null && window.matchMedia('(max-width: 640px)').matches)) $('kbdToggle').click();
    try { showNikud = localStorage.getItem('tgs-nikud') === '1'; } catch (err) { /* storage unavailable */ }

    $('selAll').addEventListener('click', () => { BOOKS.forEach((_, i) => { $('bk-' + i).checked = true; }); $('scope-sel').checked = true; onOptions(); });
    $('selNone').addEventListener('click', () => { BOOKS.forEach((_, i) => { $('bk-' + i).checked = false; }); $('scope-sel').checked = true; onOptions(); });
    $('books').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-sec]');
      if (!btn) return;
      const [a, z] = btn.dataset.sec.split('-').map(Number);
      let allOn = true;
      for (let i = a; i < z; i++) if (!$('bk-' + i).checked) allOn = false;
      for (let i = a; i < z; i++) $('bk-' + i).checked = !allOn;
      onOptions();
    });

    // Any setting that changes the search re-runs it; display toggles only re-render.
    function onOptions() { updateOptState(); updateLive(); if (state || $('q').value.trim()) runSearch(); }
    document.querySelector('.optbody').addEventListener('change', onOptions);
    document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener('change', onOptions));

    $('results').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-pg]');
      if (!b || !state) return;
      state.page = +b.dataset.pg;
      render();
      $('results').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    $('results').addEventListener('change', (e) => {
      if (e.target.id === 'per') { perPage = +e.target.value; if (state) state.page = 1; render(); }
      else if (e.target.id === 'dispNums' || e.target.id === 'dispSub') render();
      else if (e.target.id === 'dispNik') {
        showNikud = e.target.checked;
        try { localStorage.setItem('tgs-nikud', showNikud ? '1' : '0'); } catch (err) { /* storage unavailable */ }
        render();
      }
    });

    const toTop = $('toTop'), consoleEl = document.querySelector('.console');
    const onScroll = () => { toTop.hidden = consoleEl.getBoundingClientRect().bottom > 0; };
    window.addEventListener('scroll', onScroll, { passive: true });
    toTop.addEventListener('click', () => { window.scrollTo(0, 0); q.focus({ preventScroll: true }); q.select(); });

    $('status').textContent = 'Preparing the Tanach text…';
    setTimeout(() => {
      try {
        loadData();
        $('go').disabled = false;
        updateOptState();
        q.value = 'תורה';
        updateLive();
        search();
      } catch (err) {
        showMessage('The Tanach text could not be prepared: ' + err.message, true);
      }
    }, 10);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Exposed for testing.
  window.__gematria = { loadNikud, parseQuery, substitute, gematria, keyOf, findMatches, readOpts, verses, words, wordText, bookRange, MILUI };
})();
