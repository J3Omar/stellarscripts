window.createStellarScriptsComponent = (DCLogic, React) => {
  const CH = [];
  // Future book chapters must set chapterId to the matching ID in docs/README-chatbot-setup.md.
  CH.forEach(c => {
    c.beats = c.beats.map(beat => {
      const ws = beat.t.split(' ');
      let offset = 0;
      const st = ws.map(word => {
        const start = offset;
        offset += word.length + 1;
        return start;
      });
      return { ...beat, ws, st };
    });
    c.narration = c.beats.map(beat => beat.t);
  });
  const TEAL = '#3f7a76';
  const DOCK = [['00','Intro','intro'],['01','Shelf','shelf'],['02','Opening','opening'],['03','Contents','contents'],['04','Chapter','chapter'],['05','Ask','ask']];
  const CVN = ['intro','portal','painting','blueprint','upper','opp','pioneer','spol0','spol1','arm','dk0','dk1','pc0','pc1','pc2','pc3','ph0','ph1','diag'];

  class Component extends DCLogic {
    state = { screen:'intro', ist:0, zoom:false, veil:false, openCap:false, bloom:false, cover:false, coverGone:false, ch:0, ask:false, flip:null, fade:false, hot:-1, entry:-1, narr:-1, story:false, spaused:false, beat:-1, word:-1, storyEnd:false, msgs:[], input:'', typing:false, askError:'', step:0, playing:true, vw:innerWidth, vh:innerHeight };
    dustRef = React.createRef(); parRef = React.createRef(); tiltRef = React.createRef(); msgRef = React.createRef(); inputRef = React.createRef(); fillRef = React.createRef(); leftPageRef = React.createRef(); rightPageRef = React.createRef(); flipRef = React.createRef(); staticRef = React.createRef(); sp = 0;
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
        if (this.state.screen === 'chapter') { if (e.key === 'ArrowRight') this.nextCh(); if (e.key === 'ArrowLeft') this.prevCh(); if (e.key === ' ') { e.preventDefault(); this.setState(s => ({ playing:!s.playing })); } }
      };
      addEventListener('mousemove', this.onMove); addEventListener('resize', this.onResize); addEventListener('keydown', this.onKey);
      const loop = t => { this.raf = requestAnimationFrame(loop); try { this.frame(t); } catch (e) { if (!this._err) { this._err = 1; console.error(e); } } };
      this.raf = requestAnimationFrame(loop);
      const s = this.props.startScreen;
      if (s && s !== 'intro') this.jump(s);
    }
    componentWillUnmount() {
      this.chatRequest?.abort();
      this.chatRequest = null;
      cancelAnimationFrame(this.raf); this.clearTimers(); this.stopNarr();
      removeEventListener('mousemove', this.onMove); removeEventListener('resize', this.onResize); removeEventListener('keydown', this.onKey);
    }
    componentDidUpdate() {
      const S = this.state;
      const chatChapterChanged = this._pCh !== undefined && this._pCh !== S.ch;
      const leftChapter = this._pScreen === 'chapter' && S.screen !== 'chapter';
      if (this._pMsgs !== S.msgs || this._pTyping !== S.typing) { const el = this.msgRef.current; if (el) el.scrollTop = el.scrollHeight; }
      if (this._pScreen !== S.screen || this._pCh !== S.ch) { this.fc = 0; this.depthEls = null; }
      this._pMsgs = S.msgs; this._pTyping = S.typing; this._pScreen = S.screen; this._pCh = S.ch;
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
      if (this.beatRun && S.story && !S.spaused && scr === 'chapter' && !this.flipping) {
        const r = this.beatRun, el = performance.now() - r.t0, b = CH[S.ch].beats[r.i];
        const tgt = r.done ? 1 : r.ch >= 0 ? Math.min(.98, (r.ch + 3) / r.len) : Math.min(.97, el / r.est);
        this.sp += (tgt - this.sp) * (1 - Math.exp(-dt * 5));
        this.dp = r.d0 + (r.d1 - r.d0) * this.sp;
        if (b) { const ci = r.done ? r.len + 1 : r.ch >= 0 ? r.ch : this.sp * r.len; let wi = 0; for (let k = 0; k < b.st.length; k++) if (b.st[k] <= ci) wi = k; if (r.done) wi = b.st.length; if (wi !== S.word) this.setState({ word: wi }); }
      } else if (scr === 'chapter' && CH[S.ch]?.dur && S.playing && !S.flip && !S.story) { this.dp += dt / CH[S.ch].dur; if (this.dp > 1) this.dp = 0; }
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
          if (sc.indexOf('d-') === 0) { const st = G.diag(sc, x, w, h, this.dp); if (st !== this.state.step) this.setState({ step:st }); }
          else G.scene(sc, x, w, h, t);
      }
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
      const reset = () => { this.dp = 0; this.sp = 0; };
      if (!L || !Rp || !host || !st || !host.clientWidth) { reset(); this.setState(Object.assign({ step:0, playing:true, entry:-1 }, apply), onDone); return; }
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
    openChapter(i) { if (CH[i]) this.turn('fwd', { screen:'chapter', ch:i }); }
    goContents() { this.turn('back', { screen:'contents', ask:false }); }
    nextCh() { const n = this.state.ch + 1; if (n < CH.length) this.turn('fwd', { ch:n }); else this.goContents(); }
    prevCh() { const n = this.state.ch - 1; if (n >= 0) this.turn('back', { ch:n }); else this.goContents(); }

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

    // Story narration
    playStory() {
      if (!CH.length) return;
      const S = this.state;
      if (S.story && !S.spaused) return this.pauseStory();
      if (S.story && S.spaused) { this.setState({ spaused:false }); return this.speakBeat(Math.max(0, S.beat)); }
      const restart = S.storyEnd;
      this.setState({ story:true, spaused:false, beat:-1, word:-1, ask:false, storyEnd:false });
      if (S.screen !== 'chapter') return this.turn('fwd', { screen:'chapter', ch:0 }, () => this.speakBeat(0), true);
      if (restart && S.ch !== 0) return this.turn('back', { ch:0 }, () => this.speakBeat(0), true);
      this.speakBeat(0);
    }
    pauseStory() { this.stTok = null; clearTimeout(this.stT); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} this.setState({ spaused:true }); }
    pickVoice() { try { const v = speechSynthesis.getVoices(); return v.find(x => /Daniel|Google UK English Male|Arthur|Oliver/i.test(x.name)) || v.find(x => /^en[-_]GB/i.test(x.lang)) || v.find(x => /^en/i.test(x.lang)) || null; } catch (e) { return null; } }
    speakBeat(i) {
      if (!this.state.story) return;
      const b = CH[this.state.ch]?.beats[i];
      clearTimeout(this.stT);
      if (!b) return this.chapterDone();
      const tok = this.stTok = {}, len = b.t.length, est = Math.max(2800, len * 62);
      this.beatRun = { i, t0: performance.now(), est, len, ch: -1, d0: b.d[0], d1: b.d[1], done: false };
      this.sp = 0; this.dp = b.d[0];
      this.setState({ beat:i, word:0, spaused:false });
      const end = () => { if (this.stTok !== tok) return; this.beatRun.done = true; clearTimeout(this.stT); this.stT = setTimeout(() => { if (this.stTok === tok) this.speakBeat(i + 1); }, 750); };
      let spoke = false;
      try {
        if (this.props.voice !== false && window.speechSynthesis && window.SpeechSynthesisUtterance) {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(b.t); u.rate = .95; u.pitch = .95; const v = this.pickVoice(); if (v) u.voice = v;
          u.onboundary = e => { if (this.stTok === tok && e.charIndex != null) this.beatRun.ch = e.charIndex; };
          u.onend = end;
          u.onerror = () => { if (this.stTok === tok) { clearTimeout(this.stT); this.stT = setTimeout(end, Math.max(0, est - (performance.now() - this.beatRun.t0))); } };
          speechSynthesis.speak(u); spoke = true;
          this.stT = setTimeout(end, est * 1.8 + 3000);
        }
      } catch (e) {}
      if (!spoke) this.stT = setTimeout(end, est);
    }
    chapterDone() {
      const n = this.state.ch + 1, tok = this.stTok;
      this.stT = setTimeout(() => { if (this.stTok !== tok || !this.state.story) return;
        if (n < CH.length) { this.beatRun = null; this.setState({ beat:-1, word:-1 }); this.turn('fwd', { ch:n }, () => this.speakBeat(0), true); }
        else { this.stopNarr(); this.setState({ storyEnd:true }); this.later(() => this.setState({ storyEnd:false }), 6000); }
      }, 1100);
    }
    stopNarr() { this.stTok = null; clearTimeout(this.stT); this.beatRun = null; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} if (this.state && (this.state.story || this.state.beat !== -1)) this.setState({ story:false, spaused:false, beat:-1, word:-1 }); }

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
      const bb = S.story && S.beat >= 0 ? c?.beats[S.beat] : null;
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
        isContents: scr === 'contents', isChapter: scr === 'chapter' && !!c,
        archiveEmpty: CH.length === 0, hasChapters: CH.length > 0,
        leftEntries: CH.slice(0, 2).map((_, i) => entry(i, ['0', '3cqw'][i])),
        rightEntries: CH.slice(2, 4).map((_, i) => entry(i + 2, ['1.5cqw', '4cqw'][i])),
        ch: c,
        photos: c?.photos.map((p, i) => { const hl = !!(bb && bb.p === i); return { ...p, ref:this.cv['ph' + i], depth: i ? 9 : 6, fdur: i ? 8.4 : 7.2, fdel: -i * 2.3, sc: hl ? 1.08 : 1, sh: hl ? '0 0 0 2px rgba(63,122,118,.8),0 1.6cqw 2.6cqw rgba(40,22,8,.5)' : '0 .8cqw 1.6cqw rgba(60,35,15,.4)' }; }) ?? [],
        dataRows: c?.data.map(([k, v], i) => { const hl = !!(bb && bb.r === i); return { k, v, del: .15 + i * .07, bg: hl ? 'rgba(63,122,118,.14)' : 'transparent', sh: hl ? 'inset 2px 0 0 #3f7a76' : 'none' }; }) ?? [],
        stepText: c ? c.steps[Math.min(S.step, c.steps.length - 1)] : '',
        stepDots: c?.steps.map((s, i) => ({ n: i + 1, bg: S.step === i ? TEAL : 'transparent', color: S.step === i ? '#f3efe4' : '#2f5f5b', go: () => { if (this.state.story) this.stopNarr(); this.dp = c.stepsAt[i] + .005; this.setState({ step:i }); } })) ?? [],
        togglePlay: () => { if (this.state.story) this.stopNarr(); this.setState(s => ({ playing:!s.playing })); },
        playIcon: S.playing ? '❚❚' : '▶', playBg: S.playing ? 'transparent' : TEAL, playColor: S.playing ? '#2f5f5b' : '#f3efe4',
        seek: e => { const r = e.currentTarget.getBoundingClientRect(); this.dp = Math.max(0, Math.min(.999, (e.clientX - r.left) / r.width)); },
        sentences: c?.beats.map((b, i) => { const cur = S.story && i === S.beat, fut = S.story && i > S.beat; return { bg: cur ? 'rgba(63,122,118,.13)' : 'transparent', words: b.ws.map((w, k) => ({ t: w + ' ', color: cur ? (k < S.word ? '#1f3533' : k === S.word ? '#2f5f5b' : '#2e2014') : fut ? 'rgba(46,32,20,.5)' : '#2e2014', sh: cur && k === S.word ? 'inset 0 -2px 0 #3f7a76' : 'none' })) }; }) ?? [],
        playStory: () => this.playStory(), stopStory: () => { this.stopNarr(); this.setState({ storyEnd:false }); },
        storyLabel: !S.story ? 'PLAY THE STORY' : S.spaused ? 'RESUME STORY' : 'PAUSE STORY', storyBg: S.story && !S.spaused ? '#2f5f5b' : TEAL,
        figLabel: S.story ? 'FIG. 1 · NARRATING' : 'FIG. 1 · MOTION STUDY', figColor: S.story ? '#2f5f5b' : '#6b4e33',
        showStoryBar: (S.story || S.storyEnd) && (scr === 'chapter' || scr === 'contents'),
        barKicker: S.storyEnd ? 'STORY COMPLETE' : S.spaused ? 'PAUSED' : 'NOW NARRATING', barTitle: S.storyEnd ? 'The end of the archive' : c ? 'Chapter ' + c.num + ' · ' + c.title : '',
        barPlayIcon: S.story && !S.spaused ? '❚❚' : '▶',
        barSegs: CH.map((x, i) => ({ w: S.storyEnd || i < S.ch ? '100%' : i > S.ch || !S.story ? '0%' : (Math.min(1, (Math.max(0, S.beat) + (S.beat >= 0 ? Math.min(1, S.word / Math.max(1, c.beats[S.beat].ws.length)) : 0)) / c.beats.length) * 100).toFixed(1) + '%' })),
        goContents: () => this.goContents(), nextCh: () => this.nextCh(), nextLabel: S.ch < CH.length - 1 ? CH[S.ch + 1].title : 'Contents',
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
