import { useState, useRef, useEffect, useCallback } from "react";
import { T, Btn, Divider, AnimatedAvatar, VerifiedCrown, FlagBadge } from "./tokens";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, query,
  orderBy, serverTimestamp, doc, updateDoc, increment
} from "firebase/firestore";

// ── Rich text: @mentions + #hashtags ─────────────────────────────────────────
function RichText({ text, onMention, onHashtag }) {
  if (!text) return null;
  return (
    <span>
      {text.split(/(#\w+|@[\w.]+)/g).map((part, i) => {
        if (part.startsWith("#")) return (
          <span key={i} style={{color:T.gold,fontWeight:700,cursor:"pointer"}}
            onClick={e=>{e.stopPropagation();onHashtag&&onHashtag(part.slice(1));}}>{part}</span>
        );
        if (part.startsWith("@")) return (
          <span key={i} style={{color:"#8ec4a8",fontWeight:700,cursor:"pointer"}}
            onClick={e=>{e.stopPropagation();onMention&&onMention(part.slice(1));}}>{part}</span>
        );
        return part;
      })}
    </span>
  );
}

// ── Autocomplete ──────────────────────────────────────────────────────────────
function Autocomplete({ suggestions, onSelect, type }) {
  if (!suggestions.length) return null;
  return (
    <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,
      background:"rgba(12,11,22,0.99)",border:`1px solid ${T.border}`,
      borderRadius:10,zIndex:300,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.85)"}}>
      {suggestions.map((s,i) => (
        <div key={i}
          onMouseDown={e=>{e.preventDefault();onSelect(s);}}
          onTouchEnd={e=>{e.preventDefault();onSelect(s);}}
          style={{padding:"12px 18px",cursor:"pointer",borderBottom:`1px solid ${T.border}`,
            transition:"background 0.12s",display:"flex",alignItems:"center",gap:10}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{color:type==="hashtag"?T.gold:"#8ec4a8",fontFamily:T.mono,fontSize:14,fontWeight:700}}>
            {type==="hashtag"?"#":"@"}{s}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Full-screen media viewer: swipe up/down for next ──────────────────────────
function MediaViewer({ mediaList, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex || 0);
  const startY = useRef(null);

  useEffect(() => {
    const k = e => {
      if (e.key==="Escape") onClose();
      if (e.key==="ArrowUp"||e.key==="ArrowRight") setIdx(i=>Math.min(mediaList.length-1,i+1));
      if (e.key==="ArrowDown"||e.key==="ArrowLeft") setIdx(i=>Math.max(0,i-1));
    };
    window.addEventListener("keydown",k);
    return ()=>window.removeEventListener("keydown",k);
  },[mediaList.length,onClose]);

  const m = mediaList[idx];
  return (
    <div onClick={onClose}
      onTouchStart={e=>{startY.current=e.touches[0].clientY;}}
      onTouchEnd={e=>{
        if(startY.current===null)return;
        const dy=startY.current-e.changedTouches[0].clientY;
        if(dy>55) setIdx(i=>Math.min(mediaList.length-1,i+1));
        if(dy<-55) setIdx(i=>Math.max(0,i-1));
        startY.current=null;
      }}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:1000,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        animation:"fadeIn 0.18s ease both"}}>
      <button onClick={onClose} style={{position:"absolute",top:20,right:20,
        background:"rgba(255,255,255,0.1)",border:"none",color:T.white,
        width:44,height:44,borderRadius:"50%",fontSize:22,cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>×</button>

      {mediaList.length>1 && (
        <div style={{position:"absolute",top:24,left:"50%",transform:"translateX(-50%)",
          fontFamily:T.mono,fontSize:12,color:"rgba(255,255,255,0.7)",
          background:"rgba(0,0,0,0.6)",borderRadius:20,padding:"4px 14px",zIndex:2}}>
          {idx+1} / {mediaList.length}
        </div>
      )}

      <div onClick={e=>e.stopPropagation()} style={{maxWidth:"96vw",maxHeight:"90vh",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        {m?.type?.startsWith("video")
          ? <video src={m.data||m.url} controls autoPlay
              style={{maxWidth:"96vw",maxHeight:"88vh",borderRadius:8}} />
          : <img src={m?.data||m?.url} alt=""
              style={{maxWidth:"96vw",maxHeight:"88vh",objectFit:"contain",
                borderRadius:8,userSelect:"none"}} />
        }
      </div>

      {mediaList.length>1 && (
        <>
          <div style={{position:"absolute",bottom:30,left:"50%",transform:"translateX(-50%)",
            display:"flex",gap:7,zIndex:2}}>
            {mediaList.map((_,i)=>(
              <div key={i} onClick={e=>{e.stopPropagation();setIdx(i);}}
                style={{width:i===idx?22:7,height:7,borderRadius:4,cursor:"pointer",
                  background:i===idx?T.gold:"rgba(255,255,255,0.3)",transition:"all 0.2s"}} />
            ))}
          </div>
          <div style={{position:"absolute",bottom:54,left:"50%",transform:"translateX(-50%)",
            fontFamily:T.mono,fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:2}}>
            SWIPE UP / DOWN
          </div>
        </>
      )}
    </div>
  );
}

// ── Story viewer ──────────────────────────────────────────────────────────────
function StoryModal({ collection, onClose }) {
  const [nftIdx,setNftIdx] = useState(0);
  const nfts = collection?.nfts||[];
  const cur  = nfts[nftIdx]||{};
  const startX = useRef(null);

  if(!collection) return null;
  return (
    <div onClick={onClose}
      onTouchStart={e=>{startX.current=e.touches[0].clientX;}}
      onTouchEnd={e=>{
        if(startX.current===null)return;
        const dx=startX.current-e.changedTouches[0].clientX;
        if(dx>50&&nftIdx<nfts.length-1) setNftIdx(i=>i+1);
        if(dx<-50&&nftIdx>0) setNftIdx(i=>i-1);
        startX.current=null;
      }}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:800,
        display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:420,position:"relative",height:"100%",maxHeight:760,display:"flex",flexDirection:"column"}}>
        {/* Progress bars */}
        <div style={{position:"absolute",top:14,left:12,right:12,zIndex:2,display:"flex",gap:3}}>
          {(nfts.length>0?nfts:[{}]).map((_,i)=>(
            <div key={i} style={{flex:1,height:2.5,background:"rgba(255,255,255,0.25)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",background:T.white,
                animation:i===nftIdx?"storyBar 4s linear forwards":"none",
                width:i<nftIdx?"100%":"0%"}} />
            </div>
          ))}
        </div>
        <style>{`@keyframes storyBar{from{width:0}to{width:100%}}`}</style>

        <div style={{position:"absolute",top:26,left:14,right:14,zIndex:2,
          display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,minWidth:40,borderRadius:"50%",
            border:`2px solid ${collection.accent}`,display:"flex",alignItems:"center",
            justifyContent:"center",fontFamily:T.font,fontSize:20,color:collection.accent}}>
            {collection.avatar}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white}}>{collection.name}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:"rgba(255,255,255,0.6)"}}>{collection.creator}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",
            color:"rgba(255,255,255,0.8)",fontSize:28,cursor:"pointer",padding:4}}>×</button>
        </div>

        <div style={{flex:1,background:cur.bg||`linear-gradient(160deg,#0d0b07,#2a1f0a)`,
          display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",
          gap:18,padding:"80px 40px 40px"}}>
          <div style={{fontFamily:T.font,fontSize:80,color:T.gold,lineHeight:1,textAlign:"center"}}>
            {cur.image||collection.avatar}
          </div>
          <div style={{fontFamily:T.font,fontSize:22,fontWeight:700,color:T.white,textAlign:"center"}}>
            {cur.name||collection.name}
          </div>
          <div style={{fontFamily:T.font,fontStyle:"italic",fontSize:14,
            color:"rgba(255,255,255,0.65)",textAlign:"center",lineHeight:1.8,maxWidth:300}}>
            {cur.description||collection.description}
          </div>
          {cur.price&&(
            <div style={{border:`1px solid ${T.gold}55`,borderRadius:8,
              padding:"10px 22px",fontFamily:T.font,fontSize:16,color:T.gold}}>
              {cur.price} ETH · GHS {cur.momoPrice}
            </div>
          )}
        </div>

        {/* Tap sides */}
        <div style={{position:"absolute",inset:0,display:"flex"}}>
          <div style={{flex:1,cursor:"pointer"}} onClick={e=>{e.stopPropagation();setNftIdx(i=>Math.max(0,i-1));}} />
          <div style={{flex:1,cursor:"pointer"}} onClick={e=>{e.stopPropagation();if(nftIdx<nfts.length-1)setNftIdx(i=>i+1);else onClose();}} />
        </div>
      </div>
    </div>
  );
}

// ── Profile Preview ───────────────────────────────────────────────────────────
function ProfilePreviewModal({ profile, onClose }) {
  if(!profile) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",
      backdropFilter:"blur(10px)",zIndex:700,display:"flex",alignItems:"flex-end",
      justifyContent:"center",padding:"0 16px 16px"}}>
      <div onClick={e=>e.stopPropagation()} className="glass-h"
        style={{maxWidth:440,width:"100%",border:`1px solid ${T.border}`,borderRadius:18,
          overflow:"hidden",animation:`slideUp 0.3s ${T.smooth} both`}}>
        <div style={{height:90,
          background:profile.banner?.data
            ?`url(${profile.banner.data}) center/cover`
            :`linear-gradient(135deg,${profile.coverColor||"#12100a"},${T.bg})`,
          position:"relative"}}>
          <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",
            width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.3)"}} />
          <div style={{position:"absolute",bottom:-28,left:22}}>
            <AnimatedAvatar avatar={profile.avatar||{type:"symbol",value:"◆"}}
              zodiac={profile.zodiac} size={56} border />
          </div>
        </div>
        <div style={{padding:"40px 22px 24px"}}>
          <div style={{fontFamily:T.font,fontSize:22,fontWeight:700,color:T.white,marginBottom:2,
            display:"flex",alignItems:"center",gap:6}}>
            {profile.displayName||"Anonymous"}
            {profile.verified&&<span className="crown" style={{fontSize:14}}>👑</span>}
          </div>
          {profile.username&&<div style={{fontFamily:T.mono,fontSize:12,color:T.gold,marginBottom:6}}>@{profile.username}</div>}
          {profile.zodiac&&<div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginBottom:10}}>{profile.zodiac.symbol} {profile.zodiac.sign}</div>}
          {profile.bio&&<p style={{fontFamily:T.sans,fontSize:13,color:T.muted,lineHeight:1.7,marginBottom:18}}>{profile.bio}</p>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,background:T.gold,border:"none",
              borderRadius:10,padding:"12px 0",color:"#08080e",fontFamily:T.sans,
              fontSize:13,fontWeight:700,cursor:"pointer"}}>Follow</button>
            <button onClick={onClose} style={{flex:1,background:"rgba(255,255,255,0.05)",
              border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 0",
              color:T.muted,fontFamily:T.sans,fontSize:13,fontWeight:700,cursor:"pointer"}}>Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Live comments (Firestore) ─────────────────────────────────────────────────
function CommentsSection({ postId, user }) {
  const [comments,setComments] = useState([]);
  const [text,setText]         = useState("");
  const [posting,setPosting]   = useState(false);

  useEffect(()=>{
    if(!postId) return;
    try {
      const q = query(collection(db,"posts",postId,"comments"),orderBy("createdAt","asc"));
      const unsub = onSnapshot(q, snap=>{
        setComments(snap.docs.map(d=>({id:d.id,...d.data()})));
      });
      return unsub;
    } catch(e){}
  },[postId]);

  const submit = async ()=>{
    if(!text.trim()||!user||posting) return;
    setPosting(true);
    try {
      await addDoc(collection(db,"posts",postId,"comments"),{
        text:text.trim(),
        user:user.profile?.displayName||user.name||"Anonymous",
        username:user.profile?.username||null,
        avatar:user.profile?.avatar||{type:"symbol",value:"◆"},
        uid:user.uid,
        createdAt:serverTimestamp(),
      });
      await updateDoc(doc(db,"posts",postId),{comments:increment(1)});
      setText("");
    } catch(e){}
    setPosting(false);
  };

  return (
    <div>
      {comments.map(c=>(
        <div key={c.id} style={{display:"flex",gap:10,marginBottom:10}}>
          <AnimatedAvatar avatar={c.avatar||{type:"symbol",value:"◆"}} zodiac={null} size={28} border={false} />
          <div className="glass" style={{borderRadius:10,padding:"9px 14px",flex:1}}>
            <span style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.white}}>{c.user} </span>
            <span style={{fontFamily:T.sans,fontSize:13,color:"#ccc"}}>{c.text}</span>
          </div>
        </div>
      ))}
      <div style={{display:"flex",gap:8,marginTop:10}}>
        {user&&<AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:"◆"}} zodiac={null} size={28} border={false} />}
        <div style={{flex:1,display:"flex",gap:8}}>
          <input value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}
            placeholder={user?"Reply… use @mention or #tag":"Sign in to comment"}
            disabled={!user}
            style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,
              borderRadius:22,padding:"9px 16px",color:T.white,fontFamily:T.sans,
              fontSize:13,outline:"none",transition:"border-color 0.2s"}}
            onFocus={e=>e.target.style.borderColor=T.gold}
            onBlur={e=>e.target.style.borderColor=T.border} />
          {user&&text.trim()&&(
            <button onClick={submit} disabled={posting}
              style={{background:T.gold,border:"none",borderRadius:22,
                padding:"9px 16px",color:"#08080e",fontFamily:T.sans,
                fontSize:12,fontWeight:700,cursor:"pointer",opacity:posting?0.6:1}}>
              {posting?"…":"Post"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, user, onLike, onSelectNFT, nftData, onAvatarTap, onMention, isAdmin, onPin, onBlock, onDelete }) {
  const [showComments,setShowComments] = useState(false);
  const [reposted,setReposted]         = useState(false);
  const [showAdminMenu,setAdminMenu]   = useState(false);
  const [mediaViewer,setMediaViewer]   = useState(null);
  const liking = useRef(false);

  const handleLike = useCallback(async ()=>{
    if(liking.current) return;
    liking.current = true;
    await onLike(post.id);
    setTimeout(()=>{liking.current=false;},400);
  },[onLike,post.id]);

  if(post.blocked) return (
    <div style={{borderBottom:`1px solid ${T.border}`,padding:"14px 0",marginBottom:14}}>
      <span style={{fontFamily:T.mono,fontSize:11,color:T.dim,fontStyle:"italic"}}>
        ◈ This post was removed by a moderator.
      </span>
    </div>
  );

  const allMedia = post.media?.filter(m=>m.type?.startsWith("image")||m.type?.startsWith("video"))||[];

  return (
    <div style={{borderBottom:`1px solid ${T.border}`,paddingBottom:20,marginBottom:20,
      animation:`fadeUp 0.3s ${T.smooth} both`}}>

      {mediaViewer&&(
        <MediaViewer mediaList={mediaViewer.list} startIndex={mediaViewer.index}
          onClose={()=>setMediaViewer(null)} />
      )}

      {post.pinned&&(
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
          <span style={{fontSize:12}}>📌</span>
          <span style={{fontFamily:T.mono,fontSize:9,color:T.gold,letterSpacing:2,textTransform:"uppercase"}}>Pinned</span>
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:11}}>
        <div style={{cursor:"pointer",flexShrink:0}} onClick={()=>onAvatarTap&&onAvatarTap(post)}>
          <AnimatedAvatar avatar={post.avatar} zodiac={post.zodiac} size={42} border />
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            <span style={{fontFamily:T.sans,fontSize:14,fontWeight:700,color:T.white,cursor:"pointer"}}
              onClick={()=>onAvatarTap&&onAvatarTap(post)}>{post.user}</span>
            {post.verified&&<span className="crown" style={{fontSize:12}}>👑</span>}
            {post.flagged&&<FlagBadge at={post.flaggedAt} />}
            {post.username&&(
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted,cursor:"pointer"}}
                onClick={()=>onMention&&onMention(post.username)}>@{post.username}</span>
            )}
            {post.action&&<span style={{fontFamily:T.sans,fontSize:13,color:T.muted}}>{post.action}</span>}
          </div>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:2}}>{post.time||"Just now"}</div>
        </div>
        {isAdmin&&(
          <div style={{position:"relative",flexShrink:0}}>
            <button onClick={()=>setAdminMenu(p=>!p)}
              style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,
                width:30,height:30,color:T.muted,fontSize:18,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>⋮</button>
            {showAdminMenu&&(
              <div className="glass-h" style={{position:"absolute",right:0,top:36,
                border:`1px solid ${T.border}`,borderRadius:10,zIndex:60,minWidth:140,
                overflow:"hidden",boxShadow:"0 16px 48px rgba(0,0,0,0.8)"}}>
                {[["📌 "+(post.pinned?"Unpin":"Pin"),()=>onPin(post.id),T.gold],
                  ["🚫 "+(post.blocked?"Unblock":"Block"),()=>onBlock(post.id),T.muted],
                  ["🗑️ Delete",()=>onDelete(post.id),T.red]
                ].map(([l,fn,col])=>(
                  <button key={l} onClick={()=>{fn();setAdminMenu(false);}}
                    style={{width:"100%",background:"none",border:"none",
                      borderBottom:`1px solid ${T.border}`,color:col,
                      padding:"11px 16px",textAlign:"left",fontFamily:T.sans,
                      fontSize:12,fontWeight:600,cursor:"pointer",transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}>{l}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text */}
      {(post.text||post.comment)&&(
        <p style={{fontFamily:T.sans,fontSize:15,color:"#e2dff2",lineHeight:1.78,
          marginBottom:12,marginLeft:54}}>
          <RichText text={post.text||post.comment} onMention={onMention}
            onHashtag={tag=>onMention&&onMention("#"+tag)} />
        </p>
      )}

      {/* Media grid */}
      {allMedia.length>0&&(
        <div style={{display:"grid",
          gridTemplateColumns:allMedia.length===1?"1fr":allMedia.length===2?"1fr 1fr":allMedia.length===3?"2fr 1fr":"1fr 1fr",
          gridTemplateRows:allMedia.length===3?"1fr 1fr":"auto",
          gap:3,marginBottom:12,marginLeft:54,borderRadius:12,overflow:"hidden",
          maxHeight:allMedia.length===1?420:320}}>
          {allMedia.slice(0,4).map((m,i)=>(
            <div key={i} onClick={()=>setMediaViewer({list:allMedia,index:i})}
              style={{cursor:"pointer",position:"relative",overflow:"hidden",
                gridRow:allMedia.length===3&&i===0?"span 2":"auto"}}>
              <img src={m.data||m.url} alt=""
                style={{width:"100%",height:"100%",objectFit:"cover",display:"block",
                  minHeight:allMedia.length===1?300:140,transition:"transform 0.25s ease"}}
                onMouseEnter={e=>e.target.style.transform="scale(1.02)"}
                onMouseLeave={e=>e.target.style.transform="scale(1)"} />
              {i===3&&allMedia.length>4&&(
                <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:T.font,fontSize:28,fontWeight:700,color:T.white}}>
                  +{allMedia.length-4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NFT embed */}
      {nftData&&(
        <div onClick={()=>onSelectNFT(nftData.nft,nftData.collection)}
          style={{margin:"0 0 12px 54px",border:`1px solid ${T.border}`,borderRadius:12,
            overflow:"hidden",cursor:"pointer",display:"flex",transition:"border-color 0.18s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <div style={{width:76,background:nftData.nft.bg,display:"flex",alignItems:"center",
            justifyContent:"center",fontFamily:T.font,fontSize:28,color:T.gold,flexShrink:0}}>
            {nftData.nft.image}
          </div>
          <div style={{padding:"12px 15px",flex:1,minWidth:0}}>
            <div style={{fontFamily:T.font,fontSize:14,fontWeight:700,color:T.white,
              marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {nftData.nft.name}
            </div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:3}}>{nftData.collection.creator}</div>
            <div style={{fontFamily:T.font,fontSize:14,color:T.gold}}>{nftData.nft.price} ETH · GHS {nftData.nft.momoPrice}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{display:"flex",gap:5,marginLeft:54,marginTop:6,alignItems:"center"}}>
        <button onClick={handleLike} onDoubleClick={handleLike}
          style={{display:"flex",alignItems:"center",gap:5,
            background:post.likedByMe?"rgba(224,70,70,0.14)":"rgba(255,255,255,0.03)",
            border:`1px solid ${post.likedByMe?"rgba(224,70,70,0.55)":"rgba(255,255,255,0.1)"}`,
            borderRadius:22,color:post.likedByMe?"#e06060":"#8884a8",
            fontFamily:T.sans,fontSize:12,fontWeight:700,cursor:"pointer",
            padding:"7px 14px",transition:`all 0.18s ${T.smooth}`}}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={post.likedByMe?"#e06060":"none"}
            stroke={post.likedByMe?"#e06060":"#8884a8"} strokeWidth="2.2" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span style={{minWidth:16}}>{post.likes||0}</span>
        </button>

        <button onClick={()=>setShowComments(p=>!p)}
          style={{display:"flex",alignItems:"center",gap:5,
            background:showComments?"rgba(201,169,110,0.1)":"rgba(255,255,255,0.03)",
            border:`1px solid ${showComments?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.1)"}`,
            borderRadius:22,color:showComments?T.gold:"#8884a8",
            fontFamily:T.sans,fontSize:12,fontWeight:700,cursor:"pointer",
            padding:"7px 14px",transition:`all 0.18s ${T.smooth}`}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{minWidth:16}}>{post.comments||0}</span>
        </button>

        <button onClick={()=>setReposted(p=>!p)}
          style={{display:"flex",alignItems:"center",gap:5,
            background:reposted?"rgba(100,190,140,0.1)":"rgba(255,255,255,0.03)",
            border:`1px solid ${reposted?"rgba(100,190,140,0.4)":"rgba(255,255,255,0.1)"}`,
            borderRadius:22,color:reposted?"#6aba8a":"#8884a8",
            fontFamily:T.sans,fontSize:12,fontWeight:700,cursor:"pointer",
            padding:"7px 14px",transition:`all 0.18s ${T.smooth}`}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          <span style={{minWidth:16}}>{(post.reposts||0)+(reposted?1:0)}</span>
        </button>
      </div>

      {/* Live Firestore comments */}
      {showComments&&(
        <div style={{marginLeft:54,marginTop:14}}>
          <CommentsSection postId={post.id} user={user} />
        </div>
      )}
    </div>
  );
}

// ── Post Composer ─────────────────────────────────────────────────────────────
const TAG_POOL = ["AfricanArt","NFT","PARADISE","Accra","Lagos","Kente","UpCycle","DigitalArt","Web3Africa","CreativeAfrica","Music","Fashion","Art","Ghana","Nigeria"];

export function PostComposer({ user, onPost, allUsernames=[] }) {
  const [text,setText]       = useState("");
  const [media,setMedia]     = useState([]);
  const [posting,setPosting] = useState(false);
  const [ac,setAC]           = useState({show:false,type:null,suggestions:[],pos:0});
  const taRef  = useRef();
  const fileRef = useRef();
  const MAX_FILES = user?.verified ? 9999 : 10;
  const MAX_CHARS = 1000;

  if(!user) return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:12,
      padding:"22px 20px",marginBottom:24,textAlign:"center"}}>
      <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:15}}>
        Sign in to share with the community.
      </p>
    </div>
  );

  const handleChange = e=>{
    const v=e.target.value;
    if(v.length>MAX_CHARS) return;
    setText(v);
    const pos=e.target.selectionStart;
    const before=v.slice(0,pos);
    const mM=before.match(/@([\w.]*)$/);
    const hM=before.match(/#(\w*)$/);
    if(mM){
      const q=mM[1].toLowerCase();
      setAC({show:true,type:"mention",pos,suggestions:allUsernames.filter(u=>u.toLowerCase().includes(q)).slice(0,6)});
    } else if(hM){
      const q=hM[1].toLowerCase();
      setAC({show:true,type:"hashtag",pos,suggestions:TAG_POOL.filter(t=>t.toLowerCase().includes(q)).slice(0,6)});
    } else {
      setAC(p=>({...p,show:false}));
    }
  };

  const handleSelect = s=>{
    const before=text.slice(0,ac.pos);
    const after=text.slice(ac.pos);
    const prefix=ac.type==="mention"?"@":"#";
    setText(before.replace(/([@#][\w.]*)$/,prefix+s+" ")+after);
    setAC(p=>({...p,show:false}));
    setTimeout(()=>taRef.current?.focus(),0);
  };

  const handleMedia = e=>{
    const files=Array.from(e.target.files).slice(0,MAX_FILES-media.length);
    files.forEach(f=>{
      const r=new FileReader();
      r.onload=ev=>setMedia(p=>[...p,{name:f.name,type:f.type,data:ev.target.result}]);
      r.readAsDataURL(f);
    });
  };

  const submit = ()=>{
    if(!text.trim()&&!media.length) return;
    setPosting(true);
    onPost({user:user.profile?.displayName||user.name,username:user.profile?.username||null,
      avatar:user.profile?.avatar||{type:"symbol",value:"◆"},zodiac:user.profile?.zodiac||null,
      text,media,uid:user.uid});
    setText("");setMedia([]);setPosting(false);
  };

  const rem=MAX_CHARS-text.length;
  const pct=(text.length/MAX_CHARS)*100;
  const cCol=rem<100?T.red:rem<200?T.gold:T.dim;

  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:12,
      padding:"18px 18px 14px",marginBottom:24}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <AnimatedAvatar avatar={user.profile?.avatar||{type:"symbol",value:"◆"}}
          zodiac={user.profile?.zodiac} size={40} border />
        <div style={{flex:1,position:"relative"}}>
          <textarea ref={taRef} value={text} onChange={handleChange}
            placeholder="Share something… @mention or #hashtag"
            rows={3}
            style={{width:"100%",background:"transparent",border:"none",outline:"none",
              color:T.white,fontFamily:T.sans,fontSize:15,lineHeight:1.7,resize:"none",paddingTop:2}} />
          {ac.show&&ac.suggestions.length>0&&(
            <Autocomplete suggestions={ac.suggestions} onSelect={handleSelect} type={ac.type} />
          )}
        </div>
      </div>

      {media.length>0&&(
        <div style={{display:"grid",
          gridTemplateColumns:media.length===1?"1fr":"1fr 1fr",
          gap:5,margin:"12px 0 0 52px",borderRadius:10,overflow:"hidden"}}>
          {media.map((m,i)=>(
            <div key={i} style={{position:"relative",borderRadius:8,overflow:"hidden"}}>
              {m.type.startsWith("image")
                ?<img src={m.data} alt="" style={{width:"100%",height:media.length===1?280:140,objectFit:"cover",display:"block"}} />
                :<div style={{height:60,background:T.dim,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:11,color:T.muted,padding:"0 8px"}}>{m.name}</div>
              }
              <button onClick={()=>setMedia(p=>p.filter((_,j)=>j!==i))}
                style={{position:"absolute",top:6,right:6,width:26,height:26,borderRadius:"50%",
                  background:"rgba(0,0,0,0.8)",border:"none",color:T.white,fontSize:15,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
          ))}
        </div>
      )}

      <Divider style={{margin:"13px 0 11px"}} />

      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <button onClick={()=>fileRef.current.click()}
          style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:8,padding:"6px 11px",color:T.muted,fontSize:16,
            cursor:"pointer",transition:`all 0.18s ${T.smooth}`,
            display:"flex",alignItems:"center",gap:5}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          {media.length>0&&<span style={{fontFamily:T.mono,fontSize:10,color:T.gold}}>{media.length}</span>}
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple
          style={{display:"none"}} onChange={handleMedia} />

        <button onClick={()=>{setText(t=>t+" #");taRef.current?.focus();}}
          style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:8,padding:"5px 11px",color:T.gold,fontFamily:T.mono,
            fontSize:13,fontWeight:700,cursor:"pointer"}}>#</button>

        <button onClick={()=>{setText(t=>t+" @");taRef.current?.focus();}}
          style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:8,padding:"5px 11px",color:"#8ec4a8",fontFamily:T.mono,
            fontSize:13,fontWeight:700,cursor:"pointer"}}>@</button>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          {text.length>MAX_CHARS*0.8&&(
            <div style={{position:"relative",width:28,height:28,flexShrink:0}}>
              <svg width="28" height="28" style={{transform:"rotate(-90deg)"}}>
                <circle cx="14" cy="14" r="11" fill="none" stroke={T.dim} strokeWidth="2"/>
                <circle cx="14" cy="14" r="11" fill="none" stroke={cCol} strokeWidth="2"
                  strokeDasharray={`${2*Math.PI*11}`}
                  strokeDashoffset={`${2*Math.PI*11*(1-pct/100)}`}
                  strokeLinecap="round" style={{transition:"all 0.2s"}}/>
              </svg>
              {rem<100&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
                justifyContent:"center",fontFamily:T.mono,fontSize:8,color:cCol}}>{rem}</span>}
            </div>
          )}
          <button onClick={submit}
            disabled={posting||(!text.trim()&&!media.length)}
            style={{background:T.gold,border:"none",borderRadius:22,
              padding:"9px 22px",color:"#08080e",fontFamily:T.sans,
              fontSize:12,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",
              cursor:posting||(!text.trim()&&!media.length)?"not-allowed":"pointer",
              opacity:posting||(!text.trim()&&!media.length)?0.45:1,
              transition:`all 0.18s ${T.smooth}`,boxShadow:`0 0 20px ${T.gold}33`}}>
            {posting?"…":"Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pull-to-refresh ───────────────────────────────────────────────────────────
function PullToRefresh({ onRefresh, children }) {
  const startY = useRef(null);
  const [pulling,setPulling] = useState(0);
  const [refreshing,setRefreshing] = useState(false);
  const ref = useRef();
  const THRESH = 72;

  return (
    <div ref={ref}
      onTouchStart={e=>{if(ref.current?.scrollTop===0)startY.current=e.touches[0].clientY;}}
      onTouchMove={e=>{
        if(startY.current===null||refreshing)return;
        const dy=e.touches[0].clientY-startY.current;
        if(dy>0)setPulling(Math.min(dy*0.5,THRESH+20));
      }}
      onTouchEnd={async()=>{
        if(pulling>=THRESH&&!refreshing){
          setRefreshing(true);setPulling(0);
          try{await onRefresh();}catch(e){}
          setTimeout(()=>setRefreshing(false),800);
        } else setPulling(0);
        startY.current=null;
      }}
      style={{position:"relative"}}>
      {(pulling>10||refreshing)&&(
        <div style={{display:"flex",justifyContent:"center",padding:12,
          marginBottom:refreshing?4:-36,transition:"margin 0.2s",
          opacity:Math.min(pulling/THRESH,1)}}>
          <div style={{width:26,height:26,borderRadius:"50%",
            border:`2px solid ${T.gold}`,borderTopColor:"transparent",
            animation:refreshing?"spin 0.8s linear infinite":"none",
            transform:!refreshing?`rotate(${pulling*4}deg)`:"none"}} />
        </div>
      )}
      {children}
    </div>
  );
}

// ── Feed Page ─────────────────────────────────────────────────────────────────
export default function SocialFeedPage({ user, collections, onSelectNFT, posts, onPost, onLike, onRefresh, isAdmin, onPin, onBlockPost, onDeletePost }) {
  const [filter,setFilter]          = useState("all");
  const [openStory,setOpenStory]    = useState(null);
  const [previewProfile,setPreview] = useState(null);
  const [activeTag,setActiveTag]    = useState(null);

  const allUsernames = [...new Set(posts.map(p=>p.username).filter(Boolean))];

  const getNFT = post=>{
    if(!post.collectionId||!post.nftId) return null;
    const col=collections.find(c=>c.id===post.collectionId);
    const nft=col?.nfts?.find(n=>n.id===post.nftId);
    return nft&&col?{nft,collection:col}:null;
  };

  const filtered=posts.filter(p=>{
    if(p.blocked) return false;
    if(activeTag) return (p.text||p.comment||"").toLowerCase().includes("#"+activeTag.toLowerCase());
    if(filter==="nfts") return !!p.collectionId;
    return true;
  });

  const handleAvatarTap=post=>setPreview({
    displayName:post.user,username:post.username,
    avatar:post.avatar,zodiac:post.zodiac,
    bio:null,coverColor:"#12100a",banner:null,verified:post.verified,
  });

  const handleMention=val=>{
    if(val.startsWith("#")){setActiveTag(val.slice(1));return;}
    setPreview({displayName:val,username:val,avatar:{type:"symbol",value:"◆"},zodiac:null});
  };

  return (
    <div style={{maxWidth:640,margin:"0 auto",padding:"0 clamp(12px,4vw,20px)"}}>
      {openStory&&<StoryModal collection={openStory} onClose={()=>setOpenStory(null)} />}
      {previewProfile&&<ProfilePreviewModal profile={previewProfile} onClose={()=>setPreview(null)} />}

      {/* Creator story bubbles */}
      {collections.length>0&&(
        <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:16,
          marginBottom:4,scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          <style>{`::-webkit-scrollbar{display:none}`}</style>
          {collections.map(c=>(
            <div key={c.id} onClick={()=>setOpenStory(c)}
              style={{flexShrink:0,textAlign:"center",cursor:"pointer",paddingTop:4}}>
              <div style={{width:62,height:62,minWidth:62,borderRadius:"50%",
                border:`2.5px solid ${c.accent}`,background:`${c.accent}11`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:T.font,fontSize:25,color:c.accent,marginBottom:6,
                boxShadow:`0 0 18px 0 ${c.accent}33`,transition:"box-shadow 0.25s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 28px 6px ${c.accent}55`}
                onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 0 18px 0 ${c.accent}33`}>
                {c.avatar}
              </div>
              <div style={{fontFamily:T.sans,fontSize:10,fontWeight:600,color:"#b0accc",
                letterSpacing:0.5,maxWidth:62,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {c.creator?.split(" ")[0]||c.name}
              </div>
            </div>
          ))}
        </div>
      )}
      {collections.length>0&&<Divider style={{marginBottom:20}} />}

      <PostComposer user={user} onPost={onPost} allUsernames={allUsernames} />

      {/* Hashtag active filter */}
      {activeTag&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",marginBottom:8}}>
          <span style={{fontFamily:T.mono,fontSize:12,color:T.gold,fontWeight:700}}>#{activeTag}</span>
          <button onClick={()=>setActiveTag(null)} style={{background:"rgba(255,255,255,0.06)",
            border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 10px",
            color:T.muted,fontFamily:T.mono,fontSize:11,cursor:"pointer"}}>✕ Clear</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:22}}>
        {[["all","All"],["nfts","NFT Posts"],["following","Following"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setFilter(k);setActiveTag(null);}}
            style={{background:"none",border:"none",
              borderBottom:filter===k&&!activeTag?`2px solid ${T.gold}`:"2px solid transparent",
              color:filter===k&&!activeTag?T.gold:"#888",fontFamily:T.mono,fontSize:11,
              fontWeight:filter===k&&!activeTag?700:400,letterSpacing:2,textTransform:"uppercase",
              padding:"0 0 11px",marginRight:22,marginBottom:-1,cursor:"pointer",
              transition:"all 0.18s"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Pull to refresh */}
      <PullToRefresh onRefresh={onRefresh||(()=>Promise.resolve())}>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",fontFamily:T.font,
            fontStyle:"italic",color:T.muted,fontSize:17}}>
            {activeTag?`No posts with #${activeTag}`:
             filter==="following"?"Follow creators to see their posts.":
             "No posts yet. Be the first to share."}
          </div>
        ):(
          filtered.map(p=>(
            <PostCard key={p.id} post={p} user={user} onLike={onLike}
              onSelectNFT={onSelectNFT} nftData={getNFT(p)}
              onAvatarTap={handleAvatarTap} onMention={handleMention}
              isAdmin={isAdmin} onPin={onPin} onBlock={onBlockPost} onDelete={onDeletePost} />
          ))
        )}
      </PullToRefresh>
    </div>
  );
}
