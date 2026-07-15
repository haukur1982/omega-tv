# Studio campaign — on-air graphics (TriCaster)

Layer 1 of the broadcast package: live, self-updating graphics for the
"Nýtt stúdíó" campaign. All of them read the same gift database as the web
page, so the numbers update on air by themselves as gifts are entered in
`/admin/styrkir` (and later through the Rapyd gateway). Nobody remakes a
graphic.

## The four URLs

| URL | What it is | Use |
|-----|-----------|-----|
| `omega.is/studio` | The public web page | Where the QR sends viewers |
| `omega.is/studio/skjar` | **Full-screen status card** (warm-black) | Take full during an appeal, or drop in the junction rotation |
| `omega.is/studio/skjar?layout=bordi` | **Lower-third** on chroma green | Key over programs |
| `omega.is/studio/filler` | **~26s animated spot**, self-updating | Between-programs rotation |

All are 1920×1080. Run the browser **full-screen at 1080p** and they fill the
frame 1:1. They carry the QR to `omega.is/studio` and respect title-safe
margins.

> **Before any of this airs for real:** the board currently shows DEMO
> sample gifts (3.100.000 kr). Clear them first (ask Claude "clear the demo",
> or delete them in `/admin/styrkir`) so no fake total goes on air.

## Getting them into the TriCaster — NDI (recommended)

NDI is NewTek's own protocol, so a web graphic comes straight in over the
network, no capture card.

1. On a Windows PC **on the same network** as the TriCaster, install the free
   **NDI Tools** (from ndi.video).
2. Open the graphic URL in Chrome or Edge and press **F11** for full-screen
   at 1080p.
3. Run **NDI Screen Capture** and point it at that browser window/screen. It
   now broadcasts as an NDI source on the network.
4. In the TriCaster, add that **NDI source as an input**.
5. **Lower-third only:** chroma-key the green (`#00B140`) on that input, so only
   the bottom strip shows over program. The full card and the filler need no
   keying.

Then take it, key it, or put it in the DDR/playlist rotation like any source.

## Simplest alternative — HDMI in

If you'd rather not run NDI: a laptop's **HDMI out** (browser full-screen on
the page) straight into a spare TriCaster input. Dead simple, uses one
physical input and a cable. Same live behaviour.

## Native alternative — DataLink (numbers only)

If your operator prefers to design the graphic inside the TriCaster CG, the
live numbers are exposed as JSON at `omega.is/api/studio/status`:

```json
{ "raised": 3100000, "goal": 9500000, "pct": 0.326,
  "count": 15, "milestonesFunded": 1, "milestonesTotal": 6 }
```

Point DataLink at that feed and place the keys in your own title. You rebuild
the look; the numbers stay live. (The NDI route above gives you the finished
Omega graphic with no design work, which is why it's the recommendation.)

## What "live" means

Each graphic polls the status every 15–20s and eases the total up when a new
gift lands, so the number visibly moves on air. Enter a gift in
`/admin/styrkir` and within seconds it shows up on the broadcast graphic and
on the web page at the same time. That is the telethon loop: QR on screen →
viewer scans → gives → the number climbs live.

## Suggested rotation

- **Between programs:** the filler (`/studio/filler`) or the full card.
- **During an appeal or a relevant program:** the lower-third, keyed over
  picture, or take the full card.

## Layer 2 (later)

The produced 30–45s spot with Eiríkur on camera is not built yet — that needs
a short shoot and an edit. When you're ready, Claude will write the script and
build the title + end-card graphics; these same live pieces become its ending.
