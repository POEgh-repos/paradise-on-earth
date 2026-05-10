import { useState, useCallback, useEffect, Suspense, lazy } from "react";
import { T, GLOBAL_CSS, Btn, Divider, Tag, VerifiedCrown, FlagBadge, Toast, AnimatedAvatar } from "./tokens";
import GalaxyBackground from "./GalaxyBackground";
import { auth, signInWithGoogle, logOut, createUserProfile, getUserProfile, createPost, subscribeToPosts, likePost, pinPost, blockPost, deletePost as fbDeletePost, subscribeToCollections, saveCollection } from "./firebase";
import { getRedirectResult } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

const ProfilePage    = lazy(() => import("./ProfilePage"));
const SocialFeedPage = lazy(() => import("./SocialFeed"));
const AdminPanel     = lazy(() => import("./AdminPanel"));

export const ADMIN_PROFILE = {
  name:"GOD🤎", username:"humble_servant", avatar:"◈",
  wallet:"0xADM1N…0000", provider:"admin",
  ownedNFTs:[], verified:true, flagged:false,
  profile:{ displayName:"GOD🤎", username:"humble_servant",
    bio:"Steward of PARADISE on Earth.", coverColor:"#120e00",
    avatar:{type:"zodiac",value:"Scorpio",symbol:"♏"},
    zodiac:{sign:"Scorpio",symbol:"♏"}, banner:null },
};

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEED_COLLECTIONS = [
  { id:1, name:"Ancestral Frequencies", creator:"Amara Diallo", role:"Musician", avatar:"♪", accent:"#c9a96e",
    description:"A sonic journey through ancestral memory.", followers:"12.4K", totalPieces:34, media:null,
    nfts:[
      { id:101, name:"Rhythm of Accra — I", price:"0.8", momoPrice:"1,200", rarity:"Rare", image:"♪", bg:"linear-gradient(160deg,#0d0b07,#2a1f0a,#3d2e10)", likes:234, description:"Field recordings from Accra markets layered with kora.", story:"Recorded at dawn in Jamestown, Accra.", traits:[{k:"Mood",v:"Transcendent"},{k:"Key",v:"D Minor"},{k:"BPM",v:"72"},{k:"Era",v:"Neo-ancestral"}], perks:["🎧 Unreleased stems","🎤 Private session","📜 Signed certificate","🎪 Backstage access"], content:null, media:null },
      { id:102, name:"Lagos Nights — III", price:"0.6", momoPrice:"900", rarity:"Epic", image:"🌙", bg:"linear-gradient(160deg,#060810,#0c1020,#141830)", likes:156, description:"Nocturnal Lagos — 4 minutes of ambient jazz.", story:"3am on Victoria Island.", traits:[{k:"Mood",v:"Nocturnal"},{k:"Key",v:"F# Major"},{k:"BPM",v:"88"},{k:"Era",v:"Afro-jazz"}], perks:["🎧 Lossless audio","🖼️ Album art print","💬 Voice message"], content:null, media:null },
    ],
    events:[{id:"e1",title:"Live Recording Session",date:"2025-08-14",location:"Accra, Ghana",desc:"NFT holders get private access."}]},
  { id:2, name:"Kente Futures", creator:"Kwame Asante", role:"Fashion Designer", avatar:"◈", accent:"#a8c5a0",
    description:"Wearable NFTs that unlock custom garments.", followers:"8.9K", totalPieces:21, media:null,
    nfts:[{ id:201, name:"Kente Reimagined — VII", price:"1.2", momoPrice:"1,800", rarity:"Legendary", image:"◈", bg:"linear-gradient(160deg,#060d08,#0f2410,#163318)", likes:412, description:"Kente strip as wearable digital art.", story:"My grandmother wove Kente for 40 years.", traits:[{k:"Pattern",v:"Oyokoman"},{k:"Colorway",v:"Earth & Sage"},{k:"Edition",v:"1 of 7"},{k:"Physical",v:"Yes"}], perks:["👗 Physical garment","✂️ Fitting session","📸 Campaign feature","🏷️ Early access"], content:null, media:null }],
    events:[{id:"e2",title:"Fashion Week NFT Drop",date:"2025-09-20",location:"Accra Fashion Week",desc:"Holders-only preview."}]},
  { id:3, name:"Second Life Objects", creator:"Zara Mensah", role:"Up-cycler", avatar:"∞", accent:"#c4a882",
    description:"Every object has a second life.", followers:"15.2K", totalPieces:47, media:null,
    nfts:[{ id:301, name:"Second Life Vessel — XIV", price:"0.4", momoPrice:"600", rarity:"Common", image:"∞", bg:"linear-gradient(160deg,#0d0906,#26180a,#3a2410)", likes:178, description:"47 discarded fragments reconstructed.", story:"Found in a dump in Kumasi.", traits:[{k:"Material",v:"Reclaimed Clay"},{k:"Origin",v:"Kumasi, Ghana"},{k:"Fragments",v:"47"},{k:"Technique",v:"Kintsugi-inspired"}], perks:["📦 Physical shipped","🎥 Documentary access","🏺 Artist signature"], content:null, media:null }],
    events:[]},
  { id:4, name:"Gaze Studies", creator:"Nia Okafor", role:"Visual Artist", avatar:"◉", accent:"#b8a0c8",
    description:"Portraits that stare back.", followers:"22.1K", totalPieces:58, media:null,
    nfts:[{ id:401, name:"Ancestral Gaze — XXII", price:"2.1", momoPrice:"3,150", rarity:"Legendary", image:"◉", bg:"linear-gradient(160deg,#08060d,#181025,#241540)", likes:891, description:"Oil on canvas, digitised at 12K.", story:"My great-grandmother's photograph.", traits:[{k:"Medium",v:"Oil on Canvas"},{k:"Resolution",v:"12K"},{k:"Series",v:"Gaze Studies"},{k:"Year",v:"2024"}], perks:["🖼️ Museum-grade print","🎨 Studio visit","📖 Monograph","🏛️ Collector access"], content:null, media:null }],
    events:[{id:"e3",title:"Gallery Opening",date:"2025-10-05",location:"Lagos, Nigeria",desc:"Reserved seating for holders."}]},
];

const SEED_POSTS = [
  { id:1, collectionId:1, nftId:102, user:"Kofi B.",  username:"kofi.b",  avatar:{type:"zodiac",value:"Leo",symbol:"♌"},       zodiac:{sign:"Leo",symbol:"♌"},       time:"2m ago",  action:"acquired",   comment:"Lagos Nights is everything I needed tonight.", likes:14, comments:3,  reposts:2,  likedByMe:false, pinned:false },
  { id:2, collectionId:4, nftId:401, user:"Abena K.", username:"abena.k", avatar:{type:"zodiac",value:"Virgo",symbol:"♍"},     zodiac:{sign:"Virgo",symbol:"♍"},     time:"18m ago", action:"is holding", comment:"Ancestral Gaze arrived in my wallet. I cannot stop looking at it.", likes:31, comments:7,  reposts:5,  likedByMe:false, pinned:false },
  { id:3, collectionId:2, nftId:201, user:"Yaw M.",   username:"yaw.m",   avatar:{type:"zodiac",value:"Gemini",symbol:"♊"},   zodiac:{sign:"Gemini",symbol:"♊"},   time:"1h ago",  action:"purchased",  comment:"Supporting African fashion in the most permanent way. #Kente #AfricanArt", likes:22, comments:2,  reposts:8,  likedByMe:false, pinned:false },
  { id:4, collectionId:3, nftId:301, user:"Ama S.",   username:"ama.s",   avatar:{type:"zodiac",value:"Pisces",symbol:"♓"},   zodiac:{sign:"Pisces",symbol:"♓"},   time:"4h ago",  action:"collected",  comment:"The story behind each fragment moved me. @zara.m you outdid yourself 🙏 #UpCycle", likes:47, comments:11, reposts:14, likedByMe:false, pinned:false },
];

// ── Shared AvatarDisplay (re-exported for other pages) ────────────────────────
export { AnimatedAvatar as AvatarDisplay };

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spin = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80}}>
    <span style={{fontSize:28,color:T.gold,animation:"spin 1s linear infinite"}}>◌</span>
  </div>
);

// ── Loader — fixed centering + interactive progress bar ───────────────────────
function Loader({ onDone }) {
  useState(() => { const t=setTimeout(onDone,2800); return()=>clearTimeout(t); });
  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:`fadeOut 0.5s ${T.smooth} 2.3s both`}}>
      <GalaxyBackground />
      <div style={{position:"relative",zIndex:2,textAlign:"center",width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:6,color:T.muted,textTransform:"uppercase",marginBottom:28,animation:"shimmer 2s ease infinite"}}>Loading</div>
        <div style={{fontFamily:T.font,fontSize:"clamp(34px,9vw,56px)",fontWeight:700,color:T.white,letterSpacing:"clamp(4px,2vw,10px)",animation:`fadeUp 0.7s ${T.smooth} 0.2s both`,lineHeight:1}}>PARADISE</div>
        <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:"clamp(14px,4vw,20px)",color:T.gold,letterSpacing:"clamp(2px,1.5vw,5px)",marginTop:8,animation:`fadeUp 0.7s ${T.smooth} 0.45s both`}}>on Earth</div>

        {/* Centred progress bar */}
        <div style={{display:"flex",justifyContent:"center",marginTop:48,animation:`fadeUp 0.6s ${T.smooth} 0.7s both`}}>
          <div style={{width:"min(220px,70vw)",height:2,background:T.dim,borderRadius:1,overflow:"hidden",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`,backgroundSize:"200% 100%",animation:"shimmerBar 1.8s ease 0.8s forwards, barLoad 1.8s ease 0.8s forwards",width:"0%",borderRadius:1}} />
          </div>
        </div>
        {/* Subtle loading dots */}
        <div style={{marginTop:20,display:"flex",justifyContent:"center",gap:6,animation:`fadeUp 0.6s ${T.smooth} 1s both`}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:4,height:4,borderRadius:"50%",background:T.gold,opacity:0.4,animation:`dotPulse 1.2s ease ${i*0.2}s infinite`}} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes barLoad{from{width:0}to{width:100%}}
        @keyframes shimmerBar{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes dotPulse{0%,100%{opacity:0.25;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
      `}</style>
    </div>
  );
}

// ── Nav — compact mobile, no overflow ─────────────────────────────────────────
function Nav({ page, setPage, user, isAdmin }) {
  const links=[["feed","Feed"],["explore","Explore"],["creators","Creators"],["wallet","Wallet"]];
  return (
    <nav className="glass-h" style={{position:"fixed",top:0,left:0,right:0,zIndex:100,borderBottom:`1px solid ${T.border}`,height:56,display:"flex",alignItems:"center",padding:"0 clamp(10px,3vw,32px)",gap:0}}>
      {/* Logo */}
      <div onClick={()=>setPage("feed")} style={{cursor:"pointer",fontFamily:T.font,display:"flex",flexDirection:"column",lineHeight:1.1,userSelect:"none",flexShrink:0,marginRight:"clamp(8px,2vw,24px)"}}>
        <span style={{fontSize:"clamp(13px,2.2vw,19px)",fontWeight:700,letterSpacing:"clamp(2px,0.8vw,5px)",color:T.white}}>PARADISE</span>
        <span style={{fontSize:"clamp(8px,1.2vw,11px)",fontStyle:"italic",color:T.gold,letterSpacing:"clamp(1px,0.5vw,3px)",fontWeight:600}}>on Earth</span>
      </div>
      {/* Desktop nav links — hidden on small screens, shown via scrollable row */}
      <div style={{display:"flex",gap:0,overflowX:"auto",scrollbarWidth:"none",flex:1,WebkitOverflowScrolling:"touch"}}>
        <style>{`::-webkit-scrollbar{display:none}`}</style>
        {links.map(([p,l])=>(
          <button key={p} className="nav-link" onClick={()=>setPage(p)}
            style={{background:"none",border:"none",flexShrink:0,color:page===p?T.gold:"#c0bcd4",fontFamily:T.sans,fontSize:"clamp(10px,1.5vw,12px)",letterSpacing:"clamp(1px,0.5vw,2px)",textTransform:"uppercase",fontWeight:700,transition:`color 0.18s ${T.smooth}`,paddingBottom:3,borderBottom:page===p?`2px solid ${T.gold}`:"2px solid transparent",cursor:"pointer",padding:"0 clamp(8px,1.5vw,14px)",height:56,display:"flex",alignItems:"center",boxSizing:"border-box"}}>
            {l}
          </button>
        ))}
      </div>
      {/* Right controls */}
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:"clamp(4px,1vw,12px)"}}>
        {isAdmin&&<Btn variant="admin" size="sm" onClick={()=>setPage("admin")} style={{fontSize:11,padding:"6px 12px"}}>Admin</Btn>}
        {user?(
          <div onClick={()=>setPage("profile")} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",borderRadius:6,padding:"4px 8px",border:"1px solid transparent",transition:`all 0.18s`}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor=T.border}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent"}}>
            <div className="hide-mobile" style={{textAlign:"right"}}>
              <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.white,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:2}}>
                {isAdmin?<span className="god-text" style={{fontFamily:T.font,fontWeight:700,fontSize:14,color:T.gold}}>GOD🤎</span>:<span style={{maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.profile?.displayName||user.name}</span>}
                {(user.verified||isAdmin)&&<VerifiedCrown />}
                {user.flagged&&<FlagBadge at={user.flaggedAt} />}
              </div>
              <div style={{fontFamily:T.mono,fontSize:9,color:isAdmin?T.gold:T.muted}}>@{isAdmin?"humble_servant":(user.profile?.username||"…")}</div>
            </div>
            <AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:user.avatar||"◆"}} zodiac={user.profile?.zodiac} size={30} border />
          </div>
        ):(
          <Btn onClick={()=>setPage("auth")} size="sm">Sign In</Btn>
        )}
      </div>
    </nav>
  );
}

// ── Auth ───────────────────────────────────────────────────────────────────────
function AuthPage({ onGoogleLogin, onAdminAuth }) {
  const [loading,setLoading]=useState(false);
  const [adminMode,setAdminMode]=useState(false);
  const [adminPass,setAdminPass]=useState("");
  const doAuth=async()=>{ setLoading(true); try{ await onGoogleLogin(); }catch(e){ setLoading(false); } };
  const doAdmin=()=>{ if(adminPass==="admin123")onAdminAuth();else alert("Incorrect password."); };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px",animation:`fadeUp 0.34s ${T.smooth} both`}}>
      <div style={{maxWidth:400,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontFamily:T.font,fontSize:"clamp(32px,8vw,52px)",fontWeight:700,letterSpacing:"clamp(4px,2vw,10px)",color:T.white}}>PARADISE</div>
          <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:17,color:T.gold,letterSpacing:4,marginTop:4}}>on Earth</div>
        </div>
        {!adminMode?(
          <div className="glass-h" style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(20px,5vw,38px)"}}>
            <p style={{fontFamily:T.font,fontSize:16,color:T.muted,textAlign:"center",marginBottom:26,lineHeight:1.8}}>Sign in to receive your wallet and begin collecting.</p>
            {loading?(
              <div style={{textAlign:"center",padding:28}}>
                <div style={{fontSize:28,color:T.gold,animation:"spin 1s linear infinite",display:"inline-block"}}>◌</div>
                <p style={{fontFamily:T.font,fontSize:14,color:T.muted,marginTop:12}}>Creating your Polygon wallet…</p>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[["google","◉","Continue with Google"],["apple","◈","Continue with Apple"]].map(([p,icon,label])=>(
                  <button key={p} onClick={doAuth} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:8,padding:"13px 20px",color:T.white,fontFamily:T.sans,fontSize:14,fontWeight:600,letterSpacing:1,transition:`all 0.18s`,cursor:"pointer"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background=T.goldSoft}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="rgba(255,255,255,0.04)"}}>
                    <span style={{color:T.gold,fontFamily:T.font,fontSize:20}}>{icon}</span>{label}
                  </button>
                ))}
                <Divider style={{margin:"8px 0"}} />
                <button onClick={()=>setAdminMode(true)} style={{background:"none",border:"none",color:T.muted,fontFamily:T.mono,fontSize:11,letterSpacing:1,cursor:"pointer"}}>Admin Access →</button>
              </div>
            )}
          </div>
        ):(
          <div className="glass-h" style={{border:`1px solid ${T.gold}44`,borderRadius:10,padding:"clamp(20px,5vw,38px)"}}>
            <p style={{fontFamily:T.font,fontSize:17,color:T.gold,marginBottom:18,fontWeight:600}}>Admin Access</p>
            <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdmin()} placeholder="Enter admin password"
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:4,padding:"12px 14px",color:T.white,fontSize:14,outline:"none",marginBottom:12}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
            <Btn full onClick={doAdmin}>Enter</Btn>
            <button onClick={()=>setAdminMode(false)} style={{background:"none",border:"none",color:T.muted,fontSize:12,marginTop:12,width:"100%",cursor:"pointer",fontFamily:T.sans}}>← Back</button>
          </div>
        )}
        <p style={{fontFamily:T.mono,fontSize:10,color:T.muted,textAlign:"center",marginTop:18,letterSpacing:1}}>Auto-assigns Polygon wallet · No crypto knowledge needed</p>
      </div>
    </div>
  );
}

// ── NFT Card ───────────────────────────────────────────────────────────────────
export function NFTCard({ nft, collection, onClick, owned }) {
  const [liked,setLiked]=useState(false);
  const rc={Common:"#888",Rare:T.gold,Epic:"#b8a0c8",Legendary:"#c9a96e"};
  return (
    <div className="card-lift glass" onClick={()=>onClick(nft,collection)} style={{border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",cursor:"pointer"}}>
      <div style={{height:185,background:nft.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,fontFamily:T.font,color:T.gold,position:"relative"}}>
        {nft.image}
        <div style={{position:"absolute",top:10,right:10,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <Tag color={rc[nft.rarity]}>{nft.rarity}</Tag>
          {owned&&<Tag color={T.green}>Owned</Tag>}
        </div>
      </div>
      <div style={{padding:"15px 16px 13px"}}>
        <div style={{fontFamily:T.font,fontSize:17,color:T.white,marginBottom:3,fontWeight:700,lineHeight:1.2}}>{nft.name}</div>
        <div style={{fontFamily:T.sans,fontSize:12,color:"#b0accc",marginBottom:12,fontWeight:600}}>{collection?.creator}</div>
        <Divider style={{marginBottom:12}} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:2,letterSpacing:1}}>PRICE</div>
            <div style={{fontFamily:T.font,fontSize:18,color:T.gold,fontWeight:600}}>{nft.price} ETH</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>GHS {nft.momoPrice} · MoMo</div>
          </div>
          <button onClick={e=>{e.stopPropagation();setLiked(!liked);}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"6px 11px",color:liked?"#e07070":T.muted,fontFamily:T.mono,fontSize:12,transition:`all 0.18s`,cursor:"pointer"}}>
            {liked?"♥":"♡"} {nft.likes+(liked?1:0)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── NFT Modal ──────────────────────────────────────────────────────────────────
function NFTModal({ nft, collection, onClose, user, onBuy }) {
  const [tab,setTab]=useState("story"  );
  const [step,setStep]=useState("view");
  const [momoNum,setMomoNum]=useState("");
  if(!nft||!collection) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.84)",backdropFilter:"blur(18px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h modal-enter" style={{maxWidth:540,width:"100%",border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:195,background:nft.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:62,fontFamily:T.font,color:T.gold,position:"relative"}}>
          {nft.image}
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.55)",border:`1px solid ${T.border}`,width:32,height:32,borderRadius:"50%",color:T.muted,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"clamp(16px,4vw,28px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div><h2 style={{fontFamily:T.font,fontSize:"clamp(17px,3vw,24px)",fontWeight:700,color:T.white,marginBottom:3}}>{nft.name}</h2><p style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{collection.creator} · {collection.role}</p></div>
            <Tag>{nft.rarity}</Tag>
          </div>
          <p style={{fontFamily:T.font,fontSize:14,color:T.muted,lineHeight:1.8,marginTop:12,marginBottom:20}}>{nft.description}</p>
          <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:20}}>
            {["story","traits","perks","events"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",borderBottom:tab===t?`2px solid ${T.gold}`:"2px solid transparent",color:tab===t?T.gold:T.muted,fontFamily:T.mono,fontSize:11,letterSpacing:1,textTransform:"uppercase",padding:"0 0 10px",marginRight:12,marginBottom:-1,transition:`all 0.18s`,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
          {tab==="story" &&<div style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,lineHeight:1.9,borderLeft:`2px solid ${T.gold}33`,paddingLeft:16}}>"{nft.story}"</div>}
          {tab==="traits"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{nft.traits.map(tr=><div key={tr.k} style={{border:`1px solid ${T.border}`,borderRadius:4,padding:"10px 13px"}}><div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:2,letterSpacing:1}}>{tr.k}</div><div style={{fontFamily:T.font,fontSize:15,color:T.white,fontWeight:600}}>{tr.v}</div></div>)}</div>}
          {tab==="perks" &&<div style={{display:"flex",flexDirection:"column",gap:7}}>{nft.perks.map((p,i)=><div key={i} style={{display:"flex",gap:11,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:16,minWidth:24}}>{p.split(" ")[0]}</span><span style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.6}}>{p.split(" ").slice(1).join(" ")}</span></div>)}</div>}
          {tab==="events"&&(collection.events.length===0?<p style={{fontFamily:T.font,color:T.muted,fontStyle:"italic"}}>No upcoming events.</p>:collection.events.map(ev=><div key={ev.id} style={{border:`1px solid ${T.border}`,borderRadius:4,padding:"13px 16px",marginBottom:8}}><div style={{fontFamily:T.font,fontSize:15,color:T.white,marginBottom:3,fontWeight:600}}>{ev.title}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.gold,marginBottom:6}}>{ev.date} · {ev.location}</div><div style={{fontFamily:T.sans,fontSize:13,color:T.muted}}>{ev.desc}</div></div>))}
          <Divider style={{margin:"20px 0"}} />
          {step==="view"&&<div style={{display:"flex",gap:12,alignItems:"center"}}><div><div style={{fontFamily:T.font,fontSize:20,color:T.gold,fontWeight:600}}>{nft.price} ETH</div><div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>GHS {nft.momoPrice}</div></div><div style={{marginLeft:"auto"}}>{user?<Btn onClick={()=>setStep("momo")}>Buy with MoMo</Btn>:<span style={{fontFamily:T.mono,fontSize:12,color:T.muted}}>Sign in to purchase</span>}</div></div>}
          {step==="momo"&&<div><p style={{fontFamily:T.font,fontSize:14,color:T.muted,marginBottom:14}}>Enter your MTN MoMo number.</p><input value={momoNum} onChange={e=>setMomoNum(e.target.value)} placeholder="024 XXX XXXX" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:4,padding:"12px 14px",color:T.white,fontSize:14,outline:"none",marginBottom:10}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/><div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={()=>setStep("view")}>Back</Btn><Btn style={{flex:2}} onClick={()=>{if(momoNum.length>7)setStep("confirm");}}>Pay GHS {nft.momoPrice}</Btn></div></div>}
          {step==="confirm"&&<div style={{textAlign:"center"}}><div style={{fontFamily:T.font,fontSize:36,color:T.gold,marginBottom:12}}>◎</div><h3 style={{fontFamily:T.font,fontSize:20,color:T.white,marginBottom:7,fontWeight:700}}>Payment Initiated</h3><p style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.8,marginBottom:18}}>Approve the MoMo prompt on your phone.</p><div style={{border:`1px solid ${T.gold}33`,borderRadius:4,padding:12,fontFamily:T.mono,fontSize:11,color:T.gold,marginBottom:18}}>{user?.wallet}</div><Btn full onClick={()=>{onBuy(nft);onClose();}}>Done</Btn></div>}
        </div>
      </div>
    </div>
  );
}

// ── Explore ────────────────────────────────────────────────────────────────────
function ExplorePage({ collections, onSelectNFT, user }) {
  const [search,setSearch]=useState(""); const [rarity,setRarity]=useState("All");
  const all=collections.flatMap(c=>c.nfts.map(n=>({nft:n,collection:c})));
  const filtered=all.filter(({nft,collection})=>{const q=search.toLowerCase();return(!q||nft.name.toLowerCase().includes(q)||collection.creator.toLowerCase().includes(q))&&(rarity==="All"||nft.rarity===rarity);});
  return (
    <div style={{maxWidth:1040,margin:"0 auto",padding:"0 clamp(12px,4vw,24px)",animation:`fadeUp 0.34s ${T.smooth} both`}}>
      <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pieces…" style={{flex:1,minWidth:140,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:6,padding:"10px 14px",color:T.white,fontFamily:T.sans,fontSize:13,outline:"none"}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["All","Common","Rare","Epic","Legendary"].map(r=><Btn key={r} variant={rarity===r?"gold":"ghost"} size="sm" onClick={()=>setRarity(r)}>{r}</Btn>)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,250px),1fr))",gap:14}}>
        {filtered.map(({nft,collection})=><NFTCard key={nft.id} nft={nft} collection={collection} onClick={onSelectNFT} owned={user?.ownedNFTs?.includes(nft.id)} />)}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:80,fontFamily:T.font,fontStyle:"italic",color:T.muted}}>No pieces found.</div>}
    </div>
  );
}

// ── Creators ───────────────────────────────────────────────────────────────────
function CreatorsPage({ collections, onSelectNFT }) {
  const [sel,setSel]=useState(null);
  const c=collections.find(x=>x.id===sel);
  if(c) return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(12px,4vw,24px)",animation:`fadeUp 0.34s ${T.smooth} both`}}>
      <Btn variant="ghost" size="sm" onClick={()=>setSel(null)} style={{marginBottom:22}}>← All Creators</Btn>
      <div className="glass" style={{border:`1px solid ${c.accent}33`,borderRadius:10,padding:"clamp(18px,4vw,36px)",marginBottom:26}}>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          {c.media?.data?<img src={c.media.data} alt="" style={{width:64,height:64,borderRadius:8,objectFit:"cover",border:`2px solid ${c.accent}55`}} />
            :<div style={{width:64,height:64,minWidth:64,borderRadius:"50%",border:`2px solid ${c.accent}66`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:32,color:c.accent}}>{c.avatar}</div>}
          <div style={{flex:1,minWidth:130}}>
            <h2 style={{fontFamily:T.font,fontSize:"clamp(20px,4vw,30px)",fontWeight:700,color:T.white,marginBottom:5}}>{c.name}</h2>
            <Tag color={c.accent}>{c.role}</Tag>
            <div style={{display:"flex",gap:18,marginTop:10,flexWrap:"wrap"}}>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{c.followers} <span style={{color:T.white}}>followers</span></span>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{c.totalPieces} <span style={{color:T.white}}>pieces</span></span>
            </div>
          </div>
          <Btn variant="outline">Follow</Btn>
        </div>
        <Divider style={{margin:"18px 0"}} />
        <p style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,lineHeight:1.9}}>{c.description}</p>
      </div>
      {c.events.length>0&&<div style={{marginBottom:24}}><h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:12}}>Upcoming Events</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>{c.events.map(ev=><div key={ev.id} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"16px 18px"}}><div style={{fontFamily:T.font,fontSize:15,color:T.white,marginBottom:4,fontWeight:600}}>{ev.title}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.gold,marginBottom:6}}>{ev.date} · {ev.location}</div><div style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.6}}>{ev.desc}</div></div>)}</div></div>}
      <h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:12}}>Collection</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,250px),1fr))",gap:14}}>{c.nfts.map(nft=><NFTCard key={nft.id} nft={nft} collection={c} onClick={onSelectNFT} />)}</div>
    </div>
  );
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(12px,4vw,24px)",animation:`fadeUp 0.34s ${T.smooth} both`}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,190px),1fr))",gap:14}}>
        {collections.map(col=>(
          <div key={col.id} className="card-lift glass" onClick={()=>setSel(col.id)} style={{border:`1px solid ${col.accent}22`,borderRadius:10,padding:"clamp(16px,3vw,26px)",cursor:"pointer",textAlign:"center"}}>
            {col.media?.data?<img src={col.media.data} alt="" style={{width:52,height:52,borderRadius:8,objectFit:"cover",border:`1px solid ${col.accent}44`,margin:"0 auto 14px",display:"block"}} />
              :<div style={{width:52,height:52,minWidth:52,borderRadius:"50%",border:`2px solid ${col.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:24,color:col.accent,margin:"0 auto 14px"}}>{col.avatar}</div>}
            <div style={{fontFamily:T.font,fontSize:16,fontWeight:700,color:T.white,marginBottom:3}}>{col.name}</div>
            <div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginBottom:12}}>{col.creator}</div>
            <Tag color={col.accent}>{col.role}</Tag>
            <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:12}}>
              <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{col.followers}</span>
              <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{col.nfts.length} NFTs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Wallet ─────────────────────────────────────────────────────────────────────
function WalletPage({ user, collections, onSelectNFT }) {
  if(!user) return <div style={{maxWidth:480,margin:"80px auto",textAlign:"center",padding:"24px 16px",animation:`fadeUp 0.34s ${T.smooth} both`}}><div style={{fontFamily:T.font,fontSize:40,color:T.dim,marginBottom:18}}>◎</div><h2 style={{fontFamily:T.font,fontSize:22,fontWeight:700,color:T.white,marginBottom:8}}>Your Collection</h2><p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted}}>Sign in to view your wallet and NFTs.</p></div>;
  const owned=collections.flatMap(c=>c.nfts.filter(n=>user.ownedNFTs?.includes(n.id)).map(n=>({nft:n,collection:c})));
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(12px,4vw,24px)",animation:`fadeUp 0.34s ${T.smooth} both`}}>
      <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(16px,4vw,30px)",marginBottom:26,display:"flex",gap:18,flexWrap:"wrap",alignItems:"center"}}>
        <AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:user.avatar||"◆"}} zodiac={user.profile?.zodiac} size={50} border />
        <div style={{flex:1,minWidth:120}}>
          <div style={{fontFamily:T.font,fontSize:"clamp(15px,3vw,22px)",fontWeight:700,color:T.white,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>{user.profile?.displayName||user.name}{user.verified&&<VerifiedCrown />}</div>
          {user.profile?.zodiac&&<div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginTop:2}}>{user.profile.zodiac.symbol} {user.profile.zodiac.sign}</div>}
          <div style={{fontFamily:T.mono,fontSize:11,color:T.gold,marginTop:3}}>{user.wallet}</div>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginTop:2}}>Polygon · {owned.length} pieces</div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[["Portfolio","~2.2 ETH",T.gold],["Pieces",owned.length,T.green]].map(([l,v,col])=>(
            <div key={l} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"12px 18px",textAlign:"center"}}>
              <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:4,letterSpacing:1}}>{l}</div>
              <div style={{fontFamily:T.font,fontSize:19,color:col,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      {owned.length===0?<div style={{textAlign:"center",padding:80,fontFamily:T.font,fontStyle:"italic",color:T.muted}}>Your collection is empty. Begin exploring.</div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,250px),1fr))",gap:14}}>{owned.map(({nft,collection})=><NFTCard key={nft.id} nft={nft} collection={collection} onClick={onSelectNFT} owned />)}</div>}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded,setLoaded]             = useState(false);
  const [page,setPage]                 = useState("feed");
  const [user,setUser]                 = useState(null);
  const [isAdmin,setIsAdmin]           = useState(false);
  const [authLoading,setAuthLoading]   = useState(true);
  const [selectedNFT,setSelectedNFT]   = useState(null);
  const [selectedColl,setSelectedColl] = useState(null);
  const [collections,setCollections]   = useState(SEED_COLLECTIONS);
  const [posts,setPosts]               = useState(SEED_POSTS);
  const [flaggedUsers,setFlaggedUsers] = useState({});
  const [verifiedUsers,setVerifiedUsers]=useState({"abena.k":true,"ama.s":true});
  const [toast,setToast]               = useState(null);

  const showToast=useCallback((msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2600);},[]);

  // ── Firebase auth listener ──────────────────────────────────────────────────
  useEffect(()=>{
    // Handle redirect result from mobile Google login
    getRedirectResult(auth).then(async result => {
      if (result?.user) {
        const fbUser = result.user;
        await createUserProfile(fbUser.uid, {
          name: fbUser.displayName,
          email: fbUser.email,
          avatar: fbUser.photoURL || "◆",
          provider: "google",
        });
      }
    }).catch(()=>{});

    const unsub = onAuthStateChanged(auth, async (fbUser)=>{
      if(fbUser){
        const profile = await createUserProfile(fbUser.uid, {
          name: fbUser.displayName,
          email: fbUser.email,
          avatar: fbUser.photoURL || "◆",
          provider: "google",
        });
        const isAdm = fbUser.email === "admin@paradiseonearth.io" || false;
        setUser({ uid:fbUser.uid, name:fbUser.displayName, email:fbUser.email,
          photoURL:fbUser.photoURL, ...profile });
        setIsAdmin(isAdm);
      } else {
        setUser(null); setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  },[]);

  // ── Firebase real-time posts ────────────────────────────────────────────────
  useEffect(()=>{
    const unsub = subscribeToPosts(livePosts=>{
      if(livePosts.length > 0) setPosts(livePosts);
    });
    return unsub;
  },[]);

  // ── Firebase real-time collections ─────────────────────────────────────────
  useEffect(()=>{
    const unsub = subscribeToCollections(liveCols=>{
      if(liveCols.length > 0) setCollections(liveCols);
    });
    return unsub;
  },[]);

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async ()=>{
    try {
      setPage("loading");
      await signInWithGoogle();
      // Page will redirect to Google — no code runs after this
    } catch(e){
      console.error(e);
      setPage("auth");
    }
  },[]);

  const handleAdminAuth = useCallback(()=>{
    setIsAdmin(true); setUser({...ADMIN_PROFILE}); setPage("feed");
  },[]);

  const handleLogout = useCallback(async ()=>{
    await logOut(); setUser(null); setIsAdmin(false); setPage("feed"); showToast("Signed out");
  },[showToast]);

  // ── Data handlers ───────────────────────────────────────────────────────────
  const handleBuy        = useCallback(nft=>setUser(p=>({...p,ownedNFTs:[...(p.ownedNFTs||[]),nft.id]})),[]);
  const handleSelectNFT  = useCallback((nft,col)=>{setSelectedNFT(nft);setSelectedColl(col);},[]);
  const handleUpdateUser = useCallback(async u=>{
    setUser(u);
    if(u.uid) await updateUserProfile(u.uid, u.profile||{});
  },[]);

  const handlePost = useCallback(async p=>{
    try {
      await createPost({ ...p, uid:user?.uid||"anon" });
    } catch(e){
      setPosts(prev=>[p,...prev]); // fallback to local
    }
  },[user]);

  const handleLike = useCallback(async id=>{
    try { await likePost(id, user?.uid||"anon"); }
    catch(e){ setPosts(prev=>prev.map(p=>p.id===id?{...p,likedByMe:!p.likedByMe}:p)); }
  },[user]);

  // ── Mod handlers ────────────────────────────────────────────────────────────
  const handleBlockPost  = useCallback(async id=>{
    const p = posts.find(x=>x.id===id);
    try { await blockPost(id, !p?.blocked); } catch(e){}
  },[posts]);

  const handleFlagUser   = useCallback(async username=>{
    if(flaggedUsers[username]){
      setFlaggedUsers(prev=>{const n={...prev};delete n[username];return n;});
      try{ await unflagUser(username); }catch(e){}
    } else {
      const at = new Date().toLocaleString();
      setFlaggedUsers(prev=>({...prev,[username]:{at}}));
      try{ await flagUser(username,{at,flaggedBy:"admin"}); }catch(e){}
    }
  },[flaggedUsers]);

  const handleVerify     = useCallback(async username=>{
    setVerifiedUsers(prev=>({...prev,[username]:!prev[username]}));
    try{ await verifyUser(username, !verifiedUsers[username]); }catch(e){}
  },[verifiedUsers]);

  const handlePin        = useCallback(async id=>{
    const p = posts.find(x=>x.id===id);
    try{ await pinPost(id, !p?.pinned); }
    catch(e){ setPosts(prev=>prev.map(p=>p.id===id?{...p,pinned:!p.pinned}:p)); }
  },[posts]);

  const handleDeletePost = useCallback(async id=>{
    try{ await fbDeletePost(id); }
    catch(e){ setPosts(prev=>prev.filter(p=>p.id!==id)); }
  },[]);

  const handleWarn = useCallback(u=>showToast(`⚠️ Warning sent to @${u}`),[showToast]);

  const enrichedPosts=posts.map(p=>({...p,
    verified:!!verifiedUsers[p.username],
    flagged:!!flaggedUsers[p.username],
    flaggedAt:flaggedUsers[p.username]?.at,
    likedByMe:p.likedBy?.includes(user?.uid),
  })).sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));

  const modProps={onBlockPost:handleBlockPost,onFlagUser:handleFlagUser,onVerify:handleVerify,onPin:handlePin,onDeletePost:handleDeletePost,onWarn:handleWarn,flaggedUsers,verifiedUsers};
  const showHeader=!["auth","admin","profile"].includes(page);
  const pageMap={feed:"Feed",explore:"Explore",creators:"Creators",wallet:"Collection",profile:"Profile",admin:"Admin"};

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.white,position:"relative"}}>
      <style>{GLOBAL_CSS}</style>
      <GalaxyBackground />
      {toast&&<Toast msg={toast.msg} type={toast.type} />}
      <div style={{position:"relative",zIndex:1}}>
        {!loaded&&<Loader onDone={()=>setLoaded(true)} />}
        {page!=="auth"&&<Nav page={page} setPage={setPage} user={user} isAdmin={isAdmin} />}
        <main style={{paddingTop:page==="auth"?0:56,paddingBottom:66}}>
          {authLoading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}>
              <span style={{fontSize:28,color:T.gold,animation:"spin 1s linear infinite"}}>◌</span>
            </div>
          ) : (
            <>
              {showHeader&&(
                <div style={{textAlign:"center",padding:"34px 0 26px"}}>
                  <h1 style={{fontFamily:T.font,fontSize:12,fontWeight:700,letterSpacing:6,color:T.white,textTransform:"uppercase",marginBottom:7}}>{pageMap[page]}</h1>
                  <div style={{width:18,height:1,background:T.gold,margin:"0 auto"}} />
                </div>
              )}
              <Suspense fallback={<Spin />}>
                {page==="feed"    &&<SocialFeedPage user={user} collections={collections} onSelectNFT={handleSelectNFT} posts={enrichedPosts} onPost={handlePost} onLike={handleLike} />}
                {page==="explore" &&<ExplorePage collections={collections} onSelectNFT={handleSelectNFT} user={user} />}
                {page==="creators"&&<CreatorsPage collections={collections} onSelectNFT={handleSelectNFT} />}
                {page==="wallet"  &&<WalletPage user={user} collections={collections} onSelectNFT={handleSelectNFT} />}
                {page==="profile" &&<ProfilePage user={user} onUpdateUser={handleUpdateUser} onGoToFeed={()=>setPage("feed")} onLogout={handleLogout} />}
                {page==="auth"    &&<AuthPage onGoogleLogin={handleGoogleLogin} onAdminAuth={handleAdminAuth} />}
                {page==="admin"   &&isAdmin&&<AdminPanel collections={collections} setCollections={setCollections} posts={enrichedPosts} verifiedUsers={verifiedUsers} {...modProps} />}
                {page==="admin"   &&!isAdmin&&<div style={{textAlign:"center",padding:80,fontFamily:T.font,color:T.muted}}>Access denied.</div>}
              </Suspense>
            </>
          )}
        </main>
        <NFTModal nft={selectedNFT} collection={selectedColl} onClose={()=>{setSelectedNFT(null);setSelectedColl(null);}} user={user} onBuy={handleBuy} />
        {page!=="auth"&&(
          <nav className="glass-h" style={{position:"fixed",bottom:0,left:0,right:0,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"center",padding:"6px 0 10px"}}>
            {[["feed","◈","Feed"],["explore","◉","Explore"],["creators","◆","Creators"],["wallet","◇","Wallet"],["profile","△","Profile"]].map(([p,icon,label])=>(
              <button key={p} onClick={()=>setPage(p)} style={{background:"none",border:"none",padding:"5px clamp(8px,3vw,16px)",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:page===p?T.gold:T.muted,transition:`color 0.18s ${T.smooth}`,minWidth:52,cursor:"pointer"}}>
                <span style={{fontFamily:T.font,fontSize:17,lineHeight:1}}>{icon}</span>
                <span style={{fontFamily:T.sans,fontSize:9,fontWeight:page===p?700:500,letterSpacing:1,textTransform:"uppercase"}}>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
