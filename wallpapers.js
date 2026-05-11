// ── WALLPAPER DEFINITIONS ──
// Elke wallpaper heeft: id, name, tag, en een draw(ctx, w, h, t) functie

const WALLPAPERS = [
  {
    id: "stars",
    name: "Sterren",
    tag: "ruimte",
    _data: null,
    init(w, h) {
      this._data = Array.from({ length: 150 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        speed: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
      }));
    },
    draw(ctx, w, h, t) {
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, w, h);

      if (!this._data || this._data[0].x > w * 1.5) this.init(w, h);

      this._data.forEach(s => {
        const blink = 0.5 + 0.5 * Math.sin(t * s.speed * 2 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.35 + blink * 0.65})`;
        ctx.fill();
      });

      const grd = ctx.createRadialGradient(w * 0.5, h * 0.75, 0, w * 0.5, h * 0.75, w * 0.6);
      grd.addColorStop(0, "rgba(80,40,180,0.3)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    },
  },

  {
    id: "particles",
    name: "Particles",
    tag: "verbonden",
    _pts: null,
    init(w, h) {
      this._pts = Array.from({ length: 55 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      }));
    },
    draw(ctx, w, h, t) {
      ctx.fillStyle = "rgba(7,8,15,0.18)";
      ctx.fillRect(0, 0, w, h);

      if (!this._pts) this.init(w, h);

      this._pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      const maxDist = Math.min(w, h) * 0.22;
      for (let i = 0; i < this._pts.length; i++) {
        for (let j = i + 1; j < this._pts.length; j++) {
          const a = this._pts[i], b = this._pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(127,119,221,${(1 - d / maxDist) * 0.6})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      this._pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#AFA9EC";
        ctx.fill();
      });
    },
  },

  {
    id: "waves",
    name: "Golven",
    tag: "vloeiend",
    draw(ctx, w, h, t) {
      ctx.fillStyle = "#030c1a";
      ctx.fillRect(0, 0, w, h);

      const layers = [
        { color: [24, 95, 165], speed: 0.5, freq: 0.012, amp: 0.07, yBase: 0.55 },
        { color: [15, 110, 86],  speed: 0.7, freq: 0.016, amp: 0.06, yBase: 0.65 },
        { color: [83, 74, 183],  speed: 0.9, freq: 0.01,  amp: 0.08, yBase: 0.72 },
      ];

      layers.forEach(l => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
          const y = h * l.yBase + Math.sin(x * l.freq + t * l.speed) * h * l.amp
                    + Math.sin(x * l.freq * 2.3 + t * l.speed * 1.4) * h * l.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(${l.color[0]},${l.color[1]},${l.color[2]},0.35)`;
        ctx.fill();
      });
    },
  },

  {
    id: "matrix",
    name: "Matrix",
    tag: "code",
    _drops: null,
    _chars: "アイウエオカキクケコサシスセソ01アBCDEF!?#@",
    init(w, h) {
      const cols = Math.floor(w / 18);
      this._drops = Array.from({ length: cols }, () => ({
        col: 0,
        y: Math.random() * (h / 18),
        speed: Math.random() * 0.4 + 0.3,
      })).map((d, i) => ({ ...d, col: i }));
    },
    draw(ctx, w, h, t) {
      ctx.fillStyle = "rgba(0,8,0,0.16)";
      ctx.fillRect(0, 0, w, h);

      if (!this._drops) this.init(w, h);

      const size = Math.max(12, Math.floor(w / 55));
      ctx.font = `${size}px 'Space Mono', monospace`;

      this._drops.forEach(d => {
        const x = d.col * (size + 4);
        const yPx = d.y * (size + 4);

        ctx.fillStyle = "#9FE1CB";
        ctx.fillText(this._chars[Math.floor(Math.random() * this._chars.length)], x, yPx);

        ctx.fillStyle = "#1D9E75";
        for (let trail = 1; trail < 6; trail++) {
          const ty = yPx - trail * (size + 4);
          if (ty > 0) {
            ctx.globalAlpha = (6 - trail) / 6 * 0.7;
            ctx.fillText(this._chars[Math.floor(Math.random() * this._chars.length)], x, ty);
          }
        }
        ctx.globalAlpha = 1;

        d.y += d.speed;
        if (d.y * (size + 4) > h + 100 && Math.random() > 0.975) d.y = 0;
      });
    },
  },

  {
    id: "aurora",
    name: "Aurora",
    tag: "kleur",
    _stars: null,
    init(w, h) {
      this._stars = Array.from({ length: 100 }, () => ({
        x: Math.random() * w, y: Math.random() * h * 0.6,
        r: Math.random() * 1.2 + 0.2,
        speed: Math.random() * 0.4 + 0.2,
        phase: Math.random() * Math.PI * 2,
      }));
    },
    draw(ctx, w, h, t) {
      ctx.fillStyle = "#010510";
      ctx.fillRect(0, 0, w, h);

      if (!this._stars) this.init(w, h);

      this._stars.forEach(s => {
        const b = 0.3 + 0.7 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b * 0.7})`;
        ctx.fill();
      });

      const bands = [
        { color: [93, 202, 165], phaseOff: 0,   yFrac: 0.42 },
        { color: [127, 119, 221], phaseOff: 1.1, yFrac: 0.50 },
        { color: [212, 83, 126],  phaseOff: 2.2, yFrac: 0.58 },
      ];

      bands.forEach((band, bi) => {
        for (let pass = 0; pass < 3; pass++) {
          ctx.beginPath();
          ctx.moveTo(0, h);
          for (let x = 0; x <= w; x += 4) {
            const y = h * (band.yFrac + pass * 0.04)
                      + Math.sin(x * 0.007 + t * 0.35 + band.phaseOff + pass) * h * 0.07
                      + Math.sin(x * 0.02 + t * 0.6 + pass * 1.3) * h * 0.03;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();
          const [r, g, b] = band.color;
          ctx.fillStyle = `rgba(${r},${g},${b},${0.07 - pass * 0.015})`;
          ctx.fill();
        }
      });
    },
  },

  {
    id: "plasma",
    name: "Plasma",
    tag: "abstract",
    _buf: null,
    draw(ctx, w, h, t) {
      const scale = 4;
      const sw = Math.floor(w / scale);
      const sh = Math.floor(h / scale);

      if (!this._buf || this._buf.width !== sw) {
        this._buf = document.createElement("canvas");
        this._buf.width = sw;
        this._buf.height = sh;
      }

      const bc = this._buf.getContext("2d");
      const imgd = bc.createImageData(sw, sh);
      const d = imgd.data;

      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const nx = x / sw, ny = y / sh;
          const v = Math.sin(nx * 6 + t)
                  + Math.sin(ny * 6 + t * 0.7)
                  + Math.sin((nx + ny) * 5 + t * 1.3)
                  + Math.sin(Math.sqrt(nx * nx + ny * ny) * 8 + t);
          const r = Math.floor(127 + 127 * Math.sin(v * Math.PI));
          const g = Math.floor(127 + 127 * Math.sin(v * Math.PI + 2.094));
          const b2 = Math.floor(127 + 127 * Math.sin(v * Math.PI + 4.189));
          const idx = (y * sw + x) * 4;
          d[idx] = r; d[idx + 1] = g; d[idx + 2] = b2; d[idx + 3] = 255;
        }
      }

      bc.putImageData(imgd, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this._buf, 0, 0, w, h);
    },
  },
];
