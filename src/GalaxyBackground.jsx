import { useEffect, useRef } from "react";

export default function GalaxyBackground() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, W, H;
    const LAYERS = [
      { count:340, speed:0.005, minR:0.15, maxR:0.6,  baseAlpha:0.45 },
      { count:180, speed:0.010, minR:0.35, maxR:1.0,  baseAlpha:0.65 },
      { count: 60, speed:0.018, minR:0.6,  maxR:1.5,  baseAlpha:0.85 },
      { count: 14, speed:0.026, minR:1.0,  maxR:2.0,  baseAlpha:1.00 },
    ];
    const NEBULAE = [
      { rx:0.18, ry:0.20, rw:220, rh:130, col:"rgba(70,35,110,0.042)" },
      { rx:0.76, ry:0.62, rw:260, rh:150, col:"rgba(25,55,95,0.038)"  },
      { rx:0.48, ry:0.88, rw:320, rh:110, col:"rgba(90,45,25,0.030)"  },
      { rx:0.88, ry:0.14, rw:170, rh:190, col:"rgba(35,70,70,0.038)"  },
    ];
    let stars = [];
    const rand = (a, b) => a + Math.random() * (b - a);
    const build = () => {
      stars = [];
      LAYERS.forEach((L, li) => {
        for (let i = 0; i < L.count; i++) {
          stars.push({ x:Math.random()*W, y:Math.random()*H, r:rand(L.minR,L.maxR), speed:L.speed, baseAlpha:L.baseAlpha, tOff:Math.random()*Math.PI*2, tSpd:rand(0.003,0.016), gold:li>=2&&Math.random()<0.16, layer:li });
        }
      });
    };
    const resize = () => { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; build(); };
    resize();
    window.addEventListener("resize", resize);
    let t = 0;
    const frame = () => {
      t += 0.010;
      const bg = ctx.createRadialGradient(W*.5,H*.38,0,W*.5,H*.38,Math.max(W,H)*.92);
      bg.addColorStop(0,"#0b0916"); bg.addColorStop(0.5,"#06050f"); bg.addColorStop(1,"#030308");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      NEBULAE.forEach(n => {
        const px=n.rx*W, py=n.ry*H;
        ctx.save(); ctx.scale(1,n.rh/n.rw);
        const g=ctx.createRadialGradient(px,py*(n.rw/n.rh),0,px,py*(n.rw/n.rh),n.rw);
        g.addColorStop(0,n.col); g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py*(n.rw/n.rh),n.rw,0,Math.PI*2); ctx.fill(); ctx.restore();
      });
      stars.forEach(s => {
        s.y+=s.speed; if(s.y>H+3){s.y=-3;s.x=Math.random()*W;}
        const twinkle=0.52+0.48*Math.sin(t*s.tSpd*55+s.tOff);
        const a=s.baseAlpha*twinkle;
        ctx.save(); ctx.globalAlpha=a;
        if(s.gold){
          const glow=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*5);
          glow.addColorStop(0,`rgba(220,185,105,${a*.55})`); glow.addColorStop(0.5,`rgba(200,165,80,${a*.12})`); glow.addColorStop(1,"rgba(0,0,0,0)");
          ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*5,0,Math.PI*2); ctx.fill();
          ctx.fillStyle=`rgba(255,242,195,${a})`;
        } else { ctx.fillStyle=`rgba(218,225,255,${a})`; }
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
        if(s.layer===3){
          ctx.globalAlpha=a*0.22; ctx.strokeStyle=s.gold?"rgba(255,215,130,0.7)":"rgba(195,215,255,0.6)"; ctx.lineWidth=0.5;
          const spk=s.r*7; ctx.beginPath(); ctx.moveTo(s.x-spk,s.y); ctx.lineTo(s.x+spk,s.y); ctx.moveTo(s.x,s.y-spk); ctx.lineTo(s.x,s.y+spk); ctx.stroke();
        }
        ctx.restore();
      });
      if(Math.random()<0.001){
        const sx=Math.random()*W*.8,sy=Math.random()*H*.45,len=rand(55,130);
        const gr=ctx.createLinearGradient(sx,sy,sx+len*.7,sy+len*.4);
        gr.addColorStop(0,"rgba(255,255,255,0)"); gr.addColorStop(.5,"rgba(255,248,225,.65)"); gr.addColorStop(1,"rgba(255,255,255,0)");
        ctx.save(); ctx.globalAlpha=.65; ctx.strokeStyle=gr; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+len*.7,sy+len*.4); ctx.stroke(); ctx.restore();
      }
      animId=requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize",resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",display:"block"}} />;
}
