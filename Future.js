// Future projection: today's decisions -> next 10 years (adds a new section; does not touch old code)
(() => {
  const KEY = 'brahmanda_recent_v1';
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}

  const sec = document.createElement('section');
  sec.className = 'w-full max-w-lg bg-slate-900/90 border border-slate-800 p-3 rounded-xl mb-3';
  sec.innerHTML = `
    <h2 class="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">🦋 आज के निर्णय का असर: अगले 10 वर्ष</h2>
    <svg id="fx-chart" viewBox="0 0 300 110" class="w-full bg-slate-950 rounded-lg border border-slate-800"></svg>
    <div class="flex gap-3 text-[10px] mt-1.5">
      <span style="color:#22d3ee">● ज्ञान</span><span style="color:#c084fc">● कर्म</span><span style="color:#fbbf24">● संसाधन</span>
    </div>
    <p id="fx-note" class="text-[11px] text-slate-300 leading-relaxed mt-2"></p>`;
  document.getElementById('future-text').closest('section').after(sec);

  const share = k => recent.length ? recent.filter(x => x === k).length / recent.length : 0;

  function project() {
    const p = Engine.player;
    let K = p.knowledge, C = p.karma, W = p.wealth;
    const pts = [{ K, C, W }];
    for (let y = 1; y <= 10; y++) {
      K += 14 * share('research') + 2;
      C += 8 * share('research') + 4 * share('build') + 7 * share('meditate') - 16 * share('exploit');
      W += 30000 * share('build') + 90000 * share('exploit') + 8000;
      if (C < -20) W *= 0.8;        // बुरे कर्म का विलंबित फल: साख और संसाधन गिरते हैं
      else if (C > 20) W *= 1.08;   // अच्छे कर्म से भरोसा और अवसर बढ़ते हैं
      pts.push({ K, C, W });
    }
    return pts;
  }

  function line(vals, color) {
    const min = Math.min(...vals), max = Math.max(...vals), span = (max - min) || 1;
    const d = vals.map((v, i) => `${(10 + i * 28).toFixed(1)},${(100 - ((v - min) / span) * 85).toFixed(1)}`).join(' ');
    return `<polyline points="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
  }

  function render() {
    const pts = project(), last = pts[10];
    let grid = '';
    for (let i = 0; i <= 10; i += 5) grid += `<text x="${10 + i * 28}" y="108" font-size="7" fill="#64748b" text-anchor="middle">+${i}व</text>`;
    document.getElementById('fx-chart').innerHTML = grid +
      line(pts.map(p => p.K), '#22d3ee') + line(pts.map(p => p.C), '#c084fc') + line(pts.map(p => p.W), '#fbbf24');
    let note;
    if (!recent.length) note = 'अभी कोई निर्णय नहीं लिया गया। ऊपर से कोई कर्म चुनिए और देखिए कि 10 साल की रेखाएँ कैसे मुड़ती हैं।';
    else if (last.C < -20) note = `⚠️ इसी राह पर 10 साल बाद कर्म ${Math.round(last.C)} होगा। शुरू में धन बढ़ता दिखता है, पर साख गिरने से संसाधन टूटने लगते हैं। दिशा बदलने के लिए शोध, ईमानदार निर्माण और ध्यान बढ़ाइए।`;
    else if (last.C > 20) note = `🌟 इसी राह पर 10 साल बाद ज्ञान ≈ ${Math.round(last.K)}, कर्म ≈ ${Math.round(last.C)} और संसाधन ≈ ₹${Math.round(last.W / 1000)}K। भरोसा और अवसर साथ-साथ बढ़ रहे हैं।`;
    else note = `⏳ इसी राह पर 10 साल बाद ज्ञान ≈ ${Math.round(last.K)}, कर्म ≈ ${Math.round(last.C)}। भविष्य अभी खुला है; अगले कुछ निर्णय दिशा तय करेंगे।`;
    document.getElementById('fx-note').textContent = note + ` (पिछले ${recent.length} निर्णयों के आधार पर)`;
  }

  // wrap the existing Engine.act instead of editing it
  const original = Engine.act.bind(Engine);
  Engine.act = function (choice) {
    original(choice);
    recent.push(choice);
    if (recent.length > 10) recent.shift();
    try { localStorage.setItem(KEY, JSON.stringify(recent)); } catch (e) {}
    render();
  };
  render();
})();
