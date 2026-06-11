if (typeof gsap === 'undefined') {
	document.documentElement.classList.add('no-gsap');
}  

/* ═══════════════════════════════════════════
   THEME TOGGLE (auto-detect + manual)
═══════════════════════════════════════════ */
(function() {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  function detectSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    } else {
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    }
    localStorage.setItem('pn-theme', theme);
  }

  // Init: saved preference OR system preference
  const saved = localStorage.getItem('pn-theme');
  applyTheme(saved || detectSystemTheme());

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('pn-theme')) applyTheme(e.matches ? 'dark' : 'light');
  });

  // Manual toggle
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();


/* ═══════════════════════════════════════════
   COUNTDOWN — shared logic
═══════════════════════════════════════════ */
const EVENT_DATE = new Date('2026-06-28T08:00:00');

function getCountdownValues() {
  const diff = Math.max(0, EVENT_DATE - new Date());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, diff };
}

function pad(n) { return String(n).padStart(2, '0'); }

/* Hero countdown */
function updateHeroCountdown() {
  const { d, h, m, s } = getCountdownValues();
  document.getElementById('hcd-d').textContent = pad(d);
  document.getElementById('hcd-h').textContent = pad(h);
  document.getElementById('hcd-m').textContent = pad(m);
  document.getElementById('hcd-s').textContent = pad(s);
}

/* Ring countdown */
function updateRingCountdown() {
  const { d, h, m, s } = getCountdownValues();

  // Update numbers
  document.getElementById('cd-d').textContent = pad(d);
  document.getElementById('cd-h').textContent = pad(h);
  document.getElementById('cd-m').textContent = pad(m);
  document.getElementById('cd-s').textContent = pad(s);

  // Update ring progress (circumference = 2π × 42 ≈ 264)
  const C = 264;
  const maxDays = 365;
  function offset(val, max) { return C - (val / max) * C; }

  const pd = document.getElementById('prog-d');
  const ph = document.getElementById('prog-h');
  const pm = document.getElementById('prog-m');
  const ps = document.getElementById('prog-s');
  if (pd) pd.style.strokeDashoffset = offset(d % maxDays, maxDays);
  if (ph) ph.style.strokeDashoffset = offset(h, 24);
  if (pm) pm.style.strokeDashoffset = offset(m, 60);
  if (ps) ps.style.strokeDashoffset = offset(s, 60);
}

/* Live section timer */
function updateLiveTimer() {
  const { d, h, m } = getCountdownValues();
  const ld = document.getElementById('lt-d');
  const lh = document.getElementById('lt-h');
  const lm = document.getElementById('lt-m');
  if (ld) ld.textContent = pad(d);
  if (lh) lh.textContent = pad(h);
  if (lm) lm.textContent = pad(m);
}

/* Check if event is live (same day ±1 day window) */
function checkLiveStatus() {
  const now = new Date();
  const eventDay = new Date('2026-06-28T00:00:00');
  const eventEnd = new Date('2026-06-28T23:59:59');
  if (now >= eventDay && now <= eventEnd) {
    document.getElementById('liveLocked').style.display = 'none';
    document.getElementById('liveActive').classList.add('show');
  }
}

updateHeroCountdown();
updateRingCountdown();
updateLiveTimer();
checkLiveStatus();
setInterval(() => { updateHeroCountdown(); updateRingCountdown(); updateLiveTimer(); }, 1000);


/* ═══════════════════════════════════════════
   LEAFLET MAP
═══════════════════════════════════════════ */
(function initMap() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // Center on the actual route (adjusted from GPX)
  const map = L.map('map', { zoomControl: true }).setView([-8.8175, 13.2405], 16);

  L.tileLayer(tileUrl, {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 20
  }).addTo(map);

  // FULL ROUTE COORDINATES from your GPX (cleaned, no duplicates)
  const routeCoords = [
    [-8.819135, 13.243967],
    [-8.818912, 13.2432],
    [-8.818779, 13.242751],
    [-8.81856, 13.242005],
    [-8.818344, 13.241312],
    [-8.818242, 13.240983],
    [-8.817981, 13.240044],
    [-8.817815, 13.239516],
    [-8.817399, 13.238138],
    [-8.816988, 13.236779],
    [-8.81668, 13.235822],
    [-8.816653, 13.235719],
    [-8.816549, 13.235399],
    [-8.816385, 13.234907],
    [-8.816322, 13.234716],
    [-8.816229, 13.23444],
    [-8.816137, 13.234164],
    [-8.815824, 13.233273],
    [-8.815669, 13.23278],
    [-8.815503, 13.232251],
    [-8.815485, 13.232167],
    [-8.815477, 13.232169],
    [-8.815269, 13.23222],
    [-8.814903, 13.2323],
    [-8.814669, 13.232349],
    [-8.814673, 13.232348],
    [-8.814815, 13.232983],
    [-8.814939, 13.233494],
    [-8.81504, 13.233904],
    [-8.815099, 13.234175],
    [-8.815214, 13.234696],
    [-8.815221, 13.234742],
    [-8.815226, 13.234949],
    [-8.815218, 13.234978],
    [-8.815204, 13.235035],
    [-8.815273, 13.235347],
    [-8.81544, 13.236048],
    [-8.81553, 13.236404],
    [-8.815646, 13.236919],
    [-8.815896, 13.237991],
    [-8.815928, 13.238111],
    [-8.816023, 13.238298],
    [-8.816098, 13.238428],
    [-8.816201, 13.238538],
    [-8.816309, 13.238638],
    [-8.81632, 13.238656],
    [-8.816336, 13.238683],
    [-8.816366, 13.238787],
    [-8.816517, 13.239495],
    [-8.816647, 13.240102],
    [-8.816651, 13.240216],
    [-8.816644, 13.240313],
    [-8.816591, 13.240524],
    [-8.816606, 13.24063],
    [-8.816724, 13.24119],
    [-8.816799, 13.241555],
    [-8.816811, 13.241622],
    [-8.816799, 13.241673],
    [-8.816798, 13.241677],
    [-8.816819, 13.241725],
    [-8.816916, 13.242156],
    [-8.817053, 13.242768],
    [-8.817207, 13.24345],
    [-8.817252, 13.243653],
    [-8.817288, 13.243721],
    [-8.817314, 13.243828],
    [-8.817369, 13.24406],
    [-8.817517, 13.244691],
    [-8.817628, 13.245138],
    [-8.817727, 13.245503],
    [-8.817828, 13.245901],
    [-8.817955, 13.246424],
    [-8.818092, 13.246783],
    [-8.818114, 13.246868],
    [-8.818118, 13.246885],
    [-8.818401, 13.246816],
    [-8.818948, 13.246668],
    [-8.819686, 13.246473],
    [-8.819618, 13.246489],
    [-8.819679, 13.246455],
    [-8.819729, 13.246396],
    [-8.819759, 13.246327],
    [-8.819769, 13.246279],
    [-8.819784, 13.24614],
    [-8.819709, 13.245887],
    [-8.819524, 13.245292],
    [-8.819421, 13.244969],
    [-8.819294, 13.244524],
    [-8.819135, 13.243967]
  ];

  // Draw the route line
  L.polyline(routeCoords, { color: '#CC0000', weight: 5, opacity: 0.85, lineJoin: 'round' }).addTo(map);

  // Define key waypoints (exact coordinates from your street breakdown)
  // Start/End point: IASD Central de Luanda
  const startCoord = [-8.819135, 13.243967];
  const ptRuaReyToAvePortugal = [-8.817399, 13.238138];   // transition Rua Rey Katyavala → Avenida de Portugal
  const ptAvePortugalToRuaAmilcar = [-8.815477, 13.232169]; // Avenida de Portugal → Rua Amílcar Cabral
  const ptRuaAmilcarToRuaMissao = [-8.814669, 13.232349];   // Rua Amílcar Cabral → Rua da Missão
  const ptRuaMissaoToAveValodia = [-8.816206, 13.238538];   // Rua da Missão → Avenida Comandante Valódia (match existing point)
  const ptAveValodiaToAlameda = [-8.818114, 13.246868];     // Avenida Comandante Valódia → Alameda Ho Chi Minh
  const ptAlamedaToRuaReyReturn = [-8.819686, 13.246473];   // Alameda Ho Chi Minh → Rua Rey Katyavala (return leg)
  // End is same as start

  // Custom icons
  const mkStart = L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#CC0000;border:3px solid #fff;box-shadow:0 0 10px rgba(204,0,0,0.7)"></div>', className: '', iconSize: [14,14], iconAnchor: [7,7] });
  const mkEnd = L.divIcon({ html: '<div style="width:16px;height:16px;border-radius:50%;background:#D4AF37;border:3px solid #fff;box-shadow:0 0 10px rgba(212,175,55,0.7)"></div>', className: '', iconSize: [16,16], iconAnchor: [8,8] });
  const mkWp = L.divIcon({ html: '<div style="width:9px;height:9px;border-radius:50%;background:#003087;border:2px solid rgba(255,255,255,0.5)"></div>', className: '', iconSize: [9,9], iconAnchor: [4,4] });

  // Create markers for each key point
  L.marker(startCoord, { icon: mkStart })
    .bindPopup('<strong>Partida / Chegada</strong><br>IASD Central de Luanda<br><small>Rua Rey Katyavala</small>')
    .addTo(map);

  L.marker(ptRuaReyToAvePortugal, { icon: mkWp })
    .bindPopup('<strong>Transição</strong><br>Rua Rey Katyavala → Avenida de Portugal')
    .addTo(map);

  L.marker(ptAvePortugalToRuaAmilcar, { icon: mkWp })
    .bindPopup('<strong>Avenida de Portugal</strong><br>→ Rua Amílcar Cabral')
    .addTo(map);

  L.marker(ptRuaAmilcarToRuaMissao, { icon: mkWp })
    .bindPopup('<strong>Rua Amílcar Cabral</strong><br>→ Rua da Missão')
    .addTo(map);

  L.marker(ptRuaMissaoToAveValodia, { icon: mkWp })
    .bindPopup('<strong>Rua da Missão</strong><br>→ Avenida Comandante Valódia')
    .addTo(map);

  L.marker(ptAveValodiaToAlameda, { icon: mkWp })
    .bindPopup('<strong>Avenida Comandante Valódia</strong><br>→ Alameda Ho Chi Minh')
    .addTo(map);

  L.marker(ptAlamedaToRuaReyReturn, { icon: mkWp })
    .bindPopup('<strong>Alameda Ho Chi Minh</strong><br>→ Rua Rey Katyavala (regresso)')
    .addTo(map);

  L.marker(startCoord, { icon: mkEnd })
    .bindPopup('<strong>Chegada</strong><br>IASD Central de Luanda<br><small>Fim do percurso</small>')
    .addTo(map);

  // Update map tiles when theme changes
  document.getElementById('themeToggle').addEventListener('click', () => {
    setTimeout(() => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      map.eachLayer(l => { if (l._url) map.removeLayer(l); });
      L.tileLayer(dark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 20 }).addTo(map);
    }, 50);
  });
})();

/* ═══════════════════════════════════════════
   DEPT TABS
═══════════════════════════════════════════ */
function switchDept(btn, id) {
	document.querySelectorAll('.dept-btn').forEach(b => b.classList.remove('active'));
	document.querySelectorAll('.dept-panel').forEach(p => p.classList.remove('active'));
	btn.classList.add('active');
  
	const panel = document.getElementById('dept-' + id);
	panel.classList.add('active');
  
	/* Reanima os cards do novo departamento */
	if (typeof gsap !== 'undefined') {
	  const cards = panel.querySelectorAll('.member-card');
	  gsap.fromTo(cards,
		{ opacity: 0, scale: 0.93, y: 20 },
		{
		  opacity: 1, scale: 1, y: 0,
		  duration: 0.45,
		  ease: 'back.out(1.4)',
		  stagger: 0.07,
		  clearProps: 'all'   /* limpa os inline styles depois — evita conflitos */
		}
	  );
	}
  }


/* ═══════════════════════════════════════════
   HAMBURGER
═══════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});

function closeMobileNav() {
  mobileNav.classList.remove('open');
}

// Close on outside click
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
    mobileNav.classList.remove('open');
  }
});


/* ═══════════════════════════════════════════
   WHATSAPP SHARE
═══════════════════════════════════════════ */
const TEMPLATES = {
  formal: (nome, link, extra) =>
`🎖️ *DESFILE DE ORDEM UNIDA · PALANCA NEGRA 2026*

Tema: *"Quebrando Silêncio, Uma Verdade Desconhecida"*
Subtema: _"Uma Verdade Desconhecida - Violência digital, Abuso sexual e Exploração de menores"_

📅 Data: 28 de Junho de 2026
📍 Local: Rua Rey Katyavala → Luanda

${extra ? extra + '\n\n' : ''}🔗 Mais informações: ${link}

${nome ? `— ${nome}` : ''}`,

  amigavel: (nome, link, extra) =>
`📢 KWÁS KWÁS, DESBRAVADORES PALANCA NEGRA! 🤩🚩
  Está a chegar um dos momentos mais aguardados do ano! 🎉🔥
  
  Já sabes do *Desfile de Ordem Unida* do clube Palanca Negra?

📌 Tema: *"Quebrando Silêncio"*
📣 Subtema: _"Uma Verdade Desconhecida - Violência digital, Abuso sexual e Exploração de menores"_
📅 28 de Junho de 2026 · Luanda

${extra ? extra + '\n\n' : ''}👀 Fica atento e acompanha todas as novidades! 👇
🔗 ${link}

💛 Uma marcha, uma mensagem, um propósito.
🚩 Juntos fazemos história!

${nome ? `Enviado por ${nome} 🙌` : ''}`,

  entusiasmado: (nome, link, extra) =>
`🔥🎖️ *NÃO PERCAS O DESFILE DE ORDEM UNIDA DO PALANCA NEGRA!* 🎖️🔥

Tema: *"QUEBRANDO SILÊNCIO"*
Subtema: _"📣 Subtema: Uma Verdade Desconhecida - Violência digital, Abuso sexual e Exploração de menores"_

📅 28 DE JUNHO DE 2026
📍 Luanda — Rua Rey Katyavala

${extra ? '💬 ' + extra + '\n\n' : ''}👀 Tudo sobre o evento:
${link}

#DesbravadoresPalancaNegra 🔥
#QuebrandoOSilêncio 🤫
#JuntosFazemosHistória ✨

${nome ? `🤝 ${nome}` : ''}`,
};

function buildMsg() {
  const nome = document.getElementById('shareNome').value.trim();
  const link = document.getElementById('shareLink').value.trim() || 'https://desfile-palanca-negra.vercel.app';
  const extra = document.getElementById('shareExtra').value.trim();
  const tom = document.getElementById('shareTom').value;
  return TEMPLATES[tom](nome, link, extra);
}

function updateShareMsg() {
  const msg = buildMsg();
  document.getElementById('msgPreview').textContent = msg;
  const enc = encodeURIComponent(msg);
  document.getElementById('waStatusLink').href = `whatsapp://send?text=${enc}`;
  document.getElementById('waGroupLink').href = `https://api.whatsapp.com/send?text=${enc}`;
}

// Init on load
document.addEventListener('DOMContentLoaded', updateShareMsg);
['shareNome','shareLink','shareExtra','shareTom'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateShareMsg);
});


/* ═══════════════════════════════════════════
   GSAP ANIMATIONS
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // ── HERO ENTRANCE ──
  const tl = gsap.timeline({ delay: 0.2 });

  tl.to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.1)
    .fromTo('#heroH1',
      { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out' },
      0.3)
    .to('#heroSubtitle', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.8)
    .to('#heroMeta', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.0)
    .to('#heroActions', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.15)
    .to('#heroCountdown', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.3)
    .to('#scrollHint', { opacity: 1, duration: 0.5 }, 2.0);

  // ── HERO PARALLAX ──
  const bgImg = document.getElementById('heroBgImg');
  if (bgImg) {
    gsap.to(bgImg, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // ── SCROLL REVEAL — .gs-fade elements ──
  gsap.utils.toArray('.gs-fade').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.75, ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        delay: (i % 4) * 0.07,
      }
    );
  });

  // ── TIMELINE ITEMS STAGGER ──
  gsap.utils.toArray('.tl-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0,
        duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 90%' },
        delay: i * 0.08,
      }
    );
  });

  // ── MEMBER CARDS STAGGER ──
  document.querySelectorAll('.dept-panel.active .member-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, scale: 0.93, y: 20 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.5, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: card, start: 'top 92%' },
        delay: i * 0.07,
      }
    );
  });

  // ── RULE ITEMS ──
  gsap.utils.toArray('.rule-item').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, x: 20 },
      {
        opacity: 1, x: 0,
        duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
        delay: i * 0.1,
      }
    );
  });

  // ── SECTION TITLES ──
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } }
    );
  });

  // ── COUNTDOWN RINGS APPEAR ──
  gsap.fromTo('.cd-block',
    { opacity: 0, scale: 0.7 },
    { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.1,
      scrollTrigger: { trigger: '#contagem', start: 'top 85%' } }
  );

  // ── ROUTE STEPS ──
  gsap.utils.toArray('.route-step').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
        delay: i * 0.08 }
    );
  });

  // ── ROTA STATS COUNTER ──
  gsap.utils.toArray('.rs-val').forEach(el => {
  const raw = el.textContent.trim();
  const target = parseFloat(raw.replace('≈', '').replace(',', '.'));
  if (!isNaN(target)) {
    // Determine if we need one decimal place
    const hasDecimal = raw.includes('.') || raw.includes(',');
    const decimals = hasDecimal ? 1 : 0;
    
    // Create a dummy object to animate a numeric value
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function() {
        if (decimals === 1) {
          el.textContent = obj.val.toFixed(1);
        } else {
          el.textContent = Math.round(obj.val);
        }
      }
    });
  }
});

  // ── NAV HIDE/SHOW ON SCROLL ──
  let lastScroll = 0;
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    if (cur > 100 && cur > lastScroll) {
      gsap.to(header, { yPercent: -100, duration: 0.3, ease: 'power2.in' });
    } else {
      gsap.to(header, { yPercent: 0, duration: 0.3, ease: 'power2.out' });
    }
    lastScroll = cur;
  }, { passive: true });

});

/* ═══════════════════════════════════════════
   MODAIS — TERMOS E PRIVACIDADE
═══════════════════════════════════════════ */
document.querySelectorAll('a[href="#termos"], a[href="#privacidade"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
  });
});

// Fechar com tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('termos').style.display = 'none';
    document.getElementById('privacidade').style.display = 'none';
  }
});
