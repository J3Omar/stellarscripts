#!/usr/bin/env python3
"""Generate narration cue files (page / sentence / word timings) for the book.

Runs offline, once per audio change. Uses PocketSphinx forced alignment: the
recogniser is told the exact narration text, so the output always uses OUR
words (from narration/<device>.txt), never a transcript's spelling.

Usage (from the repo root):
    python3 -m venv .venv && .venv/bin/pip install pocketsphinx
    .venv/bin/python scripts/align_cues.py            # all devices
    .venv/bin/python scripts/align_cues.py spirit     # one device

Inputs : scripts/cue-plan.json, narration/<device>.txt, assets/audio/<device>.mp3
Outputs: assets/cues/<device>.json  (+ a timing table printed to the terminal)
Needs  : ffmpeg on PATH.
"""
import json, os, re, subprocess, sys
from pocketsphinx import Decoder, get_model_path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 100  # PocketSphinx frame rate (frames per second)
LEAD = 0.3  # page flips start this many seconds before the page's first word

# Hand-written pronunciations (CMU ARPAbet) for words missing from the bundled dictionary.
EXTRA_WORDS = {
    'gusev': ['G UW S EH V', 'G UW S EH F'],
    'whirlwinds': ['W ER L W IH N D Z'],
    'meridiani': ['M ER IH D IY AA N IY', 'M EH R IH D IY AA N IY'],
    'planum': ['P L EY N AH M', 'P L AA N AH M'],
    'pulsars': ['P AH L S AA R Z'],
    'aquilae': ['AE K W IH L IY', 'AA K W IH L AY', 'AH K W IH L EY'],
    'oceanus': ['OW SH IY AH N AH S', 'OW S IY AA N AH S', 'OW SH IY AE N AH S'],
    'procellarum': ['P R OW S EH L AA R AH M', 'P R AA S AH L EH R AH M'],
}

ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'zero ten twenty thirty forty fifty sixty seventy eighty ninety'.split()
ORD = {1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 19: 'nineteenth'}
MONTHS = {'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'}


def say_int(n):
    if n < 20: return [ONES[n]]
    if n < 100: return [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])
    if n < 1000: return [ONES[n // 100], 'hundred'] + (say_int(n % 100) if n % 100 else [])
    return say_int(n // 1000) + ['thousand'] + (say_int(n % 1000) if n % 1000 else [])


def say_year(n):
    if 2000 <= n < 2010: return ['two', 'thousand'] + ([ONES[n % 10]] if n % 10 else [])
    return say_int(n // 100) + (say_int(n % 100) if n % 100 >= 10 else ['oh'] + say_int(n % 100) if n % 100 else ['hundred'])


def spoken(word, prev):
    """Display word -> list of dictionary tokens the narrator actually says."""
    w = word.lower().strip('.,;:!?"()')
    digits = w.replace(',', '')
    if digits.isdigit():
        n = int(digits)
        if prev in MONTHS and n <= 31: return [ORD.get(n, ' '.join(say_int(n)))]
        if 1900 <= n <= 2099 and ',' not in w: return say_year(n)
        return say_int(n)
    if w.endswith("s's"): w = w[:-2]  # "Mars's" -> "mars" (closest dictionary entry)
    return [t for t in re.split(r"[-\s]+", w) if t]


def split_sentences(text):
    out = []
    for para in re.split(r'\n\s*\n', text.strip()):
        para = ' '.join(para.split())
        out += [s for s in re.split(r'(?<=[.!?])\s+(?=[A-Z0-9])', para) if s]
    return out


def norm(s):
    return re.sub(r"[^a-z0-9 ]", '', s.lower().replace('-', ' ')).split()


def align(device, plan):
    text = open(os.path.join(ROOT, 'narration', device + '.txt'), encoding='utf-8').read()
    audio = os.path.join(ROOT, 'assets', 'audio', device + '.mp3')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', audio, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    duration = len(raw) / 2 / 16000

    sentences, tokens = [], []  # tokens: (sentence index, word index, token)
    for si, s in enumerate(split_sentences(text)):
        words = s.split(' ')
        sentences.append(words)
        prev = ''
        for wi, w in enumerate(words):
            for t in spoken(w, prev): tokens.append((si, wi, t))
            prev = w.lower().strip('.,')

    dec = Decoder(samprate=16000, loglevel='FATAL')
    for w, prons in EXTRA_WORDS.items():
        for i, p in enumerate(prons):
            dec.add_word(w if i == 0 else f'{w}({i + 1})', p, i == len(prons) - 1 and True)
    dec.set_align_text(' '.join(t for _, _, t in tokens))
    dec.start_utt(); dec.process_raw(raw, full_utt=True); dec.end_utt()
    segs = [(re.sub(r'\(\d+\)$', '', s.word), s.start_frame / FPS, (s.end_frame + 1) / FPS) for s in dec.seg()
            if s.word not in ('<s>', '</s>', '<sil>', '[NOISE]')]
    if len(segs) != len(tokens):
        raise SystemExit(f'{device}: aligner returned {len(segs)} words for {len(tokens)} tokens (alignment failed)')
    unmatched = [t for (_, _, t), (w, _, _) in zip(tokens, segs) if t != w]

    # Collapse tokens back onto display words.
    times = {}
    for (si, wi, _), (_, a, b) in zip(tokens, segs):
        k = (si, wi)
        times[k] = (min(a, times[k][0]), max(b, times[k][1])) if k in times else (a, b)

    out_sent = []
    for si, words in enumerate(sentences):
        ws = [{'w': w, 'start': round(times[(si, wi)][0], 2), 'end': round(times[(si, wi)][1], 2)} for wi, w in enumerate(words)]
        out_sent.append({'id': f's{si + 1}', 'start': ws[0]['start'], 'end': ws[-1]['end'], 'words': ws})

    # Pages: each plan page names the first words of its first sentence.
    pages, starts = [], []
    for p in plan['pages']:
        key = norm(p['first'])
        idx = next((i for i, s in enumerate(sentences) if norm(' '.join(s))[:len(key)] == key), None)
        if idx is None: raise SystemExit(f'{device}: page {p["id"]} start "{p["first"]}" not found in narration')
        starts.append(idx)
    if starts[0] != 0 or starts != sorted(starts): raise SystemExit(f'{device}: page starts must be increasing and begin at sentence 1')
    for n, (p, si) in enumerate(zip(plan['pages'], starts)):
        last = (starts[n + 1] if n + 1 < len(starts) else len(sentences)) - 1
        start = 0.0 if n == 0 else max(out_sent[si - 1]['end'], out_sent[si]['start'] - LEAD)
        pages.append({'id': p['id'], 'start': round(start, 2), 'firstSentence': si + 1, 'lastSentence': last + 1})
        for s in out_sent[si:last + 1]: s['page'] = p['id']
    for n, p in enumerate(pages): p['end'] = pages[n + 1]['start'] if n + 1 < len(pages) else round(duration, 2)

    # Triggers fire on the start of their anchor word (first match after the page start).
    triggers = []
    for tr in plan.get('triggers', []):
        key = norm(tr['at'])
        hit = None
        for s in out_sent:
            flat = [(norm(w['w']), w) for w in s['words']]
            toks = [(t, w) for ts, w in flat for t in ts]
            for i in range(len(toks) - len(key) + 1):
                if [t for t, _ in toks[i:i + len(key)]] == key and (not tr.get('page') or s['page'] == tr['page']):
                    hit = (s, toks[i][1]); break
            if hit: break
        if not hit: raise SystemExit(f'{device}: trigger anchor "{tr["at"]}" not found')
        triggers.append({'at': tr['at'], 'sentence': hit[0]['id'], 'page': hit[0]['page'], 'time': hit[1]['start'], 'action': tr['action']})

    cue = {'audio': f'assets/audio/{device}.mp3', 'duration': round(duration, 2), 'pages': pages,
           'sentences': out_sent, 'triggers': triggers}
    os.makedirs(os.path.join(ROOT, 'assets', 'cues'), exist_ok=True)
    with open(os.path.join(ROOT, 'assets', 'cues', device + '.json'), 'w', encoding='utf-8') as f:
        json.dump(cue, f, ensure_ascii=False, separators=(',', ':'))

    # Report + sanity checks.
    print(f'\n{device}  (audio {duration:.2f}s, {len(out_sent)} sentences, {len(tokens)} spoken tokens)')
    print(f'  {"page":<16}{"start":>8}{"end":>8}  first words')
    for p in pages:
        s = out_sent[p['firstSentence'] - 1]
        print(f'  {p["id"]:<16}{p["start"]:>8.2f}{p["end"]:>8.2f}  {" ".join(w["w"] for w in s["words"][:6])}')
    for t in triggers: print(f'  trigger {t["action"]:<24} @ {t["time"]:>6.2f}s  ("{t["at"]}")')
    problems = []
    if any(b['start'] < a['start'] for a, b in zip(out_sent, out_sent[1:])): problems.append('sentence starts not monotonic')
    if pages[-1]['end'] < out_sent[-1]['end'] or out_sent[-1]['end'] > duration + .05: problems.append('last word beyond audio')
    zero = [w['w'] for s in out_sent for w in s['words'] if w['end'] - w['start'] < .03]
    if zero: problems.append(f'near-zero-length words (check): {zero}')
    if unmatched: problems.append(f'tokens matched to a different pronunciation entry: {unmatched}')
    print('  checks: ' + ('OK' if not problems else '; '.join(problems)))
    return cue


if __name__ == '__main__':
    plans = json.load(open(os.path.join(ROOT, 'scripts', 'cue-plan.json'), encoding='utf-8'))
    for dev in (sys.argv[1:] or list(plans)):
        align(dev, plans[dev])
