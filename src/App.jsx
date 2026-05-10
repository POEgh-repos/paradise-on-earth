import { useState, useCallback, useEffect, useRef, Suspense, lazy } from "react";
import { T, GLOBAL_CSS, Btn, Divider, Tag, VerifiedCrown, FlagBadge, Toast, AnimatedAvatar } from "./tokens";
import GalaxyBackground from "./GalaxyBackground";
import {
  auth, signInWithGoogle, getGoogleRedirect, listenAuth, logOut,
  createUserProfile, updateUserProfile,
  createPost, subscribeToPosts, likePost, setPinned, setBlocked, deletePost,
  subscribeToCollections, saveCollection,
  subscribeToNotifications, markNotifRead,
  storage_ls,
} from "./firebase";

const ProfilePage    = lazy(() => import("./ProfilePage"));
const SocialFeedPage = lazy(() => import("./SocialFeed"));
const AdminPanel     = lazy(() => import("./AdminPanel"));

// ── Admin identity ────────────────────────────────────────────────────────────
export const ADMIN_PROFILE = {
  uid:"ADMIN", name:"GOD🤎", email:"admin@paradise.io",
  wallet:"0xADM1N…PARADISE", verified:true, flagged:false, ownedNFTs:[],
  profile:{ displayName:"GOD🤎", username:"humble_servant",
    bio:"Steward of PARADISE on Earth.", coverColor:"#120e00",
    avatar:{type:"symbol",value:"◈"}, zodiac:null, banner:null },
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED = {
  collections: [
    { id:"c1", name:"Ancestral Frequencies", creator:"Amara Diallo", role:"Musician",
      avatar:"♪", accent:"#c9a96e", description:"A sonic journey through ancestral memory.",
      followers:"12.4K", totalPieces:34, media:null,
      nfts:[
        { id:"n101", name:"Rhythm of Accra — I", price:"0.8", momoPrice:"1,200", rarity:"Rare",
          image:"♪", bg:"linear-gradient(160deg,#0d0b07,#2a1f0a,#3d2e10)", likes:234,
          description:"Field recordings from Accra markets layered with kora and synthesizer.",
          story:"Recorded at dawn in Jamestown, Accra.",
          traits:[{k:"Mood",v:"Transcendent"},{k:"Key",v:"D Minor"},{k:"BPM",v:"72"}],
          perks:["🎧 Unreleased stems","🎤 Private listening session","📜 Signed certificate"] },
        { id:"n102", name:"Lagos Nights — III", price:"0.6", momoPrice:"900", rarity:"Epic",
          image:"🌙", bg:"linear-gradient(160deg,#060810,#0c1020,#141830)", likes:156,
          description:"Nocturnal Lagos distilled into 4 minutes of ambient jazz.",
          story:"3am on Victoria Island. The city never sleeps.",
          traits:[{k:"Mood",v:"Nocturnal"},{k:"Key",v:"F# Major"},{k:"BPM",v:"88"}],
          perks:["🎧 Lossless audio","🖼️ Exclusive art print","💬 1-on-1 voice message"] },
      ], events:[{id:"e1",title:"Live Recording Session",date:"2025-08-14",location:"Accra, Ghana",desc:"NFT holders get private studio access."}] },
    { id:"c2", name:"Kente Futures", creator:"Kwame Asante", role:"Fashion Designer",
      avatar:"◈", accent:"#a8c5a0", description:"Wearable NFTs that unlock custom garments.",
      followers:"8.9K", totalPieces:21, media:null,
      nfts:[
        { id:"n201", name:"Kente Reimagined — VII", price:"1.2", momoPrice:"1,800", rarity:"Legendary",
          image:"◈", bg:"linear-gradient(160deg,#060d08,#0f2410,#163318)", likes:412,
          description:"Kente strip reinterpreted as wearable digital art with physical twin.",
          story:"My grandmother wove Kente for 40 years. This is her pattern, my remix.",
          traits:[{k:"Pattern",v:"Oyokoman"},{k:"Edition",v:"1 of 7"},{k:"Physical",v:"Yes"}],
          perks:["👗 Bespoke garment","✂️ Fitting session","📸 Campaign feature"] },
      ], events:[] },
    { id:"c3", name:"Second Life Objects", creator:"Zara Mensah", role:"Up-cycler",
      avatar:"∞", accent:"#c4a882", description:"Every object has a second life.",
      followers:"15.2K", totalPieces:47, media:null,
      nfts:[
        { id:"n301", name:"Second Life Vessel — XIV", price:"0.4", momoPrice:"600", rarity:"Common",
          image:"∞", bg:"linear-gradient(160deg,#0d0906,#26180a,#3a2410)", likes:178,
          description:"A clay vessel reconstructed from 47 discarded fragments.",
          story:"Found in a dump in Kumasi. 3 months of restoration.",
          traits:[{k:"Material",v:"Reclaimed Clay"},{k:"Origin",v:"Kumasi"},{k:"Fragments",v:"47"}],
          perks:["📦 Physical object shipped","🎥 Process documentary","🏺 Artist signature"] },
      ], events:[] },
    { id:"c4", name:"Gaze Studies", creator:"Nia Okafor", role:"Visual Artist",
      avatar:"◉", accent:"#b8a0c8", description:"Portraits that stare back.",
      followers:"22.1K", totalPieces:58, media:null,
      nfts:[
        { id:"n401", name:"Ancestral Gaze — XXII", price:"2.1", momoPrice:"3,150", rarity:"Legendary",
          image:"◉", bg:"linear-gradient(160deg,#08060d,#181025,#241540)", likes:891,
          description:"The gaze that has watched empires rise and fall.",
          story:"My great-grandmother's photograph. Her eyes.",
          traits:[{k:"Medium",v:"Oil on Canvas"},{k:"Resolution",v:"12K"},{k:"Year",v:"2024"}],
          perks:["🖼️ Museum-grade print","🎨 Studio visit — Lagos","📖 Monograph inclusion"] },
      ], events:[{id:"e3",title:"Gallery Opening",date:"2025-10-05",location:"Lagos, Nigeria",desc:"Reserved seating for NFT holders."}] },
  ],
  posts: [
    { id:"p1", collectionId:"c1", nftId:"n102", user:"Kofi B.", username:"kofi.b",
      avatar:{type:"zodiac",value:"Leo",symbol:"♌"}, zodiac:{sign:"Leo",symbol:"♌"},
      time:"2m ago", action:"acquired", comment:"Lagos Nights is everything I needed tonight. The detail is extraordinary.", likes:14, comments:3, reposts:2, likedBy:[], pinned:false, blocked:false },
    { id:"p2", collectionId:"c4", nftId:"n401", user:"Abena K.", username:"abena.k",
      avatar:{type:"zodiac",value:"Virgo",symbol:"♍"}, zodiac:{sign:"Virgo",symbol:"♍"},
      time:"18m ago", action:"is holding", comment:"Ancestral Gaze arrived in my wallet. I cannot stop looking at it.", likes:31, comments:7, reposts:5, likedBy:[], pinned:false, blocked:false },
    { id:"p3", collectionId:"c2", nftId:"n201", user:"Yaw M.", username:"yaw.m",
      avatar:{type:"zodiac",value:"Gemini",symbol:"♊"}, zodiac:{sign:"Gemini",symbol:"♊"},
      time:"1h ago", action:"purchased", comment:"Supporting African fashion permanently. #Kente #AfricanArt", likes:22, comments:2, reposts:8, likedBy:[], pinned:false, blocked:false },
    { id:"p4", collectionId:"c3", nftId:"n301", user:"Ama S.", username:"ama.s",
      avatar:{type:"zodiac",value:"Pisces",symbol:"♓"}, zodiac:{sign:"Pisces",symbol:"♓"},
      time:"4h ago", action:"collected", comment:"The story behind each fragment moved me. @zara.m you outdid yourself 🙏 #UpCycle", likes:47, comments:11, reposts:14, likedBy:[], pinned:false, blocked:false },
  ],
};

// ── Page transition wrapper ───────────────────────────────────────────────────
function PageTransition({ children, pageKey }) {
  const [display,setDisplay] = useState(children);
  const [anim,setAnim]       = useState("in");
  const prev = useRef(pageKey);

  useEffect(() => {
    if (prev.current === pageKey) return;
    setAnim("out");
    const t = setTimeout(() => {
      setDisplay(children);
      setAnim("in");
      prev.current = pageKey;
    }, 160);
    return () => clearTimeout(t);
  }, [pageKey, children]);

  return (
    <div style={{
      opacity:    anim === "out" ? 0 : 1,
      transform:  anim === "out" ? "translateY(8px)" : "translateY(0)",
      transition: `opacity 0.18s ${T.smooth}, transform 0.18s ${T.smooth}`,
    }}>
      {display}
    </div>
  );
}

// ── Loader ────────────────────────────────────────────────────────────────────
function Loader({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      animation:`fadeOut 0.5s ${T.smooth} 2.2s both`}}>
      <GalaxyBackground />
      <div style={{position:"relative",zIndex:2,textAlign:"center",padding:"0 20px",width:"100%"}}>
        <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:6,color:T.muted,marginBottom:22,animation:"shimmer 2s ease infinite"}}>LOADING</div>
        <div style={{fontFamily:T.font,fontSize:"clamp(38px,9vw,62px)",fontWeight:700,color:T.white,letterSpacing:"0.2em",animation:`fadeUp 0.7s ${T.smooth} 0.2s both`}}>PARADISE</div>
        <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:"clamp(15px,3vw,22px)",color:T.gold,letterSpacing:"0.22em",marginTop:6,animation:`fadeUp 0.7s ${T.smooth} 0.4s both`}}>on Earth</div>
        {/* Centred progress bar */}
        <div style={{marginTop:46,display:"flex",justifyContent:"center",animation:`fadeUp 0.5s ${T.smooth} 0.7s both`}}>
          <div style={{width:"min(240px,62vw)",position:"relative"}}>
            <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"visible",position:"relative"}}>
              <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:2,
                background:`linear-gradient(90deg,${T.gold}66,${T.gold},#fff9e6,${T.gold})`,
                backgroundSize:"200% 100%",
                animation:"barLoad 1.8s ease 0.8s both, barShimmer 1.4s ease 0.8s infinite",
                width:0}}>
                <div style={{position:"absolute",right:-4,top:"50%",transform:"translateY(-50%)",
                  width:8,height:8,borderRadius:"50%",background:T.gold,
                  boxShadow:`0 0 10px ${T.gold}`}} />
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:18}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.gold,
                  animation:`dotPulse 1.2s ease ${i*0.18}s infinite`}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotifBell({ uid, onOpen }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToNotifications(uid, setNotifs);
    return unsub;
  }, [uid]);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <button onClick={onOpen} style={{background:"none",border:"none",position:"relative",
      cursor:"pointer",padding:"4px 6px",color:unread?T.gold:T.muted,
      fontSize:20,lineHeight:1,transition:`color 0.2s`}}
      className={unread?"bell-ring":""}>
      🔔
      {unread > 0 && (
        <span style={{position:"absolute",top:0,right:0,width:16,height:16,borderRadius:"50%",
          background:T.red,color:"#fff",fontFamily:T.mono,fontSize:9,fontWeight:700,
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:"notifPop 0.3s ease"}}>
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

// ── Notif Panel ───────────────────────────────────────────────────────────────
function NotifPanel({ uid, onClose }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToNotifications(uid, setNotifs);
    return unsub;
  }, [uid]);
  const markAll = () => notifs.filter(n=>!n.read).forEach(n=>markNotifRead(uid,n.id));

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",zIndex:600,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:"62px 16px 0"}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h" style={{width:"min(360px,95vw)",border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden",maxHeight:"70vh",display:"flex",flexDirection:"column",animation:`scaleIn 0.22s ${T.ease} both`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontFamily:T.font,fontSize:16,fontWeight:700,color:T.white}}>Notifications</span>
          <div style={{display:"flex",gap:8}}>
            {notifs.some(n=>!n.read)&&<Btn variant="ghost" size="sm" onClick={markAll}>Mark all read</Btn>}
            <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {notifs.length === 0 ? (
            <div style={{padding:40,textAlign:"center",fontFamily:T.font,fontStyle:"italic",color:T.muted}}>No notifications yet.</div>
          ) : notifs.map(n=>(
            <div key={n.id} onClick={()=>markNotifRead(uid,n.id)} style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",background:n.read?"transparent":"rgba(201,169,110,0.05)",transition:`background 0.18s`}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,lineHeight:1,marginTop:1}}>{n.icon||"◈"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:T.sans,fontSize:13,color:n.read?T.muted:T.white,lineHeight:1.5}}>{n.message}</div>
                  <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:3}}>{n.timeLabel||"Just now"}</div>
                </div>
                {!n.read&&<div style={{width:6,height:6,borderRadius:"50%",background:T.gold,marginTop:5,flexShrink:0}} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Top Nav ───────────────────────────────────────────────────────────────────
function Nav({ page, setPage, user, isAdmin, onNotifOpen }) {
  const links = [["feed","Feed"],["explore","Explore"],["creators","Creators"],["wallet","Wallet"]];
  return (
    <nav className="glass-h" style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
      borderBottom:`1px solid ${T.border}`,height:56,display:"flex",alignItems:"center",
      paddingLeft:"clamp(10px,3vw,24px)",paddingRight:"clamp(8px,2vw,16px)",gap:0}}>
      <div onClick={()=>setPage("feed")} style={{cursor:"pointer",fontFamily:T.font,
        display:"flex",flexDirection:"column",lineHeight:1.1,userSelect:"none",flexShrink:0,
        marginRight:"clamp(8px,2vw,20px)"}}>
        <span style={{fontSize:"clamp(12px,2vw,17px)",fontWeight:700,letterSpacing:"0.22em",color:T.white}}>PARADISE</span>
        <span style={{fontSize:"clamp(8px,1.3vw,10px)",fontStyle:"italic",color:T.gold,letterSpacing:"0.18em"}}>on Earth</span>
      </div>
      <div style={{display:"flex",flex:1,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
        <style>{`::-webkit-scrollbar{display:none}`}</style>
        {links.map(([p,l])=>(
          <button key={p} onClick={()=>setPage(p)} className="nav-link"
            style={{background:"none",border:"none",color:page===p?T.gold:"#b0acc8",
              fontFamily:T.sans,fontSize:"clamp(10px,1.4vw,12px)",letterSpacing:"0.1em",
              textTransform:"uppercase",fontWeight:700,padding:"4px clamp(6px,1.5vw,13px)",
              borderBottom:page===p?`2px solid ${T.gold}`:"2px solid transparent",
              whiteSpace:"nowrap",flexShrink:0,cursor:"pointer",transition:`all 0.18s ${T.smooth}`}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
        {user && <NotifBell uid={user.uid} onOpen={onNotifOpen} />}
        {isAdmin && <Btn variant="admin" size="sm" onClick={()=>setPage("admin")}>Admin</Btn>}
        {user ? (
          <div onClick={()=>setPage("profile")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:7,padding:"3px 5px",borderRadius:6,border:"1px solid transparent",transition:`all 0.18s ${T.smooth}`}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor=T.border}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent"}}>
            <div style={{textAlign:"right"}} className="hide-sm">
              <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.white,display:"flex",alignItems:"center",gap:2}}>
                {isAdmin?<span className="god-text" style={{fontFamily:T.font,fontWeight:700,fontSize:13,color:T.gold}}>GOD🤎</span>
                  :<span>{user.profile?.displayName||user.name}</span>}
                {(user.verified||isAdmin)&&<VerifiedCrown />}
              </div>
              <div style={{fontFamily:T.mono,fontSize:9,color:isAdmin?T.gold:T.muted}}>
                @{isAdmin?"humble_servant":(user.profile?.username||"you")}
              </div>
            </div>
            <AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:"◆"}} zodiac={user.profile?.zodiac} size={30} border />
          </div>
        ) : (
          <Btn onClick={()=>setPage("auth")} size="sm">Sign In</Btn>
        )}
      </div>
    </nav>
  );
}

// ── Auth Page ─────────────────────────────────────────────────────────────────
function AuthPage({ onGoogleLogin, onAdminAuth }) {
  const [loading, setLoading]   = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [pass, setPass]           = useState("");
  const [err, setErr]             = useState("");

  const doGoogle = async () => {
    setLoading(true); setErr("");
    try { await onGoogleLogin(); }
    catch(e) { setLoading(false); setErr("Sign in failed. Please try again."); }
  };
  const doAdmin = () => {
    if (pass === "admin123") { onAdminAuth(); }
    else { setErr("Incorrect password."); }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{maxWidth:400,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontFamily:T.font,fontSize:"clamp(36px,9vw,56px)",fontWeight:700,letterSpacing:"0.2em",color:T.white}}>PARADISE</div>
          <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:18,color:T.gold,letterSpacing:"0.22em",marginTop:4}}>on Earth</div>
        </div>
        {!adminMode ? (
          <div className="glass-h" style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(22px,5vw,40px)"}}>
            <p style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,textAlign:"center",marginBottom:28,lineHeight:1.8}}>Sign in to receive your Polygon wallet and begin collecting.</p>
            {loading ? (
              <div style={{textAlign:"center",padding:32}}>
                <div style={{fontSize:28,color:T.gold,animation:"spin 1s linear infinite",display:"inline-block"}}>◌</div>
                <p style={{fontFamily:T.font,fontSize:13,color:T.muted,marginTop:12}}>Connecting to Google…</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <button onClick={doGoogle} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 20px",color:T.white,fontFamily:T.sans,fontSize:14,fontWeight:600,letterSpacing:"0.04em",cursor:"pointer",transition:`all 0.18s ${T.smooth}`}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background=T.goldSoft}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="rgba(255,255,255,0.04)"}}>
                  <span style={{color:T.gold,fontFamily:T.font,fontSize:22}}>◉</span>Continue with Google
                </button>
                {err && <p style={{fontFamily:T.mono,fontSize:11,color:T.red,textAlign:"center"}}>{err}</p>}
                <Divider style={{margin:"6px 0"}} />
                <button onClick={()=>setAdminMode(true)} style={{background:"none",border:"none",color:T.muted,fontFamily:T.mono,fontSize:11,letterSpacing:"0.06em",cursor:"pointer",padding:"4px 0"}}>Admin Access →</button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-h" style={{border:`1px solid ${T.gold}44`,borderRadius:10,padding:"clamp(22px,5vw,40px)"}}>
            <p style={{fontFamily:T.font,fontSize:17,color:T.gold,marginBottom:18,fontWeight:600}}>Admin Access</p>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdmin()} placeholder="Enter admin password"
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:4,padding:"12px 14px",color:T.white,fontSize:14,outline:"none",marginBottom:10}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
            {err&&<p style={{fontFamily:T.mono,fontSize:11,color:T.red,marginBottom:10}}>{err}</p>}
            <Btn full onClick={doAdmin}>Enter</Btn>
            <button onClick={()=>{setAdminMode(false);setErr("")}} style={{background:"none",border:"none",color:T.muted,fontSize:12,marginTop:12,width:"100%",cursor:"pointer",fontFamily:T.sans}}>← Back</button>
          </div>
        )}
        <p style={{fontFamily:T.mono,fontSize:10,color:T.muted,textAlign:"center",marginTop:16,letterSpacing:"0.06em"}}>Auto-assigns Polygon wallet · No crypto knowledge needed</p>
      </div>
    </div>
  );
}

// ── Wallet display with Polygon details ───────────────────────────────────────
function WalletBadge({ wallet }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(wallet).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1600);});
  };
  return (
    <div onClick={copy} title="Click to copy" style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
      background:"rgba(201,169,110,0.07)",border:`1px solid ${T.gold}33`,borderRadius:6,padding:"8px 14px",
      transition:`all 0.18s ${T.smooth}`}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(201,169,110,0.14)"}
      onMouseLeave={e=>e.currentTarget.style.background="rgba(201,169,110,0.07)"}>
      <span style={{fontSize:16}}>⬡</span>
      <span style={{fontFamily:T.mono,fontSize:11,color:T.gold,letterSpacing:"0.04em"}}>{wallet}</span>
      <span style={{fontFamily:T.mono,fontSize:10,color:copied?T.green:T.dim,marginLeft:4}}>{copied?"Copied!":"Copy"}</span>
    </div>
  );
}

// ── NFT Card ──────────────────────────────────────────────────────────────────
export function NFTCard({ nft, collection, onClick, owned }) {
  const [liked,setLiked]=useState(false);
  const rc={Common:"#888",Rare:T.gold,Epic:"#b8a0c8",Legendary:"#c9a96e"};
  return (
    <div className="card-lift glass" onClick={()=>onClick(nft,collection)} style={{border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",cursor:"pointer"}}>
      <div style={{height:180,background:nft.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,fontFamily:T.font,color:T.gold,position:"relative"}}>
        {nft.image}
        <div style={{position:"absolute",top:10,right:10,display:"flex",flexDirection:"column",gap:4}}>
          <Tag color={rc[nft.rarity]||T.gold}>{nft.rarity}</Tag>
          {owned&&<Tag color={T.green}>Owned</Tag>}
        </div>
      </div>
      <div style={{padding:"14px 14px 12px"}}>
        <div style={{fontFamily:T.font,fontSize:16,color:T.white,marginBottom:3,fontWeight:700,lineHeight:1.2}}>{nft.name}</div>
        <div style={{fontFamily:T.sans,fontSize:11,color:"#b0accc",marginBottom:10,fontWeight:600}}>{collection?.creator}</div>
        <Divider style={{marginBottom:10}} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:2,letterSpacing:"0.08em"}}>PRICE</div>
            <div style={{fontFamily:T.font,fontSize:17,color:T.gold,fontWeight:600}}>{nft.price} ETH</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>GHS {nft.momoPrice}</div>
          </div>
          <button onClick={e=>{e.stopPropagation();setLiked(!liked)}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"6px 10px",color:liked?"#e07070":T.muted,fontFamily:T.mono,fontSize:11,cursor:"pointer",transition:`all 0.18s ${T.smooth}`}}>
            {liked?"♥":"♡"} {(nft.likes||0)+(liked?1:0)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── NFT Modal ─────────────────────────────────────────────────────────────────
function NFTModal({ nft, collection, onClose, user, onBuy }) {
  const [tab,setTab]=useState("story");
  const [step,setStep]=useState("view");
  const [momoNum,setMomoNum]=useState("");
  if(!nft||!collection)return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(20px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h modal-in" style={{maxWidth:540,width:"100%",border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:190,background:nft.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,fontFamily:T.font,color:T.gold,position:"relative"}}>
          {nft.image}
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.55)",border:`1px solid ${T.border}`,width:32,height:32,borderRadius:"50%",color:T.muted,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"clamp(18px,4vw,28px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div>
              <h2 style={{fontFamily:T.font,fontSize:"clamp(18px,3vw,24px)",fontWeight:700,color:T.white,marginBottom:2}}>{nft.name}</h2>
              <p style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{collection.creator} · {collection.role}</p>
            </div>
            <Tag>{nft.rarity}</Tag>
          </div>
          <p style={{fontFamily:T.font,fontSize:14,color:T.muted,lineHeight:1.8,marginTop:10,marginBottom:18}}>{nft.description}</p>
          <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:18}}>
            {["story","traits","perks","events"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",borderBottom:tab===t?`2px solid ${T.gold}`:"2px solid transparent",color:tab===t?T.gold:T.muted,fontFamily:T.mono,fontSize:11,letterSpacing:"0.06em",textTransform:"uppercase",padding:"0 0 10px",marginRight:12,marginBottom:-1,transition:`all 0.18s ${T.smooth}`,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
          {tab==="story"&&<div style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,lineHeight:1.9,borderLeft:`2px solid ${T.gold}33`,paddingLeft:16}}>"{nft.story}"</div>}
          {tab==="traits"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{(nft.traits||[]).map(tr=><div key={tr.k} style={{border:`1px solid ${T.border}`,borderRadius:4,padding:"10px 13px"}}><div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:2,letterSpacing:"0.06em"}}>{tr.k}</div><div style={{fontFamily:T.font,fontSize:15,color:T.white,fontWeight:600}}>{tr.v}</div></div>)}</div>}
          {tab==="perks"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>{(nft.perks||[]).map((p,i)=><div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:16,minWidth:22}}>{p.split(" ")[0]}</span><span style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.6}}>{p.split(" ").slice(1).join(" ")}</span></div>)}</div>}
          {tab==="events"&&(collection.events?.length===0?<p style={{fontFamily:T.font,color:T.muted,fontStyle:"italic"}}>No upcoming events.</p>:(collection.events||[]).map(ev=><div key={ev.id} style={{border:`1px solid ${T.border}`,borderRadius:4,padding:"12px 15px",marginBottom:8}}><div style={{fontFamily:T.font,fontSize:15,color:T.white,marginBottom:3,fontWeight:600}}>{ev.title}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.gold,marginBottom:4}}>{ev.date} · {ev.location}</div><div style={{fontFamily:T.sans,fontSize:13,color:T.muted}}>{ev.desc}</div></div>))}
          <Divider style={{margin:"18px 0"}} />
          {step==="view"&&<div style={{display:"flex",gap:12,alignItems:"center"}}><div><div style={{fontFamily:T.font,fontSize:20,color:T.gold,fontWeight:600}}>{nft.price} ETH</div><div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>GHS {nft.momoPrice}</div></div><div style={{marginLeft:"auto"}}>{user?<Btn onClick={()=>setStep("momo")}>Buy with MoMo</Btn>:<span style={{fontFamily:T.mono,fontSize:12,color:T.muted}}>Sign in to purchase</span>}</div></div>}
          {step==="momo"&&<div><p style={{fontFamily:T.font,fontSize:14,color:T.muted,marginBottom:12}}>Enter your MTN MoMo number.</p><input value={momoNum} onChange={e=>setMomoNum(e.target.value)} placeholder="024 XXX XXXX" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:4,padding:"12px 14px",color:T.white,fontSize:14,outline:"none",marginBottom:10}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/><div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={()=>setStep("view")}>Back</Btn><Btn style={{flex:2}} onClick={()=>{if(momoNum.length>7)setStep("confirm")}}>Pay GHS {nft.momoPrice}</Btn></div></div>}
          {step==="confirm"&&<div style={{textAlign:"center"}}><div style={{fontFamily:T.font,fontSize:36,color:T.gold,marginBottom:12}}>◎</div><h3 style={{fontFamily:T.font,fontSize:20,color:T.white,marginBottom:6,fontWeight:700}}>Payment Initiated</h3><p style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.8,marginBottom:16}}>Approve the MoMo prompt on your phone.</p>{user&&<WalletBadge wallet={user.wallet} />}<div style={{marginTop:16}}><Btn full onClick={()=>{onBuy(nft);onClose()}}>Done — NFT is Yours</Btn></div></div>}
        </div>
      </div>
    </div>
  );
}

// ── Explore ───────────────────────────────────────────────────────────────────
function ExplorePage({ collections, onSelectNFT, user }) {
  const [search,setSearch]=useState("");
  const [rarity,setRarity]=useState("All");
  const all=collections.flatMap(c=>c.nfts?.map(n=>({nft:n,collection:c}))||[]);
  const filtered=all.filter(({nft,collection})=>{
    const q=search.toLowerCase();
    return(!q||nft.name.toLowerCase().includes(q)||collection.creator.toLowerCase().includes(q))
      &&(rarity==="All"||nft.rarity===rarity);
  });
  return (
    <div style={{maxWidth:1040,margin:"0 auto",padding:"0 clamp(14px,4vw,24px)"}}>
      <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pieces, creators…"
          style={{flex:1,minWidth:160,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:6,padding:"10px 14px",color:T.white,fontFamily:T.sans,fontSize:13,outline:"none"}}
          onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["All","Common","Rare","Epic","Legendary"].map(r=><Btn key={r} variant={rarity===r?"gold":"ghost"} size="sm" onClick={()=>setRarity(r)}>{r}</Btn>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,250px),1fr))",gap:16}}>
        {filtered.map(({nft,collection})=><NFTCard key={nft.id} nft={nft} collection={collection} onClick={onSelectNFT} owned={user?.ownedNFTs?.includes(nft.id)} />)}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:80,fontFamily:T.font,fontStyle:"italic",color:T.muted}}>No pieces found.</div>}
    </div>
  );
}

// ── Creators ──────────────────────────────────────────────────────────────────
function CreatorsPage({ collections, onSelectNFT }) {
  const [sel,setSel]=useState(null);
  const c=collections.find(x=>x.id===sel);
  if(c) return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(14px,4vw,24px)"}}>
      <Btn variant="ghost" size="sm" onClick={()=>setSel(null)} style={{marginBottom:22}}>← All Creators</Btn>
      <div className="glass" style={{border:`1px solid ${c.accent}33`,borderRadius:8,padding:"clamp(20px,4vw,36px)",marginBottom:26}}>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <div style={{width:62,height:62,minWidth:62,borderRadius:"50%",border:`2px solid ${c.accent}66`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:30,color:c.accent}}>{c.avatar}</div>
          <div style={{flex:1,minWidth:130}}>
            <h2 style={{fontFamily:T.font,fontSize:"clamp(20px,4vw,30px)",fontWeight:700,color:T.white,marginBottom:5}}>{c.name}</h2>
            <Tag color={c.accent}>{c.role}</Tag>
            <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{c.followers} <span style={{color:T.white}}>followers</span></span>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{c.totalPieces} <span style={{color:T.white}}>pieces</span></span>
            </div>
          </div>
          <Btn variant="outline">Follow</Btn>
        </div>
        <Divider style={{margin:"18px 0"}} />
        <p style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,lineHeight:1.9}}>{c.description}</p>
      </div>
      {(c.events?.length>0)&&<div style={{marginBottom:24}}><h3 style={{fontFamily:T.font,fontSize:17,fontWeight:700,color:T.white,marginBottom:12}}>Upcoming Events</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>{c.events.map(ev=><div key={ev.id} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 18px"}}><div style={{fontFamily:T.font,fontSize:14,color:T.white,marginBottom:3,fontWeight:600}}>{ev.title}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.gold,marginBottom:4}}>{ev.date} · {ev.location}</div><div style={{fontFamily:T.sans,fontSize:12,color:T.muted,lineHeight:1.6}}>{ev.desc}</div></div>)}</div></div>}
      <h3 style={{fontFamily:T.font,fontSize:17,fontWeight:700,color:T.white,marginBottom:14}}>Collection</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,250px),1fr))",gap:16}}>
        {(c.nfts||[]).map(nft=><NFTCard key={nft.id} nft={nft} collection={c} onClick={onSelectNFT} />)}
      </div>
    </div>
  );
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(14px,4vw,24px)"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(calc(50% - 8px),195px),1fr))",gap:14}}>
        {collections.map(col=>(
          <div key={col.id} className="card-lift glass" onClick={()=>setSel(col.id)} style={{border:`1px solid ${col.accent}22`,borderRadius:8,padding:"clamp(14px,3vw,24px)",cursor:"pointer",textAlign:"center"}}>
            <div style={{width:50,height:50,borderRadius:"50%",border:`2px solid ${col.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:22,color:col.accent,margin:"0 auto 12px"}}>{col.avatar}</div>
            <div style={{fontFamily:T.font,fontSize:"clamp(13px,2.4vw,16px)",fontWeight:700,color:T.white,marginBottom:3}}>{col.name}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:10}}>{col.creator}</div>
            <Tag color={col.accent}>{col.role}</Tag>
            <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:12}}>
              <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{col.followers}</span>
              <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{col.nfts?.length||0} NFTs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Wallet Page ───────────────────────────────────────────────────────────────
function WalletPage({ user, collections, onSelectNFT, setPage }) {
  if(!user) return (
    <div style={{maxWidth:480,margin:"60px auto",textAlign:"center",padding:"24px 16px"}}>
      <div style={{fontFamily:T.font,fontSize:40,color:T.dim,marginBottom:16}}>◎</div>
      <h2 style={{fontFamily:T.font,fontSize:22,fontWeight:700,color:T.white,marginBottom:8}}>Your Collection</h2>
      <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,marginBottom:20}}>Sign in to view your wallet and NFTs.</p>
      <Btn onClick={()=>setPage("auth")}>Sign In</Btn>
    </div>
  );
  const owned=collections.flatMap(c=>(c.nfts||[]).filter(n=>user.ownedNFTs?.includes(n.id)).map(n=>({nft:n,collection:c})));
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(14px,4vw,24px)"}}>
      <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"clamp(18px,4vw,32px)",marginBottom:26}}>
        <div style={{display:"flex",gap:18,flexWrap:"wrap",alignItems:"center"}}>
          <AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:"◆"}} zodiac={user.profile?.zodiac} size={52} border />
          <div style={{flex:1,minWidth:130}}>
            <div style={{fontFamily:T.font,fontSize:"clamp(16px,3vw,22px)",fontWeight:700,color:T.white,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
              {user.profile?.displayName||user.name}
              {user.verified&&<VerifiedCrown />}
            </div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginTop:4}}>Polygon Network</div>
            <div style={{marginTop:8}}><WalletBadge wallet={user.wallet||"0x…"} /></div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[["Portfolio","~2.2 ETH",T.gold],["Pieces",owned.length,T.green]].map(([l,v,col])=>(
              <div key={l} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"12px 20px",textAlign:"center"}}>
                <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:4,letterSpacing:"0.08em"}}>{l}</div>
                <div style={{fontFamily:T.font,fontSize:19,color:col,fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {owned.length===0
        ?<div style={{textAlign:"center",padding:70,fontFamily:T.font,fontStyle:"italic",color:T.muted}}>Your collection is empty. Begin exploring.</div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,250px),1fr))",gap:16}}>
          {owned.map(({nft,collection})=><NFTCard key={nft.id} nft={nft} collection={collection} onClick={onSelectNFT} owned />)}
        </div>
      }
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spin = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80}}>
    <span style={{fontSize:26,color:T.gold,animation:"spin 1s linear infinite"}}>◌</span>
  </div>
);

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BOTTOM_NAV = [["feed","◈","Feed"],["explore","◉","Explore"],["creators","◆","Creators"],["wallet","◇","Wallet"],["profile","△","Profile"]];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded,setLoaded]           = useState(false);
  const [page,setPage]               = useState(() => storage_ls.get("poe_page","feed"));
  const [user,setUser]               = useState(null);
  const [isAdmin,setIsAdmin]         = useState(false);
  const [authLoading,setAuthLoading] = useState(true);
  const [selectedNFT,setSelNFT]      = useState(null);
  const [selectedColl,setSelColl]    = useState(null);
  const [collections,setCollections] = useState(SEED.collections);
  const [posts,setPosts]             = useState(SEED.posts);
  const [flaggedUsers,setFlagged]    = useState({});
  const [verifiedUsers,setVerified]  = useState({"abena.k":true,"ama.s":true});
  const [toast,setToast]             = useState(null);
  const [showNotif,setShowNotif]     = useState(false);

  const showToast = useCallback((msg,type="success")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),2600);
  },[]);

  const navigate = useCallback((p) => {
    setPage(p);
    storage_ls.set("poe_page", p);
  },[]);

  // ── Firebase Auth ──────────────────────────────────────────────────────────
  useEffect(()=>{
    // Handle Google redirect result (mobile)
    getGoogleRedirect().catch(()=>{});

    const unsub = listenAuth(async fbUser => {
      if(fbUser){
        try {
          const saved = await createUserProfile(fbUser.uid, {
            name:     fbUser.displayName,
            email:    fbUser.email,
            photoURL: fbUser.photoURL,
          });
          setUser({
            uid:       fbUser.uid,
            name:      fbUser.displayName,
            email:     fbUser.email,
            photoURL:  fbUser.photoURL,
            wallet:    saved?.wallet || "0x"+fbUser.uid.slice(0,8).toUpperCase()+"…POE",
            verified:  saved?.verified  || false,
            flagged:   saved?.flagged   || false,
            ownedNFTs: saved?.ownedNFTs || [],
            profile: saved?.profile || {
              displayName: fbUser.displayName,
              username: "",
              bio: "",
              avatar: fbUser.photoURL
                ? { type:"photo", value:fbUser.photoURL }
                : { type:"symbol", value:"◆" },
              zodiac: null,
              coverColor: "#12100a",
              banner: null,
            },
          });
          setPage(p => p==="auth" ? "feed" : p);
          showToast(`Welcome back, ${fbUser.displayName?.split(" ")[0]} 👑`);
        } catch(e) {
          // Firestore unavailable — set basic user
          setUser({ uid:fbUser.uid, name:fbUser.displayName, email:fbUser.email,
            photoURL:fbUser.photoURL, wallet:"0x"+fbUser.uid.slice(0,8)+"…",
            verified:false, flagged:false, ownedNFTs:[],
            profile:{ displayName:fbUser.displayName, username:"",
              avatar:fbUser.photoURL?{type:"photo",value:fbUser.photoURL}:{type:"symbol",value:"◆"},
              zodiac:null, coverColor:"#12100a", banner:null }
          });
          setPage(p => p==="auth" ? "feed" : p);
        }
      } else {
        setUser(null); setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  },[showToast]);

  // ── Real-time data ─────────────────────────────────────────────────────────
  useEffect(()=>{
    try {
      const unsub = subscribeToPosts(live => { if(live?.length>0) setPosts(live); });
      return unsub;
    } catch(e){ /* keep seed */ }
  },[]);

  useEffect(()=>{
    try {
      const unsub = subscribeToCollections(live => { if(live?.length>0) setCollections(live); });
      return unsub;
    } catch(e){ /* keep seed */ }
  },[]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async () => {
    try { await signInWithGoogle(); }
    catch(e) { showToast("Sign in failed. Try again.","error"); }
  },[showToast]);

  const handleAdminAuth  = useCallback(()=>{ setIsAdmin(true); setUser({...ADMIN_PROFILE}); navigate("feed"); },[navigate]);
  const handleLogout     = useCallback(async()=>{ await logOut(); setUser(null); setIsAdmin(false); navigate("feed"); showToast("Signed out"); },[showToast,navigate]);
  const handleBuy        = useCallback(nft=>setUser(p=>({...p,ownedNFTs:[...(p.ownedNFTs||[]),nft.id]})),[]);
  const handleSelectNFT  = useCallback((nft,col)=>{ setSelNFT(nft); setSelColl(col); },[]);
  const handleUpdateUser = useCallback(async u=>{ setUser(u); if(u?.uid) { try{ await updateUserProfile(u.uid,{profile:u.profile}); }catch(e){} } },[]);

  const handlePost = useCallback(async p => {
    try { await createPost({...p,uid:user?.uid||"anon"}); }
    catch(e){ setPosts(prev=>[{...p,id:"local_"+Date.now()},...prev]); }
  },[user]);

  const handleLike = useCallback(async id => {
    try { await likePost(id, user?.uid||"anon"); }
    catch(e){ setPosts(prev=>prev.map(p=>p.id===id?{...p,likedByMe:!p.likedByMe}:p)); }
  },[user]);

  const handleBlockPost  = useCallback(async id => {
    const p=posts.find(x=>x.id===id);
    try{ await setBlocked(id,!p?.blocked); }catch(e){}
  },[posts]);

  const handleFlagUser   = useCallback(u=>{
    setFlagged(prev=>{ const n={...prev}; n[u]?delete n[u]:(n[u]={at:new Date().toLocaleString()}); return n; });
  },[]);

  const handleVerify     = useCallback(u=>setVerified(prev=>({...prev,[u]:!prev[u]})),[]);

  const handlePin        = useCallback(async id => {
    const p=posts.find(x=>x.id===id);
    try{ await setPinned(id,!p?.pinned); }
    catch(e){ setPosts(prev=>prev.map(p=>p.id===id?{...p,pinned:!p.pinned}:p)); }
  },[posts]);

  const handleDeletePost = useCallback(async id => {
    try{ await deletePost(id); }
    catch(e){ setPosts(prev=>prev.filter(p=>p.id!==id)); }
  },[]);

  const handleWarn = useCallback(u=>showToast(`⚠️ Warning sent to @${u}`),[showToast]);

  const enrichedPosts = posts
    .map(p=>({...p,
      verified:  !!verifiedUsers[p.username],
      flagged:   !!flaggedUsers[p.username],
      flaggedAt: flaggedUsers[p.username]?.at,
      likedByMe: p.likedBy?.includes(user?.uid),
    }))
    .sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));

  const modProps = {
    onBlockPost:handleBlockPost, onFlagUser:handleFlagUser,
    onVerify:handleVerify, onPin:handlePin,
    onDeletePost:handleDeletePost, onWarn:handleWarn,
    flaggedUsers, verifiedUsers,
  };

  const showHeader = !["auth","admin","profile"].includes(page);
  const pageLabels = {feed:"Feed",explore:"Explore",creators:"Creators",wallet:"Wallet",profile:"Profile",admin:"Admin"};

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.white}}>
      <style>{GLOBAL_CSS}</style>
      <GalaxyBackground />
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{position:"relative",zIndex:1}}>
        {!loaded && <Loader onDone={()=>setLoaded(true)} />}

        {page !== "auth" && (
          <Nav page={page} setPage={navigate} user={user} isAdmin={isAdmin}
            onNotifOpen={()=>setShowNotif(true)} />
        )}

        {showNotif && user && (
          <NotifPanel uid={user.uid} onClose={()=>setShowNotif(false)} />
        )}

        <main style={{paddingTop:page==="auth"?0:56,paddingBottom:72}}>
          {authLoading && page!=="auth" ? (
            <Spin />
          ) : (
            <>
              {showHeader && (
                <div style={{textAlign:"center",padding:"32px 0 24px"}}>
                  <h1 style={{fontFamily:T.font,fontSize:11,fontWeight:700,letterSpacing:7,color:T.white,textTransform:"uppercase",marginBottom:6}}>{pageLabels[page]}</h1>
                  <div style={{width:16,height:1,background:T.gold,margin:"0 auto"}} />
                </div>
              )}
              <PageTransition pageKey={page}>
                <Suspense fallback={<Spin />}>
                  {page==="feed"     && <SocialFeedPage user={user} collections={collections} onSelectNFT={handleSelectNFT} posts={enrichedPosts} onPost={handlePost} onLike={handleLike} />}
                  {page==="explore"  && <ExplorePage collections={collections} onSelectNFT={handleSelectNFT} user={user} />}
                  {page==="creators" && <CreatorsPage collections={collections} onSelectNFT={handleSelectNFT} />}
                  {page==="wallet"   && <WalletPage user={user} collections={collections} onSelectNFT={handleSelectNFT} setPage={navigate} />}
                  {page==="profile"  && <ProfilePage user={user} onUpdateUser={handleUpdateUser} onGoToFeed={()=>navigate("feed")} onLogout={handleLogout} />}
                  {page==="auth"     && <AuthPage onGoogleLogin={handleGoogleLogin} onAdminAuth={handleAdminAuth} />}
                  {page==="admin"    && isAdmin && <AdminPanel collections={collections} setCollections={setCollections} posts={enrichedPosts} verifiedUsers={verifiedUsers} {...modProps} />}
                  {page==="admin"    && !isAdmin && <div style={{textAlign:"center",padding:80,fontFamily:T.font,color:T.muted}}>Access denied.</div>}
                </Suspense>
              </PageTransition>
            </>
          )}
        </main>

        <NFTModal nft={selectedNFT} collection={selectedColl} user={user} onBuy={handleBuy}
          onClose={()=>{ setSelNFT(null); setSelColl(null); }} />

        {page !== "auth" && (
          <nav className="glass-h" style={{position:"fixed",bottom:0,left:0,right:0,
            borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"center",
            padding:"6px 0 calc(10px + env(safe-area-inset-bottom))"}}>
            {BOTTOM_NAV.map(([p,icon,label])=>(
              <button key={p} onClick={()=>navigate(p)} style={{background:"none",border:"none",
                padding:"5px clamp(8px,3vw,16px)",display:"flex",flexDirection:"column",
                alignItems:"center",gap:2,color:page===p?T.gold:T.muted,
                transition:`color 0.18s ${T.smooth}`,minWidth:50,cursor:"pointer"}}>
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
