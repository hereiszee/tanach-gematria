// Runs the search engine from src/app.js under node with a stub document. Run with: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = readFileSync(join(root, 'data/tanach.txt'), 'utf8');
const nikudText = readFileSync(join(root, 'data/nikud.txt'), 'utf8');

// readyState 'loading' makes the script wait for DOMContentLoaded, which never comes, so init() does not run.
globalThis.window = globalThis;
globalThis.document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById: (id) => (id === 'tanach-data' ? { textContent: data } : null),
};
new Function(readFileSync(join(root, 'src/app.js'), 'utf8'))();
const g = window.__gematria;
g.loadData();

const defaults = () => ({ alpha: 'none', method: 'abs', sofit: false, milui: 0, mfirst: false, sel: [null, ...g.MILUI.slice(1).map((o) => o[0])] });
const allBooks = g.BOOKS.map(() => true);
const count = (mode, raw, inO = defaults(), tnO = defaults(), trad = 'ash') => {
  const q = g.parseQuery(raw);
  const qSub = g.substitute(q, inO);
  const target = mode === 'g' ? g.gematria(qSub, inO) : 0;
  return g.findMatches({ mode, trad, inO, tnO, books: allBooks }, target, g.keyOf(qSub)).hv.length;
};
const value = (raw, o = defaults()) => g.gematria(g.substitute(g.parseQuery(raw), o), o);

test('data loads with 39 books and 23,204 verses', () => {
  assert.equal(g.bookRange.length, 39);
  assert.equal(g.verses.length, 23204);
  assert.equal(g.verses.filter((v) => v.alt).length, 10);
});

test('nikud text lines up with the verses', () => {
  assert.doesNotThrow(() => g.parseNikud(nikudText));
});

test('gematria values', () => {
  assert.equal(value('תורה'), 611);
  assert.equal(value('אלהים'), 86);
  assert.equal(value('בראשית'), 913);
  assert.equal(value('א', { ...defaults(), alpha: 'atbash' }), 400);   // א → ת
  assert.equal(value('א', { ...defaults(), alpha: 'albam' }), 30);     // א → ל
  assert.equal(value('א', { ...defaults(), milui: 1 }), 111);           // אלף
  assert.equal(value('ש', { ...defaults(), milui: 1 }), 360);           // שין is the default spelling
  assert.equal(value('ץ', { ...defaults(), sofit: true }), 900);
  assert.equal(value('ץ', { ...defaults(), method: 'ord' }), 18);
});

test('Torah letter count under the Ashkenazi/Sephardi text is 304,805', () => {
  let letters = 0;
  for (let b = 0; b < 5; b++) {
    const [first, end] = g.bookRange[b];
    for (let vi = first; vi < end; vi++) {
      const vs = g.verses[vi];
      for (const id of vs.alt || vs.w) letters += g.words[id].length;
    }
  }
  assert.equal(letters, 304805);
});

test('gematria search finds every run of words with the target value', () => {
  assert.equal(count('g', 'תורה'), 1083);
  assert.ok(count('g', 'אלהים') > 0);
});

test('exact text search', () => {
  assert.equal(count('t', 'בראשית ברא'), 1);
  assert.equal(count('t', 'ברא אלהים'), 4);
  assert.equal(count('t', 'את'), 7363);
});

test('exact text search with milui matches multi-word phrases', () => {
  const plain = count('t', 'את יהוה');
  assert.ok(plain > 0);
  const milui = { ...defaults(), milui: 1 };
  const milui2 = { ...defaults(), milui: 2 };
  assert.equal(count('t', 'את יהוה', milui, milui), plain);
  assert.equal(count('t', 'את יהוה', milui2, milui2), plain);
  // A plain query spelled like a milui'd word matches the milui'd Tanach.
  assert.equal(count('t', 'יוד דלת', defaults(), milui), count('t', 'יד'));
});

test('query keys use single separators with none at the ends', () => {
  assert.equal(g.keyOf([0, 1, 0, 0, 2, 0]), 'A@B');
  assert.equal(g.keyOf([1, 2]), 'AB');
});

test('parseQuery keeps only Hebrew letters and treats maqaf and hyphens as spaces', () => {
  assert.deepEqual(g.parseQuery('  על־פני  '), [16, 12, 0, 17, 14, 10]);
  assert.deepEqual(g.parseQuery('<img src=x>'), []);
  assert.deepEqual(g.parseQuery('בְּרֵאשִׁית'), [2, 20, 1, 21, 10, 22]);
});
