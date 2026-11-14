// Renders one book spread (left = visual, right = text + controls) from SS_BOOK data
// and the cue files. Pure DOM, no framework; js/archive.js calls render() whenever
// the visible spread changes and wires the control callbacks.
window.SSBook = (() => {
  const B = window.SS_BOOK;
  const cues = {}, credits = {};
  let ready = null;

  // Every page of every device that has pages, in reading order.
  const spreads = [];
  B.chapters.forEach((ch, ci) => ch.devices.forEach(id => {
    const dev = B.devices[id];
    (dev.pages || []).forEach((p, pi) => spreads.push({ ci, id, pi, n: dev.pages.length }));
  }));

  function load() {
    if (ready) return ready;
    const ids = [...new Set(spreads.map(s => s.id))];
    ready = Promise.all([
      fetch('assets/credits.json').then(r => r.json()).then(list => list.forEach(c => { credits[c.file] = c; })),
      ...ids.map(id => fetch(`assets/cues/${id}.json`).then(r => r.json()).then(c => { cues[id] = c; })),
    ]);
    return ready;
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const photoOk = f => f && credits[f] && credits[f].status === 'in repo';
  const legacySentence = (cue, page) => {
    const tr = cue.triggers.find(t => t.action === 'legacy');
    return tr && tr.page === page ? tr.sentence : null;
  };

  function sentenceHtml(s, si) {
    const words = s.words.map((w, wi) => `<span class="bk-w" data-wi="${wi}">${esc(w.w)}</span>`).join(' ');
    return `<span class="bk-s" data-si="${si}">${words}</span>`;
  }

  // Media element for a credits entry (photo or muted looping video).
  function mediaHtml(c, cls) {
    const src = `assets/photos/${c.file}`;
    return /\.mp4$/.test(c.file)
      ? `<video class="${cls}" src="${src}" muted loop playsinline autoplay preload="none" aria-label="${esc(c.shows)}"></video>`
      : `<img class="${cls}" src="${src}" alt="${esc(c.shows)}" loading="lazy" decoding="async" width="${c.w}" height="${c.h}">`;
  }

  function visualHtml(dev, page, ch) {
    const photo = page.photo && photoOk(page.photo.file) ? credits[page.photo.file] : null;
    const diagram = window.SS_DIAGRAMS.render(page.diagram);
    let figure, credit;
    if (photo) {
      const P = page.photo, hot = P.hotspots || [];
      // The box has the photo's exact aspect ratio, so hotspot percentages land on the right spot.
      const spots = hot.map(h => `<span class="bk-hot bk-hot-${h.side || 'right'}" data-at="${h.at}" style="left:${h.x}%;top:${h.y}%"><span class="bk-hot-ring"></span><span class="bk-hot-label">${esc(h.label)}</span></span>`).join('');
      figure = `<div class="bk-photo-frame"><div class="bk-photo-box${hot.length ? '' : ' bk-kb'}" style="--r:${photo.w}/${photo.h}"${P.at ? ` data-at="${P.at}"` : ''}>${mediaHtml(photo, 'bk-photo')}${spots}${P.label ? `<span class="bk-photo-tag">${esc(P.label)}</span>` : ''}</div></div>`;
      const inset = page.inset && photoOk(page.inset) ? credits[page.inset] : null;
      if (inset) figure += `<div class="bk-inset bk-inset-media">${mediaHtml(inset, 'bk-inset-video')}</div>`;
      else if (diagram) figure += `<div class="bk-inset">${diagram}</div>`;
      credit = [P.label, `Credit: ${photo.credit}`, inset && `Video: ${inset.credit}`, diagram && !inset && `Inset diagram: Stellar Scripts${page.schematic ? ' (schematic, not to scale)' : ''}`].filter(Boolean).map(esc).join(' · ');
    } else {
      figure = `<div class="bk-diagram">${diagram}</div>`;
      credit = `Diagram: Stellar Scripts${page.schematic ? ' · Schematic, not to scale' : ''}`;
    }
    return `<div class="bk bk-visual">
      <div class="bk-kicker"><span>Chapter ${esc(ch.num)} · ${esc(ch.title)}</span></div>
      <figure class="bk-figure">${figure}</figure>
      <figcaption class="bk-caption">${esc(page.caption || '')}<span class="bk-credit">${credit}</span></figcaption>
    </div>`;
  }

  function textHtml(dev, page, sp, cue) {
    const pageId = cue.pages[sp.pi].id;
    const legacyId = legacySentence(cue, pageId);
    const body = [], legacy = [];
    cue.sentences.forEach((s, si) => { if (s.page === pageId) (s.id === legacyId ? legacy : body).push(sentenceHtml(s, si)); });
    const last = sp.pi === sp.n - 1;
    const words = cue.sentences.filter(s => s.page === pageId).reduce((n, s) => n + s.words.length, 0);
    const twin = page.twin && B.devices[page.twin] ? `<button type="button" class="bk-twin" data-twin="${page.twin}">Twin: ${esc(B.devices[page.twin].name)} →</button>` : '';
    const sources = last ? `<div class="bk-sources"><span>Sources:</span> ${dev.sources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener">${esc(label)}</a>`).join(' · ')} · <a href="credits.html" target="_blank" rel="noopener">Image credits</a></div>` : '';
    return `<div class="bk bk-text${words > 62 ? ' is-long' : ''}">
      <div class="bk-kicker"><span>${esc(dev.name)} · ${esc(dev.world)}</span><span class="bk-pageno">${sp.pi + 1} / ${sp.n}</span></div>
      <h2 class="bk-headline">${esc(page.headline)}</h2>
      <div class="bk-stat"><span class="bk-stat-value">${esc(page.stat.value)}</span><span class="bk-stat-label">${esc(page.stat.label)}</span></div>
      <p class="bk-body">${body.join(' ')}</p>
      ${legacy.length ? `<p class="bk-legacy">${legacy.join(' ')}</p>` : ''}
      ${page.note ? `<p class="bk-note">${esc(page.note)}</p>` : ''}
      ${sources}
      ${twin}
      <div class="bk-controls" role="group" aria-label="Narration controls">
        <button type="button" class="bk-btn bk-prev" aria-label="Previous page">‹</button>
        <button type="button" class="bk-btn bk-play" aria-label="Narrate ${esc(dev.name)}"><span class="bk-play-icon" aria-hidden="true">▶</span><span class="bk-play-label">Narrate</span></button>
        <input class="bk-scrub" type="range" min="0" max="${cue.duration}" step="0.1" value="0" aria-label="Narration position" aria-valuetext="0:00">
        <span class="bk-time" aria-hidden="true">${fmtTime(cue.duration)}</span>
        <button type="button" class="bk-btn bk-replay" aria-label="Replay from the start">↺</button>
        <button type="button" class="bk-btn bk-next" aria-label="Next page">›</button>
      </div>
    </div>`;
  }

  // Render spread i into the two page containers. Returns handles for the sync loop.
  function render(left, right, i, on) {
    const sp = spreads[i], dev = B.devices[sp.id], page = dev.pages[sp.pi], ch = B.chapters[sp.ci], cue = cues[sp.id];
    if (!cue) { left.innerHTML = ''; right.innerHTML = '<div class="bk bk-text"><p class="bk-body">Loading…</p></div>'; return null; }
    left.innerHTML = visualHtml(dev, page, ch);
    right.innerHTML = textHtml(dev, page, sp, cue);
    const q = s => right.querySelector(s);
    const ui = { left, right, play: q('.bk-play'), icon: q('.bk-play-icon'), label: q('.bk-play-label'), scrub: q('.bk-scrub'), time: q('.bk-time'), replay: q('.bk-replay'), prev: q('.bk-prev'), next: q('.bk-next') };
    ui.prev.disabled = i === 0; ui.next.disabled = i === spreads.length - 1;
    ui.prev.addEventListener('click', on.prev); ui.next.addEventListener('click', on.next);
    ui.play.addEventListener('click', on.play); ui.replay.addEventListener('click', on.replay);
    ui.scrub.addEventListener('input', () => on.seek(+ui.scrub.value));
    const tw = q('.bk-twin'); if (tw) tw.addEventListener('click', () => on.device(tw.dataset.twin));
    return ui;
  }

  return { load, spreads, render, cue: id => cues[id], fmtTime, chapterStart: ci => spreads.findIndex(s => s.ci === ci), deviceStart: id => spreads.findIndex(s => s.id === id) };
})();
