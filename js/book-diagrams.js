// Original SVG diagrams for the book (no external artwork).
// One visual style: thin ink lines, two accents (teal = data/highlight, rust = the
// device's key moment), labels in Montserrat. Numbers shown here must appear in the
// device's narration or chapter fact sheet.
//
// Sync hooks (see js/narration-sync.js):
//   data-at="action"       element reveals when that narration trigger fires
//   class d-draw + pathLength="1"   line draws itself instead of fading in
//   class d-node           timeline node that lights up
//   data-count / data-to   number that counts up
// Without narration every element is shown in its final state.
window.SS_DIAGRAMS = (() => {
  const wrap = (vb, label, body) =>
    `<svg class="bk-svg" viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

  // Six-wheeled rover in side view (three wheels visible). x,y = front-wheel ground contact.
  const rover = (x, y, deadFront) => {
    const r = 15, wy = y - r, xs = [x - 124, x - 62, x];
    return `<g class="d-rover">
      <path class="d-line" d="M${xs[0]} ${wy}L${x - 92} ${wy - 34}L${x - 30} ${wy - 34}L${xs[2]} ${wy}M${xs[1]} ${wy}L${x - 46} ${wy - 34}"/>
      <rect class="d-line d-soft" x="${x - 118}" y="${wy - 66}" width="122" height="30" rx="2"/>
      <path class="d-line d-thick" d="M${x - 140} ${wy - 70}H${x + 14}"/>
      <path class="d-line" d="M${x - 14} ${wy - 70}V${wy - 122}"/>
      <rect class="d-line d-soft" x="${x - 30}" y="${wy - 134}" width="32" height="14" rx="2"/>
      ${xs.map((cx, i) => `<circle class="d-line ${deadFront && i === 2 ? 'd-warm-stroke' : 'd-soft'}" cx="${cx}" cy="${wy}" r="${r}"/>
        <circle class="d-line" cx="${cx}" cy="${wy}" r="3"/>`).join('')}
    </g>`;
  };

  const D = {
    'spirit-drag': () => wrap('0 0 400 260', 'Diagram: Spirit dragging its dead front wheel, leaving a groove in the soil', `
      <path class="d-line" d="M10 206H390"/>
      <path class="d-warm-stroke d-groove d-draw" data-at="drag" pathLength="1" d="M296 210C240 212 160 209 20 211"/>
      <path class="d-faint" d="M150 206H24" stroke-dasharray="3 5"/>
      ${rover(296, 206, true)}
      <path class="d-warm-stroke" d="M288 183l16 16M304 183l-16 16"/>
      <path class="d-faint" d="M310 178L338 132"/>
      <text class="d-label d-warm" x="342" y="122" text-anchor="middle">dead front</text>
      <text class="d-label d-warm" x="342" y="137" text-anchor="middle">wheel</text>
      <text class="d-label" x="150" y="236" text-anchor="middle">groove dug by the dragged wheel</text>
      <path class="d-faint" d="M150 222V214"/>
      <path class="d-accent-stroke" d="M330 60H376M368 54l8 6-8 6"/>
      <text class="d-small" x="353" y="48" text-anchor="middle">driving</text>`),

    'spirit-bounce': () => {
      const g = 226, hits = [118, 182, 232, 270, 299, 320, 335, 345], hs = [74, 52, 36, 25, 16, 10, 6];
      let d = `M96 38Q108 150 ${hits[0]} ${g}`;
      for (let i = 0; i < hs.length; i++) { const a = hits[i], b = hits[i + 1]; d += `Q${(a + b) / 2} ${g - 2 * hs[i]} ${b} ${g}`; }
      const balls = [[355, 214, 11], [368, 210, 12], [361, 202, 10], [374, 220, 8]].map(([cx, cy, r]) => `<circle class="d-line d-soft" cx="${cx}" cy="${cy}" r="${r}"/>`).join('');
      return wrap('0 0 400 260', 'Diagram: Spirit\'s lander bouncing 28 times inside its airbags, and Spirit and Opportunity landing on opposite sides of Mars', `
      <path class="d-line" d="M10 ${g}H390"/>
      <path class="d-accent-stroke d-draw" data-at="bounces" pathLength="1" d="${d}"/>
      <g data-at="bounces">${balls}</g>
      <text class="d-big" x="22" y="96" data-count="bounces" data-to="28" data-dur="2.2">28</text>
      <text class="d-label" x="24" y="118">bounces</text>
      <g class="d-globe">
        <circle class="d-line d-soft" cx="330" cy="70" r="40"/>
        <path class="d-faint" d="M290 70Q330 86 370 70M330 30Q342 70 330 110"/>
        <circle class="d-warm-fill" cx="300" cy="62" r="5"/>
        <text class="d-small d-warm" x="300" y="22" text-anchor="middle">Spirit</text>
        <path class="d-faint" d="M300 28V56"/>
        <g data-at="twin">
          <circle class="d-accent-fill" cx="364" cy="80" r="5" opacity=".55"/>
          <text class="d-small d-accent" x="352" y="134" text-anchor="middle">Opportunity:</text>
          <text class="d-small d-accent" x="352" y="147" text-anchor="middle">other side</text>
          <path class="d-faint" d="M362 120V87"/>
        </g>
      </g>`);
    },

    'spirit-power': () => {
      const cx = 200, cy = 196, r = 132;
      const pt = (p, rr = r) => { const a = Math.PI * (1 - p / 100); return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)].map(v => v.toFixed(1)); };
      const arc = (p0, p1) => { const [x0, y0] = pt(p0), [x1, y1] = pt(p1); return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`; };
      const ticks = [0, 25, 50, 75, 100].map(p => { const [a, b] = pt(p, r - 10), [c, d] = pt(p, r + 10); return `<path class="d-faint" d="M${a} ${b}L${c} ${d}"/>`; }).join('');
      const [l60x, l60y] = pt(60, r + 26), [l93x, l93y] = pt(93, r + 26);
      return wrap('0 0 400 250', 'Gauge: Spirit\'s solar power rising from 60 percent to 93 percent after dust devils cleaned its panels', `
      <path class="d-track" d="${arc(0, 100)}"/>
      <path class="d-accent-stroke d-gauge" d="${arc(0, 60)}"/>
      <path class="d-accent-stroke d-gauge d-gauge-hi d-draw" data-at="power" pathLength="1" d="${arc(60, 93)}"/>
      ${ticks}
      <text class="d-small" x="${pt(0, r + 24)[0]}" y="${cy + 4}" text-anchor="middle">0%</text>
      <text class="d-small" x="${pt(100, r + 24)[0]}" y="${cy + 4}" text-anchor="middle">100%</text>
      <text class="d-label" x="${l60x}" y="${l60y}" text-anchor="middle">60%</text>
      <text class="d-label d-accent" data-at="power" x="${l93x}" y="${l93y}" text-anchor="middle">93%</text>
      <g class="d-needle" data-at="power"><path class="d-ink-stroke" d="M${cx} ${cy}H${cx - r + 22}"/><circle class="d-ink-fill" cx="${cx}" cy="${cy}" r="6"/></g>
      <text class="d-big" x="${cx}" y="${cy - 34}" text-anchor="middle" data-count="power" data-from="60" data-to="93" data-dur="1.6" data-suffix="%">93%</text>
      <text class="d-label" x="${cx}" y="${cy + 30}" text-anchor="middle">solar power</text>
      <g class="d-devil" data-at="power">
        <path class="d-warm-stroke" d="M342 34c-22 4-22 12 0 14c18 2 16 9-2 12c-14 2-13 8 0 10c9 1 8 6 0 8"/>
        <text class="d-small d-warm" x="352" y="104" text-anchor="middle">dust devil</text>
      </g>`);
    },

    'spirit-silica': () => wrap('0 0 400 260', 'Cross-section: Spirit\'s dragged wheel cutting a trench that exposed bright, nearly pure silica soil', `
      <path class="d-soil" d="M10 110H390V250H10Z"/>
      <path class="d-faint" d="M10 150H390M10 190H390M10 228H390" stroke-dasharray="2 6"/>
      <path class="d-silica" data-at="silica" d="M44 128C120 134 220 132 300 128L300 146C220 152 120 152 44 146Z"/>
      <path class="d-trench d-wipe" data-at="dig" d="M44 110H300V128C220 132 120 134 44 128Z"/>
      <path class="d-line" d="M10 110H44M300 110H390"/>
      <circle class="d-line d-warm-stroke d-soft" cx="316" cy="94" r="18"/>
      <circle class="d-line" cx="316" cy="94" r="3"/>
      <path class="d-warm-stroke" d="M309 87l14 14M323 87l-14 14"/>
      <text class="d-small d-warm" x="316" y="60" text-anchor="middle">dead wheel</text>
      <path class="d-accent-stroke" d="M300 40H260M268 34l-8 6 8 6"/>
      <g data-at="silica">
        <path class="d-faint" d="M150 148V176"/>
        <text class="d-label d-accent" x="150" y="192" text-anchor="middle">bright soil:</text>
        <text class="d-label d-accent" x="150" y="208" text-anchor="middle">nearly pure silica</text>
      </g>
      <g data-at="springs">
        <path class="d-warm-stroke" d="M330 238c-6-8 6-12 0-20s6-12 0-20M350 238c-6-8 6-12 0-20s6-12 0-20M370 238c-6-8 6-12 0-20s6-12 0-20"/>
        <text class="d-small d-warm" x="300" y="172" text-anchor="middle">likely formed by hot</text>
        <text class="d-small d-warm" x="300" y="185" text-anchor="middle">springs or steam vents</text>
      </g>`),

    'spirit-timeline': () => {
      // Vertical timeline, evenly spaced (order matters here, not distance between dates).
      const x = 132, y0 = 26, step = 52, Y = i => y0 + i * step;
      const nodes = [
        ['Jan 2004', 'landed in Gusev Crater', null],
        ['2006', 'a front wheel stops working', null],
        ['2007', 'dragged wheel finds silica', null],
        ['2009', 'stuck in soft soil', 't-stuck'],
        ['Mar 2010', 'went silent', 't-silent'],
        ['May 2011', 'NASA ends recovery efforts', 't-ended'],
      ];
      const body = nodes.map(([date, what, at], i) => `<g class="d-node"${at ? ` data-at="${at}"` : ''}>
          <circle class="d-node-dot" cx="${x}" cy="${Y(i)}" r="7"/>
          <text class="d-label d-strong" x="${x - 18}" y="${Y(i) + 5}" text-anchor="end">${date}</text>
          <text class="d-small" x="${x + 18}" y="${Y(i) + 4}">${what}</text>
        </g>`).join('');
      return wrap('0 0 400 300', 'Timeline of Spirit\'s mission from landing in January 2004 to the end of recovery efforts in May 2011', `
      <path class="d-line" d="M${x} ${Y(0)}V${Y(4)}"/>
      <path class="d-warm-stroke" data-at="t-silent" stroke-dasharray="4 5" d="M${x} ${Y(4)}V${Y(5)}"/>
      ${body}
      <g data-at="t-commands">
        <path class="d-faint" d="M${x + 10} ${Y(4) + 26}H${x + 150}"/>
        <text class="d-big d-warm" x="${x + 160}" y="${Y(4) + 40}" text-anchor="start" style="font-size:34px" data-count="t-commands" data-to="1300" data-dur="1.8" data-fmt="comma" data-suffix="+">1,300+</text>
        <text class="d-small" x="${x + 160}" y="${Y(4) + 56}">commands sent</text>
      </g>`);
    },
  };

  return { render: id => (D[id] ? D[id]() : ''), has: id => !!D[id] };
})();
