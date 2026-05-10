import { useState, useRef, useEffect, useCallback } from "react";
import { T, Btn, Divider, AnimatedAvatar, VerifiedCrown, FlagBadge } from "./tokens";

// ── Rich text: @mentions + #hashtags ────────────────────────────────────────
function RichText({ text, onMention }) {
  if (!text) return null;
  return (
    <span>
      {text.split(/(#\w+|@[\w.]+)/g).map((part, i) => {
        if (part.startsWith("#")) return (
          <span key={i} style={{color:T.gold,fontWeight:700,cursor:"pointer"}}
            onClick={e=>{e.stopPropagation()}}>{part}</span>
        );
        if (part.startsWith("@")) return (
          <span key={i} style={{color:"#8ec4a8",fontWeight:700,cursor:"pointer"}}
            onClick={e=>{e.stopPropagation();onMention&&onMention(part.slice(1))}}>{part}</span>
        );
        return part;
      })}
    </span>
  );
}

// ── Autocomplete ─────────────────────────────────────────────────────────────
function Autocomplete({ suggestions, onSelect, type }) {
  if (!suggestions.length) return null;
  return (
    <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,
      background:"rgba(12,11,22,0.99)",border:`1px solid ${T.border}`,
      borderRadius:8,zIndex:200,overflow:"hidden",boxShadow:"0 16px 48px rgba(0,0,0,0.8)"}}>
      {suggestions.map((s,i) => (
        <div key={i} onMouseDown={e=>{e.preventDefault();onSelect(s);}}
          style={{padding:"11px 16px",cursor:"pointer",borderBottom:`1px solid ${T.border}`,
            transition:"background 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{color:type==="hashtag"?T.gold:"#8ec4a8",fontFamily:T.mono,fontSize:14}}>
            {type==="hashtag"?"#":"@"}{s}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Story viewer ─────────────────────────────────────────────────────────────
function StoryModal({ collection, onClose }) {
  if (!collection) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",
      zIndex:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:400,width:"100%",position:"relative"}}>
        {/* Progress bars */}
        <div style={{position:"absolute",top:14,left:16,right:16,zIndex:2,display:"flex",gap:4}}>
          {[...(Array(Math.max(collection.nfts?.length||1,1)))].map((_,i) => (
            <div key={i} style={{flex:1,height:2,background:"rgba(255,255,255,0.25)",borderRadius:1,overflow:"hidden"}}>
              <div style={{height:"100%",background:T.white,
                animation:i===0?"storyBar 4s linear forwards":"none",width:i===0?undefined:"0%"}} />
            </div>
          ))}
        </div>
        <style>{`@keyframes storyBar{from{width:0}to{width:100%}}`}</style>
        {/* Header */}
        <div style={{position:"absolute",top:26,left:16,right:16,zIndex:2,
          display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,minWidth:38,borderRadius:"50%",
            border:`2px solid ${collection.accent}`,display:"flex",alignItems:"center",
            justifyContent:"center",fontFamily:T.font,fontSize:19,color:collection.accent}}>
            {collection.avatar}
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white}}>{collection.name}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:"rgba(255,255,255,0.6)"}}>{collection.creator}</div>
          </div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",
            color:"rgba(255,255,255,0.7)",fontSize:26,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        {/* Content */}
        <div style={{height:"76vh",maxHeight:660,
          background:collection.nfts?.[0]?.bg||`linear-gradient(160deg,#0d0b07,#2a1f0a)`,
          borderRadius:18,overflow:"hidden",display:"flex",alignItems:"center",
          justifyContent:"center",flexDirection:"column",gap:18,padding:48}}>
          <div style={{fontFamily:T.font,fontSize:80,color:T.gold,lineHeight:1}}>
            {collection.nfts?.[0]?.image||collection.avatar}
          </div>
          <div style={{fontFamily:T.font,fontSize:24,fontWeight:700,color:T.white,textAlign:"center"}}>{collection.name}</div>
          <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:"rgba(255,255,255,0.65)",
            textAlign:"center",lineHeight:1.8,maxWidth:290}}>
            {collection.description}
          </div>
          {collection.nfts?.[0] && (
            <div style={{marginTop:10,border:`1px solid ${T.gold}55`,borderRadius:8,
              padding:"11px 22px",fontFamily:T.font,fontSize:17,color:T.gold}}>
              From {collection.nfts[0].price} ETH
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Profile Preview Modal ─────────────────────────────────────────────────────
function ProfilePreviewModal({ profile, onClose }) {
  if (!profile) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",
      backdropFilter:"blur(10px)",zIndex:700,display:"flex",alignItems:"flex-end",
      justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h"
        style={{maxWidth:420,width:"100%",border:`1px solid ${T.border}`,borderRadius:16,
          overflow:"hidden",marginBottom:90,animation:`fadeUp 0.28s ${T.smooth} both`}}>
        <div style={{height:90,
          background:profile.banner?.data
            ? `url(${profile.banner.data}) center/cover`
            : `linear-gradient(135deg,${profile.coverColor||"#12100a"},${T.bg})`,
          position:"relative"}}>
          <div style={{position:"absolute",bottom:-26,left:22}}>
            <AnimatedAvatar
              avatar={profile.avatar||{type:"symbol",value:"◆"}}
              zodiac={profile.zodiac}
              size={52} border />
          </div>
        </div>
        <div style={{padding:"36px 22px 24px"}}>
          <div style={{fontFamily:T.font,fontSize:22,fontWeight:700,color:T.white,marginBottom:3}}>
            {profile.displayName||"Anonymous"}
          </div>
          {profile.username && (
            <div style={{fontFamily:T.mono,fontSize:12,color:T.gold,marginBottom:5}}>@{profile.username}</div>
          )}
          {profile.zodiac && (
            <div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginBottom:10}}>
              {profile.zodiac.symbol} {profile.zodiac.sign}
            </div>
          )}
          {profile.bio && (
            <p style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.7,marginBottom:18}}>
              {profile.bio}
            </p>
          )}
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose}
              style={{flex:1,background:"transparent",border:`1px solid ${T.gold}`,
                borderRadius:8,padding:"10px 0",color:T.gold,fontFamily:T.sans,
                fontSize:12,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",
                cursor:"pointer",transition:`all 0.18s ${T.smooth}`}}
              onMouseEnter={e=>e.currentTarget.style.background=T.goldSoft}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              Follow
            </button>
            <button onClick={onClose}
              style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                borderRadius:8,padding:"10px 0",color:T.muted,fontFamily:T.sans,
                fontSize:12,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",
                cursor:"pointer",transition:`all 0.18s ${T.smooth}`}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Composer ─────────────────────────────────────────────────────────────
const MENTION_POOL = [];
const TAG_POOL     = ["AfricanArt","NFT","PARADISE","Accra","Lagos","Kente","UpCycle","DigitalArt","Web3Africa"];
const MAX_CHARS    = 500;

export function PostComposer({ user, onPost }) {
  const [text,setText]       = useState("");
  const [media,setMedia]     = useState([]);
  const [posting,setPosting] = useState(false);
  const [ac,setAC]           = useState({show:false,type:null,suggestions:[],pos:0});
  const taRef  = useRef();
  const fileRef = useRef();

  if (!user) return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,
      padding:"22px 20px",marginBottom:24,textAlign:"center"}}>
      <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:15}}>
        Sign in to share with the community.
      </p>
    </div>
  );

  const handleChange = e => {
    const v = e.target.value;
    if (v.length > MAX_CHARS) return;
    setText(v);
    const pos = e.target.selectionStart;
    const before = v.slice(0, pos);
    const mM = before.match(/@(\w*)$/);
    const hM = before.match(/#(\w*)$/);
    if (mM) {
      const q = mM[1].toLowerCase();
      setAC({show:true,type:"mention",pos,suggestions:MENTION_POOL.filter(u=>u.includes(q)).slice(0,5)});
    } else if (hM) {
      const q = hM[1].toLowerCase();
      setAC({show:true,type:"hashtag",pos,suggestions:TAG_POOL.filter(t=>t.toLowerCase().includes(q)).slice(0,5)});
    } else {
      setAC(p=>({...p,show:false}));
    }
  };

  const handleSelect = s => {
    const before = text.slice(0, ac.pos);
    const after  = text.slice(ac.pos);
    const prefix = ac.type === "mention" ? "@" : "#";
    setText(before.replace(/([@#]\w*)$/, prefix+s+" ") + after);
    setAC(p=>({...p,show:false}));
    setTimeout(() => taRef.current?.focus(), 0);
  };

  const handleMedia = e => {
    Array.from(e.target.files).slice(0, 4 - media.length).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setMedia(p => [...p, {name:f.name,type:f.type,data:ev.target.result}]);
      r.readAsDataURL(f);
    });
  };

  const submit = () => {
    if (!text.trim() && !media.length) return;
    setPosting(true);
    setTimeout(() => {
      onPost({
        id: Date.now(),
        user:     user.profile?.displayName || user.name,
        username: user.profile?.username    || null,
        avatar:   user.profile?.avatar      || {type:"symbol",value:"◆"},
        zodiac:   user.profile?.zodiac      || null,
        text, media,
        likes: 0, likedBy: [], comments: 0, reposts: 0,
        time: "Just now",
        likedByMe: false, pinned: false, blocked: false,
      });
      setText(""); setMedia([]); setPosting(false);
    }, 380);
  };

  const rem = MAX_CHARS - text.length;
  const pct = (text.length / MAX_CHARS) * 100;
  const cCol = rem < 50 ? T.red : rem < 100 ? T.gold : T.dim;

  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,
      padding:"18px 20px",marginBottom:24}}>
      <div style={{display:"flex",gap:13,alignItems:"flex-start"}}>
        <AnimatedAvatar
          avatar={user.profile?.avatar||{type:"symbol",value:"◆"}}
          zodiac={user.profile?.zodiac}
          size={40} border />
        <div style={{flex:1,position:"relative"}}>
          <textarea
            ref={taRef} value={text} onChange={handleChange}
            placeholder="Share something… use @mention or #hashtag"
            rows={3}
            style={{width:"100%",background:"transparent",border:"none",outline:"none",
              color:T.white,fontFamily:T.sans,fontSize:15,fontWeight:400,
              lineHeight:1.7,resize:"none",paddingTop:4}} />
          {ac.show && ac.suggestions.length > 0 && (
            <Autocomplete suggestions={ac.suggestions} onSelect={handleSelect} type={ac.type} />
          )}
        </div>
      </div>

      {/* Media preview */}
      {media.length > 0 && (
        <div style={{display:"grid",
          gridTemplateColumns:media.length===1?"1fr":"1fr 1fr",
          gap:6,margin:"12px 0 0 53px",borderRadius:8,overflow:"hidden"}}>
          {media.map((m,i) => (
            <div key={i} style={{position:"relative",borderRadius:6,overflow:"hidden"}}>
              {m.type.startsWith("image")
                ? <img src={m.data} alt="" style={{width:"100%",height:media.length===1?280:150,objectFit:"cover",display:"block"}} />
                : <div style={{height:80,background:T.dim,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:11,color:T.muted}}>{m.name}</div>
              }
              <button onClick={()=>setMedia(p=>p.filter((_,j)=>j!==i))}
                style={{position:"absolute",top:7,right:7,width:28,height:28,borderRadius:"50%",
                  background:"rgba(0,0,0,0.8)",border:"none",color:T.white,
                  fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
          ))}
        </div>
      )}

      <Divider style={{margin:"13px 0 11px"}} />

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {/* Photo button */}
        <button onClick={()=>fileRef.current.click()} title="Add photo/video"
          style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:7,padding:"6px 10px",color:T.muted,fontSize:16,
            cursor:"pointer",transition:`all 0.18s ${T.smooth}`,display:"flex",alignItems:"center",gap:5}}>
          📷
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{display:"none"}} onChange={handleMedia} />

        {/* Hashtag shortcut */}
        <button onClick={()=>{setText(t=>t+" #");taRef.current?.focus();}}
          style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:7,padding:"5px 10px",color:T.muted,fontFamily:T.mono,
            fontSize:13,cursor:"pointer",transition:`all 0.18s ${T.smooth}`,fontWeight:600}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          #
        </button>

        {/* Mention shortcut */}
        <button onClick={()=>{setText(t=>t+" @");taRef.current?.focus();}}
          style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:7,padding:"5px 10px",color:"#8ec4a8",fontFamily:T.mono,
            fontSize:13,cursor:"pointer",transition:`all 0.18s ${T.smooth}`,fontWeight:600}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#8ec4a8"}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          @
        </button>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          {/* Character count ring */}
          {text.length > 0 && (
            <div style={{position:"relative",width:28,height:28,flexShrink:0}}>
              <svg width="28" height="28" style={{transform:"rotate(-90deg)"}}>
                <circle cx="14" cy="14" r="11" fill="none" stroke={T.dim} strokeWidth="2"/>
                <circle cx="14" cy="14" r="11" fill="none" stroke={cCol} strokeWidth="2"
                  strokeDasharray={`${2*Math.PI*11}`}
                  strokeDashoffset={`${2*Math.PI*11*(1-pct/100)}`}
                  strokeLinecap="round"
                  style={{transition:"stroke-dashoffset 0.2s, stroke 0.2s"}}/>
              </svg>
              {rem < 50 && (
                <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
                  justifyContent:"center",fontFamily:T.mono,fontSize:8,color:cCol}}>{rem}</span>
              )}
            </div>
          )}

          {/* Post button */}
          <button onClick={submit}
            disabled={posting || (!text.trim() && !media.length)}
            style={{background:T.gold,border:"none",borderRadius:8,
              padding:"8px 20px",color:"#08080e",fontFamily:T.sans,
              fontSize:12,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
              cursor:posting||(!text.trim()&&!media.length)?"not-allowed":"pointer",
              opacity:posting||(!text.trim()&&!media.length)?0.45:1,
              transition:`all 0.18s ${T.smooth}`}}>
            {posting ? "…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onSelectNFT, nftData, onAvatarTap, onMention, isAdmin, onPin, onBlock, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [lightboxSrc, setLightboxSrc]   = useState(null);
  const [reposted, setReposted]         = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const addComment = () => {
    if (!commentText.trim()) return;
    setLocalComments(p => [...p, {id:Date.now(),user:"You",text:commentText,time:"Just now"}]);
    setCommentText("");
  };

  if (post.blocked) return (
    <div style={{borderBottom:`1px solid ${T.border}`,padding:"14px 0",marginBottom:14}}>
      <span style={{fontFamily:T.mono,fontSize:11,color:T.dim,fontStyle:"italic"}}>
        ◈ This post has been removed by a moderator.
      </span>
    </div>
  );

  return (
    <div style={{borderBottom:`1px solid ${T.border}`,paddingBottom:22,marginBottom:22,
      animation:`fadeUp 0.36s ${T.smooth} both`}}>

      {/* Lightbox */}
      {lightboxSrc && (
        <div onClick={()=>setLightboxSrc(null)} style={{position:"fixed",inset:0,
          background:"rgba(0,0,0,0.97)",zIndex:900,display:"flex",alignItems:"center",
          justifyContent:"center",cursor:"zoom-out"}}>
          <img src={lightboxSrc} alt="" style={{maxWidth:"96vw",maxHeight:"94vh",objectFit:"contain",borderRadius:6}} />
          <button onClick={()=>setLightboxSrc(null)} style={{position:"absolute",top:20,right:20,
            background:"rgba(255,255,255,0.1)",border:"none",color:T.white,fontSize:24,
            width:44,height:44,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      )}

      {/* Pinned label */}
      {post.pinned && (
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
          <span style={{fontSize:12}}>📌</span>
          <span style={{fontFamily:T.mono,fontSize:9,color:T.gold,letterSpacing:2,textTransform:"uppercase"}}>Pinned post</span>
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",gap:13,alignItems:"flex-start",marginBottom:12}}>
        <div style={{cursor:"pointer",flexShrink:0}} onClick={()=>onAvatarTap&&onAvatarTap(post)}>
          <AnimatedAvatar avatar={post.avatar} zodiac={post.zodiac} size={42} border />
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            <span style={{fontFamily:T.sans,fontSize:14,fontWeight:700,color:T.white,cursor:"pointer"}}
              onClick={()=>onAvatarTap&&onAvatarTap(post)}>
              {post.user}
            </span>
            {post.verified && <span className="crown" style={{fontSize:12}}>👑</span>}
            {post.flagged && <FlagBadge at={post.flaggedAt} />}
            {post.username && (
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted,cursor:"pointer"}}
                onClick={()=>onMention&&onMention(post.username)}>
                @{post.username}
              </span>
            )}
            {post.action && <span style={{fontFamily:T.sans,fontSize:13,color:T.muted}}>{post.action}</span>}
          </div>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:2}}>{post.time||"Just now"}</div>
        </div>
        {/* Admin menu */}
        {isAdmin && (
          <div style={{position:"relative",flexShrink:0}}>
            <button onClick={()=>setShowAdminMenu(p=>!p)}
              style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,
                width:28,height:28,color:T.muted,fontSize:14,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>⋮</button>
            {showAdminMenu && (
              <div className="glass-h" style={{position:"absolute",right:0,top:34,
                border:`1px solid ${T.border}`,borderRadius:8,zIndex:50,minWidth:130,overflow:"hidden"}}>
                {[["📌 Pin",()=>onPin(post.id)],["🚫 Block",()=>onBlock(post.id)],["🗑️ Delete",()=>onDelete(post.id)]].map(([l,fn])=>(
                  <button key={l} onClick={()=>{fn();setShowAdminMenu(false);}}
                    style={{width:"100%",background:"none",border:"none",borderBottom:`1px solid ${T.border}`,
                      color:l.includes("Delete")?T.red:T.muted,padding:"10px 14px",textAlign:"left",
                      fontFamily:T.sans,fontSize:12,cursor:"pointer",display:"block",
                      transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}>{l}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post text */}
      {(post.text || post.comment) && (
        <p style={{fontFamily:T.sans,fontSize:15,fontWeight:400,color:"#e0ddf0",
          lineHeight:1.8,marginBottom:12,marginLeft:55}}>
          <RichText text={post.text||post.comment} onMention={onMention} />
        </p>
      )}

      {/* Media grid */}
      {post.media?.length > 0 && (
        <div style={{display:"grid",
          gridTemplateColumns:post.media.length===1?"1fr":"1fr 1fr",
          gap:4,marginBottom:12,marginLeft:55,borderRadius:10,overflow:"hidden"}}>
          {post.media.map((m,i) => (
            <div key={i} style={{cursor:"zoom-in",position:"relative"}}
              onClick={()=>m.type?.startsWith("image")&&setLightboxSrc(m.data)}>
              <img src={m.data} alt=""
                style={{width:"100%",height:post.media.length===1?320:170,
                  objectFit:"cover",display:"block",transition:"filter 0.2s"}}
                onMouseEnter={e=>e.target.style.filter="brightness(1.07)"}
                onMouseLeave={e=>e.target.style.filter="brightness(1)"} />
            </div>
          ))}
        </div>
      )}

      {/* NFT card embed */}
      {nftData && (
        <div onClick={()=>onSelectNFT(nftData.nft,nftData.collection)}
          style={{margin:"0 0 12px 55px",border:`1px solid ${T.border}`,borderRadius:10,
            overflow:"hidden",cursor:"pointer",display:"flex",transition:`border-color 0.18s`}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <div style={{width:76,background:nftData.nft.bg,display:"flex",alignItems:"center",
            justifyContent:"center",fontFamily:T.font,fontSize:28,color:T.gold,flexShrink:0}}>
            {nftData.nft.image}
          </div>
          <div style={{padding:"12px 15px",flex:1,minWidth:0}}>
            <div style={{fontFamily:T.font,fontSize:14,fontWeight:700,color:T.white,
              marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {nftData.nft.name}
            </div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:4}}>{nftData.collection.creator}</div>
            <div style={{fontFamily:T.font,fontSize:15,color:T.gold}}>{nftData.nft.price} ETH · GHS {nftData.nft.momoPrice}</div>
          </div>
        </div>
      )}

      {/* Action buttons — improved graphics */}
      <div style={{display:"flex",gap:6,marginLeft:55,marginTop:4}}>
        {/* Like */}
        <button onClick={()=>onLike(post.id)}
          style={{display:"flex",alignItems:"center",gap:5,
            background:post.likedByMe?"rgba(224,80,80,0.12)":"rgba(255,255,255,0.03)",
            border:`1px solid ${post.likedByMe?"rgba(224,80,80,0.5)":"rgba(255,255,255,0.1)"}`,
            borderRadius:20,color:post.likedByMe?"#e07070":"#8884a8",
            fontFamily:T.sans,fontSize:12,fontWeight:600,cursor:"pointer",
            padding:"6px 14px",transition:`all 0.2s ${T.smooth}`,
            transform:"translateZ(0)"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={post.likedByMe?"#e07070":"none"} stroke={post.likedByMe?"#e07070":"#8884a8"} strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span style={{minWidth:14,textAlign:"left",fontWeight:700}}>{post.likes||0}</span>
        </button>

        {/* Comment */}
        <button onClick={()=>setShowComments(p=>!p)}
          style={{display:"flex",alignItems:"center",gap:5,
            background:showComments?"rgba(201,169,110,0.1)":"rgba(255,255,255,0.03)",
            border:`1px solid ${showComments?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.1)"}`,
            borderRadius:20,color:showComments?T.gold:"#8884a8",
            fontFamily:T.sans,fontSize:12,fontWeight:600,cursor:"pointer",
            padding:"6px 14px",transition:`all 0.2s ${T.smooth}`}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span style={{minWidth:14,textAlign:"left",fontWeight:700}}>{(post.comments||0)+localComments.length}</span>
        </button>

        {/* Repost */}
        <button onClick={()=>setReposted(p=>!p)}
          style={{display:"flex",alignItems:"center",gap:5,
            background:reposted?"rgba(100,190,140,0.1)":"rgba(255,255,255,0.03)",
            border:`1px solid ${reposted?"rgba(100,190,140,0.4)":"rgba(255,255,255,0.1)"}`,
            borderRadius:20,color:reposted?"#6aba8a":"#8884a8",
            fontFamily:T.sans,fontSize:12,fontWeight:600,cursor:"pointer",
            padding:"6px 14px",transition:`all 0.2s ${T.smooth}`}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          <span style={{minWidth:14,textAlign:"left",fontWeight:700}}>{(post.reposts||0)+(reposted?1:0)}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{marginLeft:55,marginTop:14}}>
          {localComments.map(c => (
            <div key={c.id} style={{display:"flex",gap:10,marginBottom:10}}>
              <div style={{width:28,height:28,minWidth:28,borderRadius:"50%",
                border:`1px solid ${T.border}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontFamily:T.font,fontSize:13,color:T.gold}}>◆</div>
              <div className="glass" style={{borderRadius:8,padding:"9px 14px",flex:1}}>
                <span style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.white}}>{c.user} </span>
                <span style={{fontFamily:T.sans,fontSize:13,color:"#ccc"}}>
                  <RichText text={c.text} onMention={()=>{}} />
                </span>
                <div style={{fontFamily:T.mono,fontSize:9,color:T.dim,marginTop:3}}>{c.time}</div>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input value={commentText}
              onChange={e=>setCommentText(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addComment()}
              placeholder="Reply… @mention #tag"
              style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                borderRadius:8,padding:"10px 13px",color:T.white,fontFamily:T.sans,
                fontSize:13,outline:"none",transition:`border-color 0.2s`}}
              onFocus={e=>e.target.style.borderColor=T.gold}
              onBlur={e=>e.target.style.borderColor=T.border} />
            <button onClick={addComment}
              style={{background:"rgba(201,169,110,0.1)",border:`1px solid ${T.gold}44`,
                borderRadius:8,padding:"10px 16px",color:T.gold,fontFamily:T.sans,
                fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
                cursor:"pointer",transition:`all 0.18s ${T.smooth}`,whiteSpace:"nowrap"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(201,169,110,0.2)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(201,169,110,0.1)"}>
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Feed Page ─────────────────────────────────────────────────────────────────
export default function SocialFeedPage({ user, collections, onSelectNFT, posts, onPost, onLike, isAdmin, onPin, onBlockPost, onDeletePost }) {
  const [filter,setFilter]             = useState("all");
  const [openStory,setOpenStory]       = useState(null);
  const [previewProfile,setPreview]    = useState(null);

  const getNFT = post => {
    if (!post.collectionId || !post.nftId) return null;
    const col = collections.find(c => c.id === post.collectionId);
    const nft = col?.nfts?.find(n => n.id === post.nftId);
    return nft && col ? { nft, collection:col } : null;
  };

  const filtered = posts.filter(p => {
    if (p.blocked) return false;
    if (filter === "nfts") return !!p.collectionId;
    return true;
  });

  const handleAvatarTap = post => {
    setPreview({
      displayName: post.user,
      username:    post.username,
      avatar:      post.avatar,
      zodiac:      post.zodiac,
      bio:         null,
      coverColor:  "#12100a",
      banner:      null,
    });
  };

  const handleMention = username => {
    setPreview({ displayName:username, username, avatar:{type:"symbol",value:"◆"}, zodiac:null });
  };

  return (
    <div style={{maxWidth:640,margin:"0 auto",padding:"0 clamp(14px,4vw,20px)"}}>
      {openStory && <StoryModal collection={openStory} onClose={()=>setOpenStory(null)} />}
      {previewProfile && <ProfilePreviewModal profile={previewProfile} onClose={()=>setPreview(null)} />}

      {/* Creator story bubbles — only show if there are real collections */}
      {collections.length > 0 && (
        <div style={{display:"flex",gap:18,overflowX:"auto",paddingBottom:18,marginBottom:4,
          scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {collections.map(c => (
            <div key={c.id} onClick={()=>setOpenStory(c)}
              style={{flexShrink:0,textAlign:"center",cursor:"pointer"}}>
              <div style={{width:60,height:60,minWidth:60,borderRadius:"50%",
                border:`2.5px solid ${c.accent}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontFamily:T.font,fontSize:24,color:c.accent,
                marginBottom:7,boxShadow:`0 0 14px 0 ${c.accent}33`,
                transition:`box-shadow 0.25s`}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 24px 5px ${c.accent}55`}
                onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 0 14px 0 ${c.accent}33`}>
                {c.avatar}
              </div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"#b0accc",
                letterSpacing:0.5,maxWidth:60,overflow:"hidden",
                textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {c.creator?.split(" ")[0]||c.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {collections.length > 0 && <Divider style={{marginBottom:22}} />}

      <PostComposer user={user} onPost={onPost} />

      {/* Filter tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:24}}>
        {[["all","All"],["nfts","NFT Posts"],["following","Following"]].map(([k,l]) => (
          <button key={k} onClick={()=>setFilter(k)}
            style={{background:"none",border:"none",
              borderBottom:filter===k?`2px solid ${T.gold}`:"2px solid transparent",
              color:filter===k?T.gold:"#888",fontFamily:T.mono,fontSize:11,
              fontWeight:filter===k?700:400,letterSpacing:2,textTransform:"uppercase",
              padding:"0 0 11px",marginRight:22,marginBottom:-1,
              transition:`all 0.18s`,cursor:"pointer"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"64px 0",fontFamily:T.font,
          fontStyle:"italic",color:T.muted,fontSize:17}}>
          {filter === "following"
            ? "Follow creators to see their posts here."
            : "No posts yet. Be the first to share something."}
        </div>
      ) : (
        filtered.map(p => (
          <PostCard key={p.id} post={p} onLike={onLike} onSelectNFT={onSelectNFT}
            nftData={getNFT(p)} onAvatarTap={handleAvatarTap} onMention={handleMention}
            isAdmin={isAdmin} onPin={onPin} onBlock={onBlockPost} onDelete={onDeletePost} />
        ))
      )}
    </div>
  );
}
