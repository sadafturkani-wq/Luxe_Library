/* ==========================================================================
   LUXE LIBRARY — script.js
   Data + SVG cover generator + all interactions.
   No dependencies, no build step. State persists in localStorage only.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Storage
  --------------------------------------------------------------------- */
  var LS = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem('luxe:' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem('luxe:' + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  /* ---------------------------------------------------------------------
     Catalogue data — 18 volumes across eight disciplines.
     Public-domain classics are attributed to their real authors; a few
     atmospheric titles use fictional authors to keep the record honest.
  --------------------------------------------------------------------- */
  var BOOKS = [
    { id: 'the-cartographers-daughter', title: 'The Cartographer’s Daughter', cat: 'Fiction', author: 'Niall Byrne', year: null, pages: 344, dur: 260,
      blurb: 'A mapmaker’s daughter inherits her father’s unfinished charts — and the coastline they refuse to agree on.',
      synopsis: 'Niall Byrne’s second novel moves between a shrinking Irish shore and the archives of a man who spent his life trying to pin the sea to paper. Told in alternating registers of grief and precision, it is a story about the maps we inherit and the ones we quietly redraw. Quietly devastating, and impossible to put down.',
      quote: 'Every map is an argument about what deserves to be remembered.' },
    { id: 'the-vermilion-letter', title: 'The Vermilion Letter', cat: 'Mystery', author: 'Margaux Delacroix', year: null, pages: 398, dur: 300,
      blurb: 'A sealed crimson letter arrives a century late, and the small town that receives it would rather it hadn’t.',
      synopsis: 'Margaux Delacroix sets a slow-burn mystery in a French hill town where the past is a locked room. When a letter written in vermilion ink surfaces at an estate sale, three families discover their respectable histories share a single, dangerous author. Elegant, wintry, and unhurried.',
      quote: 'Some doors are kept locked to protect whoever is standing behind them.' },
    { id: 'what-the-stars-remember', title: 'What the Stars Remember', cat: 'Poetry', author: 'Camille Aubert', year: null, pages: 96, dur: 70,
      blurb: 'Poems that read the night sky as a family album — light that left home long before anyone noticed.',
      synopsis: 'Camille Aubert’s debut collection braids astronomy and inheritance into slim, luminous poems. Each piece is a small act of looking back: at ancestors, at dead stars, at the lag between an event and its being seen. A book to keep on the nightstand and read one poem a night.',
      quote: 'We are always reading the past, lit by things already gone.' },
    { id: 'pride-and-prejudice', title: 'Pride and Prejudice', cat: 'Fiction', author: 'Jane Austen', year: 1813, pages: 432, dur: 330,
      blurb: 'The sharpest wit in English letters turns a marriage market into a comedy of self-knowledge.',
      synopsis: 'Elizabeth Bennet and Mr. Darcy remain the most quoted quarrel in literature: two intelligent people misreading each other until they can no longer afford to. Austen’s irony is a moral instrument, cutting away pride and prejudice to leave something like honesty. The novel never grows old.',
      quote: 'Till this moment I never knew myself.' },
    { id: 'emma', title: 'Emma', cat: 'Fiction', author: 'Jane Austen', year: 1815, pages: 474, dur: 360,
      blurb: 'A brilliant, self-satisfied young woman matchmaking her village into chaos she cannot see coming.',
      synopsis: 'Austen called Emma a heroine “no one but myself will much like,” and the book’s pleasure is precisely in watching a clever woman learn the limits of her own cleverness. A comedy of misreading, patience, and the slow correction of the heart.',
      quote: 'Seldom, very seldom, does complete truth belong to any human disclosure.' },
    { id: 'crime-and-punishment', title: 'Crime and Punishment', cat: 'Fiction', author: 'Fyodor Dostoevsky', year: 1866, pages: 545, dur: 420,
      blurb: 'A destitute student murders to prove he is extraordinary, then discovers what the proof costs.',
      synopsis: 'Dostoevsky’s great nerve-shredder of a novel is a crime story in which the crime is almost an afterthought and the pursuit is inward. St. Petersburg presses in, fever rises, and a theory about ordinary and extraordinary men meets the reality of a human soul. Unbearable and indispensable.',
      quote: 'To do a human deed, one must take a human life.' },
    { id: 'the-brothers-karamazov', title: 'The Brothers Karamazov', cat: 'Fiction', author: 'Fyodor Dostoevsky', year: 1880, pages: 796, dur: 600,
      blurb: 'Three brothers, one murdered father, and the biggest arguments a novel can hold.',
      synopsis: 'Dostoevsky’s last and largest book is a family murder trial that keeps turning into a debate about God, freedom, and suffering. Faith and doubt are given their strongest possible voices and neither is permitted an easy win. A long shelf-sitter and a lifelong companion.',
      quote: 'The awful thing is that it is sometimes exactly true.' },
    { id: 'frankenstein', title: 'Frankenstein', cat: 'Fiction', author: 'Mary Shelley', year: 1818, pages: 280, dur: 210,
      blurb: 'A young scientist makes life and is not ready for what it asks of him.',
      synopsis: 'Written by Mary Shelley when she was barely nineteen, Frankenstein is less a monster story than a tragedy of abandonment — of a creature, and of a creator. Its questions about ambition, responsibility, and who counts as human have only grown sharper with time.',
      quote: 'Beware; for I am fearless, and therefore powerful.' },
    { id: 'the-odyssey', title: 'The Odyssey', cat: 'Poetry', author: 'Homer', year: null, pages: 541, dur: 400,
      blurb: 'The first great adventure story: a long way home, told as if we have all taken the trip.',
      synopsis: 'Homer’s wanderer outwots gods and monsters to reach the one shore he wants, only to find it has changed too. Less about the marvels than about the ache of return, it remains the template for every story of going far in order to come back.',
      quote: 'Sing to me of the man, Muse, the man of twists and turns.' },
    { id: 'leaves-of-grass', title: 'Leaves of Grass', cat: 'Poetry', author: 'Walt Whitman', year: 1855, pages: 384, dur: 220,
      blurb: 'A self-portrait enlarged to include everyone — America inventing a new line to breathe in.',
      synopsis: 'Whitman threw out meter and built long, rolling, defiantly alive verses to contain a whole continent and its speaker at once. Part hymn, part catalogue, part love letter to the body and the crowd, it remade what a poem could hold.',
      quote: 'I am large, I contain multitudes.' },
    { id: 'meditations', title: 'Meditations', cat: 'Philosophy', author: 'Marcus Aurelius', year: 180, pages: 254, dur: 190,
      blurb: 'A Roman emperor’s private notebook on staying decent in a life that keeps getting worse.',
      synopsis: 'Never meant for publication, Meditations is the emperor writing stoic reminders to himself between wars and plague. Its power is in its modesty: short, repeated, practical advice on attention, impermanence, and treating people well anyway.',
      quote: 'You have power over your mind — not outside events. Realize this, and you will find strength.' },
    { id: 'the-republic', title: 'The Republic', cat: 'Philosophy', author: 'Plato', year: null, pages: 416, dur: 320,
      blurb: 'An old argument about justice that turns, memorably, into a design for an impossible city.',
      synopsis: 'Socrates and friends try to define justice by building an ideal state and reading it back onto the soul. Along the way we get the cave, the philosopher-kings, and the first great quarrel between philosophy and poetry. Two and a half millennia on, still foundational.',
      quote: 'The measure of a man is what he does with power.' },
    { id: 'thus-spoke-zarathustra', title: 'Thus Spoke Zarathustra', cat: 'Philosophy', author: 'Friedrich Nietzsche', year: 1885, pages: 352, dur: 300,
      blurb: 'A prophet comes down the mountain to announce that the old heavens are empty.',
      synopsis: 'Nietzsche wrote this in the voice of Zarathustra, a wandering teacher, to stage his hardest ideas — the death of God, the will to power, the eternal return — as parable and song rather than argument. It is philosophy as poetry, and poetry as a dare.',
      quote: 'And those who were seen dancing were thought to be insane by those who could not hear the music.' },
    { id: 'the-interpretation-of-dreams', title: 'The Interpretation of Dreams', cat: 'Psychology', author: 'Sigmund Freud', year: 1899, pages: 620, dur: 460,
      blurb: 'The book that taught a century to read its own nights — wish-fulfilment, disguise, and all.',
      synopsis: 'Freud’s dense founding text argues that dreams are wish-fulfilments in costume, and builds an entire method of interpretation from that claim. Whether or not you believe him, you cannot unread him: modern talk about the unconscious starts here.',
      quote: 'The dream is the (disguised) fulfilment of a (suppressed, repressed) wish.' },
    { id: 'the-origin-of-species', title: 'On the Origin of Species', cat: 'Science', author: 'Charles Darwin', year: 1859, pages: 490, dur: 380,
      blurb: 'One plain, enormous idea, argued in a country gentleman’s patient prose: descent with modification.',
      synopsis: 'Darwin did not discover evolution; he supplied its mechanism — natural selection — and marshalled evidence so steadily that the argument became almost overwhelming. The Victorian plainness of the writing only sharpens the revolution inside it.',
      quote: 'There is grandeur in this view of life.' },
    { id: 'cosmos', title: 'Kosmos', cat: 'Science', author: 'Alexander von Humboldt', year: 1845, pages: 690, dur: 500,
      blurb: 'The first attempt to describe the whole physical world as a single living web.',
      synopsis: 'Humboldt’s great synthesis gathers geology, climate, botany, and astronomy into one interconnected picture of nature — and coins the intuition that everything affects everything else. The ancestor of systems thinking and of modern environmentalism alike.',
      quote: 'Nature is a whole, maintained by the interaction of all its parts.' },
    { id: 'the-art-of-war', title: 'The Art of War', cat: 'History', author: 'Sun Tzu', year: null, pages: 132, dur: 90,
      blurb: 'A short, cold classic on winning without fighting, still quoted from boardrooms to battlefields.',
      synopsis: 'Sun Tzu’s treatise is less about violence than about calculation, deception, and the price of conflict. Its aphorisms on knowing yourself, choosing the ground, and winning before the battle have outlived every empire they warned against.',
      quote: 'Every battle is won or lost before it is ever fought.' },
    { id: 'the-quiet-hours', title: 'The Quiet Hours', cat: 'Personal Growth', author: 'Elise Moreau', year: null, pages: 208, dur: 150,
      blurb: 'Essays on reclaiming attention: mornings, margins, and the discipline of doing less well.',
      synopsis: 'Elise Moreau writes slender, unhurried essays on attention as the scarce resource it has become. Part journal, part gentle argument, the book is about designing a life with room in it — for reading, for thinking, for the hours that are not scheduled.',
      quote: 'Attention is the beginning of devotion.' }
  ];

  var PALETTES = {
    'Fiction':         { c1: '#2A2320', c2: '#4A2D28', accent: '#C6A66B' },
    'Philosophy':      { c1: '#1D2129', c2: '#333B48', accent: '#B8A173' },
    'Psychology':      { c1: '#211E28', c2: '#39324A', accent: '#C2A86B' },
    'History':         { c1: '#241E18', c2: '#473827', accent: '#C9A96A' },
    'Poetry':          { c1: '#1F241C', c2: '#3B4430', accent: '#BFB077' },
    'Science':         { c1: '#151E21', c2: '#2B4348', accent: '#9FB6AB' },
    'Mystery':         { c1: '#121115', c2: '#2C1B26', accent: '#C6A66B' },
    'Personal Growth': { c1: '#1B201A', c2: '#37452D', accent: '#CBB06A' }
  };

  var COLLECTIONS = {
    classics: { name: 'The Classics Room', ids: ['pride-and-prejudice', 'crime-and-punishment', 'frankenstein', 'meditations'] },
    quiet:    { name: 'The Quiet Mind', ids: ['meditations', 'the-republic', 'thus-spoke-zarathustra', 'the-interpretation-of-dreams', 'the-odyssey', 'leaves-of-grass', 'the-quiet-hours'] },
    midnight: { name: 'Midnight Mysteries', ids: ['the-vermilion-letter', 'frankenstein', 'the-brothers-karamazov'] }
  };

  var AUTHORS = [
    { key: 'Jane Austen', init: 'JA', dates: '1775 – 1817', epithet: 'of Steventon', notable: 'Pride and Prejudice',
      bio: 'The rector’s daughter who published almost anonymously and rewrote the novel of manners into a precision instrument of irony. Six completed novels, and two centuries of readers still quoting her.' },
    { key: 'Fyodor Dostoevsky', init: 'FD', dates: '1821 – 1881', epithet: 'of St. Petersburg', notable: 'The Brothers Karamazov',
      bio: 'Arrested at twenty-eight, spared at the scaffold, and sent to a Siberian prison camp — then he turned the whole of that extremity into fiction that interrogates belief, guilt, and freedom more honestly than philosophy manages.' },
    { key: 'Mary Shelley', init: 'MS', dates: '1797 – 1851', epithet: 'Godwin’s daughter', notable: 'Frankenstein',
      bio: 'Daughter of two radical philosophers, she conceived Frankenstein on a stormbound holiday at nineteen and effectively invented science fiction. Her rest of her work is a sharp, unsettled record of living in the shadow of her own masterpiece.' }
  ];

  var PROMPTS = [
    'Begin the week with a book you have been postponing all year.',
    'Read ten pages before you open a single message.',
    'Choose the book you keep recommending but never finish yourself.',
    'Re-read a favourite until you find the sentence that made you love it.',
    'Read something written a hundred years before you were born.',
    'Sit with one poem long enough to read it twice.',
    'Put a pencil in your hand and argue with the author in the margin.'
  ];

  /* ---------------------------------------------------------------------
     State
  --------------------------------------------------------------------- */
  var state = {
    saved: LS.get('saved', []),
    favorites: LS.get('favorites', []),
    status: LS.get('status', {}),
    sessions: LS.get('sessions', []),
    subscribed: LS.get('subscribed', false),
    category: 'all',
    collection: null,
    author: null,
    query: '',
    sort: 'curated',
    libTab: 'saved'
  };
  function indexById(id) { for (var i = 0; i < BOOKS.length; i++) { if (BOOKS[i].id === id) return i; } return -1; }
  function bookById(id) { var i = indexById(id); return i < 0 ? null : BOOKS[i]; }

  /* ---------------------------------------------------------------------
     Helpers
  --------------------------------------------------------------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function has(arr, v) { return arr.indexOf(v) !== -1; }
  function toggle(arr, v) { var i = arr.indexOf(v); if (i < 0) arr.push(v); else arr.splice(i, 1); }

  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  function formatYear(b) {
    if (b.year === null || b.year === undefined) return 'Antiquity / modern';
    if (b.year < 0) return 'c. ' + Math.abs(b.year) + ' BCE';
    return String(b.year);
  }

  /* ---------------------------------------------------------------------
     SVG cover generator — covers are fixed artwork in both themes
  --------------------------------------------------------------------- */
  function wrapLines(text, maxChars) {
    var words = text.split(' '), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (test.length > maxChars && line) { lines.push(line); line = words[i]; }
      else { line = test; }
    }
    if (line) lines.push(line);
    return lines;
  }

  function coverSVG(b) {
    var p = PALETTES[b.cat] || PALETTES['Fiction'];
    var gid = 'cv-' + b.id;
    var lines = wrapLines(b.title, 13);
    var lh = 34;
    var startY = 214 - (lines.length - 1) * (lh / 2);
    var titleMarkup = lines.map(function (ln, i) {
      return '<text x="163" y="' + (startY + i * lh) + '" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="27" font-weight="600" font-style="italic" fill="' + p.accent + '">' + esc(ln) + '</text>';
    }).join('');

    return '' +
      '<svg class="cover-svg" viewBox="0 0 300 450" width="300" height="450" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Cover of ' + esc(b.title) + '">' +
        '<defs>' +
          '<linearGradient id="bg-' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="' + p.c2 + '"/><stop offset="1" stop-color="' + p.c1 + '"/>' +
          '</linearGradient>' +
          '<linearGradient id="sp-' + gid + '" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect x="0" y="0" width="300" height="450" rx="2" fill="url(#bg-' + gid + ')"/>' +
        '<rect x="0" y="0" width="24" height="450" fill="url(#sp-' + gid + ')"/>' +
        '<rect x="24" y="0" width="1" height="450" fill="' + p.accent + '" opacity="0.4"/>' +
        '<rect x="38" y="18" width="246" height="414" fill="none" stroke="' + p.accent + '" stroke-width="1" opacity="0.42"/>' +
        '<text x="163" y="66" text-anchor="middle" font-family="Inter, sans-serif" font-size="9.5" font-weight="500" letter-spacing="3.6" fill="' + p.accent + '" opacity="0.82">' + esc(b.cat.toUpperCase()) + '</text>' +
        '<line x1="140" y1="90" x2="186" y2="90" stroke="' + p.accent + '" stroke-width="1" opacity="0.55"/>' +
        '<path d="M163 84 l5 6 -5 6 -5 -6 z" fill="' + p.accent + '" opacity="0.85"/>' +
        titleMarkup +
        '<line x1="120" y1="' + (startY + lines.length * lh - lh / 2 + 22) + '" x2="206" y2="' + (startY + lines.length * lh - lh / 2 + 22) + '" stroke="' + p.accent + '" stroke-width="1" opacity="0.4"/>' +
        '<text x="163" y="388" text-anchor="middle" font-family="Inter, sans-serif" font-size="12.5" letter-spacing="2.2" fill="#F4EFE6" opacity="0.9">' + esc(b.author.toUpperCase()) + '</text>' +
        '<text x="163" y="410" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="12.5" font-style="italic" fill="' + p.accent + '" opacity="0.8">' + esc(formatYear(b)) + '</text>' +
      '</svg>';
  }

  function medallionSVG(init) {
    return '<svg viewBox="0 0 128 128" aria-hidden="true">' +
      '<circle class="m-subring" cx="64" cy="64" r="60"></circle>' +
      '<circle class="m-ring" cx="64" cy="64" r="51"></circle>' +
      '<text class="m-init" x="64" y="64" text-anchor="middle" dominant-baseline="central">' + esc(init) + '</text>' +
      '</svg>';
  }

  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 6.6a5.5 5.5 0 0 0-7.8 0L12 7.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  var BOOKMARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';

  /* ---------------------------------------------------------------------
     Element refs
  --------------------------------------------------------------------- */
  var els = {};
  function cacheEls() {
    els.loader = $('#loader');
    els.progress = $('#scrollProgress');
    els.nav = $('#siteNav');
    els.themeToggle = $('#themeToggle');
    els.searchToggle = $('#searchToggle');
    els.searchPanel = $('#searchPanel');
    els.searchInput = $('#searchInput');
    els.menuToggle = $('#menuToggle');
    els.mobileMenu = $('#mobileMenu');
    els.heroStack = $('#heroStack');
    els.heroCaption = $('#heroCaption');
    els.chips = $('#chips');
    els.sortSelect = $('#sortSelect');
    els.activeTokens = $('#activeTokens');
    els.resultsInfo = $('#resultsInfo');
    els.bookGrid = $('#bookGrid');
    els.emptyState = $('#emptyState');
    els.resetFilters = $('#resetFilters');
    els.authorGrid = $('#authorGrid');
    els.bookModal = $('#bookModal');
    els.bookModalBody = $('#bookModalBody');
    els.authorModal = $('#authorModal');
    els.authorModalBody = $('#authorModalBody');
    els.confirmModal = $('#confirmModal');
    els.confirmText = $('#confirmText');
    els.confirmOk = $('#confirmOk');
    els.confirmCancel = $('#confirmCancel');
    els.toasts = $('#toasts');
    els.backToTop = $('#backToTop');
    els.favCount = $('#favCount');
    els.bagCount = $('#bagCount');
    els.favCountLabel = $('#favCountLabel');
    els.bagCountLabel = $('#bagCountLabel');
    els.libraryPanel = $('#libraryPanel');
    els.libraryDanger = $('#libraryDanger');
    els.statSaved = $('#statSaved');
    els.statFav = $('#statFav');
    els.statMinutes = $('#statMinutes');
    els.promptText = $('#promptText');
    els.promptDate = $('#promptDate');
    els.timerCard = $('#timerCard');
    els.timerDisplay = $('#timerDisplay');
    els.timerState = $('#timerState');
    els.ringFg = $('#ringFg');
    els.durationSelect = $('#durationSelect');
    els.timerStart = $('#timerStart');
    els.timerReset = $('#timerReset');
    els.focusToggle = $('#focusToggle');
    els.todayMinutes = $('#todayMinutes');
    els.goalBar = $('#goalBar');
    els.goalFill = $('#goalFill');
    els.sessionNote = $('#sessionNote');
    els.newsletterForm = $('#newsletterForm');
    els.newsletterEmail = $('#newsletterEmail');
    els.newsletterMsg = $('#newsletterMsg');
    els.year = $('#year');
  }

  /* ---------------------------------------------------------------------
     Toaster
  --------------------------------------------------------------------- */
  function toast(msg, kind) {
    if (!els.toasts) return;
    var icon = kind === 'heart' ? '<span class="t-heart">' + HEART + '</span>'
             : kind === 'check' ? CHECK
             : BOOKMARK;
    var el = doc.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon + '<span>' + esc(msg) + '</span>';
    els.toasts.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 420);
    }, 3200);
  }

  /* ---------------------------------------------------------------------
     Theme
  --------------------------------------------------------------------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (els.themeToggle) {
      els.themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      els.themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }
  function initTheme() {
    var theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(theme);
    if (els.themeToggle) {
      els.themeToggle.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try { localStorage.setItem('luxe:theme', next); } catch (e) { /* private mode */ }
        toast(next === 'light' ? 'Daylight mode' : 'Candlelight mode', 'check');
      });
    }
  }

  /* ---------------------------------------------------------------------
     Loader / reveals
  --------------------------------------------------------------------- */
  function dismissLoader() {
    if (els.loader) els.loader.classList.add('done');
  }
  function initReveals() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window) || REDUCE) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Scroll chrome: progress, nav, active link, back-to-top
  --------------------------------------------------------------------- */
  var SECTIONS = ['discover', 'collections', 'authors', 'reading-room', 'my-library'];
  function onScroll() {
    var y = window.pageYOffset;
    var max = doc.body.scrollHeight - window.innerHeight;
    if (els.progress) els.progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (els.nav) els.nav.classList.toggle('scrolled', y > 40);
    if (els.backToTop) els.backToTop.hidden = false, els.backToTop.classList.toggle('show', y > 600);
    // active nav link
    var current = null;
    for (var i = 0; i < SECTIONS.length; i++) {
      var sec = doc.getElementById(SECTIONS[i]);
      if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.4) current = SECTIONS[i];
    }
    $$('#navLinks a').forEach(function (a) {
      var is = a.getAttribute('href') === '#' + current;
      if (is) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  function scrollToId(id) {
    var el = doc.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - (parseInt(getComputedStyle(root).getPropertyValue('--nav-h'), 10) || 78) - 8;
    window.scrollTo({ top: Math.max(top, 0), behavior: REDUCE ? 'auto' : 'smooth' });
  }

  function initScrollChrome() {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
    }, { passive: true });
    onScroll();

    if (els.backToTop) els.backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
    });

    // data-scroll links (delegated — exists in nav, footer, hero)
    doc.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a[data-scroll]') : null;
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        e.preventDefault();
        scrollToId(href.slice(1));
        closeMobileMenu();
        closeSearchPanel();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  function openMobileMenu() {
    els.mobileMenu.classList.add('open');
    els.mobileMenu.setAttribute('aria-hidden', 'false');
    els.menuToggle.setAttribute('aria-expanded', 'true');
    doc.body.classList.add('scroll-locked');
  }
  function closeMobileMenu() {
    if (!els.mobileMenu || !els.mobileMenu.classList.contains('open')) return;
    var active = doc.activeElement;
    if (active && els.mobileMenu.contains(active) && active.blur) active.blur();
    els.mobileMenu.classList.remove('open');
    els.mobileMenu.setAttribute('aria-hidden', 'true');
    els.menuToggle.setAttribute('aria-expanded', 'false');
    doc.body.classList.remove('scroll-locked');
  }
  function initMobileMenu() {
    if (!els.menuToggle) return;
    els.menuToggle.addEventListener('click', function () {
      if (els.mobileMenu.classList.contains('open')) closeMobileMenu(); else openMobileMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Search panel
  --------------------------------------------------------------------- */
  function openSearchPanel() {
    els.searchPanel.classList.add('open');
    els.searchToggle.setAttribute('aria-expanded', 'true');
    setTimeout(function () { els.searchInput.focus(); }, 120);
  }
  function closeSearchPanel() {
    if (!els.searchPanel || !els.searchPanel.classList.contains('open')) return;
    els.searchPanel.classList.remove('open');
    els.searchToggle.setAttribute('aria-expanded', 'false');
  }
  function initSearch() {
    if (!els.searchToggle) return;
    els.searchToggle.addEventListener('click', function () {
      if (els.searchPanel.classList.contains('open')) closeSearchPanel(); else openSearchPanel();
    });
    els.searchInput.addEventListener('input', function () {
      state.query = els.searchInput.value;
      renderCatalogue();
    });
    els.searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeSearchPanel();
        scrollToId('discover');
        renderCatalogue();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Badges + stats
  --------------------------------------------------------------------- */
  function setBadge(el, labelEl, n, plural) {
    if (!el) return;
    el.textContent = String(n);
    el.classList.toggle('show', n > 0);
    if (labelEl) labelEl.textContent = n + ' ' + plural;
  }
  function updateBadges() {
    setBadge(els.favCount, els.favCountLabel, state.favorites.length, state.favorites.length === 1 ? 'favourite saved' : 'favourites saved');
    setBadge(els.bagCount, els.bagCountLabel, state.saved.length, state.saved.length === 1 ? 'book in your library' : 'books in your library');
  }
  function minutesThisWeek() {
    var now = new Date();
    var day = (now.getDay() + 6) % 7; // Monday = 0
    var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    var total = 0;
    state.sessions.forEach(function (s) {
      var d = new Date(s.date);
      if (d >= monday) total += s.minutes;
    });
    return total;
  }
  function minutesToday() {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), dd = now.getDate();
    var t = 0;
    state.sessions.forEach(function (s) { var d = new Date(s.date); if (d.getFullYear() === y && d.getMonth() === m && d.getDate() === dd) t += s.minutes; });
    return t;
  }
  function updateStats() {
    if (els.statSaved) els.statSaved.textContent = state.saved.length;
    if (els.statFav) els.statFav.textContent = state.favorites.length;
    if (els.statMinutes) els.statMinutes.textContent = minutesThisWeek();
  }
  function updateGoal() {
    var m = minutesToday();
    if (els.todayMinutes) els.todayMinutes.textContent = m;
    if (els.goalFill) els.goalFill.style.width = Math.min((m / 20) * 100, 100) + '%';
    if (els.goalBar) els.goalBar.setAttribute('aria-valuenow', m);
  }

  /* ---------------------------------------------------------------------
     Persistence mutators
  --------------------------------------------------------------------- */
  function persistLibrary() {
    LS.set('saved', state.saved);
    LS.set('favorites', state.favorites);
    LS.set('status', state.status);
    LS.set('sessions', state.sessions);
  }

  /* ---------------------------------------------------------------------
     Catalogue rendering
  --------------------------------------------------------------------- */
  function visibleBooks() {
    var list = BOOKS.filter(function (b) {
      if (state.category !== 'all' && b.cat !== state.category) return false;
      if (state.collection && COLLECTIONS[state.collection].ids.indexOf(b.id) === -1) return false;
      if (state.author && b.author !== state.author) return false;
      if (state.query) {
        var q = state.query.toLowerCase();
        if ((b.title + ' ' + b.author + ' ' + b.cat).toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    });
    switch (state.sort) {
      case 'title': list = list.slice().sort(function (a, b) { return a.title.localeCompare(b.title); }); break;
      case 'author': list = list.slice().sort(function (a, b) { return a.author.localeCompare(b.author); }); break;
      case 'duration-desc': list = list.slice().sort(function (a, b) { return b.dur - a.dur; }); break;
      case 'duration-asc': list = list.slice().sort(function (a, b) { return a.dur - b.dur; }); break;
      default: break; // curated = source order
    }
    return list;
  }

  function isSaved(id) { return state.saved.indexOf(id) !== -1; }
  function isFav(id) { return state.favorites.indexOf(id) !== -1; }
  function statusOf(id) { return state.status[id] || null; }

  function statusLabel(s) { return s === 'reading' ? 'Currently Reading' : s === 'completed' ? 'Completed' : 'Saved'; }
  function statusClass(s) { return s ? (s === 'reading' ? 's-reading' : 's-completed') : 's-saved'; }

  function bookCard(b, i) {
    var wide = (i % 7 === 3);
    var saved = isSaved(b.id), fav = isFav(b.id);
    return '' +
      '<article class="book-card' + (wide ? ' wide' : '') + '" style="--i:' + (i % 8) + '" data-id="' + esc(b.id) + '">' +
        '<div class="cover-wrap">' +
          '<button class="cover js-open" type="button" data-id="' + esc(b.id) + '" aria-label="' + esc(b.title) + ' — view details">' +
            coverSVG(b) +
            '<span class="cover-cta"><span>Discover This Book</span></span>' +
          '</button>' +
          '<span class="cover-tag">' + esc(b.cat) + '</span>' +
          '<button class="fav-btn js-fav" type="button" data-id="' + esc(b.id) + '" aria-pressed="' + (fav ? 'true' : 'false') + '" aria-label="' + (fav ? 'Remove' : 'Add') + ' ' + esc(b.title) + ' to favourites">' + HEART + '</button>' +
        '</div>' +
        '<div class="book-info">' +
          '<h3 class="book-title">' + esc(b.title) + '</h3>' +
          '<p class="book-author">' + esc(b.author) + '</p>' +
          '<p class="book-meta">' + formatYear(b) + ' &middot; ' + b.pages + ' pp &middot; ~' + b.dur + ' min</p>' +
          '<p class="book-desc">' + esc(b.blurb) + '</p>' +
          '<div class="book-actions">' +
            '<button class="btn btn-ghost btn-small js-add' + (saved ? ' added' : '') + '" type="button" data-id="' + esc(b.id) + '" aria-pressed="' + (saved ? 'true' : 'false') + '">' + (saved ? 'Saved to Library' : 'Add to Library') + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function tokenHTML(type, value, label) {
    return '<span class="token">' + esc(label) +
      '<button type="button" class="js-token" data-type="' + type + '" data-value="' + esc(value) + '" aria-label="Clear filter ' + esc(label) + '">&times;</button></span>';
  }

  function renderTokens() {
    var html = '';
    if (state.collection) html += tokenHTML('collection', state.collection, COLLECTIONS[state.collection].name);
    if (state.author) html += tokenHTML('author', state.author, state.author);
    els.activeTokens.innerHTML = html;
  }

  function renderCatalogue() {
    var list = visibleBooks();
    renderTokens();
    if (!list.length) {
      els.bookGrid.innerHTML = '';
      els.emptyState.hidden = false;
    } else {
      els.emptyState.hidden = true;
      els.bookGrid.innerHTML = list.map(bookCard).join('');
    }
    els.resultsInfo.textContent = 'Showing ' + list.length + ' of ' + BOOKS.length + ' volumes';
  }

  function initCatalogueControls() {
    $$('#chips .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.category = chip.getAttribute('data-filter');
        $$('#chips .chip').forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        renderCatalogue();
      });
    });
    els.sortSelect.addEventListener('change', function () { state.sort = els.sortSelect.value; renderCatalogue(); });
    els.resetFilters.addEventListener('click', resetCatalogue);
    renderCatalogue();
  }
  function resetCatalogue() {
    state.category = 'all';
    state.collection = null;
    state.author = null;
    state.query = '';
    state.sort = 'curated';
    if (els.searchInput) els.searchInput.value = '';
    if (els.sortSelect) els.sortSelect.value = 'curated';
    $$('#chips .chip').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-filter') === 'all' ? 'true' : 'false'); });
    renderCatalogue();
  }

  /* Delegated actions for grid + modals + library */
  function onLibraryAction(id) {
    if (state.saved.indexOf(id) === -1) state.saved.push(id);
    LS.set('saved', state.saved);
    updateBadges(); updateStats(); renderLibrary(); refreshOpenModalState(id);
  }
  function onUnsave(id) {
    state.saved = state.saved.filter(function (x) { return x !== id; });
    delete state.status[id];
    state.favorites = state.favorites.filter(function (x) { return x !== id; });
    LS.set('saved', state.saved); LS.set('status', state.status); LS.set('favorites', state.favorites);
    updateBadges(); updateStats(); renderCatalogue(); renderLibrary(); refreshOpenModalState(id);
  }
  function onToggleFav(id) {
    var wasFav = isFav(id);
    if (wasFav) {
      state.favorites = state.favorites.filter(function (x) { return x !== id; });
    } else {
      state.favorites.push(id);
      if (state.saved.indexOf(id) === -1) state.saved.push(id);
    }
    LS.set('favorites', state.favorites); LS.set('saved', state.saved);
    updateBadges(); updateStats(); renderCatalogue(); renderLibrary(); refreshOpenModalState(id);
    var b = bookById(id);
    toast(wasFav ? 'Removed from favourites' : 'Added ' + (b ? b.title : '') + ' to favourites', 'heart');
  }
  function onSaveToggle(id) {
    if (isSaved(id)) { onUnsave(id); toast('Removed from your library', 'check'); }
    else { onLibraryAction(id); toast('Added to your library', 'check'); }
  }
  function setStatus(id, s) {
    if (!s || state.status[id] === s) delete state.status[id];
    else state.status[id] = s;
    LS.set('status', state.status);
    if (state.saved.indexOf(id) === -1) { state.saved.push(id); LS.set('saved', state.saved); }
    updateBadges(); updateStats(); renderCatalogue(); renderLibrary(); refreshOpenModalState(id);
  }

  function initActions() {
    doc.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;

      var fav = t.closest('.js-fav');
      if (fav) {
        fav.classList.add('pop');
        onToggleFav(fav.getAttribute('data-id'));
        return;
      }
      var add = t.closest('.js-add');
      if (add) { onSaveToggle(add.getAttribute('data-id')); return; }

      var open = t.closest('.js-open');
      if (open) { openBookModal(open.getAttribute('data-id')); return; }

      var hero = t.closest('.hero-book');
      if (hero) { openBookModal(hero.getAttribute('data-book-id')); return; }

      var tok = t.closest('.js-token');
      if (tok) {
        var type = tok.getAttribute('data-type');
        if (type === 'collection') state.collection = null;
        if (type === 'author') state.author = null;
        renderCatalogue();
        return;
      }

      var stat = t.closest('.js-status');
      if (stat) { setStatus(stat.getAttribute('data-id'), stat.getAttribute('data-status')); return; }

      var rem = t.closest('.js-remove');
      if (rem) { onUnsave(rem.getAttribute('data-id')); toast('Removed from your library', 'check'); return; }

      var panel = t.closest('.col-panel');
      if (panel) { applyCollection(panel.getAttribute('data-collection')); return; }

      var clink = t.closest('[data-collection-link]');
      if (clink) { applyCollection(clink.getAttribute('data-collection-link')); return; }

      var acard = t.closest('.js-author');
      if (acard) { openAuthorModal(acard.getAttribute('data-key')); return; }

      var abook = t.closest('.js-modal-book');
      if (abook) { openBookModal(abook.getAttribute('data-id')); return; }
    });

    // Keyboard activation for role="button" cards that aren't real <button>s
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var t = e.target;
      if (!t.closest) return;
      var activatable = t.closest('.js-author, .js-open');
      if (activatable && activatable.getAttribute('role') === 'button') {
        e.preventDefault();
        activatable.click();
      }
    });
  }

  function applyCollection(key) {
    if (!COLLECTIONS[key]) return;
    state.collection = key;
    renderCatalogue();
    scrollToId('discover');
    toast('Filtering: ' + COLLECTIONS[key].name, 'check');
  }

  /* ---------------------------------------------------------------------
     Hero
  --------------------------------------------------------------------- */
  var HERO_ROTATE = ['the-cartographers-daughter', 'what-the-stars-remember', 'the-vermilion-letter'];
  function initHero() {
    $$('.hero-book', els.heroStack).forEach(function (btn) {
      var b = bookById(btn.getAttribute('data-book-id'));
      if (b) btn.innerHTML = coverSVG(b);
    });
    // caption rotation
    if (!REDUCE && els.heroCaption) {
      var hi = 0;
      setInterval(function () {
        hi = (hi + 1) % HERO_ROTATE.length;
        var b = bookById(HERO_ROTATE[hi]);
        if (b) els.heroCaption.innerHTML = 'Also on the shelf &mdash; <em>' + esc(b.title) + '</em>';
      }, 4200);
    }
    // gentle pointer parallax
    var visual = $('.hero-visual');
    if (visual && els.heroStack && !REDUCE) {
      visual.addEventListener('pointermove', function (ev) {
        var r = visual.getBoundingClientRect();
        var dx = (ev.clientX - r.left) / r.width - 0.5;
        var dy = (ev.clientY - r.top) / r.height - 0.5;
        els.heroStack.style.transform = 'rotateY(' + (dx * 10) + 'deg) rotateX(' + (-dy * 8) + 'deg)';
      });
      visual.addEventListener('pointerleave', function () { els.heroStack.style.transform = ''; });
    }
  }

  /* ---------------------------------------------------------------------
     Book modal
  --------------------------------------------------------------------- */
  var currentBookId = null;
  function refreshOpenModalState(id) {
    if (id === currentBookId && currentBookId) renderBookModal(currentBookId);
  }

  function bookModalMarkup(b) {
    var saved = isSaved(b.id), fav = isFav(b.id), st = statusOf(b.id);
    function stChip(s, label) {
      return '<button class="mini-btn js-status' + (st === s ? ' is-active' : '') + '" type="button" data-id="' + esc(b.id) + '" data-status="' + s + '" aria-pressed="' + (st === s ? 'true' : 'false') + '">' + label + '</button>';
    }
    return '' +
      '<button class="modal-close js-close" type="button" aria-label="Close">' + CLOSE + '</button>' +
      '<div class="bm-grid">' +
        '<div class="bm-cover-side"><div class="bm-cover">' + coverSVG(b) + '</div></div>' +
        '<div class="bm-info">' +
          '<span class="bm-category">' + esc(b.cat) + '</span>' +
          '<h3 class="bm-title" id="bookModalTitle">' + esc(b.title) + '</h3>' +
          '<p class="bm-author">' + esc(b.author) + '</p>' +
          '<div class="bm-meta">' +
            '<span>' + formatYear(b) + '</span><span class="sep">&middot;</span>' +
            '<span>' + b.pages + ' pages</span><span class="sep">&middot;</span>' +
            '<span>~' + b.dur + ' min read</span>' +
          '</div>' +
          '<p class="bm-synopsis">' + esc(b.synopsis) + '</p>' +
          '<blockquote class="bm-quote">&ldquo;' + esc(b.quote) + '&rdquo;</blockquote>' +
          '<div class="bm-actions">' +
            '<button class="btn btn-gold-fill js-add' + (saved ? ' added' : '') + '" type="button" data-id="' + esc(b.id) + '" aria-pressed="' + (saved ? 'true' : 'false') + '">' + (saved ? 'Saved to Library' : 'Add to Library') + '</button>' +
            '<button class="fav-btn js-fav' + (fav ? '' : '') + '" type="button" data-id="' + esc(b.id) + '" aria-pressed="' + (fav ? 'true' : 'false') + '" aria-label="' + (fav ? 'Remove from' : 'Add to') + ' favourites">' + HEART + '</button>' +
            stChip('reading', 'Reading') +
            stChip('completed', 'Completed') +
          '</div>' +
        '</div>' +
      '</div>';
  }
  function renderBookModal(id) {
    var b = bookById(id);
    if (!b) return;
    els.bookModalBody.innerHTML = bookModalMarkup(b);
  }
  function openBookModal(id) {
    var b = bookById(id);
    if (!b) return;
    currentBookId = id;
    els.bookModal.dataset.lastFocus = '';
    renderBookModal(id);
    openModal(els.bookModal, $('.modal-close', els.bookModal));
  }

  /* ---------------------------------------------------------------------
     Author spotlight + modal
  --------------------------------------------------------------------- */
  function renderAuthors() {
    els.authorGrid.innerHTML = AUTHORS.map(function (a) {
      return '' +
        '<article class="author-card reveal js-author" tabindex="0" role="button" data-key="' + esc(a.key) + '" aria-label="' + esc(a.key) + ' — view author">' +
          '<div class="medallion">' + medallionSVG(a.init) + '</div>' +
          '<h3 class="author-name">' + esc(a.key) + '</h3>' +
          '<p class="author-dates">' + esc(a.dates) + ' &middot; ' + esc(a.epithet) + '</p>' +
          '<p class="author-bio">' + esc(a.bio) + '</p>' +
          '<p class="author-notable">Best known for <em>' + esc(a.notable) + '</em></p>' +
          '<button class="btn btn-ghost btn-small js-author" data-key="' + esc(a.key) + '" type="button">View author</button>' +
        '</article>';
    }).join('');
  }

  function openAuthorModal(key) {
    var a = null;
    for (var i = 0; i < AUTHORS.length; i++) if (AUTHORS[i].key === key) a = AUTHORS[i];
    if (!a) return;
    var books = BOOKS.filter(function (b) { return b.author === key; });
    els.authorModalBody.innerHTML = '' +
      '<button class="modal-close js-close" type="button" aria-label="Close">' + CLOSE + '</button>' +
      '<div class="am-head">' +
        '<div class="medallion">' + medallionSVG(a.init) + '</div>' +
        '<div><h3 class="am-name" id="authorModalTitle">' + esc(a.key) + '</h3><p class="am-dates">' + esc(a.dates) + '</p></div>' +
      '</div>' +
      '<p class="am-bio">' + esc(a.bio) + '</p>' +
      '<p class="am-books-label">On our shelves</p>' +
      books.map(function (b) {
        return '<button class="am-book js-modal-book" type="button" data-id="' + esc(b.id) + '">' +
          '<div class="row-cover">' + coverSVG(b) + '</div>' +
          '<div><p class="am-bt">' + esc(b.title) + '</p><p class="am-bm">' + esc(b.cat) + ' &middot; ' + b.pages + ' pp &middot; ~' + b.dur + ' min</p></div>' +
        '</button>';
      }).join('') +
      '<div class="am-footer">' +
        '<button class="btn btn-ghost btn-small js-collection" type="button" data-key="' + esc(a.key) + '">See these in the catalogue</button>' +
      '</div>';

    $('.js-collection', els.authorModalBody).addEventListener('click', function () {
      state.author = key; state.collection = null; renderCatalogue(); closeModal(els.authorModal); scrollToId('discover');
      toast('Showing works by ' + key, 'check');
    });
    openModal(els.authorModal, $('.modal-close', els.authorModalBody));
  }

  /* ---------------------------------------------------------------------
     Generic modal helpers
  --------------------------------------------------------------------- */
  var openStack = [];
  function openModal(m, focusEl) {
    m.hidden = false;
    requestAnimationFrame(function () { m.classList.add('open'); });
    doc.body.classList.add('scroll-locked');
    m._lastFocus = doc.activeElement;
    openStack.push(m);
    if (focusEl) setTimeout(function () { focusEl.focus(); }, 60);
  }
  function closeModal(m) {
    m.classList.remove('open');
    setTimeout(function () { m.hidden = true; }, 380);
    openStack = openStack.filter(function (x) { return x !== m; });
    if (!openStack.length && !(els.mobileMenu && els.mobileMenu.classList.contains('open'))) doc.body.classList.remove('scroll-locked');
    if (m._lastFocus && m._lastFocus.focus) m._lastFocus.focus();
    if (m === els.bookModal) currentBookId = null;
  }
  function initModals() {
    doc.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.js-close')) {
        var m = e.target.closest('.modal'); if (m) closeModal(m);
        return;
      }
      if (e.target.classList && e.target.classList.contains('modal')) closeModal(e.target);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (openStack.length) { closeModal(openStack[openStack.length - 1]); return; }
        closeMobileMenu();
        closeSearchPanel();
        exitFocusMode();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Confirm modal (used by library clears)
  --------------------------------------------------------------------- */
  var confirmAction = null;
  function openConfirm(text, onOk) {
    els.confirmText.textContent = text;
    confirmAction = onOk;
    openModal(els.confirmModal, els.confirmOk);
  }
  function initConfirm() {
    els.confirmOk.addEventListener('click', function () { closeModal(els.confirmModal); if (confirmAction) { confirmAction(); confirmAction = null; } });
    els.confirmCancel.addEventListener('click', function () { closeModal(els.confirmModal); confirmAction = null; });
  }

  /* ---------------------------------------------------------------------
     My Library
  --------------------------------------------------------------------- */
  function libItemsFor(tab) {
    if (tab === 'favorites') return state.favorites.map(bookById).filter(Boolean);
    if (tab === 'reading' || tab === 'completed') return state.saved.map(bookById).filter(function (b) { return b && state.status[b.id] === tab; });
    return state.saved.map(bookById).filter(Boolean); // saved
  }

  function libEmptyMarkup(tab) {
    var msg = {
      saved: ['Your shelf is empty.', 'Add volumes from the catalogue and they will gather here.'],
      favorites: ['No favourites yet.', 'Tap the heart on any book to keep it close.'],
      reading: ['Nothing in progress.', 'Open a book and mark it as Reading to begin.'],
      completed: ['No finished books.', 'Mark a reading book Completed to collect it here.'],
      history: ['No reading sessions yet.', 'Set the Reading Clock and your quiet hours will appear here.']
    }[tab];
    return '<div class="lib-empty"><h3>' + esc(msg[0]) + '</h3><p>' + esc(msg[1]) + '</p>' +
      '<a class="btn btn-gold-fill" href="#discover" data-scroll>Browse the catalogue</a></div>';
  }

  function libRow(b, i) {
    var st = statusOf(b.id), fav = isFav(b.id);
    return '' +
      '<div class="lib-row" style="--i:' + i + '">' +
        '<div class="row-cover js-open" data-id="' + esc(b.id) + '" role="button" tabindex="0" aria-label="View ' + esc(b.title) + '">' + coverSVG(b) + '</div>' +
        '<div class="row-info">' +
          '<p class="row-title">' + esc(b.title) + '</p>' +
          '<p class="row-author">' + esc(b.author) + '</p>' +
          '<p class="row-sub">' + b.pages + ' pp &middot; ~' + b.dur + ' min &middot; ' + esc(b.cat) + '</p>' +
        '</div>' +
        '<div class="row-actions">' +
          '<span class="status-chip ' + statusClass(st) + '">' + esc(statusLabel(st)) + '</span>' +
          '<button class="mini-btn' + (fav ? ' is-active' : '') + ' js-fav" type="button" data-id="' + esc(b.id) + '" aria-pressed="' + fav + '">Favourite</button>' +
          '<button class="mini-btn js-status" type="button" data-id="' + esc(b.id) + '" data-status="' + (st === 'reading' ? '' : 'reading') + '">' + (st === 'reading' ? 'Stop reading' : 'Mark reading') + '</button>' +
          '<button class="mini-btn js-status" type="button" data-id="' + esc(b.id) + '" data-status="' + (st === 'completed' ? '' : 'completed') + '">' + (st === 'completed' ? 'Unmark' : 'Mark completed') + '</button>' +
          '<button class="mini-btn danger js-remove" type="button" data-id="' + esc(b.id) + '">Remove</button>' +
        '</div>' +
      '</div>';
  }

  function sessionRow(s, i) {
    var d = new Date(s.date);
    var when = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    var clock = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    var b = s.bookId ? bookById(s.bookId) : null;
    return '<div class="session-row" style="--i:' + i + '">' +
      '<p class="session-date">' + esc(when) + '</p>' +
      '<p class="session-meta"><b>' + s.minutes + ' min</b> &middot; ' + esc(clock) + (b ? ' &middot; ' + esc(b.title) : '') + '</p>' +
    '</div>';
  }

  function renderLibrary() {
    if (!els.libraryPanel) return;
    var tab = state.libTab;
    if (tab === 'history') {
      var sessions = state.sessions.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      els.libraryPanel.innerHTML = sessions.length ? sessions.map(sessionRow).join('') : libEmptyMarkup('history');
    } else {
      var items = libItemsFor(tab);
      els.libraryPanel.innerHTML = items.length ? items.map(libRow).join('') : libEmptyMarkup(tab);
    }
    // danger zone visible only when relevant
    var showClear = (tab === 'completed' && libItemsFor('completed').length) || (tab === 'history' && state.sessions.length);
    els.libraryDanger.hidden = !showClear;
    els.clearCompletedBtn = els.clearCompletedBtn || $('#clearCompleted');
    els.clearHistoryBtn = els.clearHistoryBtn || $('#clearHistory');
    if (els.clearCompletedBtn) els.clearCompletedBtn.style.display = (tab === 'completed' && libItemsFor('completed').length) ? '' : 'none';
    if (els.clearHistoryBtn) els.clearHistoryBtn.style.display = (tab === 'history' && state.sessions.length) ? '' : 'none';

    updateStats();
  }

  function initLibrary() {
    $$('.lib-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.libTab = tab.getAttribute('data-tab');
        $$('.lib-tab').forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
        renderLibrary();
      });
    });
    $('#clearCompleted').addEventListener('click', function () {
      openConfirm('Clear every completed book? Your favourites and reading list stay put.', function () {
        state.saved = state.saved.filter(function (id) { return state.status[id] !== 'completed'; });
        Object.keys(state.status).forEach(function (k) { if (state.status[k] === 'completed') delete state.status[k]; });
        persistLibrary(); updateBadges(); renderLibrary();
        toast('Cleared completed books', 'check');
      });
    });
    $('#clearHistory').addEventListener('click', function () {
      openConfirm('Clear your reading session history? Your library is unaffected.', function () {
        state.sessions = [];
        LS.set('sessions', state.sessions);
        updateStats(); updateGoal(); renderLibrary();
        toast('Session history cleared', 'check');
      });
    });
    renderLibrary();
  }

  /* ---------------------------------------------------------------------
     Reading room: prompt + timer + focus mode
  --------------------------------------------------------------------- */
  function initReadingRoom() {
    // prompt + date
    var now = new Date();
    var yearStart = new Date(now.getFullYear(), 0, 0);
    var doy = Math.floor((now - yearStart) / 86400000);
    els.promptText.textContent = PROMPTS[doy % PROMPTS.length];
    els.promptDate.textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

    var C = 2 * Math.PI * 104;
    els.ringFg.style.strokeDasharray = C;
    els.ringFg.style.strokeDashoffset = 0;

    var total = parseInt(els.durationSelect.value, 10) * 60;
    var remain = total;
    var running = false;
    var iv = null;

    function fmt(s) { var m = Math.floor(s / 60); var ss = s % 60; return (m < 10 ? '0' + m : m) + ':' + (ss < 10 ? '0' + ss : ss); }
    function paint() {
      els.timerDisplay.textContent = fmt(remain);
      els.ringFg.style.strokeDashoffset = C * (1 - remain / total);
    }
    function stop() { running = false; if (iv) { clearInterval(iv); iv = null; } $('.ts-label', els.timerStart).textContent = 'Begin Reading'; els.timerState.textContent = 'Paused — your place is kept'; }
    function reset(keepMsg) {
      stop();
      total = parseInt(els.durationSelect.value, 10) * 60;
      remain = total;
      els.timerCard.classList.remove('complete');
      paint();
      els.timerState.textContent = keepMsg || 'Ready when you are';
    }
    function start() {
      running = true;
      els.timerCard.classList.remove('complete');
      $('.ts-label', els.timerStart).textContent = 'Pause';
      els.timerState.textContent = 'Reading — enjoy the quiet';
      iv = setInterval(function () {
        if (!running) return;
        remain--;
        if (remain <= 0) { complete(); }
        else paint();
      }, 1000);
    }
    function complete() {
      stop();
      remain = 0; paint();
      els.timerCard.classList.add('complete');
      els.timerState.textContent = 'A quiet hour kept. Well done.';
      var mins = Math.round(total / 60);
      state.sessions.push({ date: new Date().toISOString(), minutes: mins, bookId: currentBookId || null });
      LS.set('sessions', state.sessions);
      updateStats(); updateGoal();
      toast('Session complete — ' + mins + ' quiet minutes logged', 'check');
    }

    els.timerStart.addEventListener('click', function () { if (running) stop(); else start(); });
    els.timerReset.addEventListener('click', function () { reset(); });
    els.durationSelect.addEventListener('change', function () { reset('Ready when you are'); });

    // focus mode
    els.focusToggle.addEventListener('click', function () {
      var on = doc.body.classList.toggle('focus-mode');
      els.focusToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) scrollToId('reading-room');
      toast(on ? 'Focus mode on — the room is yours' : 'Focus mode off', 'check');
    });
    paint();
    updateGoal();
  }
  function exitFocusMode() {
    if (doc.body.classList.contains('focus-mode')) {
      doc.body.classList.remove('focus-mode');
      if (els.focusToggle) els.focusToggle.setAttribute('aria-pressed', 'false');
    }
  }

  /* ---------------------------------------------------------------------
     Footer: newsletter + year
  --------------------------------------------------------------------- */
  function initFooter() {
    if (els.year) els.year.textContent = String(new Date().getFullYear());
    if (!els.newsletterForm) return;
    if (state.subscribed) {
      els.newsletterMsg.textContent = 'You are on the list. Thank you for reading slowly.';
      els.newsletterMsg.className = 'newsletter-msg ok';
    }
    els.newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = els.newsletterEmail.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ok) {
        els.newsletterEmail.classList.add('invalid');
        els.newsletterMsg.textContent = 'That address does not look quite right.';
        els.newsletterMsg.className = 'newsletter-msg err';
        return;
      }
      els.newsletterEmail.classList.remove('invalid');
      state.subscribed = true; LS.set('subscribed', true);
      els.newsletterMsg.textContent = 'Welcome. The first letter arrives with the new month.';
      els.newsletterMsg.className = 'newsletter-msg ok';
      els.newsletterEmail.value = '';
      toast('Subscribed to the letters', 'check');
    });
    els.newsletterEmail.addEventListener('input', function () {
      els.newsletterEmail.classList.remove('invalid');
      if (els.newsletterMsg.className.indexOf('err') !== -1) { els.newsletterMsg.textContent = ''; els.newsletterMsg.className = 'newsletter-msg'; }
    });
  }

  /* ---------------------------------------------------------------------
     Image fallbacks (collection photos)
  --------------------------------------------------------------------- */
  function initImageFallbacks() {
    $$('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () { img.classList.add('hidden-src'); });
      if (img.complete && img.naturalWidth === 0) img.classList.add('hidden-src');
    });
  }

  /* ---------------------------------------------------------------------
     Boot
  --------------------------------------------------------------------- */
  function boot() {
    cacheEls();
    initTheme();
    initReveals();
    initScrollChrome();
    initMobileMenu();
    initSearch();
    initCatalogueControls();
    initHero();
    renderAuthors();
    initActions();
    initModals();
    initConfirm();
    initLibrary();
    initReadingRoom();
    initFooter();
    initImageFallbacks();
    updateBadges();
    updateStats();

    // dismiss loader
    if (doc.readyState === 'complete') setTimeout(dismissLoader, 700);
    else window.addEventListener('load', function () { setTimeout(dismissLoader, 700); });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
