import { useState, useEffect } from "react";

export const T = {
  bg:"#06060e", surface:"rgba(12,11,22,0.82)", surfaceH:"rgba(18,16,32,0.97)",
  border:"rgba(255,255,255,0.09)", borderG:"rgba(201,169,110,0.26)",
  gold:"#c9a96e", goldSoft:"rgba(201,169,110,0.14)",
  white:"#f2ede7", muted:"#7a7690", dim:"#2e2a40",
  green:"#6aaa88", red:"#c46a6a", flag:"#e0a030",
  font:"'Cormorant Garamond',Georgia,serif",
  sans:"'Tenor Sans',sans-serif",
  mono:"'DM Mono',monospace",
  ease:"cubic-bezier(0.25,0.46,0.45,0.94)",
  spring:"cubic-bezier(0.34,1.56,0.64,1)",
  smooth:"cubic-bezier(0.4,0,0.2,1)",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Tenor+Sans&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
  body{background:${T.bg};color:${T.white};font-family:${T.sans};line-height:1.55;
    -webkit-font-smoothing:antialiased;overflow-x:hidden;text-rendering:optimizeLegibility}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:${T.dim};border-radius:2px}
  input,textarea,select,button{font-family:${T.sans}}
  input::placeholder,textarea::placeholder{color:${T.muted}}
  img{max-width:100%;display:block}
  a{color:${T.gold};text-decoration:none}

  @keyframes fadeUp   {from{opacity:0;transform:translate3d(0,18px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
  @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
  @keyframes fadeOut  {to{opacity:0;pointer-events:none}}
  @keyframes scaleIn  {from{opacity:0;transform:scale3d(0.93,0.93,1)}to{opacity:1;transform:scale3d(1,1,1)}}
  @keyframes slideUp  {from{opacity:0;transform:translate3d(0,100%,0)}to{opacity:1;transform:translate3d(0,0,0)}}
  @keyframes pageIn   {from{opacity:0;transform:translate3d(0,12px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
  @keyframes modalIn  {from{opacity:0;transform:translate3d(0,22px,0) scale3d(0.97,0.97,1)}to{opacity:1;transform:translate3d(0,0,0) scale3d(1,1,1)}}
  @keyframes shimmer  {0%,100%{opacity:0.45}50%{opacity:1}}
  @keyframes spin     {to{transform:rotate(360deg)}}
  @keyframes barLoad  {from{width:0}to{width:100%}}
  @keyframes barShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes crownGlow{0%,100%{filter:drop-shadow(0 0 3px #c9a96e)}50%{filter:drop-shadow(0 0 10px #c9a96e)}}
  @keyframes flagPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.45;transform:scale(1.3)}}
  @keyframes godGlow  {0%,100%{text-shadow:0 0 6px #c9a96e,0 0 14px #c9a96e66}50%{text-shadow:0 0 18px #c9a96e,0 0 36px #c9a96eaa}}
  @keyframes toastIn  {from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
  @keyframes notifPop {from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
  @keyframes bellRing {0%,100%{transform:rotate(0)}20%{transform:rotate(-18deg)}40%{transform:rotate(16deg)}60%{transform:rotate(-10deg)}80%{transform:rotate(8deg)}}
  @keyframes dotPulse {0%,100%{opacity:0.3;transform:scale(0.7)}50%{opacity:1;transform:scale(1)}}

  .glass    {background:${T.surface};backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%)}
  .glass-h  {background:${T.surfaceH};backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%)}
  .card-lift{transition:transform 0.3s ${T.ease},box-shadow 0.3s ${T.ease};will-change:transform}
  .card-lift:hover{transform:translate3d(0,-5px,0);box-shadow:0 22px 52px rgba(0,0,0,0.7)}
  .nav-link {transition:color 0.18s ${T.smooth}}
  .nav-link:hover{color:${T.gold}!important}
  .crown    {animation:crownGlow 2.4s ease infinite;display:inline-block;line-height:1;vertical-align:middle}
  .flag-b   {animation:flagPulse 1.3s ease infinite;display:inline-block}
  .god-text {animation:godGlow 2.2s ease infinite}
  .modal-in {animation:modalIn 0.28s ${T.ease} both}
  .page-in  {animation:pageIn 0.34s ${T.smooth} both}
  .btn-base {transition:all 0.2s ${T.smooth};will-change:transform}
  .bell-ring{animation:bellRing 0.5s ease}

  @media(max-width:640px){
    .hide-sm{display:none!important}
  }
  @media(max-width:380px){
    .hide-xs{display:none!important}
  }
  @media(min-width:641px){
    .show-md{display:block!important}
  }
  /* Prevent font inflation on iOS */
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  /* Better touch targets */
  button{min-height:36px;-webkit-tap-highlight-color:transparent}
  /* Prevent horizontal scroll */
  body{overflow-x:hidden;max-width:100vw}
  :focus-visible{outline:2px solid ${T.gold};outline-offset:3px;border-radius:3px}
  :focus:not(:focus-visible){outline:none}
`;

// ── Button ────────────────────────────────────────────────────────────────────
const VARIANTS = {
  gold:   {bg:T.gold,       bd:T.gold,    fg:"#08080e", hov:"#b8955a"},
  outline:{bg:"transparent",bd:T.gold,    fg:T.gold,    hov:T.goldSoft},
  ghost:  {bg:"transparent",bd:T.border,  fg:T.muted,   hov:"rgba(255,255,255,0.07)"},
  danger: {bg:"transparent",bd:T.red,     fg:T.red,     hov:"rgba(196,106,106,0.14)"},
  verify: {bg:"rgba(106,170,136,0.1)",bd:T.green,fg:T.green,hov:"rgba(106,170,136,0.24)"},
  flag:   {bg:"rgba(224,160,48,0.1)", bd:T.flag, fg:T.flag, hov:"rgba(224,160,48,0.24)"},
  block:  {bg:"rgba(196,106,106,0.08)",bd:T.red, fg:T.red,  hov:"rgba(196,106,106,0.2)"},
  pin:    {bg:T.goldSoft,  bd:T.gold,    fg:T.gold,    hov:"rgba(201,169,110,0.28)"},
  admin:  {bg:"rgba(201,169,110,0.1)",bd:T.gold,fg:T.gold,  hov:"rgba(201,169,110,0.24)"},
};
const PADS = { sm:"7px 18px", md:"11px 28px", lg:"14px 42px" };

export function Btn({ children, onClick, variant="gold", size="md", style, disabled, full }) {
  const v = VARIANTS[variant] || VARIANTS.gold;
  return (
    <button onClick={onClick} disabled={disabled} className="btn-base"
      style={{background:v.bg,border:`1px solid ${v.bd}`,color:v.fg,
        padding:PADS[size],borderRadius:4,fontFamily:T.sans,fontSize:12,
        fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",
        opacity:disabled?0.38:1,cursor:disabled?"not-allowed":"pointer",
        whiteSpace:"nowrap",width:full?"100%":undefined,...style}}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.background=v.hov;e.currentTarget.style.transform="translateY(-1px)"}}}
      onMouseLeave={e=>{if(!disabled){e.currentTarget.style.background=v.bg;e.currentTarget.style.transform=""}}}
    >{children}</button>
  );
}

export const Divider = ({style}) => <div style={{height:1,background:T.border,...style}} />;
export const Tag = ({children,color=T.gold}) => (
  <span style={{display:"inline-block",padding:"3px 10px",borderRadius:3,
    border:`1px solid ${color}44`,color,fontSize:11,fontFamily:T.mono,
    letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1.4}}>{children}</span>
);
export const VerifiedCrown = () => <span className="crown" title="Verified" style={{fontSize:12,marginLeft:3}}>👑</span>;
export const FlagBadge = ({at}) => (
  <sup title={`Flagged${at?" · "+at:""}`} style={{marginLeft:2}}>
    <span className="flag-b" style={{fontSize:9,color:T.flag}}>❓❓❓</span>
  </sup>
);
export const Toast = ({msg,type="success"}) => msg ? (
  <div style={{position:"fixed",bottom:"calc(72px + env(safe-area-inset-bottom))",left:"50%",
    transform:"translateX(-50%)",background:type==="error"?T.red:T.green,color:"#fff",
    fontFamily:T.mono,fontSize:12,letterSpacing:"0.06em",padding:"11px 26px",borderRadius:4,
    zIndex:9999,animation:"toastIn 0.28s ease",whiteSpace:"nowrap",
    boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
    {msg}
  </div>
) : null;

export const Input    = ({value,onChange,placeholder,type="text",style}) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",background:"rgba(255,255,255,0.045)",border:`1px solid ${T.border}`,
      borderRadius:4,padding:"12px 14px",color:T.white,fontFamily:T.sans,fontSize:14,
      outline:"none",transition:`border-color 0.18s ${T.smooth}`,...style}}
    onFocus={e=>e.target.style.borderColor=T.gold}
    onBlur={e=>e.target.style.borderColor=T.border} />
);
export const Textarea = ({value,onChange,placeholder,rows=4}) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{width:"100%",background:"rgba(255,255,255,0.045)",border:`1px solid ${T.border}`,
      borderRadius:4,padding:"12px 14px",color:T.white,fontFamily:T.sans,fontSize:14,
      outline:"none",resize:"vertical",lineHeight:1.7,transition:`border-color 0.18s ${T.smooth}`}}
    onFocus={e=>e.target.style.borderColor=T.gold}
    onBlur={e=>e.target.style.borderColor=T.border} />
);
export const Select = ({value,onChange,children,style}) => (
  <select value={value} onChange={onChange}
    style={{width:"100%",background:"rgba(10,9,20,0.96)",border:`1px solid ${T.border}`,
      borderRadius:4,padding:"12px 14px",color:T.white,fontFamily:T.sans,fontSize:14,
      outline:"none",...style}}>{children}</select>
);
export const Field = ({label,hint,children}) => (
  <div style={{marginBottom:20}}>
    <label style={{display:"block",fontFamily:T.mono,fontSize:11,fontWeight:600,
      color:"#a09cbc",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>
      {label}
    </label>
    {children}
    {hint&&<p style={{fontFamily:T.mono,fontSize:10,color:"#6a6680",marginTop:5,lineHeight:1.5}}>{hint}</p>}
  </div>
);

// ── Animated Avatar ───────────────────────────────────────────────────────────
export function AnimatedAvatar({avatar,zodiac,size=40,border=true,onClick}) {
  const [showZ,setShowZ] = useState(false);
  useEffect(()=>{
    if(avatar?.type!=="photo"||!zodiac)return;
    const id=setInterval(()=>setShowZ(p=>!p),3000);
    return ()=>clearInterval(id);
  },[avatar,zodiac]);

  const base = {width:size,height:size,minWidth:size,borderRadius:"50%",
    border:border?`2px solid rgba(201,169,110,0.42)`:"none",
    cursor:onClick?"pointer":"default",overflow:"hidden",flexShrink:0,
    display:"flex",alignItems:"center",justifyContent:"center"};

  if(avatar?.type==="photo"&&avatar.value){
    return zodiac ? (
      <div style={{position:"relative",width:size,height:size,minWidth:size,flexShrink:0,cursor:onClick?"pointer":"default"}} onClick={onClick}>
        <img src={avatar.value} alt="" style={{...base,position:"absolute",inset:0,objectFit:"cover",opacity:showZ?0:1,transition:"opacity 0.7s ease"}} />
        <div style={{...base,position:"absolute",inset:0,background:"rgba(201,169,110,0.1)",fontFamily:T.font,fontSize:size*0.5,color:T.gold,opacity:showZ?1:0,transition:"opacity 0.7s ease"}}>{zodiac.symbol}</div>
      </div>
    ) : <img src={avatar.value} alt="" style={{...base,objectFit:"cover"}} onClick={onClick} />;
  }
  const sym = zodiac?.symbol||avatar?.value||"◆";
  return (
    <div style={{...base,background:"rgba(201,169,110,0.08)",fontFamily:T.font,fontSize:size*0.46,color:T.gold}} onClick={onClick}>
      {sym}
    </div>
  );
}
