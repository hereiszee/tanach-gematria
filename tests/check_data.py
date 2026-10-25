"""Invariants of data/tanach.txt and data/nikud.txt. Run with: python3 -I tests/check_data.py"""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
ALPHABET = set(' אבגדהוזחטיכלמנסעפצקרשתךםןףץ')
MARKS = re.compile('[֑-ׇ]')
BOOK_COUNT = 39
VERSE_COUNT = 23204        # Masoretic 23,206 minus Yehoshua 21:36-37, absent from the Aleppo and Leningrad codices
VARIANT_COUNT = 10
TORAH_LETTERS = 304805     # Ashkenazi/Sephardi Sefer Torah


def parse(path):
    books, refs = [], None
    for n, line in enumerate(path.read_text(encoding='utf-8').split('\n'), 1):
        if not line:
            continue
        if line[0] == '@':
            assert int(line[1:]) == len(books), f'{path.name}:{n}: books out of order'
            refs = {}
            books.append((refs, {}))
            continue
        ref, text = line.split(' ', 1)
        if ref[0] == '!':
            assert ref[1:] in refs, f'{path.name}:{n}: variant for unknown verse {ref}'
            books[-1][1][ref[1:]] = text
        else:
            assert ref not in refs, f'{path.name}:{n}: duplicate verse {ref}'
            refs[ref] = text
    return books


def strip(token):
    return MARKS.sub('', token.split('|', 1)[0]).replace('־', '')


def main():
    plain = parse(root / 'data/tanach.txt')
    nikud = parse(root / 'data/nikud.txt')
    assert len(plain) == BOOK_COUNT, f'{len(plain)} books'
    assert sum(len(b[0]) for b in plain) == VERSE_COUNT, f'{sum(len(b[0]) for b in plain)} verses'
    assert sum(len(b[1]) for b in plain) == VARIANT_COUNT, 'variant count'

    for bi, (refs, alts) in enumerate(plain):
        last = (0, 0)
        for ref, text in refs.items():
            c, v = map(int, ref.split(':'))
            assert (c, v) > last, f'book {bi} verse {ref} out of order'
            last = (c, v)
            assert text == text.strip() and '  ' not in text, f'book {bi} {ref}: stray spaces'
            assert set(text) <= ALPHABET, f'book {bi} {ref}: characters outside the alphabet'
        for ref, text in alts.items():
            assert text != refs[ref], f'book {bi} {ref}: variant identical to the base text'
            assert sum(a != b for a, b in zip(text.split(' '), refs[ref].split(' '))) == 1, f'book {bi} {ref}: variant differs in more than one word'

    # The nikud text lines up with the plain text word for word (maqaf-joined tokens stay separate tokens).
    assert len(nikud) == len(plain), 'nikud book count'
    for bi, ((refs, alts), (nrefs, nalts)) in enumerate(zip(plain, nikud)):
        assert list(refs) == list(nrefs) and set(alts) == set(nalts), f'book {bi}: verse lists differ'
        for ref in refs:
            for src, nsrc in ((refs, nrefs), (alts, nalts)):
                if ref not in src:
                    continue
                words = src[ref].split(' ')
                toks = nsrc[ref].split(' ')
                assert len(toks) == len(words), f'book {bi} {ref}: {len(toks)} nikud tokens for {len(words)} words'
                for w, t in zip(words, toks):
                    assert strip(t) == w, f'book {bi} {ref}: {t!r} is not {w!r}'

    letters = 0
    for refs, alts in plain[:5]:
        for ref, text in refs.items():
            letters += len(alts.get(ref, text).replace(' ', ''))
    assert letters == TORAH_LETTERS, f'{letters} Torah letters'

    # Corrections the README promises.
    daniel = plain[34][0]
    assert all('בגוא' in daniel[r] for r in ('3:25', '4:7', '7:15')), 'Daniel בגוא'
    assert 'נאש' in plain[28][0]['6:26'], 'Iyov 6:26'
    assert '108:1' in plain[26][0] and '108:2' in plain[26][0], 'Tehillim 108'
    assert '21:36' not in plain[5][0] and '21:38' in plain[5][0], 'Yehoshua 21'
    print('data ok:', VERSE_COUNT, 'verses,', TORAH_LETTERS, 'Torah letters')


if __name__ == '__main__':
    try:
        main()
    except AssertionError as err:
        sys.exit(f'FAILED: {err}')
