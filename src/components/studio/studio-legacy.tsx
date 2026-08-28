import Reveal from './Reveal';

export default function StudioLegacy() {
    return (
        <section className="studio-legacy" id="verkefnid">
            <style>{CSS}</style>
            <div className="legacy-inner">
                <div className="legacy-number" aria-hidden>34</div>

                <div className="legacy-copy">
                    <Reveal>
                        <p className="legacy-kicker">Í loftinu síðan 1992</p>
                        <h2>Köllunin hefur ekki breyst.</h2>
                        <p>
                            Omega var stofnuð til að bera boðskapinn um Jesú Krist inn á
                            íslensk heimili. Sú köllun stendur. En tækin sem bera boðskapinn
                            þurfa að halda áfram með okkur.
                        </p>
                        <p className="legacy-line">
                            Við endurnýjum verkfærin.<br />Ekki boðskapinn.
                        </p>
                    </Reveal>
                </div>

                <Reveal delay={0.12}>
                    <figure className="legacy-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/history/satellite-dish.jpg" alt="Gervihnattabúnaður Omega" />
                        <figcaption>
                            <span>Gervihnattabúnaður Omega</span>
                            <span>Úr safni Omega</span>
                        </figcaption>
                    </figure>
                </Reveal>
            </div>
        </section>
    );
}

const CSS = `
.studio-legacy{position:relative;background:#F1EBDD;color:#191611;padding:clamp(82px,10vw,132px) 0;overflow:hidden}
.legacy-inner{position:relative;max-width:80rem;margin:0 auto;padding:0 var(--rail-padding);display:grid;
    grid-template-columns:minmax(0,.85fr) minmax(330px,.9fr);gap:clamp(56px,8vw,110px);align-items:center}
.legacy-number{position:absolute;z-index:0;left:calc(var(--rail-padding) - 16px);top:-76px;
    color:rgba(138,90,34,.08);font:300 clamp(190px,28vw,390px)/.8 var(--font-display);letter-spacing:-.08em}
.legacy-copy{position:relative;z-index:1;padding-left:clamp(0px,4vw,58px)}
.legacy-kicker{margin:0 0 18px;color:#8A5A22;font:700 12px/1 var(--font-sans);letter-spacing:.19em;text-transform:uppercase}
.legacy-copy h2{max-width:9ch;margin:0;font:400 clamp(42px,5.6vw,70px)/.98 var(--font-display);letter-spacing:-.035em}
.legacy-copy>div>p:not(.legacy-kicker):not(.legacy-line){max-width:46ch;margin:26px 0 0;color:#554C40;font:400 18px/1.65 var(--font-serif)}
.legacy-line{margin:30px 0 0;color:#8A5A22;font:500 clamp(25px,3vw,34px)/1.18 var(--font-display);font-style:italic}
.legacy-photo{position:relative;z-index:1;margin:0;background:#12100E;padding:12px;transform:rotate(1.2deg);box-shadow:0 34px 70px -40px rgba(25,22,17,.75)}
.legacy-photo img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover}
.legacy-photo figcaption{display:flex;justify-content:space-between;gap:20px;padding:12px 5px 2px;color:rgba(247,241,232,.62);
    font:600 10px/1.3 var(--font-sans);letter-spacing:.13em;text-transform:uppercase}
@media(max-width:800px){.legacy-inner{grid-template-columns:1fr}.legacy-copy{padding-left:0}.legacy-copy h2{max-width:none}.legacy-photo{width:min(100%,620px)}}
`;
