// ── PARADISE on Earth — Design Tokens & Shared Primitives ────────────────────

export const T = {
  bg:       "#06060e",
  surface:  "rgba(12,11,22,0.78)",
  surfaceH: "rgba(18,16,32,0.96)",
  border:   "rgba(255,255,255,0.09)",
  borderG:  "rgba(201,169,110,0.24)",
  gold:     "#c9a96e",
  goldSoft: "rgba(201,169,110,0.13)",
  white:    "#f2ede7",
  muted:    "#7a7690",
  dim:      "#2e2a40",
  font:     "'Cormorant Garamond', Georgia, serif",
  sans:     "'Tenor Sans', sans-serif",
  mono:     "'DM Mono', monospace",
  green:    "#6aaa88",
  red:      "#c46a6a",
  flag:     "#e0a030",
  ease:     "cubic-bezier(0.25,0.46,0.45,0.94)",
  spring:   "cubic-bezier(0.34,1.56,0.64,1)",
  smooth:   "cubic-bezier(0.4,0,0.2,1)",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Tenor+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html {
    scroll-behavior: smooth;
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  body {
    background: ${T.bg};
    color: ${T.white};
    font-family: ${T.sans};
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    /* Smooth rendering on all platforms */
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1;
  }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.dim}; border-radius: 2px; }
  input, textarea, select, button { font-family: ${T.sans}; }
  input::placeholder, textarea::placeholder { color: ${T.muted}; }
  img { max-width: 100%; display: block; }
  a { color: ${T.gold}; text-decoration: none; }
  /* Safe area insets for notched phones */
  body { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); }

  /* ── Keyframes (hardware-accelerated: only transform + opacity) ── */
  @keyframes fadeUp    { from{opacity:0;transform:translate3d(0,20px,0)} to{opacity:1;transform:translate3d(0,0,0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes fadeOut   { to{opacity:0;pointer-events:none} }
  @keyframes scaleIn   { from{opacity:0;transform:scale3d(0.94,0.94,1)} to{opacity:1;transform:scale3d(1,1,1)} }
  @keyframes slideLeft { from{opacity:0;transform:translate3d(28px,0,0)} to{opacity:1;transform:translate3d(0,0,0)} }
  @keyframes slideDown { from{opacity:0;transform:translate3d(0,-12px,0)} to{opacity:1;transform:translate3d(0,0,0)} }
  @keyframes shimmer   { 0%,100%{opacity:0.45} 50%{opacity:1} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes barLoad   { from{width:0} to{width:100%} }
  @keyframes crownGlow { 0%,100%{filter:drop-shadow(0 0 3px #c9a96e) drop-shadow(0 0 6px #c9a96e55)} 50%{filter:drop-shadow(0 0 9px #c9a96e) drop-shadow(0 0 18px #c9a96e99)} }
  @keyframes flagPulse { 0%,100%{opacity:1;transform:scale3d(1,1,1) translateY(-1px)} 50%{opacity:0.45;transform:scale3d(1.35,1.35,1) translateY(-1px)} }
  @keyframes godGlow   { 0%,100%{text-shadow:0 0 6px #c9a96e,0 0 14px #c9a96e66} 50%{text-shadow:0 0 14px #c9a96e,0 0 32px #c9a96eaa,0 0 48px #c9a96e33} }
  @keyframes pinSlide  { from{opacity:0;transform:translate3d(0,-10px,0)} to{opacity:1;transform:translate3d(0,0,0)} }
  @keyframes toastIn   { from{opacity:0;transform:translate3d(-50%,12px,0)} to{opacity:1;transform:translate3d(-50%,0,0)} }
  @keyframes pageIn    { from{opacity:0;transform:translate3d(0,14px,0)} to{opacity:1;transform:translate3d(0,0,0)} }
  @keyframes modalIn   { from{opacity:0;transform:translate3d(0,20px,0) scale3d(0.97,0.97,1)} to{opacity:1;transform:translate3d(0,0,0) scale3d(1,1,1)} }

  /* ── Utility classes ── */
  .glass     { background:${T.surface};  backdrop-filter:blur(18px) saturate(160%); -webkit-backdrop-filter:blur(18px) saturate(160%); }
  .glass-h   { background:${T.surfaceH}; backdrop-filter:blur(28px) saturate(180%); -webkit-backdrop-filter:blur(28px) saturate(180%); }
  .card-lift { transition:transform 0.32s ${T.ease},box-shadow 0.32s ${T.ease}; will-change:transform; }
  .card-lift:hover { transform:translate3d(0,-5px,0); box-shadow:0 22px 52px rgba(0,0,0,0.72); }
  .nav-link  { transition:color 0.18s ${T.smooth}; }
  .nav-link:hover { color:${T.gold}!important; }
  .crown     { animation:crownGlow 2.4s ease infinite; display:inline-block; line-height:1; vertical-align:middle; }
  .flag-badge{ animation:flagPulse 1.35s ease infinite; display:inline-block; line-height:1; }
  .god-text  { animation:godGlow 2.2s ease infinite; }
  .page-in   { animation:pageIn 0.34s ${T.smooth} both; }
  .modal-in  { animation:modalIn 0.28s ${T.ease} both; }
  .btn-base  { transition:all 0.2s ${T.smooth}; will-change:background,box-shadow; }

  /* ── Responsive helpers ── */
  @media(max-width:640px){
    .hide-sm  { display:none!important; }
    .stack-sm { flex-direction:column!important; }
    .full-sm  { width:100%!important; }
    .pad-sm   { padding:0 14px!important; }
  }
  @media(min-width:641px) and (max-width:1024px){
    .hide-md { display:none!important; }
  }

  /* ── Focus visible for accessibility ── */
  :focus-visible { outline:2px solid ${T.gold}; outline-offset:3px; border-radius:3px; }
  :focus:not(:focus-visible) { outline:none; }
`;

// ── Uniform Button ─────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant="gold", size="md", style, disabled, type="button", full }) {
  const pad = { sm:"8px 20px", md:"11px 28px", lg:"14px 42px" };
  const v = ({
    gold:    { bg:T.gold,                        bd:T.gold,    fg:"#08080e",  hov:"#b8955a",                    sh:`0 0 0 0 ${T.gold}` },
    outline: { bg:"transparent",                 bd:T.gold,    fg:T.gold,     hov:T.goldSoft,                   sh:"none" },
    ghost:   { bg:"transparent",                 bd:T.border,  fg:T.muted,    hov:"rgba(255,255,255,0.07)",      sh:"none" },
    danger:  { bg:"transparent",                 bd:T.red,     fg:T.red,      hov:"rgba(196,106,106,0.13)",      sh:"none" },
    verify:  { bg:"rgba(106,170,136,0.1)",        bd:T.green,   fg:T.green,    hov:"rgba(106,170,136,0.24)",      sh:"none" },
    flag:    { bg:"rgba(224,160,48,0.1)",         bd:T.flag,    fg:T.flag,     hov:"rgba(224,160,48,0.24)",       sh:"none" },
    block:   { bg:"rgba(196,106,106,0.09)",       bd:T.red,     fg:T.red,      hov:"rgba(196,106,106,0.2)",       sh:"none" },
    pin:     { bg:T.goldSoft,                    bd:T.gold,    fg:T.gold,     hov:"rgba(201,169,110,0.28)",      sh:"none" },
    admin:   { bg:"rgba(201,169,110,0.1)",        bd:T.gold,    fg:T.gold,     hov:"rgba(201,169,110,0.24)",      sh:"none" },
  })[variant] || { bg:T.gold, bd:T.gold, fg:"#08080e", hov:"#b8955a", sh:"none" };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className="btn-base"
      style={{ background:v.bg, border:`1px solid ${v.bd}`, color:v.fg,
        padding:pad[size]||pad.md, borderRadius:4, fontFamily:T.sans,
        fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
        opacity:disabled?0.38:1, cursor:disabled?"not-allowed":"pointer",
        whiteSpace:"nowrap", width:full?"100%":undefined,
        lineHeight:1.2, ...style }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.background=v.hov; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={e=>{ if(!disabled){ e.currentTarget.style.background=v.bg;  e.currentTarget.style.transform=""; }}}
      onMouseDown={e=>{ if(!disabled) e.currentTarget.style.transform="translateY(0px)"; }}
    >{children}</button>
  );
}

export const Divider = ({ style }) => <div style={{ height:1, background:T.border, flexShrink:0, ...style }} />;

export const Tag = ({ children, color=T.gold }) => (
  <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:3,
    border:`1px solid ${color}44`, color, fontSize:11, fontFamily:T.mono,
    letterSpacing:"0.08em", textTransform:"uppercase", lineHeight:1.4 }}>
    {children}
  </span>
);

export const VerifiedCrown = () => (
  <span className="crown" title="Verified by PARADISE" style={{ fontSize:12, marginLeft:3 }}>👑</span>
);
export const FlagBadge = ({ at }) => (
  <sup title={`Flagged by admin${at?" · "+at:""}`} style={{ marginLeft:2 }}>
    <span className="flag-badge" style={{ fontSize:9, color:T.flag }}>❓❓❓</span>
  </sup>
);
export const Toast = ({ msg, type="success" }) => msg ? (
  <div style={{ position:"fixed", bottom:"calc(70px + env(safe-area-inset-bottom))", left:"50%",
    transform:"translateX(-50%)", background:type==="error"?T.red:T.green, color:"#fff",
    fontFamily:T.mono, fontSize:12, letterSpacing:"0.06em", padding:"11px 26px",
    borderRadius:4, zIndex:9999, animation:"toastIn 0.3s ease", whiteSpace:"nowrap",
    boxShadow:"0 8px 32px rgba(0,0,0,0.55)", backdropFilter:"blur(12px)" }}>
    {msg}
  </div>
) : null;

export const Input = ({ value, onChange, placeholder, type="text", style }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", background:"rgba(255,255,255,0.045)", border:`1px solid ${T.border}`,
      borderRadius:4, padding:"12px 14px", color:T.white, fontFamily:T.sans, fontSize:14,
      fontWeight:400, outline:"none", transition:`border-color 0.18s ${T.smooth}`, lineHeight:1.4, ...style }}
    onFocus={e=>e.target.style.borderColor=T.gold}
    onBlur={e=>e.target.style.borderColor=T.border} />
);

export const Textarea = ({ value, onChange, placeholder, rows=4 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ width:"100%", background:"rgba(255,255,255,0.045)", border:`1px solid ${T.border}`,
      borderRadius:4, padding:"12px 14px", color:T.white, fontFamily:T.sans, fontSize:14,
      fontWeight:400, outline:"none", resize:"vertical", lineHeight:1.7,
      transition:`border-color 0.18s ${T.smooth}` }}
    onFocus={e=>e.target.style.borderColor=T.gold}
    onBlur={e=>e.target.style.borderColor=T.border} />
);

export const Select = ({ value, onChange, children, style }) => (
  <select value={value} onChange={onChange}
    style={{ width:"100%", background:"rgba(10,9,20,0.96)", border:`1px solid ${T.border}`,
      borderRadius:4, padding:"12px 14px", color:T.white, fontFamily:T.sans,
      fontSize:14, fontWeight:400, outline:"none", ...style }}>
    {children}
  </select>
);

// ── Animated Avatar (zodiac ↔ photo swap every 3s) ────────────────────────────
import { useState, useEffect } from "react";

export function AnimatedAvatar({ avatar, zodiac, size=40, border=true, onClick }) {
  const [showZodiac, setShowZodiac] = useState(false);

  useEffect(() => {
    // Only animate if user has a photo — otherwise just show zodiac symbol static
    if (avatar?.type !== "photo" || !zodiac) return;
    const id = setInterval(() => setShowZodiac(p => !p), 3000);
    return () => clearInterval(id);
  }, [avatar, zodiac]);

  const borderStyle = border ? `2px solid rgba(201,169,110,0.4)` : "none";
  const base = {
    width:size, height:size, minWidth:size, minHeight:size,
    borderRadius:"50%", flexShrink:0, overflow:"hidden",
    border:borderStyle, cursor:onClick?"pointer":"default",
    position:"relative", display:"flex", alignItems:"center", justifyContent:"center",
    transition:"opacity 0.5s ease",
  };

  const hasPhoto = avatar?.type === "photo" && avatar.value;

  if (hasPhoto && zodiac) {
    return (
      <div style={{position:"relative",width:size,height:size,minWidth:size,cursor:onClick?"pointer":"default"}} onClick={onClick}>
        {/* Photo layer */}
        <img src={avatar.value} alt="avatar"
          style={{...base, position:"absolute", inset:0, objectFit:"cover",
            opacity:showZodiac?0:1, transition:"opacity 0.6s ease"}} />
        {/* Zodiac layer */}
        <div style={{...base, position:"absolute", inset:0,
          background:"rgba(201,169,110,0.1)", fontFamily:"'Cormorant Garamond',serif",
          fontSize:size*0.52, color:"#c9a96e", lineHeight:1,
          opacity:showZodiac?1:0, transition:"opacity 0.6s ease"}}>
          {zodiac.symbol}
        </div>
      </div>
    );
  }

  // No photo — show zodiac symbol or fallback symbol
  const symbol = zodiac?.symbol || avatar?.value || "◆";
  return (
    <div style={{...base, background:"rgba(201,169,110,0.07)",
      fontFamily:"'Cormorant Garamond',serif", fontSize:size*0.48,
      color:"#c9a96e", lineHeight:1}} onClick={onClick}>
      {symbol}
    </div>
  );
}

export const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom:20 }}>
    <label style={{ display:"block", fontFamily:T.mono, fontSize:11, fontWeight:600,
      color:"#a09cbc", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8, lineHeight:1 }}>
      {label}
    </label>
    {children}
    {hint && <p style={{ fontFamily:T.mono, fontSize:10, color:"#6a6680", marginTop:5, lineHeight:1.5 }}>{hint}</p>}
  </div>
);
