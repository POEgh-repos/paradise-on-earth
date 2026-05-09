import { useState, useRef } from "react";
import { T, Btn, Divider, AnimatedAvatar } from "./tokens";

// ── Rich text — @mentions and #hashtags ───────────────────────────────────────
function RichText({ text, onMention }) {
  if (!text) return null;
  return (
    <span>
      {text.split(/(#\w+|@\w+)/g).map((p, i) => {
        if (p.startsWith("#")) return (
          <span key={i} style={{color:T.gold,fontWeight:700,cursor:"pointer"}}
            onClick={e=>{e.stopPropagation();}}>{p}</span>
        );
        if (p.startsWith("@")) return (
          <span key={i} style={{color:"#8ec4a8",fontWeight:700,cursor:"pointer"}}
            onClick={e=>{e.stopPropagation(); onMention&&onMention(p.slice(1));}}>{p}</span>
        );
        return p;
      })}
    </span>
  );
}

// ── Autocomplete dropdown ─────────────────────────────────────────────────────
function Autocomplete({ suggestions, onSelect, type }) {
  if (!suggestions.length) return null;
  return (
    <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"rgba(14,13,24,0.99)",border:`1px solid ${T.border}`,borderRadius:6,zIndex:200,overflow:"hidden",boxShadow:"0 16px 40px rgba(0,0,0,0.85)"}}>
      {suggestions.map((s,i)=>(
        <div key={i} onMouseDown={e=>{e.preventDefault();onSelect(s);}}
          style={{padding:"10px 16px",cursor:"pointer",borderBottom:`1px solid ${T.border}`,transition:`background 0.15s`}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{color:type==="hashtag"?T.gold:"#8ec4a8",fontFamily:T.mono,fontSize:13}}>{type==="hashtag"?"#":"@"}{s}</span>
        </div>
      ))}
    </div>
  );
}

// ── Story viewer (Instagram-style) ────────────────────────────────────────────
function StoryModal({ collection, onClose }) {
  if (!collection) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:380,width:"100%",position:"relative"}}>
        {/* Story bar */}
        <div style={{position:"absolute",top:14,left:16,right:16,zIndex:2,display:"flex",gap:4}}>
          {[...Array(Math.max(collection.nfts?.length||1,1))].map((_,i)=>(
            <div key={i} style={{flex:1,height:2,background:"rgba(255,255,255,0.3)",borderRadius:1,overflow:"hidden"}}>
              <div style={{height:"100%",background:T.white,animation:i===0?"storyBar 4s linear forwards":"none",width:i===0?undefined:"0%"}} />
            </div>
          ))}
        </div>
        <style>{`@keyframes storyBar{from{width:0}to{width:100%}}`}</style>
        {/* Header */}
        <div style={{position:"absolute",top:24,left:16,right:16,zIndex:2,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,minWidth:36,borderRadius:"50%",border:`2px solid ${collection.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:18,color:collection.accent}}>
            {collection.avatar}
          </div>
          <div>
            <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white}}>{collection.name}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:"rgba(255,255,255,0.6)"}}>{collection.creator}</div>
          </div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,0.7)",fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        {/* Story content */}
        <div style={{height:"72vh",maxHeight:640,background:collection.nfts?.[0]?.bg||`linear-gradient(160deg,#0d0b07,#2a1f0a)`,borderRadius:16,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:40}}>
          <div style={{fontFamily:T.font,fontSize:72,color:T.gold,lineHeight:1}}>{collection.nfts?.[0]?.image||collection.avatar}</div>
          <div style={{fontFamily:T.font,fontSize:22,fontWeight:700,color:T.white,textAlign:"center"}}>{collection.name}</div>
          <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:15,color:"rgba(255,255,255,0.65)",textAlign:"center",lineHeight:1.8,maxWidth:280}}>{collection.description}</div>
          {collection.nfts?.[0]&&(
            <div style={{marginTop:8,border:`1px solid ${T.gold}44`,borderRadius:8,padding:"10px 20px",fontFamily:T.font,fontSize:16,color:T.gold}}>
              From {collection.nfts[0].price} ETH
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Profile mini-modal (tapping avatar) ───────────────────────────────────────
function ProfilePreviewModal({ profile, onClose, onGoProfile }) {
  if (!profile) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h" style={{maxWidth:400,width:"100%",border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",marginBottom:80,animation:`fadeUp 0.28s ${T.smooth} both`}}>
        <div style={{height:80,background:profile.banner?.data?`url(${profile.banner.data}) center/cover`:`linear-gradient(135deg,${profile.coverColor||"#12100a"},${T.bg})`,position:"relative"}}>
          <div style={{position:"absolute",bottom:-22,left:20}}>
            <AnimatedAvatar avatar={profile.avatar||{type:"symbol",value:"◆"}} zodiac={profile.zodiac} size={48} border />
          </div>
        </div>
        <div style={{padding:"30px 20px 20px"}}>
          <div style={{fontFamily:T.font,fontSize:20,fontWeight:700,color:T.white,marginBottom:2}}>{profile.displayName||"Unknown"}</div>
          {profile.username&&<div style={{fontFamily:T.mono,fontSize:12,color:T.gold,marginBottom:4}}>@{profile.username}</div>}
          {profile.zodiac&&<div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginBottom:8}}>{profile.zodiac.symbol} {profile.zodiac.sign}</div>}
          {profile.bio&&<p style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.6,marginBottom:14}}>{profile.bio}</p>}
          <div style={{display:"flex",gap:10}}>
            <Btn variant="outline" style={{flex:1}} size="sm" onClick={onClose}>Follow</Btn>
            <Btn variant="ghost" style={{flex:1}} size="sm" onClick={()=>{onClose();onGoProfile&&onGoProfile(profile.username);}}>View Profile</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Composer ─────────────────────────────────────────────────────────────
const USERS = ["kofi.b","abena.k","yaw.m","ama.s","kwame.a","zara.m","nia.o","amara.d"];
const TAGS  = ["AfricanArt","NFT","PARADISE","Accra","Lagos","Kente","UpCycle","DigitalArt","Web3Africa","CreativeAfrica"];
const MAX   = 500;

export function PostComposer({ user, onPost }) {
  const [text,setText]     = useState("");
  const [media,setMedia]   = useState([]);
  const [posting,setPosting] = useState(false);
  const [ac,setAC]         = useState({show:false,type:null,query:"",suggestions:[],pos:0});
  const taRef  = useRef();
  const fileRef= useRef();

  if (!user) return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:20,marginBottom:22,textAlign:"center"}}>
      <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:15}}>Sign in to share with the community.</p>
    </div>
  );

  const handleChange=e=>{
    const v=e.target.value; if(v.length>MAX)return; setText(v);
    const pos=e.target.selectionStart, before=v.slice(0,pos);
    const mM=before.match(/@(\w*)$/), hM=before.match(/#(\w*)$/);
    if(mM){ const q=mM[1].toLowerCase(); setAC({show:true,type:"mention",query:q,pos,suggestions:USERS.filter(u=>u.includes(q)).slice(0,5)}); }
    else if(hM){ const q=hM[1].toLowerCase(); setAC({show:true,type:"hashtag",query:q,pos,suggestions:TAGS.filter(t=>t.toLowerCase().includes(q)).slice(0,5)}); }
    else setAC(p=>({...p,show:false}));
  };

  const handleSelect=s=>{
    const before=text.slice(0,ac.pos),after=text.slice(ac.pos);
    const prefix=ac.type==="mention"?"@":"#";
    setText(before.replace(/([@#]\w*)$/,prefix+s+" ")+after);
    setAC(p=>({...p,show:false}));
    setTimeout(()=>taRef.current?.focus(),0);
  };

  const handleMedia=e=>{
    Array.from(e.target.files).slice(0,4-media.length).forEach(f=>{
      const r=new FileReader();
      // Read at full quality — no resizing
      r.onload=ev=>setMedia(p=>[...p,{name:f.name,type:f.type,data:ev.target.result,size:f.size}]);
      r.readAsDataURL(f);
    });
  };

  const submit=()=>{
    if(!text.trim()&&!media.length)return; setPosting(true);
    setTimeout(()=>{
      onPost({id:Date.now(),user:user.profile?.displayName||user.name,username:user.profile?.username||null,avatar:user.profile?.avatar||{type:"symbol",value:user.avatar||"◆"},zodiac:user.profile?.zodiac||null,text,media,likes:0,comments:0,reposts:0,time:"Just now",likedByMe:false,pinned:false});
      setText("");setMedia([]);setPosting(false);
    },480);
  };

  const rem=MAX-text.length, pct=(text.length/MAX)*100, cCol=rem<50?T.red:rem<100?T.gold:T.dim;

  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"16px 18px",marginBottom:22}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:user.avatar||"◆"}} zodiac={user.profile?.zodiac} size={38} border />
        <div style={{flex:1,position:"relative"}}>
          <textarea ref={taRef} value={text} onChange={handleChange} placeholder="Share something… @mention or #hashtag" rows={3}
            style={{width:"100%",background:"transparent",border:"none",outline:"none",color:T.white,fontFamily:T.sans,fontSize:15,fontWeight:400,lineHeight:1.7,resize:"none",paddingTop:2}} />
          {ac.show&&ac.suggestions.length>0&&<Autocomplete suggestions={ac.suggestions} onSelect={handleSelect} type={ac.type} />}
        </div>
      </div>
      {media.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:media.length===1?"1fr":"1fr 1fr",gap:6,margin:"12px 0 0 50px",borderRadius:6,overflow:"hidden"}}>
          {media.map((m,i)=>(
            <div key={i} style={{position:"relative",borderRadius:4,overflow:"hidden"}}>
              {m.type.startsWith("image")
                ?<img src={m.data} alt="" style={{width:"100%",height:media.length===1?260:140,objectFit:"cover",display:"block"}} />
                :<div style={{height:80,background:T.dim,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:11,color:T.muted}}>{m.name}</div>}
              <button onClick={()=>setMedia(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:6,right:6,width:26,height:26,borderRadius:"50%",background:"rgba(0,0,0,0.8)",border:"none",color:T.white,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
          ))}
        </div>
      )}
      <Divider style={{margin:"13px 0 11px"}} />
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <button onClick={()=>fileRef.current.click()} title="Photo/Video" style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer",padding:"3px 6px",borderRadius:3,transition:`color 0.2s`}} onMouseEnter={e=>e.currentTarget.style.color=T.gold} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>◎</button>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{display:"none"}} onChange={handleMedia} />
        {["#","@"].map(ch=>(
          <button key={ch} onClick={()=>{setText(t=>t+" "+ch);taRef.current?.focus();}} style={{background:"none",border:"none",color:T.muted,fontFamily:T.mono,fontSize:14,cursor:"pointer",padding:"3px 6px",borderRadius:3,transition:`color 0.2s`}} onMouseEnter={e=>e.currentTarget.style.color=T.gold} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>{ch}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          {text.length>0&&(
            <div style={{position:"relative",width:26,height:26}}>
              <svg width="26" height="26" style={{transform:"rotate(-90deg)"}}>
                <circle cx="13" cy="13" r="10" fill="none" stroke={T.dim} strokeWidth="2"/>
                <circle cx="13" cy="13" r="10" fill="none" stroke={cCol} strokeWidth="2" strokeDasharray={`${2*Math.PI*10}`} strokeDashoffset={`${2*Math.PI*10*(1-pct/100)}`} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.2s,stroke 0.2s"}}/>
              </svg>
              {rem<50&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:8,color:cCol}}>{rem}</span>}
            </div>
          )}
          <Btn onClick={submit} disabled={posting||(!text.trim()&&!media.length)} size="sm">{posting?"…":"Post"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onSelectNFT, nftData, onAvatarTap, onMention }) {
  const [showComments,setShowComments] = useState(false);
  const [commentText,setCommentText]   = useState("");
  const [comments,setComments]         = useState([]);
  const [reposted,setReposted]         = useState(false);
  const [lightboxSrc,setLightboxSrc]   = useState(null);

  const addComment=()=>{ if(!commentText.trim())return; setComments(p=>[...p,{id:Date.now(),user:"You",text:commentText,time:"Just now"}]); setCommentText(""); };

  if (post.blocked) return (
    <div style={{borderBottom:`1px solid ${T.border}`,paddingBottom:16,marginBottom:16}}>
      <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0"}}>
        <div style={{width:32,height:32,minWidth:32,borderRadius:"50%",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,color:T.muted,fontSize:14}}>◈</div>
        <span style={{fontFamily:T.mono,fontSize:11,color:T.muted,fontStyle:"italic"}}>This post has been removed by a moderator.</span>
      </div>
    </div>
  );

  return (
    <div style={{borderBottom:`1px solid ${T.border}`,paddingBottom:20,marginBottom:20,animation:`fadeUp 0.36s ${T.smooth} both`}}>
      {/* Fullscreen lightbox */}
      {lightboxSrc&&(
        <div onClick={()=>setLightboxSrc(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
          <img src={lightboxSrc} alt="" style={{maxWidth:"96vw",maxHeight:"94vh",objectFit:"contain",borderRadius:4}} />
          <button onClick={()=>setLightboxSrc(null)} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.1)",border:"none",color:T.white,fontSize:22,width:40,height:40,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      )}

      {post.pinned&&(
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <span style={{fontSize:11}}>📌</span>
          <span style={{fontFamily:T.mono,fontSize:9,color:T.gold,letterSpacing:1,textTransform:"uppercase"}}>Pinned</span>
        </div>
      )}

      <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
        {/* Avatar — tapping opens profile preview */}
        <div style={{cursor:"pointer"}} onClick={()=>onAvatarTap&&onAvatarTap(post)}>
          <AnimatedAvatar avatar={post.avatar} zodiac={post.zodiac} size={40} border />
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            <span style={{fontFamily:T.sans,fontSize:14,fontWeight:700,color:T.white,cursor:"pointer"}}
              onClick={()=>onAvatarTap&&onAvatarTap(post)}>{post.user}</span>
            {post.verified&&<span className="crown" style={{fontSize:12}}>👑</span>}
            {post.flagged&&<sup><span className="flag-badge" style={{fontSize:9,color:T.flag}}>❓❓❓</span></sup>}
            {post.username&&(
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted,cursor:"pointer"}}
                onClick={()=>onMention&&onMention(post.username)}>@{post.username}</span>
            )}
            {post.action&&<span style={{fontFamily:T.sans,fontSize:13,color:T.muted}}>{post.action}</span>}
          </div>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:2}}>{post.time}</div>
        </div>
      </div>

      {(post.text||post.comment)&&(
        <p style={{fontFamily:T.sans,fontSize:15,fontWeight:400,color:"#e0ddef",lineHeight:1.78,marginBottom:12,marginLeft:52}}>
          <RichText text={post.text||post.comment} onMention={onMention} />
        </p>
      )}

      {/* High-quality media grid — click to fullscreen */}
      {post.media?.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:post.media.length===1?"1fr":"1fr 1fr",gap:3,marginBottom:12,marginLeft:52,borderRadius:8,overflow:"hidden"}}>
          {post.media.map((m,i)=>(
            <div key={i} style={{position:"relative",cursor:"zoom-in"}} onClick={()=>m.type?.startsWith("image")&&setLightboxSrc(m.data)}>
              <img src={m.data} alt="" style={{width:"100%",height:post.media.length===1?300:160,objectFit:"cover",display:"block",transition:"filter 0.2s"}}
                onMouseEnter={e=>e.target.style.filter="brightness(1.06)"}
                onMouseLeave={e=>e.target.style.filter="brightness(1)"} />
            </div>
          ))}
        </div>
      )}

      {nftData&&(
        <div onClick={()=>onSelectNFT(nftData.nft,nftData.collection)}
          style={{margin:"0 0 12px 52px",border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",cursor:"pointer",display:"flex",transition:`border-color 0.18s`}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <div style={{width:72,background:nftData.nft.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:26,color:T.gold,flexShrink:0}}>{nftData.nft.image}</div>
          <div style={{padding:"11px 14px",flex:1,minWidth:0}}>
            <div style={{fontFamily:T.font,fontSize:14,fontWeight:700,color:T.white,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nftData.nft.name}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:3}}>{nftData.collection.creator}</div>
            <div style={{fontFamily:T.font,fontSize:14,color:T.gold}}>{nftData.nft.price} ETH · GHS {nftData.nft.momoPrice}</div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:2,marginLeft:52}}>
        {[
          {icon:post.likedByMe?"♥":"♡",label:String(post.likes+(post.likedByMe?1:0)),active:post.likedByMe,col:T.red,fn:()=>onLike(post.id)},
          {icon:"◎",label:String((post.comments||0)+comments.length),active:showComments,col:T.gold,fn:()=>setShowComments(p=>!p)},
          {icon:"↗",label:String(post.reposts+(reposted?1:0)),active:reposted,col:"#8ec4a8",fn:()=>setReposted(p=>!p)},
        ].map(({icon,label,active,col,fn})=>(
          <button key={icon} onClick={fn} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"none",color:active?col:T.muted,fontFamily:T.mono,fontSize:12,cursor:"pointer",padding:"6px 10px",borderRadius:4,transition:`color 0.18s`}}
            onMouseEnter={e=>e.currentTarget.style.color=col}
            onMouseLeave={e=>e.currentTarget.style.color=active?col:T.muted}>
            <span style={{fontSize:14}}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {showComments&&(
        <div style={{marginLeft:52,marginTop:12}}>
          {comments.map(c=>(
            <div key={c.id} style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{width:26,height:26,minWidth:26,borderRadius:"50%",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:12,color:T.gold}}>◆</div>
              <div className="glass" style={{borderRadius:4,padding:"9px 13px",flex:1}}>
                <span style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.white}}>{c.user} </span>
                <span style={{fontFamily:T.sans,fontSize:13,color:"#ccc"}}><RichText text={c.text} onMention={()=>{}} /></span>
                <div style={{fontFamily:T.mono,fontSize:9,color:T.dim,marginTop:3}}>{c.time}</div>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComment()} placeholder="Reply… @mention #tag"
              style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:4,padding:"9px 12px",color:T.white,fontFamily:T.sans,fontSize:13,outline:"none",transition:`border-color 0.2s`}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
            <Btn variant="pin" size="sm" onClick={addComment}>Reply</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Social Feed Page ──────────────────────────────────────────────────────────
export default function SocialFeedPage({ user, collections, onSelectNFT, posts, onPost, onLike }) {
  const [filter,setFilter]       = useState("all");
  const [openStory,setOpenStory] = useState(null);    // collection for story
  const [previewProfile,setPreviewProfile] = useState(null); // post for profile preview

  const getNFT=post=>{ if(!post.collectionId||!post.nftId)return null; const c=collections.find(c=>c.id===post.collectionId); const n=c?.nfts.find(n=>n.id===post.nftId); return n&&c?{nft:n,collection:c}:null; };
  const filtered=posts.filter(p=>filter==="nfts"?!!p.collectionId:true);

  const handleAvatarTap=post=>{
    // Build a minimal profile object from post data
    setPreviewProfile({
      displayName:post.user, username:post.username,
      avatar:post.avatar, zodiac:post.zodiac,
      bio:null, coverColor:"#12100a", banner:null,
    });
  };

  const handleMention=username=>{
    // For now open profile preview — would navigate to full profile in full app
    setPreviewProfile({displayName:username,username,avatar:{type:"symbol",value:"◆"},zodiac:null});
  };

  return (
    <div style={{maxWidth:600,margin:"0 auto",padding:"0 16px"}}>
      {/* Story modals */}
      {openStory&&<StoryModal collection={openStory} onClose={()=>setOpenStory(null)} />}
      {previewProfile&&<ProfilePreviewModal profile={previewProfile} onClose={()=>setPreviewProfile(null)} onGoProfile={()=>setPreviewProfile(null)} />}

      {/* Creator story bubbles — tap to open story */}
      <div style={{display:"flex",gap:18,overflowX:"auto",paddingBottom:18,marginBottom:4,scrollbarWidth:"none"}}>
        <style>{`
          ::-webkit-scrollbar{display:none}
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pinSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        {collections.map(c=>(
          <div key={c.id} onClick={()=>setOpenStory(c)} style={{flexShrink:0,textAlign:"center",cursor:"pointer"}}>
            <div style={{width:58,height:58,minWidth:58,minHeight:58,borderRadius:"50%",border:`2.5px solid ${c.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:22,color:c.accent,marginBottom:6,boxSizing:"border-box",transition:`box-shadow 0.25s`,boxShadow:`0 0 12px 0 ${c.accent}33`}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 22px 4px ${c.accent}55`}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 0 12px 0 ${c.accent}33`}>
              {c.avatar}
            </div>
            <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"#b0accc",letterSpacing:0.5,maxWidth:58,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.creator.split(" ")[0]}</div>
          </div>
        ))}
      </div>

      <div style={{height:1,background:T.border,marginBottom:22}} />
      <PostComposer user={user} onPost={onPost} />

      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:20}}>
        {[["all","All"],["nfts","NFT Posts"],["following","Following"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{background:"none",border:"none",borderBottom:filter===k?`2px solid ${T.gold}`:"2px solid transparent",color:filter===k?T.gold:"#888",fontFamily:T.mono,fontSize:11,fontWeight:filter===k?700:400,letterSpacing:2,textTransform:"uppercase",padding:"0 0 10px",marginRight:20,marginBottom:-1,transition:`all 0.18s`,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {filtered.length===0
        ?<div style={{textAlign:"center",padding:"56px 0",fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:17}}>Nothing here yet. Be the first to post.</div>
        :filtered.map(p=>(
          <PostCard key={p.id} post={p} onLike={onLike} onSelectNFT={onSelectNFT} nftData={getNFT(p)}
            onAvatarTap={handleAvatarTap} onMention={handleMention} />
        ))
      }
    </div>
  );
}
