import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from "react";
import { T, GLOBAL_CSS, Btn, Divider, Tag, VerifiedCrown, FlagBadge, Toast, AnimatedAvatar } from "./tokens";
import GalaxyBackground from "./GalaxyBackground";
import {
  auth, signInWithGoogle, getGoogleRedirect, listenAuth, logOut,
  createUserProfile, updateUserProfile,
  createPost, subscribeToPosts, fetchPostsOnce, likePost, setPinned, setBlocked, deletePost,
  subscribeToCollections, saveCollection,
  subscribeToNotifications, markNotifRead,
  storage_ls,
} from "./firebase";

const ProfilePage    = lazy(() => import("./ProfilePage"));
const SocialFeedPage = lazy(() => import("./SocialFeed"));
const AdminPanel     = lazy(() => import("./AdminPanel"));


// ── Error Boundary — catches any crash and shows recovery UI ─────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("PARADISE crash:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:"100vh",background:"#06060e",display:"flex",alignItems:"center",justifyContent:"center",padding:24,flexDirection:"column",gap:16}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:700,letterSpacing:"0.2em",color:"#f2ede7"}}>PARADISE</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:18,color:"#c9a96e",letterSpacing:"0.2em"}}>on Earth</div>
          <div style={{fontFamily:"monospace",fontSize:12,color:"#7a7690",marginTop:16,textAlign:"center",maxWidth:320,lineHeight:1.6}}>
            Something went wrong loading. Please refresh the page.
          </div>
          <button onClick={()=>window.location.reload()} style={{background:"#c9a96e",border:"none",borderRadius:8,padding:"12px 28px",color:"#08080e",fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:8,letterSpacing:"0.1em"}}>
            REFRESH
          </button>
          {process.env.NODE_ENV === "development" && (
            <details style={{marginTop:16,maxWidth:400,color:"#c46a6a",fontFamily:"monospace",fontSize:11}}>
              <summary style={{cursor:"pointer",color:"#7a7690"}}>Error details</summary>
              <pre style={{marginTop:8,whiteSpace:"pre-wrap"}}>{this.state.error?.toString()}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Admin identity ─────────────────────────────────────────────────────────
export const ADMIN_PROFILE = {
  uid:"ADMIN", name:"GOD🤎", email:"admin@paradise.io",
  wallet:"0xADM1N…PARADISE", verified:true, flagged:false, ownedNFTs:[],
  profile:{ displayName:"GOD🤎", username:"humble_servant",
    bio:"Steward of PARADISE on Earth.", coverColor:"#120e00",
    avatar:{type:"symbol",value:"◈"}, zodiac:null, banner:null },
};

// ── NO seed data — starts empty, Firestore is the source of truth ──────────
// No sample data — starts empty, Firestore populates

// ── Page transition ─────────────────────────────────────────────────────────
function PageTransition({ children, pageKey }) {
  const [display, setDisplay] = useState(children);
  const [visible, setVisible] = useState(true);
  const prev = useRef(pageKey);
  useEffect(() => {
    if (prev.current === pageKey) return;
    setVisible(false);
    const t = setTimeout(() => {
      setDisplay(children);
      setVisible(true);
      prev.current = pageKey;
    }, 150);
    return () => clearTimeout(t);
  }, [pageKey, children]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: `opacity 0.2s ${T.smooth}, transform 0.2s ${T.smooth}`,
      willChange: "opacity, transform",
    }}>{display}</div>
  );
}

// ── Loader ──────────────────────────────────────────────────────────────────
function Loader({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      animation:`fadeOut 0.5s ${T.smooth} 2.4s both`}}>
      <GalaxyBackground />
      <div style={{position:"relative",zIndex:2,textAlign:"center",padding:"0 24px",width:"100%"}}>
        <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:7,color:T.muted,marginBottom:24,animation:"shimmer 2s ease infinite",textTransform:"uppercase"}}>Loading</div>
        <div style={{fontFamily:T.font,fontSize:"clamp(40px,10vw,68px)",fontWeight:700,color:T.white,letterSpacing:"0.2em",animation:`fadeUp 0.7s ${T.smooth} 0.2s both`,lineHeight:1}}>PARADISE</div>
        <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:"clamp(16px,3.5vw,24px)",color:T.gold,letterSpacing:"0.24em",marginTop:8,animation:`fadeUp 0.7s ${T.smooth} 0.45s both`}}>on Earth</div>
        <div style={{marginTop:48,display:"flex",justifyContent:"center",animation:`fadeUp 0.5s ${T.smooth} 0.7s both`}}>
          <div style={{width:"min(260px,65vw)"}}>
            <div style={{height:2,background:"rgba(255,255,255,0.07)",borderRadius:2,position:"relative",overflow:"visible"}}>
              <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:2,
                background:`linear-gradient(90deg,${T.gold}55,${T.gold},#fff9e6,${T.gold})`,
                backgroundSize:"200% 100%",
                animation:"barLoad 2s ease 0.8s both, barShimmer 1.5s ease 0.8s infinite",width:0}}>
                <div style={{position:"absolute",right:-5,top:"50%",transform:"translateY(-50%)",
                  width:10,height:10,borderRadius:"50%",background:T.gold,
                  boxShadow:`0 0 12px ${T.gold}, 0 0 24px ${T.gold}66`}} />
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:20}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.gold,
                  animation:`dotPulse 1.2s ease ${i*0.2}s infinite`}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Online indicator + live refresh badge ───────────────────────────────────
function LiveBadge({ lastRefresh }) {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",
      borderRadius:10,border:`1px solid ${online ? T.green+"44" : T.muted+"44"}`,
      background:online ? "rgba(106,170,136,0.08)" : "rgba(122,118,144,0.08)"}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:online ? T.green : T.muted,
        boxShadow:online?`0 0 6px ${T.green}`:undefined,
        animation:online?"dotPulse 2s ease infinite":undefined}} />
      <span style={{fontFamily:T.mono,fontSize:9,color:online?T.green:T.muted,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>
        {online ? "LIVE" : "OFFLINE"}
      </span>
    </div>
  );
}

// ── Notification Bell ───────────────────────────────────────────────────────
function NotifBell({ uid, onOpen }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    if (!uid) return;
    try { const unsub = subscribeToNotifications(uid, setNotifs); return unsub; } catch(e){}
  }, [uid]);
  const unread = notifs.filter(n => !n.read).length;
  return (
    <button onClick={onOpen} title="Notifications"
      style={{background:"none",border:`1px solid ${unread?T.gold+"44":T.border}`,
        borderRadius:8,padding:"5px 8px",cursor:"pointer",position:"relative",
        display:"flex",alignItems:"center",justifyContent:"center",
        color:unread?T.gold:T.muted,fontSize:16,lineHeight:1,
        transition:`all 0.2s ${T.smooth}`,
        background:unread?"rgba(201,169,110,0.08)":"transparent"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background="rgba(201,169,110,0.12)"}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=unread?T.gold+"44":T.border;e.currentTarget.style.background=unread?"rgba(201,169,110,0.08)":"transparent"}}>
      🔔
      {unread > 0 && (
        <span style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,borderRadius:8,
          background:T.red,color:"#fff",fontFamily:T.mono,fontSize:9,fontWeight:700,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",
          animation:"notifPop 0.3s ease"}}>
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

// ── Notif Panel ─────────────────────────────────────────────────────────────
function NotifPanel({ uid, onClose }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    if (!uid) return;
    try { const unsub = subscribeToNotifications(uid, setNotifs); return unsub; } catch(e){}
  }, [uid]);
  const markAll = () => notifs.filter(n=>!n.read).forEach(n=>markNotifRead(uid,n.id));
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:600,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:"64px 16px 0"}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h" style={{width:"min(380px,96vw)",border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",maxHeight:"72vh",display:"flex",flexDirection:"column",animation:`scaleIn 0.22s ${T.ease} both`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontFamily:T.font,fontSize:17,fontWeight:700,color:T.white}}>Notifications</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {notifs.some(n=>!n.read)&&<Btn variant="ghost" size="sm" onClick={markAll}>Mark all read</Btn>}
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:6,width:30,height:30,color:T.muted,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {notifs.length === 0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:16}}>No notifications yet.</div>
          ) : notifs.map(n=>(
            <div key={n.id} onClick={()=>markNotifRead(uid,n.id)}
              style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",
                background:n.read?"transparent":"rgba(201,169,110,0.06)",transition:`background 0.18s`}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:20,lineHeight:1,marginTop:1}}>{n.icon||"◈"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:T.sans,fontSize:13,color:n.read?T.muted:T.white,lineHeight:1.6}}>{n.message}</div>
                  <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:3}}>{n.timeLabel||"Just now"}</div>
                </div>
                {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:T.gold,flexShrink:0,marginTop:5,boxShadow:`0 0 6px ${T.gold}`}} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Top Nav ─────────────────────────────────────────────────────────────────
function Nav({ page, setPage, user, isAdmin, onNotifOpen, lastRefresh }) {
  const NAV_LINKS = [["feed","Feed"],["explore","Explore"],["creators","Creators"],["wallet","Wallet"]];
  return (
    <nav className="glass-h" style={{
      position:"fixed",top:0,left:0,right:0,zIndex:100,
      borderBottom:`1px solid ${T.border}`,
      height:58,
      display:"flex",alignItems:"center",
      paddingLeft:"clamp(10px,3vw,24px)",
      paddingRight:"clamp(8px,2vw,16px)",
      gap:0,
    }}>
      {/* Logo — always visible, never wraps */}
      <div onClick={()=>setPage("feed")} style={{
        cursor:"pointer",fontFamily:T.font,flexShrink:0,
        marginRight:"clamp(8px,2vw,20px)",userSelect:"none",
        display:"flex",flexDirection:"column",lineHeight:1.1,
      }}>
        <span style={{fontSize:"clamp(11px,2vw,16px)",fontWeight:700,letterSpacing:"0.2em",color:T.white,whiteSpace:"nowrap"}}>PARADISE</span>
        <span style={{fontSize:"clamp(8px,1.2vw,10px)",fontStyle:"italic",color:T.gold,letterSpacing:"0.16em"}}>on Earth</span>
      </div>

      {/* Nav links — scrollable, hidden scrollbar */}
      <div style={{display:"flex",flex:1,overflowX:"auto",scrollbarWidth:"none",
        WebkitOverflowScrolling:"touch",alignItems:"stretch",gap:0,minWidth:0}}>
        <style>{`::-webkit-scrollbar{display:none}`}</style>
        {NAV_LINKS.map(([p,l])=>(
          <button key={p} onClick={()=>setPage(p)}
            style={{
              background:"none",border:"none",
              color:page===p?T.gold:"rgba(180,176,210,1)",
              fontFamily:T.sans,
              fontSize:"clamp(10px,1.4vw,12px)",
              letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:700,
              padding:"0 clamp(7px,1.5vw,14px)",
              borderBottom:page===p?`2px solid ${T.gold}`:"2px solid transparent",
              whiteSpace:"nowrap",flexShrink:0,cursor:"pointer",
              transition:`color 0.18s ${T.smooth}, border-color 0.18s ${T.smooth}`,
              height:"100%",display:"flex",alignItems:"center",
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Right side — compact, always visible */}
      <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0,marginLeft:4}}>
        <LiveBadge lastRefresh={lastRefresh} />
        {user && <NotifBell uid={user.uid} onOpen={onNotifOpen} />}
        {isAdmin && (
          <button onClick={()=>setPage("admin")}
            style={{background:"rgba(201,169,110,0.15)",border:`1px solid ${T.gold}66`,
              borderRadius:6,padding:"5px 10px",color:T.gold,fontFamily:T.sans,
              fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
              cursor:"pointer",transition:`all 0.18s ${T.smooth}`,whiteSpace:"nowrap",
              flexShrink:0}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(201,169,110,0.28)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(201,169,110,0.15)"}>
            ⌘
          </button>
        )}
        {user ? (
          <div onClick={()=>setPage("profile")}
            style={{cursor:"pointer",display:"flex",alignItems:"center",gap:6,
              padding:"4px 6px",borderRadius:8,
              border:`1px solid ${T.border}`,
              background:"rgba(255,255,255,0.04)",
              transition:`all 0.18s ${T.smooth}`,flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.borderColor=T.gold+"55"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=T.border}}>
            <AnimatedAvatar
              avatar={user.profile?.avatar||{type:"symbol",value:"◆"}}
              zodiac={user.profile?.zodiac}
              size={30} border={false} />
            <div style={{display:"flex",flexDirection:"column",lineHeight:1.2}} className="hide-xs">
              <span style={{fontFamily:T.sans,fontSize:11,fontWeight:700,color:T.white,whiteSpace:"nowrap",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis"}}>
                {isAdmin ? <span className="god-text" style={{color:T.gold}}>GOD🤎</span>
                  : (user.profile?.displayName||user.name||"You").split(" ")[0]}
              </span>
              {!isAdmin && user.profile?.username && (
                <span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>@{user.profile.username}</span>
              )}
            </div>
          </div>
        ) : (
          <button onClick={()=>setPage("auth")}
            style={{background:T.gold,border:"none",borderRadius:8,
              padding:"8px 14px",color:"#08080e",fontFamily:T.sans,
              fontSize:11,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",
              cursor:"pointer",transition:`all 0.18s ${T.smooth}`,whiteSpace:"nowrap",
              flexShrink:0,boxShadow:`0 0 16px ${T.gold}44`}}
            onMouseEnter={e=>e.currentTarget.style.background="#d4b070"}
            onMouseLeave={e=>e.currentTarget.style.background=T.gold}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

// ── Auth Page ───────────────────────────────────────────────────────────────
function AuthPage({ onGoogleLogin, onAdminAuth }) {
  const [loading, setLoading]     = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [pass, setPass]           = useState("");
  const [err, setErr]             = useState("");

  const doGoogle = async () => {
    setLoading(true); setErr("");
    try { await onGoogleLogin(); }
    catch(e) { setLoading(false); setErr("Sign in failed — please try again."); }
  };
  const doAdmin = () => {
    if (pass === "admin123") onAdminAuth();
    else setErr("Incorrect password.");
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{maxWidth:420,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontFamily:T.font,fontSize:"clamp(38px,10vw,60px)",fontWeight:700,letterSpacing:"0.2em",color:T.white,lineHeight:1}}>PARADISE</div>
          <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:"clamp(16px,4vw,20px)",color:T.gold,letterSpacing:"0.22em",marginTop:8}}>on Earth</div>
        </div>
        {!adminMode ? (
          <div className="glass-h" style={{border:`1px solid ${T.border}`,borderRadius:12,padding:"clamp(24px,6vw,44px)"}}>
            <p style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,textAlign:"center",marginBottom:32,lineHeight:1.9}}>
              Sign in to receive your Polygon wallet and begin collecting.
            </p>
            {loading ? (
              <div style={{textAlign:"center",padding:36}}>
                <div style={{fontSize:32,color:T.gold,animation:"spin 1s linear infinite",display:"inline-block"}}>◌</div>
                <p style={{fontFamily:T.font,fontSize:13,color:T.muted,marginTop:14}}>Redirecting to Google…</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* Google button */}
                <button onClick={doGoogle}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,
                    background:"rgba(255,255,255,0.05)",
                    border:`1px solid rgba(255,255,255,0.15)`,
                    borderRadius:10,padding:"15px 24px",
                    color:T.white,fontFamily:T.sans,fontSize:15,fontWeight:600,
                    letterSpacing:"0.03em",cursor:"pointer",transition:`all 0.2s ${T.smooth}`,
                    boxShadow:"0 2px 20px rgba(0,0,0,0.3)"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold+"88";e.currentTarget.style.background="rgba(201,169,110,0.1)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.background="rgba(255,255,255,0.05)"}}>
                  {/* Real Google G icon */}
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                  </svg>
                  Continue with Google
                </button>
                {err && <p style={{fontFamily:T.mono,fontSize:11,color:T.red,textAlign:"center"}}>{err}</p>}
                <Divider style={{margin:"8px 0"}} />
                <button onClick={()=>setAdminMode(true)}
                  style={{background:"none",border:"none",color:T.muted,fontFamily:T.mono,
                    fontSize:11,letterSpacing:"0.06em",cursor:"pointer",padding:"4px 0"}}>
                  Admin Access →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-h" style={{border:`1px solid ${T.gold}44`,borderRadius:12,padding:"clamp(24px,6vw,44px)"}}>
            <p style={{fontFamily:T.font,fontSize:17,color:T.gold,marginBottom:20,fontWeight:600}}>Admin Access</p>
            <input type="password" value={pass}
              onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&doAdmin()}
              placeholder="Enter admin password"
              style={{width:"100%",background:"rgba(255,255,255,0.04)",
                border:`1px solid ${T.border}`,borderRadius:8,
                padding:"14px 16px",color:T.white,fontSize:14,
                outline:"none",marginBottom:12}}
              onFocus={e=>e.target.style.borderColor=T.gold}
              onBlur={e=>e.target.style.borderColor=T.border} />
            {err&&<p style={{fontFamily:T.mono,fontSize:11,color:T.red,marginBottom:12}}>{err}</p>}
            <Btn full onClick={doAdmin}>Enter</Btn>
            <button onClick={()=>{setAdminMode(false);setErr("")}}
              style={{background:"none",border:"none",color:T.muted,fontSize:12,
                marginTop:14,width:"100%",cursor:"pointer",fontFamily:T.sans}}>
              ← Back
            </button>
          </div>
        )}
        <p style={{fontFamily:T.mono,fontSize:10,color:T.muted,textAlign:"center",marginTop:18,letterSpacing:"0.06em",lineHeight:1.7}}>
          Auto-assigns Polygon wallet · No crypto knowledge needed
        </p>
      </div>
    </div>
  );
}

// ── Wallet badge ─────────────────────────────────────────────────────────────
function WalletBadge({ wallet }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(wallet).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);});
  };
  return (
    <div onClick={copy} title="Tap to copy wallet address"
      style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",
        background:"rgba(201,169,110,0.07)",border:`1px solid ${T.gold}33`,
        borderRadius:8,padding:"10px 16px",transition:`all 0.18s ${T.smooth}`}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(201,169,110,0.15)"}
      onMouseLeave={e=>e.currentTarget.style.background="rgba(201,169,110,0.07)"}>
      <span style={{fontSize:18,flexShrink:0}}>⬡</span>
      <span style={{fontFamily:T.mono,fontSize:12,color:T.gold,letterSpacing:"0.04em",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{wallet}</span>
      <span style={{fontFamily:T.mono,fontSize:10,color:copied?T.green:T.dim,flexShrink:0,transition:`color 0.2s`}}>
        {copied ? "✓ Copied" : "Copy"}
      </span>
    </div>
  );
}

// ── NFT Card ─────────────────────────────────────────────────────────────────
export function NFTCard({ nft, collection, onClick, owned }) {
  const rc = { Common:"#888", Rare:T.gold, Epic:"#b8a0c8", Legendary:"#e8c87c" };
  return (
    <div className="card-lift glass" onClick={()=>onClick(nft,collection)}
      style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden",cursor:"pointer"}}>
      <div style={{height:190,background:nft.bg||T.bg,display:"flex",alignItems:"center",
        justifyContent:"center",fontSize:52,fontFamily:T.font,color:T.gold,position:"relative"}}>
        {nft.image}
        <div style={{position:"absolute",top:10,right:10,display:"flex",flexDirection:"column",gap:5}}>
          <Tag color={rc[nft.rarity]||T.gold}>{nft.rarity}</Tag>
          {owned && <Tag color={T.green}>Owned</Tag>}
        </div>
      </div>
      <div style={{padding:"15px 16px 14px"}}>
        <div style={{fontFamily:T.font,fontSize:17,color:T.white,marginBottom:4,fontWeight:700,lineHeight:1.2}}>{nft.name}</div>
        <div style={{fontFamily:T.sans,fontSize:12,color:"#b0accc",marginBottom:12,fontWeight:600}}>{collection?.creator}</div>
        <Divider style={{marginBottom:12}} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:3,letterSpacing:"0.1em"}}>PRICE</div>
            <div style={{fontFamily:T.font,fontSize:18,color:T.gold,fontWeight:600}}>{nft.price} ETH</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>GHS {nft.momoPrice}</div>
          </div>
          <div style={{fontFamily:T.mono,fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:4}}>
            <span style={{color:"rgba(224,112,112,0.7)"}}>♥</span> {nft.likes||0}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NFT Modal ────────────────────────────────────────────────────────────────
function NFTModal({ nft, collection, onClose, user, onBuy }) {
  const [tab,setTab]       = useState("story");
  const [step,setStep]     = useState("view");
  const [momoNum,setMomo]  = useState("");
  if (!nft || !collection) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(22px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h modal-in"
        style={{maxWidth:560,width:"100%",border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:200,background:nft.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,fontFamily:T.font,color:T.gold,position:"relative"}}>
          {nft.image}
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.6)",border:`1px solid ${T.border}`,width:34,height:34,borderRadius:"50%",color:T.muted,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"clamp(20px,5vw,32px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div>
              <h2 style={{fontFamily:T.font,fontSize:"clamp(18px,4vw,26px)",fontWeight:700,color:T.white,marginBottom:3}}>{nft.name}</h2>
              <p style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{collection.creator} · {collection.role}</p>
            </div>
            <Tag>{nft.rarity}</Tag>
          </div>
          <p style={{fontFamily:T.font,fontSize:14,color:T.muted,lineHeight:1.8,marginTop:12,marginBottom:20}}>{nft.description}</p>
          <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:20}}>
            {["story","traits","perks","events"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",
                borderBottom:tab===t?`2px solid ${T.gold}`:"2px solid transparent",
                color:tab===t?T.gold:T.muted,fontFamily:T.mono,fontSize:11,
                letterSpacing:"0.06em",textTransform:"uppercase",padding:"0 0 10px",
                marginRight:14,marginBottom:-1,cursor:"pointer",transition:`color 0.18s`}}>{t}</button>
            ))}
          </div>
          {tab==="story"&&<div style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,lineHeight:1.9,borderLeft:`3px solid ${T.gold}44`,paddingLeft:18}}>"{nft.story}"</div>}
          {tab==="traits"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{(nft.traits||[]).map(tr=><div key={tr.k} style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"10px 14px"}}><div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:3,letterSpacing:"0.06em"}}>{tr.k}</div><div style={{fontFamily:T.font,fontSize:15,color:T.white,fontWeight:600}}>{tr.v}</div></div>)}</div>}
          {tab==="perks"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>{(nft.perks||[]).map((p,i)=><div key={i} style={{display:"flex",gap:12,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:17,minWidth:24}}>{p.split(" ")[0]}</span><span style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.6}}>{p.split(" ").slice(1).join(" ")}</span></div>)}</div>}
          {tab==="events"&&(collection.events?.length===0?<p style={{fontFamily:T.font,color:T.muted,fontStyle:"italic"}}>No upcoming events.</p>:(collection.events||[]).map(ev=><div key={ev.id} style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"14px 16px",marginBottom:8}}><div style={{fontFamily:T.font,fontSize:15,color:T.white,marginBottom:3,fontWeight:600}}>{ev.title}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.gold,marginBottom:5}}>{ev.date} · {ev.location}</div><div style={{fontFamily:T.sans,fontSize:13,color:T.muted}}>{ev.desc}</div></div>))}
          <Divider style={{margin:"20px 0"}} />
          {step==="view"&&<div style={{display:"flex",gap:14,alignItems:"center"}}><div><div style={{fontFamily:T.font,fontSize:22,color:T.gold,fontWeight:600}}>{nft.price} ETH</div><div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>GHS {nft.momoPrice}</div></div><div style={{marginLeft:"auto"}}>{user?<Btn onClick={()=>setStep("momo")}>Buy with MoMo</Btn>:<span style={{fontFamily:T.mono,fontSize:12,color:T.muted}}>Sign in to purchase</span>}</div></div>}
          {step==="momo"&&<div><p style={{fontFamily:T.font,fontSize:14,color:T.muted,marginBottom:14}}>Enter your MTN MoMo number.</p><input value={momoNum} onChange={e=>setMomo(e.target.value)} placeholder="024 XXX XXXX" style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:8,padding:"13px 16px",color:T.white,fontSize:15,outline:"none",marginBottom:12}} onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/><div style={{display:"flex",gap:10}}><Btn variant="ghost" onClick={()=>setStep("view")}>Back</Btn><Btn style={{flex:2}} onClick={()=>{if(momoNum.length>7)setStep("confirm")}}>Pay GHS {nft.momoPrice}</Btn></div></div>}
          {step==="confirm"&&<div style={{textAlign:"center"}}><div style={{fontFamily:T.font,fontSize:40,color:T.gold,marginBottom:14}}>◎</div><h3 style={{fontFamily:T.font,fontSize:22,color:T.white,marginBottom:8,fontWeight:700}}>Payment Initiated</h3><p style={{fontFamily:T.sans,fontSize:14,color:T.muted,lineHeight:1.8,marginBottom:18}}>Approve the MoMo prompt on your phone.</p>{user&&<WalletBadge wallet={user.wallet} />}<div style={{marginTop:18}}><Btn full onClick={()=>{onBuy(nft);onClose()}}>Done — NFT is Yours</Btn></div></div>}
        </div>
      </div>
    </div>
  );
}

// ── Explore ──────────────────────────────────────────────────────────────────
function ExplorePage({ collections, onSelectNFT, user }) {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("All");
  const all = collections.flatMap(c => (c.nfts||[]).map(n => ({ nft:n, collection:c })));
  const filtered = all.filter(({ nft, collection }) => {
    const q = search.toLowerCase();
    return (!q || nft.name.toLowerCase().includes(q) || collection.creator?.toLowerCase().includes(q))
      && (rarity === "All" || nft.rarity === rarity);
  });
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"0 clamp(14px,4vw,28px)"}}>
      <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pieces, creators…"
          style={{flex:1,minWidth:160,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:8,padding:"11px 16px",color:T.white,fontFamily:T.sans,fontSize:14,outline:"none"}}
          onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["All","Common","Rare","Epic","Legendary"].map(r=>(
            <button key={r} onClick={()=>setRarity(r)}
              style={{background:rarity===r?T.gold:"rgba(255,255,255,0.04)",
                border:`1px solid ${rarity===r?T.gold:T.border}`,borderRadius:6,
                padding:"8px 14px",color:rarity===r?"#08080e":T.muted,
                fontFamily:T.sans,fontSize:11,fontWeight:700,letterSpacing:"0.08em",
                textTransform:"uppercase",cursor:"pointer",transition:`all 0.18s ${T.smooth}`}}>
              {r}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"80px 0",fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:18}}>
          {all.length === 0 ? "No collections yet. Add some in Admin." : "No pieces match your search."}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,260px),1fr))",gap:18}}>
          {filtered.map(({nft,collection})=>(
            <NFTCard key={nft.id} nft={nft} collection={collection} onClick={onSelectNFT} owned={user?.ownedNFTs?.includes(nft.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Creators ─────────────────────────────────────────────────────────────────
function CreatorsPage({ collections, onSelectNFT }) {
  const [sel, setSel] = useState(null);
  const c = collections.find(x => x.id === sel);
  if (c) return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"0 clamp(14px,4vw,28px)"}}>
      <button onClick={()=>setSel(null)}
        style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
          borderRadius:8,padding:"8px 16px",color:T.muted,fontFamily:T.sans,
          fontSize:12,cursor:"pointer",marginBottom:24,transition:`all 0.18s ${T.smooth}`}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
        onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
        ← All Creators
      </button>
      <div className="glass" style={{border:`1px solid ${c.accent}33`,borderRadius:10,padding:"clamp(22px,5vw,40px)",marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:22,flexWrap:"wrap"}}>
          <div style={{width:66,height:66,minWidth:66,borderRadius:"50%",border:`2px solid ${c.accent}66`,
            display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:32,color:c.accent}}>
            {c.avatar}
          </div>
          <div style={{flex:1,minWidth:140}}>
            <h2 style={{fontFamily:T.font,fontSize:"clamp(20px,4vw,32px)",fontWeight:700,color:T.white,marginBottom:6}}>{c.name}</h2>
            <Tag color={c.accent}>{c.role}</Tag>
            <div style={{display:"flex",gap:18,marginTop:12,flexWrap:"wrap"}}>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{c.followers} <span style={{color:T.white}}>followers</span></span>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{c.totalPieces} <span style={{color:T.white}}>pieces</span></span>
            </div>
          </div>
          <button style={{background:"transparent",border:`1px solid ${T.gold}`,borderRadius:8,
            padding:"10px 22px",color:T.gold,fontFamily:T.sans,fontSize:12,fontWeight:700,
            letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",
            transition:`all 0.18s ${T.smooth}`}}
            onMouseEnter={e=>e.currentTarget.style.background=T.goldSoft}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            Follow
          </button>
        </div>
        <Divider style={{margin:"20px 0"}} />
        <p style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:T.muted,lineHeight:1.9}}>{c.description}</p>
      </div>
      {c.events?.length > 0 && (
        <div style={{marginBottom:28}}>
          <h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:14}}>Events</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
            {c.events.map(ev=>(
              <div key={ev.id} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"16px 20px"}}>
                <div style={{fontFamily:T.font,fontSize:15,color:T.white,marginBottom:4,fontWeight:600}}>{ev.title}</div>
                <div style={{fontFamily:T.mono,fontSize:10,color:T.gold,marginBottom:5}}>{ev.date} · {ev.location}</div>
                <div style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.6}}>{ev.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:16}}>Collection</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,260px),1fr))",gap:18}}>
        {(c.nfts||[]).map(nft => <NFTCard key={nft.id} nft={nft} collection={c} onClick={onSelectNFT} />)}
      </div>
    </div>
  );
  if (collections.length === 0) return (
    <div style={{textAlign:"center",padding:"80px 24px",fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:18}}>
      No creators yet. Add collections in Admin.
    </div>
  );
  return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"0 clamp(14px,4vw,28px)"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(calc(50% - 8px),200px),1fr))",gap:14}}>
        {collections.map(col=>(
          <div key={col.id} className="card-lift glass" onClick={()=>setSel(col.id)}
            style={{border:`1px solid ${col.accent}22`,borderRadius:10,padding:"clamp(16px,3vw,26px)",cursor:"pointer",textAlign:"center"}}>
            <div style={{width:54,height:54,borderRadius:"50%",border:`2px solid ${col.accent}44`,
              display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,
              fontSize:24,color:col.accent,margin:"0 auto 14px"}}>
              {col.avatar}
            </div>
            <div style={{fontFamily:T.font,fontSize:"clamp(14px,2.5vw,17px)",fontWeight:700,color:T.white,marginBottom:4}}>{col.name}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:12}}>{col.creator}</div>
            <Tag color={col.accent}>{col.role}</Tag>
            <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:14}}>
              <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{col.followers||"0"}</span>
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
  if (!user) return (
    <div style={{maxWidth:480,margin:"60px auto",textAlign:"center",padding:"24px 16px"}}>
      <div style={{fontFamily:T.font,fontSize:48,color:T.dim,marginBottom:18}}>◎</div>
      <h2 style={{fontFamily:T.font,fontSize:24,fontWeight:700,color:T.white,marginBottom:10}}>Your Collection</h2>
      <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,marginBottom:24,lineHeight:1.8}}>Sign in to view your wallet and NFTs.</p>
      <button onClick={()=>setPage("auth")}
        style={{background:T.gold,border:"none",borderRadius:10,padding:"13px 32px",
          color:"#08080e",fontFamily:T.sans,fontSize:13,fontWeight:700,
          letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>
        Sign In
      </button>
    </div>
  );
  const owned = collections.flatMap(c => (c.nfts||[]).filter(n => user.ownedNFTs?.includes(n.id)).map(n => ({nft:n,collection:c})));
  return (
    <div style={{maxWidth:980,margin:"0 auto",padding:"0 clamp(14px,4vw,28px)"}}>
      <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(20px,4vw,36px)",marginBottom:28}}>
        <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:"◆"}} zodiac={user.profile?.zodiac} size={56} border />
          <div style={{flex:1,minWidth:140}}>
            <div style={{fontFamily:T.font,fontSize:"clamp(18px,3.5vw,26px)",fontWeight:700,color:T.white,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              {user.profile?.displayName||user.name}
              {user.verified && <VerifiedCrown />}
            </div>
            <div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginTop:5}}>Polygon Network · Non-custodial</div>
            <div style={{marginTop:10}}><WalletBadge wallet={user.wallet||"0x…"} /></div>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[["Portfolio","~0.0 ETH",T.gold],["Pieces",owned.length,T.green]].map(([l,v,col])=>(
              <div key={l} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"14px 22px",textAlign:"center"}}>
                <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,marginBottom:5,letterSpacing:"0.1em"}}>{l}</div>
                <div style={{fontFamily:T.font,fontSize:20,color:col,fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {owned.length === 0 ? (
        <div style={{textAlign:"center",padding:"72px 0",fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:17}}>Your collection is empty. Begin exploring.</div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,260px),1fr))",gap:18}}>
          {owned.map(({nft,collection})=><NFTCard key={nft.id} nft={nft} collection={collection} onClick={onSelectNFT} owned />)}
        </div>
      )}
    </div>
  );
}

const Spin = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80}}>
    <span style={{fontSize:28,color:T.gold,animation:"spin 1s linear infinite"}}>◌</span>
  </div>
);

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
  const [collections,setCollections] = useState([]);
  const [posts,setPosts]             = useState([]);
  const [flaggedUsers,setFlagged]    = useState({});
  const [verifiedUsers,setVerified]  = useState({});
  const [toast,setToast]             = useState(null);
  const [showNotif,setShowNotif]     = useState(false);
  const [lastRefresh,setLastRefresh] = useState(Date.now());

  const showToast = useCallback((msg,type="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),2800);
  }, []);

  const navigate = useCallback((p) => {
    setPage(p);
    storage_ls.set("poe_page", p);
  }, []);

  // ── Mobile auth fix: handle redirect BEFORE auth listener ────────────────
  useEffect(() => {
    // On mobile, after Google redirect, this gets the auth result
    getGoogleRedirect()
      .then(result => {
        if (result?.user) {
          // Auth state change fires automatically — no extra work needed
          console.log("✓ Google redirect result:", result.user.email);
        }
      })
      .catch(e => console.log("Redirect check:", e?.code || e));
  }, []);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = listenAuth(async fbUser => {
      if (fbUser) {
        try {
          const saved = await createUserProfile(fbUser.uid, {
            name:     fbUser.displayName,
            email:    fbUser.email,
            photoURL: fbUser.photoURL,
          });
          const built = {
            uid:       fbUser.uid,
            name:      fbUser.displayName,
            email:     fbUser.email,
            photoURL:  fbUser.photoURL,
            wallet:    saved?.wallet || "0x" + fbUser.uid.slice(0,8).toUpperCase() + "…POE",
            verified:  saved?.verified  || false,
            flagged:   saved?.flagged   || false,
            ownedNFTs: saved?.ownedNFTs || [],
            profile:   saved?.profile   || {
              displayName: fbUser.displayName,
              username: "", bio: "",
              avatar: fbUser.photoURL ? {type:"photo",value:fbUser.photoURL} : {type:"symbol",value:"◆"},
              zodiac: null, coverColor: "#12100a", banner: null,
            },
          };
          setUser(built);
          // Always navigate away from auth page
          setPage(p => p === "auth" ? "feed" : p);
        } catch (e) {
          // Firestore error — still set basic user so they're logged in
          setUser({
            uid: fbUser.uid, name: fbUser.displayName, email: fbUser.email,
            photoURL: fbUser.photoURL,
            wallet: "0x" + fbUser.uid.slice(0,8).toUpperCase() + "…POE",
            verified: false, flagged: false, ownedNFTs: [],
            profile: {
              displayName: fbUser.displayName, username: "", bio: "",
              avatar: fbUser.photoURL ? {type:"photo",value:fbUser.photoURL} : {type:"symbol",value:"◆"},
              zodiac: null, coverColor: "#12100a", banner: null,
            },
          });
          setPage(p => p === "auth" ? "feed" : p);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Real-time Firestore posts + 5s polling fallback ──────────────────────
  useEffect(() => {
    let unsubFirestore = null;
    let pollInterval   = null;

    // Real-time listener — primary
    try {
      unsubFirestore = subscribeToPosts(live => {
        setPosts(live);
        setLastRefresh(Date.now());
      });
    } catch(e) { console.log("Posts listener:", e); }

    // 5-second polling — actual fetch every 5s when online
    const poll = async () => {
      if (!navigator.onLine) return;
      try {
        const live = await fetchPostsOnce();
        setPosts(live);
        setLastRefresh(Date.now());
      } catch(e) {}
    };
    pollInterval = setInterval(poll, 5000);

    return () => {
      if (unsubFirestore) unsubFirestore();
      if (pollInterval)   clearInterval(pollInterval);
    };
  }, []);

  // ── Real-time collections ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const unsub = subscribeToCollections(live => {
        if (live && live.length > 0) setCollections(live);
      });
      return unsub;
    } catch(e) {}
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async () => {
    try { await signInWithGoogle(); }
    catch(e) {
      // On mobile, redirect happens — no error to catch
      if (!e || e.code === "auth/popup-closed-by-user") return;
      showToast("Sign in failed. Try again.", "error");
    }
  }, [showToast]);

  const handleAdminAuth  = useCallback(() => { setIsAdmin(true); setUser({...ADMIN_PROFILE}); navigate("feed"); }, [navigate]);
  const handleLogout     = useCallback(async () => { await logOut(); setUser(null); setIsAdmin(false); navigate("auth"); showToast("Signed out"); }, [showToast, navigate]);
  const handleBuy        = useCallback(nft => setUser(p => ({...p, ownedNFTs:[...(p.ownedNFTs||[]),nft.id]})), []);
  const handleSelectNFT  = useCallback((nft,col) => { setSelNFT(nft); setSelColl(col); }, []);
  const handleUpdateUser = useCallback(async u => {
    setUser(u);
    if (u?.uid && u.uid !== "ADMIN") {
      try { await updateUserProfile(u.uid, { profile: u.profile }); } catch(e) {}
    }
  }, []);

  const handlePost = useCallback(async p => {
    try {
      await createPost({ ...p, uid: user?.uid || "anon" });
    } catch(e) {
      // Optimistic local update
      setPosts(prev => [{ ...p, id: "local_" + Date.now(), likedBy: [], likes: 0 }, ...prev]);
    }
  }, [user]);

  // ── Like fix: uses real Firestore likes count ─────────────────────────────
  const handleLike = useCallback(async id => {
    if (!user) { navigate("auth"); return; }
    // Optimistic update immediately
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const alreadyLiked = p.likedBy?.includes(user.uid);
      return {
        ...p,
        likedByMe: !alreadyLiked,
        likes: Math.max(0, (p.likes || 0) + (alreadyLiked ? -1 : 1)),
        likedBy: alreadyLiked
          ? (p.likedBy||[]).filter(x=>x!==user.uid)
          : [...(p.likedBy||[]), user.uid],
      };
    }));
    // Then sync with Firestore
    try { await likePost(id, user.uid); } catch(e) {}
  }, [user, navigate]);

  const handleBlockPost  = useCallback(async id => {
    const p = posts.find(x => x.id === id);
    try { await setBlocked(id, !p?.blocked); } catch(e) {}
  }, [posts]);

  const handleFlagUser = useCallback(u => {
    setFlagged(prev => {
      const n = {...prev};
      n[u] ? delete n[u] : (n[u] = {at: new Date().toLocaleString()});
      return n;
    });
  }, []);

  const handleVerify = useCallback(u => setVerified(prev => ({...prev, [u]: !prev[u]})), []);

  const handlePin = useCallback(async id => {
    const p = posts.find(x => x.id === id);
    try { await setPinned(id, !p?.pinned); }
    catch(e) { setPosts(prev => prev.map(p => p.id===id ? {...p,pinned:!p.pinned} : p)); }
  }, [posts]);

  const handleDeletePost = useCallback(async id => {
    setPosts(prev => prev.filter(p => p.id !== id));
    try { await deletePost(id); } catch(e) {}
  }, []);

  const handleWarn = useCallback(u => showToast(`⚠️ Warning sent to @${u}`), [showToast]);

  const enrichedPosts = posts
    .map(p => ({
      ...p,
      verified:  !!verifiedUsers[p.username],
      flagged:   !!flaggedUsers[p.username],
      flaggedAt: flaggedUsers[p.username]?.at,
      likedByMe: !!(p.likedBy?.includes(user?.uid)),
      // Use Firestore likes as source of truth
      likes:     typeof p.likes === "number" ? p.likes : 0,
    }))
    .sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0));

  const modProps = {
    onBlockPost:handleBlockPost, onFlagUser:handleFlagUser,
    onVerify:handleVerify, onPin:handlePin,
    onDeletePost:handleDeletePost, onWarn:handleWarn,
    flaggedUsers, verifiedUsers,
  };

  const showHeader = !["auth","admin","profile"].includes(page);
  const pageLabels = { feed:"Feed", explore:"Explore", creators:"Creators", wallet:"Wallet", profile:"Profile", admin:"Admin" };

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.white}}>
      <style>{GLOBAL_CSS + `
        @media(min-width:500px){.show-md{display:block!important}}
        .show-md{display:none}
      `}</style>
      <GalaxyBackground />
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{position:"relative",zIndex:1}}>
        {!loaded && <Loader onDone={()=>setLoaded(true)} />}

        {page !== "auth" && (
          <Nav page={page} setPage={navigate} user={user} isAdmin={isAdmin}
            onNotifOpen={()=>setShowNotif(true)} lastRefresh={lastRefresh} />
        )}

        {showNotif && user && (
          <NotifPanel uid={user.uid} onClose={()=>setShowNotif(false)} />
        )}

        <main style={{paddingTop: page === "auth" ? 0 : 60, paddingBottom: 80,
          maxWidth: "100vw", overflowX: "hidden"}}>
          {authLoading && page !== "auth" ? (
            <Spin />
          ) : (
            <>
              {showHeader && (
                <div style={{textAlign:"center",padding:"34px 0 26px"}}>
                  <h1 style={{fontFamily:T.font,fontSize:12,fontWeight:700,letterSpacing:7,
                    color:T.white,textTransform:"uppercase",marginBottom:7}}>
                    {pageLabels[page]}
                  </h1>
                  <div style={{width:18,height:1,background:T.gold,margin:"0 auto"}} />
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
                  {page==="admin"    && !isAdmin && <div style={{textAlign:"center",padding:80,fontFamily:T.font,color:T.muted,fontSize:17}}>Access denied.</div>}
                </Suspense>
              </PageTransition>
            </>
          )}
        </main>

        <NFTModal nft={selectedNFT} collection={selectedColl} user={user} onBuy={handleBuy}
          onClose={()=>{ setSelNFT(null); setSelColl(null); }} />

        {page !== "auth" && (
          <nav className="glass-h" style={{position:"fixed",bottom:0,left:0,right:0,
            borderTop:`1px solid ${T.border}`,display:"flex",
            justifyContent:"space-around",alignItems:"center",
            padding:"8px 0 calc(12px + env(safe-area-inset-bottom))"}}>
            {BOTTOM_NAV.map(([p,icon,label]) => (
              <button key={p} onClick={()=>navigate(p)}
                style={{background:"none",border:"none",
                  padding:"4px clamp(8px,3vw,20px)",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                  color: page===p ? T.gold : T.muted,
                  transition:`color 0.18s ${T.smooth}`,
                  minWidth:52,cursor:"pointer",flex:1,maxWidth:80}}>
                <span style={{fontFamily:T.font,fontSize:18,lineHeight:1,
                  filter:page===p?`drop-shadow(0 0 6px ${T.gold})`:"none",
                  transition:"filter 0.2s"}}>{icon}</span>
                <span style={{fontFamily:T.sans,fontSize:"clamp(8px,2vw,10px)",
                  fontWeight:page===p?700:400,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                  {label}
                </span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
