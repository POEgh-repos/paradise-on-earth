import { useEffect, useRef } from "react";

export default function GalaxyBackground() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf, t = 0;
    const stars = Array.from({ length: 520 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      speed: Math.random() * 0.00008 + 0.00002,
      twinkle: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.06,
      layer: Math.floor(Math.random() * 3),
    }));
    const shoots = [];
    const addShoot = () => {
      shoots.push({ x: Math.random(), y: Math.random() * 0.5, len: 0.08 + Math.random() * 0.1, life: 1, angle: Math.PI / 6 + Math.random() * 0.4 });
    };
    let shootTimer = setInterval(addShoot, 4200);

    const draw = () => {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      // Deep space gradient
      const g = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.38, W * 0.72);
      g.addColorStop(0, "#0e0b1a");
      g.addColorStop(0.6, "#07060f");
      g.addColorStop(1, "#04040a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Nebula wisps
      [[0.3, 0.2, 0.28, "rgba(80,40,120,0.045)"], [0.7, 0.6, 0.22, "rgba(40,80,120,0.04)"], [0.5, 0.8, 0.18, "rgba(120,60,40,0.035)"]].forEach(([rx, ry, rr, col]) => {
        const ng = ctx.createRadialGradient(W * rx, H * ry, 0, W * rx, H * ry, W * rr);
        ng.addColorStop(0, col); ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);
      });

      // Stars
      stars.forEach(s => {
        const px = (s.x + s.layer * 0.001 * t) % 1;
        const py = s.y;
        const twink = 0.5 + 0.5 * Math.sin(t * 0.8 + s.twinkle);
        ctx.beginPath();
        ctx.arc(px * W, py * H, s.r * (s.gold ? 1.4 : 1), 0, Math.PI * 2);
        if (s.gold) {
          ctx.fillStyle = `rgba(201,169,110,${0.55 + 0.45 * twink})`;
          if (s.r > 1.2) {
            ctx.shadowBlur = 8; ctx.shadowColor = "#c9a96e88";
          }
        } else {
          ctx.fillStyle = `rgba(220,218,240,${0.25 + 0.55 * twink})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Shooting stars
      shoots.forEach((sh, i) => {
        sh.life -= 0.016;
        if (sh.life <= 0) { shoots.splice(i, 1); return; }
        const sx = sh.x * W, sy = sh.y * H;
        const ex = sx + Math.cos(sh.angle) * sh.len * W;
        const ey = sy + Math.sin(sh.angle) * sh.len * H;
        const sg = ctx.createLinearGradient(sx, sy, ex, ey);
        sg.addColorStop(0, `rgba(255,255,255,0)`);
        sg.addColorStop(0.5, `rgba(255,255,255,${sh.life * 0.8})`);
        sg.addColorStop(1, `rgba(201,169,110,0)`);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
        ctx.strokeStyle = sg; ctx.lineWidth = 1.2; ctx.stroke();
      });

      t += 0.4;
      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      c.width  = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(shootTimer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={ref} style={{
      position: "fixed", inset: 0, zIndex: 0,
      width: "100%", height: "100%", pointerEvents: "none",
    }} />
  );
}
