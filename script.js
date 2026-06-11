/* ============================================================
   morency.dev — interactions
   ============================================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  if (hasGsap && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!prefersReduced && typeof window.Lenis !== "undefined" && hasGsap) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor links work through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- split hero words into chars ---------- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = text
      .split("")
      .map((c) => (c === " " ? "<span class='char'>&nbsp;</span>" : `<span class="char">${c}</span>`))
      .join("");
  });

  /* ---------- preloader + hero intro ---------- */
  const preloader = document.getElementById("preloader");
  const countEl = document.getElementById("preloaderCount");

  function heroIntro() {
    if (!hasGsap || prefersReduced) return;
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero-title .char", {
      yPercent: 110,
      rotate: 4,
      duration: 1.1,
      stagger: 0.035,
    });
    tl.from(
      ".hero .reveal-up",
      { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.12 },
      "-=0.6"
    );
    tl.from(".hero-foot", { autoAlpha: 0, duration: 0.8 }, "-=0.4");
  }

  if (prefersReduced || !hasGsap) {
    if (preloader) preloader.remove();
  } else {
    const counter = { v: 0 };
    const loadTl = gsap.timeline({
      onComplete() {
        preloader.remove();
        heroIntro();
      },
    });
    loadTl
      .to(counter, {
        v: 100,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate() {
          countEl.textContent = Math.round(counter.v);
        },
      })
      .to(preloader, {
        yPercent: -100,
        duration: 0.7,
        ease: "power3.inOut",
      });
    // Safety: if rAF is throttled (hidden/background tab), don't trap the page
    setTimeout(() => {
      if (document.getElementById("preloader")) {
        loadTl.kill();
        preloader.remove();
        gsap.set([".hero-title .char", ".hero .reveal-up", ".hero-foot"], { clearProps: "all" });
      }
    }, 4000);
  }

  /* ---------- custom cursor ---------- */
  const cursor = document.getElementById("cursor");
  if (cursor && isFinePointer && !prefersReduced && hasGsap) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });
    window.addEventListener("mousemove", (e) => {
      cursor.classList.add("is-active");
      xTo(e.clientX);
      yTo(e.clientY);
    });
    document.querySelectorAll("[data-hover]").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (isFinePointer && !prefersReduced && hasGsap) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.4,
          ease: "power3.out",
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
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
    if (lenis) lenis.stop();
    if (hasGsap && !prefersReduced) {
      gsap.set(menu, { visibility: "visible" });
      gsap.to(menu, { clipPath: "inset(0% 0 0% 0)", duration: 0.6, ease: "power3.inOut" });
      gsap.fromTo(
        menu.querySelectorAll("nav a"),
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, delay: 0.25, ease: "power3.out" }
      );
    } else {
      menu.style.visibility = "visible";
      menu.style.clipPath = "inset(0% 0 0% 0)";
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
    if (hasGsap && !prefersReduced) {
      gsap.to(menu, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => gsap.set(menu, { visibility: "hidden" }),
      });
    } else {
      menu.style.clipPath = "inset(0 0 100% 0)";
      menu.style.visibility = "hidden";
    }
  }

  if (burger) {
    burger.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
  }

  /* ---------- scroll animations ---------- */
  if (hasGsap && !prefersReduced) {
    // Generic reveal-up outside hero
    gsap.utils.toArray(".section .reveal-up").forEach((el) => {
      gsap.from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // About: word-by-word scrub reveal
    const aboutText = document.querySelector("[data-words]");
    if (aboutText) {
      const words = aboutText.textContent.trim().split(/\s+/);
      aboutText.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
      gsap.to(aboutText.querySelectorAll(".w"), {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: aboutText,
          start: "top 80%",
          end: "bottom 45%",
          scrub: 0.6,
        },
      });
    }

    // About figure: pop in, then drift on scroll
    const figure = document.getElementById("aboutFigure");
    if (figure) {
      const avatar = figure.querySelector(".about-avatar");
      gsap.from(avatar, {
        y: 80,
        rotate: 5,
        autoAlpha: 0,
        duration: 1.1,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: figure, start: "top 80%" },
      });
      gsap.from(figure.querySelector(".about-badge"), {
        scale: 0,
        rotate: -120,
        duration: 0.9,
        ease: "back.out(2)",
        scrollTrigger: { trigger: figure, start: "top 70%" },
      });
      gsap.to(figure, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: figure,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
      if (isFinePointer) {
        figure.addEventListener("mousemove", (e) => {
          const r = figure.getBoundingClientRect();
          const dx = (e.clientX - r.left) / r.width - 0.5;
          gsap.to(avatar, { rotate: dx * 6, x: dx * 14, duration: 0.6, ease: "power2.out" });
        });
        figure.addEventListener("mouseleave", () => {
          gsap.to(avatar, { rotate: 0, x: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
        });
      }
    }

    // Numbers: count up once on enter
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const useComma = el.dataset.format === "comma";
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter() {
          gsap.to(obj, {
            v: target,
            duration: 1.8,
            ease: "power3.out",
            onUpdate() {
              const n = Math.round(obj.v);
              el.textContent = useComma ? n.toLocaleString("en-US") : n;
            },
          });
        },
      });
    });

    // Experience: scale previous card down as the next overlaps it
    const cards = gsap.utils.toArray(".exp-card");
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.fromTo(card, {
        scale: 1,
        filter: "brightness(1)",
      }, {
        scale: 0.93,
        filter: "brightness(0.45)",
        ease: "none",
        scrollTrigger: {
          trigger: cards[i + 1],
          start: "top bottom",
          end: "top top+=120",
          scrub: true,
        },
      });
    });

    // Capability rows: slide in
    gsap.utils.toArray(".cap-row").forEach((row) => {
      gsap.from(row, {
        y: 50,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 90%" },
      });
    });

    // Contact: chars rise in
    const contactChars = document.querySelectorAll(".contact-link .char");
    if (contactChars.length) {
      gsap.from(contactChars, {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.03,
        ease: "power4.out",
        scrollTrigger: { trigger: ".contact-title", start: "top 85%" },
      });
    }
  } else {
    // Reduced motion: make scrub-hidden text fully visible
    const aboutText = document.querySelector("[data-words]");
    if (aboutText) aboutText.style.opacity = "1";
    document.querySelectorAll("[data-count]").forEach((el) => {
      const n = parseFloat(el.dataset.count);
      el.textContent = el.dataset.format === "comma" ? n.toLocaleString("en-US") : n;
    });
  }

  /* ---------- Three.js hero: particle wave field ---------- */
  (function initHero() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas || typeof window.THREE === "undefined" || prefersReduced) return;

    const hero = document.getElementById("hero");
    let width = hero.clientWidth;
    let height = hero.clientHeight;

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
    camera.position.set(0, 2.4, 6.5);
    camera.lookAt(0, 0, 0);

    const isMobile = width < 720;
    const COLS = isMobile ? 90 : 160;
    const ROWS = isMobile ? 60 : 90;
    const SPREAD_X = 22;
    const SPREAD_Z = 14;
    const count = COLS * ROWS;

    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    let p = 0;
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        positions[p * 3] = (i / (COLS - 1) - 0.5) * SPREAD_X;
        positions[p * 3 + 1] = 0;
        positions[p * 3 + 2] = (j / (ROWS - 1) - 0.5) * SPREAD_Z;
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
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.8) },
        uColorA: { value: new THREE.Color("#d9f154") },
        uColorB: { value: new THREE.Color("#6b7558") },
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
          float t = uTime * 0.55;

          float wave =
            sin(pos.x * 0.55 + t) * 0.45 +
            sin(pos.z * 0.85 + t * 1.4) * 0.3 +
            sin((pos.x + pos.z) * 0.35 + t * 0.7) * 0.35;

          // gentle mouse swell
          float md = distance(pos.xz * 0.08, uMouse * vec2(1.1, 0.7));
          wave += smoothstep(0.5, 0.0, md) * 0.6;

          pos.y += wave;
          vElev = wave;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          vDist = -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.2 + aSeed * 2.2 + wave * 1.2) * uPixelRatio * (8.0 / vDist);
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
          gl_FragColor = vec4(color, alpha * 0.9);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    points.position.y = -1.2;
    scene.add(points);

    // mouse parallax
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    if (isFinePointer) {
      window.addEventListener("mousemove", (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
      });
    }

    let running = true;
    let rafId = null;
    const clock = new THREE.Clock();

    function tick() {
      if (!running) return;
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      material.uniforms.uTime.value = t;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      camera.position.x = mouse.x * 0.4;
      camera.position.y = 2.4 + mouse.y * 0.2;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    tick();

    // pause when hero offscreen or tab hidden
    function setRunning(v) {
      if (v === running) return;
      running = v;
      if (running) {
        clock.start();
        tick();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
      }
    }
    const io = new IntersectionObserver(
      (entries) => setRunning(entries[0].isIntersecting && !document.hidden),
      { threshold: 0 }
    );
    io.observe(hero);
    document.addEventListener("visibilitychange", () =>
      setRunning(!document.hidden && hero.getBoundingClientRect().bottom > 0)
    );

    window.addEventListener("resize", () => {
      width = hero.clientWidth;
      height = hero.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  })();
})();
