window.createStellarScriptsComponent = (DCLogic, React) => {
  // Book chapters come from js/book-data.js. Each chapterId must match an ID in
  // docs/README-chatbot-setup.md (the chatbot reads CH[state.ch].chapterId and .sugg).
  const BOOK = window.SSBook, SYNC = window.NarrationSync;
  const CH = window.SS_BOOK.chapters.map((c, i) => {
    const start = BOOK.chapterStart(i);
    return { ...c, pageL: start < 0 ? '—' : String(start + 1), sub: start < 0 ? c.sub + ' · coming soon' : c.sub };
  });
  const NO_FLIP = '(max-width: 760px), (prefers-reduced-motion: reduce)';
  const TEAL = '#3f7a76';
  const DOCK = [['00','Intro','intro'],['01','Shelf','shelf'],['02','Opening','opening'],['03','Contents','contents'],['04','Chapter','chapter'],['05','Ask','ask']];
  const CVN = ['intro','portal','painting','blueprint','upper','opp','pioneer','spol0','spol1','arm','dk0','dk1','pc0','pc1','pc2','pc3','ph0','ph1','diag'];

  class Component extends DCLogic {
    state = { screen:'intro', ist:0, zoom:false, veil:false, openCap:false, bloom:false, cover:false, coverGone:false, ch:0, ask:false, flip:null, fade:false, hot:-1, entry:-1, narr:-1, sp:0, nPlaying:false, msgs:[], input:'', typing:false, askError:'', step:0, playing:true, vw:innerWidth, vh:innerHeight };
    dustRef = React.createRef(); parRef = React.createRef(); tiltRef = React.createRef(); msgRef = React.createRef(); inputRef = React.createRef(); fillRef = React.createRef(); leftPageRef = React.createRef(); rightPageRef = React.createRef(); flipRef = React.createRef(); staticRef = React.createRef();
    bkLeftRef = el => { this.bkL = el; this.renderSpread(); }; bkRightRef = el => { this.bkR = el; this.renderSpread(); };
    timers = []; mx = 0; my = 0; tmx = 0; tmy = 0; introT = 0; dp = 0; burst = -1; cvs = new Map(); fc = 0;
    cv = CVN.reduce((o, k) => (o[k] = el => { if (el) this.cvs.set(k, { el, ctx: el.getContext('2d'), w: 0, h: 0, vis: false }); else this.cvs.delete(k); }, o), {});

    later(fn, ms) { this.timers.push(setTimeout(fn, ms)); }
    clearTimers() { this.timers.forEach(clearTimeout); this.timers = []; }

    // Runtime lifecycle
    componentDidMount() {
      this.dust = Array.from({ length:130 }, () => this.mote(true));
      this.sparks = [];
      this.onMove = e => { this.tmx = e.clientX / innerWidth * 2 - 1; this.tmy = e.clientY / innerHeight * 2 - 1; };
      this.onResize = () => { this.setState({ vw:innerWidth, vh:innerHeight }); this.fc = 0; };
      this.onKey = e => {
        if (e.target && e.target.tagName === 'INPUT') return;
        if (e.key === 'Escape' && this.state.ask) this.closeAsk();
        if (this.state.screen === 'chapter' && !this.state.ask) {
          if (e.key === 'ArrowRight') this.goSpread(this.state.sp + 1);
          if (e.key === 'ArrowLeft') this.goSpread(this.state.sp - 1);
          if (e.key === ' ' && !/^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '')) { e.preventDefault(); this.togglePlay(); }
        }
      };
      addEventListener('mousemove', this.onMove); addEventListener('resize', this.onResize); addEventListener('keydown', this.onKey);
      const loop = t => { this.raf = requestAnimationFrame(loop); try { this.frame(t); } catch (e) { if (!this._err) { this._err = 1; console.error(e); } } };
      this.raf = requestAnimationFrame(loop);
      BOOK.load().then(() => this.renderSpread(true)).catch(e => console.error('Book data failed to load', e));
      const s = this.props.startScreen;
      if (s && s !== 'intro') this.jump(s);
    }
    componentWillUnmount() {
      this.chatRequest?.abort();
      this.chatRequest = null;
      cancelAnimationFrame(this.raf); this.clearTimers(); this.stopNarr(); if (this.audio) { this.audio.pause(); this.audio.removeAttribute('src'); }
      removeEventListener('mousemove', this.onMove); removeEventListener('resize', this.onResize); removeEventListener('keydown', this.onKey);
    }
    componentDidUpdate() {
      const S = this.state;
      const chatChapterChanged = this._pCh !== undefined && this._pCh !== S.ch;
      const leftChapter = this._pScreen === 'chapter' && S.screen !== 'chapter';
      if (this._pMsgs !== S.msgs || this._pTyping !== S.typing) { const el = this.msgRef.current; if (el) el.scrollTop = el.scrollHeight; }
      if (this._pScreen !== S.screen || this._pCh !== S.ch) { this.fc = 0; this.depthEls = null; }
      this._pMsgs = S.msgs; this._pTyping = S.typing; this._pScreen = S.screen; this._pCh = S.ch;
      this.renderSpread();
      if (chatChapterChanged || leftChapter) {
        this.chatRequest?.abort();
        this.chatRequest = null;
        this.setState({ msgs:[], input:'', typing:false, askError:'' });
      }
    }
    // Canvas rendering
    mote(init) { return { x:Math.random(), y:init ? Math.random() : 1.04, vx:(Math.random() - .5) * .00012, vy:-(.00004 + Math.random() * .00014), r:.5 + Math.random() * 1.8, ph:Math.random() * 6.28, a:.25 + Math.random() * .6 }; }

    frame(now) {
      const t = now / 1000, dt = Math.min(.05, t - (this.lt || t)); this.lt = t;
      const kk = 1 - Math.exp(-dt * 3.2); this.mx += (this.tmx - this.mx) * kk; this.my += (this.tmy - this.my) * kk; this.dtf = dt * 60;
      const S = this.state, G = window.SSGFX, scr = S.screen;
      if (scr === 'intro') {
        this.introT += dt; const it = this.introT;
        const ist = it < 13.5 ? 0 : it < 14.8 ? 7 : 8;
        if (ist !== S.ist) this.setState({ ist });
      }
      this.syncTick();
      if (this.fillRef.current) this.fillRef.current.style.width = (this.dp * 100).toFixed(2) + '%';
      if (this.parRef.current) this.parRef.current.style.transform = `translate3d(${(-this.mx * 14).toFixed(2)}px,${(-this.my * 9).toFixed(2)}px,0)`;
      if (this.tiltRef.current) this.tiltRef.current.style.transform = `rotateX(${(-this.my * 1.6).toFixed(3)}deg) rotateY(${(this.mx * 2.2).toFixed(3)}deg)`;
      if (this.tiltRef.current && (!this.depthEls || this.fc % 60 === 0)) this.depthEls = this.tiltRef.current.querySelectorAll('[data-depth]');
      if (this.depthEls) this.depthEls.forEach(el => { const d = +el.dataset.depth || 0; el.style.transform = `translate3d(${(this.mx * d).toFixed(2)}px,${(this.my * d * .7).toFixed(2)}px,0)`; });
      this.fc++;
      if (G) for (const [k, c] of this.cvs) {
        const el = c.el; if (!el.isConnected) continue;
        if (this.fc % 30 === 1 || !c.w) {
          const r = el.getBoundingClientRect(), cw = +el.dataset.w || el.clientWidth, ch = +el.dataset.h || el.clientHeight;
          c.vis = r.width > 2 && cw > 2 && ch > 2 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
          if (c.vis) { c.w = cw; c.h = ch; const d = Math.min(devicePixelRatio || 1, 1.5), bw = Math.max(2, Math.min(2400, Math.round(r.width * d))), bh = Math.round(bw * ch / cw); if (Math.abs(bw - el.width) > 2 || Math.abs(bh - el.height) > 2) { el.width = bw; el.height = bh; } }
        }
        if (!c.vis) continue;
        const ev = +el.dataset.every || 1; if (ev > 1 && (this.fc + k.length) % ev) continue;
        const kx = el.width / c.w; c.ctx.setTransform(kx, 0, 0, kx, 0, 0); c.ctx.clearRect(0, 0, c.w, c.h);
        this.draw(el.dataset.scene, c.ctx, c.w, c.h, t, G);
      }
      this.drawDust(t);
    }
    draw(sc, x, w, h, t, G) {
      switch (sc) {
        case 'intro': G.intro(x, w, h, this.introT); break;
        case 'portal': G.portal(x, w, h, t, this.mx, this.my); break;
        case 'painting': G.painting(x, w, h, t); break;
        case 'blueprint': G.blueprint(x, w, h, t); break;
        case 'upper': G.shelfUpper(x, w, h, t); break;
        case 'opp': G.shelfOpp(x, w, h, t); break;
        case 'pioneer2': G.shelfPioneer2(x, w, h, t); break;
        case 'arm': G.armillary(x, w, h, t); break;
        default:
          if (!sc) return;
          if (sc.indexOf('img:') === 0) { this.drawPhoto(sc.slice(4), x, w, h); return; }
          if (sc.indexOf('d-') === 0) { const st = G.diag(sc, x, w, h, this.dp); if (st !== this.state.step) this.setState({ step:st }); }
          else G.scene(sc, x, w, h, t);
      }
    }
    // Cover-fit a photo into a canvas (used for the contents polaroids).
    drawPhoto(src, x, w, h) {
      const cache = this.imgs || (this.imgs = {});
      let im = cache[src];
      if (!im) { im = cache[src] = new Image(); im.decoding = 'async'; im.src = src; }
      if (!im.complete || !im.naturalWidth) return;
      const k = Math.max(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * k, dh = im.naturalHeight * k;
      x.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    drawDust(t) {
      const c = this.dustRef.current; if (!c) return;
      const W = innerWidth, H = innerHeight, d = Math.min(devicePixelRatio || 1, 2);
      if (c.width !== Math.round(W * d)) { c.width = Math.round(W * d); c.height = Math.round(H * d); }
      const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, W, H);
      const scr = this.state.screen; if (scr === 'intro') return;
      const shelf = scr === 'shelf', ang = .66, cx0 = -.02 * W, cy0 = -.15 * H, nx = -Math.sin(ang), ny = Math.cos(ang), n = shelf ? 130 : 70;
      for (let i = 0; i < n; i++) {
        const m = this.dust[i];
        const f = this.dtf || 1; m.x += (m.vx + Math.sin(t * .4 + m.ph) * .00008) * f; m.y += m.vy * f;
        if (m.y < -.04 || m.x < -.04 || m.x > 1.04) Object.assign(m, this.mote(false), { x:Math.random() });
        const px = m.x * W - this.mx * 22 * m.r, py = m.y * H - this.my * 14 * m.r;
        const beam = Math.max(0, 1 - Math.abs((px - cx0) * nx + (py - cy0) * ny) / (W * .17));
        const a = m.a * (.6 + .4 * Math.sin(t * 2 + m.ph)) * (shelf ? (.16 + .84 * beam) : .32);
        x.fillStyle = `rgba(255,222,170,${a})`; x.beginPath(); x.arc(px, py, m.r, 0, 6.283); x.fill();
      }
      if (this.burst >= 0) {
        const bt = t - this.burst;
        if (bt < 0) return;
        if (bt < 1.4 && this.sparks.length < 260) for (let k = 0; k < Math.round(5 * (this.dtf || 1)); k++) this.sparks.push({ x:W * .5 + (Math.random() - .5) * W * .08, y:H * .52 + (Math.random() - .5) * H * .3, vx:(Math.random() - .5) * 60, vy:-40 - Math.random() * 110, r:.6 + Math.random() * 1.8, life:0, max:1.6 + Math.random() * 1.6, star:Math.random() < .18 });
        x.save(); x.globalCompositeOperation = 'lighter';
        const sd = (this.dtf || 1) / 60; this.sparks = this.sparks.filter(s => { s.life += sd; s.x += s.vx * sd; s.y += s.vy * sd; s.vy *= Math.pow(.992, this.dtf || 1); const k = s.life / s.max; if (k >= 1) return false;
          const a = Math.sin(k * Math.PI) * .9; x.fillStyle = `rgba(255,${(214 + 30 * Math.random()) | 0},150,${a})`; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
          if (s.star) { x.fillStyle = `rgba(255,236,190,${a * .6})`; x.fillRect(s.x - s.r * 4, s.y - .3, s.r * 8, .6); x.fillRect(s.x - .3, s.y - s.r * 4, .6, s.r * 8); }
          return true; });
        x.restore();
        if (bt > 4 && !this.sparks.length) this.burst = -1;
      }
    }

    // Navigation and book opening
    go(screen, extra) { this.setState(Object.assign({ screen }, extra || {})); }
    jump(s) {
      if (!CH.length && (s === 'chapter' || s === 'ask')) s = 'contents';
      this.clearTimers(); this.stopNarr(); this.burst = -1; this.sparks = [];
      if (s === 'intro') { this.introT = 0; return this.setState({ screen:'intro', ist:0, zoom:false, veil:false, ask:false, openCap:false, bloom:false }); }
      if (s === 'shelf') return this.goShelf();
      if (s === 'opening') { this.goShelf(); return this.later(() => this.startOpening(null), 500); }
      if (s === 'contents') {
        this.setState({ screen:'contents', zoom:false, veil:false, cover:false, coverGone:false, ask:false, flip:null, fade:false, openCap:false, bloom:false });
        this.later(() => this.setState({ cover:true }), 150); this.later(() => this.setState({ coverGone:true }), 2300);
      } else {
        this.dp = 0;
        this.setState({ screen:'chapter', zoom:false, veil:false, cover:true, coverGone:true, flip:null, fade:false, ask:false, openCap:false, bloom:false, step:0, playing:true });
        if (s === 'ask') this.later(() => this.openAsk(), 250);
      }
    }
    enterShelf() { this.clearTimers(); this.setState({ veil:true }); this.later(() => this.setState({ screen:'shelf', zoom:false, hot:-1 }), 750); this.later(() => this.setState({ veil:false }), 850); }
    goShelf() { this.clearTimers(); this.stopNarr(); this.setState({ screen:'shelf', pan:false, bstage:null, zoom:false, veil:false, cover:false, coverGone:false, ask:false, flip:null, fade:false, hot:-1, openCap:false, bloom:false }); }
    startOpening(target) {
      this.clearTimers(); this.stopNarr();
      // one continuous take: book slides off the shelf, camera tilts down to the table, book lands and opens
      this.setState({ screen:'opening', bstage:'shelf', pan:false, hot:-1, zoom:false, veil:false, cover:false, coverGone:false, ask:false, flip:null, fade:false, openCap:false, bloom:false });
      this.later(() => this.setState({ bstage:'pull' }), 80);
      this.later(() => this.setState({ bstage:'table', pan:true }), 800);
      this.later(() => { this.setState({ bstage:null, cover:true, bloom:true }); this.burst = performance.now() / 1000 + .6; this.sparks = []; }, 2950);
      this.later(() => this.setState({ bloom:false }), 4300);
      this.later(() => this.setState({ screen:'contents' }), 4900);
      this.later(() => this.setState({ coverGone:true }), 5100);
      if (target != null) this.later(() => this.openChapter(target), 5400);
    }
    // Page turn animation
    snap(el) {
      const c = el.cloneNode(true), sc = el.querySelectorAll('canvas'), dc = c.querySelectorAll('canvas');
      dc.forEach((d, i) => { const o = sc[i]; if (!o || !o.width) return; d.width = o.width; d.height = o.height; try { d.getContext('2d').drawImage(o, 0, 0); } catch (e) {} });
      c.querySelectorAll('*').forEach(n => { n.style.animation = 'none'; n.removeAttribute('data-depth'); });
      Object.assign(c.style, { position:'absolute', top:'0', height:'100%', opacity:'1', transition:'none', boxShadow:'none', borderRadius:'0', animation:'none' });
      return c;
    }
    turn(dir, apply, onDone, keep) {
      if (this.flipping) return;
      if (!keep) this.stopNarr();
      const L = this.leftPageRef.current, Rp = this.rightPageRef.current, host = this.flipRef.current, st = this.staticRef.current;
      const reset = () => { this.dp = 0; };
      // Phones and reduced-motion users get an instant page change instead of the 3D turn.
      if (!L || !Rp || !host || !st || !host.clientWidth || matchMedia(NO_FLIP).matches) { reset(); this.setState(Object.assign({ step:0, playing:true, entry:-1 }, apply), onDone); return; }
      this.flipping = true;
      const fwd = dir === 'fwd', Wp = host.clientWidth, N = 12, w = Wp / N;
      const old = this.snap(fwd ? L : Rp); old.style.left = (fwd ? 0 : Wp) + 'px'; old.style.width = Wp + 'px'; old.style.transform = 'translateZ(.6px)'; st.appendChild(old);
      const mkSh = left => { const d = document.createElement('div'); Object.assign(d.style, { position:'absolute', top:'0', height:'100%', width:Wp + 'px', left:(left ? 0 : Wp) + 'px', transform:'translateZ(.9px)', pointerEvents:'none' }); st.appendChild(d); return d; };
      const shR = mkSh(false), shL = mkSh(true);
      const faces = []; let parent = host;
      const face = back => { const fc = document.createElement('div'); Object.assign(fc.style, { position:'absolute', inset:'0', overflow:'hidden', backfaceVisibility:'hidden', webkitBackfaceVisibility:'hidden', background:'#e6d2a8 url(assets/paper.jpg) center/cover' }); if (back) fc.style.transform = 'rotateY(180deg)';
        const sh = document.createElement('div'); Object.assign(sh.style, { position:'absolute', inset:'0', pointerEvents:'none', opacity:'0', background: back ? 'linear-gradient(270deg,rgba(45,25,8,.6),rgba(45,25,8,.3))' : 'linear-gradient(90deg,rgba(45,25,8,.55),rgba(45,25,8,.28))' });
        const gl = document.createElement('div'); Object.assign(gl.style, { position:'absolute', inset:'0', pointerEvents:'none', opacity:'0', background:'linear-gradient(90deg,rgba(255,250,235,0),rgba(255,250,235,.6),rgba(255,250,235,0))' });
        fc.appendChild(sh); fc.appendChild(gl); return { fc, sh, gl }; };
      for (let i = 0; i < N; i++) { const sEl = document.createElement('div'); Object.assign(sEl.style, { position:'absolute', top:'0', left:(i ? w : 0) + 'px', width:(w + .8) + 'px', height:'100%', transformOrigin:'0 50%', transformStyle:'preserve-3d' });
        const fr = face(false), bk = face(true); sEl.appendChild(fr.fc); sEl.appendChild(bk.fc); faces.push({ sEl, fr, bk }); parent.appendChild(sEl); parent = sEl; }
      const put = (F, src, off) => { const c = this.snap(src); c.style.left = (-off) + 'px'; c.style.width = Wp + 'px'; F.fc.insertBefore(c, F.sh); };
      faces.forEach((F, i) => { if (fwd) put(F.fr, Rp, i * w); else put(F.bk, L, Wp - (i + 1) * w); });
      host.style.transform = 'translateZ(1.4px)';
      const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, D = Math.PI / 180;
      const setA = (th, p) => {
        const c = Math.sin(Math.PI * p) * 46; let prev = 0;
        faces.forEach((F, i) => { const k = Math.pow(i / (N - 1), 1.55); let A = fwd ? th + c * k : th - c * k; A = Math.max(prev - 0, Math.min(180, Math.max(0, A))); if (!fwd) A = Math.max(0, Math.min(180, th - c * k));
          const rel = A - prev; prev = A; F.A = A; F.sEl.style.transform = 'rotateY(' + (-rel).toFixed(3) + 'deg)';
          const sa = Math.sin(A * D); F.fr.sh.style.opacity = (A < 90 ? sa * .6 : 0).toFixed(3); F.bk.sh.style.opacity = (A > 90 ? sa * .6 : 0).toFixed(3);
          const g = Math.min(.55, Math.abs(rel) / 9 * .55).toFixed(3); F.fr.gl.style.opacity = g; F.bk.gl.style.opacity = g; });
        const em = faces[N - 1].A, ex = Math.cos(em * D) * Wp, s2 = Math.sin(th * D);
        if (ex > 0) { shR.style.opacity = s2.toFixed(3); shR.style.background = 'linear-gradient(90deg,rgba(25,12,4,.34) 0,rgba(25,12,4,.22) ' + ex.toFixed(0) + 'px,rgba(25,12,4,0) ' + (ex + Wp * .28).toFixed(0) + 'px)'; shL.style.opacity = '0'; }
        else { shL.style.opacity = s2.toFixed(3); shL.style.background = 'linear-gradient(270deg,rgba(25,12,4,.34) 0,rgba(25,12,4,.22) ' + (-ex).toFixed(0) + 'px,rgba(25,12,4,0) ' + (-ex + Wp * .28).toFixed(0) + 'px)'; shR.style.opacity = '0'; }
      };
      setA(fwd ? 0 : 180, 0);
      this.setState(Object.assign({ flip:dir, entry:-1, step:0, playing:true }, apply), () => { reset(); requestAnimationFrame(() => requestAnimationFrame(() => { const L2 = this.leftPageRef.current || L, R2 = this.rightPageRef.current || Rp; faces.forEach((F, i) => { if (fwd) put(F.bk, L2, Wp - (i + 1) * w); else put(F.fr, R2, i * w); }); })); });
      const T = 1250, t0 = performance.now() + 60;
      const tick = () => { const p = Math.max(0, Math.min(1, (performance.now() - t0) / T)), e = ease(p); setA(fwd ? 180 * e : 180 * (1 - e), p);
        if (p < 1) return requestAnimationFrame(tick);
        requestAnimationFrame(() => { host.innerHTML = ''; st.innerHTML = ''; host.style.transform = ''; this.flipping = false; this.setState({ flip:null }); if (onDone) onDone(); }); };
      requestAnimationFrame(tick);
    }
    openChapter(i) { const start = BOOK.chapterStart(i); if (start >= 0) this.goSpread(start); }
    goContents() { this.turn('back', { screen:'contents', ask:false }); }
    // Show book spread i. A manual flip inside the narrated device moves the audio to that
    // page's start (so text, page and diagrams can never disagree); flipping to another
    // device stops the narration. `sync` = the flip was requested by the narration clock.
    goSpread(i, sync) {
      const list = BOOK.spreads, S = this.state;
      if (i < 0 || i >= list.length || this.flipping) return;
      if (S.screen === 'chapter' && i === S.sp) return;
      const to = list[i];
      if (!sync && this.narr) {
        if (this.narr.id === to.id) this.audio.currentTime = this.narr.cue.pages[to.pi].start + .05;
        else this.stopNarr();
      }
      const dir = S.screen !== 'chapter' || i > S.sp ? 'fwd' : 'back';
      this.turn(dir, { screen:'chapter', sp:i, ch:to.ci }, null, true);
    }
    renderSpread(force) {
      const L = this.bkL, R = this.bkR, i = this.state.sp;
      if (!L || !R || !L.isConnected || !R.isConnected) return;
      if (!force && this._rL === L && this._rR === R && this._rKey === i) return;
      this._rL = L; this._rR = R; this._rKey = i; this.syncPrev = null;
      const box = R.closest('.open-book-tilt'); if (box) box.scrollTop = 0;
      this.ui = BOOK.render(L, R, i, {
        prev: () => this.goSpread(this.state.sp - 1), next: () => this.goSpread(this.state.sp + 1),
        play: () => this.togglePlay(), replay: () => this.replay(), seek: t => this.seek(t),
        device: id => this.goSpread(BOOK.deviceStart(id)),
      });
      if (this.ui) {
        const sc = this.ui.scrub;
        sc.addEventListener('pointerdown', () => { this.scrubbing = true; });
        sc.addEventListener('pointerup', () => { this.scrubbing = false; });
        sc.addEventListener('blur', () => { this.scrubbing = false; });
      }
      this.syncTick(true);
    }

    // Ask the Archive
    openAsk() {
      if (!CH[this.state.ch]) return;
      if (this.state.screen !== 'chapter') this.setState({ screen:'chapter', cover:true, coverGone:true });
      this.setState({ ask:true });
      this.later(() => this.inputRef.current?.focus({ preventScroll:true }), 700);
    }
    closeAsk() { this.setState({ ask:false }); }
    async send(text) {
      const q = (text ?? this.state.input).trim();
      const c = CH[this.state.ch];
      if (!c || !q || this.state.typing || this.chatRequest) return;
      if (this.props.liveAnswers === false) {
        this.setState({ askError:'The Archive is unavailable right now.' });
        return;
      }
      const chapterId = c.chapterId;
      if (!chapterId) {
        this.setState({ askError:'The Archive has no fact sheet connected to this chapter yet.' });
        return;
      }

      const request = new AbortController();
      this.chatRequest = request;
      const msgs = [...this.state.msgs, { role:'user', text:q }];
      this.setState({ msgs, input:'', typing:true, askError:'' });
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId, question:q }),
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(35000)]),
        });
        const result = await response.json();
        if (this.chatRequest !== request) return;
        if (!response.ok) {
          this.setState({ askError:result.error || 'The Archive is unavailable right now.' });
          return;
        }
        const reply = typeof result.answer === 'string' ? result.answer.trim() : '';
        if (reply) this.setState({ msgs:[...msgs, { role:'archive', text:reply }] });
        else this.setState({ askError:'The Archive did not return an answer.' });
      } catch (e) {
        if (this.chatRequest === request) this.setState({ askError:'The Archive is unavailable right now. Please try again.' });
      } finally {
        if (this.chatRequest === request) {
          this.chatRequest = null;
          this.setState({ typing:false });
        }
      }
    }

    // Narration (audio clock drives page, text and diagrams; see js/narration-sync.js)
    makeAudio() {
      if (this.audio) return this.audio;
      const a = this.audio = new Audio();
      a.preload = 'none';
      a.addEventListener('play', () => this.setState({ nPlaying:true }));
      a.addEventListener('pause', () => this.setState({ nPlaying:false }));
      a.addEventListener('ended', () => this.onNarrEnded());
      a.addEventListener('error', () => { if (this.narr && a.getAttribute('src')) { console.error('Narration audio failed to load:', a.src); this.stopNarr(); } });
      return a;
    }
    startNarr(id, t, full) {
      const cue = BOOK.cue(id); if (!cue) return;
      const a = this.makeAudio();
      this.narr = { id, cue }; this.fullStory = !!full;
      if (a.getAttribute('src') !== cue.audio) a.src = cue.audio;
      a.currentTime = t || 0;
      a.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
      this.syncTick(true);
    }
    togglePlay() {
      const cur = BOOK.spreads[this.state.sp], a = this.audio; if (!cur) return;
      if (this.narr && this.narr.id === cur.id) {
        if (a.ended) a.currentTime = this.narr.cue.pages[cur.pi].start;
        if (a.paused) a.play().catch(() => {}); else a.pause();
      } else this.startNarr(cur.id, BOOK.cue(cur.id).pages[cur.pi].start);
    }
    replay() {
      const cur = BOOK.spreads[this.state.sp]; if (!cur) return;
      if (this.narr && this.narr.id === cur.id) { this.audio.currentTime = 0; this.audio.play().catch(() => {}); }
      else this.startNarr(cur.id, 0);
    }
    seek(t) { if (this.narr) this.audio.currentTime = Math.max(0, Math.min(t, this.narr.cue.duration)); }
    onNarrEnded() {
      const list = BOOK.spreads, id = this.narr?.id;
      const next = list.find(s => s.id !== id && list.indexOf(s) > list.findIndex(x => x.id === id));
      if (this.fullStory && next) this.startNarr(next.id, 0, true); // the sync loop turns to its first page
      else this.syncTick(true);
    }
    // "Play the full story": every device in order, from the first page.
    playStory() {
      if (!BOOK.spreads.length) return;
      this.setState({ ask:false });
      this.startNarr(BOOK.spreads[0].id, 0, true);
    }
    stopNarr() {
      if (this.audio) this.audio.pause();
      this.narr = null; this.fullStory = false; this.syncPrev = null;
      if (this.ui) { SYNC.clear(this.ui.left); SYNC.clear(this.ui.right); }
      this.syncTick(true);
    }
    // Phones: the book is one scrolling page, so keep the sentence being read in view.
    keepSentenceVisible() {
      const box = this.bkR && this.bkR.closest('.open-book-tilt'), el = this.ui && this.ui.right.querySelector('.bk-s.is-now');
      if (!box || !el || box.scrollHeight <= box.clientHeight + 2) return;
      const b = box.getBoundingClientRect(), r = el.getBoundingClientRect(), controls = 80;
      if (r.top >= b.top + 8 && r.bottom <= b.bottom - controls) return;
      const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.scrollTo({ top: box.scrollTop + r.top - b.top - 60, behavior: smooth ? 'smooth' : 'auto' });
    }
    // Called every animation frame. Reads audio.currentTime and derives everything else.
    syncTick(force) {
      const n = this.narr, ui = this.ui, S = this.state, list = BOOK.spreads;
      if (n) {
        const a = this.audio, st = SYNC.stateAt(n.cue, a.currentTime);
        const target = list.findIndex(s => s.id === n.id && s.pi === st.page);
        if (target >= 0 && (S.screen !== 'chapter' || S.sp !== target) && !this.flipping && (S.screen === 'chapter' || this.fullStory)) this.goSpread(target, true);
        const cur = list[S.sp];
        if (ui && S.screen === 'chapter' && cur && cur.id === n.id && cur.pi === st.page) {
          const prev = this.syncPrev; SYNC.apply(ui.left, st, prev); SYNC.apply(ui.right, st, prev); this.syncPrev = st;
          if (!prev || prev.sentence !== st.sentence) this.keepSentenceVisible();
        } else if (ui && this.syncPrev) { SYNC.clear(ui.left); SYNC.clear(ui.right); this.syncPrev = null; }
      }
      if (!ui || !ui.right.isConnected) return;
      const cur = list[S.sp], mine = !!(n && cur && n.id === cur.id), a = this.audio;
      const t = mine ? a.currentTime : 0, playing = mine && !a.paused && !a.ended;
      if (mine && !this.scrubbing && Math.abs(+ui.scrub.value - t) > .05) ui.scrub.value = t.toFixed(1);
      const timeTxt = mine ? BOOK.fmtTime(t) + ' / ' + BOOK.fmtTime(n.cue.duration) : BOOK.fmtTime(BOOK.cue(cur.id).duration);
      if (ui.time.textContent !== timeTxt) ui.time.textContent = timeTxt;
      const key = (mine ? 1 : 0) + '|' + playing + '|' + (mine && a.ended);
      if (force || ui._key !== key) {
        ui._key = key;
        ui.right.querySelector('.bk-controls').classList.toggle('is-active', mine);
        ui.icon.textContent = playing ? '❚❚' : '▶';
        ui.label.textContent = playing ? 'Pause' : mine && !a.ended ? 'Resume' : 'Narrate';
        ui.play.setAttribute('aria-label', playing ? 'Pause narration' : 'Narrate ' + window.SS_BOOK.devices[cur.id].name);
        ui.play.classList.toggle('is-playing', playing);
      }
      if (mine) ui.scrub.setAttribute('aria-valuetext', BOOK.fmtTime(t));
    }

    // Template bindings
    renderVals() {
      const S = this.state, P = this.props, scr = S.screen, c = CH[S.ch];
      const desk = scr === 'opening' || scr === 'contents' || scr === 'chapter';
      const hot = S.hot;
      const entry = (i, indent) => { const e = CH[i], on = S.entry === i, rot = [-4, 3, -2.5, 4][i];
        return { num:e.num.toUpperCase(), title:e.title, sub:e.sub, page:e.pageL, scene:e.contents, ref:this.cv['pc' + i], indent, depth:[7, 5, 6, 8][i], fdur:[7, 8.5, 7.8, 9][i], fdel:-i * 1.7,
          polyT: on ? 'rotate(0deg) translateY(-0.6cqw) scale(1.06)' : `rotate(${rot}deg)`, shadow: on ? '0 1.6cqw 2.6cqw rgba(50,28,10,.45)' : '0 .4cqw 1cqw rgba(60,35,15,.35)',
          ctaOp: on ? 1 : 0, ctaT: on ? 'translateX(0)' : 'translateX(-6px)', go: () => this.openChapter(i), enter: () => this.setState({ entry:i }), leave: () => this.setState({ entry:-1 }) }; };
      const bs = scr === 'opening' ? S.bstage : null, SC = Math.max(S.vw / 1920, S.vh / 1080), BW = Math.min(.84 * S.vw, 1.26 * S.vh), BK = 380 * SC / (.676 * BW);
      const shelfT = (m, lift, ry) => { const k = BK * m, dx = 3 * SC - .25 * BW * (k - 1), dy = 152 * SC + lift * SC - .015 * S.vh; return 'translate(-50%,-50%) translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) translateX(-25%) scale(' + k.toFixed(4) + ') rotateY(' + ry + 'deg)'; };
      const askOn = S.ask && scr === 'chapter', userCount = S.msgs.filter(m => m.role === 'user').length, dockActive = askOn ? 'ask' : scr;
      return {
        cv: this.cv, dustRef: this.dustRef, parRef: this.parRef, tiltRef: this.tiltRef, msgRef: this.msgRef, inputRef: this.inputRef, fillRef: this.fillRef,
        grain: P.grain ?? .45, veilOp: S.veil ? 1 : 0,
        isIntro: scr === 'intro',
        titleOp: S.ist >= 7 ? 1 : 0, titleBl: S.ist >= 7 ? 'blur(0)' : 'blur(10px)', titleLs: S.ist >= 7 ? '.04em' : '.4em',
        enterOp: S.ist >= 8 ? 1 : 0, enterPe: S.ist >= 8 ? 'auto' : 'none',
        enterShelf: () => this.enterShelf(), skipIntro: () => this.enterShelf(),
        showShelf: scr === 'shelf' || scr === 'opening', stageScale: Math.max(S.vw / 1920, S.vh / 1080),
        shelfZoom: S.zoom ? 'scale(2.9)' : 'scale(1)', shelfOp: S.zoom ? 0 : 1,
        shelfBookT: hot === 9 ? 'rotateY(8deg) translateZ(26px) translateY(-8px)' : 'rotateY(22deg)',
        glowBook: hot === 9 ? 1 : .3,
        hotBook: () => this.setState({ hot:9 }), hotOff: () => this.setState({ hot:-1 }), openBook: () => this.startOpening(null),
        showDesk: desk,
        bookT: bs === 'shelf' ? shelfT(1, 0, 14) : bs === 'pull' ? shelfT(1.1, -26, 0) : !S.cover ? 'translate(-50%,-50%) translateX(-25%) scale(.9)' : askOn ? 'translate(-50%,-50%) translateX(-19%) scale(.94)' : 'translate(-50%,-50%)',
        bookTr: bs === 'shelf' ? 'none' : bs === 'pull' ? 'transform .7s cubic-bezier(.3,.7,.3,1)' : bs === 'table' ? 'transform 2.1s cubic-bezier(.55,0,.25,1)' : 'transform 1.8s cubic-bezier(.6,.05,.25,1),filter .7s',
        shelfPanT: scr === 'opening' && S.pan ? 'translateY(-100%)' : 'none', shelfPanF: scr === 'opening' && S.pan ? 'brightness(.55)' : 'none',
        deskPanT: scr === 'opening' && !S.pan ? 'translateY(100%)' : 'none',
        shelfBookOp: scr === 'opening' ? 0 : 1, tapOp: hot === 9 ? 0 : 1, navOp: scr === 'opening' ? 0 : 1,
        bookFilter: askOn ? 'brightness(.82) saturate(.9)' : 'none',
        leftOp: S.cover ? 1 : 0, showCover: !S.coverGone,
        coverT: S.cover ? 'translateZ(2px) rotateY(-180deg)' : 'translateZ(2px) rotateY(0deg)',
        bloomOp: S.bloom ? 1 : 0, openCapOp: S.openCap ? 1 : 0, openCapT: S.openCap ? 'translateY(0)' : 'translateY(14px)',
        flipF: S.flip === 'fwd', flipB: S.flip === 'back', contentOp: S.fade ? 0 : 1,
        isContents: scr === 'contents', isChapter: scr === 'chapter' && !!c && BOOK.spreads.length > 0,
        archiveEmpty: CH.length === 0, hasChapters: CH.length > 0,
        leftEntries: CH.slice(0, 2).map((_, i) => entry(i, ['0', '3cqw'][i])),
        rightEntries: CH.slice(2, 4).map((_, i) => entry(i + 2, ['1.5cqw', '4cqw'][i])),
        ch: c,
        playStory: () => this.playStory(), bkLeftRef: this.bkLeftRef, bkRightRef: this.bkRightRef,
        goContents: () => this.goContents(),
        askT: askOn ? 'translateY(-50%)' : 'translateY(-50%) translateX(115%) rotate(4deg)', askOp: askOn ? 1 : 0, askPe: askOn ? 'auto' : 'none',
        openAsk: () => this.openAsk(), closeAsk: () => this.closeAsk(), showAskBtn: !!c && scr === 'chapter' && !S.ask,
        msgs: S.msgs.map(m => ({ text: m.text, isUser: m.role === 'user', isArchive: m.role !== 'user' })), typing: S.typing,
        askError: S.askError,
        showSugg: !!c?.sugg.length && userCount < 2 && !S.typing, sugg: c?.sugg.map(t => ({ text: t, go: () => this.send(t) })) ?? [],
        input: S.input, onInput: e => this.setState({ input: e.target.value }), onInputKey: e => { if (e.key === 'Enter') { e.preventDefault(); this.send(); } }, sendInput: () => this.send(),
        goShelf: () => this.goShelf(), showDock: P.showDock ?? true,
        dock: DOCK.filter(([, , k]) => CH.length || (k !== 'chapter' && k !== 'ask')).map(([n, label, k]) => ({ n, label, bg: dockActive === k ? 'rgba(63,122,118,.55)' : 'transparent', color: dockActive === k ? '#eef6f3' : '#cdb993', go: () => this.jump(k) }))
      };
    }
  }

  return Component;
};
