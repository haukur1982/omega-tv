/**
 * The reading room's one stylesheet — vellum, and the two shapes it takes.
 *
 * It lives beside the components rather than inside the page because the
 * suggestion card and the phone sheet are rendered from three places now and
 * all of them must be set on the same paper.
 */
export const SHEET_CSS = `
.devo-sheet{
  --ink:#1B1814; --ink-soft:#4A4339; --ink-faint:#7A7268;
  --paper:#F3EDE0; --paper-warm:#EDE6D6; --gold:#C88A3E; --kerti:#E9A860;
  background:var(--paper); color:var(--ink);
  margin:-2rem; padding:0 0 5rem; min-height:100vh;
  font-family:var(--font-serif),Georgia,serif;
}
.devo-sheet.devo-focus{ position:fixed; inset:0; margin:0; overflow-y:auto; z-index:60; }

.devo-bar{
  position:sticky; top:0; z-index:30; display:flex; align-items:center; gap:.5rem;
  padding:.7rem clamp(1rem,4vw,3rem); background:rgba(243,237,224,.92);
  backdrop-filter:blur(12px); border-bottom:1px solid rgba(27,24,20,.10);
  font-family:var(--font-sans),system-ui,sans-serif;
}
.devo-count{ font-size:.78rem; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); font-variant-numeric:tabular-nums; }
.devo-dirty{ font-size:.75rem; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); }
.devo-ghost,.devo-solid{
  display:inline-flex; align-items:center; gap:.35rem; border-radius:6px; cursor:pointer;
  font-family:inherit; font-size:.82rem; font-weight:500; padding:.42rem .75rem; transition:all .15s ease;
}
.devo-ghost{ background:transparent; border:1px solid rgba(27,24,20,.16); color:var(--ink-soft); }
.devo-ghost:hover{ border-color:rgba(27,24,20,.32); color:var(--ink); }
.devo-solid{ background:var(--ink); border:1px solid var(--ink); color:var(--paper); }
.devo-solid:hover{ background:#000; }
.devo-ghost:disabled,.devo-solid:disabled{ opacity:.5; cursor:default; }
/* The one button that is about the work rather than the piece: it carries the
   flag tint so it reads as "here is what is left", and it is absent when the
   piece is clean. */
.devo-flagjump{ border-color:rgba(200,138,62,.45); color:#8A5A22; font-variant-numeric:tabular-nums; }
.devo-flagjump:hover{ border-color:var(--gold); color:var(--gold); background:rgba(200,138,62,.08); }

.devo-notice{
  max-width:42rem; margin:1rem auto 0; padding:.7rem 1rem; border-radius:8px;
  background:rgba(200,138,62,.12); border:1px solid rgba(200,138,62,.3);
  font-family:var(--font-sans),sans-serif; font-size:.85rem; color:var(--ink-soft);
}
.devo-inline{ margin-left:.5rem; background:none; border:none; text-decoration:underline; cursor:pointer; color:var(--ink); font:inherit; }

.devo-page{ max-width:44rem; margin:0 auto; padding:clamp(2.5rem,6vw,4.5rem) clamp(1.25rem,4vw,0) 0; }
.devo-kicker{
  font-family:var(--font-sans),sans-serif; font-size:.72rem; font-weight:600; letter-spacing:.22em;
  text-transform:uppercase; color:var(--gold); display:flex; align-items:center; gap:.75rem;
}
.devo-done{ display:inline-flex; align-items:center; gap:.25rem; color:var(--ink-faint); }
.devo-title{
  width:100%; margin:.9rem 0 .2rem; padding:0; border:none; background:transparent; outline:none;
  font-family:var(--font-display),var(--font-serif),Georgia,serif; font-weight:300;
  font-size:clamp(2rem,4.4vw,2.9rem); line-height:1.12; letter-spacing:-.01em; color:var(--ink);
}
.devo-title:focus{ background:rgba(200,138,62,.08); border-radius:4px; }
.devo-title-en{ margin:0 0 2.5rem; font-style:italic; font-size:1rem; color:var(--ink-faint); }

.devo-body{ display:flex; flex-direction:column; }
.devo-para{ position:relative; display:flex; gap:.75rem; padding:.15rem 0; border-radius:6px; transition:background .2s ease; }
.devo-para.is-active{ background:rgba(200,138,62,.055); }
.devo-mark{ flex:0 0 14px; padding-top:1.15rem; }
.dot{ display:block; width:7px; height:7px; border-radius:50%; background:var(--kerti); box-shadow:0 0 0 3px rgba(233,168,96,.18); }
.dot-term{ background:#6FA5D8; box-shadow:0 0 0 3px rgba(111,165,216,.18); }
.devo-para-body{ flex:1; min-width:0; }

.devo-prose-input{
  display:block; width:100%; border:none; outline:none; resize:none; overflow:hidden;
  background:transparent; color:var(--ink); padding:.55rem .5rem;
  font-family:var(--font-serif),Georgia,serif; font-size:1.19rem; line-height:1.78; letter-spacing:.002em;
  border-radius:5px; transition:background .15s ease;
}
.devo-prose-input:hover{ background:rgba(27,24,20,.028); }
.devo-prose-input:focus{ background:#fff; box-shadow:0 0 0 1px rgba(200,138,62,.35); }

.devo-en{
  margin:.15rem .5rem .6rem; padding:.6rem .9rem; border-left:2px solid rgba(200,138,62,.4);
  background:rgba(27,24,20,.03); border-radius:0 5px 5px 0;
  font-size:.98rem; line-height:1.65; color:var(--ink-faint); font-style:italic;
}

.devo-tools{ display:flex; align-items:center; gap:.35rem; padding:.1rem .5rem .5rem; flex-wrap:wrap; }
.devo-flag{
  font-family:var(--font-sans),sans-serif; font-size:.66rem; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; padding:.14rem .42rem; border-radius:4px;
  background:rgba(233,168,96,.2); color:#8A5A22;
}
.devo-flag.is-term{ background:rgba(111,165,216,.18); color:#2E5B85; }
.devo-tool{
  display:inline-flex; align-items:center; gap:.28rem; background:transparent;
  border:1px solid rgba(27,24,20,.14); border-radius:5px; cursor:pointer;
  font-family:var(--font-sans),sans-serif; font-size:.72rem; font-weight:500; color:var(--ink-soft);
  padding:.24rem .5rem; transition:all .15s ease;
}
.devo-tool:hover{ border-color:rgba(27,24,20,.3); color:var(--ink); }
.devo-tool.is-go{ background:var(--ink); border-color:var(--ink); color:var(--paper); }
.devo-tool.is-on{ border-color:var(--gold); color:var(--gold); }
.devo-tool:disabled{ opacity:.5; cursor:default; }

.devo-instr{
  width:calc(100% - 1rem); margin:0 .5rem .6rem; padding:.5rem .7rem;
  border:1px solid rgba(27,24,20,.18); border-radius:6px; background:#fff; outline:none;
  font-family:var(--font-sans),sans-serif; font-size:.85rem; color:var(--ink);
}

/* ── one card, three registers, and the edits as chips ─────────────────
   He thinks in sentences, so the card is rows of sentences: the paragraph as
   it is being composed on top, then one row per sentence, and inside the open
   row the same sentence in each register as CLEAN PROSE.

   Nothing here is struck through. His own words are in the field above the
   card, unstruck and readable; repeating them in red under a line is half the
   ink saying nothing. What an option would ADD gets a gull underline; what it
   drops is simply absent. ── */
/* minmax(0,1fr), not auto: a collapsed row's line does not wrap, and an auto
   grid column sizes itself to that whole unwrapped sentence — invisible on a
   laptop, and it pushes the card off the side of a phone. */
.devo-sugg{
  margin:.2rem .5rem 1rem; display:grid; grid-template-columns:minmax(0,1fr);
  gap:.45rem; padding:.62rem .8rem; border-radius:8px;
  background:var(--paper-warm); border:1px solid rgba(200,138,62,.28);
}
.devo-sugg-note{ margin:0; font-family:var(--font-sans),sans-serif; font-size:.8rem; color:var(--ink-faint); }
.devo-sugg-top{ display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; }

.devo-rows{ display:grid; grid-template-columns:minmax(0,1fr); }
.devo-row{ min-width:0; border-top:1px solid rgba(27,24,20,.09); }
.devo-row-head{
  display:flex; align-items:baseline; gap:.45rem; width:100%; text-align:left; cursor:pointer;
  background:none; border:none; padding:.24rem .1rem; min-width:0; color:var(--ink-soft);
  font-family:var(--font-serif),Georgia,serif; font-size:.92rem; line-height:1.4;
}
.devo-row-tag{
  flex:none; font-family:var(--font-sans),sans-serif; font-size:.58rem; font-weight:600;
  letter-spacing:.1em; text-transform:uppercase; color:#8A5A22;
}
.devo-row-head:hover{ color:var(--ink); }
.devo-row.is-open > .devo-row-head{ color:var(--ink); }
.devo-row-n{
  flex:none; font-family:var(--font-sans),sans-serif; font-size:.62rem; font-weight:600;
  letter-spacing:.08em; color:var(--ink-faint); font-variant-numeric:tabular-nums;
}
/* A collapsed row loses its TAIL, never its middle: the opening words are what
   he recognises the sentence by. */
.devo-row-line{ flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.devo-row-dot{ flex:none; width:6px; height:6px; border-radius:50%; background:var(--kerti); }

.devo-opts{ display:grid; grid-template-columns:minmax(0,1fr); gap:.26rem; padding:.05rem 0 .45rem .95rem; }
.devo-opt{
  display:block; width:100%; text-align:left; cursor:pointer; border-radius:7px;
  background:var(--paper); border:1px solid rgba(27,24,20,.12); padding:.3rem .5rem;
  font-family:var(--font-serif),Georgia,serif; font-size:.95rem; line-height:1.5; color:var(--ink);
  transition:border-color .15s ease, box-shadow .15s ease;
}
.devo-opt:hover{ border-color:var(--gold); box-shadow:0 1px 3px rgba(27,24,20,.1); }
.devo-opt.is-on{ border-color:rgba(200,138,62,.55); background:rgba(200,138,62,.1); }
/* The register's name rides IN the first line, not above it: a label on its own
   line costs a row of height per option and says no more. */
.devo-opt-tag{
  font-family:var(--font-sans),sans-serif; font-size:.58rem; font-weight:600;
  letter-spacing:.12em; text-transform:uppercase; color:var(--ink-faint); margin-right:.45rem;
}
.devo-opt.is-on .devo-opt-tag{ color:#8A5A22; }
/* The only mark on an option: what it brings that the line does not have. */
.devo-new{
  text-decoration:underline; text-decoration-color:rgba(200,138,62,.8);
  text-decoration-thickness:2px; text-underline-offset:3px;
}
.devo-same{ margin:.05rem 0 0; font-family:var(--font-sans),sans-serif; font-size:.72rem; color:var(--ink-faint); }

.devo-take{
  display:flex; align-items:center; gap:.35rem; flex-wrap:wrap;
  border-top:1px solid rgba(27,24,20,.09); padding-top:.42rem;
}
.devo-take-label{
  font-family:var(--font-sans),sans-serif; font-size:.68rem; font-weight:600;
  letter-spacing:.1em; text-transform:uppercase; color:var(--ink-faint);
}

.devo-chips{ display:flex; flex-wrap:wrap; gap:.35rem; }
.devo-chip{
  display:inline-flex; align-items:center; gap:.3rem; max-width:100%; text-align:left;
  background:var(--paper); border:1px solid rgba(27,24,20,.16); border-radius:6px; cursor:pointer;
  padding:.28rem .5rem; transition:all .15s ease;
  font-family:var(--font-sans),sans-serif; font-size:.76rem; color:var(--ink-soft);
}
.devo-chip:hover{ border-color:var(--gold); box-shadow:0 1px 3px rgba(27,24,20,.1); color:var(--ink); }
/* A chip only exists for edits of three words or fewer, so nothing here is
   truncated and the old word needs no strikethrough to be understood: the
   arrow already says which way it goes. */
.devo-chip-old{ opacity:.7; }
.devo-chip-new{
  color:var(--ink); text-decoration:underline; text-decoration-color:rgba(200,138,62,.8);
  text-decoration-thickness:2px; text-underline-offset:2px;
}
.devo-chip-arrow{ opacity:.45; }
.devo-chip-gone{ font-size:.64rem; letter-spacing:.08em; text-transform:uppercase; opacity:.6; }
.devo-chip.is-taken{ cursor:default; background:transparent; border-color:rgba(200,138,62,.45); color:var(--gold); opacity:.8; }
.devo-chip.is-taken:hover{ box-shadow:none; border-color:rgba(200,138,62,.45); color:var(--gold); }
.devo-chip.is-taken .devo-chip-new{ color:var(--gold); text-decoration-color:rgba(200,138,62,.5); }

.devo-foot{ margin-top:3rem; padding-top:1.5rem; border-top:1px solid rgba(27,24,20,.12); }
.devo-note{
  width:100%; padding:.55rem .7rem; border:1px solid rgba(27,24,20,.16); border-radius:6px;
  background:transparent; outline:none; font-family:var(--font-sans),sans-serif; font-size:.85rem; color:var(--ink);
}
.devo-foot-links{ display:flex; gap:1.25rem; align-items:center; margin-top:.9rem; flex-wrap:wrap;
  font-family:var(--font-sans),sans-serif; font-size:.78rem; color:var(--ink-faint); }
.devo-foot-links a{ display:inline-flex; align-items:center; gap:.35rem; color:var(--ink-soft); text-decoration:none; }
.devo-foot-links a:hover{ color:var(--ink); text-decoration:underline; }
.devo-hint{ margin-left:auto; opacity:.7; }
.devo-loading{ text-align:center; padding:4rem; color:var(--ink-faint); }

/* ── the phone: a reading page, and one paragraph at a time ────────────── */
.devo-read{ display:flex; flex-direction:column; gap:.15rem; }
.devo-rpara{
  display:flex; gap:.55rem; padding:.5rem .5rem; border-radius:7px; cursor:pointer;
  -webkit-tap-highlight-color:transparent; transition:background .15s ease;
}
.devo-rpara:active{ background:rgba(200,138,62,.14); }
.devo-rpara.is-open{ background:rgba(200,138,62,.16); }
/* Jumped to, not opened: the phone has no cursor, so the landing has to be
   visible or the jump feels like the page moved on its own. */
.devo-rpara.is-focus{ background:rgba(200,138,62,.09); box-shadow:inset 0 0 0 1px rgba(200,138,62,.3); }
.devo-rpara.is-changed{ box-shadow:inset 2px 0 0 var(--gold); }
.devo-rpara p{ margin:0; font-size:1.14rem; line-height:1.75; }
.devo-rmark{ flex:0 0 10px; padding-top:.62rem; }

.devo-mfoot{
  position:sticky; bottom:0; z-index:20; display:flex; align-items:center; gap:.5rem;
  margin-top:1.25rem; padding:.7rem 0 calc(.7rem + env(safe-area-inset-bottom));
  background:linear-gradient(to top,var(--paper) 74%,rgba(243,237,224,0));
}
.devo-mfoot .devo-ghost,.devo-mfoot .devo-solid{ flex:1; justify-content:center; min-height:46px; }

.devo-scrim{ position:fixed; inset:0; z-index:50; background:rgba(24,20,14,.34); animation:devo-fade .22s ease both; }
@keyframes devo-fade{ from{ opacity:0 } to{ opacity:1 } }
.devo-sheet-up{
  position:fixed; left:0; right:0; bottom:0; z-index:51;
  display:flex; flex-direction:column; gap:.6rem;
  background:var(--paper); color:var(--ink);
  border-radius:20px 20px 0 0; box-shadow:0 -20px 60px -20px rgba(30,25,15,.45);
  padding:.5rem 1rem calc(1rem + env(safe-area-inset-bottom));
  max-height:92vh; max-height:92dvh; overflow-y:auto; overscroll-behavior:contain;
  transition:transform .3s cubic-bezier(.2,0,.1,1);
  font-family:var(--font-serif),Georgia,serif;
}
/* Nothing in the sheet may be squeezed: the field is sized to its own text and
   a flex-shrink would take that height back, which is the inner scrollbar this
   is not allowed to have. The SHEET scrolls; its children keep their height. */
.devo-sheet-up > *{ flex:none; }
.devo-sheet-up[data-open="false"]{ transform:translateY(110%); }
.devo-grip{ flex:none; width:38px; height:4px; border-radius:99px; background:rgba(27,24,20,.2); margin:0 auto .2rem; }
.devo-sheet-head{ display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; }
.devo-sheet-count{ font-family:var(--font-sans),sans-serif; font-size:.7rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); }
.devo-sheet-field{
  display:block; width:100%; resize:none; overflow:hidden; outline:none; -webkit-appearance:none;
  background:#fff; color:var(--ink); caret-color:var(--gold);
  border:1px solid rgba(27,24,20,.16); border-left:3px solid var(--gold); border-radius:11px;
  padding:.8rem .85rem; font-family:var(--font-serif),Georgia,serif; font-size:1.06rem; line-height:1.7;
}
.devo-sheet-field:focus{ border-color:var(--gold); }
.devo-sheet-acts{ display:flex; gap:.4rem; flex-wrap:wrap; }
.devo-sheet-save{
  width:100%; min-height:48px; border-radius:11px; cursor:pointer;
  background:var(--ink); border:1px solid var(--ink); color:var(--paper);
  font-family:var(--font-sans),sans-serif; font-size:.95rem; font-weight:600;
}
.devo-sheet-save:disabled{ opacity:.55; cursor:default; }
/* Everything you tap in the sheet is a thumb target. */
.devo-sheet-up .devo-tool{ min-height:44px; padding:.45rem .75rem; font-size:.82rem; }
.devo-sheet-up .devo-chip{ min-height:44px; padding:.45rem .6rem; font-size:.82rem; }
.devo-sheet-up .devo-row-head{ min-height:44px; align-items:center; padding:.5rem .1rem; }
.devo-sheet-up .devo-opt{ min-height:44px; padding:.5rem .6rem; }
.devo-sheet-up .devo-opts{ padding-left:.6rem; }
.devo-sheet-up .devo-sugg{ margin:0; }
.devo-sheet-up .devo-en{ margin:0; }
.devo-sheet-up .devo-instr{ width:100%; margin:0; min-height:44px; }
.devo-sheet-up .devo-notice{ margin:0; }

@media (max-width:768px){
  .devo-sheet{ margin:-1rem; padding:0 0 1rem; }
  .devo-bar{ padding:.6rem .85rem; gap:.4rem; }
  .devo-page{ padding:1.5rem 1rem 0; }
  .devo-title{ font-size:1.85rem; margin-top:.7rem; }
  .devo-title-en{ margin-bottom:1.6rem; }
  .devo-foot{ margin-top:2rem; }
}
`;
