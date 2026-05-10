import { useState } from "react";
import { T, Btn, Divider, Field, Input, Textarea, Select, AnimatedAvatar, Tag } from "./tokens";
import { saveCollection } from "./firebase";

const ROLES  = ["Musician","Fashion Designer","Up-cycler","Visual Artist","Photographer","Poet","Dancer","Writer","Filmmaker","Sculptor"];
const RARITY = ["Common","Rare","Epic","Legendary"];

// ── NFT Editor ────────────────────────────────────────────────────────────────
function NFTEditor({ nft, onSave, onCancel }) {
  const [form,setForm] = useState(nft || {
    id:"n_"+Date.now(), name:"", price:"0.5", momoPrice:"750", rarity:"Common",
    image:"◈", bg:"linear-gradient(160deg,#0d0b07,#2a1f0a)", likes:0,
    description:"", story:"", traits:[], perks:[],
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const addTrait = () => setForm(p=>({...p,traits:[...p.traits,{k:"",v:""}]}));
  const setTrait = (i,k,v) => setForm(p=>({...p,traits:p.traits.map((t,j)=>j===i?{...t,[k]:v}:t)}));
  const removeTrait = i => setForm(p=>({...p,traits:p.traits.filter((_,j)=>j!==i)}));

  const addPerk = () => setForm(p=>({...p,perks:[...p.perks,""]}));
  const setPerk = (i,v) => setForm(p=>({...p,perks:p.perks.map((pk,j)=>j===i?v:pk)}));
  const removePerk = i => setForm(p=>({...p,perks:p.perks.filter((_,j)=>j!==i)}));

  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(18px,4vw,28px)",marginBottom:16}}>
      <h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:18}}>
        {nft?"Edit NFT":"New NFT"}
      </h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="NFT Name"><Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Rhythm of Accra — I" /></Field>
        <Field label="Symbol/Emoji"><Input value={form.image} onChange={e=>set("image",e.target.value)} placeholder="♪ ◈ ◉ 🌙" /></Field>
        <Field label="Price (ETH)"><Input value={form.price} onChange={e=>set("price",e.target.value)} placeholder="0.5" /></Field>
        <Field label="Price (GHS MoMo)"><Input value={form.momoPrice} onChange={e=>set("momoPrice",e.target.value)} placeholder="750" /></Field>
        <Field label="Rarity">
          <Select value={form.rarity} onChange={e=>set("rarity",e.target.value)}>
            {RARITY.map(r=><option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Bg Gradient" hint="CSS gradient for the NFT card">
          <Input value={form.bg} onChange={e=>set("bg",e.target.value)} placeholder="linear-gradient(160deg,#0d0b07,#2a1f0a)" />
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What is this NFT about?" rows={2} />
      </Field>
      <Field label="Story / Artist Note">
        <Textarea value={form.story} onChange={e=>set("story",e.target.value)} placeholder="The story behind this piece…" rows={2} />
      </Field>

      {/* Traits */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <label style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:"#a09cbc",letterSpacing:"0.08em",textTransform:"uppercase"}}>Traits</label>
          <Btn variant="ghost" size="sm" onClick={addTrait}>+ Trait</Btn>
        </div>
        {form.traits.map((tr,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <Input value={tr.k} onChange={e=>setTrait(i,"k",e.target.value)} placeholder="Key" style={{flex:1}} />
            <Input value={tr.v} onChange={e=>setTrait(i,"v",e.target.value)} placeholder="Value" style={{flex:1}} />
            <button onClick={()=>removeTrait(i)} style={{background:"none",border:"none",color:T.red,fontSize:18,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
          </div>
        ))}
      </div>

      {/* Perks */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <label style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:"#a09cbc",letterSpacing:"0.08em",textTransform:"uppercase"}}>Perks &amp; Privileges</label>
          <Btn variant="ghost" size="sm" onClick={addPerk}>+ Perk</Btn>
        </div>
        {form.perks.map((pk,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <Input value={pk} onChange={e=>setPerk(i,e.target.value)} placeholder="🎧 Perk description" style={{flex:1}} />
            <button onClick={()=>removePerk(i)} style={{background:"none",border:"none",color:T.red,fontSize:18,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>onSave(form)}>Save NFT</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── Event Editor ──────────────────────────────────────────────────────────────
function EventEditor({ event, onSave, onCancel }) {
  const [form,setForm] = useState(event || {id:"ev_"+Date.now(),title:"",date:"",location:"",desc:""});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(16px,3vw,24px)",marginBottom:16}}>
      <h3 style={{fontFamily:T.font,fontSize:16,fontWeight:700,color:T.white,marginBottom:16}}>
        {event?"Edit Event":"New Event"}
      </h3>
      <Field label="Event Title"><Input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Live Recording Session" /></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Date"><Input value={form.date} onChange={e=>set("date",e.target.value)} placeholder="2025-08-14" /></Field>
        <Field label="Location"><Input value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Accra, Ghana" /></Field>
      </div>
      <Field label="Description"><Textarea value={form.desc} onChange={e=>set("desc",e.target.value)} rows={2} placeholder="Details for NFT holders…" /></Field>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>onSave(form)}>Save Event</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── Collection Editor ─────────────────────────────────────────────────────────
function CollectionEditor({ existing, verifiedProfiles, onSave, onCancel }) {
  const [form,setForm]   = useState(existing||{name:"",creator:"",role:"Musician",accent:"#c9a96e",description:"",followers:"0",totalPieces:0,avatar:"◈",nfts:[],events:[]});
  const [customRole,setCustomRole]   = useState("");
  const [showCustom,setShowCustom]   = useState(false);
  const [showDrop,setShowDrop]       = useState(false);
  const [editNFT,setEditNFT]         = useState(null);   // null=none, "new"=new, {obj}=edit
  const [editEvent,setEditEvent]     = useState(null);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const profiles = verifiedProfiles||[];

  const saveNFT = nft => {
    setForm(p=>{
      const nfts = editNFT==="new"
        ? [...p.nfts, nft]
        : p.nfts.map(n=>n.id===nft.id?nft:n);
      return {...p, nfts, totalPieces:nfts.length};
    });
    setEditNFT(null);
  };
  const removeNFT = id => setForm(p=>({...p,nfts:p.nfts.filter(n=>n.id!==id)}));

  const saveEvent = ev => {
    setForm(p=>{
      const events = editEvent==="new"
        ? [...p.events, ev]
        : p.events.map(e=>e.id===ev.id?ev:e);
      return {...p, events};
    });
    setEditEvent(null);
  };
  const removeEvent = id => setForm(p=>({...p,events:p.events.filter(e=>e.id!==id)}));

  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(20px,4vw,32px)",marginBottom:20}}>
      <h3 style={{fontFamily:T.font,fontSize:20,fontWeight:700,color:T.white,marginBottom:20}}>
        {existing?"Edit Collection":"New Collection"}
      </h3>

      <Field label="Collection Name">
        <Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Ancestral Frequencies" />
      </Field>

      {/* Creator from verified users */}
      <Field label="Creator Name">
        <div style={{position:"relative"}}>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,position:"relative"}}>
              <Input value={form.creator} onChange={e=>set("creator",e.target.value)} placeholder="Creator name" />
            </div>
            {profiles.length>0&&(
              <button onClick={()=>setShowDrop(p=>!p)}
                style={{background:"rgba(201,169,110,0.1)",border:`1px solid ${T.gold}44`,
                  borderRadius:6,padding:"0 12px",color:T.gold,cursor:"pointer",
                  fontFamily:T.mono,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                Pick ▾
              </button>
            )}
          </div>
          {showDrop&&profiles.length>0&&(
            <div className="glass-h" style={{position:"absolute",top:"calc(100%+4px)",left:0,right:0,
              border:`1px solid ${T.border}`,borderRadius:10,zIndex:50,overflow:"hidden",
              maxHeight:220,overflowY:"auto",boxShadow:"0 16px 40px rgba(0,0,0,0.8)"}}>
              {profiles.map(p=>(
                <div key={p.username} onClick={()=>{set("creator",p.displayName);setShowDrop(false);}}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
                    cursor:"pointer",borderBottom:`1px solid ${T.border}`,transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <AnimatedAvatar avatar={p.avatar||{type:"symbol",value:"◆"}} zodiac={p.zodiac} size={32} border={false} />
                  <div>
                    <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white}}>{p.displayName}</div>
                    <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>@{p.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Field>

      {/* Role */}
      <Field label="Creator Role">
        {showCustom ? (
          <div style={{display:"flex",gap:8}}>
            <Input value={customRole} onChange={e=>setCustomRole(e.target.value)} placeholder="Custom role…" />
            <Btn size="sm" onClick={()=>{set("role",customRole);setShowCustom(false);}}>Set</Btn>
            <Btn size="sm" variant="ghost" onClick={()=>setShowCustom(false)}>×</Btn>
          </div>
        ) : (
          <div style={{display:"flex",gap:8}}>
            <Select value={form.role} onChange={e=>set("role",e.target.value)} style={{flex:1}}>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </Select>
            <Btn size="sm" variant="ghost" onClick={()=>setShowCustom(true)}>+ New</Btn>
          </div>
        )}
      </Field>

      <Field label="Description">
        <Textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={2} placeholder="What is this collection about?" />
      </Field>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Symbol/Avatar"><Input value={form.avatar} onChange={e=>set("avatar",e.target.value)} placeholder="◈ ♪ ◉" /></Field>
        <Field label="Accent Colour">
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="color" value={form.accent} onChange={e=>set("accent",e.target.value)}
              style={{width:40,height:40,borderRadius:6,border:`1px solid ${T.border}`,cursor:"pointer",padding:2,background:"none"}} />
            <Input value={form.accent} onChange={e=>set("accent",e.target.value)} placeholder="#c9a96e" />
          </div>
        </Field>
      </div>

      {/* NFTs sub-section */}
      <Divider style={{margin:"20px 0 16px"}} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:T.mono,fontSize:11,fontWeight:700,color:"#a09cbc",letterSpacing:"0.08em",textTransform:"uppercase"}}>
          NFTs ({form.nfts.length})
        </div>
        <Btn size="sm" onClick={()=>setEditNFT("new")}>+ Add NFT</Btn>
      </div>
      {(editNFT==="new"||editNFT?.id) && (
        <NFTEditor nft={editNFT==="new"?null:editNFT} onSave={saveNFT} onCancel={()=>setEditNFT(null)} />
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:16}}>
        {form.nfts.map(n=>(
          <div key={n.id} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:34,height:34,borderRadius:6,background:n.bg||T.bg,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:T.font,fontSize:18,color:T.gold,flexShrink:0}}>{n.image}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:T.font,fontSize:13,fontWeight:700,color:T.white,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.name}</div>
                <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{n.price} ETH · {n.rarity}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setEditNFT(n)} style={{flex:1,background:"rgba(255,255,255,0.04)",
                border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 0",
                color:T.muted,fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer"}}>Edit</button>
              <button onClick={()=>removeNFT(n.id)} style={{background:"rgba(196,106,106,0.07)",
                border:`1px solid ${T.red}33`,borderRadius:6,padding:"5px 10px",
                color:T.red,fontFamily:T.sans,fontSize:11,cursor:"pointer"}}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Events sub-section */}
      <Divider style={{margin:"4px 0 16px"}} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:T.mono,fontSize:11,fontWeight:700,color:"#a09cbc",letterSpacing:"0.08em",textTransform:"uppercase"}}>
          Events ({form.events.length})
        </div>
        <Btn size="sm" onClick={()=>setEditEvent("new")}>+ Add Event</Btn>
      </div>
      {(editEvent==="new"||editEvent?.id) && (
        <EventEditor event={editEvent==="new"?null:editEvent} onSave={saveEvent} onCancel={()=>setEditEvent(null)} />
      )}
      {form.events.map(ev=>(
        <div key={ev.id} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,
          padding:"12px 16px",marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:T.font,fontSize:14,fontWeight:700,color:T.white,marginBottom:2}}>{ev.title}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.gold}}>{ev.date} · {ev.location}</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>setEditEvent(ev)} style={{background:"rgba(255,255,255,0.04)",
              border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 10px",
              color:T.muted,fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer"}}>Edit</button>
            <button onClick={()=>removeEvent(ev.id)} style={{background:"rgba(196,106,106,0.07)",
              border:`1px solid ${T.red}33`,borderRadius:6,padding:"5px 10px",
              color:T.red,cursor:"pointer",fontSize:11}}>×</button>
          </div>
        </div>
      ))}

      <div style={{display:"flex",gap:10,marginTop:20}}>
        <Btn onClick={()=>onSave(form)}>Save Collection</Btn>
        {onCancel&&<Btn variant="ghost" onClick={onCancel}>Cancel</Btn>}
      </div>
    </div>
  );
}

// ── Moderation Tab ─────────────────────────────────────────────────────────────
function ModerationTab({ posts, flaggedUsers, verifiedUsers, onBlockPost, onFlagUser, onVerify, onPin, onDeletePost, onWarn }) {
  const [search,setSearch] = useState("");

  // Get unique users safely
  const users = [];
  if (Array.isArray(posts)) {
    const seen = new Set();
    posts.forEach(p => {
      if (p?.username && !seen.has(p.username)) {
        seen.add(p.username);
        users.push(p.username);
      }
    });
  }

  const filtered = users.filter(u=>u.toLowerCase().includes(search.toLowerCase()));
  const safePosts = Array.isArray(posts) ? posts : [];

  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>
          User Management
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search @username…"
          style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
            borderRadius:8,padding:"11px 14px",color:T.white,fontFamily:T.sans,
            fontSize:13,outline:"none",marginBottom:14}}
          onFocus={e=>e.target.style.borderColor=T.gold}
          onBlur={e=>e.target.style.borderColor=T.border} />

        {filtered.length===0&&search&&(
          <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:14}}>No users match "{search}"</p>
        )}
        {filtered.length===0&&!search&&(
          <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:14}}>No users found. Users appear here once they post.</p>
        )}

        {filtered.map(u=>(
          <div key={u} className="glass" style={{border:`1px solid ${T.border}`,borderRadius:8,
            padding:"14px 18px",marginBottom:8,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontFamily:T.mono,fontSize:13,color:T.white,fontWeight:700}}>@{u}</div>
              {verifiedUsers[u]&&<div style={{fontFamily:T.mono,fontSize:10,color:T.green,marginTop:2}}>👑 Verified</div>}
              {flaggedUsers[u]&&<div style={{fontFamily:T.mono,fontSize:10,color:T.flag,marginTop:2}}>❓ Flagged · {flaggedUsers[u]?.at||""}</div>}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>onVerify(u)}
                style={{background:verifiedUsers[u]?"rgba(106,170,136,0.15)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${verifiedUsers[u]?T.green:T.border}`,borderRadius:6,
                  padding:"7px 13px",color:verifiedUsers[u]?T.green:T.muted,
                  fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer",
                  transition:`all 0.18s ${T.smooth}`}}>
                {verifiedUsers[u]?"✓ Verified":"Verify"}
              </button>
              <button onClick={()=>onFlagUser(u)}
                style={{background:flaggedUsers[u]?"rgba(224,160,48,0.12)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${flaggedUsers[u]?T.flag:T.border}`,borderRadius:6,
                  padding:"7px 13px",color:flaggedUsers[u]?T.flag:T.muted,
                  fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer",
                  transition:`all 0.18s ${T.smooth}`}}>
                {flaggedUsers[u]?"✕ Unflag":"Flag"}
              </button>
              <button onClick={()=>onWarn(u)}
                style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                  borderRadius:6,padding:"7px 13px",color:T.muted,
                  fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                ⚠️ Warn
              </button>
            </div>
          </div>
        ))}
      </div>

      <Divider style={{margin:"8px 0 24px"}} />

      <div>
        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,
          textTransform:"uppercase",marginBottom:14}}>Post Moderation</div>
        {safePosts.length===0&&(
          <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:14}}>No posts yet.</p>
        )}
        {safePosts.slice(0,30).map(p=>(
          <div key={p.id} className="glass" style={{border:`1px solid ${p.blocked?T.red+"33":T.border}`,
            borderRadius:8,padding:"12px 16px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,color:T.white,marginBottom:3}}>
                  @{p.username||"anon"}
                  {p.pinned&&<span style={{marginLeft:8,fontFamily:T.mono,fontSize:10,color:T.gold}}>📌 pinned</span>}
                  {p.blocked&&<span style={{marginLeft:8,fontFamily:T.mono,fontSize:10,color:T.red}}>🚫 blocked</span>}
                </div>
                <div style={{fontFamily:T.sans,fontSize:12,color:T.muted,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:320}}>
                  {p.text||p.comment||"[no text]"}
                </div>
                <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:3}}>
                  ♥ {p.likes||0} · 💬 {p.comments||0}
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>onPin(p.id)}
                  style={{background:p.pinned?"rgba(201,169,110,0.12)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${p.pinned?T.gold:T.border}`,borderRadius:6,
                    padding:"6px 11px",color:p.pinned?T.gold:T.muted,
                    fontFamily:T.sans,fontSize:11,cursor:"pointer"}}>
                  {p.pinned?"Unpin":"📌"}
                </button>
                <button onClick={()=>onBlockPost(p.id)}
                  style={{background:p.blocked?"rgba(196,106,106,0.12)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${p.blocked?T.red:T.border}`,borderRadius:6,
                    padding:"6px 11px",color:p.blocked?T.red:T.muted,
                    fontFamily:T.sans,fontSize:11,cursor:"pointer"}}>
                  {p.blocked?"Unblock":"🚫"}
                </button>
                <button onClick={()=>onDeletePost(p.id)}
                  style={{background:"rgba(196,106,106,0.06)",border:`1px solid ${T.red}44`,
                    borderRadius:6,padding:"6px 11px",color:T.red,cursor:"pointer",fontSize:13}}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Panel ───────────────────────────────────────────────────────────
export default function AdminPanel({
  collections = [],
  setCollections,
  posts = [],
  verifiedUsers = {},
  flaggedUsers = {},
  onBlockPost, onFlagUser, onVerify, onPin, onDeletePost, onWarn,
}) {
  const [tab,setTab]         = useState("collections");
  const [editing,setEditing] = useState(null);
  const [creating,setCreating] = useState(false);
  const [saving,setSaving]   = useState(false);

  // Verified profiles for creator selector
  const verifiedProfiles = Object.entries(verifiedUsers||{})
    .filter(([,v])=>v)
    .map(([username])=>{
      const post = (posts||[]).find(p=>p?.username===username);
      return {
        username,
        displayName: post?.user || username,
        avatar: post?.avatar || {type:"symbol",value:"◆"},
        zodiac: post?.zodiac || null,
      };
    });

  const handleSave = async data => {
    setSaving(true);
    try {
      if (editing) {
        const updated = {...data, id:editing.id};
        await saveCollection(updated);
        setCollections(prev=>prev.map(c=>c.id===editing.id?updated:c));
      } else {
        const newId = await saveCollection(data);
        setCollections(prev=>[...prev,{...data,id:newId}]);
      }
    } catch(e) {
      // Firestore unavailable — update local state
      if(editing) setCollections(prev=>prev.map(c=>c.id===editing.id?{...data,id:editing.id}:c));
      else setCollections(prev=>[...prev,{...data,id:"c_"+Date.now()}]);
    }
    setSaving(false);
    setEditing(null);
    setCreating(false);
  };

  const TABS = [
    ["collections","Collections"],
    ["moderation","🛡 Moderation"],
  ];

  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(14px,4vw,28px)"}}>
      <div style={{marginBottom:28}}>
        <h2 style={{fontFamily:T.font,fontSize:"clamp(24px,5vw,36px)",fontWeight:700,color:T.white,marginBottom:4}}>
          Admin Panel
        </h2>
        <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.mono,fontSize:11,color:T.muted}}>
          <span>PARADISE on Earth</span>
          <span>·</span>
          <span className="god-text" style={{color:T.gold}}>GOD🤎 @humble_servant</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:28,
        overflowX:"auto",scrollbarWidth:"none"}}>
        {TABS.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{background:"none",border:"none",
              borderBottom:tab===t?`2px solid ${T.gold}`:"2px solid transparent",
              color:tab===t?T.gold:T.muted,fontFamily:T.sans,fontSize:12,fontWeight:700,
              letterSpacing:"0.08em",textTransform:"uppercase",
              padding:"0 0 13px",marginRight:22,marginBottom:-1,cursor:"pointer",
              whiteSpace:"nowrap",transition:"color 0.18s"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Collections */}
      {tab==="collections"&&(
        <div>
          {(creating||editing)?(
            <CollectionEditor
              existing={editing}
              verifiedProfiles={verifiedProfiles}
              onSave={handleSave}
              onCancel={()=>{setCreating(false);setEditing(null);}} />
          ):(
            <>
              <div style={{marginBottom:20}}>
                <button onClick={()=>setCreating(true)}
                  style={{background:T.gold,border:"none",borderRadius:8,padding:"11px 24px",
                    color:"#08080e",fontFamily:T.sans,fontSize:12,fontWeight:700,
                    letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",
                    boxShadow:`0 4px 20px ${T.gold}44`}}>
                  + New Collection
                </button>
              </div>
              {collections.length===0&&(
                <div style={{textAlign:"center",padding:"60px 0",fontFamily:T.font,
                  fontStyle:"italic",color:T.muted,fontSize:16}}>
                  No collections yet. Create your first.
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,280px),1fr))",gap:14}}>
                {collections.map(c=>(
                  <div key={c.id} className="glass" style={{border:`1px solid ${c.accent}22`,borderRadius:10,padding:"18px"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                      <div style={{width:44,height:44,borderRadius:"50%",border:`2px solid ${c.accent}44`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:T.font,fontSize:22,color:c.accent,flexShrink:0}}>{c.avatar}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:T.font,fontSize:14,fontWeight:700,color:T.white,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginTop:2}}>{c.creator} · {c.role}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:12,fontFamily:T.mono,fontSize:10,color:T.dim,marginBottom:14}}>
                      <span>{c.nfts?.length||0} NFTs</span>
                      <span>{c.events?.length||0} events</span>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setEditing(c)}
                        style={{flex:1,background:"rgba(255,255,255,0.04)",
                          border:`1px solid ${T.border}`,borderRadius:7,padding:"8px 0",
                          color:T.muted,fontFamily:T.sans,fontSize:11,fontWeight:700,
                          textTransform:"uppercase",letterSpacing:"0.06em",cursor:"pointer",
                          transition:"all 0.18s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.gold;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
                        Edit
                      </button>
                      <button onClick={()=>setCollections(prev=>prev.filter(x=>x.id!==c.id))}
                        style={{background:"rgba(196,106,106,0.07)",border:`1px solid ${T.red}33`,
                          borderRadius:7,padding:"8px 14px",color:T.red,cursor:"pointer",fontSize:14}}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Moderation */}
      {tab==="moderation"&&(
        <ModerationTab
          posts={posts}
          flaggedUsers={flaggedUsers||{}}
          verifiedUsers={verifiedUsers||{}}
          onBlockPost={onBlockPost}
          onFlagUser={onFlagUser}
          onVerify={onVerify}
          onPin={onPin}
          onDeletePost={onDeletePost}
          onWarn={onWarn} />
      )}
    </div>
  );
}
