// Narration sync engine.
// Single source of truth: the <audio> element's currentTime. Nothing here keeps
// its own clock or accumulates state: every call derives page / sentence / word /
// triggers from a time value, so pause, seek, scrub-back and page jumps stay correct.
window.NarrationSync = (() => {
  // Index of the last item whose `start` is <= t (-1 if none). Items are sorted by start.
  function lastAtOrBefore(list, t) {
    let lo = 0, hi = list.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid].start <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  }

  // Pure: the narration state at time t (seconds).
  function stateAt(cue, t) {
    const page = Math.max(0, lastAtOrBefore(cue.pages, t));
    const sentence = lastAtOrBefore(cue.sentences, t);
    const s = cue.sentences[sentence];
    const word = s ? lastAtOrBefore(s.words, t) : -1;
    const fired = {};
    for (const tr of cue.triggers) if (tr.time <= t) fired[tr.action] = tr.time;
    return { t, page, sentence, word, fired };
  }

  // Apply a state to the rendered page. `root` contains:
  //   .bk-s[data-si]              sentence spans (si = index into cue.sentences)
  //   .bk-w[data-wi]              word spans inside each sentence
  //   [data-at="action"]          elements revealed when that trigger has fired
  //   [data-count][data-to]       numbers that count up after their trigger fires
  // Live mode adds .is-live to root; without it CSS shows every page in its final state.
  function apply(root, st, prev) {
    const sameText = prev && prev.sentence === st.sentence && prev.word === st.word;
    if (!sameText) {
      root.querySelectorAll('.bk-s').forEach(el => {
        const si = +el.dataset.si;
        el.classList.toggle('is-now', si === st.sentence);
        el.classList.toggle('is-past', si < st.sentence);
        el.querySelectorAll('.bk-w').forEach(w => w.classList.toggle('is-said', si < st.sentence || (si === st.sentence && +w.dataset.wi <= st.word)));
      });
    }
    root.querySelectorAll('[data-at]').forEach(el => el.classList.toggle('is-on', el.dataset.at in st.fired));
    root.querySelectorAll('[data-count]').forEach(el => {
      const to = +el.dataset.to, from = +(el.dataset.from || 0), dur = +(el.dataset.dur || 1.2);
      const at = st.fired[el.dataset.count];
      const k = at == null ? 0 : Math.min(1, (st.t - at) / dur);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      const txt = (el.dataset.fmt === 'comma' ? v.toLocaleString('en-US') : String(v)) + (el.dataset.suffix || '');
      if (el.textContent !== txt) el.textContent = txt;
    });
    root.classList.add('is-live');
  }

  // Back to the static, fully-revealed page (no narration running for it).
  function clear(root) {
    root.classList.remove('is-live');
    root.querySelectorAll('.is-now,.is-past,.is-said,.is-on').forEach(el => el.classList.remove('is-now', 'is-past', 'is-said', 'is-on'));
    root.querySelectorAll('[data-count]').forEach(el => {
      const v = +el.dataset.to;
      el.textContent = (el.dataset.fmt === 'comma' ? v.toLocaleString('en-US') : String(v)) + (el.dataset.suffix || '');
    });
  }

  return { stateAt, apply, clear, lastAtOrBefore };
})();
