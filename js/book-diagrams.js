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

    // ---------- Opportunity ----------
    'opp-marathon': () => {
      const cx = 200, cy = 136, r = 92;
      return wrap('0 0 400 280', 'Diagram: a distance ring filling up to one marathon, 26.2 miles, which Opportunity passed in March 2015', `
      <circle class="d-track" cx="${cx}" cy="${cy}" r="${r}"/>
      <path class="d-accent-stroke d-gauge d-draw" data-at="marathon" pathLength="1" d="M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx - .1} ${cy - r}"/>
      <text class="d-big" x="${cx}" y="${cy + 6}" text-anchor="middle">26.2</text>
      <text class="d-label" x="${cx}" y="${cy + 28}" text-anchor="middle">miles: one marathon</text>
      <g data-at="finish">
        <path class="d-line" d="M${cx} ${cy - r - 14}V${cy - r - 52}"/>
        <g transform="translate(${cx} ${cy - r - 52})">${[0, 1, 2, 3].map(i => [0, 1].map(j => `<rect x="${i * 8}" y="${j * 8}" width="8" height="8" class="${(i + j) % 2 ? 'd-soft-fill' : 'd-ink-fill'}"/>`).join('')).join('')}</g>
        <text class="d-label d-warm" x="${cx + 44}" y="${cy - r - 34}">March 2015</text>
      </g>
      <text class="d-small" x="${cx}" y="${cy + r + 34}" text-anchor="middle">first marathon distance travelled on another world</text>`);
    },

    'opp-distance': () => {
      const x0 = 30, W = 340, planned = W * 0.625 / 28.06; // 1,100 yd = 0.625 mi; 28.06 mi driven (fact sheet)
      return wrap('0 0 400 270', 'Bar chart to scale: planned driving about 1,100 yards (0.6 miles) versus 28 miles actually driven', `
      <text class="d-label" x="${x0}" y="56">Planned: about 1,100 yd (≈ 0.6 mi)</text>
      <rect class="d-warm-fill" data-at="planned" x="${x0}" y="68" width="${planned.toFixed(1)}" height="30"/>
      <path class="d-faint" d="M${x0} 64V102"/>
      <text class="d-label" x="${x0}" y="150">Actually drove: 28+ mi</text>
      <rect class="d-accent-fill d-grow" data-at="actual" x="${x0}" y="162" width="${W}" height="30"/>
      <text class="d-small" x="${x0}" y="236">bars drawn to scale</text>`);
    },

    'opp-hematite': () => wrap('0 0 400 270', 'Diagram: water helps form hematite, the mineral in the round grains nicknamed blueberries', `
      <g data-at="water">
        ${[[60, 90], [100, 70], [92, 130]].map(([x, y]) => `<path class="d-accent-stroke d-soft" d="M${x} ${y - 26}C${x + 18} ${y - 4} ${x + 14} ${y + 16} ${x} ${y + 16}C${x - 14} ${y + 16} ${x - 18} ${y - 4} ${x} ${y - 26}Z"/>`).join('')}
        <text class="d-label d-accent" x="84" y="190" text-anchor="middle">water</text>
        <path class="d-line" d="M150 100H220M210 92l10 8-10 8"/>
        <text class="d-small" x="185" y="84" text-anchor="middle">usually forms in</text>
      </g>
      <g data-at="hematite">
        ${[[270, 90, 13], [300, 76, 10], [318, 104, 14], [288, 118, 11], [344, 84, 9], [340, 128, 10], [262, 132, 8]].map(([x, y, r]) => `<circle class="d-line d-warm-stroke d-soft" cx="${x}" cy="${y}" r="${r}"/>`).join('')}
        <text class="d-label d-warm" x="304" y="190" text-anchor="middle">hematite grains</text>
        <text class="d-small" x="304" y="208" text-anchor="middle">("blueberries")</text>
      </g>`),

    'opp-endeavour': () => wrap('0 0 400 270', 'Schematic: clay minerals on the rim of Endeavour Crater formed in neutral water, between acidic and alkaline', `
      <path class="d-soil" d="M10 150C80 150 110 92 150 88C190 84 200 150 260 172C320 192 360 178 390 176V250H10Z"/>
      <path class="d-line d-draw" data-at="endeavour" pathLength="1" d="M10 150C80 150 110 92 150 88C190 84 200 150 260 172C320 192 360 178 390 176"/>
      <text class="d-small" x="150" y="76" text-anchor="middle" data-at="endeavour">crater rim</text>
      <text class="d-small" x="320" y="208" text-anchor="middle" data-at="endeavour">inside the crater</text>
      <g data-at="neutral">
        <path class="d-warm-fill" d="M178 104l8 8-8 8-8-8Z"/>
        <path class="d-faint" d="M186 112L240 60"/>
        <text class="d-label d-warm" x="244" y="52">clay minerals</text>
        <rect class="d-track-rect" x="60" y="222" width="280" height="10"/>
        <path class="d-ink-stroke" d="M200 214V240"/>
        <text class="d-small" x="60" y="256">acidic</text>
        <text class="d-label d-accent" x="200" y="210" text-anchor="middle">neutral</text>
        <text class="d-small" x="340" y="256" text-anchor="end">alkaline</text>
      </g>`),

    'opp-storm': () => wrap('0 0 400 280', 'Diagram: a planet-wide dust storm blocks sunlight, Opportunity\'s solar power falls to zero, NASA calls more than 1,000 times; final odometer 28.06 miles', `
      <circle class="d-sun" cx="80" cy="70" r="26"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path class="d-sun-ray" d="M${(80 + 34 * Math.cos(a)).toFixed(1)} ${(70 + 34 * Math.sin(a)).toFixed(1)}L${(80 + 44 * Math.cos(a)).toFixed(1)} ${(70 + 44 * Math.sin(a)).toFixed(1)}"/>`; }).join('')}
      <g data-at="storm" class="d-dust">
        <path d="M10 50C60 30 110 70 160 48S260 40 300 56V120C240 104 180 134 120 112S40 100 10 118Z"/>
        <path d="M10 84C70 70 120 104 180 86S270 82 310 96V140C250 128 190 150 130 136S50 128 10 140Z" opacity=".7"/>
        <text class="d-label d-warm" x="230" y="34">dust storm, June 2018</text>
      </g>
      <text class="d-label" x="30" y="178">solar power</text>
      <rect class="d-track-rect" x="30" y="188" width="150" height="16"/>
      <rect class="d-accent-fill d-drain" data-at="storm" x="30" y="188" width="150" height="16"/>
      <text class="d-small d-warm" x="186" y="201" data-at="storm">fell to zero</text>
      <g data-at="calls">
        <text class="d-big d-warm" x="30" y="252" style="font-size:34px" data-count="calls" data-to="1000" data-dur="1.6" data-fmt="comma" data-suffix="+">1,000+</text>
        <text class="d-small" x="30" y="270">times NASA tried to reach it</text>
      </g>
      <g data-at="odometer">
        <rect class="d-line d-soft" x="236" y="186" width="140" height="48" rx="4"/>
        <text class="d-big" x="306" y="224" text-anchor="middle" style="font-size:32px">28.06</text>
        <text class="d-small" x="306" y="254" text-anchor="middle">miles on its odometer</text>
      </g>`),

    // ---------- Pioneer 10 & 11 ----------
    'p10-belt': () => {
      const cx = 20, cy = 270, pt = (r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
      const arc = r => `M${cx + r} ${cy}A${r} ${r} 0 0 0 ${cx} ${cy - r}`;
      let rocks = '';
      for (let i = 0; i < 170; i++) {
        const rnd = k => ((Math.sin(i * k) * 43758.5453) % 1 + 1) % 1; // deterministic scatter in [0, 1)
        const r = 150 + 62 * rnd(12.9898), a = 4 + 82 * rnd(78.233), [x, y] = pt(r, a); rocks += `<circle class="d-rock" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.2 + (i % 3) * .7).toFixed(1)}"/>`; }
      const [ex, ey] = pt(60, 38), [jx, jy] = pt(260, 52);
      return wrap('0 0 400 280', 'Schematic: Pioneer 10 crossing the asteroid belt between the orbits of Mars and Jupiter', `
      <circle class="d-sun" cx="${cx}" cy="${cy}" r="14"/>
      <text class="d-small" x="${cx + 18}" y="${cy - 4}">Sun</text>
      <path class="d-faint" d="${arc(60)}"/><path class="d-faint" d="${arc(100)}" stroke-dasharray="3 4"/><path class="d-line" d="${arc(260)}"/>
      <text class="d-small" x="${pt(100, 8)[0] + 4}" y="${pt(100, 8)[1]}">Mars's orbit</text>
      <text class="d-small" x="${pt(260, 74)[0] + 8}" y="${pt(260, 74)[1] + 4}">Jupiter's orbit</text>
      <g class="d-belt">${rocks}</g>
      <text class="d-label d-warm" x="250" y="246">asteroid belt</text>
      <path class="d-accent-stroke d-draw" data-at="cross" pathLength="1" d="M${ex.toFixed(1)} ${ey.toFixed(1)}C120 190 150 120 ${jx.toFixed(1)} ${jy.toFixed(1)}"/>
      <g data-at="cross"><circle class="d-accent-fill" cx="${jx.toFixed(1)}" cy="${jy.toFixed(1)}" r="5"/><text class="d-label d-accent" x="${(jx + 10).toFixed(1)}" y="${(jy - 6).toFixed(1)}">Pioneer 10</text></g>`);
    },

    'p10-delay': () => wrap('0 0 400 270', 'Diagram: a radio command to Pioneer 10 at Jupiter took up to 92 minutes to get an answer', `
      <circle class="d-earth" cx="46" cy="150" r="20"/>
      <text class="d-label" x="46" y="200" text-anchor="middle">Earth</text>
      <circle class="d-line d-soft" cx="352" cy="150" r="9"/><path class="d-line" d="M352 141V120M342 120H362"/>
      <text class="d-label" x="352" y="200" text-anchor="middle">Pioneer 10</text>
      <path class="d-accent-stroke d-draw" data-at="delay" pathLength="1" stroke-dasharray="1" d="M70 140C150 96 250 96 340 140"/>
      <path class="d-warm-stroke d-draw" data-at="delay" pathLength="1" d="M340 162C250 206 150 206 70 162"/>
      <text class="d-small" x="200" y="96" text-anchor="middle">command</text>
      <text class="d-small" x="200" y="222" text-anchor="middle">answer</text>
      <text class="d-big" x="200" y="160" text-anchor="middle" style="font-size:40px" data-count="delay" data-to="92" data-dur="1.8" data-suffix=" min">92 min</text>
      <text class="d-label" x="200" y="252" text-anchor="middle">up to 92 minutes for a reply</text>`),

    'p10-lifetime': () => {
      const x0 = 24, W = 352, plan = W * 21 / 372; // 21 months vs ~31 years (372 months)
      return wrap('0 0 400 280', 'Bars to scale: designed for 21 months, worked about 31 years; now drifting toward the star Aldebaran', `
      <text class="d-label" x="${x0}" y="36">Designed for: 21 months</text>
      <rect class="d-warm-fill" data-at="planned" x="${x0}" y="46" width="${plan.toFixed(1)}" height="26"/>
      <text class="d-label" x="${x0}" y="108">Last signal: about 31 years later</text>
      <rect class="d-accent-fill d-grow" data-at="actual" x="${x0}" y="118" width="${W}" height="26"/>
      <text class="d-small" x="${x0}" y="164" data-at="actual">7.6 billion miles from Earth, January 2003 · bars to scale</text>
      <g data-at="aldebaran">
        <circle class="d-line d-soft" cx="44" cy="226" r="7"/>
        <path class="d-accent-stroke" stroke-dasharray="2 7" d="M60 226H330"/>
        <path class="d-star" d="M352 210l4.5 11 11.5 1-8.8 7.5 2.8 11.2-10-6.2-10 6.2 2.8-11.2-8.8-7.5 11.5-1Z"/>
        <text class="d-label d-accent" x="352" y="264" text-anchor="middle">Aldebaran</text>
        <text class="d-small" x="196" y="214" text-anchor="middle">drifting, inert (direction only)</text>
      </g>`);
    },

    'p11-slingshot': () => wrap('0 0 400 280', 'Schematic: Pioneer 11 swings around Jupiter, whose gravity bends and speeds up its path toward Saturn', `
      <circle class="d-sun" cx="200" cy="172" r="11"/><text class="d-small" x="200" y="200" text-anchor="middle">Sun</text>
      <circle class="d-jupiter" cx="330" cy="206" r="20"/><text class="d-label" x="330" y="248" text-anchor="middle">Jupiter</text>
      <g transform="translate(92 70)"><ellipse class="d-line" rx="26" ry="7" transform="rotate(-14)"/><circle class="d-saturn" r="12"/></g>
      <text class="d-label" x="92" y="40" text-anchor="middle">Saturn</text>
      <path class="d-accent-stroke d-draw" data-at="jupiter" pathLength="1" d="M214 180C250 214 292 238 340 232"/>
      <path class="d-accent-stroke d-draw" data-at="swing" pathLength="1" d="M340 232C370 222 364 184 334 178C262 160 168 110 112 80"/>
      <g data-at="swing"><path class="d-faint" d="M258 138L300 96"/><text class="d-small" x="300" y="80" text-anchor="middle">gravity bends and</text><text class="d-small" x="300" y="94" text-anchor="middle">speeds up the path</text></g>
      <g data-at="closer"><text class="d-label d-warm" x="24" y="244">3× closer to Jupiter</text><text class="d-small" x="24" y="262">than Pioneer 10, but faster through its radiation</text></g>`),

    'p11-saturn': () => {
      const ring = (rx, ry, cls, at) => `<ellipse class="${cls}"${at ? ` data-at="${at}"` : ''} cx="200" cy="140" rx="${rx}" ry="${ry}" transform="rotate(-12 200 140)"/>`;
      return wrap('0 0 400 280', 'Schematic: Saturn with the newly found F ring, a new moon about 124 miles across, and its magnetic field', `
      <g data-at="magnetic" class="d-field">
        <path d="M200 92C120 20 40 120 200 188"/><path d="M200 92C280 20 360 120 200 188"/>
        <path d="M200 98C150 50 96 120 200 182"/><path d="M200 98C250 50 304 120 200 182"/>
      </g>
      ${ring(118, 30, 'd-ring')}${ring(100, 24, 'd-ring')}
      ${ring(136, 35, 'd-fring', 'fring')}
      <circle class="d-saturn" cx="200" cy="140" r="44"/>
      <path class="d-ring-front" d="M88 165A118 30 -12 0 0 318 116" transform="rotate(0)"/>
      <g data-at="fring"><path class="d-faint" d="M318 104L352 64"/><text class="d-label d-warm" x="352" y="56" text-anchor="middle">F ring (new)</text></g>
      <g data-at="moon"><circle class="d-accent-fill" cx="74" cy="80" r="6"/><text class="d-label d-accent" x="74" y="54" text-anchor="middle">new moon</text><text class="d-small" x="74" y="68" text-anchor="middle">~124 mi across</text></g>
      <g data-at="magnetic"><text class="d-label" x="200" y="252" text-anchor="middle">first proof of a magnetic field</text></g>`);
    },

    'p11-opposite': () => wrap('0 0 400 280', 'Schematic: Pioneer 10 heading toward Aldebaran and Pioneer 11 heading the opposite way, toward Lambda Aquilae', `
      <circle class="d-sun" cx="200" cy="140" r="12"/><text class="d-small" x="200" y="172" text-anchor="middle">Sun</text>
      <path class="d-faint" stroke-dasharray="3 6" d="M186 140H40"/><path class="d-faint" d="M48 133l-10 7 10 7"/>
      <text class="d-small" x="40" y="118">Pioneer 10</text><text class="d-small" x="40" y="104">toward Aldebaran</text>
      <g data-at="opposite"><path class="d-accent-stroke" stroke-dasharray="3 6" d="M214 140H360"/><path class="d-accent-stroke" d="M352 133l10 7-10 7"/></g>
      <g data-at="lambda"><text class="d-label d-accent" x="360" y="104" text-anchor="end">Pioneer 11 → Lambda Aquilae</text><text class="d-small" x="360" y="120" text-anchor="end">about four million years away</text></g>
      <g data-at="ghost" class="d-ghost"><circle class="d-line d-soft" cx="316" cy="196" r="8"/><path class="d-line" d="M316 188V170M306 170H326"/><text class="d-small" x="316" y="236" text-anchor="middle" font-style="italic">"a ghost ship in our galaxy"</text></g>`),

    // ---------- Ingenuity ----------
    'ing-height': () => {
      const heli = `<g transform="translate(250 92)">
        <path class="d-line" d="M-46 -30H46M-40 -22H40"/><path class="d-line" d="M0 -34V-6"/>
        <rect class="d-line d-soft" x="-14" y="-6" width="28" height="20" rx="3"/>
        <path class="d-line" d="M-10 14L-26 40M10 14L26 40M-4 14L-12 40M4 14L12 40"/>
      </g>`;
      return wrap('0 0 400 270', 'Diagram: Ingenuity rising 10 feet above the ground on its first flight', `
      <path class="d-line" d="M20 220H380"/>
      ${heli}
      <g data-at="tenfeet">
        <path class="d-accent-stroke" d="M120 220V132M110 132H130M110 220H130"/>
        <text class="d-big d-accent" x="96" y="186" text-anchor="end" style="font-size:36px">10 ft</text>
      </g>
      <text class="d-small" x="250" y="252" text-anchor="middle">ground</text>`);
    },

    'ing-air': () => {
      let dense = '';
      for (let i = 0; i < 120; i++) dense += `<circle class="d-air" cx="${(40 + (i % 12) * 11 + (Math.floor(i / 12) % 2) * 5).toFixed(0)}" cy="${(52 + Math.floor(i / 12) * 13).toFixed(0)}" r="2.2"/>`;
      return wrap('0 0 400 280', 'Diagram: Mars air is less than one percent as dense as Earth\'s air', `
      <rect class="d-line d-soft" x="30" y="40" width="140" height="140" rx="4"/>
      ${dense}
      <text class="d-label" x="100" y="204" text-anchor="middle">Earth's air</text>
      <g data-at="density">
        <rect class="d-line d-soft" x="230" y="40" width="140" height="140" rx="4"/>
        <circle class="d-air" cx="300" cy="110" r="2.2"/>
        <text class="d-label d-warm" x="300" y="204" text-anchor="middle">Mars's air</text>
        <text class="d-small" x="300" y="222" text-anchor="middle">less than 1% as dense</text>
      </g>
      <g data-at="plan">
        <text class="d-small" x="30" y="256">test plan: up to 5 flights in 30 days</text>
        ${[0, 1, 2, 3, 4].map(i => `<circle class="d-accent-stroke" cx="${284 + i * 20}" cy="252" r="7"/>`).join('')}
      </g>
      <text class="d-small" x="200" y="20" text-anchor="middle">same box of air, dots = air molecules (illustration)</text>`);
    },

    'ing-flights': () => {
      let cells = '';
      for (let i = 0; i < 72; i++) {
        const x = 30 + (i % 12) * 29, y = 40 + Math.floor(i / 12) * 29;
        cells += i < 5
          ? `<rect class="d-plan-cell" x="${x}" y="${y}" width="22" height="22" rx="4"/>`
          : `<rect class="d-flight-cell" data-at="flights" x="${x}" y="${y}" width="22" height="22" rx="4" style="transition-delay:${(i * 0.018).toFixed(2)}s"/>`;
      }
      return wrap('0 0 400 280', 'Diagram: 5 flights planned, 72 flights flown', `
      ${cells}
      <text class="d-small" x="30" y="30">first 5 squares = the planned test</text>
      <text class="d-big d-accent" x="30" y="262" style="font-size:36px" data-count="flights" data-from="5" data-to="72" data-dur="1.6">72</text>
      <text class="d-label" x="88" y="256">flights flown</text>
      <g data-at="parachute"><text class="d-small d-warm" x="370" y="256" text-anchor="end">flight 26: photographed the</text><text class="d-small d-warm" x="370" y="270" text-anchor="end">parachute that landed Perseverance</text></g>`);
    },

    'ing-damage': () => wrap('0 0 400 280', 'Schematic: Ingenuity after its last flight, a rotor blade damaged, but upright and still in contact', `
      <path class="d-line" d="M20 228H380"/>
      <g transform="translate(200 150)">
        <rect class="d-line d-soft" x="-40" y="-104" width="80" height="12" rx="2"/>
        <path class="d-line" d="M0 -92V-6"/>
        <path class="d-line d-thick" d="M-120 -66H120"/>
        <path class="d-line d-thick" d="M-120 -40H70"/>
        <g data-at="damage"><path class="d-warm-stroke d-thick" d="M70 -40H104"/><path class="d-warm-stroke" d="M96 -50l8 10-10 6 8 10"/><text class="d-label d-warm" x="150" y="-14" text-anchor="middle">damaged</text><text class="d-label d-warm" x="150" y="2" text-anchor="middle">rotor blade</text></g>
        <rect class="d-line d-soft" x="-26" y="-6" width="52" height="38" rx="5"/>
        <path class="d-line" d="M-20 32L-52 78M20 32L52 78M-8 32L-20 78M8 32L20 78"/>
      </g>
      <g data-at="upright">
        <text class="d-label d-accent" x="24" y="166">✓ upright</text>
        <text class="d-label d-accent" x="24" y="188">✓ still in contact</text>
        <text class="d-small" x="24" y="208">can no longer fly</text>
      </g>`),
  };

  return { render: id => (D[id] ? D[id]() : ''), has: id => !!D[id] };
})();
