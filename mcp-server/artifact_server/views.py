"""MCP App HTML views — rendered verbatim in Claude's sandboxed iframe.

These HTML pages import the @modelcontextprotocol/ext-apps SDK, perform the
ui/initialize handshake, and receive tool results via ontoolresult. Claude
never rewrites this HTML — it goes straight to the iframe.
"""

from artifact_server.styles import SHADCN_STYLES

_CHART_SIZING_JS = """
    function getChartDimensions() {
      const container = document.getElementById('chart-wrap');
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(500 - container.offsetTop - 16);
      return { w: Math.max(w, 200), h: Math.max(h, 120) };
    }
"""

CHART_VIEW = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <style>""" + SHADCN_STYLES + """
    html { height: 500px; }
    body { height: 500px; overflow: hidden; display: flex; flex-direction: column; }
    .card { flex: 1; display: flex; flex-direction: column; min-height: 0; }
    #chart-wrap { flex: 1; min-height: 0; }
    #chart-wrap svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="card" style="flex:1;min-height:0;">
    <div id="title-area"></div>
    <div id="chart-wrap" style="flex:1;min-height:0;"><svg id="chart"></svg></div>
  </div>
  <script type="module">
    import { App } from "https://unpkg.com/@modelcontextprotocol/ext-apps@0.4.0/app-with-deps";
    const app = new App({ name: "Artifact Chart", version: "1.0.0" });

    """ + _CHART_SIZING_JS + """

    app.ontoolresult = ({ content }) => {
      const text = content?.find(c => c.type === 'text')?.text;
      if (!text) return;
      const config = JSON.parse(text);
      const titleArea = document.getElementById('title-area');
      if (config.title) {
        titleArea.innerHTML = '<div class="card-header"><h1 class="card-title">' + config.title + '</h1>' +
          (config.subtitle ? '<p class="card-description">' + config.subtitle + '</p>' : '') + '</div>';
      }
      const colors = ['#007856','#0284c7','#e78829','#2335d9','#611ed3','#c70075','#00B696','#ef4444'];
      const chartType = config.chartType || 'bar';

      requestAnimationFrame(() => {
        if (chartType === 'pie') { renderPie(config, colors); }
        else if (chartType === 'line') { renderLine(config, colors); }
        else { renderBar(config, colors); }
      });
    };

    function renderBar(config, colors) {
      const dim = getChartDimensions();
      const m = {top:10,right:10,bottom:28,left:40}, w=dim.w-m.left-m.right, h=dim.h-m.top-m.bottom;
      const svg = d3.select('#chart').attr('viewBox', `0 0 ${dim.w} ${dim.h}`);
      const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
      const x = d3.scaleBand().domain(config.labels).range([0,w]).padding(.3);
      const y = d3.scaleLinear().domain([0,d3.max(config.values)*1.1]).nice().range([h,0]);
      g.append('g').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).tickSize(0).tickPadding(8)).call(g=>g.select('.domain').remove()).selectAll('text').style('font-size','11px').style('fill','#737373');
      g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8)).call(g=>g.select('.domain').remove()).selectAll('text').style('font-size','11px').style('fill','#737373');
      g.selectAll('.gl').data(y.ticks(5)).enter().append('line').attr('x1',0).attr('x2',w).attr('y1',d=>y(d)).attr('y2',d=>y(d)).style('stroke','rgba(0,0,0,.06)');
      const tip = d3.select('body').append('div').attr('class','tooltip');
      g.selectAll('rect').data(config.values).enter().append('rect')
        .attr('x',(_,i)=>x(config.labels[i])).attr('y',d=>y(d)).attr('width',x.bandwidth()).attr('height',d=>h-y(d))
        .attr('rx',3).attr('fill',colors[0]).style('cursor','pointer')
        .on('mouseover',function(e,d){const i=config.values.indexOf(d);d3.select(this).attr('fill',colors[1]);tip.style('opacity',1).html(config.labels[i]+': '+d.toLocaleString())})
        .on('mousemove',function(e){tip.style('left',(e.pageX+10)+'px').style('top',(e.pageY-24)+'px')})
        .on('mouseout',function(){d3.select(this).attr('fill',colors[0]);tip.style('opacity',0)});
    }

    function renderLine(config, colors) {
      const dim = getChartDimensions();
      const m = {top:10,right:10,bottom:28,left:40}, w=dim.w-m.left-m.right, h=dim.h-m.top-m.bottom;
      const svg = d3.select('#chart').attr('viewBox', `0 0 ${dim.w} ${dim.h}`);
      const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
      const x = d3.scalePoint().domain(config.labels).range([0,w]).padding(.4);
      const y = d3.scaleLinear().domain([0,d3.max(config.values)*1.15]).nice().range([h,0]);
      g.append('g').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).tickSize(0).tickPadding(8)).call(g=>g.select('.domain').remove()).selectAll('text').style('font-size','11px').style('fill','#737373');
      g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8)).call(g=>g.select('.domain').remove()).selectAll('text').style('font-size','11px').style('fill','#737373');
      g.selectAll('.gl').data(y.ticks(5)).enter().append('line').attr('x1',0).attr('x2',w).attr('y1',d=>y(d)).attr('y2',d=>y(d)).style('stroke','rgba(0,0,0,.06)');
      const line = d3.line().x((_,i)=>x(config.labels[i])).y(d=>y(d)).curve(d3.curveMonotoneX);
      g.append('path').datum(config.values).attr('d',line).style('fill','none').style('stroke',colors[0]).style('stroke-width',2);
      const tip = d3.select('body').append('div').attr('class','tooltip');
      g.selectAll('circle').data(config.values).enter().append('circle')
        .attr('cx',(_,i)=>x(config.labels[i])).attr('cy',d=>y(d)).attr('r',4).attr('fill',colors[0]).attr('stroke','#fff').attr('stroke-width',2).style('cursor','pointer')
        .on('mouseover',function(e,d){const i=config.values.indexOf(d);d3.select(this).attr('r',6);tip.style('opacity',1).html(config.labels[i]+': '+d.toLocaleString())})
        .on('mousemove',function(e){tip.style('left',(e.pageX+10)+'px').style('top',(e.pageY-24)+'px')})
        .on('mouseout',function(){d3.select(this).attr('r',4);tip.style('opacity',0)});
    }

    function renderPie(config, colors) {
      const dim = getChartDimensions();
      const s = Math.min(dim.w, dim.h);
      const r = s/2-8, ir = r*.55;
      const svg = d3.select('#chart').attr('viewBox',`0 0 ${s} ${s}`);
      const g = svg.append('g').attr('transform',`translate(${s/2},${s/2})`);
      const pie = d3.pie().value(d=>d).sort(null).padAngle(.02);
      const arc = d3.arc().innerRadius(ir).outerRadius(r);
      const arcHover = d3.arc().innerRadius(ir).outerRadius(r+4);
      const total = config.values.reduce((a,b)=>a+b,0);
      const tip = d3.select('body').append('div').attr('class','tooltip');
      g.selectAll('path').data(pie(config.values)).enter().append('path')
        .attr('d',arc).attr('fill',(_,i)=>colors[i%colors.length]).style('cursor','pointer')
        .on('mouseover',function(e,d){d3.select(this).attr('d',arcHover);const pct=((d.data/total)*100).toFixed(1);tip.style('opacity',1).html(config.labels[d.index]+': '+d.data.toLocaleString()+' ('+pct+'%)')})
        .on('mousemove',function(e){tip.style('left',(e.pageX+10)+'px').style('top',(e.pageY-24)+'px')})
        .on('mouseout',function(e,d){d3.select(this).attr('d',arc);tip.style('opacity',0)});
    }

    await app.connect();
  </script>
</body>
</html>"""

TABLE_VIEW = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <style>""" + SHADCN_STYLES + """</style>
</head>
<body>
  <div class="card">
    <div id="title-area"></div>
    <div style="overflow-x:auto"><table><thead id="t-head"></thead><tbody id="t-body"></tbody></table></div>
    <div id="footer-area"></div>
  </div>
  <script type="module">
    import { App } from "https://unpkg.com/@modelcontextprotocol/ext-apps@0.4.0/app-with-deps";
    const app = new App({ name: "Artifact Table", version: "1.0.0" });
    app.ontoolresult = ({ content }) => {
      const text = content?.find(c => c.type === 'text')?.text;
      if (!text) return;
      const config = JSON.parse(text);
      if (config.title) {
        document.getElementById('title-area').innerHTML = '<div class="card-header"><h1 class="card-title">' + config.title + '</h1>' +
          (config.subtitle ? '<p class="card-description">' + config.subtitle + '</p>' : '') + '</div>';
      }
      const headRow = document.createElement('tr');
      config.headers.forEach(h => { const th = document.createElement('th'); th.textContent = h; headRow.appendChild(th); });
      document.getElementById('t-head').appendChild(headRow);
      config.rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => { const td = document.createElement('td'); td.textContent = cell; tr.appendChild(td); });
        document.getElementById('t-body').appendChild(tr);
      });
      if (config.footer) {
        document.getElementById('footer-area').innerHTML = '<p style="margin-top:8px;font-size:.7rem;color:#737373">' + config.footer + '</p>';
      }
      document.documentElement.style.height = document.body.scrollHeight + 'px';
    };
    await app.connect();
  </script>
</body>
</html>"""

DIAGRAM_VIEW = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>""" + SHADCN_STYLES + """</style>
</head>
<body>
  <div class="card">
    <div id="title-area"></div>
    <div style="display:flex;justify-content:center"><pre class="mermaid" id="diagram"></pre></div>
  </div>
  <script type="module">
    import { App } from "https://unpkg.com/@modelcontextprotocol/ext-apps@0.4.0/app-with-deps";
    const app = new App({ name: "Artifact Diagram", version: "1.0.0" });
    app.ontoolresult = ({ content }) => {
      const text = content?.find(c => c.type === 'text')?.text;
      if (!text) return;
      const config = JSON.parse(text);
      if (config.title) {
        document.getElementById('title-area').innerHTML = '<div class="card-header"><h1 class="card-title">' + config.title + '</h1>' +
          (config.subtitle ? '<p class="card-description">' + config.subtitle + '</p>' : '') + '</div>';
      }
      document.getElementById('diagram').textContent = config.mermaid;
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
      mermaid.run().then(() => {
        document.documentElement.style.height = document.body.scrollHeight + 'px';
      });
    };
    await app.connect();
  </script>
</body>
</html>"""

HTML_VIEW = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light dark">
  <style>""" + SHADCN_STYLES + """</style>
</head>
<body>
  <div class="card">
    <div id="title-area"></div>
    <div id="content"></div>
  </div>
  <script type="module">
    import { App } from "https://unpkg.com/@modelcontextprotocol/ext-apps@0.4.0/app-with-deps";
    const app = new App({ name: "Artifact HTML", version: "1.0.0" });
    app.ontoolresult = ({ content }) => {
      const text = content?.find(c => c.type === 'text')?.text;
      if (!text) return;
      const config = JSON.parse(text);
      if (config.title) {
        document.getElementById('title-area').innerHTML = '<div class="card-header"><h1 class="card-title">' + config.title + '</h1>' +
          (config.subtitle ? '<p class="card-description">' + config.subtitle + '</p>' : '') + '</div>';
      }
      document.getElementById('content').innerHTML = config.html;
      document.documentElement.style.height = document.body.scrollHeight + 'px';
    };
    await app.connect();
  </script>
</body>
</html>"""
