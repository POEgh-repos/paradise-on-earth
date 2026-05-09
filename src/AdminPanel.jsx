import { useState, useRef } from "react";
import { T, Btn, Divider, Field, Input, Textarea, Select, Toast, AnimatedAvatar } from "./tokens";

// ── Verified Creator Selector ─────────────────────────────────────────────────
function CreatorSelector({ value, onChange, verifiedUsers, posts }) {
  const [open,setOpen] = useState(false);
  const [custom,setCustom] = useState(false);

  // Build list of verified users from posts
  const verifiedList = [...new Set(
    posts.filter(p=>p.username&&p.verified).map(p=>({name:p.user,username:p.username,avatar:p.avatar,zodiac:p.zodiac}))
  )].reduce((acc,u)=>{ if(!acc.find(x=>x.username===u.username))acc.push(u); return acc; },[]);

  if (custom) return (
    <div style={{display:"flex",gap:8}}>
      <Input value={value} onChange={e=>onChange(e.target.value)} placeholder="Creator full name" style={{flex:1}} />
      <Btn variant="ghost" size="sm" onClick={()=>setCustom(false)}>← List</Btn>
    </div>
  );

  return (
    <div style={{position:"relative"}}>
      <div onClick={()=>setOpen(p=>!p)} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${open?T.gold:T.border}`,borderRadius:4,padding:"11px 14px",color:value?T.white:T.muted,fontFamily:T.sans,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none"}}>
        <span>{value||"Select verified creator…"}</span>
        <span style={{color:T.muted,fontSize:12}}>{open?"▲":"▼"}</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"rgba(14,13,24,0.99)",border:`1px solid ${T.border}`,borderRadius:6,zIndex:300,overflow:"hidden",boxShadow:"0 16px 40px rgba(0,0,0,0.85)",maxHeight:260,overflowY:"auto"}}>
          {verifiedList.length===0&&(
            <div style={{padding:"14px 16px",fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:13}}>No verified users yet. Verify users in Moderation tab.</div>
          )}
          {verifiedList.map(u=>(
            <div key={u.username} onMouseDown={e=>{e.preventDefault();onChange(u.name);setOpen(false);}}
              style={{padding:"10px 16px",cursor:"pointer",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12,transition:`background 0.15s`}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <AnimatedAvatar avatar={u.avatar} zodiac={u.zodiac} size={32} border />
              <div>
                <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white}}>{u.name}</div>
                <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>@{u.username} · ✓ Verified</div>
              </div>
            </div>
          ))}
          <div onMouseDown={e=>{e.preventDefault();setOpen(false);setCustom(true);}}
            style={{padding:"10px 16px",cursor:"pointer",borderTop:`1px solid ${T.gold}22`,fontFamily:T.mono,fontSize:11,color:T.gold,display:"flex",alignItems:"center",gap:8,transition:`background 0.15s`}}
            onMouseEnter={e=>e.currentTarget.style.background=T.goldSoft}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            + Enter name manually
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Role Input ─────────────────────────────────────────────────────────
const DEFAULT_ROLES = ["Musician","Fashion Designer","Up-cycler","Visual Artist","Photographer","Poet","Dancer","Writer","Filmmaker","Sculptor"];

function RoleSelector({ value, onChange }) {
  const [custom,setCustom] = useState(!DEFAULT_ROLES.includes(value)&&!!value);
  const [customVal,setCustomVal] = useState(!DEFAULT_ROLES.includes(value)?value:"");

  if (custom) return (
    <div style={{display:"flex",gap:8}}>
      <Input value={customVal} onChange={e=>{setCustomVal(e.target.value);onChange(e.target.value);}} placeholder="Enter custom role…" style={{flex:1}} />
      <Btn variant="ghost" size="sm" onClick={()=>{setCustom(false);onChange("Musician");}}>← List</Btn>
    </div>
  );

  return (
    <div style={{display:"flex",gap:8}}>
      <Select value={DEFAULT_ROLES.includes(value)?value:"Musician"} onChange={e=>onChange(e.target.value)} style={{flex:1}}>
        {DEFAULT_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
      </Select>
      <Btn variant="ghost" size="sm" onClick={()=>{setCustom(true);setCustomVal("");}}>+ New</Btn>
    </div>
  );
}

// ── NFT Editor ────────────────────────────────────────────────────────────────
function NFTEditor({ nft, onSave, onCancel, verifiedUsers, posts }) {
  const fileRef=useRef(), mediaRef=useRef();
  const [form,setForm]=useState(nft||{id:Date.now(),name:"",price:"",momoPrice:"",rarity:"Common",image:"◈",bg:"linear-gradient(160deg,#0d0b07,#1a1408,#2a1f0a)",likes:0,description:"",story:"",traits:[{k:"",v:""}],perks:[""],content:null,media:null,openSeaUrl:""});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const setTrait=(i,s,v)=>{const t=[...form.traits];t[i]={...t[i],[s]:v};set("traits",t);};
  const setPerk=(i,v)=>{const p=[...form.perks];p[i]=v;set("perks",p);};
  const loadFile=(e,key)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>set(key,{name:f.name,type:f.type,data:ev.target.result});r.readAsDataURL(f);};
  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"clamp(16px,4vw,26px)",marginBottom:18}}>
      <h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:18}}>{nft?"Edit NFT":"Add New NFT"}</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16}}>
        <div>
          <Field label="NFT Name"><Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Rhythm of Accra — I" /></Field>
          <Field label="OpenSea URL" hint="Paste OpenSea asset URL to sync."><Input value={form.openSeaUrl||""} onChange={e=>set("openSeaUrl",e.target.value)} placeholder="https://opensea.io/assets/…" /></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Field label="ETH Price"><Input value={form.price} onChange={e=>set("price",e.target.value)} placeholder="0.8" /></Field>
            <Field label="MoMo (GHS)"><Input value={form.momoPrice} onChange={e=>set("momoPrice",e.target.value)} placeholder="1,200" /></Field>
          </div>
          <Field label="Rarity"><Select value={form.rarity} onChange={e=>set("rarity",e.target.value)}>{["Common","Rare","Epic","Legendary"].map(r=><option key={r} value={r}>{r}</option>)}</Select></Field>
          <Field label="Symbol"><Input value={form.image} onChange={e=>set("image",e.target.value)} placeholder="◈" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20}} /></Field>
        </div>
        <div>
          <Field label="Description"><Textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Short description…" rows={3} /></Field>
          <Field label="Artist Story"><Textarea value={form.story} onChange={e=>set("story",e.target.value)} placeholder="The story behind this piece…" rows={3} /></Field>
          <Field label="Background Gradient">
            <Input value={form.bg} onChange={e=>set("bg",e.target.value)} placeholder="linear-gradient(…)" />
            <div style={{marginTop:5,height:24,borderRadius:4,background:form.bg}} />
          </Field>
        </div>
      </div>
      <Divider style={{margin:"16px 0"}} />
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:20}}>
        <div>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Traits</div>
          {form.traits.map((tr,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:5,marginBottom:5}}>
              <Input value={tr.k} onChange={e=>setTrait(i,"k",e.target.value)} placeholder="Trait" />
              <Input value={tr.v} onChange={e=>setTrait(i,"v",e.target.value)} placeholder="Value" />
              <button onClick={()=>set("traits",form.traits.filter((_,j)=>j!==i))} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"0 8px",color:T.muted,fontSize:14,cursor:"pointer"}}>×</button>
            </div>
          ))}
          <Btn variant="ghost" size="sm" onClick={()=>set("traits",[...form.traits,{k:"",v:""}])} style={{marginTop:3}}>+ Trait</Btn>
        </div>
        <div>
          <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Perks & Privileges</div>
          {form.perks.map((p,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:5,marginBottom:5}}>
              <Input value={p} onChange={e=>setPerk(i,e.target.value)} placeholder="🎧 Perk description" />
              <button onClick={()=>set("perks",form.perks.filter((_,j)=>j!==i))} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"0 8px",color:T.muted,fontSize:14,cursor:"pointer"}}>×</button>
            </div>
          ))}
          <Btn variant="ghost" size="sm" onClick={()=>set("perks",[...form.perks,""])} style={{marginTop:3}}>+ Perk</Btn>
        </div>
      </div>
      <Divider style={{margin:"16px 0"}} />
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
        <Field label="Unlock Content" hint="File unlocked for holders after purchase.">
          <div onClick={()=>fileRef.current.click()} style={{border:`1px dashed ${T.border}`,borderRadius:4,padding:"16px 14px",textAlign:"center",cursor:"pointer",transition:"border-color 0.18s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            {form.content?<div><div style={{fontFamily:T.mono,fontSize:11,color:T.green,marginBottom:2}}>✓ {form.content.name}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>Click to replace</div></div>:<div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:T.dim,marginBottom:5}}>◎</div><div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>Audio · Video · Image · Doc</div></div>}
          </div>
          <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>loadFile(e,"content")} />
        </Field>
        <Field label="Collection Media" hint="Image/video shown in gallery.">
          <div onClick={()=>mediaRef.current.click()} style={{border:`1px dashed ${T.border}`,borderRadius:4,padding:"16px 14px",textAlign:"center",cursor:"pointer",transition:"border-color 0.18s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            {form.media?<div>{form.media.type?.startsWith("image")&&<img src={form.media.data} alt="" style={{width:"100%",height:52,objectFit:"cover",borderRadius:3,marginBottom:4}} />}<div style={{fontFamily:T.mono,fontSize:11,color:T.green}}>✓ {form.media.name}</div></div>:<div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:T.dim,marginBottom:5}}>◈</div><div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>Upload media</div></div>}
          </div>
          <input ref={mediaRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={e=>loadFile(e,"media")} />
        </Field>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:6}}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={()=>onSave(form)}>Save NFT</Btn>
      </div>
    </div>
  );
}

// ── Collection Editor ─────────────────────────────────────────────────────────
function CollectionEditor({ collection, onSave, onCancel, verifiedUsers, posts }) {
  const mediaRef=useRef();
  const [form,setForm]=useState(collection||{id:Date.now(),name:"",creator:"",role:"Musician",avatar:"◈",accent:"#c9a96e",description:"",followers:"0",totalPieces:0,nfts:[],events:[],openSeaCollection:"",media:null});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const loadMedia=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>set("media",{name:f.name,type:f.type,data:ev.target.result});r.readAsDataURL(f);};
  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"clamp(16px,4vw,26px)",marginBottom:18}}>
      <h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:18}}>{collection?"Edit Collection":"New Collection"}</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16}}>
        <div>
          <Field label="Collection Name"><Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ancestral Frequencies" /></Field>
          <Field label="Creator" hint="Select a verified account or enter manually.">
            <CreatorSelector value={form.creator} onChange={v=>set("creator",v)} verifiedUsers={verifiedUsers} posts={posts} />
          </Field>
          <Field label="Creator Role">
            <RoleSelector value={form.role} onChange={v=>set("role",v)} />
          </Field>
          <Field label="OpenSea Slug" hint="opensea.io/collection/SLUG"><Input value={form.openSeaCollection||""} onChange={e=>set("openSeaCollection",e.target.value)} placeholder="my-collection-slug" /></Field>
        </div>
        <div>
          <Field label="Description"><Textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What is this collection about?" rows={4} /></Field>
          <Field label="Avatar Symbol"><Input value={form.avatar} onChange={e=>set("avatar",e.target.value)} placeholder="◈" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20}} /></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Field label="Accent Colour"><Input value={form.accent} onChange={e=>set("accent",e.target.value)} placeholder="#c9a96e" /></Field>
            <Field label="Preview"><div style={{height:38,borderRadius:4,border:`2px solid ${form.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:form.accent}}>{form.avatar}</div></Field>
          </div>
          <Field label="Cover Media">
            <div onClick={()=>mediaRef.current.click()} style={{border:`1px dashed ${T.border}`,borderRadius:4,padding:"14px",textAlign:"center",cursor:"pointer",transition:"border-color 0.18s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              {form.media?<div>{form.media.type?.startsWith("image")&&<img src={form.media.data} alt="" style={{width:"100%",height:50,objectFit:"cover",borderRadius:3,marginBottom:3}} />}<div style={{fontFamily:T.mono,fontSize:11,color:T.green}}>✓ {form.media.name}</div></div>:<div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>Upload cover image/video</div>}
            </div>
            <input ref={mediaRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={loadMedia} />
          </Field>
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:6}}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={()=>onSave(form)}>Save Collection</Btn>
      </div>
    </div>
  );
}

// ── Event Editor ──────────────────────────────────────────────────────────────
function EventEditor({ event, onSave, onCancel }) {
  const [form,setForm]=useState(event||{id:Date.now(),title:"",date:"",location:"",desc:""});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:20,marginBottom:12}}>
      <h4 style={{fontFamily:T.font,fontSize:16,fontWeight:700,color:T.white,marginBottom:14}}>{event?"Edit Event":"Add Event"}</h4>
      <Field label="Title"><Input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Live Recording Session" /></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Field label="Date"><Input type="date" value={form.date} onChange={e=>set("date",e.target.value)} /></Field>
        <Field label="Location"><Input value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Accra, Ghana" /></Field>
      </div>
      <Field label="Description"><Textarea value={form.desc} onChange={e=>set("desc",e.target.value)} placeholder="What happens here?" rows={2} /></Field>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={()=>onSave(form)}>Save Event</Btn>
      </div>
    </div>
  );
}

// ── Moderation Tab ────────────────────────────────────────────────────────────
function ModerationTab({ posts, onBlockPost, onFlagUser, onVerify, onPin, onDeletePost, onWarn, flaggedUsers, verifiedUsers, blockedPosts }) {
  const [userSearch,setUserSearch]=useState("");
  const [postFilter,setPostFilter]=useState("all");
  const [warnTarget,setWarnTarget]=useState(null);
  const [warnMsg,setWarnMsg]=useState("");
  const allUsers=[...new Map(posts.filter(p=>p.username).map(p=>[p.username,{username:p.username,user:p.user,avatar:p.avatar,zodiac:p.zodiac}])).values()];
  const filteredUsers=allUsers.filter(u=>!userSearch||u.user.toLowerCase().includes(userSearch.toLowerCase())||u.username.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredPosts=posts.filter(p=>postFilter==="all"?true:postFilter==="pinned"?p.pinned:postFilter==="blocked"?p.blocked:p.flagged);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:22}}>
        {[["Total Posts",posts.length,"201,169,110"],["Pinned",posts.filter(p=>p.pinned).length,"106,170,136"],["Flagged Users",Object.keys(flaggedUsers).length,"224,160,48"],["Blocked",blockedPosts.size,"196,106,106"]].map(([l,v,rgb])=>(
          <div key={l} style={{background:`rgba(${rgb},0.08)`,border:`1px solid rgba(${rgb},0.2)`,borderRadius:6,padding:"11px 14px",textAlign:"center"}}>
            <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:1,marginBottom:4,textTransform:"uppercase"}}>{l}</div>
            <div style={{fontFamily:T.font,fontSize:22,color:T.white,fontWeight:700}}>{v}</div>
          </div>
        ))}
      </div>
      <h3 style={{fontFamily:T.font,fontSize:17,fontWeight:700,color:T.white,marginBottom:10}}>User Management</h3>
      <div style={{marginBottom:11}}><Input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search users…" style={{maxWidth:320}} /></div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:22}}>
        {filteredUsers.length===0&&<div style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,padding:"14px 0"}}>No users found.</div>}
        {filteredUsers.map(u=>(
          <div key={u.username} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <AnimatedAvatar avatar={u.avatar} zodiac={u.zodiac} size={32} border />
            <div style={{flex:1,minWidth:90}}>
              <div style={{fontFamily:T.sans,fontSize:12,color:T.white,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                {u.user}{verifiedUsers[u.username]&&<span style={{fontSize:10}}>👑</span>}{flaggedUsers[u.username]&&<sup><span style={{fontSize:9,color:T.flag}}>❓❓❓</span></sup>}
              </div>
              <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>@{u.username}{flaggedUsers[u.username]&&<span style={{color:T.flag,marginLeft:6}}>Flagged {flaggedUsers[u.username].at}</span>}</div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <Btn variant="verify" size="sm" onClick={()=>onVerify(u.username)}>{verifiedUsers[u.username]?"Unverify":"Verify ✓"}</Btn>
              <Btn variant="flag"   size="sm" onClick={()=>onFlagUser(u.username)}>{flaggedUsers[u.username]?"Unflag":"Flag ❓"}</Btn>
              <Btn variant="danger" size="sm" onClick={()=>{setWarnTarget(u.username);setWarnMsg("");}}>Warn</Btn>
            </div>
          </div>
        ))}
      </div>
      {warnTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(12px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div className="glass-h" style={{maxWidth:400,width:"100%",border:`1px solid ${T.border}`,borderRadius:8,padding:26}}>
            <h3 style={{fontFamily:T.font,fontSize:18,color:T.white,marginBottom:12}}>Warn @{warnTarget}</h3>
            <Textarea value={warnMsg} onChange={e=>setWarnMsg(e.target.value)} placeholder="Reason for warning…" rows={3} />
            <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}>
              <Btn variant="ghost" onClick={()=>setWarnTarget(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={()=>{onWarn(warnTarget,warnMsg);setWarnTarget(null);}}>Send Warning</Btn>
            </div>
          </div>
        </div>
      )}
      <h3 style={{fontFamily:T.font,fontSize:17,fontWeight:700,color:T.white,marginBottom:10}}>Post Moderation</h3>
      <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
        {[["all","All"],["pinned","Pinned"],["flagged","Flagged"],["blocked","Blocked"]].map(([k,l])=>(
          <Btn key={k} variant={postFilter===k?"gold":"ghost"} size="sm" onClick={()=>setPostFilter(k)}>{l}</Btn>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filteredPosts.length===0&&<div style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,padding:"14px 0"}}>No posts.</div>}
        {filteredPosts.map(post=>(
          <div key={post.id} className="glass" style={{border:`1px solid ${post.pinned?T.gold:post.blocked?T.red:T.border}`,borderRadius:6,padding:"12px 14px",position:"relative"}}>
            {post.pinned&&<div style={{position:"absolute",top:-1,left:12,background:T.gold,color:"#08080e",fontFamily:T.mono,fontSize:9,letterSpacing:1,padding:"1px 8px",borderRadius:"0 0 3px 3px",fontWeight:700}}>PINNED</div>}
            {post.blocked&&<div style={{position:"absolute",top:-1,right:12,background:T.red,color:"#fff",fontFamily:T.mono,fontSize:9,letterSpacing:1,padding:"1px 8px",borderRadius:"0 0 3px 3px",fontWeight:700}}>BLOCKED</div>}
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:post.pinned||post.blocked?7:0}}>
              <AnimatedAvatar avatar={post.avatar} zodiac={post.zodiac} size={30} border />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.white,marginBottom:1}}>{post.user} <span style={{color:T.muted,fontWeight:400}}>@{post.username}</span>{post.verified&&<span style={{marginLeft:3,fontSize:10}}>👑</span>}{post.flagged&&<sup><span style={{fontSize:9,color:T.flag}}>❓❓❓</span></sup>}</div>
                <p style={{fontFamily:T.sans,fontSize:12,color:post.blocked?"#555":T.muted,lineHeight:1.5,fontStyle:post.blocked?"italic":"normal",wordBreak:"break-word"}}>{post.blocked?"[Hidden by admin]":post.comment||post.text||""}</p>
                <div style={{fontFamily:T.mono,fontSize:9,color:T.dim,marginTop:4}}>{post.time} · ♡{post.likes} · ◎{post.comments} · ↗{post.reposts}</div>
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0,flexWrap:"wrap"}}>
                <Btn variant="pin"    size="sm" onClick={()=>onPin(post.id)}>{post.pinned?"Unpin":"Pin 📌"}</Btn>
                <Btn variant="block"  size="sm" onClick={()=>onBlockPost(post.id)}>{post.blocked?"Unblock":"Block"}</Btn>
                <Btn variant="danger" size="sm" onClick={()=>{if(window.confirm("Delete post?"))onDeletePost(post.id);}}>Del</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
export default function AdminPanel({ collections, setCollections, posts, onBlockPost, onFlagUser, onVerify, onPin, onDeletePost, onWarn, flaggedUsers, verifiedUsers, blockedPosts }) {
  const [tab,setTab]=useState("collections");
  const [editingColl,setEditingColl]=useState(null);
  const [addingColl,setAddingColl]=useState(false);
  const [selColl,setSelColl]=useState(collections[0]?.id);
  const [editingNFT,setEditingNFT]=useState(null);
  const [addingNFT,setAddingNFT]=useState(false);
  const [editingEvent,setEditingEvent]=useState(null);
  const [addingEvent,setAddingEvent]=useState(false);
  const [openSeaSlug,setOpenSeaSlug]=useState("");
  const [fetching,setFetching]=useState(false);
  const [toast,setToast]=useState(null);
  const [collSearch,setCollSearch]=useState("");
  const [collFilter,setCollFilter]=useState("All");

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};
  const saveColl=form=>{if(editingColl){setCollections(p=>p.map(c=>c.id===form.id?{...c,...form}:c));}else{setCollections(p=>[...p,{...form,nfts:[],events:[]}]);}setEditingColl(null);setAddingColl(false);showToast("Collection saved ✓");};
  const deleteColl=id=>{if(!window.confirm("Delete?"))return;setCollections(p=>p.filter(c=>c.id!==id));showToast("Deleted");};
  const saveNFT=form=>{setCollections(p=>p.map(c=>{if(c.id!==selColl)return c;const ex=c.nfts.find(n=>n.id===form.id);return{...c,nfts:ex?c.nfts.map(n=>n.id===form.id?form:n):[...c.nfts,form]};}));setEditingNFT(null);setAddingNFT(false);showToast("NFT saved ✓");};
  const deleteNFT=id=>{if(!window.confirm("Delete?"))return;setCollections(p=>p.map(c=>c.id===selColl?{...c,nfts:c.nfts.filter(n=>n.id!==id)}:c));showToast("Deleted");};
  const saveEvent=form=>{setCollections(p=>p.map(c=>{if(c.id!==selColl)return c;const ex=c.events.find(e=>e.id===form.id);return{...c,events:ex?c.events.map(e=>e.id===form.id?form:e):[...c.events,form]};}));setEditingEvent(null);setAddingEvent(false);showToast("Event saved ✓");};
  const deleteEv=id=>{setCollections(p=>p.map(c=>c.id===selColl?{...c,events:c.events.filter(e=>e.id!==id)}:c));showToast("Deleted");};
  const fetchOSea=()=>{if(!openSeaSlug.trim())return;setFetching(true);setTimeout(()=>{showToast(`Fetched "${openSeaSlug}" (demo — add real API key)`);setFetching(false);setOpenSeaSlug("");},1400);};

  const activeColl=collections.find(c=>c.id===selColl);
  const roles=[...new Set(collections.map(c=>c.role))];
  const filteredColls=collections.filter(c=>(collFilter==="All"||c.role===collFilter)&&(!collSearch||c.name.toLowerCase().includes(collSearch.toLowerCase())||c.creator.toLowerCase().includes(collSearch.toLowerCase())));
  const TABS=[["collections","Collections"],["nfts","NFTs"],["events","Events"],["mod","🛡 Moderation"],["opensea","OpenSea"]];

  return (
    <div style={{maxWidth:1060,margin:"0 auto",padding:"0 clamp(12px,4vw,24px)",zIndex:1,position:"relative"}}>
      <Toast msg={toast?.msg} type={toast?.type} />
      <div style={{padding:"28px 0 18px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(20px,4vw,28px)",fontWeight:700,color:T.white}}>Admin Panel</h1>
          <p style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginTop:3,letterSpacing:1}}>PARADISE on Earth · <span style={{color:T.gold}}>GOD🤎</span> @humble_servant</p>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["◈ "+collections.length+" Collections","201,169,110"],["◉ "+collections.reduce((a,c)=>a+c.nfts.length,0)+" NFTs","106,170,136"],["🚩 "+Object.keys(flaggedUsers).length+" Flagged","224,160,48"]].map(([l,rgb])=>(
            <div key={l} style={{border:`1px solid rgba(${rgb},0.22)`,background:`rgba(${rgb},0.07)`,borderRadius:4,padding:"6px 12px",fontFamily:T.mono,fontSize:10,color:T.white}}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:0,marginBottom:22,borderBottom:`1px solid ${T.border}`,overflowX:"auto"}}>
        {TABS.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",borderBottom:tab===k?`2px solid ${T.gold}`:"2px solid transparent",color:tab===k?T.gold:"#a0a0bc",fontFamily:T.mono,fontSize:11,letterSpacing:k==="mod"?0:1,textTransform:k==="mod"?"none":"uppercase",padding:"0 0 12px",marginRight:16,marginBottom:-1,transition:"all 0.18s",cursor:"pointer",fontWeight:tab===k?700:400,whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>

      {tab==="collections"&&(
        <div>
          {addingColl&&<CollectionEditor onSave={saveColl} onCancel={()=>setAddingColl(false)} verifiedUsers={verifiedUsers} posts={posts} />}
          {editingColl&&<CollectionEditor collection={editingColl} onSave={saveColl} onCancel={()=>setEditingColl(null)} verifiedUsers={verifiedUsers} posts={posts} />}
          {!addingColl&&!editingColl&&(<>
            <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              <Input value={collSearch} onChange={e=>setCollSearch(e.target.value)} placeholder="Search collections…" style={{flex:1,minWidth:130}} />
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["All",...roles].map(r=><Btn key={r} variant={collFilter===r?"gold":"ghost"} size="sm" onClick={()=>setCollFilter(r)}>{r}</Btn>)}</div>
              <Btn onClick={()=>{setAddingColl(true);setEditingColl(null);}}>+ New</Btn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,260px),1fr))",gap:10}}>
              {filteredColls.map(c=>(
                <div key={c.id} className="glass" style={{border:`1px solid ${c.accent}22`,borderRadius:8,padding:"clamp(12px,3vw,18px)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    {c.media?.data?<img src={c.media.data} alt="" style={{width:36,height:36,borderRadius:4,objectFit:"cover",border:`1px solid ${c.accent}44`}} />
                      :<div style={{width:36,height:36,borderRadius:"50%",border:`1px solid ${c.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:c.accent}}>{c.avatar}</div>}
                    <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:700,color:T.white}}>{c.name}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{c.creator} · {c.role}</div></div>
                  </div>
                  <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginBottom:10}}>{c.nfts.length} NFTs · {c.events.length} events</div>
                  <div style={{display:"flex",gap:5}}>
                    <Btn variant="ghost" size="sm" style={{flex:1}} onClick={()=>{setEditingColl(c);setAddingColl(false);}}>Edit</Btn>
                    <Btn variant="admin" size="sm" style={{flex:2}} onClick={()=>{setSelColl(c.id);setTab("nfts");}}>Manage NFTs</Btn>
                    <button onClick={()=>deleteColl(c.id)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:4,padding:"0 9px",color:T.muted,fontSize:14,cursor:"pointer"}}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </>)}
        </div>
      )}

      {tab==="nfts"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1}}>COLLECTION:</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{collections.map(c=><Btn key={c.id} variant={selColl===c.id?"gold":"ghost"} size="sm" onClick={()=>setSelColl(c.id)}>{c.name}</Btn>)}</div>
            {!addingNFT&&!editingNFT&&<div style={{marginLeft:"auto"}}><Btn onClick={()=>{setAddingNFT(true);setEditingNFT(null);}}>+ Add NFT</Btn></div>}
          </div>
          {(addingNFT||editingNFT)&&<NFTEditor nft={editingNFT} onSave={saveNFT} onCancel={()=>{setAddingNFT(false);setEditingNFT(null);}} verifiedUsers={verifiedUsers} posts={posts} />}
          {activeColl&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
            {activeColl.nfts.length===0&&!addingNFT&&<div style={{textAlign:"center",padding:50,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:T.muted}}>No NFTs yet.</div>}
            {activeColl.nfts.map(nft=>(
              <div key={nft.id} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"13px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{width:38,height:38,borderRadius:4,background:nft.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:T.gold,flexShrink:0}}>{nft.image}</div>
                <div style={{flex:1,minWidth:90}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:700,color:T.white,marginBottom:2}}>{nft.name}</div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{nft.rarity}</span>
                    <span style={{fontFamily:T.mono,fontSize:10,color:T.gold}}>{nft.price} ETH</span>
                    {nft.content&&<span style={{fontFamily:T.mono,fontSize:10,color:T.green}}>✓ Unlock</span>}
                    {nft.media&&<span style={{fontFamily:T.mono,fontSize:10,color:T.green}}>✓ Media</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  <Btn variant="ghost" size="sm" onClick={()=>{setEditingNFT(nft);setAddingNFT(false);}}>Edit</Btn>
                  <button onClick={()=>deleteNFT(nft.id)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:4,padding:"0 9px",color:T.muted,fontSize:14,cursor:"pointer"}}>×</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}

      {tab==="events"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1}}>COLLECTION:</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{collections.map(c=><Btn key={c.id} variant={selColl===c.id?"gold":"ghost"} size="sm" onClick={()=>setSelColl(c.id)}>{c.name}</Btn>)}</div>
            {!addingEvent&&!editingEvent&&<div style={{marginLeft:"auto"}}><Btn onClick={()=>{setAddingEvent(true);setEditingEvent(null);}}>+ Add Event</Btn></div>}
          </div>
          {(addingEvent||editingEvent)&&<EventEditor event={editingEvent} onSave={saveEvent} onCancel={()=>{setAddingEvent(false);setEditingEvent(null);}} />}
          {activeColl&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
            {activeColl.events.length===0&&!addingEvent&&<div style={{textAlign:"center",padding:50,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:T.muted}}>No events yet.</div>}
            {activeColl.events.map(ev=>(
              <div key={ev.id} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:700,color:T.white,marginBottom:2}}>{ev.title}</div>
                  <div style={{fontFamily:T.mono,fontSize:10,color:T.gold}}>{ev.date} · {ev.location}</div>
                  <div style={{fontFamily:T.sans,fontSize:12,color:T.muted,marginTop:4}}>{ev.desc}</div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  <Btn variant="ghost" size="sm" onClick={()=>{setEditingEvent(ev);setAddingEvent(false);}}>Edit</Btn>
                  <button onClick={()=>deleteEv(ev.id)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:4,padding:"0 9px",color:T.muted,fontSize:14,cursor:"pointer"}}>×</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}

      {tab==="mod"&&<ModerationTab posts={posts} onBlockPost={onBlockPost} onFlagUser={onFlagUser} onVerify={onVerify} onPin={onPin} onDeletePost={onDeletePost} onWarn={onWarn} flaggedUsers={flaggedUsers} verifiedUsers={verifiedUsers} blockedPosts={blockedPosts} />}

      {tab==="opensea"&&(
        <div style={{maxWidth:560}}>
          <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"clamp(18px,4vw,30px)",marginBottom:16}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:T.white,marginBottom:6}}>Fetch from OpenSea</h3>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:14,color:T.muted,lineHeight:1.8,marginBottom:20}}>Enter your collection slug to import NFT metadata, traits and pricing.</p>
            <Field label="Collection Slug"><Input value={openSeaSlug} onChange={e=>setOpenSeaSlug(e.target.value)} placeholder="my-collection-slug" /><p style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:4}}>opensea.io/collection/my-collection → "my-collection"</p></Field>
            <Field label="Target Collection"><Select value={selColl} onChange={e=>setSelColl(Number(e.target.value))}>{collections.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
            <Btn full onClick={fetchOSea}>{fetching?"Fetching…":"Fetch from OpenSea"}</Btn>
          </div>
          <div style={{border:`1px solid ${T.gold}22`,borderRadius:8,padding:"clamp(14px,4vw,24px)"}}>
            <h4 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.gold,marginBottom:12}}>Activation Steps</h4>
            {[["1","Get API key","docs.opensea.io/reference"],["2","Add to .env","REACT_APP_OPENSEA_API_KEY=your_key"],["3","Replace mock fetch","AdminPanel.jsx → fetchOSea()"],["4","Endpoint","GET /api/v2/collection/{slug}/nfts"]].map(([n,t,d])=>(
              <div key={n} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{fontFamily:T.mono,fontSize:12,color:T.gold,minWidth:16}}>{n}</div>
                <div><div style={{fontFamily:T.sans,fontSize:13,color:T.white,marginBottom:2,fontWeight:600}}>{t}</div><div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
