/**
 * render_diagrams_png.js (Polished Version)
 * Renders publication-grade, ultra-sharp vector diagrams (Figs 4.2 - 4.5) to high-res PNG.
 * Perfect alignment, zero line crossings, clean typography.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('/tmp/node_modules/puppeteer-core');

const OUT_DIR = '/home/amaan/Desktop/solar-flare-ml/figures';

// --- FIG 4.2: DFD LEVEL 0 (CONTEXT DIAGRAM) ---
const dfd0Html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .canvas { width: 1200px; height: 750px; background: #ffffff; padding: 30px; box-sizing: border-box; }
  .title { font-size: 20px; font-weight: bold; color: #1a202c; text-align: center; margin-bottom: 25px; }
  .subtitle { font-size: 13px; color: #718096; text-align: center; margin-top: -18px; margin-bottom: 25px; }
  svg { width: 1140px; height: 630px; }
  .entity { fill: #eff6ff; stroke: #2563eb; stroke-width: 2; rx: 8; filter: drop-shadow(0 3px 6px rgba(37,99,235,0.12)); }
  .entity-title { font-size: 14px; font-weight: 700; fill: #1e3a8a; text-anchor: middle; }
  .entity-sub { font-size: 11px; fill: #475569; text-anchor: middle; }
  .process { fill: #ecfdf5; stroke: #059669; stroke-width: 3; filter: drop-shadow(0 6px 14px rgba(5,150,105,0.18)); }
  .proc-num { font-size: 16px; font-weight: 800; fill: #065f46; text-anchor: middle; }
  .proc-name { font-size: 15px; font-weight: 700; fill: #047857; text-anchor: middle; }
  .proc-sub { font-size: 11.5px; fill: #065f46; text-anchor: middle; }
  .flow-line { fill: none; stroke: #475569; stroke-width: 2; marker-end: url(#arrow); }
  .flow-text { font-size: 11px; fill: #1e293b; font-weight: 600; }
  .flow-bg { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 1; rx: 5; }
</style>
</head>
<body>
<div class="canvas">
  <div class="title">Fig. 4.2: Data Flow Diagram (DFD) Level 0 — Context Diagram</div>
  <div class="subtitle">Solar Flare Operational Forecasting &amp; Real-Time Space Weather Pipeline</div>
  <svg viewBox="0 0 1140 630">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
      </marker>
      <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
      </marker>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
      </marker>
    </defs>

    <!-- ENTITY 1: NASA SDO / Stanford JSOC -->
    <rect x="40" y="80" width="250" height="90" class="entity" />
    <text x="165" y="115" class="entity-title">NASA SDO / Stanford JSOC</text>
    <text x="165" y="135" class="entity-sub">HMI Active Region Telemetry Stream</text>
    <text x="165" y="152" class="entity-sub">(hmi.sharp_cea_720s &amp; NRT Pipeline)</text>

    <!-- ENTITY 2: NOAA GOES / HEK & SWPC -->
    <rect x="40" y="440" width="250" height="90" class="entity" />
    <text x="165" y="475" class="entity-title">NOAA GOES / HEK &amp; SWPC</text>
    <text x="165" y="495" class="entity-sub">Solar Flare Catalogue &amp; Real-Time Flux</text>
    <text x="165" y="512" class="entity-sub">(GOES 0.1–0.8nm Primary X-Ray Monitor)</text>

    <!-- CENTRAL PROCESS 0.0 -->
    <ellipse cx="570" cy="315" rx="150" ry="95" class="process" />
    <text x="570" y="285" class="proc-num">0.0</text>
    <text x="570" y="310" class="proc-name">Solar Flare Operational</text>
    <text x="570" y="332" class="proc-name">Forecasting ML Pipeline</text>
    <text x="570" y="358" class="proc-sub">(Balanced ML, SHARP Physical Models &amp; Inference)</text>

    <!-- ENTITY 3: Space Weather Analyst / Forecaster -->
    <rect x="850" y="80" width="250" height="90" class="entity" />
    <text x="975" y="115" class="entity-title">Space Weather Forecaster</text>
    <text x="975" y="135" class="entity-sub">Operational Space Weather Analyst</text>
    <text x="975" y="152" class="entity-sub">(Terminal CLI / Model Verification)</text>

    <!-- ENTITY 4: Live Web Dashboard / Consumer -->
    <rect x="850" y="440" width="250" height="90" class="entity" />
    <text x="975" y="475" class="entity-title">Public Web Dashboard</text>
    <text x="975" y="495" class="entity-sub">HelioForecast.AI (Render Cloud)</text>
    <text x="975" y="512" class="entity-sub">(solar-flare-tr3z.onrender.com)</text>

    <!-- FLOW 1: JSOC -> System -->
    <path d="M 290 125 L 430 125 L 485 240" class="flow-line" />
    <rect x="270" y="140" width="200" height="42" class="flow-bg" />
    <text x="280" y="157" class="flow-text">18 Magnetic SHARP Parameters</text>
    <text x="280" y="173" class="flow-text">(USFLUX, R_VALUE, TOTPOT, etc.)</text>

    <!-- FLOW 2: NOAA -> System -->
    <path d="M 290 485 L 430 485 L 485 390" class="flow-line" />
    <rect x="270" y="425" width="200" height="42" class="flow-bg" />
    <text x="280" y="442" class="flow-text">HEK M/X Flare Catalogues &amp;</text>
    <text x="280" y="458" class="flow-text">Live 1-min GOES X-ray Readings</text>

    <!-- FLOW 3: Forecaster -> System (Request) -->
    <path d="M 850 140 L 730 140 L 675 235" class="flow-line" />
    <rect x="690" y="110" width="190" height="42" class="flow-bg" />
    <text x="700" y="127" class="flow-text">Forecast Execution Request &amp;</text>
    <text x="700" y="143" class="flow-text">Model Benchmark Queries</text>

    <!-- FLOW 4: System -> Forecaster (Forecast Output) -->
    <path d="M 700 280 L 800 240 L 890 175" class="flow-line" style="stroke: #059669; marker-end: url(#arrow-green);" />
    <rect x="710" y="240" width="210" height="42" class="flow-bg" style="stroke:#059669;" />
    <text x="720" y="257" class="flow-text" style="fill:#047857;">24h Major Flare Probabilities,</text>
    <text x="720" y="273" class="flow-text" style="fill:#047857;">TSS 0.650 Metrics &amp; AR Alerts</text>

    <!-- FLOW 5: System -> Web Dashboard -->
    <path d="M 690 380 L 770 485 L 850 485" class="flow-line" style="stroke: #2563eb; marker-end: url(#arrow-blue);" />
    <rect x="655" y="460" width="195" height="42" class="flow-bg" style="stroke:#2563eb;" />
    <text x="665" y="477" class="flow-text" style="fill:#1d4ed8;">Live Forecast API Payload,</text>
    <text x="665" y="493" class="flow-text" style="fill:#1d4ed8;">AR Risk Badges &amp; X-Ray Feed</text>
  </svg>
</div>
</body>
</html>
`;

// --- FIG 4.3: DFD LEVEL 1 (DECOMPOSITION) ---
const dfd1Html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .canvas { width: 1320px; height: 860px; background: #ffffff; padding: 25px; box-sizing: border-box; }
  .title { font-size: 20px; font-weight: bold; color: #1a202c; text-align: center; margin-bottom: 20px; }
  .subtitle { font-size: 13px; color: #718096; text-align: center; margin-top: -15px; margin-bottom: 20px; }
  svg { width: 1270px; height: 760px; }
  .entity { fill: #eff6ff; stroke: #2563eb; stroke-width: 2; rx: 6; }
  .entity-title { font-size: 13px; font-weight: 700; fill: #1e3a8a; text-anchor: middle; }
  .entity-sub { font-size: 10.5px; fill: #475569; text-anchor: middle; }
  .process { fill: #f0fdf4; stroke: #16a34a; stroke-width: 2; rx: 16; }
  .proc-num { font-size: 13px; font-weight: 800; fill: #15803d; text-anchor: middle; }
  .proc-name { font-size: 12.5px; font-weight: 700; fill: #166534; text-anchor: middle; }
  .proc-sub { font-size: 10px; fill: #15803d; text-anchor: middle; }
  .store { fill: #fefce8; stroke: #ca8a04; stroke-width: 1.5; }
  .store-id { font-size: 12px; font-weight: 800; fill: #854d0e; text-anchor: middle; }
  .store-title { font-size: 11px; font-weight: 700; fill: #854d0e; }
  .flow-line { fill: none; stroke: #64748b; stroke-width: 1.8; marker-end: url(#arrow); }
  .flow-text { font-size: 10px; fill: #1e293b; font-weight: 600; }
  .flow-box { fill: #ffffff; stroke: #cbd5e1; stroke-width: 0.8; rx: 3; }
</style>
</head>
<body>
<div class="canvas">
  <div class="title">Fig. 4.3: Data Flow Diagram (DFD) Level 1 — Pipeline Decomposition</div>
  <div class="subtitle">Detailed Sub-processes, Internal Data Stores &amp; Inter-component Data Flows</div>
  <svg viewBox="0 0 1270 760">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
      </marker>
      <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#16a34a" />
      </marker>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
      </marker>
    </defs>

    <!-- EXTERNAL ENTITIES (LEFT) -->
    <rect x="30" y="60" width="180" height="70" class="entity" />
    <text x="120" y="90" class="entity-title">NASA SDO / JSOC</text>
    <text x="120" y="108" class="entity-sub">Stanford DRMS Client</text>

    <rect x="30" y="240" width="180" height="70" class="entity" />
    <text x="120" y="270" class="entity-title">NOAA GOES / HEK</text>
    <text x="120" y="288" class="entity-sub">SunPy Flare Catalogue</text>

    <rect x="30" y="580" width="180" height="70" class="entity" />
    <text x="120" y="610" class="entity-title">NOAA SWPC Stream</text>
    <text x="120" y="628" class="entity-sub">Primary Real-Time X-Ray</text>

    <!-- PROCESS 1.0 -->
    <rect x="290" y="110" width="180" height="100" class="process" />
    <text x="380" y="135" class="proc-num">1.0</text>
    <text x="380" y="155" class="proc-name">Data Ingestion &amp;</text>
    <text x="380" y="172" class="proc-name">Central Disk Filter</text>
    <text x="380" y="193" class="proc-sub">|LON_FWT| ≤ 70°</text>

    <!-- DATA STORES (CENTER-LEFT) -->
    <g transform="translate(280, 270)">
      <rect x="0" y="0" width="200" height="38" class="store" />
      <line x1="38" y1="0" x2="38" y2="38" stroke="#ca8a04" stroke-width="1.5" />
      <text x="19" y="24" class="store-id">D1</text>
      <text x="48" y="24" class="store-title">Raw SHARP Magnetograms</text>
    </g>
    <g transform="translate(280, 340)">
      <rect x="0" y="0" width="200" height="38" class="store" />
      <line x1="38" y1="0" x2="38" y2="38" stroke="#ca8a04" stroke-width="1.5" />
      <text x="19" y="24" class="store-id">D2</text>
      <text x="48" y="24" class="store-title">HEK GOES Flare Catalogue</text>
    </g>

    <!-- PROCESS 2.0 -->
    <rect x="580" y="110" width="190" height="100" class="process" />
    <text x="675" y="135" class="proc-num">2.0</text>
    <text x="675" y="155" class="proc-name">Feature Extraction &amp;</text>
    <text x="675" y="172" class="proc-name">24h Flare Labelling</text>
    <text x="675" y="193" class="proc-sub">18 SHARP Parameters</text>

    <!-- DATA STORE D3 -->
    <g transform="translate(850, 140)">
      <rect x="0" y="0" width="180" height="38" class="store" />
      <line x1="38" y1="0" x2="38" y2="38" stroke="#ca8a04" stroke-width="1.5" />
      <text x="19" y="24" class="store-id">D3</text>
      <text x="48" y="24" class="store-title">train.csv &amp; test.csv</text>
    </g>

    <!-- PROCESS 3.0 -->
    <rect x="850" y="270" width="180" height="110" class="process" />
    <text x="940" y="295" class="proc-num">3.0</text>
    <text x="940" y="315" class="proc-name">Model Training &amp;</text>
    <text x="940" y="332" class="proc-name">Benchmark Evaluation</text>
    <text x="940" y="353" class="proc-sub">TSS, HSS (LR, SVM, RF, XGB)</text>

    <!-- DATA STORE D4 -->
    <g transform="translate(850, 440)">
      <rect x="0" y="0" width="180" height="38" class="store" />
      <line x1="38" y1="0" x2="38" y2="38" stroke="#ca8a04" stroke-width="1.5" />
      <text x="19" y="24" class="store-id">D4</text>
      <text x="48" y="24" class="store-title">best_model.pkl / results.csv</text>
    </g>

    <!-- PROCESS 4.0 -->
    <rect x="580" y="470" width="190" height="110" class="process" />
    <text x="675" y="495" class="proc-num">4.0</text>
    <text x="675" y="515" class="proc-name">Live Operational</text>
    <text x="675" y="532" class="proc-name">Forecaster &amp; Serving</text>
    <text x="675" y="553" class="proc-sub">NRT Stream + predict_proba</text>

    <!-- EXTERNAL ENTITIES (RIGHT) -->
    <rect x="1090" y="270" width="160" height="75" class="entity" />
    <text x="1170" y="302" class="entity-title">Space Weather</text>
    <text x="1170" y="318" class="entity-title">Forecaster</text>
    <text x="1170" y="335" class="entity-sub">(Analyst / Terminal)</text>

    <rect x="1090" y="505" width="160" height="75" class="entity" />
    <text x="1170" y="537" class="entity-title">Web Dashboard</text>
    <text x="1170" y="553" class="entity-title">Client</text>
    <text x="1170" y="570" class="entity-sub">(Render Cloud Service)</text>

    <!-- FLOW LINES -->
    <!-- SDO -> 1.0 -->
    <path d="M 210 95 L 350 95 L 350 110" class="flow-line" />
    <!-- NOAA -> 1.0 -->
    <path d="M 210 260 L 330 260 L 330 210" class="flow-line" />

    <!-- 1.0 -> D1 & D2 -->
    <path d="M 360 210 L 360 270" class="flow-line" />
    <path d="M 400 210 L 400 340" class="flow-line" />

    <!-- D1 & D2 -> 2.0 -->
    <path d="M 480 290 L 520 290 L 520 160 L 580 160" class="flow-line" />
    <path d="M 480 360 L 540 360 L 540 180 L 580 180" class="flow-line" />

    <!-- 2.0 -> D3 -->
    <path d="M 770 160 L 850 160" class="flow-line" />

    <!-- D3 -> 3.0 -->
    <path d="M 940 178 L 940 270" class="flow-line" />

    <!-- 3.0 -> D4 -->
    <path d="M 940 380 L 940 440" class="flow-line" />

    <!-- D4 -> 4.0 -->
    <path d="M 850 460 L 800 460 L 800 520 L 770 520" class="flow-line" />

    <!-- NRT Streams -> 4.0 -->
    <path d="M 120 130 L 120 710 L 650 710 L 650 580" class="flow-line" />
    <rect x="230" y="695" width="200" height="22" class="flow-box" />
    <text x="240" y="710" class="flow-text">hmi.sharp_cea_720s_nrt (past 36h)</text>

    <!-- SWPC Stream -> 4.0 -->
    <path d="M 210 615 L 685 615 L 685 580" class="flow-line" />
    <rect x="360" y="605" width="160" height="22" class="flow-box" />
    <text x="370" y="620" class="flow-text">Live Primary X-Ray Flux JSON</text>

    <!-- 3.0 -> Forecaster -->
    <path d="M 1030 307 L 1090 307" class="flow-line" style="stroke:#16a34a;marker-end:url(#arrow-green);" />

    <!-- 4.0 -> Forecaster (CLI) -->
    <path d="M 720 470 L 720 415 L 1120 415 L 1120 345" class="flow-line" style="stroke:#16a34a;marker-end:url(#arrow-green);" />
    <rect x="800" y="405" width="180" height="22" class="flow-box" />
    <text x="810" y="420" class="flow-text" style="fill:#15803d;font-weight:600;">AR Forecast Table (CLI Output)</text>

    <!-- 4.0 -> Web Dashboard -->
    <path d="M 770 542 L 1090 542" class="flow-line" style="stroke:#2563eb;marker-end:url(#arrow-blue);" />
    <rect x="830" y="530" width="170" height="22" class="flow-box" />
    <text x="840" y="545" class="flow-text" style="fill:#1d4ed8;font-weight:600;">Live Forecast API Payload</text>
  </svg>
</div>
</body>
</html>
`;

// --- FIG 4.4: USE CASE DIAGRAM ---
const ucHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .canvas { width: 1200px; height: 840px; background: #ffffff; padding: 25px; box-sizing: border-box; }
  .title { font-size: 20px; font-weight: bold; color: #1a202c; text-align: center; margin-bottom: 20px; }
  .subtitle { font-size: 13px; color: #718096; text-align: center; margin-top: -15px; margin-bottom: 20px; }
  svg { width: 1150px; height: 740px; }
  .boundary { fill: #f8fafc; stroke: #94a3b8; stroke-width: 2; stroke-dasharray: 6,6; rx: 12; }
  .boundary-title { font-size: 14px; font-weight: 800; fill: #334155; text-anchor: middle; letter-spacing: 0.5px; }
  .actor-head { fill: #fed7aa; stroke: #ea580c; stroke-width: 2; }
  .actor-body { stroke: #ea580c; stroke-width: 2.5; stroke-linecap: round; }
  .actor-name { font-size: 13px; font-weight: 700; fill: #9a3412; text-anchor: middle; }
  .actor-role { font-size: 10.5px; fill: #64748b; text-anchor: middle; }
  .sys-actor { fill: #eff6ff; stroke: #2563eb; stroke-width: 2; rx: 6; }
  .sys-actor-name { font-size: 12.5px; font-weight: 700; fill: #1e3a8a; text-anchor: middle; }
  .sys-actor-sub { font-size: 10px; fill: #475569; text-anchor: middle; }
  .usecase { fill: #ecfdf5; stroke: #10b981; stroke-width: 2; filter: drop-shadow(0 2px 4px rgba(16,185,129,0.15)); }
  .uc-inc { fill: #fef2f2; stroke: #ef4444; stroke-width: 1.5; filter: drop-shadow(0 2px 4px rgba(239,68,68,0.1)); }
  .uc-text { font-size: 12px; font-weight: 600; fill: #065f46; text-anchor: middle; }
  .uc-inc-text { font-size: 11px; font-weight: 600; fill: #991b1b; text-anchor: middle; }
  .assoc { stroke: #475569; stroke-width: 1.8; fill: none; }
  .inc-arrow { stroke: #dc2626; stroke-width: 1.5; stroke-dasharray: 4,4; fill: none; marker-end: url(#arrow-red); }
  .inc-label { font-size: 10px; font-weight: 700; fill: #b91c1c; text-anchor: middle; }
</style>
</head>
<body>
<div class="canvas">
  <div class="title">Fig. 4.4: UML Use Case Diagram — Solar Flare Forecasting System</div>
  <div class="subtitle">System Actors, Operational Use Cases &amp; Functional Dependencies</div>
  <svg viewBox="0 0 1150 740">
    <defs>
      <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
      </marker>
    </defs>

    <!-- SYSTEM BOUNDARY -->
    <rect x="250" y="40" width="650" height="670" class="boundary" />
    <text x="575" y="70" class="boundary-title">SYSTEM BOUNDARY: SOLAR FLARE OPERATIONAL PLATFORM</text>

    <!-- ACTOR 1: Forecaster (Human - Left Top) -->
    <g transform="translate(100, 160)">
      <circle cx="0" cy="-30" r="14" class="actor-head" />
      <line x1="0" y1="-16" x2="0" y2="15" class="actor-body" />
      <line x1="-20" y1="-5" x2="20" y2="-5" class="actor-body" />
      <line x1="0" y1="15" x2="-16" y2="45" class="actor-body" />
      <line x1="0" y1="15" x2="16" y2="45" class="actor-body" />
      <text x="0" y="65" class="actor-name">Space Weather</text>
      <text x="0" y="80" class="actor-name">Forecaster</text>
      <text x="0" y="95" class="actor-role">(Operational User)</text>
    </g>

    <!-- ACTOR 2: ML Engineer (Human - Left Bottom) -->
    <g transform="translate(100, 480)">
      <circle cx="0" cy="-30" r="14" class="actor-head" />
      <line x1="0" y1="-16" x2="0" y2="15" class="actor-body" />
      <line x1="-20" y1="-5" x2="20" y2="-5" class="actor-body" />
      <line x1="0" y1="15" x2="-16" y2="45" class="actor-body" />
      <line x1="0" y1="15" x2="16" y2="45" class="actor-body" />
      <text x="0" y="65" class="actor-name">ML Engineer /</text>
      <text x="0" y="80" class="actor-name">Data Scientist</text>
      <text x="0" y="95" class="actor-role">(Model Developer)</text>
    </g>

    <!-- SYSTEM ACTORS (RIGHT) -->
    <rect x="940" y="100" width="170" height="60" class="sys-actor" />
    <text x="1025" y="127" class="sys-actor-name">NASA SDO / JSOC</text>
    <text x="1025" y="145" class="sys-actor-sub">(HMI Magnetogram Stream)</text>

    <rect x="940" y="320" width="170" height="60" class="sys-actor" />
    <text x="1025" y="347" class="sys-actor-name">NOAA SWPC / HEK</text>
    <text x="1025" y="365" class="sys-actor-sub">(Flare Catalogue &amp; Real-Time)</text>

    <rect x="940" y="550" width="170" height="60" class="sys-actor" />
    <text x="1025" y="577" class="sys-actor-name">Render Web Service</text>
    <text x="1025" y="595" class="sys-actor-sub">(Hosting &amp; Live Cloud API)</text>

    <!-- CORE USE CASES (COLUMN 1) -->
    <ellipse cx="410" cy="120" rx="120" ry="32" class="usecase" />
    <text x="410" y="117" class="uc-text">Run Live Operational</text>
    <text x="410" y="133" class="uc-text">Forecast (24h Window)</text>

    <ellipse cx="410" cy="210" rx="120" ry="32" class="usecase" />
    <text x="410" y="207" class="uc-text">Monitor Active Regions</text>
    <text x="410" y="223" class="uc-text">&amp; GOES X-Ray Sensor</text>

    <ellipse cx="410" cy="300" rx="120" ry="32" class="usecase" />
    <text x="410" y="297" class="uc-text">Simulate Flare Risk via</text>
    <text x="410" y="313" class="uc-text">Interactive Physics Sliders</text>

    <ellipse cx="410" cy="420" rx="120" ry="32" class="usecase" />
    <text x="410" y="417" class="uc-text">Train &amp; Benchmark Models</text>
    <text x="410" y="433" class="uc-text">(LR, SVM, RF, XGBoost)</text>

    <ellipse cx="410" cy="520" rx="120" ry="32" class="usecase" />
    <text x="410" y="517" class="uc-text">Ingest &amp; Clean Datasets</text>
    <text x="410" y="533" class="uc-text">(build train.csv / test.csv)</text>

    <ellipse cx="410" cy="620" rx="120" ry="32" class="usecase" />
    <text x="410" y="617" class="uc-text">Deploy Operational Model</text>
    <text x="410" y="633" class="uc-text">&amp; REST Web API Service</text>

    <!-- INCLUDED USE CASES (COLUMN 2) -->
    <ellipse cx="730" cy="120" rx="110" ry="30" class="uc-inc" />
    <text x="730" y="117" class="uc-inc-text">Stream Near-Real-Time</text>
    <text x="730" y="133" class="uc-inc-text">SDO SHARP Data</text>

    <ellipse cx="730" cy="210" rx="110" ry="30" class="uc-inc" />
    <text x="730" y="207" class="uc-inc-text">Filter Central Disk</text>
    <text x="730" y="223" class="uc-inc-text">(|LON_FWT| ≤ 70°)</text>

    <ellipse cx="730" cy="420" rx="110" ry="30" class="uc-inc" />
    <text x="730" y="417" class="uc-inc-text">Handle Class Imbalance</text>
    <text x="730" y="433" class="uc-inc-text">(Balanced Weighting 1:37)</text>

    <ellipse cx="730" cy="520" rx="110" ry="30" class="uc-inc" />
    <text x="730" y="517" class="uc-inc-text">Compute TSS Benchmark</text>
    <text x="730" y="533" class="uc-inc-text">&amp; Feature Ranking</text>

    <!-- ASSOCIATIONS: Forecaster -->
    <line x1="150" y1="180" x2="295" y2="130" class="assoc" />
    <line x1="150" y1="195" x2="295" y2="205" class="assoc" />
    <line x1="150" y1="210" x2="305" y2="285" class="assoc" />

    <!-- ASSOCIATIONS: MLE -->
    <line x1="150" y1="480" x2="295" y2="430" class="assoc" />
    <line x1="150" y1="500" x2="295" y2="515" class="assoc" />
    <line x1="150" y1="520" x2="305" y2="605" class="assoc" />

    <!-- ASSOCIATIONS: System Actors (Clean routing) -->
    <line x1="840" y1="120" x2="940" y2="120" class="assoc" />
    <line x1="530" y1="210" x2="940" y2="340" class="assoc" />
    <!-- Clean route around ovals for dataset ingestion to NOAA SWPC -->
    <path d="M 530 520 L 560 520 L 560 670 L 920 670 L 920 370 L 940 370" class="assoc" />
    <line x1="530" y1="620" x2="940" y2="580" class="assoc" />

    <!-- INCLUDES -->
    <path d="M 530 120 L 620 120" class="inc-arrow" />
    <text x="575" y="112" class="inc-label">&laquo;include&raquo;</text>

    <path d="M 525 135 L 635 195" class="inc-arrow" />
    <text x="590" y="160" class="inc-label">&laquo;include&raquo;</text>

    <path d="M 530 420 L 620 420" class="inc-arrow" />
    <text x="575" y="412" class="inc-label">&laquo;include&raquo;</text>

    <path d="M 525 435 L 635 505" class="inc-arrow" />
    <text x="590" y="465" class="inc-label">&laquo;include&raquo;</text>
  </svg>
</div>
</body>
</html>
`;

// --- FIG 4.5: SEQUENCE DIAGRAM ---
const seqHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .canvas { width: 1260px; height: 860px; background: #ffffff; padding: 25px; box-sizing: border-box; }
  .title { font-size: 20px; font-weight: bold; color: #1a202c; text-align: center; margin-bottom: 20px; }
  .subtitle { font-size: 13px; color: #718096; text-align: center; margin-top: -15px; margin-bottom: 20px; }
  svg { width: 1210px; height: 760px; }
  .actor-box { fill: #f8fafc; stroke: #2563eb; stroke-width: 2; rx: 6; }
  .actor-title { font-size: 13px; font-weight: 700; fill: #1e3a8a; text-anchor: middle; }
  .actor-sub { font-size: 10.5px; fill: #64748b; text-anchor: middle; }
  .lifeline { stroke: #cbd5e1; stroke-width: 1.5; stroke-dasharray: 6,6; }
  .act-bar { fill: #dbeafe; stroke: #2563eb; stroke-width: 1.5; rx: 2; }
  .msg { stroke: #334155; stroke-width: 1.7; fill: none; marker-end: url(#arrow); }
  .msg-ret { stroke: #64748b; stroke-width: 1.5; stroke-dasharray: 4,4; fill: none; marker-end: url(#arrow-gray); }
  .msg-self { stroke: #059669; stroke-width: 1.7; fill: none; marker-end: url(#arrow-green); }
  .msg-text { font-size: 11px; font-weight: 600; fill: #0f172a; }
</style>
</head>
<body>
<div class="canvas">
  <div class="title">Fig. 4.5: UML Sequence Diagram — Real-Time Operational Flare Forecasting</div>
  <div class="subtitle">Complete Execution Flow from User Request, Multi-source Telemetry Retrieval to Inference</div>
  <svg viewBox="0 0 1210 760">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155" />
      </marker>
      <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
      </marker>
      <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
      </marker>
    </defs>

    <!-- LIFELINE 1: Forecaster -->
    <g transform="translate(80, 20)">
      <rect x="-65" y="0" width="130" height="50" class="actor-box" style="stroke:#ea580c;fill:#fff7ed;" />
      <text x="0" y="24" class="actor-title" style="fill:#c2410c;">Forecaster</text>
      <text x="0" y="40" class="actor-sub">User / Analyst</text>
      <line x1="0" y1="50" x2="0" y2="720" class="lifeline" />
    </g>

    <!-- LIFELINE 2: Client UI / CLI -->
    <g transform="translate(260, 20)">
      <rect x="-70" y="0" width="140" height="50" class="actor-box" />
      <text x="0" y="24" class="actor-title">Dashboard / CLI</text>
      <text x="0" y="40" class="actor-sub">app.js / Terminal</text>
      <line x1="0" y1="50" x2="0" y2="720" class="lifeline" />
    </g>

    <!-- LIFELINE 3: Server Controller -->
    <g transform="translate(470, 20)">
      <rect x="-75" y="0" width="150" height="50" class="actor-box" style="stroke:#16a34a;fill:#f0fdf4;" />
      <text x="0" y="24" class="actor-title" style="fill:#15803d;">Server Engine</text>
      <text x="0" y="40" class="actor-sub">server.py / live()</text>
      <line x1="0" y1="50" x2="0" y2="720" class="lifeline" />
    </g>

    <!-- LIFELINE 4: JSOC DRMS API -->
    <g transform="translate(680, 20)">
      <rect x="-70" y="0" width="140" height="50" class="actor-box" style="stroke:#9333ea;fill:#faf5ff;" />
      <text x="0" y="24" class="actor-title" style="fill:#7e22ce;">JSOC DRMS API</text>
      <text x="0" y="40" class="actor-sub">SDO NRT Patches</text>
      <line x1="0" y1="50" x2="0" y2="720" class="lifeline" />
    </g>

    <!-- LIFELINE 5: NOAA SWPC API -->
    <g transform="translate(880, 20)">
      <rect x="-70" y="0" width="140" height="50" class="actor-box" style="stroke:#9333ea;fill:#faf5ff;" />
      <text x="0" y="24" class="actor-title" style="fill:#7e22ce;">NOAA SWPC API</text>
      <text x="0" y="40" class="actor-sub">Primary X-Ray Feed</text>
      <line x1="0" y1="50" x2="0" y2="720" class="lifeline" />
    </g>

    <!-- LIFELINE 6: ML Pipeline -->
    <g transform="translate(1080, 20)">
      <rect x="-70" y="0" width="140" height="50" class="actor-box" style="stroke:#ca8a04;fill:#fefce8;" />
      <text x="0" y="24" class="actor-title" style="fill:#854d0e;">ML Pipeline</text>
      <text x="0" y="40" class="actor-sub">best_model.pkl (LR)</text>
      <line x1="0" y1="50" x2="0" y2="720" class="lifeline" />
    </g>

    <!-- ACTIVATION BARS -->
    <rect x="74" y="110" width="12" height="600" class="act-bar" style="stroke:#ea580c;fill:#ffedd5;" />
    <rect x="254" y="110" width="12" height="585" class="act-bar" />
    <rect x="464" y="150" width="12" height="515" class="act-bar" style="stroke:#16a34a;fill:#dcfce7;" />
    <rect x="674" y="195" width="12" height="70" class="act-bar" style="stroke:#9333ea;fill:#f3e8ff;" />
    <rect x="874" y="345" width="12" height="65" class="act-bar" style="stroke:#9333ea;fill:#f3e8ff;" />
    <rect x="1074" y="450" width="12" height="75" class="act-bar" style="stroke:#ca8a04;fill:#fef9c3;" />

    <!-- MESSAGE 1: User -> Dashboard -->
    <path d="M 86 115 L 254 115" class="msg" />
    <text x="96" y="108" class="msg-text">1. Request Live Forecast (click 'Sync NOAA' / 'python solar_flare_ml.py live')</text>

    <!-- MESSAGE 2: Dashboard -> Server -->
    <path d="M 266 155 L 464 155" class="msg" />
    <text x="278" y="148" class="msg-text">2. HTTP GET /api/forecast (target_horizon=24h)</text>

    <!-- MESSAGE 3: Server -> JSOC -->
    <path d="M 476 195 L 674 195" class="msg" />
    <text x="486" y="188" class="msg-text">3. query(series="hmi.sharp_cea_720s_nrt", start=now - 36h)</text>

    <!-- MESSAGE 4: JSOC -> Server (Return) -->
    <path d="M 674 255 L 476 255" class="msg-ret" />
    <text x="495" y="248" class="msg-text" style="fill:#475569;">4. Tabular SHARP records (NOAA_AR, T_REC, 18 features)</text>

    <!-- MESSAGE 5: Server Self Filter -->
    <path d="M 476 285 L 530 285 L 530 315 L 476 315" class="msg-self" />
    <text x="540" y="303" class="msg-text" style="fill:#047857;">5. Filter |LON_FWT| ≤ 70° &amp; extract latest snapshot per AR</text>

    <!-- MESSAGE 6: Server -> SWPC -->
    <path d="M 476 345 L 874 345" class="msg" />
    <text x="510" y="338" class="msg-text">6. GET /json/goes/primary/xrays-1-day.json</text>

    <!-- MESSAGE 7: SWPC -> Server (Return) -->
    <path d="M 874 400 L 476 400" class="msg-ret" />
    <text x="540" y="393" class="msg-text" style="fill:#475569;">7. Real-time 0.1-0.8nm X-ray flux readings (B6.6 / C1.4)</text>

    <!-- MESSAGE 8: Server -> ML Pipeline -->
    <path d="M 476 455 L 1074 455" class="msg" style="stroke:#b45309;" />
    <text x="610" y="448" class="msg-text" style="fill:#92400e;">8. best_model.predict_proba(latest[FEATURES])</text>

    <!-- MESSAGE 9: ML Pipeline -> Server (Return) -->
    <path d="M 1074 515 L 476 515" class="msg-ret" style="stroke:#b45309;" />
    <text x="650" y="508" class="msg-text" style="fill:#92400e;">9. P(M/X flare in 24h) distribution [0.844, 0.805, 0.147...]</text>

    <!-- MESSAGE 10: Server Self Hazard Ranking -->
    <path d="M 476 545 L 530 545 L 530 575 L 476 575" class="msg-self" />
    <text x="540" y="563" class="msg-text" style="fill:#047857;">10. Hazard classification (P ≥ 0.5 → Alert: High Risk AR 14549/14551)</text>

    <!-- MESSAGE 11: Server -> Dashboard (Return) -->
    <path d="M 464 635 L 266 635" class="msg-ret" style="stroke:#2563eb;" />
    <text x="280" y="628" class="msg-text" style="fill:#1d4ed8;">11. Return JSON response (AR risk rankings, GOES class, top drivers)</text>

    <!-- MESSAGE 12: Dashboard -> Forecaster (Display) -->
    <path d="M 254 685 L 86 685" class="msg-ret" style="stroke:#ea580c;" />
    <text x="96" y="678" class="msg-text" style="fill:#c2410c;">12. Render real-time risk gauges, hazard cards &amp; SWPC alert banners</text>
  </svg>
</div>
</body>
</html>
`;

// --- PUPPETEER EXPORTER ---

const diagrams = [
  { name: 'fig_4_2_dfd_level_0', html: dfd0Html, width: 1200, height: 750 },
  { name: 'fig_4_3_dfd_level_1', html: dfd1Html, width: 1320, height: 860 },
  { name: 'fig_4_4_use_case', html: ucHtml, width: 1200, height: 840 },
  { name: 'fig_4_5_sequence', html: seqHtml, width: 1260, height: 860 }
];

(async () => {
  console.log('Rendering polished diagrams with headless Chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const d of diagrams) {
    const page = await browser.newPage();
    await page.setViewport({ width: d.width, height: d.height, deviceScaleFactor: 2 });
    await page.setContent(d.html, { waitUntil: 'load' });
    const outPng = path.join(OUT_DIR, `${d.name}.png`);
    await page.screenshot({ path: outPng, fullPage: false });
    console.log(`Rendered polished PNG (2x DPI): ${outPng}`);
    await page.close();
  }

  await browser.close();
  console.log('All polished diagrams successfully rendered!');
})();
