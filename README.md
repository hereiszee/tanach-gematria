# Tanach Gematria Search

Search all of Tanach by gematria or by exact text. Type a Hebrew word, phrase, or number, and the tool lists every run of consecutive words inside a single verse whose gematria equals it. Exact-text mode finds whole-word matches of a phrase.

This is a rebuild of the Tanach & Gematria Search Tool by David Komer at thetrugmans.com. It uses the same search algorithm and gives the same results, with these changes:

- **It doesn't get stuck.** The whole Tanach is embedded in one HTML file (no loading 39 files one after another), and word values are computed once per search instead of again for every word pair. Searches take milliseconds, including milui of milui across all of Tanach.
- **Corrected text.** The original site's data was checked word by word against two independent sources: *Miqra according to the Masorah* (Aleppo Codex / Breuer) and the Leningrad Codex (UXLC). 11 typos where both manuscripts disagree with the old data were fixed (for example Daniel 3:25, 4:7 and 7:15 בגו → בגוא, Iyov 6:26 נואש → נאש, and Kohelet 6:10, where the old data had the qere instead of the written text).
- **Corrected verse numbers.** The old data merged Tehillim 108:1–2 (both labeled 108:3), was off by one or two verses in Shemot 20, Devarim 5 and Yehoshua 21, and used Christian numbering in Shmuel I 23–24 and Yirmiyahu 30–31. All verse numbers now follow standard Hebrew Bibles, so the Sefaria links match.
- **Text tradition option.** Choose the Ashkenazi/Sephardi Sefer Torah (the default, with the standard 304,805 Torah letters) or the Aleppo Codex / Breuer text that the original site used. They differ in 10 words.
- **Nikud.** Turn on "Show nikud" above the results to read each verse with vowels. Where the written and read forms differ (ketiv/qere), the read form appears in brackets. The choice is remembered.
- **Extras:** search by number, live gematria preview as you type, per-word values, and a Sefaria link for every result.

## Options (same as the original)

| Option | Choices |
| --- | --- |
| Search type | Gematria, exact text |
| Alphabet substitution | None, Atbash, Albam |
| Gematria method | Absolute, ordinal, reduced; final letters ך–ץ as 500–900 |
| Milui | None, milui, milui of milui; before or after alphabet substitution; choice of spelling per letter |
| Where to search | All of Tanach or selected books |

Input and Tanach substitutions are set separately, as on the original site.

## Files

- `index.html` is the complete app (GitHub Pages serves this).
- `src/` has the page markup, styles and script.
- `data/nikud.txt` has the same verses with nikud, aligned word for word (a token ending in a maqaf joins the next word; `ketiv|qere` marks read forms).
- `data/tanach.txt` has the text: one verse per line as `chapter:verse words…`, books introduced by `@index`, and Ashkenazi/Sephardi variants as `!chapter:verse words…`.
- `build.py` assembles `index.html` (and `artifact.html`) from `src/` and `data/`.

## Text sources

Written text (ketiv) is used for searching. Nikud is from Miqra according to the Masorah. Base text: the Aleppo Codex tradition as edited by Mordechai Breuer, verified against [Miqra according to the Masorah](https://www.sefaria.org/texts/Tanakh) (CC BY-SA 4.0) and the [Unicode/XML Leningrad Codex](https://tanach.us) (public domain).
