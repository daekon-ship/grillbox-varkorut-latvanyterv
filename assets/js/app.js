/* =========================================================
   GRILLBOX VÁRKÖRÚT — interakciók (látványterv / demo)
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fmt = function (n) { return new Intl.NumberFormat('hu-HU').format(n) + ' Ft'; };

  /* ---------------- header ---------------- */
  var header = $('#header');
  var onScrollHeader = function () {
    if (window.scrollY > 24) header.classList.add('is-stuck');
    else header.classList.remove('is-stuck');
  };
  onScrollHeader();

  /* ---------------- mobile menu ---------------- */
  var mmenu = $('#mmenu');
  var openMenu = function () {
    mmenu.hidden = false;
    requestAnimationFrame(function () {
      mmenu.classList.add('is-open');
      $$('.mmenu__nav a', mmenu).forEach(function (a, i) { a.style.transitionDelay = (0.06 + i * 0.05) + 's'; });
    });
    document.body.style.overflow = 'hidden';
  };
  var closeMenu = function () {
    mmenu.classList.remove('is-open');
    $$('.mmenu__nav a', mmenu).forEach(function (a) { a.style.transitionDelay = '0s'; });
    document.body.style.overflow = '';
    setTimeout(function () { if (!mmenu.classList.contains('is-open')) mmenu.hidden = true; }, 550);
  };
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', openMenu); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  $$('.mmenu__nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------------- reveal on scroll ---------------- */
  var revealables = $$('.r-up, .r-mask, .r-clip');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var sibs = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
          el.style.transitionDelay = Math.min(sibs, 6) * 0.07 + 's';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- counters ---------------- */
  var counters = $$('[data-count]');
  var runCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, t0 = performance.now();
    var step = function (t) {
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      el.textContent = (dec ? v.toFixed(dec).replace('.', ',') : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var t = parseFloat(el.getAttribute('data-count'));
      el.textContent = (dec ? t.toFixed(dec).replace('.', ',') : t) + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---------------- parallax ---------------- */
  var parallaxEls = $$('[data-parallax]');
  var ticking = false;
  var applyParallax = function () {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var centerOffset = (r.top + r.height / 2) - vh / 2;
      var y = -centerOffset * speed;
      el.style.setProperty('--py', y.toFixed(2) + 'px');
      el.style.transform = (el.dataset.baseTransform || '') + ' translate3d(0,' + y.toFixed(2) + 'px,0)';
    });
    ticking = false;
  };
  var onScroll = function () {
    onScrollHeader();
    spyNav();
    if (!ticking && !reduce && parallaxEls.length) {
      ticking = true;
      requestAnimationFrame(applyParallax);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { if (!reduce && parallaxEls.length) applyParallax(); });

  /* ---------------- scroll spy (mobar) ---------------- */
  var sections = ['#kinalat', '#etlap', '#rendeles', '#kapcsolat'].map(function (id) { return $(id); }).filter(Boolean);
  var mobarLinks = $$('.mobar__i');
  function spyNav() {
    var pos = window.scrollY + window.innerHeight * 0.35;
    var current = '';
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = '#' + s.id; });
    mobarLinks.forEach(function (a) {
      var href = a.getAttribute('href');
      a.classList.toggle('is-active', !!href && href === current);
    });
  }

  /* ---------------- hero: embers canvas ---------------- */
  var canvas = $('#embers');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [];
    var resize = function () {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var make = function (init) {
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + Math.random() * 60,
        r: 0.7 + Math.random() * 2.1,
        vy: 0.25 + Math.random() * 0.85,
        vx: (Math.random() - 0.5) * 0.34,
        a: 0.25 + Math.random() * 0.6,
        hue: 14 + Math.random() * 26,
        life: 0
      };
    };
    var count = 0;
    var init = function () {
      resize();
      count = W < 760 ? 26 : 54;
      parts = [];
      for (var i = 0; i < count; i++) parts.push(make(true));
    };
    var raf;
    var loop = function () {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.life += 1;
        p.y -= p.vy;
        p.x += p.vx + Math.sin((p.life + i * 40) / 60) * 0.28;
        if (p.y < -20 || p.x < -30 || p.x > W + 30) parts[i] = make(false);
        var alpha = p.a * Math.min(1, p.life / 40) * (p.y / H > 0.85 ? (H - p.y) / (H * 0.15) : 1);
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + p.hue + ',100%,58%,' + alpha.toFixed(3) + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'hsla(' + p.hue + ',100%,55%,.65)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    init();
    loop();
    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      init();
      loop();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(loop); }
    });
  }

  /* ---------------- hero mouse depth ---------------- */
  var hero = $('#hero');
  var heroImg = $('#heroImg');
  if (hero && heroImg && fine && !reduce) {
    var tx = 0, ty = 0, cx = 0, cy = 0, rafH;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 26;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 18;
      if (!rafH) rafH = requestAnimationFrame(tickHero);
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
    function tickHero() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      heroImg.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      rafH = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(tickHero) : null;
    }
  }

  /* ---------------- cursor glow + magnetic buttons ---------------- */
  var glow = $('.cursor-glow');
  if (fine && !reduce) {
    if (glow) {
      document.body.classList.add('has-glow');
      var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cgx = gx, cgy = gy;
      window.addEventListener('pointermove', function (e) { gx = e.clientX; gy = e.clientY; }, { passive: true });
      (function gloop() {
        cgx += (gx - cgx) * 0.12; cgy += (gy - cgy) * 0.12;
        glow.style.transform = 'translate3d(' + cgx.toFixed(1) + 'px,' + cgy.toFixed(1) + 'px,0)';
        requestAnimationFrame(gloop);
      })();
    }
    $$('.magnet').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (mx * 0.16).toFixed(1) + 'px,' + (my * 0.24 - 2).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------- tabs + category jump ---------------- */
  var tabs = $$('.tab');
  var prods = $$('.prod');
  function setTab(name) {
    var found = false;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      if (on) found = true;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (!found) return;
    prods.forEach(function (p) {
      var show = p.getAttribute('data-cat') === name;
      p.hidden = !show;
      if (show) {
        p.classList.remove('is-in');
        requestAnimationFrame(function () { p.classList.add('is-in'); });
      }
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
  });
  setTab('burgerek');

  $$('[data-jump]').forEach(function (el) {
    el.addEventListener('click', function () {
      var cat = el.getAttribute('data-jump');
      if (cat) setTab(cat);
    });
  });

  /* ---------------- modal ---------------- */
  var modal = $('#modal');
  var mImg = $('#mImg'), mName = $('#mName'), mDesc = $('#mDesc'), mPrice = $('#mPrice'),
      mTotal = $('#mTotal'), mQty = $('#mQty'), mCat = $('#mCat'), mAdd = $('#mAdd');
  var current = null, qty = 1, lastFocus = null;
  var CATLABEL = {
    burgerek: 'BURGEREK', lepenyek: 'LEPÉNYEK', grilltalek: 'GRILLTÁLAK',
    doggyk: 'DOGGYK', desszertek: 'DESSZERTEK'
  };

  function openModal(card) {
    current = {
      name: card.getAttribute('data-name'),
      price: parseInt(card.getAttribute('data-price'), 10),
      img: card.getAttribute('data-img'),
      desc: card.getAttribute('data-desc'),
      cat: card.getAttribute('data-cat')
    };
    qty = 1;
    mImg.src = current.img;
    mImg.alt = card.getAttribute('data-alt') || current.name;
    mName.textContent = current.name;
    mDesc.textContent = current.desc;
    mPrice.textContent = fmt(current.price);
    mCat.textContent = 'GRILLBOX · ' + (CATLABEL[current.cat] || '');
    mQty.textContent = '1';
    updateTotal();
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('.modal__close', modal).focus(); }, 60);
  }
  function updateTotal() { mTotal.textContent = fmt(current ? current.price * qty : 0); }
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { modal.hidden = true; if (lastFocus) lastFocus.focus(); }, 380);
  }
  $$('.prod__open').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.closest('.prod')); });
  });
  $$('[data-modal-close]').forEach(function (b) { b.addEventListener('click', closeModal); });
  $$('[data-mqty]').forEach(function (b) {
    b.addEventListener('click', function () {
      qty = Math.max(1, Math.min(20, qty + parseInt(b.getAttribute('data-mqty'), 10)));
      mQty.textContent = String(qty);
      updateTotal();
    });
  });

  /* ---------------- cart ---------------- */
  var cart = $('#cart'), cartList = $('#cartList'), cartEmpty = $('#cartEmpty'),
      cartFoot = $('#cartFoot'), cartSum = $('#cartSum');
  var items = [];

  function cartCount() { return items.reduce(function (a, i) { return a + i.qty; }, 0); }
  function cartTotal() { return items.reduce(function (a, i) { return a + i.qty * i.price; }, 0); }

  function renderBadges(pop) {
    var n = cartCount();
    $$('[data-cart-count]').forEach(function (b) {
      b.textContent = n > 99 ? '99+' : String(n);
      b.hidden = n === 0;
      if (pop && n > 0) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    });
  }

  function renderCart(newIndex) {
    cartList.innerHTML = '';
    items.forEach(function (it, idx) {
      var row = document.createElement('div');
      row.className = 'citem' + (idx === newIndex ? ' is-new' : '');
      row.innerHTML =
        '<img class="citem__img" src="' + it.img + '" alt="" width="64" height="64">' +
        '<div><div class="citem__n">' + it.name + '</div>' +
        '<div class="citem__p">' + fmt(it.price) + ' / db</div>' +
        '<div class="citem__ctl">' +
        '<button data-dec="' + idx + '" aria-label="Csökkentés"><svg><use href="#i-minus"></use></svg></button>' +
        '<span>' + it.qty + '</span>' +
        '<button data-inc="' + idx + '" aria-label="Növelés"><svg><use href="#i-plus"></use></svg></button>' +
        '</div></div>' +
        '<div class="citem__sum">' + fmt(it.price * it.qty) + '</div>';
      cartList.appendChild(row);
    });
    cartEmpty.hidden = items.length > 0;
    cartFoot.hidden = items.length === 0;
    cartSum.textContent = fmt(cartTotal());
    renderBadges(false);

    $$('[data-dec]', cartList).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = parseInt(b.getAttribute('data-dec'), 10);
        items[i].qty -= 1;
        if (items[i].qty <= 0) items.splice(i, 1);
        renderCart();
      });
    });
    $$('[data-inc]', cartList).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = parseInt(b.getAttribute('data-inc'), 10);
        items[i].qty = Math.min(30, items[i].qty + 1);
        renderCart();
      });
    });
  }

  function addItem(name, price, img, n, sourceEl) {
    var existing = null;
    items.forEach(function (it) { if (it.name === name) existing = it; });
    var idx;
    if (existing) { existing.qty += n; idx = items.indexOf(existing); }
    else { items.push({ name: name, price: price, img: img, qty: n }); idx = items.length - 1; }
    renderCart(idx);
    renderBadges(true);
    toast(name + ' a kosárban');
    if (sourceEl && !reduce) flyToCart(sourceEl, img);
  }

  function flyToCart(sourceEl, img) {
    var target = null;
    $$('[data-cart-open]').forEach(function (b) {
      if (!target && b.offsetParent !== null) target = b;
    });
    if (!target) return;
    var from = sourceEl.getBoundingClientRect();
    var to = target.getBoundingClientRect();
    var fly = document.createElement('img');
    fly.src = img; fly.className = 'fly'; fly.alt = '';
    fly.style.left = (from.left + from.width / 2 - 27) + 'px';
    fly.style.top = (from.top + from.height / 2 - 27) + 'px';
    document.body.appendChild(fly);
    requestAnimationFrame(function () {
      fly.style.transform = 'translate(' + (to.left + to.width / 2 - from.left - from.width / 2) + 'px,' +
        (to.top + to.height / 2 - from.top - from.height / 2) + 'px) scale(.16)';
      fly.style.opacity = '0.15';
    });
    setTimeout(function () { fly.remove(); }, 900);
  }

  $$('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var card = btn.closest('.prod');
      addItem(
        card.getAttribute('data-name'),
        parseInt(card.getAttribute('data-price'), 10),
        card.getAttribute('data-img'),
        1,
        card.querySelector('img')
      );
      btn.classList.add('is-done');
      setTimeout(function () { btn.classList.remove('is-done'); }, 700);
    });
  });

  if (mAdd) {
    mAdd.addEventListener('click', function () {
      if (!current) return;
      addItem(current.name, current.price, current.img, qty, mImg);
      closeModal();
      setTimeout(openCart, 320);
    });
  }

  function openCart() {
    cart.hidden = false;
    requestAnimationFrame(function () { cart.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cart.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { cart.hidden = true; }, 520);
  }
  $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', openCart); });
  $$('[data-cart-close]').forEach(function (b) { b.addEventListener('click', closeCart); });
  var toOrder = $('#toOrder');
  if (toOrder) toOrder.addEventListener('click', function () { closeCart(); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      else if (!cart.hidden) closeCart();
      else if (mmenu.classList.contains('is-open')) closeMenu();
    }
  });

  renderCart();
  renderBadges(false);

  /* ---------------- toast ---------------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }

  /* ---------------- nyitvatartás ---------------- */
  var HOURS = {
    0: null,
    1: [630, 1260], 2: [630, 1260], 3: [630, 1260], 4: [630, 1260],
    5: [630, 1320], 6: [630, 1320]
  };
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };
  var label = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };

  function refreshHours() {
    var now = new Date();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var today = HOURS[day];
    var isOpen = !!today && mins >= today[0] && mins < today[1];
    var text;
    if (isOpen) {
      text = 'Nyitva · ma ' + label(today[1]) + '-ig';
    } else {
      var d = day, next = null, guard = 0;
      while (guard < 8) {
        d = (d + 1) % 7; guard++;
        if (HOURS[d]) { next = { day: d, open: HOURS[d][0] }; break; }
      }
      if (today && mins < today[0]) next = { day: day, open: today[0] };
      var names = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
      text = next
        ? 'Zárva · nyitás ' + (next.day === day ? 'ma' : names[next.day].toLowerCase()) + ' ' + label(next.open)
        : 'Zárva';
    }
    $$('[data-open-now]').forEach(function (el) {
      el.textContent = text;
      el.classList.toggle('is-closed', !isOpen);
    });
    $$('[data-days]').forEach(function (li) {
      var days = li.getAttribute('data-days').split(',').map(Number);
      li.classList.toggle('is-today', days.indexOf(day) > -1);
    });
    var head = $('.hours__head b');
    if (head) {
      head.textContent = isOpen ? 'NYITVA' : 'ZÁRVA';
      head.classList.toggle('is-closed', !isOpen);
    }
  }
  refreshHours();
  setInterval(refreshHours, 60000);

  /* ---------------- smooth anchor (offset a fejléc miatt) ---------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (window.innerWidth > 768 ? 74 : 62);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });
})();
