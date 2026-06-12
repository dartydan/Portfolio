/* ============================================================
   morency.dev — doodle redesign interactions
   ============================================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  if (hasGsap && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!prefersReduced && typeof window.Lenis !== "undefined" && hasGsap) {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- preloader ---------- */
  const preloader = document.getElementById("preloader");
  const countEl = document.getElementById("preloaderCount");

  const HERO_HIDE = ".hero-core > [data-reveal], .sticker, .hero-card, .hero-hint";

  function heroIntro() {
    if (!hasGsap || prefersReduced) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-core > [data-reveal]", { y: 34, autoAlpha: 0, duration: 0.8, stagger: 0.1 });
    tl.from(".sticker", {
      scale: 0,
      rotation: "+=40",
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.07,
      ease: "back.out(1.8)",
    }, "-=0.5");
    tl.from("#heroCard", { yPercent: 110, duration: 0.8, ease: "power4.out" }, "-=0.55");
    tl.from(".hero-card-note", { autoAlpha: 0, scale: 0.4, rotate: -30, duration: 0.5, ease: "back.out(2)" }, "-=0.25");
    tl.from(".hero-hint", { autoAlpha: 0, y: 12, duration: 0.5 }, "-=0.3");
    const path = document.getElementById("underlinePath");
    if (path) {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(path, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, "-=0.8");
    }
  }

  if (prefersReduced || !hasGsap) {
    if (preloader) preloader.remove();
  } else {
    // keep hero hidden until the preloader lifts
    gsap.set(HERO_HIDE, { autoAlpha: 0 });
    const counter = { v: 0 };
    const loadTl = gsap.timeline({
      onComplete() {
        preloader.remove();
        gsap.set(HERO_HIDE, { clearProps: "opacity,visibility" });
        heroIntro();
      },
    });
    loadTl
      .to(counter, {
        v: 100,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate() { countEl.textContent = Math.round(counter.v); },
      })
      .to(".preloader-card", { rotate: -3, scale: 0.92, yPercent: -8, duration: 0.25, ease: "power2.in" })
      .to(preloader, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, "-=0.05");
    // safety: rAF can be frozen in background tabs — never trap the page
    setTimeout(() => {
      if (document.getElementById("preloader")) {
        loadTl.kill();
        preloader.remove();
        gsap.set(HERO_HIDE + ", .hero-card-note", { clearProps: "all" });
        const path = document.getElementById("underlinePath");
        if (path) gsap.set(path, { clearProps: "all" });
      }
    }, 4000);
  }

  /* ============================================================
     HERO PLAYGROUND
     ============================================================ */
  const hero = document.getElementById("heroSection");

  /* ---------- jiggling headline characters ---------- */
  const jiggleEl = document.querySelector("[data-jiggle]");
  if (jiggleEl && hasGsap && !prefersReduced) {
    const words = jiggleEl.textContent.split(" ");
    jiggleEl.innerHTML = words
      .map((w) => `<span class="word">${[...w].map((c) => `<span class="char">${c}</span>`).join("")}</span>`)
      .join(" ");
    jiggleEl.querySelectorAll(".char").forEach((ch) => {
      ch.addEventListener("mouseenter", () => {
        if (gsap.isTweening(ch)) return;
        gsap.timeline()
          .to(ch, {
            y: gsap.utils.random(-16, -26),
            rotation: gsap.utils.random(-14, 14),
            scale: 1.12,
            color: ["#eacdc2", "#7cc4e8", "#f6c944", "#e0457b"][gsap.utils.random(0, 3, 1)],
            duration: 0.18,
            ease: "power2.out",
          })
          .to(ch, { y: 0, rotation: 0, scale: 1, color: "inherit", duration: 0.9, ease: "elastic.out(1.1, 0.35)" });
      });
    });
  }

  /* ---------- cycling underlined phrase ---------- */
  const swapStack = document.getElementById("swapStack");
  if (swapStack && hasGsap && !prefersReduced) {
    const wordsEls = [...swapStack.querySelectorAll(".swap-word")];
    let cur = 0;
    gsap.set(wordsEls.slice(1), { yPercent: 60, autoAlpha: 0, visibility: "visible" });
    setInterval(() => {
      const prev = wordsEls[cur];
      cur = (cur + 1) % wordsEls.length;
      const next = wordsEls[cur];
      gsap.to(prev, { yPercent: -60, autoAlpha: 0, duration: 0.38, ease: "power2.in" });
      gsap.fromTo(next,
        { yPercent: 60, autoAlpha: 0, visibility: "visible" },
        { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.6)", delay: 0.3 });
    }, 2800);
  }

  /* ---------- marker scribble trail ---------- */
  (function initScribble() {
    const canvas = document.getElementById("scribbleCanvas");
    if (!canvas || prefersReduced || !isFinePointer || !hero) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 2);
    let pts = [];
    let raf = null;
    let visible = true;

    function resize() {
      canvas.width = hero.clientWidth * dpr;
      canvas.height = hero.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    resize();
    window.addEventListener("resize", resize);

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      pts.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
      if (!raf && visible) raf = requestAnimationFrame(draw);
    });

    function draw() {
      raf = null;
      const now = performance.now();
      pts = pts.filter((p) => now - p.t < 750);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (pts.length > 1) {
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const age = (now - b.t) / 750;
          ctx.strokeStyle = `rgba(234, 205, 194, ${0.5 * (1 - age)})`;
          ctx.lineWidth = 3.5 * (1 - age) + 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (pts.length && visible) raf = requestAnimationFrame(draw);
    }

    new IntersectionObserver((en) => {
      visible = en[0].isIntersecting;
      if (!visible) { pts = []; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }).observe(hero);
  })();

  /* ---------- seat the $31M sticker under the "click me!" arrow ---------- */
  const noteEl = document.querySelector(".hero-card-note");
  const cardEl = document.getElementById("heroCard");
  const moneyEl = document.getElementById("stickerMoney");

  function seatMoney() {
    if (!noteEl || !cardEl || !moneyEl || !hero || !moneyEl.offsetParent) return;
    const hr = hero.getBoundingClientRect();
    const nr = noteEl.getBoundingClientRect();
    const cr = cardEl.getBoundingClientRect();
    const w = moneyEl.offsetWidth;
    const h = moneyEl.offsetHeight;
    let x = nr.left - hr.left + nr.width / 2 - w / 2;
    let y = nr.bottom - hr.top + 10;
    // don't let it tuck behind the avatar card
    const cardLeft = cr.left - hr.left;
    const cardTop = cr.top - hr.top;
    if (x + w > cardLeft - 4 && y + h > cardTop) x = cardLeft - w - 10;
    x = Math.min(Math.max(4, x), hr.width - w - 4);
    y = Math.min(Math.max(4, y), hr.height - h - 4);
    moneyEl.style.left = x + "px";
    moneyEl.style.top = y + "px";
  }
  seatMoney();
  window.addEventListener("load", seatMoney);

  /* ---------- stickers: drag, throw, and bounce off each other ---------- */
  if (hasGsap && !prefersReduced && typeof window.Draggable !== "undefined" && hero) {
    const els = [...hero.querySelectorAll(".sticker")];
    const bodies = [];
    let topZ = 10;
    let rafId = null;
    let lastT = 0;
    let heroVisible = true;

    function buildBodies() {
      els.forEach((el) => gsap.set(el, { x: 0, y: 0 }));
      seatMoney();
      bodies.length = 0;
      els.forEach((el) => {
        if (!el.offsetParent) return; // hidden at this breakpoint
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        bodies.push({
          el,
          bx: el.offsetLeft,
          by: el.offsetTop,
          w, h,
          r: (Math.max(w, h) / 2) * 0.92,
          x: 0, y: 0, vx: 0, vy: 0,
          drag: false, lastX: 0, lastY: 0, lastT: 0,
        });
      });
    }

    const byEl = (el) => bodies.find((b) => b.el === el);

    function step(t) {
      rafId = null;
      const dt = Math.min(0.034, (t - lastT) / 1000 || 0.016);
      lastT = t;
      const hw = hero.clientWidth;
      const hh = hero.clientHeight;
      const friction = Math.exp(-1.5 * dt);
      let active = false;

      for (const b of bodies) {
        if (b.drag) { active = true; continue; }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vx *= friction;
        b.vy *= friction;
        const ax = b.bx + b.x;
        const ay = b.by + b.y;
        if (ax < 0) { b.x -= ax; b.vx = Math.abs(b.vx) * 0.65; }
        if (ax + b.w > hw) { b.x -= ax + b.w - hw; b.vx = -Math.abs(b.vx) * 0.65; }
        if (ay < 0) { b.y -= ay; b.vy = Math.abs(b.vy) * 0.65; }
        if (ay + b.h > hh) { b.y -= ay + b.h - hh; b.vy = -Math.abs(b.vy) * 0.65; }
        if (Math.hypot(b.vx, b.vy) < 5) b.vx = b.vy = 0;
        else active = true;
      }

      // circle-vs-circle collisions, equal mass; dragged stickers are immovable
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const dx = (b.bx + b.x + b.w / 2) - (a.bx + a.x + a.w / 2);
          const dy = (b.by + b.y + b.h / 2) - (a.by + a.y + a.h / 2);
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = a.r + b.r;
          if (dist >= minDist) continue;
          active = true;
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          // separate (immovable while dragged)
          if (a.drag && !b.drag) { b.x += nx * overlap; b.y += ny * overlap; }
          else if (b.drag && !a.drag) { a.x -= nx * overlap; a.y -= ny * overlap; }
          else if (!a.drag && !b.drag) {
            a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
            b.x += nx * overlap / 2; b.y += ny * overlap / 2;
          }
          // impulse along the normal
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            const restitution = 0.82;
            const imp = -rel * restitution;
            if (a.drag && !b.drag) {
              b.vx += (imp + Math.hypot(a.vx, a.vy) * 0.4) * nx;
              b.vy += (imp + Math.hypot(a.vx, a.vy) * 0.4) * ny;
            } else if (b.drag && !a.drag) {
              a.vx -= (imp + Math.hypot(b.vx, b.vy) * 0.4) * nx;
              a.vy -= (imp + Math.hypot(b.vx, b.vy) * 0.4) * ny;
            } else if (!a.drag && !b.drag) {
              a.vx -= imp * nx / 2; a.vy -= imp * ny / 2;
              b.vx += imp * nx / 2; b.vy += imp * ny / 2;
            }
            // a little spin on impact sells the cartoon physics
            const hit = bodies[a.drag ? j : i];
            gsap.to(hit.el, {
              rotation: `+=${gsap.utils.random(-9, 9)}`,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        }
      }

      for (const b of bodies) {
        if (!b.drag) gsap.set(b.el, { x: b.x, y: b.y });
      }
      if (active && heroVisible) rafId = requestAnimationFrame(step);
    }

    function wake() {
      if (!rafId && heroVisible) {
        lastT = performance.now();
        rafId = requestAnimationFrame(step);
      }
    }

    buildBodies();

    Draggable.create(els, {
      bounds: hero,
      inertia: false,
      onPress() {
        const b = byEl(this.target);
        if (!b) return;
        b.drag = true;
        b.vx = b.vy = 0;
        b.lastX = this.x;
        b.lastY = this.y;
        b.lastT = performance.now();
        gsap.set(this.target, { zIndex: ++topZ });
        gsap.to(this.target, { scale: 1.12, duration: 0.15 });
        wake();
      },
      onDrag() {
        const b = byEl(this.target);
        if (!b) return;
        const now = performance.now();
        const dt = (now - b.lastT) / 1000;
        if (dt > 0.012) {
          b.vx = ((this.x - b.lastX) / dt) * 0.9;
          b.vy = ((this.y - b.lastY) / dt) * 0.9;
          b.lastX = this.x;
          b.lastY = this.y;
          b.lastT = now;
        }
        b.x = this.x;
        b.y = this.y;
        wake();
      },
      onRelease() {
        const b = byEl(this.target);
        if (!b) return;
        b.drag = false;
        const speed = Math.hypot(b.vx, b.vy);
        const MAX = 1500;
        if (speed > MAX) { b.vx *= MAX / speed; b.vy *= MAX / speed; }
        gsap.to(this.target, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
        wake();
      },
    });

    new IntersectionObserver((en) => {
      heroVisible = en[0].isIntersecting;
      if (heroVisible) wake();
    }).observe(hero);

    let resizeT = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(buildBodies, 180);
    });
  }

  /* ---------- hand-drawn confetti ---------- */
  const CONFETTI_SHAPES = [
    '<path d="M12 2l2.4 6.9 7.3.2-5.8 4.4 2 7-6-4.2-6 4.2 2-7L2.3 9.1l7.3-.2z"/>',
    '<circle cx="12" cy="12" r="8"/>',
    '<path d="M13 2 L5 14 h6 l-1 8 8-12 h-6z"/>',
    '<path d="M4 16 C 8 4, 12 20, 16 8 S 22 10, 21 14" fill="none" stroke-width="3.5" stroke-linecap="round"/>',
  ];
  const CONFETTI_COLORS = ["#eacdc2", "#7cc4e8", "#f6c944", "#e0457b", "#ffffff"];

  function burstConfetti(x, y, n) {
    if (!hasGsap || prefersReduced || !hero) return;
    const r = hero.getBoundingClientRect();
    for (let i = 0; i < (n || 16); i++) {
      const el = document.createElement("span");
      el.className = "confetti";
      const color = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
      const shape = CONFETTI_SHAPES[(Math.random() * CONFETTI_SHAPES.length) | 0];
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" stroke="${color}">${shape}</svg>`;
      el.style.left = x - r.left + "px";
      el.style.top = y - r.top + "px";
      hero.appendChild(el);
      const ang = Math.random() * Math.PI * 2;
      const dist = gsap.utils.random(50, 170);
      gsap.timeline({ onComplete: () => el.remove() })
        .to(el, {
          x: Math.cos(ang) * dist,
          y: Math.sin(ang) * dist - 60,
          rotation: gsap.utils.random(-260, 260),
          scale: gsap.utils.random(0.5, 1.25),
          duration: 0.55,
          ease: "power2.out",
        })
        .to(el, { y: "+=110", autoAlpha: 0, duration: 0.65, ease: "power1.in" }, "-=0.1");
    }
  }

  /* ---------- avatar card reactions ---------- */
  const heroCard = document.getElementById("heroCard");
  const heroBubble = document.getElementById("heroBubble");
  const PHRASES = ["Hi, I'm Dan! 👋", "Systems guy.", "Open to work ✦", "Let's talk!", "30,000 pages. Really.", "I brought a laptop."];
  let phraseI = 0;
  let bubbleTween = null;

  if (heroCard && hasGsap && !prefersReduced) {
    // lean toward the cursor
    if (isFinePointer) {
      hero.addEventListener("mousemove", (e) => {
        const r = heroCard.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        gsap.to(heroCard, { rotation: dx * -7, duration: 0.5, ease: "power2.out" });
      });
    }
    heroCard.addEventListener("click", () => {
      const r = heroCard.getBoundingClientRect();
      burstConfetti(r.left + r.width / 2, r.top + r.height * 0.3, 18);
      gsap.timeline()
        .to(heroCard, { scaleY: 0.82, scaleX: 1.08, duration: 0.12, ease: "power2.in" })
        .to(heroCard, { scaleY: 1, scaleX: 1, y: -26, duration: 0.28, ease: "back.out(2.5)" })
        .to(heroCard, { y: 0, duration: 0.45, ease: "bounce.out" });
      heroBubble.textContent = PHRASES[phraseI++ % PHRASES.length];
      if (bubbleTween) bubbleTween.kill();
      bubbleTween = gsap.timeline()
        .fromTo(heroBubble,
          { autoAlpha: 0, scale: 0.5, y: 8 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(2)" })
        .to(heroBubble, { autoAlpha: 0, y: -10, duration: 0.3, delay: 1.6 });
    });
  }

  /* ---------- CTA confetti ---------- */
  const ctaTalk = document.getElementById("ctaTalk");
  if (ctaTalk) {
    ctaTalk.addEventListener("click", (e) => {
      const r = ctaTalk.getBoundingClientRect();
      burstConfetti(r.left + r.width / 2, r.top, 14);
    });
  }

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("mobileMenu");
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    burger.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    menu.classList.add("is-open");
    if (lenis) lenis.stop();
    if (hasGsap && !prefersReduced) {
      gsap.fromTo(menu.querySelectorAll("nav a, .mobile-menu-foot a"),
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "power3.out", delay: 0.08 });
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    menu.classList.remove("is-open");
    if (lenis) lenis.start();
  }

  if (burger) burger.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

  /* ---------- scroll reveals ---------- */
  if (hasGsap && !prefersReduced) {
    gsap.utils.toArray("main > :not(.hero) [data-reveal], main > [data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 36,
        autoAlpha: 0,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // sketch divider lines draw in
    gsap.utils.toArray(".sketch-line").forEach((line) => {
      gsap.from(line, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: line, start: "top 95%" },
      });
    });

    // count-ups
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const useComma = el.dataset.format === "comma";
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter() {
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: "power3.out",
            onUpdate() {
              const n = Math.round(obj.v);
              el.textContent = useComma ? n.toLocaleString("en-US") : n;
            },
          });
        },
      });
    });
  } else {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const n = parseFloat(el.dataset.count);
      el.textContent = el.dataset.format === "comma" ? n.toLocaleString("en-US") : n;
    });
    const path = document.getElementById("underlinePath");
    if (path) path.style.strokeDashoffset = "0";
  }

  /* ---------- capability tabs ---------- */
  const CAPS = [
    {
      title: "Enterprise Web Operations",
      body: "Governance, CMS adoption, intake, prioritization, and delivery workflows for 30,000+ pages and 200+ distributed editors — translated from chaos into systems teams can actually run.",
      items: ["Web governance & digital standards", "Agile intake & high-volume delivery", "Stakeholder training & enablement"],
    },
    {
      title: "Practical AI Adoption",
      body: "AI-assisted workflows that improve content operations, QA, reporting, and delivery speed — adopted responsibly, without losing strategic or financial judgment.",
      items: ["AI-driven workflow optimization", "Content ops & QA automation", "Google AI certified"],
    },
    {
      title: "Growth, Budgets & Analytics",
      body: "Multi-million-dollar budgets managed with P&L-minded discipline. Built advertising and analytics functions from scratch while revenue grew from $11M to $31M.",
      items: ["$3M+ annual ad spend managed", "Salesforce & Tableau reporting buildouts", "Vendor transitions & in-housing"],
    },
    {
      title: "UX & Accessibility at Scale",
      body: "Directed a university-wide WCAG accessibility initiative completed in under three months, and independently redesigned a hundreds-of-pages site in five.",
      items: ["WCAG compliance leadership", "Information architecture & UX strategy", "GA4, GTM & Microsoft Clarity insight"],
    },
  ];

  const tabButtons = [...document.querySelectorAll(".tab")];
  const capTitle = document.getElementById("capTitle");
  const capBody = document.getElementById("capBody");
  const capList = document.getElementById("capList");
  const capPanel = document.getElementById("cap-panel");

  function selectTab(i) {
    tabButtons.forEach((b, j) => {
      b.classList.toggle("is-active", i === j);
      b.setAttribute("aria-selected", i === j ? "true" : "false");
    });
    capPanel.setAttribute("aria-labelledby", "tab-" + i);
    const apply = () => {
      const c = CAPS[i];
      capTitle.textContent = c.title;
      capBody.textContent = c.body;
      capList.innerHTML = c.items.map((t) => `<li>${t}</li>`).join("");
    };
    if (hasGsap && !prefersReduced) {
      gsap.timeline()
        .to(capPanel, { autoAlpha: 0, y: 14, duration: 0.18, ease: "power2.in", onComplete: apply })
        .to(capPanel, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" });
    } else {
      apply();
    }
  }

  tabButtons.forEach((b) => b.addEventListener("click", () => selectTab(+b.dataset.tab)));
  // arrow-key support on the tablist
  document.querySelector(".tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const cur = tabButtons.findIndex((b) => b.classList.contains("is-active"));
    const next = (cur + (e.key === "ArrowRight" ? 1 : tabButtons.length - 1)) % tabButtons.length;
    selectTab(next);
    tabButtons[next].focus();
  });

  /* ---------- three.js: particle wave inside the browser frame ---------- */
  (function initWave() {
    const canvas = document.getElementById("waveCanvas");
    if (!canvas || typeof window.THREE === "undefined" || prefersReduced) return;

    const screen = canvas.parentElement;
    let width = screen.clientWidth;
    let height = screen.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 2.3, 6.4);
    camera.lookAt(0, 0, 0);

    const isNarrow = width < 720;
    const COLS = isNarrow ? 80 : 140;
    const ROWS = isNarrow ? 50 : 80;
    const count = COLS * ROWS;

    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    let p = 0;
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        positions[p * 3] = (i / (COLS - 1) - 0.5) * 22;
        positions[p * 3 + 1] = 0;
        positions[p * 3 + 2] = (j / (ROWS - 1) - 0.5) * 14;
        seeds[p] = Math.random();
        p++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.8) },
        uColorA: { value: new THREE.Color("#eacdc2") },
        uColorB: { value: new THREE.Color("#5d6069") },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;
        attribute float aSeed;
        varying float vElev;
        varying float vDist;

        void main() {
          vec3 pos = position;
          float t = uTime * 0.5;

          float wave =
            sin(pos.x * 0.55 + t) * 0.45 +
            sin(pos.z * 0.85 + t * 1.4) * 0.3 +
            sin((pos.x + pos.z) * 0.35 + t * 0.7) * 0.35;

          float md = distance(pos.xz * 0.08, uMouse * vec2(1.1, 0.7));
          wave += smoothstep(0.5, 0.0, md) * 0.6;

          pos.y += wave;
          vElev = wave;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          vDist = -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.0 + aSeed * 2.0 + wave * 1.1) * uPixelRatio * (8.0 / vDist);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying float vElev;
        varying float vDist;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.05, d);
          alpha *= smoothstep(16.0, 5.0, vDist) * 0.8 + 0.2;
          vec3 color = mix(uColorB, uColorA, smoothstep(-0.9, 1.1, vElev));
          gl_FragColor = vec4(color, alpha * 0.85);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    points.position.y = -1.1;
    scene.add(points);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    if (isFinePointer) {
      window.addEventListener("mousemove", (e) => {
        const r = screen.getBoundingClientRect();
        mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
      });
    }

    let running = true;
    let rafId = null;
    const clock = new THREE.Clock();

    function tick() {
      if (!running) return;
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      material.uniforms.uTime.value = t;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    tick();

    function setRunning(v) {
      if (v === running) return;
      running = v;
      if (running) { clock.start(); tick(); }
      else if (rafId) cancelAnimationFrame(rafId);
    }
    const io = new IntersectionObserver(
      (entries) => setRunning(entries[0].isIntersecting && !document.hidden),
      { threshold: 0 }
    );
    io.observe(screen);
    document.addEventListener("visibilitychange", () =>
      setRunning(!document.hidden && screen.getBoundingClientRect().bottom > 0)
    );

    window.addEventListener("resize", () => {
      width = screen.clientWidth;
      height = screen.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  })();
})();
