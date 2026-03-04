// ─────────────────────────────────────────────────────────────────────────────
//  TPI — Homepage in Figma (native editable layers)
//  Paste into:  Plugins > Development > Open Console  then press Enter
// ─────────────────────────────────────────────────────────────────────────────

(async () => {

  // ── Font loading (with Inter fallback) ─────────────────────────────────────
  const tryFont = (family, style) =>
    figma.loadFontAsync({ family, style }).catch(() => null);

  const hasFG = await tryFont('Familjen Grotesk', 'Bold');
  await tryFont('Familjen Grotesk', 'ExtraBold');
  await tryFont('Familjen Grotesk', 'Regular');
  const hasDS = await tryFont('DM Sans', 'Regular');
  await tryFont('DM Sans', 'Medium');

  // Fallback if Google Fonts aren't synced in this account
  if (!hasFG || !hasDS) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Extra Bold' });
  }

  const FG = hasFG ? 'Familjen Grotesk' : 'Inter';
  const DS = hasDS ? 'DM Sans'          : 'Inter';
  const FG_HEAVY = hasFG ? 'ExtraBold' : 'Extra Bold';

  // ── Palette ────────────────────────────────────────────────────────────────
  const RED    = { r: 0.910, g: 0.086, b: 0.169 }; // #E8162B
  const BLUE   = { r: 0.106, g: 0.247, b: 0.910 }; // #1B3FE8
  const YELLOW = { r: 0.961, g: 0.902, b: 0.086 }; // #F5E616
  const WHITE  = { r: 1,     g: 1,     b: 1      };
  const BLACK  = { r: 0.039, g: 0.039, b: 0.039 }; // #0A0A0A

  // ── Layout (1440-wide desktop frame) ───────────────────────────────────────
  const W      = 1440;
  const G      = 80;    // gutter each side → 1280 container
  const CW     = 1280;  // container width

  // ── Helpers ────────────────────────────────────────────────────────────────
  const solid = (color, a = 1) => [{ type: 'SOLID', color, opacity: a }];

  function mkFrame(name, x, y, w, h, color, a = 1) {
    const f = figma.createFrame();
    f.name = name; f.x = x; f.y = y;
    f.resize(w, h);
    f.fills = color ? solid(color, a) : [];
    f.clipsContent = false;
    return f;
  }

  function mkRect(name, x, y, w, h, color, a = 1) {
    const r = figma.createRectangle();
    r.name = name; r.x = x; r.y = y;
    r.resize(w, h);
    r.fills = solid(color, a);
    return r;
  }

  function mkLine(name, x, y, w, color, a = 1) {
    const r = mkRect(name, x, y, w, 2, color, a);
    return r;
  }

  function mkText(content, x, y, opts = {}) {
    const t = figma.createText();
    t.x = x; t.y = y;
    const fam   = opts.family || FG;
    const style = opts.style  || 'Regular';
    try { t.fontName = { family: fam, style }; } catch (_) {
          t.fontName = { family: 'Inter', style: 'Regular' }; }
    if (opts.w) { t.textAutoResize = 'HEIGHT'; t.resize(opts.w, 100); }
    t.characters = String(content);
    if (opts.size)    t.fontSize       = opts.size;
    if (opts.color)   t.fills          = solid(opts.color, opts.a ?? 1);
    if (opts.ls)      t.letterSpacing  = { value: opts.ls, unit: 'PIXELS' };
    if (opts.lh)      t.lineHeight     = { value: opts.lh, unit: 'PERCENT' };
    if (opts.upper)   t.textCase       = 'UPPER';
    return t;
  }

  function mkEye(type, size) {
    const fills = { red: '#E8162B', blue: '#1B3FE8', yellow: '#F5E616' };
    const strokes = { red: 'white', blue: 'white', yellow: '#0A0A0A' };
    const pupils = {
      red:    `<path d="M 60 49 Q 67 60 60 71 Q 53 60 60 49 Z" fill="white"/>`,
      blue:   `<circle cx="60" cy="60" r="8" fill="white"/>`,
      yellow: `<path d="M 60 52 L 61.3 56.8 L 65.7 54.3 L 63.2 58.7 L 68 60 L 63.2 61.3 L 65.7 65.7 L 61.3 63.2 L 60 68 L 58.7 63.2 L 54.3 65.7 L 56.8 61.3 L 52 60 L 56.8 58.7 L 54.3 54.3 L 58.7 56.8 Z" fill="white"/>`,
    };
    const svg = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="${fills[type]}"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="${strokes[type]}" stroke-width="5"/>
      <path d="M 16 60 C 16 32 104 32 104 60 C 104 88 16 88 16 60 Z" fill="white"/>
      <circle cx="60" cy="60" r="18" fill="#0A0A0A"/>
      ${pupils[type]}
    </svg>`;
    const node = figma.createNodeFromSvg(svg);
    node.resize(size, size);
    node.name = `Eye / ${type}`;
    return node;
  }

  // ── Root frame ─────────────────────────────────────────────────────────────
  const root = mkFrame('Homepage — TPI', 0, 0, W, 9999, WHITE);
  figma.currentPage.appendChild(root);
  let Y = 0; // vertical cursor

  // ═══════════════════════════════════════════════════════════════════════════
  //  NAV  (72px, black)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const nav = mkFrame('Nav', 0, Y, W, 72, BLACK);
    root.appendChild(nav);

    // Logo
    const mark = mkText('TPI', G, 20, { style: 'Bold', size: 22, color: WHITE, ls: -0.6 });
    nav.appendChild(mark);

    const name = mkText('Trivial Pursuits Inc.', G + 46, 30,
      { style: 'Bold', size: 10, color: WHITE, a: 0.65, ls: 1.2, upper: true });
    nav.appendChild(name);

    // Nav links
    let nx = G + 660;
    for (const lbl of ['Work', 'Services', 'About', 'Insights']) {
      const l = mkText(lbl, nx, 28, { style: 'Bold', size: 12, color: WHITE, a: 0.8, ls: 1.0, upper: true });
      nav.appendChild(l);
      nx += 76;
    }

    // Contact CTA
    const ctaBorder = figma.createRectangle();
    ctaBorder.name = 'CTA border'; ctaBorder.x = W - G - 100; ctaBorder.y = 20;
    ctaBorder.resize(100, 32); ctaBorder.fills = [];
    ctaBorder.strokes = [{ type: 'SOLID', color: WHITE, opacity: 0.45 }];
    ctaBorder.strokeWeight = 2;
    nav.appendChild(ctaBorder);

    const ctaText = mkText('Contact', W - G - 84, 28, { style: 'Bold', size: 12, color: WHITE, ls: 0.8, upper: true });
    nav.appendChild(ctaText);

    Y += 72;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HERO  (900px, black) — headline bottom-anchored
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const H = 900;
    const hero = mkFrame('Hero', 0, Y, W, H, BLACK);
    root.appendChild(hero);

    // Decorative eyes — right side, very faint
    let eyeY = 100;
    for (const type of ['red', 'blue', 'yellow']) {
      const e = mkEye(type, 210);
      e.x = W - 270; e.y = eyeY; e.opacity = 0.12;
      hero.appendChild(e);
      eyeY += 232;
    }

    // Eyebrow label
    const eyebrow = mkText('Brand Strategy · Systems · Growth', G, 598,
      { style: 'Bold', size: 11, color: WHITE, a: 0.5, ls: 1.8, upper: true });
    hero.appendChild(eyebrow);

    // Headline (3 lines, huge)
    let hy = 627;
    for (const word of ['Clarity', 'that', 'converts.']) {
      const h = mkText(word, G, hy,
        { style: FG_HEAVY, size: 152, color: WHITE, ls: -6.1, lh: 86 });
      hero.appendChild(h);
      hy += 134;
    }

    // Sub
    const sub = mkText('We build the strategy behind brands that move markets.',
      G, H - 138, { family: DS, style: 'Regular', size: 22, color: WHITE, a: 0.8, lh: 145, w: 520 });
    hero.appendChild(sub);

    // CTA button
    const btnBg = figma.createRectangle();
    btnBg.name = 'Hero CTA bg'; btnBg.x = G; btnBg.y = H - 76;
    btnBg.resize(172, 50); btnBg.fills = [];
    btnBg.strokes = [{ type: 'SOLID', color: WHITE }]; btnBg.strokeWeight = 2;
    hero.appendChild(btnBg);

    const btnTxt = mkText('See our work', G + 24, H - 63,
      { style: 'Bold', size: 13, color: WHITE, ls: 1.0, upper: true });
    hero.appendChild(btnTxt);

    Y += H;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  WHAT WE DO  (white, 500px)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const H = 500;
    const sec = mkFrame('What We Do', 0, Y, W, H, WHITE);
    root.appendChild(sec);

    sec.appendChild(mkText('What we do', G, 80,
      { style: 'Bold', size: 11, color: BLACK, a: 0.45, ls: 2.0, upper: true }));

    sec.appendChild(mkText('Three disciplines.\nOne point of view.', G, 108,
      { style: FG_HEAVY, size: 76, color: BLACK, ls: -2.3, lh: 100 }));

    // Top border
    sec.appendChild(mkLine('col-border-top', G, 280, CW, BLACK));

    // 3 columns
    const colW = (CW - 4) / 3; // 2px dividers
    const cols = [
      { num: '01', label: 'Brand.',    desc: 'Most companies know what they do. We help the world understand why it matters — and why it\'s you and not someone else.', link: 'Brand strategy →' },
      { num: '02', label: 'Systems.',  desc: 'A good idea trapped in a broken org never scales. We design the operating systems that let your best work compound.',      link: 'Systems design →' },
      { num: '03', label: 'Growth.',   desc: 'Go-to-market isn\'t a launch event. It\'s a repeatable system for finding the right buyers and moving them to yes.',       link: 'GTM strategy →'   },
    ];

    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      const cx  = G + i * (colW + 2);
      const pad = i === 0 ? 0 : 32;

      if (i > 0) sec.appendChild(mkRect(`divider-v${i}`, cx - 2, 280, 2, 200, BLACK));

      sec.appendChild(mkText(col.num, cx + pad, 298,
        { style: 'Bold', size: 10, color: BLACK, a: 0.35, ls: 1.8, upper: true }));

      sec.appendChild(mkText(col.label, cx + pad, 324,
        { style: FG_HEAVY, size: 52, color: BLACK, ls: -1.6, lh: 100 }));

      sec.appendChild(mkText(col.desc, cx + pad, 394,
        { family: DS, style: 'Regular', size: 15, color: BLACK, a: 0.65, lh: 165, w: colW - pad - 20 }));

      sec.appendChild(mkText(col.link, cx + pad, 462,
        { style: 'Bold', size: 12, color: BLACK, ls: 0.8, upper: true }));
    }

    Y += H;
  }

  // ── Divider ─────────────────────────────────────────────────────────────────
  root.appendChild(mkLine('Divider', 0, Y, W, BLACK, 0.1));
  Y += 2;

  // ═══════════════════════════════════════════════════════════════════════════
  //  WHY TPI  (red, 460px)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const H = 460;
    const sec = mkFrame('Why TPI', 0, Y, W, H, RED);
    root.appendChild(sec);

    sec.appendChild(mkText('Why TPI', G, 92,
      { style: 'Bold', size: 11, color: WHITE, a: 0.55, ls: 2.0, upper: true }));

    sec.appendChild(mkText('Most agencies make things\nlook good. We make them\nmake sense first.', G, 122,
      { style: FG_HEAVY, size: 76, color: WHITE, ls: -2.3, lh: 100, w: 900 }));

    sec.appendChild(mkText('Strategy without clarity is just expensive guessing. We start with the signal — the real problem, the actual opportunity — and build out from there.',
      G, 370, { family: DS, style: 'Regular', size: 20, color: WHITE, a: 0.85, lh: 150, w: 680 }));

    Y += H;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  SELECTED WORK  (white, 620px)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const H     = 620;
    const CARD  = Math.floor((CW - 6) / 3); // 3×cards + 2×3px gaps
    const sec   = mkFrame('Selected Work', 0, Y, W, H, WHITE);
    root.appendChild(sec);

    sec.appendChild(mkText('Selected work', G, 80,
      { style: 'Bold', size: 11, color: BLACK, a: 0.45, ls: 2.0, upper: true }));

    sec.appendChild(mkText('Results we\'re\nproud to name.', G, 108,
      { style: FG_HEAVY, size: 68, color: BLACK, ls: -2.0, lh: 100 }));

    sec.appendChild(mkText('See all work →', G + 840, 140,
      { style: 'Bold', size: 12, color: BLACK, ls: 0.8, upper: true }));

    const cards = [
      { bg: RED,    eyeType: 'red',    tag: 'Brand Strategy', client: 'FinTech Startup', result: 'Repositioned brand, 3× pipeline growth in 6 months.' },
      { bg: BLUE,   eyeType: 'blue',   tag: 'Systems Design',  client: 'SaaS Scale-Up',  result: 'Rebuilt org structure. Decision time cut by 60%.'     },
      { bg: YELLOW, eyeType: 'yellow', tag: 'Go-to-Market',    client: 'B2B Software',   result: 'New product launch, $2M ARR in year one.'             },
    ];

    const gridY = 268;
    for (let i = 0; i < cards.length; i++) {
      const cd   = cards[i];
      const cx   = G + i * (CARD + 3);
      const isYellow = cd.bg === YELLOW;
      const txtColor = isYellow ? BLACK : WHITE;

      const card = mkFrame(`Work Card ${i + 1}`, cx, gridY, CARD, CARD, cd.bg);
      root.appendChild(card);

      // Eye icon centred
      const eye = mkEye(cd.eyeType, Math.round(CARD * 0.38));
      eye.x = Math.round((CARD - eye.width)  / 2);
      eye.y = Math.round((CARD - eye.height) / 2) - 18;
      card.appendChild(eye);

      // Text at bottom
      card.appendChild(mkText(cd.tag,    24, CARD - 116, { style: 'Bold',    size: 10, color: txtColor, a: 0.5,  ls: 1.8, upper: true }));
      card.appendChild(mkText(cd.client, 24, CARD - 92,  { style: FG_HEAVY, size: 18, color: txtColor, ls: -0.4 }));
      card.appendChild(mkText(cd.result, 24, CARD - 62,  { family: DS, style: 'Regular', size: 13, color: txtColor, a: 0.75, lh: 150, w: CARD - 48 }));
    }

    Y += H;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  INSIGHTS TEASER  (black, 460px)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const H   = 460;
    const sec = mkFrame('Insights', 0, Y, W, H, BLACK);
    root.appendChild(sec);

    sec.appendChild(mkText('From the desk', G, 80,
      { style: 'Bold', size: 11, color: WHITE, a: 0.4, ls: 2.0, upper: true }));

    sec.appendChild(mkText('Sharp thinking.\nNo filler.', G, 108,
      { style: FG_HEAVY, size: 68, color: WHITE, ls: -2.0, lh: 100 }));

    sec.appendChild(mkText('Read the thinking →', G + 840, 140,
      { style: 'Bold', size: 12, color: WHITE, a: 0.7, ls: 0.8, upper: true }));

    const postW = (CW - 32) / 2;
    const posts = [
      { tag: 'Brand',   tagColor: RED,  title: 'Why your positioning statement is lying to you',
        excerpt: 'Most positioning statements describe a category, not a company. Here\'s how to tell the difference — and what to do about it.', meta: '6 min read' },
      { tag: 'Systems', tagColor: BLUE, title: 'The org chart is not the org',
        excerpt: 'Your formal structure and your actual decision-making system are two different things. Fixing one without the other changes nothing.', meta: '5 min read' },
    ];

    for (let i = 0; i < posts.length; i++) {
      const p  = posts[i];
      const px = G + i * (postW + 32);
      const py = 268;

      sec.appendChild(mkRect(`post-border-${i}`, px, py, postW, 3, WHITE, 0.2));
      sec.appendChild(mkText(p.tag,     px, py + 18,  { style: 'Bold',    size: 10, color: p.tagColor, ls: 1.8, upper: true }));
      sec.appendChild(mkText(p.title,   px, py + 48,  { style: FG_HEAVY, size: 22, color: WHITE, ls: -0.5, lh: 110, w: postW }));
      sec.appendChild(mkText(p.excerpt, px, py + 120, { family: DS, style: 'Regular', size: 15, color: WHITE, a: 0.55, lh: 165, w: postW }));
      sec.appendChild(mkText(p.meta,    px, py + 214, { style: 'Bold', size: 11, color: WHITE, a: 0.4, ls: 1.0, upper: true }));
    }

    Y += H;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FOOTER  (black, 220px)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const H      = 220;
    const footer = mkFrame('Footer', 0, Y, W, H, BLACK);
    root.appendChild(footer);

    footer.appendChild(mkText('TPI', G, 48, { style: FG_HEAVY, size: 36, color: WHITE, ls: -1.1 }));
    footer.appendChild(mkText('Clarity that converts.', G, 98, { style: 'Bold', size: 11, color: WHITE, a: 0.4, ls: 1.6, upper: true }));

    let lx = G;
    for (const lbl of ['Privacy', 'LinkedIn', 'Email']) {
      footer.appendChild(mkText(lbl, lx, 140, { style: 'Bold', size: 11, color: WHITE, a: 0.35, ls: 1.4, upper: true }));
      lx += 88;
    }

    footer.appendChild(mkText('© 2025 Trivial Pursuits Inc. All rights reserved.', G, 165,
      { family: DS, style: 'Regular', size: 12, color: WHITE, a: 0.25 }));

    // Footer eye trio
    let ex = W - G - 220;
    for (const type of ['red', 'blue', 'yellow']) {
      const e = mkEye(type, 64);
      e.x = ex; e.y = 72;
      footer.appendChild(e);
      ex += 80;
    }

    Y += H;
  }

  // ── Trim frame & zoom ──────────────────────────────────────────────────────
  root.resize(W, Y);
  figma.viewport.scrollAndZoomIntoView([root]);

  console.log('✅ "Homepage — TPI" created — ' + Y + 'px tall');
  console.log('   Sections: Nav · Hero · What We Do · Why TPI · Work · Insights · Footer');

})();
