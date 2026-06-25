// Faithful static port of the Heimakirkja Claude Design bundle (Heimakirkja.html).
// The page renders HTML via dangerouslySetInnerHTML; CSS below carries only the
// page-specific rules — design tokens (--nott, --gull, --font-display, type
// roles, etc.) already live in globals.css.
//
// To restyle, edit the design in the Claude Design workstream and re-export here.
// The design is self-contained (its own nav + sections + footer), so the page
// renders it WITHOUT the global Navbar/Footer.

export const CSS = `
:root{
  --skra-warm:#EBE1CF;
  --mor:#8A6A4A;
  --border-hover:rgba(255,255,255,0.18);
}
#hk-root *{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--nott)}
::selection{background:rgba(233,168,96,0.28);color:var(--ljos)}

/* Fixed nav: transparent over the hero, frosted-dark once you scroll so the
   light wordmark stays legible over the cream sections. */
#hk-nav{transition:background .35s ease, backdrop-filter .35s ease, border-color .35s ease}
/* inline style on the nav is background:transparent, so the solid state needs
   !important to win once you scroll past the hero. */
#hk-nav.hk-nav-solid{background:rgba(20,18,15,0.82)!important;backdrop-filter:blur(20px) saturate(1.2);border-bottom:1px solid var(--border)!important}
.hk-link{transition:color .3s ease}
.hk-link:hover{color:var(--ljos)}

/* FAQ disclosure */
.hk-faq summary{list-style:none}
.hk-faq summary::-webkit-details-marker{display:none}
.hk-faq-plus{transition:transform .3s ease}
.hk-faq details[open] .hk-faq-plus{transform:rotate(45deg)}

/* CTA polish (the design's sc* classes carry only hover intent) */
.scp0,.scp1,.scp3{transition:transform .25s ease, box-shadow .25s ease}
.scp0:hover,.scp1:hover,.scp3:hover{transform:translateY(-1px);box-shadow:0 14px 34px -14px rgba(200,138,62,0.65)}
.scp2{transition:border-color .25s ease, background .25s ease}
.scp2:hover{border-color:var(--ljos)}

/* Cinematic fallback until real media is dropped into the slots:
   a warm Icelandic-dawn glow instead of flat black. */
#hk-hero{background:
  radial-gradient(90% 70% at 76% 18%, rgba(228,178,110,0.20), transparent 58%),
  radial-gradient(120% 90% at 18% 108%, rgba(120,150,170,0.16), transparent 60%),
  var(--nott)}
#hk-moment{background:
  radial-gradient(80% 70% at 50% 120%, rgba(214,158,92,0.22), transparent 62%),
  var(--nott)}
#hk-final{background:
  radial-gradient(100% 80% at 50% 8%, rgba(228,182,118,0.20), transparent 60%),
  radial-gradient(80% 60% at 50% 116%, rgba(150,176,196,0.12), transparent 64%),
  var(--nott)}

@media (max-width:760px){
  .hk-nav-links{display:none!important}
  .hk-build-row{grid-template-columns:1fr!important;gap:8px!important}
}
`;

export const HTML = `<main id="hk-root" style="min-height: 100vh; background: var(--nott); color: var(--ljos); font-family: var(--font-sans); overflow-x: hidden;">

  <nav id="hk-nav" style="position: fixed; top: 0px; left: 0px; right: 0px; z-index: 50; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 18px var(--rail-padding); background: transparent; border-bottom: 1px solid transparent;">
    <a href="#hk-root" aria-label="Omega Stöðin" style="display: inline-flex; align-items: center; color: var(--ljos); text-decoration: none;">
      <svg viewBox="0 0 1000 300" height="26" fill="none" role="img" aria-hidden="true" style="height: 26px; width: auto; display: block; color: var(--ljos);">
        <defs><mask id="omegaCutNav" maskUnits="userSpaceOnUse"><rect width="1000" height="300" fill="white"></rect><rect x="0" y="212" width="240" height="6" fill="black"></rect></mask></defs>
        <g mask="url(#omegaCutNav)"><g transform="translate(0,10)"><circle cx="120" cy="120" r="104" stroke="currentColor" stroke-width="22" fill="none"></circle><text x="120" y="202" fill="currentColor" font-family="'Fraunces','Newsreader',Georgia,serif" font-size="235" font-weight="700" text-anchor="middle">Ω</text></g></g>
        <text x="248" y="212" fill="currentColor" font-family="'Fraunces','Newsreader',Georgia,serif" font-size="235" font-weight="700" letter-spacing="-0.005em">MEGA</text>
      </svg>
    </a>
    <div class="hk-nav-links" style="display: flex; align-items: center; gap: 30px;">
      <a class="hk-link" href="#sannleikur" style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; letter-spacing: 0.01em; color: var(--moskva); text-decoration: none;">Hvernig</a>
      <a class="hk-link" href="#synin" style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; letter-spacing: 0.01em; color: var(--moskva); text-decoration: none;">Sýnin</a>
      <a class="hk-link" href="#skraning" style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; letter-spacing: 0.01em; color: var(--moskva); text-decoration: none;">Skráning</a>
      <a href="https://www.skra.is/umsoknir/rafraen-skil/tru-og-lifsskodunarfelag/" target="_blank" rel="noopener noreferrer" class="scp0" style="display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; background: var(--gull); color: var(--nott); border: 1px solid var(--gull); border-radius: var(--radius-xs); font-family: var(--font-sans); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-decoration: none;">Skráðu þig (0 kr.)</a>
    </div>
  </nav>

  <section data-screen-label="Hero" style="position: relative; min-height: 100svh; display: flex; align-items: center; overflow: hidden; background: var(--nott); border-bottom: 1px solid var(--border);">
    <image-slot id="hk-hero" fit="cover" placeholder="Hetjumynd · íslensk dögun eða ljós inn á heimili (slepptu mynd hér)" style="position: absolute; inset: 0px; width: 100%; height: 100%; display: block; border-radius: 0px;"></image-slot>

    <div aria-hidden="true" style="position: absolute; inset: 0px; pointer-events: none; background: linear-gradient(180deg, rgba(20,18,15,0.55) 0%, rgba(20,18,15,0) 24%, rgba(20,18,15,0) 50%, var(--nott) 100%);"></div>
    <div aria-hidden="true" style="position: absolute; inset: 0px; pointer-events: none; background: linear-gradient(90deg, rgba(20, 18, 15, 0.62) 0%, rgba(20, 18, 15, 0.12) 46%, transparent 72%);"></div>

    <div style="position: relative; width: 100%; max-width: 72rem; margin: 0px auto; padding: clamp(150px,20vh,232px) var(--rail-padding) clamp(120px,16vh,180px); pointer-events: none;">
      <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: var(--nordurljos);">Heimakirkja</div>
      <h1 style="margin: 30px 0px 0px; font-family: var(--font-display); font-size: clamp(48px, 8.5vw, 118px); line-height: 0.96; font-weight: 300; color: var(--ljos); letter-spacing: -0.03em; text-wrap: balance; max-width: 15ch;">Kirkjan heim til þjóðarinnar.</h1>
      <p style="margin: 36px 0px 0px; font-family: var(--font-serif); font-style: italic; font-size: clamp(20px, 2.2vw, 30px); line-height: 1.42; color: var(--ljos); opacity: 0.86; max-width: 44rem; text-wrap: pretty;">Omega hefur borið fagnaðarerindið inn á íslensk heimili í meira en þrjá áratugi. Nú getum við byggt næsta kafla saman.</p>
      <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 48px; pointer-events: auto;">
        <a href="https://www.skra.is/umsoknir/rafraen-skil/tru-og-lifsskodunarfelag/" target="_blank" rel="noopener noreferrer" class="scp1" style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: var(--gull); color: var(--nott); border: 1px solid var(--gull); border-radius: var(--radius-xs); font-family: var(--font-sans); font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-decoration: none;">Skráðu þig (0 kr.)</a>
        <a href="#skraning" class="scp2" style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: rgba(20, 18, 15, 0.35); color: var(--ljos); border: 1px solid var(--border-hover); border-radius: var(--radius-xs); font-family: var(--font-sans); font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-decoration: none; backdrop-filter: blur(6px);">Sjá hvernig það virkar</a>
      </div>
    </div>

    <div aria-hidden="true" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 12px; pointer-events: none;">
      <span style="font-family: var(--font-sans); font-size: 10px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--steinn);">Sýnin</span>
      <span style="width: 1px; height: 40px; background: linear-gradient(var(--steinn),transparent); display: block; opacity: 0.6;"></span>
    </div>
  </section>

  <section id="sannleikur" data-screen-label="Hvernig" style="background: var(--skra); color: var(--skra-djup); scroll-margin-top: 84px;">
    <div style="max-width: 72rem; margin: 0px auto; padding: clamp(80px,10vw,124px) var(--rail-padding);">
      <div style="opacity: 1;">
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--mor);">Hið einfalda sannleikskorn</div>
        <h2 style="margin: 20px 0px 0px; font-family: var(--font-serif); font-size: clamp(28px, 3.8vw, 48px); line-height: 1.1; font-weight: 400; color: var(--skra-djup); letter-spacing: -0.015em; text-wrap: balance; max-width: 20ch;">Sóknargjaldið fer hvort eð er eitthvað. Þú færð að velja hvert.</h2>
        <p style="margin: 24px 0px 0px; font-family: var(--font-serif); font-size: clamp(17px, 1.5vw, 21px); line-height: 1.62; color: var(--skra-mjuk); max-width: 44rem;">Ríkið greiðir 1.221 kr. á mánuði fyrir hvern einstakling 16 ára og eldri til skráðs trúfélags. Þetta heita sóknargjöld og þau koma af sköttunum sem þú borgar hvort eð er. Þú getur valið að þau renni til Heimakirkju. Það kostar þig ekki eina krónu í viðbót.</p>
      </div>
      <ul style="list-style: none; padding: 0px; margin: 48px 0px 0px; display: grid; gap: clamp(20px, 3vw, 36px); grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); opacity: 1;">
        <li style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding-top: 22px;">
          <div style="font-family: var(--font-display); font-size: clamp(34px, 3.4vw, 46px); font-weight: 300; color: var(--skra-djup); letter-spacing: -0.02em;">0 kr.</div>
          <div style="margin-top: 12px; font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--skra-mjuk);">Enginn aukakostnaður. Sóknargjaldið er nú þegar tekið af sköttunum þínum.</div>
        </li>
        <li style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding-top: 22px;">
          <div style="font-family: var(--font-display); font-size: clamp(34px, 3.4vw, 46px); font-weight: 300; color: var(--skra-djup); letter-spacing: -0.02em;">Þitt val</div>
          <div style="margin-top: 12px; font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--skra-mjuk);">Þú ræður hvert gjaldið rennur, og getur breytt því hvenær sem er.</div>
        </li>
        <li style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding-top: 22px;">
          <div style="font-family: var(--font-display); font-size: clamp(34px, 3.4vw, 46px); font-weight: 300; color: var(--skra-djup); letter-spacing: -0.02em;">2 mínútur</div>
          <div style="margin-top: 12px; font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--skra-mjuk);">Skráningin fer fram hjá Þjóðskrá með rafrænum skilríkjum.</div>
        </li>
      </ul>
    </div>
  </section>

  <section id="synin" data-screen-label="Sýnin" style="background: var(--nott); color: var(--ljos); border-top: 1px solid var(--border); scroll-margin-top: 84px;">
    <div style="max-width: 72rem; margin: 0px auto; padding: clamp(84px,11vw,136px) var(--rail-padding);">
      <div style="opacity: 1;">
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--nordurljos);">Sýnin</div>
        <h2 style="margin: 22px 0px 0px; font-family: var(--font-display); font-size: clamp(32px, 4.6vw, 62px); line-height: 1.04; font-weight: 300; color: var(--ljos); letter-spacing: -0.02em; text-wrap: balance; max-width: 17ch;">Ef 3.000 manns segja já, verður það grunnur undir heila kristna fjölmiðlastöð.</h2>
        <p style="margin: clamp(28px, 4vw, 44px) 0px 0px; max-width: 46rem; font-family: var(--font-serif); font-size: clamp(18px, 1.8vw, 23px); line-height: 1.6; color: var(--moskva);">Omega er fyrsta og eina kristna sjónvarpsstöðin á Íslandi. Heimakirkja er leiðin fyrir venjulegt fólk til að halda ljósinu logandi, koma fagnaðarerindinu inn á heimili landsins, þýða bækur, byggja öpp og skapa kristna miðlun fyrir næstu kynslóð.</p>
      </div>
      <ul style="list-style: none; padding: 0px; margin: clamp(40px, 5vw, 60px) 0px 0px; max-width: 52rem; border-top: 1px solid var(--border); opacity: 1;">
        <li style="border-bottom: 1px solid var(--border); padding: 16px 0px; display: flex; align-items: baseline; gap: 18px;"><span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%; background: var(--gull); flex: 0 0 auto; transform: translateY(-3px);"></span><span style="font-family: var(--font-serif); font-size: clamp(20px, 2.2vw, 28px); font-weight: 400; color: var(--ljos); letter-spacing: -0.005em;">Útsendingar</span></li>
        <li style="border-bottom: 1px solid var(--border); padding: 16px 0px; display: flex; align-items: baseline; gap: 18px;"><span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%; background: var(--gull); flex: 0 0 auto; transform: translateY(-3px);"></span><span style="font-family: var(--font-serif); font-size: clamp(20px, 2.2vw, 28px); font-weight: 400; color: var(--ljos); letter-spacing: -0.005em;">Íslenskt efni</span></li>
        <li style="border-bottom: 1px solid var(--border); padding: 16px 0px; display: flex; align-items: baseline; gap: 18px;"><span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%; background: var(--gull); flex: 0 0 auto; transform: translateY(-3px);"></span><span style="font-family: var(--font-serif); font-size: clamp(20px, 2.2vw, 28px); font-weight: 400; color: var(--ljos); letter-spacing: -0.005em;">Þýddar bækur</span></li>
        <li style="border-bottom: 1px solid var(--border); padding: 16px 0px; display: flex; align-items: baseline; gap: 18px;"><span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%; background: var(--gull); flex: 0 0 auto; transform: translateY(-3px);"></span><span style="font-family: var(--font-serif); font-size: clamp(20px, 2.2vw, 28px); font-weight: 400; color: var(--ljos); letter-spacing: -0.005em;">Öpp fyrir fjölskyldur</span></li>
        <li style="border-bottom: 1px solid var(--border); padding: 16px 0px; display: flex; align-items: baseline; gap: 18px;"><span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%; background: var(--gull); flex: 0 0 auto; transform: translateY(-3px);"></span><span style="font-family: var(--font-serif); font-size: clamp(20px, 2.2vw, 28px); font-weight: 400; color: var(--ljos); letter-spacing: -0.005em;">Bæn</span></li>
        <li style="border-bottom: 1px solid var(--border); padding: 16px 0px; display: flex; align-items: baseline; gap: 18px;"><span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%; background: var(--gull); flex: 0 0 auto; transform: translateY(-3px);"></span><span style="font-family: var(--font-serif); font-size: clamp(20px, 2.2vw, 28px); font-weight: 400; color: var(--ljos); letter-spacing: -0.005em;">Fræðsla</span></li>
        <li style="border-bottom: 1px solid var(--border); padding: 16px 0px; display: flex; align-items: baseline; gap: 18px;"><span aria-hidden="true" style="width: 6px; height: 6px; border-radius: 50%; background: var(--gull); flex: 0 0 auto; transform: translateY(-3px);"></span><span style="font-family: var(--font-serif); font-size: clamp(20px, 2.2vw, 28px); font-weight: 400; color: var(--ljos); letter-spacing: -0.005em;">Von á skjánum, allan sólarhringinn</span></li>
      </ul>
    </div>
  </section>

  <section data-screen-label="Heimili landsins" style="position: relative; min-height: 88vh; display: flex; align-items: flex-end; overflow: hidden; background: var(--nott); border-top: 1px solid var(--border);">
    <image-slot id="hk-moment" fit="cover" placeholder="Heimili upplýst að kvöldi, andlit, ljós í glugga (slepptu mynd hér)" style="position: absolute; inset: 0px; width: 100%; height: 100%; display: block; border-radius: 0px;"></image-slot>
    <div aria-hidden="true" style="position: absolute; inset: 0px; pointer-events: none; background: linear-gradient(180deg, rgba(20,18,15,0.42) 0%, rgba(20,18,15,0) 32%, rgba(20,18,15,0.40) 62%, var(--nott) 100%);"></div>
    <div style="position: relative; width: 100%; max-width: 72rem; margin: 0px auto; padding: clamp(64px,9vw,112px) var(--rail-padding); pointer-events: none; opacity: 1;">
      <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: var(--nordurljos);">Heimili landsins</div>
      <p style="margin: 22px 0px 0px; font-family: var(--font-display); font-size: clamp(30px, 5vw, 68px); line-height: 1.04; font-weight: 300; color: var(--ljos); letter-spacing: -0.02em; text-wrap: balance; max-width: 18ch;">Eitt já. Eitt heimili. Þrjú þúsund sem halda ljósinu logandi.</p>
    </div>
  </section>

  <section data-screen-label="Það sem fylgir" style="background: var(--skra); color: var(--skra-djup);">
    <div style="max-width: 72rem; margin: 0px auto; padding: clamp(80px,10vw,124px) var(--rail-padding);">
      <header style="max-width: 44rem; margin-bottom: clamp(40px, 5vw, 60px); opacity: 1;">
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--mor);">Það sem fylgir</div>
        <h2 style="margin: 18px 0px 0px; font-family: var(--font-serif); font-size: clamp(28px, 3.6vw, 46px); line-height: 1.12; font-weight: 400; color: var(--skra-djup); letter-spacing: -0.015em; text-wrap: balance;">Þetta er ekki bara skráning. Þú gengur í samfélag.</h2>
      </header>
      <ul style="list-style: none; padding: 0px; margin: 0px; display: grid; gap: clamp(20px, 2.6vw, 28px); grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); opacity: 1;">
        <li style="background: var(--skra-warm); border: 1px solid rgba(63, 47, 35, 0.12); border-radius: var(--radius-sm); padding: clamp(28px, 3vw, 36px);">
          <div aria-hidden="true" style="width: 32px; height: 2px; background: var(--gull); margin-bottom: 20px;"></div>
          <h3 style="margin: 0px; font-family: var(--font-serif); font-size: clamp(22px, 2.2vw, 28px); font-weight: 400; color: var(--skra-djup); letter-spacing: -0.005em;">Bókaklúbbur</h3>
          <p style="margin: 12px 0px 0px; font-family: var(--font-sans); font-size: 15.5px; line-height: 1.6; color: var(--skra-mjuk);">Við lesum saman. Uppbyggjandi bækur sem styrkja trúna, ný hver mánuður, með umræðu og leiðsögn.</p>
        </li>
        <li style="background: var(--skra-warm); border: 1px solid rgba(63, 47, 35, 0.12); border-radius: var(--radius-sm); padding: clamp(28px, 3vw, 36px);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px;">
            <div aria-hidden="true" style="width: 32px; height: 2px; background: var(--gull);"></div>
            <span style="display: inline-flex; align-items: center; padding: 4px 10px; border: 1px solid rgba(200, 138, 62, 0.4); border-radius: var(--radius-xs); font-family: var(--font-sans); font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mor); background: rgba(200, 138, 62, 0.08);">Á leiðinni</span>
          </div>
          <h3 style="margin: 0px; font-family: var(--font-serif); font-size: clamp(22px, 2.2vw, 28px); font-weight: 400; color: var(--skra-djup); letter-spacing: -0.005em;">Þýdda bókasafnið</h3>
          <p style="margin: 12px 0px 0px; font-family: var(--font-sans); font-size: 15.5px; line-height: 1.6; color: var(--skra-mjuk);">Aðgangur að sívaxandi safni kristinna bóka, þýddra á íslensku, í appinu okkar. Lestu hvar sem þú ert.</p>
        </li>
        <li style="background: var(--skra-warm); border: 1px solid rgba(63, 47, 35, 0.12); border-radius: var(--radius-sm); padding: clamp(28px, 3vw, 36px);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px;">
            <div aria-hidden="true" style="width: 32px; height: 2px; background: var(--gull);"></div>
            <span style="display: inline-flex; align-items: center; padding: 4px 10px; border: 1px solid rgba(200, 138, 62, 0.4); border-radius: var(--radius-xs); font-family: var(--font-sans); font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mor); background: rgba(200, 138, 62, 0.08);">Á leiðinni</span>
          </div>
          <h3 style="margin: 0px; font-family: var(--font-serif); font-size: clamp(22px, 2.2vw, 28px); font-weight: 400; color: var(--skra-djup); letter-spacing: -0.005em;">Viðburðir</h3>
          <p style="margin: 12px 0px 0px; font-family: var(--font-sans); font-size: 15.5px; line-height: 1.6; color: var(--skra-mjuk);">Samkomur, fyrirlestrar og samvera. Á netinu og í eigin persónu, fyrir alla meðlimi.</p>
        </li>
        <li style="background: var(--skra-warm); border: 1px solid rgba(63, 47, 35, 0.12); border-radius: var(--radius-sm); padding: clamp(28px, 3vw, 36px);">
          <div aria-hidden="true" style="width: 32px; height: 2px; background: var(--gull); margin-bottom: 20px;"></div>
          <h3 style="margin: 0px; font-family: var(--font-serif); font-size: clamp(22px, 2.2vw, 28px); font-weight: 400; color: var(--skra-djup); letter-spacing: -0.005em;">Samfélag</h3>
          <p style="margin: 12px 0px 0px; font-family: var(--font-sans); font-size: 15.5px; line-height: 1.6; color: var(--skra-mjuk);">Þú tilheyrir. Bæn, hvatning og heimakirkja á skjánum allan ársins hring.</p>
        </li>
      </ul>
    </div>
  </section>

  <section data-screen-label="Ráðsmennska" style="background: var(--nott); color: var(--ljos); border-top: 1px solid var(--border);">
    <div style="max-width: 72rem; margin: 0px auto; padding: clamp(80px,10vw,124px) var(--rail-padding);">
      <header style="max-width: 44rem; margin-bottom: clamp(36px, 4vw, 52px); opacity: 1;">
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--nordurljos);">Ráðsmennska</div>
        <h2 style="margin: 18px 0px 0px; font-family: var(--font-serif); font-size: clamp(28px, 3.6vw, 46px); line-height: 1.12; font-weight: 400; color: var(--ljos); letter-spacing: -0.015em; text-wrap: balance;">Hver skráning verður að einhverju áþreifanlegu.</h2>
      </header>
      <ul style="list-style: none; padding: 0px; margin: 0px; display: grid; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; opacity: 1;">
        <li class="hk-build-row" style="background: var(--nott); padding: clamp(22px, 2.4vw, 30px) clamp(24px, 3vw, 36px); display: grid; grid-template-columns: minmax(0px, 16rem) 1fr; gap: clamp(16px, 3vw, 40px); align-items: baseline;"><div style="font-family: var(--font-serif); font-size: clamp(19px, 1.8vw, 24px); font-weight: 400; color: var(--ljos);">Útsending</div><div style="font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--moskva);">Dreifing í kapalkerfinu svo efnið nái inn á heimili um allt land.</div></li>
        <li class="hk-build-row" style="background: var(--nott); padding: clamp(22px, 2.4vw, 30px) clamp(24px, 3vw, 36px); display: grid; grid-template-columns: minmax(0px, 16rem) 1fr; gap: clamp(16px, 3vw, 40px); align-items: baseline;"><div style="font-family: var(--font-serif); font-size: clamp(19px, 1.8vw, 24px); font-weight: 400; color: var(--ljos);">Húsnæði og rekstur</div><div style="font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--moskva);">Þakið yfir starfinu og daglegur rekstur stöðvarinnar.</div></li>
        <li class="hk-build-row" style="background: var(--nott); padding: clamp(22px, 2.4vw, 30px) clamp(24px, 3vw, 36px); display: grid; grid-template-columns: minmax(0px, 16rem) 1fr; gap: clamp(16px, 3vw, 40px); align-items: baseline;"><div style="font-family: var(--font-serif); font-size: clamp(19px, 1.8vw, 24px); font-weight: 400; color: var(--ljos);">Starfsfólk</div><div style="font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--moskva);">Fólkið sem framleiðir, þýðir og heldur útsendingunni gangandi.</div></li>
        <li class="hk-build-row" style="background: var(--nott); padding: clamp(22px, 2.4vw, 30px) clamp(24px, 3vw, 36px); display: grid; grid-template-columns: minmax(0px, 16rem) 1fr; gap: clamp(16px, 3vw, 40px); align-items: baseline;"><div style="font-family: var(--font-serif); font-size: clamp(19px, 1.8vw, 24px); font-weight: 400; color: var(--ljos);">Stúdíó og búnaður</div><div style="font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--moskva);">Myndavélar, hljóð og tækni sem skila vönduðu efni.</div></li>
        <li class="hk-build-row" style="background: var(--nott); padding: clamp(22px, 2.4vw, 30px) clamp(24px, 3vw, 36px); display: grid; grid-template-columns: minmax(0px, 16rem) 1fr; gap: clamp(16px, 3vw, 40px); align-items: baseline;"><div style="font-family: var(--font-serif); font-size: clamp(19px, 1.8vw, 24px); font-weight: 400; color: var(--ljos);">Þýðingar og nýtt efni</div><div style="font-family: var(--font-sans); font-size: 15px; line-height: 1.55; color: var(--moskva);">Íslenskar þýðingar og nýtt efni, viku eftir viku.</div></li>
      </ul>
    </div>
  </section>

  <section data-screen-label="Framtíðin" style="position: relative; background: var(--nott); color: var(--ljos); border-top: 1px solid var(--border);">
    <div style="max-width: 60rem; margin: 0px auto; position: relative; padding: clamp(104px,14vw,176px) var(--rail-padding); text-align: center; opacity: 1;">
      <div aria-hidden="true" style="width: 52px; height: 1px; background: var(--gull); margin: 0px auto 30px;"></div>
      <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: var(--nordurljos);">Framtíðin</div>
      <h2 style="margin: 22px 0px 0px; font-family: var(--font-display); font-size: clamp(36px, 5.6vw, 74px); line-height: 1.02; font-weight: 300; color: var(--ljos); letter-spacing: -0.025em; text-wrap: balance;">Þetta er rétt að byrja.</h2>
      <p style="margin: 30px auto 0px; max-width: 42rem; font-family: var(--font-serif); font-size: clamp(18px, 1.9vw, 24px); line-height: 1.6; color: var(--moskva);">Ímyndaðu þér íslenskt kristið efni alla daga. Þýddar bækur og öpp fyrir hverja fjölskyldu. Barnaefni sem nær til næstu kynslóðar. Viðburði um allt land. Von á hverjum skjá, inn á hvert heimili. Ekki draumur fyrir fáa, heldur hreyfing heillar þjóðar.</p>
      <p style="margin: 34px auto 0px; max-width: 36rem; font-family: var(--font-serif); font-style: italic; font-size: clamp(21px, 2.3vw, 30px); line-height: 1.32; color: var(--gull);">Og það byrjar með einu já.</p>
    </div>
  </section>

  <section data-screen-label="Frá hjartanu" style="background: var(--skra-warm); color: var(--skra-djup);">
    <div style="max-width: 44rem; margin: 0px auto; padding: clamp(84px,11vw,136px) var(--rail-padding); text-align: center; opacity: 1;">
      <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--mor);">Frá hjartanu</div>
        <p style="margin: 28px 0px 0px; font-family: var(--font-serif); font-style: italic; font-size: clamp(22px, 2.6vw, 33px); line-height: 1.44; color: var(--skra-djup); letter-spacing: -0.005em; text-wrap: pretty;">„Við trúum að Guð sé ekki búinn með Ísland. Heimakirkja er leið til að standa saman, halda ljósinu logandi og bera vonina inn á hvert heimili. Þú þarft ekki að gefa neitt aukalega. Þú þarft bara að velja.“</p>
        <div style="display: flex; justify-content: center; margin: 32px 0px 0px;"><div aria-hidden="true" style="width: 52px; height: 1px; background: var(--gull);"></div></div>
        <div style="margin-top: 18px; font-family: var(--font-sans); font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--skra-mjuk);">Omega Stöðin</div>
    </div>
  </section>

  <section id="skraning" data-screen-label="Skráning" style="background: var(--nott); color: var(--ljos); border-top: 1px solid var(--border); scroll-margin-top: 84px;">
    <div style="max-width: 72rem; margin: 0px auto; padding: clamp(84px,11vw,136px) var(--rail-padding);">
      <header style="max-width: 44rem; margin-bottom: clamp(44px, 5vw, 64px); opacity: 1;">
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--nordurljos);">Skráning</div>
        <h2 style="margin: 18px 0px 0px; font-family: var(--font-serif); font-size: clamp(28px, 3.8vw, 50px); line-height: 1.1; font-weight: 400; color: var(--ljos); letter-spacing: -0.015em; text-wrap: balance;">Þrjár mínútur og þú ert komin/n í hús.</h2>
      </header>
      <ol style="list-style: none; padding: 0px; margin: 0px; display: grid; gap: clamp(28px, 3vw, 44px); grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); opacity: 1;">
        <li><div style="font-family: var(--font-display); font-size: clamp(34px, 3.4vw, 48px); font-weight: 300; color: var(--gull); letter-spacing: -0.02em; font-variant-numeric: tabular-nums;">01</div><h3 style="margin: 12px 0px 0px; font-family: var(--font-serif); font-size: clamp(20px, 2vw, 26px); font-weight: 400; color: var(--ljos);">Opnaðu Þjóðskrá</h3><p style="margin: 10px 0px 0px; font-family: var(--font-sans); font-size: 15px; line-height: 1.6; color: var(--moskva);">Smelltu á hnappinn og opnaðu skráningarsíðu Þjóðskrár (skra.is).</p></li>
        <li><div style="font-family: var(--font-display); font-size: clamp(34px, 3.4vw, 48px); font-weight: 300; color: var(--gull); letter-spacing: -0.02em; font-variant-numeric: tabular-nums;">02</div><h3 style="margin: 12px 0px 0px; font-family: var(--font-serif); font-size: clamp(20px, 2vw, 26px); font-weight: 400; color: var(--ljos);">Skráðu þig inn</h3><p style="margin: 10px 0px 0px; font-family: var(--font-sans); font-size: 15px; line-height: 1.6; color: var(--moskva);">Auðkenndu þig með rafrænum skilríkjum í símanum þínum.</p></li>
        <li><div style="font-family: var(--font-display); font-size: clamp(34px, 3.4vw, 48px); font-weight: 300; color: var(--gull); letter-spacing: -0.02em; font-variant-numeric: tabular-nums;">03</div><h3 style="margin: 12px 0px 0px; font-family: var(--font-serif); font-size: clamp(20px, 2vw, 26px); font-weight: 400; color: var(--ljos);">Veldu Heimakirkju</h3><p style="margin: 10px 0px 0px; font-family: var(--font-sans); font-size: 15px; line-height: 1.6; color: var(--moskva);">Finndu og veldu „Heimakirkja“ í listanum yfir trú- og lífsskoðunarfélög.</p></li>
        <li><div style="font-family: var(--font-display); font-size: clamp(34px, 3.4vw, 48px); font-weight: 300; color: var(--gull); letter-spacing: -0.02em; font-variant-numeric: tabular-nums;">04</div><h3 style="margin: 12px 0px 0px; font-family: var(--font-serif); font-size: clamp(20px, 2vw, 26px); font-weight: 400; color: var(--ljos);">Staðfestu</h3><p style="margin: 10px 0px 0px; font-family: var(--font-sans); font-size: 15px; line-height: 1.6; color: var(--moskva);">Staðfestu valið. Breytingin tekur gildi samstundis.</p></li>
      </ol>
      <div style="margin-top: clamp(44px, 5vw, 64px); display: flex; flex-wrap: wrap; gap: 16px; align-items: center; opacity: 1;">
        <a href="https://www.skra.is/umsoknir/rafraen-skil/tru-og-lifsskodunarfelag/" target="_blank" rel="noopener noreferrer" class="scp1" style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: var(--gull); color: var(--nott); border: 1px solid var(--gull); border-radius: var(--radius-xs); font-family: var(--font-sans); font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-decoration: none;">Opna Þjóðskrá</a>
        <span style="font-family: var(--font-sans); font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; color: var(--steinn);">0 kr. aukakostnaður · um 2 mínútur</span>
      </div>
      <p style="margin: 32px 0px 0px; max-width: 44rem; font-family: var(--font-sans); font-size: 13.5px; line-height: 1.65; color: var(--steinn);">Athugið: hver einstaklingur getur aðeins tilheyrt einu skráðu trú- eða lífsskoðunarfélagi. Breytingin er gjaldfrjáls og tekur gildi samdægurs. Skráning í Heimakirkju færir sóknargjaldið þitt þangað frá fyrri skráningu, og þú getur breytt því aftur hvenær sem er. Börn 15 ára og yngri breytast ekki sjálfkrafa; til þess þarf sérstakt eyðublað fyrir börn hjá Þjóðskrá.</p>
    </div>
  </section>

  <section data-screen-label="Spurt og svarað" class="hk-faq" style="background: var(--skra); color: var(--skra-djup);">
    <div style="max-width: 48rem; margin: 0px auto; padding: clamp(80px,10vw,124px) var(--rail-padding);">
      <div style="opacity: 1;">
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--mor);">Spurt og svarað</div>
        <h2 style="margin: 18px 0px clamp(28px, 4vw, 44px); font-family: var(--font-serif); font-size: clamp(28px, 3.4vw, 44px); line-height: 1.12; font-weight: 400; color: var(--skra-djup); letter-spacing: -0.015em;">Algengar spurningar</h2>
      </div>
      <div style="opacity: 1;">
        <details style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding: 20px 0px;"><summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-family: var(--font-serif); font-size: clamp(18px, 1.7vw, 22px); font-weight: 400; color: var(--skra-djup);"><span>Kostar þetta mig eitthvað?</span><span class="hk-faq-plus" aria-hidden="true" style="font-family: var(--font-sans); font-size: 22px; font-weight: 300; color: var(--mor); line-height: 1;">+</span></summary><p style="margin: 14px 0px 0px; font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--skra-mjuk);">Nei. Sóknargjöldin koma af sköttum sem þú borgar nú þegar. Það bætist engin króna við hjá þér.</p></details>
        <details style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding: 20px 0px;"><summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-family: var(--font-serif); font-size: clamp(18px, 1.7vw, 22px); font-weight: 400; color: var(--skra-djup);"><span>Hvað með börnin mín?</span><span class="hk-faq-plus" aria-hidden="true" style="font-family: var(--font-sans); font-size: 22px; font-weight: 300; color: var(--mor); line-height: 1;">+</span></summary><p style="margin: 14px 0px 0px; font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--skra-mjuk);">Skráning barns breytist ekki sjálfkrafa þegar þú breytir þinni. Fyrir börn 15 ára og yngri þarf að fylla út sérstakt eyðublað hjá Þjóðskrá.</p></details>
        <details style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding: 20px 0px;"><summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-family: var(--font-serif); font-size: clamp(18px, 1.7vw, 22px); font-weight: 400; color: var(--skra-djup);"><span>Get ég breytt þessu aftur?</span><span class="hk-faq-plus" aria-hidden="true" style="font-family: var(--font-sans); font-size: 22px; font-weight: 300; color: var(--mor); line-height: 1;">+</span></summary><p style="margin: 14px 0px 0px; font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--skra-mjuk);">Já, hvenær sem er á skra.is. Breytingin tekur gildi samstundis.</p></details>
        <details style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding: 20px 0px;"><summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-family: var(--font-serif); font-size: clamp(18px, 1.7vw, 22px); font-weight: 400; color: var(--skra-djup);"><span>Hvað verður um núverandi skráningu mína?</span><span class="hk-faq-plus" aria-hidden="true" style="font-family: var(--font-sans); font-size: 22px; font-weight: 300; color: var(--mor); line-height: 1;">+</span></summary><p style="margin: 14px 0px 0px; font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--skra-mjuk);">Hver getur aðeins tilheyrt einu félagi, svo skráning í Heimakirkju kemur í stað fyrri skráningar, til dæmis í þjóðkirkjunni.</p></details>
        <details style="border-top: 1px solid rgba(63, 47, 35, 0.16); padding: 20px 0px;"><summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-family: var(--font-serif); font-size: clamp(18px, 1.7vw, 22px); font-weight: 400; color: var(--skra-djup);"><span>Hvert fer stuðningurinn?</span><span class="hk-faq-plus" aria-hidden="true" style="font-family: var(--font-sans); font-size: 22px; font-weight: 300; color: var(--mor); line-height: 1;">+</span></summary><p style="margin: 14px 0px 0px; font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--skra-mjuk);">Í rekstur Omega: útsendingu, húsnæði, starfsfólk, búnað og nýtt efni á íslensku.</p></details>
        <details style="border-top: 1px solid rgba(63, 47, 35, 0.16); border-bottom: 1px solid rgba(63, 47, 35, 0.16); padding: 20px 0px;"><summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-family: var(--font-serif); font-size: clamp(18px, 1.7vw, 22px); font-weight: 400; color: var(--skra-djup);"><span>Hvað um persónuvernd?</span><span class="hk-faq-plus" aria-hidden="true" style="font-family: var(--font-sans); font-size: 22px; font-weight: 300; color: var(--mor); line-height: 1;">+</span></summary><p style="margin: 14px 0px 0px; font-family: var(--font-sans); font-size: 16px; line-height: 1.6; color: var(--skra-mjuk);">Skráningin sjálf fer fram hjá Þjóðskrá. Við fáum ekki aðgang að persónulegum gögnum þínum umfram það sem nauðsynlegt er.</p></details>
      </div>
    </div>
  </section>

  <section data-screen-label="Loka-kall" style="position: relative; background: var(--nott); color: var(--ljos); overflow: hidden; border-top: 1px solid var(--border);">
    <image-slot id="hk-final" fit="cover" placeholder="Dögun yfir Íslandi, ljós í gegnum ský (slepptu mynd hér)" style="position: absolute; inset: 0px; width: 100%; height: 100%; display: block; border-radius: 0px;"></image-slot>
    <div aria-hidden="true" style="position: absolute; inset: 0px; pointer-events: none; background: linear-gradient(180deg, var(--nott) 0%, rgba(20,18,15,0.58) 32%, rgba(20,18,15,0.58) 60%, var(--nott) 100%);"></div>
    <div style="max-width: 48rem; margin: 0px auto; position: relative; padding: clamp(120px,16vh,204px) var(--rail-padding); text-align: center; opacity: 1;">
      <h2 style="margin: 0px; font-family: var(--font-display); font-size: clamp(42px, 7.4vw, 98px); line-height: 0.98; font-weight: 300; color: var(--ljos); letter-spacing: -0.03em; text-wrap: balance;">Vertu hluti af þessu.</h2>
      <p style="margin: 28px 0px 0px; font-family: var(--font-serif); font-style: italic; font-size: clamp(20px, 2.1vw, 29px); line-height: 1.44; color: var(--moskva);">Það kostar þig ekkert. En það getur breytt heilli þjóð.</p>
      <div style="display: flex; justify-content: center; margin-top: 48px; pointer-events: auto;">
        <a href="https://www.skra.is/umsoknir/rafraen-skil/tru-og-lifsskodunarfelag/" target="_blank" rel="noopener noreferrer" class="scp3" style="display: inline-flex; align-items: center; gap: 10px; padding: 18px 38px; background: var(--gull); color: var(--nott); border: 1px solid var(--gull); border-radius: var(--radius-xs); font-family: var(--font-sans); font-size: 15px; font-weight: 700; letter-spacing: 0.06em; text-decoration: none;">Skráðu þig (0 kr.)</a>
      </div>
    </div>
  </section>

  <footer style="background: var(--nott); color: var(--moskva); border-top: 1px solid var(--border);">
    <div style="max-width: 72rem; margin: 0px auto; padding: clamp(56px,7vw,84px) var(--rail-padding) clamp(36px,4vw,52px); display: grid; gap: clamp(36px, 5vw, 64px); grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <div style="max-width: 24rem;">
        <div style="color: var(--kerti);">
          <svg viewBox="0 0 1000 300" height="30" fill="none" role="img" aria-label="Omega" style="height: 30px; width: auto; display: block; color: var(--kerti);">
            <defs><mask id="omegaCutFoot" maskUnits="userSpaceOnUse"><rect width="1000" height="300" fill="white"></rect><rect x="0" y="212" width="240" height="6" fill="black"></rect></mask></defs>
            <g mask="url(#omegaCutFoot)"><g transform="translate(0,10)"><circle cx="120" cy="120" r="104" stroke="currentColor" stroke-width="22" fill="none"></circle><text x="120" y="202" fill="currentColor" font-family="'Fraunces','Newsreader',Georgia,serif" font-size="235" font-weight="700" text-anchor="middle">Ω</text></g></g>
            <text x="248" y="212" fill="currentColor" font-family="'Fraunces','Newsreader',Georgia,serif" font-size="235" font-weight="700" letter-spacing="-0.005em">MEGA</text>
            <text x="252" y="262" fill="currentColor" font-family="Inter,-apple-system,'Helvetica Neue',sans-serif" font-size="26" font-weight="600" letter-spacing="0.22em">LJÓS OG VON FYRIR ÍSLAND</text>
          </svg>
        </div>
        <p style="margin: 22px 0px 0px; font-family: var(--font-serif); font-style: italic; font-size: 16px; line-height: 1.6; color: var(--moskva);">Heimakirkja er skráð trúfélag, stofnað af Omega. Saman höldum við ljósinu logandi.</p>
      </div>
      <div>
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--steinn);">Heimakirkja</div>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 18px;">
          <a class="hk-link" href="#sannleikur" style="font-family: var(--font-sans); font-size: 15px; color: var(--moskva); text-decoration: none;">Hvernig það virkar</a>
          <a class="hk-link" href="#synin" style="font-family: var(--font-sans); font-size: 15px; color: var(--moskva); text-decoration: none;">Sýnin</a>
          <a class="hk-link" href="#skraning" style="font-family: var(--font-sans); font-size: 15px; color: var(--moskva); text-decoration: none;">Skráning</a>
        </div>
      </div>
      <div>
        <div style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--steinn);">Skráðu þig</div>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 18px;">
          <a class="hk-link" href="https://www.skra.is/umsoknir/rafraen-skil/tru-og-lifsskodunarfelag/" target="_blank" rel="noopener noreferrer" style="font-family: var(--font-sans); font-size: 15px; color: var(--moskva); text-decoration: none;">Þjóðskrá · skra.is</a>
          <span style="font-family: var(--font-sans); font-size: 13px; color: var(--steinn); line-height: 1.5;">0 kr. aukakostnaður. Tekur gildi samdægurs með rafrænum skilríkjum.</span>
        </div>
      </div>
    </div>
    <div style="max-width: 72rem; margin: 0px auto; padding: 0 var(--rail-padding) clamp(36px,4vw,52px);">
      <div style="border-top: 1px solid var(--border); padding-top: 24px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center;">
        <span style="font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.04em; color: var(--steinn);">Omega Stöðin · Kristin fjölmiðlastöð síðan 1992</span>
        <span style="font-family: var(--font-sans); font-size: 12px; color: var(--steinn);">© 2026 Heimakirkja</span>
      </div>
    </div>
  </footer></main>`;
