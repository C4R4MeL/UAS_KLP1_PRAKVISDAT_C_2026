// Logika utama D3.js untuk dashboard interaktif burnout founder.

let globalRawData = [];

// State aktif untuk filter radar chart
let activeFounderTypes = new Set();
let allFounderTypes = [];

// Penerjemah label Bahasa Indonesia
const founderTranslations = {
  "Burned-Out Operator": "Operator Jenuh (Burnout)",
  "Calm Operator": "Operator Tenang (Calm)",
  "Chaotic Innovator": "Inovator Kacau (Chaotic)",
  "Growth Obsessed Founder": "Founder Terobsesi Tumbuh",
  "Serial Entrepreneur": "Wirausahawan Serial",
  "Solo Hustler": "Pemain Solo Tangguh",
  "Technical Builder": "Pembangun Teknis",
  "Visionary CEO": "CEO Visioner"
};

const climateTranslations = {
  "Bull Market": "Pasar Bergairah",
  "Stable Economy": "Ekonomi Stabil",
  "Recession": "Resesi Makro",
  "Funding Winter": "Musim Kering Modal"
};

const prettyLabelInd = s => {
  const map = {
    "weekly_work_hours": "Jam Kerja Mingguan",
    "sleep_hours": "Jam Tidur Harian",
    "stress_score": "Skor Stres",
    "decision_fatigue_score": "Kelelahan Keputusan",
    "investor_pressure_score": "Tekanan Investor",
    "cofounder_conflict_score": "Konflik Co-founder",
    "work_life_balance_score": "Keseimbangan Hidup",
    "burnout_score": "Skor Burnout"
  };
  return map[s] || s;
};

document.addEventListener("DOMContentLoaded", function () {
  const chartBodies = d3.selectAll(".chart-body");
  chartBodies.html('<div style="color:var(--text-secondary); font-size:0.95rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem;"><div class="spinner" style="width:24px; height:24px; border:2px solid rgba(255,255,255,0.1); border-top-color:var(--accent-blue); border-radius:50%; animation: spin 1s linear infinite;"></div>Memproses Data CSV…</div>');

  const style = document.createElement("style");
  style.innerHTML = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);

  d3.csv("data/startup_burnout_cleaned.csv").then(function (rawData) {
    console.log("CSV loaded:", rawData.length, "rows");

    const numericCols = [
      "founder_age","team_size","weekly_work_hours","sleep_hours",
      "exercise_days_per_week","vacation_days_taken","investor_pressure_score",
      "cofounder_conflict_score","stress_score","decision_fatigue_score",
      "burnout_score","work_life_balance_score","shutdown_probability",
      "funding_amount","monthly_revenue_growth_percent","runway_months_remaining",
      "product_market_fit_score","employee_turnover_percent"
    ];
    rawData.forEach(d => numericCols.forEach(c => { d[c] = +d[c]; }));

    globalRawData = rawData;

    // Kumpulkan tipe founder unik dan inisialisasi state multi-select
    allFounderTypes = [...new Set(rawData.map(d => d.founder_type))].sort();
    allFounderTypes.forEach(ft => activeFounderTypes.add(ft));

    // Setup filter listeners
    d3.select("#filter-work-mode").on("change", updateDashboard);
    d3.select("#filter-economic-climate").on("change", updateDashboard);

    // Setup reset button listener
    d3.select("#btn-reset-filters").on("click", function() {
      d3.select("#filter-work-mode").property("value", "All");
      d3.select("#filter-economic-climate").property("value", "All");
      updateDashboard();
    });

    updateDashboard();

  }).catch(function (error) {
    console.error("CSV load error:", error);
    chartBodies.html(`<div style="color:#ef4444; font-size:0.9rem; text-align:center; padding:1.5rem;">Gagal memuat file dataset.<br/><span style="font-size:0.75rem; color:#94a3b8;">${error}</span></div>`);
  });
});

// Memproses filter global dan merender ulang dashboard
function updateDashboard() {
  const wm = d3.select("#filter-work-mode").property("value");
  const ec = d3.select("#filter-economic-climate").property("value");

  let fd = globalRawData;
  if (wm !== "All") fd = fd.filter(d => d.work_mode === wm);
  if (ec !== "All") fd = fd.filter(d => d.economic_climate === ec);

  if (!fd.length) {
    d3.selectAll(".chart-body").html('<div style="color:#ef4444;font-size:0.95rem;text-align:center;padding:2rem;">Tidak ada data yang cocok dengan kombinasi filter Anda.</div>');
    d3.selectAll(".chart-insight").html('<strong>Insight:</strong> Tidak ada data.');
    updateKPIs(0, 0, 0, 0, 0, 0);
    return;
  }

  const total = fd.length;
  const avgB = d3.mean(fd, d => d.burnout_score) || 0;
  const highB = fd.filter(d => d.burnout_score > 6.5).length;
  const fail = fd.filter(d => d.startup_failure_flag === "1" || d.startup_failure_flag === 1).length;
  const avgSleep = d3.mean(fd, d => d.sleep_hours) || 0;
  const seeksHelp = fd.filter(d => d.seeks_mental_health_support === "Yes").length;

  updateKPIs(total, avgB, (highB / total) * 100, (fail / total) * 100, avgSleep, (seeksHelp / total) * 100);

  // Bersihkan area chart
  d3.selectAll(".chart-body").html("");

  // Render seluruh chart
  renderScatterPlot(fd);
  renderRadarChart(fd);
  renderGroupedBarChart(fd);
  renderHeatmap(fd);
  renderDonutChart(fd);
}

function updateKPIs(total, avg, highPct, failPct, sleep, supportPct) {
  d3.select("#val-total").text(total.toLocaleString("id-ID"));
  d3.select("#val-burnout").text(avg.toFixed(2));
  d3.select("#val-critical").text(highPct.toFixed(1) + "%");
  d3.select("#val-failure").text(failPct.toFixed(1) + "%");
  d3.select("#val-sleep").text(sleep.toFixed(1));
  d3.select("#val-support-pct").text(supportPct.toFixed(1) + "% Mencari Bantuan");
  d3.select("#val-support-fill").style("width", supportPct.toFixed(1) + "%");
}

// Fungsi pembantu menampilkan tooltip global
function showTip(event, html) {
  const tip = d3.select("#tooltip").style("opacity", 1);
  if (html !== null && html !== undefined) {
    tip.html(html);
  }
  const x = event ? (event.pageX || event.clientX + window.scrollX) : 0;
  const y = event ? (event.pageY || event.clientY + window.scrollY) : 0;
  
  // Ukuran lebar tooltip
  const tipNode = tip.node();
  const tipWidth = tipNode ? tipNode.getBoundingClientRect().width : 280;
  
  // Cegah tooltip meluap melewati tepi kanan layar
  const screenWidth = window.innerWidth;
  const clientX = event ? event.clientX : 0;
  
  let leftPos = x + 15;
  if (clientX + tipWidth + 25 > screenWidth) {
    // Posisikan tooltip ke kiri jika meluap
    leftPos = x - tipWidth - 15;
  }
  
  tip.style("left", leftPos + "px")
     .style("top", (y - 15) + "px");
}
function hideTip() { d3.select("#tooltip").style("opacity", 0); }

// Visualisasi 4: Scatter Plot Jam Kerja vs Skor Burnout
function renderScatterPlot(data) {
  const container = d3.select("#workhours-burnout-chart");
  const cw = container.node().getBoundingClientRect().width;
  const m = { top: 25, right: 25, bottom: 55, left: 55 };
  const w = cw - m.left - m.right;
  const h = 400 - m.top - m.bottom; // TINGGI disamakan menjadi 400 secara konsisten

  const svg = container.append("svg")
    .attr("width", cw).attr("height", 400)
    .append("g").attr("transform", `translate(${m.left},${m.top})`);

  // Stratified sampling data scatter plot
  const levels = ["Low", "Medium", "High"];
  const perLevel = 260; // total ~780 sampel
  let sampled = [];
  levels.forEach(lv => {
    const pool = data.filter(d => d.burnout_level === lv);
    const step = Math.max(1, Math.floor(pool.length / perLevel));
    sampled = sampled.concat(pool.filter((_, i) => i % step === 0).slice(0, perLevel));
  });

  const xExt = d3.extent(data, d => d.weekly_work_hours);
  const xScale = d3.scaleLinear().domain([xExt[0] - 2, xExt[1] + 2]).range([0, w]);
  const yScale = d3.scaleLinear().domain([0, 10.5]).range([h, 0]);
  const cMap = { Low: "#10b981", Medium: "#fbbf24", High: "#ef4444" };
  const levelTranslations = { Low: "Rendah", Medium: "Sedang", High: "Tinggi" };

  // Garis grid horizontal pembantu
  const gridG = svg.append("g").attr("class","grid");
  gridG.call(d3.axisLeft(yScale).tickSize(-w).tickFormat(""));
  gridG.selectAll("line")
    .attr("stroke","rgba(255,255,255,0.025)")
    .filter(d => d <= 0.1 || d >= 9.9)
    .remove();

  // Konfigurasi sumbu X
  const xAxisG = svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`)
    .call(d3.axisBottom(xScale).ticks(8));
  xAxisG.select(".domain").remove(); // Hapus garis sumbu kaku
  xAxisG.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.06)");
  xAxisG.selectAll("text").style("font-size", "10.5px"); // Ukuran teks sumbu diperbesar

  // Konfigurasi sumbu Y
  const yAxisG = svg.append("g").attr("class","axis").call(d3.axisLeft(yScale).ticks(6));
  yAxisG.select(".domain").remove(); // Hapus garis sumbu kaku
  yAxisG.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.06)");
  yAxisG.selectAll("text").style("font-size", "10.5px"); // Ukuran teks sumbu diperbesar

  // Label sumbu grafik
  svg.append("text").attr("x", w/2).attr("y", h + 42).attr("fill","#cbd5e1")
    .style("text-anchor","middle").style("font-size","12px").style("font-weight","600")
    .text("Jam Kerja Mingguan (jam/minggu)");

  svg.append("text").attr("transform","rotate(-90)").attr("x",-h/2).attr("y",-38)
    .attr("fill","#cbd5e1").style("text-anchor","middle").style("font-size","12px").style("font-weight","600")
    .text("Skor Burnout Founder (0–10)");

  // Perhitungan statistik regresi linear
  const mx = d3.mean(data, d => d.weekly_work_hours);
  const my = d3.mean(data, d => d.burnout_score);
  let ssxy = 0, ssxx = 0, ssyy = 0;
  data.forEach(d => {
    const dx = d.weekly_work_hours - mx, dy = d.burnout_score - my;
    ssxy += dx * dy; ssxx += dx * dx; ssyy += dy * dy;
  });
  const slope = ssxx ? ssxy / ssxx : 0;
  const intercept = my - slope * mx;
  const r = (ssxx && ssyy) ? ssxy / Math.sqrt(ssxx * ssyy) : 0;

  // Rata-rata pembanding untuk tooltip
  const avgWorkHours = mx || 50;
  const avgBurnout = my || 3.5;

  // Gambar garis tren regresi
  svg.append("line")
    .attr("x1", xScale(xExt[0])).attr("y1", yScale(slope * xExt[0] + intercept))
    .attr("x2", xScale(xExt[1])).attr("y2", yScale(slope * xExt[1] + intercept))
    .attr("stroke","#00d2ff").attr("stroke-width",2.2)
    .attr("stroke-dasharray","8,4").attr("opacity",0.8);

  // Urutkan dot agar tingkat High berada paling atas
  sampled.sort((a, b) => levels.indexOf(a.burnout_level) - levels.indexOf(b.burnout_level));

  // Gambar titik scatter plot
  svg.selectAll(".dot").data(sampled).enter().append("circle")
    .attr("class", "scatter-dot")
    .attr("cx", d => xScale(d.weekly_work_hours))
    .attr("cy", d => yScale(d.burnout_score))
    .attr("r", 0)
    .attr("fill", d => cMap[d.burnout_level])
    .attr("opacity", 0.6)
    .attr("stroke","rgba(6,9,19,0.4)").attr("stroke-width",0.3)
    .on("mouseover", function(ev, d) {
      d3.select(this).transition().duration(80).attr("r",7).attr("opacity",1); // Perbesar titik saat disorot
      
      const grpText = `👤 Profil Founder`;
      const lvlColor = cMap[d.burnout_level];
      
      let statusBadge = "";
      if (d.burnout_level === "Low") {
        statusBadge = "🌱 Rendah";
      } else if (d.burnout_level === "Medium") {
        statusBadge = "⚠️ Sedang";
      } else {
        statusBadge = "🚨 Tinggi";
      }

      const factorWork = (d.weekly_work_hours / avgWorkHours).toFixed(1);
      const factorBurnout = (d.burnout_score / Math.max(0.1, avgBurnout)).toFixed(1);

      const workDiffText = d.weekly_work_hours > avgWorkHours 
        ? `📈 <span style="color:#ef4444; font-weight:700;">${factorWork}x lipat lebih tinggi</span> dari rata-rata (${avgWorkHours.toFixed(1)} jam).`
        : `📉 <span style="color:#10b981; font-weight:700;">${factorWork}x lebih rendah</span> dari rata-rata (${avgWorkHours.toFixed(1)} jam).`;
        
      const burnoutDiffText = d.burnout_score > avgBurnout
        ? `📈 <span style="color:#ef4444; font-weight:700;">${factorBurnout}x lipat lebih tinggi</span> dari rata-rata (${avgBurnout.toFixed(1)}).`
        : `📉 <span style="color:#10b981; font-weight:700;">${factorBurnout}x lebih rendah</span> dari rata-rata (${avgBurnout.toFixed(1)}).`;

      const htmlContent = `
        <div style="font-family: inherit; font-size: 0.88rem; line-height: 1.5; color: #f1f5f9; min-width: 280px; max-width: 330px; padding: 0.2rem;">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; color: #e2e8f0; font-size: 0.85rem; letter-spacing: 0.3px;">${grpText}</span>
            <span style="background: ${lvlColor}15; color: ${lvlColor}; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; border: 1px solid ${lvlColor}30; white-space: nowrap; letter-spacing: 0.2px;">${statusBadge}</span>
          </div>
          <div style="margin-bottom: 0.6rem; font-size: 0.8rem; color: #cbd5e1; line-height: 1.45;">
            Tipe Founder: <b style="color: #ffffff;">${founderTranslations[d.founder_type] || d.founder_type}</b>
          </div>
          <div style="background: rgba(255,255,255,0.035); border-radius: 4px; padding: 0.5rem; font-size: 0.8rem; border-left: 3px solid ${lvlColor}; margin-bottom: 0.6rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.45rem;">
            <div>
              Jam Kerja: <b style="color:#ffffff; font-size:1.05rem;">${d.weekly_work_hours.toFixed(1)}</b> jam/minggu
              <div style="font-size:0.75rem; color:#94a3b8; margin-top:0.15rem;">${workDiffText}</div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top:0.4rem; margin-top:0.15rem;">
              Skor Burnout: <b style="color:#ffffff; font-size:1.05rem;">${d.burnout_score.toFixed(1)}/10</b>
              <div style="font-size:0.75rem; color:#94a3b8; margin-top:0.15rem;">${burnoutDiffText}</div>
            </div>
          </div>
        </div>
      `;

      showTip(ev, htmlContent);
    })
    .on("mousemove", (ev) => showTip(ev, null))
    .on("mouseout", function() {
      d3.select(this).transition().duration(80).attr("r",4.2).attr("opacity",0.6); // Kembalikan ukuran titik
      hideTip();
    })
    .transition().duration(500).attr("r", 4.2); // Setel ukuran awal titik

  // Gambar legenda tingkat burnout
  const lg = svg.append("g").attr("transform",`translate(8, -12)`);
  levels.forEach((lv, i) => {
    const g = lg.append("g").attr("transform",`translate(${i * 90}, 0)`);
    g.append("circle").attr("r",4.5).attr("fill", cMap[lv]).attr("cy", -1);
    g.append("text").attr("x",8).attr("y",3).attr("fill","#cbd5e1").style("font-size","11px").style("font-weight","600").text(levelTranslations[lv]);
  });

  // Pembuat insight dinamis
  const correlationText = r > 0.45 ? "korelasi positif kuat" : (r > 0.25 ? "korelasi positif sedang" : "korelasi positif lemah");
  const overworkPool = data.filter(d => d.weekly_work_hours >= 60);
  const overworkHighPct = overworkPool.length ? ((overworkPool.filter(d => d.burnout_score > 6.5).length / overworkPool.length) * 100).toFixed(1) : "0.0";
  
  d3.select("#insight-scatter").html(`<strong>Analisis Kerja & Burnout:</strong> Ditemukan indikasi <b>${correlationText}</b> antara jam kerja mingguan dan tingkat kejenuhan. Founder yang bekerja ekstrem (&ge; 60 jam/minggu) memiliki risiko burnout parah sebesar <b>${overworkHighPct}%</b>.`);
}

// Visualisasi 1: Radar Chart Profil Tipe Founder
function renderRadarChart(data) {
  const container = d3.select("#radar-founder-chart");
  const cw = container.node().getBoundingClientRect().width;

  const metrics = ["burnout_score","stress_score","decision_fatigue_score",
    "investor_pressure_score","work_life_balance_score","sleep_hours"];
  const labelsInd = ["Tingkat Burnout","Skor Stres","Kelelahan\nKeputusan","Tekanan\nInvestor","Keseimbangan\nHidup","Jam Tidur"];
  const N = metrics.length;
  const angleSlice = (2 * Math.PI) / N;

  // Posisi pusat dan radius radar chart
  const radarArea = cw;
  const totalH = 400; // Setel tinggi donut chart
  // Radius luar radar
  const radius = Math.min(cw / 2 - 85, 125); // RADIUS diperbesar (sebelumnya max ~107px)
  const cx = cw / 2; // Tepat di tengah horizontal
  const cy = 160; // Digeser sedikit ke atas untuk memberi ruang bagi legenda di bawah

  const svg = container.append("svg").attr("width", cw).attr("height", totalH);
  const gRadar = svg.append("g").attr("transform", `translate(${cx},${cy})`);

  // Cari nilai min-max untuk normalisasi data
  const ranges = {};
  metrics.forEach(m => { ranges[m] = { min: d3.min(data, d => d[m]), max: d3.max(data, d => d[m]) }; });

  // Hitung rata-rata nilai per tipe founder
  const fTypes = allFounderTypes;
  const profiles = {};
  fTypes.forEach(ft => {
    const sub = data.filter(d => d.founder_type === ft);
    profiles[ft] = metrics.map(m => {
      const v = d3.mean(sub, d => d[m]) || 0;
      const r = ranges[m];
      return r.max > r.min ? (v - r.min) / (r.max - r.min) : 0;
    });
  });

  // Menggambar grid konsentris radar
  const gridLevels = 5;
  for (let lv = 1; lv <= gridLevels; lv++) {
    const r = (radius / gridLevels) * lv;
    gRadar.append("circle").attr("r", r)
      .attr("fill","none").attr("stroke","rgba(255,255,255,0.06)").attr("stroke-width",0.5);
  }

  // Gambar sumbu radial radar
  metrics.forEach((m, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const ex = Math.cos(angle) * radius;
    const ey = Math.sin(angle) * radius;
    gRadar.append("line").attr("x1",0).attr("y1",0).attr("x2",ex).attr("y2",ey)
      .attr("stroke","rgba(255,255,255,0.08)").attr("stroke-width",0.5);

    // Posisi teks label sumbu radial
    const lr = radius + 15;
    const lx = Math.cos(angle) * lr;
    const ly = Math.sin(angle) * lr;
    
    let textAnchor = "middle";
    const cosAngle = Math.cos(angle);
    if (cosAngle > 0.15) textAnchor = "start";
    else if (cosAngle < -0.15) textAnchor = "end";

    const lines = labelsInd[i].split("\n");
    lines.forEach((line, li) => {
      gRadar.append("text").attr("x",lx).attr("y", ly + li * 10 - (lines.length - 1) * 4)
        .attr("text-anchor", textAnchor).attr("fill","#94a3b8")
        .style("font-size","10px").style("font-weight","500").text(line);
    });
  });

  // Palet warna khusus kontras tinggi
  const palette = ["#ef4444", "#fbbf24", "#10b981", "#3b82f6", "#f97316", "#84cc16", "#00d2ff", "#d946ef"];

  // Generator path radar
  const radarLine = d3.lineRadial()
    .radius(d => d * radius)
    .angle((_, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  // Menggambar path area poligon radar
  fTypes.forEach((ft, idx) => {
    const vals = profiles[ft];
    const color = palette[idx % palette.length];
    const isCurrentlyActive = activeFounderTypes.has(ft);

    // Poligon radar
    gRadar.append("path").datum(vals)
      .attr("class","radar-polygon")
      .attr("data-ft", ft)
      .attr("d", radarLine)
      .attr("fill", color)
      .attr("fill-opacity", isCurrentlyActive ? 0.05 : 0)
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", isCurrentlyActive ? 0.8 : 0)
      .on("mouseover", function(ev) {
        if (!activeFounderTypes.has(ft)) return; // Abaikan interaksi jika tidak aktif
        
        gRadar.selectAll(".radar-polygon").attr("stroke-opacity", 0.08).attr("fill-opacity", 0.005);
        d3.select(this).attr("stroke-opacity", 1).attr("fill-opacity", 0.2).attr("stroke-width", 2.6);

        const tipLines = metrics.map((m, mi) => {
          const realVal = vals[mi] * (ranges[m].max - ranges[m].min) + ranges[m].min;
          const unit = m === "sleep_hours" ? " jam" : "/10";
          return `${labelsInd[mi].replace("\n"," ")}: <b>${realVal.toFixed(1)}${unit}</b>`;
        }).join("<br/>");
        
        showTip(ev, `<strong style="color:${color}; border-bottom: 1px solid ${color}40; padding-bottom: 3px;">Profil: ${founderTranslations[ft] || ft}</strong>${tipLines}`);
      })
      .on("mousemove", (ev) => {
        showTip(ev, null);
      })
      .on("mouseout", function() {
        // Atur ulang opasitas saat kursor keluar
        gRadar.selectAll(".radar-polygon")
          .attr("stroke-opacity", function() {
            const thisFt = d3.select(this).attr("data-ft");
            return activeFounderTypes.has(thisFt) ? 0.8 : 0;
          })
          .attr("fill-opacity", function() {
            const thisFt = d3.select(this).attr("data-ft");
            return activeFounderTypes.has(thisFt) ? 0.05 : 0;
          })
          .attr("stroke-width", 1.5);
        
        hideTip();
      });

    // Gambar titik di setiap sudut poligon
    vals.forEach((v, vi) => {
      const angle = angleSlice * vi - Math.PI / 2;
      gRadar.append("circle")
        .attr("class", "radar-vertex-dot")
        .attr("data-ft", ft)
        .attr("cx", Math.cos(angle) * v * radius)
        .attr("cy", Math.sin(angle) * v * radius)
        .attr("r", 2.2) // Ukuran titik sudut
        .attr("fill", color)
        .attr("stroke","rgba(6,9,19,0.5)").attr("stroke-width",0.4)
        .attr("opacity", isCurrentlyActive ? 0.8 : 0)
        .style("pointer-events","none");
    });
  });

  // Menggambar legenda 3 kolom di bagian bawah
  const legendYStart = totalH - 78; // Beri ruang vertikal yang cukup untuk 3 baris
  const colWidth = cw / 3;

  fTypes.forEach((ft, i) => {
    const isCurrentlyActive = activeFounderTypes.has(ft);
    const color = palette[i % palette.length];
    const row = Math.floor(i / 3);
    const col = i % 3;

    // Posisi item legenda
    const itemX = col * colWidth + Math.max(10, (colWidth - 145) / 2);
    const itemY = legendYStart + row * 22;

    const item = svg.append("g")
      .attr("class", `radar-legend-item ${isCurrentlyActive ? 'active' : 'inactive'}`)
      .attr("transform", `translate(${itemX}, ${itemY})`)
      .attr("data-ft", ft)
      .on("click", function() {
        // Toggle filter tipe founder
        if (activeFounderTypes.has(ft)) {
          if (activeFounderTypes.size > 1) { // Sisakan minimal 1 agar tidak kosong kosong banget
            activeFounderTypes.delete(ft);
          }
        } else {
          activeFounderTypes.add(ft);
        }

        // Animasi pembaruan poligon
        fTypes.forEach(t => {
          const act = activeFounderTypes.has(t);
          gRadar.select(`.radar-polygon[data-ft="${t}"]`).transition().duration(250)
            .attr("stroke-opacity", act ? 0.8 : 0)
            .attr("fill-opacity", act ? 0.05 : 0);

          gRadar.selectAll(`.radar-vertex-dot[data-ft="${t}"]`).transition().duration(250)
            .attr("opacity", act ? 0.8 : 0);
        });

        // Perbarui status warna legenda
        fTypes.forEach(t => {
          const active = activeFounderTypes.has(t);
          svg.select(`.radar-legend-item[data-ft="${t}"]`)
            .classed("inactive", !active)
            .select("rect")
            .attr("fill", active ? palette[fTypes.indexOf(t) % palette.length] : "#475569");
        });

        // Perbarui kotak insight
        generateRadarInsight(data);
      });

    item.append("rect")
      .attr("width", 11).attr("height", 11).attr("rx", 3)
      .attr("fill", isCurrentlyActive ? color : "#475569");

    item.append("text")
      .attr("x", 16).attr("y", 10)
      .attr("fill", "#cbd5e1")
      .style("font-size", "10px") // Ukuran teks legenda
      .style("font-weight", "500")
      .text(founderTranslations[ft] || ft);
  });

  // Tampilkan insight awal
  generateRadarInsight(data);
}

function generateRadarInsight(data) {
  // Analisis data tipe founder aktif
  const activeList = [...activeFounderTypes];
  if (!activeList.length) {
    d3.select("#insight-radar").html(`<strong>Insight Radar:</strong> Pilih tipe founder di legenda untuk menganalisis.`);
    return;
  }

  let maxB = -1, maxFt = "";
  let minSleep = 24, minSleepFt = "";

  activeList.forEach(ft => {
    const sub = data.filter(d => d.founder_type === ft);
    const avgB = d3.mean(sub, d => d.burnout_score) || 0;
    const avgS = d3.mean(sub, d => d.sleep_hours) || 0;

    if (avgB > maxB) { maxB = avgB; maxFt = ft; }
    if (avgS < minSleep) { minSleep = avgS; minSleepFt = ft; }
  });

  const namaMax = founderTranslations[maxFt] || maxFt;
  const namaMinSleep = founderTranslations[minSleepFt] || minSleepFt;

  d3.select("#insight-radar").html(`<strong>Profil Kesehatan Aktif:</strong> Tipe founder <b>${namaMax}</b> memiliki skor jenuh tertinggi (rerata <b>${maxB.toFixed(1)}/10</b>). Dari sisi kebugaran, tipe <b>${namaMinSleep}</b> mencatat durasi tidur terendah yaitu hanya <b>${minSleep.toFixed(1)} jam</b> per malam.`);
}

// Visualisasi 3: Grouped Bar Chart Risiko Kegagalan
function renderGroupedBarChart(data) {
  const container = d3.select("#industry-climate-chart");
  const cw = container.node().getBoundingClientRect().width;
  const m = { top: 35, right: 25, bottom: 65, left: 55 };
  const w = cw - m.left - m.right;
  const h = 400 - m.top - m.bottom; // TINGGI disamakan menjadi 400 secara konsisten

  const svg = container.append("svg").attr("width", cw).attr("height", 400)
    .append("g").attr("transform",`translate(${m.left},${m.top})`);

  const industriesRaw = [...new Set(data.map(d => d.industry))];
  // Urutkan sektor secara descending berdasarkan risiko kegagalan
  const industryStats = industriesRaw.map(ind => {
    const sub = data.filter(d => d.industry === ind);
    const pct = sub.length ? (sub.filter(d => d.shutdown_risk === "High").length / sub.length) * 100 : 0;
    return { name: ind, pct: pct };
  });
  industryStats.sort((a, b) => b.pct - a.pct);
  const industries = industryStats.map(d => d.name);
  
  // Filter iklim ekonomi aktif
  const selectedClimate = d3.select("#filter-economic-climate").property("value");
  let climates = ["Bull Market","Stable Economy","Recession","Funding Winter"];
  if (selectedClimate !== "All") {
    climates = [selectedClimate];
  }
  
  const cColors = {"Bull Market":"#10b981","Stable Economy":"#3b82f6","Recession":"#f59e0b","Funding Winter":"#ef4444"};

  // Kalkulasi persentase kegagalan per sektor
  const barData = [];
  industries.forEach(ind => {
    climates.forEach(clim => {
      const sub = data.filter(d => d.industry === ind && d.economic_climate === clim);
      const pct = sub.length ? (sub.filter(d => d.shutdown_risk === "High").length / sub.length) * 100 : 0;
      barData.push({ industry: ind, climate: clim, pct });
    });
  });

  const x0 = d3.scaleBand().domain(industries).range([0, w]).paddingInner(0.25).paddingOuter(0.1);
  const x1 = d3.scaleBand().domain(climates).range([0, x0.bandwidth()]).padding(0.08);
  // Skala Y mutlak [0, 100]
  const yScale = d3.scaleLinear().domain([0, 100]).range([h, 0]);

  // Garis grid horizontal
  svg.append("g").attr("class","grid").call(d3.axisLeft(yScale).ticks(5).tickSize(-w).tickFormat(""))
    .selectAll("line").attr("stroke","rgba(255,255,255,0.025)");

  // Konfigurasi sumbu X
  const xAxisG = svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`)
    .call(d3.axisBottom(x0));
  xAxisG.select(".domain").remove(); // Hapus garis sumbu
  xAxisG.selectAll(".tick line").remove(); // Bersihkan garis tick agar rapi
  
  // Rotasi label nama sektor industri
  xAxisG.selectAll("text")
    .attr("transform","rotate(-23)")
    .style("text-anchor","end")
    .attr("dx","-3px").attr("dy","6px")
    .style("font-size","10.5px")
    .style("font-weight","600")
    .attr("fill","#f1f5f9");

  // Konfigurasi sumbu Y
  const yAxisG = svg.append("g").attr("class","axis").call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + "%"));
  yAxisG.select(".domain").remove();
  yAxisG.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.06)");
  yAxisG.selectAll("text").style("font-size","10.5px").attr("fill","#cbd5e1").style("font-weight","500");

  svg.append("text").attr("transform","rotate(-90)").attr("x",-h/2).attr("y",-40)
    .attr("fill","#cbd5e1").style("text-anchor","middle").style("font-size","11.5px").style("font-weight","600")
    .text("% Startup Shutdown Risk Tinggi");

  // Gambar batang grafik
  const groups = svg.selectAll(".ind-g").data(industries).enter()
    .append("g").attr("transform", d => `translate(${x0(d)},0)`);

  groups.each(function(ind) {
    const g = d3.select(this);
    climates.forEach(clim => {
      const match = barData.find(b => b.industry === ind && b.climate === clim);
      if (!match) return;

      // Cari rentang risiko untuk komparasi tooltip
      const sectorBars = barData.filter(b => b.industry === ind);
      let minPct = 999, maxPct = -1;
      let minClimate = "", maxClimate = "";
      sectorBars.forEach(b => {
        if (b.pct < minPct) { minPct = b.pct; minClimate = b.climate; }
        if (b.pct > maxPct) { maxPct = b.pct; maxClimate = b.climate; }
      });

      g.append("rect")
        .attr("class", "bar-interactive")
        .attr("x", x1(clim)).attr("width", x1.bandwidth())
        .attr("y", h).attr("height", 0)
        .attr("fill", cColors[clim]).attr("opacity", 0.8).attr("rx", 1.5)
        .on("mouseover", function(ev) {
          d3.select(this).attr("opacity", 1).attr("stroke", "#ffffff").attr("stroke-width", 1.5);
          
          const pct = match.pct;
          const grpText = `🏢 Sektor: ${ind}`;
          const climColor = cColors[clim];
          const climName = climateTranslations[clim] || clim;
          const pctStr = pct.toFixed(1) + "%";

          let climDesc = "";
          if (clim === "Bull Market") {
            climDesc = "🌱 <b>Pasar Bergairah:</b> Skenario ekspansif. Likuiditas melimpah, valuasi tinggi, dan minat investasi sangat tinggi.";
          } else if (clim === "Stable Economy") {
            climDesc = "🔵 <b>Ekonomi Stabil:</b> Skenario kondusif. Pertumbuhan organik sehat dan ketersediaan modal stabil terukur.";
          } else if (clim === "Recession") {
            climDesc = "⚠️ <b>Resesi Makro:</b> Skenario kontraksi. Penurunan daya beli konsumen dan perlambatan pertumbuhan pasar.";
          } else {
            climDesc = "❄️ <b>Musim Kering Modal:</b> Skenario terberat. Likuiditas membeku, kriteria VC sangat ketat, dan ancaman kehabisan runway.";
          }

          let factorText = "";
          if (clim === minClimate) {
            factorText = `🏆 <b>Status Terbaik:</b> Kondisi makro paling aman bagi sektor <b>${ind}</b> dengan tingkat kerentanan minimum (<b>${minPct.toFixed(1)}%</b>).`;
          } else {
            const factor = (pct / Math.max(0.1, minPct)).toFixed(1);
            factorText = `📊 <b>Komparasi:</b> Kerentanan di kondisi ini adalah <span style="color:#ef4444; font-weight:700;">${factor}x lipat lebih tinggi</span> dibandingkan saat <b>${climateTranslations[minClimate] || minClimate}</b> (<b>${minPct.toFixed(1)}%</b>).`;
          }

          const htmlContent = `
            <div style="font-family: inherit; font-size: 0.88rem; line-height: 1.5; color: #f1f5f9; min-width: 280px; max-width: 330px; padding: 0.2rem;">
              <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 800; color: #e2e8f0; font-size: 0.85rem; letter-spacing: 0.3px;">${grpText}</span>
                <span style="background: ${climColor}15; color: ${climColor}; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; border: 1px solid ${climColor}30; white-space: nowrap; letter-spacing: 0.2px;">${climName}</span>
              </div>
              <div style="margin-bottom: 0.6rem; display: flex; align-items: baseline; gap: 0.4rem;">
                <span style="color: #94a3b8; font-size: 0.85rem;">Risiko Kegagalan:</span>
                <b style="font-size: 1.25rem; color: ${climColor}; font-weight: 800;">${pctStr}</b>
              </div>
              <div style="background: rgba(255,255,255,0.035); border-radius: 4px; padding: 0.5rem; font-size: 0.8rem; border-left: 3px solid ${climColor}; margin-bottom: 0.6rem; color: #cbd5e1; line-height: 1.4;">
                ${climDesc}
              </div>
              <div style="font-size: 0.8rem; color: #e2e8f0; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 0.5rem; line-height: 1.4;">
                ${factorText}
              </div>
            </div>
          `;

          showTip(ev, htmlContent);
        })
        .on("mousemove", (ev) => { showTip(ev, null); })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.8).attr("stroke", "none");
          hideTip();
        })
        .transition().duration(600).delay(industries.indexOf(ind) * 25)
        .attr("y", yScale(match.pct)).attr("height", h - yScale(match.pct));
    });
  });

  // Gambar legenda di bagian atas
  const lgW = climates.length * 145;
  const lgX = (w - lgW) / 2;
  const lg = svg.append("g").attr("transform",`translate(${lgX}, -18)`);
  climates.forEach((clim, i) => {
    const g = lg.append("g").attr("transform",`translate(${i * 145}, 0)`);
    g.append("rect").attr("width",11).attr("height",11).attr("rx",2.5).attr("fill",cColors[clim]);
    g.append("text").attr("x",15).attr("y",9.5).attr("fill","#cbd5e1").style("font-size","10.5px").style("font-weight","600").text(climateTranslations[clim] || clim);
  });

  // Dynamic Sektoral Insight
  let maxFail = -1, maxSec = "", maxClim = "";
  barData.forEach(b => {
    if (b.pct > maxFail) { maxFail = b.pct; maxSec = b.industry; maxClim = b.climate; }
  });
  d3.select("#insight-bar").html(`<strong>Analisis Risiko Makro:</strong> Kerentanan bisnis tertinggi dicatat oleh sektor <b>${maxSec}</b> dengan angka risiko kegagalan mencapai <b>${maxFail.toFixed(1)}%</b> saat kondisi makro <b>${climateTranslations[maxClim] || maxClim}</b>.`);
}

// Visualisasi 5: Heatmap Korelasi Pearson
function renderHeatmap(data) {
  const container = d3.select("#correlation-heatmap");
  const cw = container.node().getBoundingClientRect().width;
  
  const cellSize = 38; // Diperbesar dari 34px ke 38px (~25% perluasan visual grid) agar sama besar dengan scatter plot
  const w = cellSize * 8; // 304px
  const h = w; // 304px
  
  // Pengaturan margin heatmap
  const m = { top: 76, right: 15, bottom: 20, left: 125 };
  
  // Tengahkan grid secara dinamis dengan batas kiri aman 130px
  const gridX = Math.max(130, (cw - w) / 2);

  const svg = container.append("svg")
    .attr("width", cw) // Lebar diisi cw secara dinamis
    .attr("height", 400) // Tinggi dikunci persis 400px agar konsisten 100% dengan scatter plot
    .append("g").attr("transform",`translate(${gridX},${m.top})`);

  const vars = [
    "weekly_work_hours","sleep_hours","stress_score","decision_fatigue_score",
    "investor_pressure_score","cofounder_conflict_score","work_life_balance_score","burnout_score"
  ];

  // Perhitungan koefisien korelasi Pearson
  const n = data.length;
  const st = {};
  vars.forEach(v => {
    const mean = d3.mean(data, d => d[v]) || 0;
    const vari = d3.sum(data, d => (d[v] - mean) ** 2) / Math.max(1, n - 1);
    st[v] = { mean, sd: Math.sqrt(vari) };
  });

  const hd = [];
  for (let i = 0; i < vars.length; i++) {
    for (let j = 0; j < vars.length; j++) {
      if (i === j) { hd.push({x: vars[i], y: vars[j], v: 1.0, xi: i, yi: j}); continue; }
      let sp = 0;
      for (let k = 0; k < n; k++) sp += (data[k][vars[i]] - st[vars[i]].mean) * (data[k][vars[j]] - st[vars[j]].mean);
      const cov = sp / Math.max(1, n - 1);
      const r = (st[vars[i]].sd && st[vars[j]].sd) ? cov / (st[vars[i]].sd * st[vars[j]].sd) : 0;
      hd.push({x: vars[i], y: vars[j], v: r, xi: i, yi: j});
    }
  }

  const xScale = d3.scaleBand().domain(vars).range([0, w]).padding(0.04);
  const yScale = d3.scaleBand().domain(vars).range([0, h]).padding(0.04);
  
  // Skala warna heatmap kontras tinggi
  const colorFn = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range(["#be123c", "#111827", "#0369a1"]);

  // Konfigurasi sumbu atas (X)
  const xAxisG = svg.append("g").attr("class","axis").call(d3.axisTop(xScale).tickFormat(prettyLabelInd));
  xAxisG.select(".domain").remove();
  xAxisG.selectAll(".tick line").remove();
  xAxisG.selectAll("text")
    .attr("transform","rotate(-25)") // Rotasi label sumbu atas ke -25 derajat
    .style("text-anchor","start")
    .attr("dx","5px").attr("dy","-2px")
    .style("font-size","10px"); // Setel font size label

  // Konfigurasi sumbu kiri (Y)
  const yAxisG = svg.append("g").attr("class","axis").call(d3.axisLeft(yScale).tickFormat(prettyLabelInd));
  yAxisG.select(".domain").remove();
  yAxisG.selectAll(".tick line").remove();
  yAxisG.selectAll("text").style("font-size","10px"); // Setel font size label

  // Gambar sel grid korelasi
  svg.selectAll(".hm-cell").data(hd).enter().append("rect")
    .attr("class","heatmap-cell")
    .attr("x", d => xScale(d.x)).attr("y", d => yScale(d.y))
    .attr("width", xScale.bandwidth()).attr("height", yScale.bandwidth())
    .attr("rx",2.5)
    .attr("fill","rgba(15,23,42,0.4)")
    .on("mouseover", function(ev, d) {
      d3.select(this).attr("stroke","#fff").attr("stroke-width",1.5);
      
      const grpText = `📊 Analisis Korelasi`;
      const valStr = d.v.toFixed(3);
      const cellColor = colorFn(d.v);

      let strengthBadge = "";
      if (d.v === 1.0) {
        strengthBadge = "🟢 Identik";
      } else if (d.v > 0.6) {
        strengthBadge = "🔴 Positif Kuat";
      } else if (d.v > 0.3) {
        strengthBadge = "🟠 Positif Sedang";
      } else if (d.v > 0) {
        strengthBadge = "🟡 Positif Lemah";
      } else if (d.v < -0.6) {
        strengthBadge = "🔴 Negatif Kuat";
      } else if (d.v < -0.3) {
        strengthBadge = "🟠 Negatif Sedang";
      } else if (d.v < 0) {
        strengthBadge = "🟡 Negatif Lemah";
      } else {
        strengthBadge = "⚪ Netral";
      }

      let descText = "";
      if (d.x === d.y) {
        descText = "🌱 <b>Korelasi Mandiri:</b> Perbandingan variabel dengan dirinya sendiri secara absolut bernilai positif sempurna (+1.000).";
      } else if ((d.x === 'weekly_work_hours' && d.y === 'burnout_score') || (d.x === 'burnout_score' && d.y === 'weekly_work_hours')) {
        descText = "🚨 <b>Beban Kerja Ekstrem:</b> Jam kerja mingguan yang panjang terbukti merupakan kontributor utama terhadap ledakan skor burnout founder startup.";
      } else if ((d.x === 'sleep_hours' && d.y === 'burnout_score') || (d.x === 'burnout_score' && d.y === 'sleep_hours')) {
        descText = "💡 <b>Proteksi Tidur:</b> Hubungan berbanding terbalik (negatif kuat). Tidur harian yang cukup terbukti menjadi pelindung biologis paling efektif melawan kelelahan mental.";
      } else if ((d.x === 'stress_score' && d.y === 'burnout_score') || (d.x === 'burnout_score' && d.y === 'stress_score')) {
        descText = "🚨 <b>Akumulasi Stres:</b> Tekanan stres harian memiliki korelasi searah yang sangat pekat dengan kejenuhan mental. Mengurangi stres harian otomatis menekan burnout.";
      } else if ((d.x === 'work_life_balance_score' && d.y === 'burnout_score') || (d.x === 'burnout_score' && d.y === 'work_life_balance_score')) {
        descText = "🏆 <b>Keseimbangan Hidup:</b> Hubungan berbanding terbalik secara kuat. Semakin tinggi tingkat work-life balance, semakin rendah peluang founder terserang depresi atau burnout.";
      } else if ((d.x === 'decision_fatigue_score' && d.y === 'burnout_score') || (d.x === 'burnout_score' && d.y === 'decision_fatigue_score')) {
        descText = "🚨 <b>Kelelahan Keputusan:</b> Keharusan mengambil keputusan bisnis berat secara terus-menerus menguras energi psikologis dan memicu timbulnya kejenuhan akut.";
      } else if ((d.x === 'weekly_work_hours' && d.y === 'sleep_hours') || (d.x === 'sleep_hours' && d.y === 'weekly_work_hours')) {
        descText = "📉 <b>Trade-off Tidur:</b> Bekerja lembur secara drastis memotong waktu tidur founder, merusak metabolisme tubuh dan mempercepat kepatahan fokus kognitif.";
      } else {
        if (d.v > 0) {
          descText = `📈 <b>Korelasi Positif:</b> Ketika metrik <b>${prettyLabelInd(d.x)}</b> meningkat, maka metrik <b>${prettyLabelInd(d.y)}</b> cenderung ikut naik secara linear.`;
        } else if (d.v < 0) {
          descText = `📉 <b>Korelasi Negatif:</b> Kedua metrik berbanding terbalik. Peningkatan metrik <b>${prettyLabelInd(d.x)}</b> cenderung menekan atau menurunkan metrik <b>${prettyLabelInd(d.y)}</b> secara linear.`;
        } else {
          descText = `⚪ <b>Tidak Berkolerasi:</b> Perubahan metrik <b>${prettyLabelInd(d.x)}</b> tidak memiliki hubungan linier sistematis dengan metrik <b>${prettyLabelInd(d.y)}</b>.`;
        }
      }

      const htmlContent = `
        <div style="font-family: inherit; font-size: 0.88rem; line-height: 1.5; color: #f1f5f9; min-width: 280px; max-width: 330px; padding: 0.2rem;">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; color: #e2e8f0; font-size: 0.85rem; letter-spacing: 0.3px;">${grpText}</span>
            <span style="background: ${cellColor}15; color: ${cellColor}; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; border: 1px solid ${cellColor}30; white-space: nowrap; letter-spacing: 0.2px;">${strengthBadge}</span>
          </div>
          <div style="margin-bottom: 0.5rem; font-size: 0.82rem; color: #cbd5e1; line-height: 1.4;">
            Variabel A: <b>${prettyLabelInd(d.x)}</b><br/>
            Variabel B: <b>${prettyLabelInd(d.y)}</b>
          </div>
          <div style="margin-bottom: 0.6rem; display: flex; align-items: baseline; gap: 0.4rem;">
            <span style="color: #94a3b8; font-size: 0.85rem;">Koefisien Pearson (r):</span>
            <b style="font-size: 1.25rem; color: #ffffff; font-weight: 800;">${valStr}</b>
          </div>
          <div style="background: rgba(255,255,255,0.035); border-radius: 4px; padding: 0.5rem; font-size: 0.8rem; border-left: 3px solid ${cellColor}; color: #cbd5e1; line-height: 1.4;">
            ${descText}
          </div>
        </div>
      `;

      showTip(ev, htmlContent);
    })
    .on("mousemove", (ev) => { showTip(ev, null); })
    .on("mouseout", function() { d3.select(this).attr("stroke","none"); hideTip(); })
    .transition().duration(500).delay(d => (d.xi + d.yi) * 6)
    .attr("fill", d => colorFn(d.v));

  // Teks nilai korelasi di dalam sel
  svg.selectAll(".hm-txt").data(hd).enter().append("text")
    .attr("x", d => xScale(d.x) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d.y) + yScale.bandwidth() / 2 + 3.5)
    .attr("text-anchor","middle")
    .style("font-size", "10px") // Ukuran font angka korelasi
    .style("font-weight","600").style("pointer-events","none")
    .attr("fill", "#ffffff")
    .attr("opacity", 0)
    .text(d => d.v === 1 ? "1.0" : d.v.toFixed(2))
    .transition().duration(500).delay(d => (d.xi + d.yi) * 6 + 200)
    .attr("opacity", 1);

  // Cari pasangan korelasi terkuat untuk insight
  let maxCorr = -1, maxP1 = "", maxP2 = "";
  hd.forEach(h => {
    if (h.x !== h.y && Math.abs(h.v) > maxCorr) { maxCorr = Math.abs(h.v); maxP1 = h.x; maxP2 = h.y; }
  });
  d3.select("#insight-heatmap").html(`<strong>Hubungan Terkuat:</strong> Faktor pemicu burnout dengan korelasi terkuat (di luar korelasi mandiri) terjadi antara <b>${prettyLabelInd(maxP1)}</b> dan <b>${prettyLabelInd(maxP2)}</b> dengan koefisien korelasi sebesar <b>r = ${maxCorr.toFixed(3)}</b>.`);
}

// Visualisasi 2: Donut Chart Efektivitas Bantuan Mental
function renderDonutChart(data) {
  const container = d3.select("#donut-mental-chart");
  const cw = container.node().getBoundingClientRect().width;
  const totalH = 400; // Setel tinggi donut chart

  const svg = container.append("svg").attr("width", cw).attr("height", totalH);

  const bLevels = ["Low","Medium","High"];
  const bColors = {"Low":"#10b981","Medium":"#fbbf24","High":"#ef4444"};
  const levelTranslations = {Low: "Burnout Rendah", Medium: "Burnout Sedang", High: "Burnout Tinggi"};
  const groups = ["Yes","No"];
  const groupTitles = {"Yes":"Konsultasi dengan Ahli","No":"Mengelola Secara Mandiri"};

  // Ukuran radius luar dan dalam donat
  const donutR = Math.min((cw - 60) / 4.4, 102); // RADIUS diperbesar dari 92 ke 102
  const innerR = donutR * 0.58;

  const pie = d3.pie().value(d => d.count).sort(null).padAngle(0.03);
  const arc = d3.arc().innerRadius(innerR).outerRadius(donutR).cornerRadius(4);
  const arcHover = d3.arc().innerRadius(innerR - 2).outerRadius(donutR + 6).cornerRadius(4);

  // Kalkulasi statistik untuk komparasi di tooltip
  const yesSubGlobal = data.filter(d => d.seeks_mental_health_support === "Yes");
  const noSubGlobal = data.filter(d => d.seeks_mental_health_support === "No");
  const yesTotal = yesSubGlobal.length || 1;
  const noTotal = noSubGlobal.length || 1;

  const yesCounts = {
    Low: yesSubGlobal.filter(d => d.burnout_level === "Low").length,
    Medium: yesSubGlobal.filter(d => d.burnout_level === "Medium").length,
    High: yesSubGlobal.filter(d => d.burnout_level === "High").length
  };
  const noCounts = {
    Low: noSubGlobal.filter(d => d.burnout_level === "Low").length,
    Medium: noSubGlobal.filter(d => d.burnout_level === "Medium").length,
    High: noSubGlobal.filter(d => d.burnout_level === "High").length
  };

  const yesPcts = {
    Low: (yesCounts.Low / yesTotal) * 100,
    Medium: (yesCounts.Medium / yesTotal) * 100,
    High: (yesCounts.High / yesTotal) * 100
  };
  const noPcts = {
    Low: (noCounts.Low / noTotal) * 100,
    Medium: (noCounts.Medium / noTotal) * 100,
    High: (noCounts.High / noTotal) * 100
  };

  groups.forEach((support, idx) => {
    const cx = cw * (idx === 0 ? 0.28 : 0.72);
    const cy = totalH / 2 - 15; // cy disesuaikan menjadi 185 (ditengah tinggi 400)
    const g = svg.append("g").attr("transform",`translate(${cx},${cy})`);

    const subset = data.filter(d => d.seeks_mental_health_support === support);
    const total = subset.length;
    const pieData = bLevels.map(lv => ({ level: lv, count: subset.filter(d => d.burnout_level === lv).length }));
    const arcs = pie(pieData);

    // Gambar potongan irisan donat
    g.selectAll(".slice").data(arcs).enter().append("path")
      .attr("class","donut-slice")
      .attr("d", arc)
      .attr("fill", d => bColors[d.data.level])
      .attr("stroke","rgba(6,9,19,0.9)").attr("stroke-width",2)
      .on("mouseover", function(ev, d) {
        d3.select(this).transition().duration(120).attr("d", arcHover);
        
        const pct = ((d.data.count / total) * 100).toFixed(1);
        const grpText = support === 'Yes' ? '🩺 KONSUL (Dukungan Ahli)' : '💻 MANDIRI (Mengelola Sendiri)';
        const lvlColor = bColors[d.data.level];
        const lvlName = levelTranslations[d.data.level];
        const countStr = d.data.count.toLocaleString("id-ID");

        let descText = "";
        if (d.data.level === "Low") {
          descText = "🌱 <b>Keseimbangan Prima:</b> Mental prima, tingkat stres rendah, motivasi terjaga tinggi, dan jam tidur harian sangat mencukupi.";
        } else if (d.data.level === "Medium") {
          descText = "⚠️ <b>Zona Peringatan:</b> Mengalami tingkat stres sedang dan kelelahan mental transisi. Perlu waspada dan meluangkan waktu istirahat.";
        } else {
          descText = "🚨 <b>Fase Kritis (Burnout):</b> Mengalami stres kronis ekstrem, kelelahan fisik-mental akut, serta risiko kegagalan bisnis sangat tinggi.";
        }

        const currentPct = parseFloat(pct);
        const otherPct = support === "Yes" ? noPcts[d.data.level] : yesPcts[d.data.level];
        
        let compText = "";
        if (d.data.level === "High") {
          if (support === "No") {
            const factor = (currentPct / Math.max(0.1, otherPct)).toFixed(1);
            compText = `📈 <b>Komparasi:</b> Tanpa konsul ahli, burnout parah kelompok MANDIRI (<b>${currentPct}%</b>) melonjak hingga <span style="color:#ef4444; font-weight:700;">${factor}x lipat lebih tinggi</span> dibanding kelompok KONSUL (<b>${otherPct.toFixed(1)}%</b>).`;
          } else {
            const factor = (otherPct / Math.max(0.1, currentPct)).toFixed(1);
            compText = `📉 <b>Komparasi:</b> Konsultasi psikologis sukses menekan burnout parah menjadi hanya <b>${currentPct}%</b> (<span style="color:#10b981; font-weight:700;">${factor}x lebih rendah</span> dibanding kelompok MANDIRI: <b>${otherPct.toFixed(1)}%</b>).`;
          }
        } else if (d.data.level === "Low") {
          if (support === "Yes") {
            const factor = (currentPct / Math.max(0.1, otherPct)).toFixed(1);
            compText = `🏆 <b>Komparasi:</b> Kebugaran mental optimal kelompok KONSUL (<b>${currentPct}%</b>) adalah <span style="color:#10b981; font-weight:700;">${factor}x lebih tinggi</span> dibanding kelompok MANDIRI (<b>${otherPct.toFixed(1)}%</b>).`;
          } else {
            const factor = (otherPct / Math.max(0.1, currentPct)).toFixed(1);
            compText = `📉 <b>Komparasi:</b> Kebugaran mental prima pada kelompok MANDIRI tertinggal (hanya <b>${currentPct}%</b>) dibanding kelompok KONSUL yang mencapai <b>${otherPct.toFixed(1)}%</b>.`;
          }
        } else {
          compText = `📊 <b>Perbandingan Zona Sedang:</b> Kelompok KONSUL (<b>${yesPcts.Medium.toFixed(1)}%</b>) vs kelompok MANDIRI (<b>${noPcts.Medium.toFixed(1)}%</b>).`;
        }

        const htmlContent = `
          <div style="font-family: inherit; font-size: 0.88rem; line-height: 1.5; color: #f1f5f9; min-width: 280px; max-width: 320px; padding: 0.2rem;">
            <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
              <span style="font-weight: 800; color: #e2e8f0; font-size: 0.85rem; letter-spacing: 0.3px;">${grpText}</span>
              <span style="background: ${lvlColor}15; color: ${lvlColor}; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; border: 1px solid ${lvlColor}30; white-space: nowrap; letter-spacing: 0.2px;">${lvlName}</span>
            </div>
            <div style="margin-bottom: 0.6rem; display: flex; align-items: baseline; gap: 0.4rem;">
              <span style="color: #94a3b8; font-size: 0.85rem;">Rasio Kelompok:</span>
              <b style="font-size: 1.25rem; color: #ffffff; font-weight: 800;">${pct}%</b>
              <span style="color: #94a3b8; font-size: 0.8rem; margin-left: 0.2rem;">(${countStr} founder)</span>
            </div>
            <div style="background: rgba(255,255,255,0.035); border-radius: 4px; padding: 0.5rem; font-size: 0.8rem; border-left: 3px solid ${lvlColor}; margin-bottom: 0.6rem; color: #cbd5e1; line-height: 1.4;">
              ${descText}
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 0.5rem; line-height: 1.4;">
              ${compText}
            </div>
          </div>
        `;

        showTip(ev, htmlContent);
      })
      .on("mousemove", (ev) => { showTip(ev, null); })
      .on("mouseout", function() {
        d3.select(this).transition().duration(120).attr("d", arc);
        hideTip();
      });

    // Teks label persentase irisan
    g.selectAll(".pct-label").data(arcs).enter().append("text")
      .attr("class", "pct-label")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor","middle").attr("dy","0.35em")
      .style("font-size","11px").style("font-weight","700").style("pointer-events","none")
      .attr("fill","#ffffff")
      .text(d => {
        const pct = (d.data.count / total) * 100;
        return pct > 7 ? pct.toFixed(0) + "%" : "";
      });

    // Teks di pusat lingkaran donat
    g.append("text").attr("text-anchor","middle").attr("dy","-0.25em")
      .attr("fill","#ffffff").style("font-size","18px").style("font-weight","800")
      .text(support === "Yes" ? "KONSUL" : "MANDIRI");
    
    g.append("text").attr("text-anchor","middle").attr("dy","1.2em")
      .attr("fill","#94a3b8").style("font-size","10.5px").style("font-weight","500")
      .text(`(${total.toLocaleString("id-ID")} org)`);

    // Judul kelompok di bawah donat
    g.append("text").attr("text-anchor","middle").attr("y", donutR + 25)
      .attr("fill","#ffffff").style("font-size","12.5px").style("font-weight","700")
      .text(groupTitles[support]);
  });

  // Gambar legenda tingkat burnout
  const lgY = totalH - 18;
  const lgW = 3 * 135; // 3 items with 135px spacing
  const lgX = (cw - lgW) / 2 + 10;
  const lgG = svg.append("g").attr("transform",`translate(${lgX}, ${lgY})`);
  bLevels.forEach((lv, i) => {
    const g = lgG.append("g").attr("transform",`translate(${i * 135}, 0)`);
    g.append("rect").attr("width",11).attr("height",11).attr("rx",2.5).attr("fill",bColors[lv]);
    g.append("text").attr("x",16).attr("y",9.5).attr("fill","#94a3b8").style("font-size","11px").style("font-weight","600")
      .text(levelTranslations[lv]);
  });

  // Buat insight efektivitas bantuan mental
  const yesPct = yesTotal ? (yesCounts.High / yesTotal) * 100 : 0;
  const noPct = noTotal ? (noCounts.High / noTotal) * 100 : 0;
  const diffMultiplier = yesPct ? (noPct / yesPct).toFixed(1) : "0.0";
  
  d3.select("#insight-donut").html(`<strong>Dampak Kesehatan Mental:</strong> Tingkat burnout parah pada founder yang menolak konsultasi ahli mencapai <b>${noPct.toFixed(1)}%</b>, yaitu <b>${diffMultiplier}x lipat lebih tinggi</b> dibanding founder yang mencari dukungan psikologis profesional (<b>${yesPct.toFixed(1)}%</b>).`);
}
