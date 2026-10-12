/**
 * generate_diagrams.js
 * Generates both native .drawio XML files and ultra high-res 2x DPI PNG renderings
 * for Figs 4.2 - 4.5.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('/tmp/node_modules/puppeteer-core');

const OUT_DIR = '/home/amaan/Desktop/solar-flare-ml/figures';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// ==========================================
// 1. DRAW.IO XML GENERATORS
// ==========================================

function createDrawioFile(name, contentXml) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-10-12T15:40:00.000Z" agent="Mozilla/5.0" version="24.0.0" type="device">
  <diagram id="${name}" name="${name}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="950" background="#ffffff" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${contentXml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  const filePath = path.join(OUT_DIR, `${name}.drawio`);
  fs.writeFileSync(filePath, xml, 'utf8');
  console.log(`Saved draw.io XML: ${filePath}`);
}

// --- FIG 4.2: DFD LEVEL 0 (CONTEXT DIAGRAM) XML ---
const dfd0Xml = `
        <!-- External Entity: NASA SDO / Stanford JSOC -->
        <mxCell id="ent_jsoc" value="&lt;b&gt;NASA SDO / Stanford JSOC&lt;/b&gt;&lt;br&gt;(Solar Dynamics Observatory Telemetry)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;strokeWidth=2;fontSize=13;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="60" y="160" width="240" height="90" as="geometry" />
        </mxCell>

        <!-- External Entity: NOAA GOES / HEK & SWPC -->
        <mxCell id="ent_noaa" value="&lt;b&gt;NOAA GOES / HEK &amp;amp; SWPC&lt;/b&gt;&lt;br&gt;(Flare Catalog &amp;amp; Live X-Ray Flux)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;strokeWidth=2;fontSize=13;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="60" y="440" width="240" height="90" as="geometry" />
        </mxCell>

        <!-- Process 0.0: Solar Flare Forecasting System -->
        <mxCell id="proc_main" value="&lt;b&gt;0.0&lt;/b&gt;&lt;br&gt;&lt;b&gt;Solar Flare Operational&lt;br&gt;Forecasting System&lt;/b&gt;&lt;br&gt;(Multi-Source ML Pipeline)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=3;fontSize=14;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="470" y="270" width="260" height="160" as="geometry" />
        </mxCell>

        <!-- External Entity: Space Weather Forecaster -->
        <mxCell id="ent_user" value="&lt;b&gt;Space Weather Forecaster / Researcher&lt;/b&gt;&lt;br&gt;(Operational Analyst)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;strokeWidth=2;fontSize=13;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="910" y="160" width="260" height="90" as="geometry" />
        </mxCell>

        <!-- External Entity: Web Dashboard Client -->
        <mxCell id="ent_client" value="&lt;b&gt;Public Web Dashboard Client&lt;/b&gt;&lt;br&gt;(Render Cloud / HelioForecast.AI)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;strokeWidth=2;fontSize=13;fontFamily=Helvetica;" vertex="1" parent="1">
          <mxGeometry x="910" y="440" width="260" height="90" as="geometry" />
        </mxCell>

        <!-- Data Flow: JSOC to Process -->
        <mxCell id="flow_1" value="SDO HMI SHARP Patches&lt;br&gt;(18 Magnetic Features, |LON_FWT| ≤ 70°)" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.3;entryDx=0;entryDy=0;strokeWidth=2;strokeColor=#333333;fontSize=11;" edge="1" parent="1" source="ent_jsoc" target="proc_main">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Data Flow: NOAA to Process -->
        <mxCell id="flow_2" value="GOES Flare Catalog &amp;amp;&lt;br&gt;Real-Time 1-8Å X-Ray Flux" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.7;entryDx=0;entryDy=0;strokeWidth=2;strokeColor=#333333;fontSize=11;" edge="1" parent="1" source="ent_noaa" target="proc_main">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Data Flow: User Query to Process -->
        <mxCell id="flow_3" value="Model Training / Evaluation Query&lt;br&gt;&amp;amp; Live Forecast Request" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;entryX=1;entryY=0.25;entryDx=0;entryDy=0;exitX=0;exitY=0.7;exitDx=0;exitDy=0;strokeWidth=2;strokeColor=#333333;fontSize=11;" edge="1" parent="1" source="ent_user" target="proc_main">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Data Flow: Process to User -->
        <mxCell id="flow_4" value="24h M/X Flare Probabilities,&lt;br&gt;TSS Benchmarks &amp;amp; AR Alerts" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;entryX=0.2;entryY=1;entryDx=0;entryDy=0;exitX=0.9;exitY=0.15;exitDx=0;exitDy=0;strokeWidth=2;strokeColor=#27ae60;fontSize=11;" edge="1" parent="1" source="proc_main" target="ent_user">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Data Flow: Process to Client -->
        <mxCell id="flow_5" value="Real-Time Risk Cards, Sunspot Gauges,&lt;br&gt;GOES Flux Badges &amp;amp; Simulator API" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;exitX=1;entryDy=0;strokeWidth=2;strokeColor=#2980b9;fontSize=11;" edge="1" parent="1" source="proc_main" target="ent_client">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
`;

createDrawioFile('fig_4_2_dfd_level_0', dfd0Xml);

// --- FIG 4.3: DFD LEVEL 1 XML ---
const dfd1Xml = `
        <!-- External Entities -->
        <mxCell id="e_jsoc" value="&lt;b&gt;NASA SDO / Stanford JSOC&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="40" y="80" width="190" height="60" as="geometry" />
        </mxCell>
        <mxCell id="e_noaa" value="&lt;b&gt;NOAA GOES / HEK &amp;amp; SWPC&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="40" y="240" width="190" height="60" as="geometry" />
        </mxCell>
        <mxCell id="e_user" value="&lt;b&gt;Space Weather Forecaster&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="1000" y="160" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="e_dash" value="&lt;b&gt;Render Live Dashboard&lt;/b&gt;" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="1000" y="480" width="200" height="60" as="geometry" />
        </mxCell>

        <!-- Processes -->
        <mxCell id="p1" value="&lt;b&gt;1.0&lt;/b&gt;&lt;br&gt;&lt;b&gt;Data Ingestion &amp;amp;&lt;br&gt;Central Disk Filter&lt;/b&gt;&lt;br&gt;(|LON_FWT| ≤ 70°)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="320" y="120" width="170" height="110" as="geometry" />
        </mxCell>

        <mxCell id="p2" value="&lt;b&gt;2.0&lt;/b&gt;&lt;br&gt;&lt;b&gt;Feature Extraction &amp;amp;&lt;br&gt;24h Flare Labelling&lt;/b&gt;&lt;br&gt;(18 SHARP Params)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="600" y="120" width="170" height="110" as="geometry" />
        </mxCell>

        <mxCell id="p3" value="&lt;b&gt;3.0&lt;/b&gt;&lt;br&gt;&lt;b&gt;Model Training &amp;amp;&lt;br&gt;TSS Benchmark&lt;/b&gt;&lt;br&gt;(LR, SVM, RF, XGB)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="600" y="360" width="170" height="110" as="geometry" />
        </mxCell>

        <mxCell id="p4" value="&lt;b&gt;4.0&lt;/b&gt;&lt;br&gt;&lt;b&gt;Live Operational&lt;br&gt;Forecaster &amp;amp; Serving&lt;/b&gt;&lt;br&gt;(NRT Stream + SWPC)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="600" y="580" width="170" height="110" as="geometry" />
        </mxCell>

        <!-- Data Stores -->
        <mxCell id="d1" value="&lt;b&gt;D1&lt;/b&gt; | Raw SHARP Telemetry" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;strokeWidth=2;fontSize=11;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="320" y="290" width="170" height="40" as="geometry" />
        </mxCell>
        <mxCell id="d2" value="&lt;b&gt;D2&lt;/b&gt; | GOES Flare Registry" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;strokeWidth=2;fontSize=11;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="320" y="350" width="170" height="40" as="geometry" />
        </mxCell>
        <mxCell id="d3" value="&lt;b&gt;D3&lt;/b&gt; | train.csv &amp;amp; test.csv" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;strokeWidth=2;fontSize=11;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="840" y="270" width="160" height="40" as="geometry" />
        </mxCell>
        <mxCell id="d4" value="&lt;b&gt;D4&lt;/b&gt; | best_model.pkl &amp;amp; results.csv" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;strokeWidth=2;fontSize=11;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="840" y="410" width="180" height="40" as="geometry" />
        </mxCell>

        <!-- Flows -->
        <mxCell id="fl1" value="hmi.sharp_cea_720s" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="e_jsoc" target="p1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl2" value="HEK Flare Events" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="e_noaa" target="p1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl3" value="Clean SHARP Patches" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="p1" target="d1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl4" value="Parsed Flares" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="p1" target="d2"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl5" value="Magnetic features + Flares" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="d1" target="p2"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl6" value="Time-split partitions" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="p2" target="d3"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl7" value="Training sets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="d3" target="p3"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl8" value="Trained weights" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="p3" target="d4"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl9" value="Load Model Pipeline" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;" edge="1" parent="1" source="d4" target="p4"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl10" value="NRT Telemetry Stream" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;exitX=0.2;exitY=1;exitDx=0;exitDy=0;" edge="1" parent="1" source="e_jsoc" target="p4"><mxGeometry relative="1" as="geometry"><Array points="40,630"/></Array></mxGeometry></mxCell>
        <mxCell id="fl11" value="Live Primary X-Ray" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#333;fontSize=10;exitX=0.2;exitY=1;exitDx=0;exitDy=0;" edge="1" parent="1" source="e_noaa" target="p4"><mxGeometry relative="1" as="geometry"><Array points="100,660"/></Array></mxGeometry></mxCell>
        <mxCell id="fl12" value="TSS / Metrics / Top Features" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#27ae60;fontSize=10;" edge="1" parent="1" source="p3" target="e_user"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl13" value="Live AR Probabilities &amp; Alerts" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#27ae60;fontSize=10;" edge="1" parent="1" source="p4" target="e_user"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="fl14" value="Real-time Web Feed &amp; Metrics" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#2980b9;fontSize=10;" edge="1" parent="1" source="p4" target="e_dash"><mxGeometry relative="1" as="geometry"/></mxCell>
`;

createDrawioFile('fig_4_3_dfd_level_1', dfd1Xml);

// --- FIG 4.4: USE CASE DIAGRAM XML ---
const ucXml = `
        <!-- System Boundary -->
        <mxCell id="sys_box" value="Solar Flare Operational Forecasting Platform" style="shape=rectangle;fillColor=none;strokeColor=#666666;strokeWidth=2;dashed=1;verticalAlign=top;fontStyle=1;fontSize=15;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="280" y="50" width="680" height="730" as="geometry" />
        </mxCell>

        <!-- Actors -->
        <mxCell id="act_forecaster" value="Space Weather&lt;br&gt;Forecaster" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="80" y="240" width="50" height="100" as="geometry" />
        </mxCell>
        <mxCell id="act_mle" value="ML Engineer /&lt;br&gt;Data Scientist" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="80" y="540" width="50" height="100" as="geometry" />
        </mxCell>
        <mxCell id="act_jsoc" value="NASA SDO /&lt;br&gt;JSOC System" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="1080" y="160" width="50" height="100" as="geometry" />
        </mxCell>
        <mxCell id="act_noaa" value="NOAA SWPC /&lt;br&gt;HEK System" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="1080" y="420" width="50" height="100" as="geometry" />
        </mxCell>
        <mxCell id="act_render" value="Render Cloud&lt;br&gt;Platform" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="1080" y="620" width="50" height="100" as="geometry" />
        </mxCell>

        <!-- Use Cases -->
        <mxCell id="uc_live" value="Run Live Operational&lt;br&gt;Forecast (24h Window)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="110" width="190" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_mon" value="Monitor Real-Time Active&lt;br&gt;Regions &amp;amp; X-Ray Flux" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="210" width="190" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_sim" value="Simulate Flare Risk via&lt;br&gt;Magnetic Field Sliders" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="310" width="190" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_train" value="Train &amp;amp; Benchmark Models&lt;br&gt;(TSS, HSS, Recall)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="440" width="190" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_data" value="Ingest &amp;amp; Clean SHARP&lt;br&gt;&amp;amp; HEK Flare Datasets" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="560" width="190" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_deploy" value="Deploy Live Model&lt;br&gt;&amp;amp; REST API Service" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="670" width="190" height="65" as="geometry" />
        </mxCell>

        <!-- Included Use Cases -->
        <mxCell id="uc_inc1" value="Stream NRT Data&lt;br&gt;from JSOC DRMS" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="680" y="110" width="170" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_inc2" value="Filter Central Disk&lt;br&gt;(|LON_FWT| ≤ 70°)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="680" y="210" width="170" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_inc3" value="Handle Class Imbalance&lt;br&gt;(1:37 Severe Skew)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="680" y="440" width="170" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_inc4" value="Evaluate TSS Score&lt;br&gt;&amp;amp; Feature Weights" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="680" y="540" width="170" height="60" as="geometry" />
        </mxCell>

        <!-- Associations -->
        <mxCell id="a1" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="act_forecaster" target="uc_live"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a2" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="act_forecaster" target="uc_mon"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a3" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="act_forecaster" target="uc_sim"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a4" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="act_mle" target="uc_train"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a5" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="act_mle" target="uc_data"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a6" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="act_mle" target="uc_deploy"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a7" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="uc_inc1" target="act_jsoc"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a8" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="uc_data" target="act_noaa"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="a9" style="strokeWidth=1.5;strokeColor=#333;endArrow=none;" edge="1" parent="1" source="uc_deploy" target="act_render"><mxGeometry relative="1" as="geometry"/></mxCell>

        <!-- Includes -->
        <mxCell id="inc1" value="&amp;laquo;include&amp;raquo;" style="edgeStyle=orthogonalEdgeStyle;dashed=1;strokeWidth=1.5;strokeColor=#b85450;fontSize=10;" edge="1" parent="1" source="uc_live" target="uc_inc1"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="inc2" value="&amp;laquo;include&amp;raquo;" style="edgeStyle=orthogonalEdgeStyle;dashed=1;strokeWidth=1.5;strokeColor=#b85450;fontSize=10;" edge="1" parent="1" source="uc_live" target="uc_inc2"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="inc3" value="&amp;laquo;include&amp;raquo;" style="edgeStyle=orthogonalEdgeStyle;dashed=1;strokeWidth=1.5;strokeColor=#b85450;fontSize=10;" edge="1" parent="1" source="uc_train" target="uc_inc3"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="inc4" value="&amp;laquo;include&amp;raquo;" style="edgeStyle=orthogonalEdgeStyle;dashed=1;strokeWidth=1.5;strokeColor=#b85450;fontSize=10;" edge="1" parent="1" source="uc_train" target="uc_inc4"><mxGeometry relative="1" as="geometry"/></mxCell>
`;

createDrawioFile('fig_4_4_use_case', ucXml);

// --- FIG 4.5: SEQUENCE DIAGRAM XML ---
const seqXml = `
        <!-- Lifelines -->
        <mxCell id="ll_user" value="Forecaster" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=13;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="50" y="50" width="120" height="720" as="geometry" />
        </mxCell>
        <mxCell id="ll_cli" value="Dashboard / CLI" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=13;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="230" y="50" width="140" height="720" as="geometry" />
        </mxCell>
        <mxCell id="ll_srv" value="Server Controller" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=13;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="430" y="50" width="140" height="720" as="geometry" />
        </mxCell>
        <mxCell id="ll_jsoc" value="JSOC DRMS API" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=13;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="640" y="50" width="140" height="720" as="geometry" />
        </mxCell>
        <mxCell id="ll_swpc" value="NOAA SWPC API" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=13;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="840" y="50" width="140" height="720" as="geometry" />
        </mxCell>
        <mxCell id="ll_ml" value="ML Model Pipeline" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=13;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="1050" y="50" width="140" height="720" as="geometry" />
        </mxCell>

        <!-- Messages -->
        <mxCell id="m1" value="1. Request Live Forecast (live / dashboard)" style="edgeStyle=none;html=1;strokeWidth=2;strokeColor=#2980b9;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="110" y="140" as="sourcePoint"/><mxPoint x="300" y="140" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m2" value="2. Dispatch Live Query (GET /api/forecast)" style="edgeStyle=none;html=1;strokeWidth=2;strokeColor=#2980b9;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="300" y="180" as="sourcePoint"/><mxPoint x="500" y="180" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m3" value="3. Query NRT SHARP series (past 36h)" style="edgeStyle=none;html=1;strokeWidth=2;strokeColor=#333;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="500" y="230" as="sourcePoint"/><mxPoint x="710" y="230" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m4" value="4. Return 18 magnetic features (AR 14551, 14549, 14548)" style="edgeStyle=none;html=1;strokeWidth=2;dashed=1;strokeColor=#333;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="710" y="280" as="sourcePoint"/><mxPoint x="500" y="280" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m5" value="5. Filter central disk (|LON_FWT| ≤ 70°) &amp;amp; deduplicate AR" style="edgeStyle=none;html=1;strokeWidth=2;strokeColor=#27ae60;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="500" y="320" as="sourcePoint"/><mxPoint x="500" y="350" as="targetPoint"/><Array points="540,320"/><Array points="540,350"/></Array></mxGeometry>
        </mxCell>
        <mxCell id="m6" value="6. HTTP GET primary 1-day X-ray flux JSON" style="edgeStyle=none;html=1;strokeWidth=2;strokeColor=#333;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="500" y="390" as="sourcePoint"/><mxPoint x="910" y="390" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m7" value="7. Return current flux reading (e.g. B6.6 / C1.4)" style="edgeStyle=none;html=1;strokeWidth=2;dashed=1;strokeColor=#333;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="910" y="440" as="sourcePoint"/><mxPoint x="500" y="440" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m8" value="8. Load best_model.pkl &amp;amp; predict_proba(X)" style="edgeStyle=none;html=1;strokeWidth=2;strokeColor=#d35400;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="500" y="490" as="sourcePoint"/><mxPoint x="1120" y="490" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m9" value="9. Return calibrated probabilities (e.g. 0.844, 0.805)" style="edgeStyle=none;html=1;strokeWidth=2;dashed=1;strokeColor=#d35400;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="1120" y="540" as="sourcePoint"/><mxPoint x="500" y="540" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m10" value="10. Rank hazard levels (P ≥ 0.5 → Alert: High Risk AR 14549)" style="edgeStyle=none;html=1;strokeWidth=2;strokeColor=#c0392b;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="500" y="580" as="sourcePoint"/><mxPoint x="500" y="610" as="targetPoint"/><Array points="540,580"/><Array points="540,610"/></Array></mxGeometry>
        </mxCell>
        <mxCell id="m11" value="11. Return JSON payload (AR risks, X-ray class, drivers)" style="edgeStyle=none;html=1;strokeWidth=2;dashed=1;strokeColor=#2980b9;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="500" y="660" as="sourcePoint"/><mxPoint x="300" y="660" as="targetPoint"/></mxGeometry>
        </mxCell>
        <mxCell id="m12" value="12. Display operational risk cards, badges &amp;amp; alert feed" style="edgeStyle=none;html=1;strokeWidth=2;dashed=1;strokeColor=#2980b9;fontSize=11;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="300" y="710" as="sourcePoint"/><mxPoint x="110" y="710" as="targetPoint"/></mxGeometry>
        </mxCell>
`;

createDrawioFile('fig_4_5_sequence', seqXml);

console.log('All 4 .drawio files generated successfully!');
