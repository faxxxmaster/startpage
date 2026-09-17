customElements.define('time-rings', class extends HTMLElement {
  connectedCallback(){
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap');

        :host{
          --bg: transparent;
          --text-primary: #ECEFF4;
          --text-secondary: #7C87A3;
          --track: rgba(255,255,255,0.07);
          --c-sek: #4FD8C4;
          --c-min: #4EA8F0;
          --c-std: #9B7FF0;
          --c-tag: #E86FC0;
          --c-jahr: #F2C94C;

          display: block;
          color: var(--text-primary);
          font-family: 'IBM Plex Sans', sans-serif;
        }

        *{ box-sizing: border-box; }

        .stage{
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }

        .dial-wrap{
          position: relative;
          width: 100%;
          max-width: 420px;
          aspect-ratio: 1 / 1;
        }

        svg{
          width: 100%;
          height: 100%;
          display: block;
          transform: rotate(-90deg);
        }

        .ring-track{ fill: none; stroke: var(--track); stroke-width: 15; }
        .ring-progress{
          fill: none;
          stroke-width: 15;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.9s linear;
        }

        .center{
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .center-inner{
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 58%;
          text-align: center;
        }

        .clock{
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 500;
          font-size: clamp(16px, 3.6vw, 24px);
          letter-spacing: 0.02em;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .date{
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: clamp(9px, 1.7vw, 11px);
          color: var(--text-secondary);
        }

        .legend{
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px 14px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
        }

        .legend-item{ display: flex; align-items: baseline; gap: 6px; color: var(--text-secondary); }
        .dot{ width: 7px; height: 7px; border-radius: 50%; display: inline-block; transform: translateY(-1px); }
        .legend-value{ color: var(--text-primary); }

        @media (prefers-reduced-motion: reduce){
          .ring-progress{ transition: none; }
        }
      </style>

      <div class="stage">
        <div class="dial-wrap">
          <svg viewBox="0 0 640 640">
            <circle class="ring-track" cx="320" cy="320" r="110"></circle>
            <circle class="ring-track" cx="320" cy="320" r="152"></circle>
            <circle class="ring-track" cx="320" cy="320" r="194"></circle>
            <circle class="ring-track" cx="320" cy="320" r="236"></circle>
            <circle class="ring-track" cx="320" cy="320" r="278"></circle>

            <circle data-ring="sek"   class="ring-progress" cx="320" cy="320" r="110" stroke="var(--c-sek)"></circle>
            <circle data-ring="min"   class="ring-progress" cx="320" cy="320" r="152" stroke="var(--c-min)"></circle>
            <circle data-ring="std"   class="ring-progress" cx="320" cy="320" r="194" stroke="var(--c-std)"></circle>
            <circle data-ring="tag"   class="ring-progress" cx="320" cy="320" r="236" stroke="var(--c-tag)"></circle>
            <circle data-ring="jahr"  class="ring-progress" cx="320" cy="320" r="278" stroke="var(--c-jahr)"></circle>
          </svg>

          <div class="center">
            <div class="center-inner">
              <div class="clock" data-out="clock">00:00:00</div>
              <div class="date" data-out="date">–</div>
            </div>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item"><span class="dot" style="background:var(--c-sek)"></span>sek&nbsp;<span class="legend-value" data-out="v-sek">–</span></div>
          <div class="legend-item"><span class="dot" style="background:var(--c-min)"></span>min&nbsp;<span class="legend-value" data-out="v-min">–</span></div>
          <div class="legend-item"><span class="dot" style="background:var(--c-std)"></span>std&nbsp;<span class="legend-value" data-out="v-std">–</span></div>
          <div class="legend-item"><span class="dot" style="background:var(--c-tag)"></span>tag&nbsp;<span class="legend-value" data-out="v-tag">–</span></div>
          <div class="legend-item"><span class="dot" style="background:var(--c-jahr)"></span>jahr&nbsp;<span class="legend-value" data-out="v-jahr">–</span></div>
        </div>
      </div>
    `;

    const RADII = { sek: 110, min: 152, std: 194, tag: 236, jahr: 278 };
    const CIRC = {};
    for (const k in RADII) CIRC[k] = 2 * Math.PI * RADII[k];
    for (const k in CIRC) shadow.querySelector(`[data-ring="${k}"]`).style.strokeDasharray = CIRC[k];

    const out = (key) => shadow.querySelector(`[data-out="${key}"]`);
    const pad = (n) => n.toString().padStart(2, '0');
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const dayOfYearFraction = (now) => {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear() + 1, 0, 1);
      return (now - start) / (end - start);
    };
    const setRing = (key, fraction) => {
      const c = CIRC[key];
      shadow.querySelector(`[data-ring="${key}"]`).style.strokeDashoffset = c * (1 - fraction);
    };

    const tick = () => {
      const now = new Date();
      const secFrac  = now.getSeconds() / 60;
      const minFrac  = (now.getMinutes() * 60 + now.getSeconds()) / 3600;
      const hourFrac = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
      const dim      = daysInMonth(now.getFullYear(), now.getMonth());
      const dayFrac  = ((now.getDate() - 1) + hourFrac) / dim;
      const yearFrac = dayOfYearFraction(now);

      setRing('sek', secFrac);
      setRing('min', minFrac);
      setRing('std', hourFrac);
      setRing('tag', dayFrac);
      setRing('jahr', yearFrac);

      out('clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      out('date').textContent = now.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      out('v-sek').textContent = `${now.getSeconds()}/60`;
      out('v-min').textContent = `${now.getMinutes()}/60`;
      out('v-std').textContent = `${now.getHours()}/24`;
      out('v-tag').textContent = `${now.getDate()}/${dim}`;
      out('v-jahr').textContent = `${Math.round(yearFrac * 100)}%`;
    };

    tick();
    this._interval = setInterval(tick, 1000);
  }

  disconnectedCallback(){
    clearInterval(this._interval);
  }
});
