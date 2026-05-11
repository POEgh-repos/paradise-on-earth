import { useState, useEffect, useCallback } from "react";
import { T, Btn, Divider, Field, Input, Textarea, Select, AnimatedAvatar, Tag } from "./tokens";
import { saveCollection, deleteCollection } from "./firebase";

const ROLES  = ["Musician","Fashion Designer","Up-cycler","Visual Artist","Photographer","Poet","Dancer","Writer","Filmmaker","Sculptor"];
const RARITY = ["Common","Rare","Epic","Legendary"];

// ── Live ETH → GHS conversion ─────────────────────────────────────────────────
async function getEthGhsRate() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,ghs");
    if (!res.ok) throw new Error();
    const d = await res.json();
    return { usd: d.ethereum.usd, ghs: d.ethereum.ghs };
  } catch(e) {
    // Fallback: use approximate rate
    return { usd: 3800, ghs: 52000 }; // approx. 1 ETH
  }
}

// ── OpenSea NFT Fetcher ───────────────────────────────────────────────────────
async function fetchOpenSeaNFT(slugOrAddress, ethRate) {
  // Try by collection slug first
  try {
    const res = await fetch(
      `https://api.opensea.io/api/v2/collections/${slugOrAddress}/nfts?limit=1`,
      { headers: { "accept": "application/json" } }
    );
    if (res.ok) {
      const d = await res.json();
      const nft = d.nfts?.[0];
      if (nft) return formatOSNFT(nft, ethRate);
    }
  } catch(e) {}

  // Try by contract address
  try {
    const res = await fetch(
      `https://api.opensea.io/api/v2/asset/${slugOrAddress}`,
      { headers: { "accept": "application/json" } }
    );
    if (res.ok) {
      const nft = await res.json();
      return formatOSNFT(nft, ethRate);
    }
  } catch(e) {}
  return null;
}

function formatOSNFT(nft, rate) {
  const ethPrice = nft.last_sale?.payment?.quantity
    ? (Number(nft.last_sale.payment.quantity) / 1e18).toFixed(4)
    : "0.5";
  const ghsPrice = Math.round(parseFloat(ethPrice) * (rate?.ghs||52000));
  return {
    id:          "os_" + (nft.identifier||Date.now()),
    name:        nft.name || nft.identifier || "Unnamed NFT",
    description: nft.description || "",
    image:       nft.image_url ? null : "◈",
    imageUrl:    nft.image_url || null,
    bg:          "linear-gradient(160deg,#0d0b07,#2a1f0a,#3d2e10)",
    price:       ethPrice,
    momoPrice:   ghsPrice.toLocaleString(),
    rarity:      nft.rarity?.rank ? getRarityLabel(nft.rarity.rank, nft.rarity.max_rank) : "Rare",
    story:       nft.description || "",
    traits:      (nft.traits||[]).map(t=>({k:t.trait_type,v:String(t.value)})),
    perks:       [],
    likes:       0,
    openSeaLink: nft.opensea_url || null,
    contractAddress: nft.contract || null,
    tokenId:     nft.identifier || null,
  };
}

function getRarityLabel(rank, max) {
  if (!rank||!max) return "Rare";
  const pct = rank/max;
  if (pct < 0.01) return "Legendary";
  if (pct < 0.1)  return "Epic";
  if (pct < 0.3)  return "Rare";
  return "Common";
}

// ── OpenSea Import Panel ──────────────────────────────────────────────────────
function OpenSeaImport({ onImport, ethRate }) {
  const [slug, setSlug]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const fetch_ = async () => {
    if (!slug.trim()) return;
    setLoading(true); setError(""); setPreview(null);
    const nft = await fetchOpenSeaNFT(slug.trim(), ethRate);
    if (nft) setPreview(nft);
    else setError("NFT not found. Try the OpenSea collection slug or contract address.");
    setLoading(false);
  };

  return (
    <div className="glass" style={{border:`1px solid ${T.gold}33`,borderRadius:10,
      padding:"20px",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:20}}>🌊</span>
        <span style={{fontFamily:T.font,fontSize:16,fontWeight:700,color:T.gold}}>
          Import from OpenSea
        </span>
      </div>
      <div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginBottom:12,lineHeight:1.6}}>
        Enter an OpenSea collection slug (from the URL: opensea.io/collection/<b>SLUG</b>)
        or a contract address. ETH price is fetched live and converted to GHS.
      </div>
      <div style={{display:"flex",gap:8}}>
        <Input value={slug} onChange={e=>setSlug(e.target.value)}
          placeholder="e.g. boredapeyachtclub or 0x1234..." />
        <Btn onClick={fetch_} disabled={loading||!slug.trim()}>
          {loading?"…":"Fetch"}
        </Btn>
      </div>
      {error&&<p style={{fontFamily:T.mono,fontSize:11,color:T.red,marginTop:10}}>{error}</p>}
      {preview&&(
        <div style={{marginTop:16,border:`1px solid ${T.border}`,borderRadius:8,
          padding:"14px 16px"}}>
          {preview.imageUrl&&(
            <img src={preview.imageUrl} alt="" style={{width:80,height:80,
              borderRadius:8,objectFit:"cover",marginBottom:12,display:"block"}} />
          )}
          <div style={{fontFamily:T.font,fontSize:16,fontWeight:700,color:T.white,marginBottom:4}}>
            {preview.name}
          </div>
          <div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:T.mono,fontSize:12,color:T.gold}}>
              {preview.price} ETH
            </span>
            <span style={{fontFamily:T.mono,fontSize:12,color:T.muted}}>
              GHS {preview.momoPrice}
            </span>
            <Tag color={preview.rarity==="Legendary"?"#e8c87c":preview.rarity==="Epic"?"#b8a0c8":T.gold}>
              {preview.rarity}
            </Tag>
          </div>
          {preview.traits.length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {preview.traits.slice(0,6).map((t,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.05)",
                  border:`1px solid ${T.border}`,borderRadius:4,padding:"4px 10px"}}>
                  <div style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>{t.k}</div>
                  <div style={{fontFamily:T.sans,fontSize:11,color:T.white,fontWeight:600}}>{t.v}</div>
                </div>
              ))}
            </div>
          )}
          <Btn onClick={()=>{ onImport(preview); setPreview(null); setSlug(""); }}>
            Add to Collection ✓
          </Btn>
        </div>
      )}
    </div>
  );
}

// ── NFT Editor ────────────────────────────────────────────────────────────────
function NFTEditor({ nft, onSave, onCancel, ethRate }) {
  const [form, setForm] = useState(nft||{
    id:"n_"+Date.now(), name:"", price:"0.5", momoPrice:"750", rarity:"Common",
    image:"◈", imageUrl:"", bg:"linear-gradient(160deg,#0d0b07,#2a1f0a)", likes:0,
    description:"", story:"", traits:[], perks:[], openSeaLink:"",
  });
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  // Auto-convert ETH to GHS
  useEffect(()=>{
    if(!ethRate||!form.price) return;
    const ghs = Math.round(parseFloat(form.price)||0 * ethRate.ghs);
    if(ghs>0) set("momoPrice", ghs.toLocaleString());
  },[form.price, ethRate]);

  const addTrait=()=>setForm(p=>({...p,traits:[...p.traits,{k:"",v:""}]}));
  const setTrait=(i,k,v)=>setForm(p=>({...p,traits:p.traits.map((t,j)=>j===i?{...t,[k]:v}:t)}));
  const removeTrait=i=>setForm(p=>({...p,traits:p.traits.filter((_,j)=>j!==i)}));
  const addPerk=()=>setForm(p=>({...p,perks:[...p.perks,""]}));
  const setPerk=(i,v)=>setForm(p=>({...p,perks:p.perks.map((pk,j)=>j===i?v:pk)}));
  const removePerk=i=>setForm(p=>({...p,perks:p.perks.filter((_,j)=>j!==i)}));

  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,
      padding:"clamp(18px,4vw,28px)",marginBottom:16}}>
      <h3 style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white,marginBottom:18}}>
        {nft?"Edit NFT":"New NFT"}
      </h3>

      {/* OpenSea link */}
      <Field label="OpenSea Link / Contract" hint="Optional — links to the original NFT on OpenSea">
        <Input value={form.openSeaLink||""} onChange={e=>set("openSeaLink",e.target.value)}
          placeholder="https://opensea.io/assets/..." />
      </Field>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="NFT Name">
          <Input value={form.name} onChange={e=>set("name",e.target.value)}
            placeholder="e.g. Rhythm of Accra — I" />
        </Field>
        <Field label="Symbol / Emoji">
          <Input value={form.image} onChange={e=>set("image",e.target.value)}
            placeholder="♪ ◈ ◉ 🌙" />
        </Field>
        <Field label="Price (ETH)">
          <Input value={form.price} onChange={e=>set("price",e.target.value)} placeholder="0.5" />
        </Field>
        <Field label="Price (GHS MoMo)" hint={ethRate?`1 ETH ≈ GHS ${ethRate.ghs?.toLocaleString()}`:""}>
          <Input value={form.momoPrice} onChange={e=>set("momoPrice",e.target.value)} placeholder="750" />
        </Field>
        <Field label="Rarity">
          <Select value={form.rarity} onChange={e=>set("rarity",e.target.value)}>
            {RARITY.map(r=><option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Card Gradient" hint="CSS gradient for the NFT card display">
          <Input value={form.bg} onChange={e=>set("bg",e.target.value)}
            placeholder="linear-gradient(160deg,#0d0b07,#2a1f0a)" />
        </Field>
      </div>

      <Field label="Image URL" hint="Direct link to the NFT image (from OpenSea or IPFS)">
        <Input value={form.imageUrl||""} onChange={e=>set("imageUrl",e.target.value)}
          placeholder="https://... or ipfs://..." />
      </Field>

      <Field label="Description">
        <Textarea value={form.description} onChange={e=>set("description",e.target.value)}
          placeholder="What is this NFT?" rows={2} />
      </Field>
      <Field label="Story / Artist Note">
        <Textarea value={form.story} onChange={e=>set("story",e.target.value)}
          placeholder="The story behind this piece…" rows={2} />
      </Field>

      {/* Traits */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <label style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:"#a09cbc",
            letterSpacing:"0.08em",textTransform:"uppercase"}}>Traits</label>
          <Btn variant="ghost" size="sm" onClick={addTrait}>+ Trait</Btn>
        </div>
        {form.traits.map((tr,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <Input value={tr.k} onChange={e=>setTrait(i,"k",e.target.value)}
              placeholder="Property" style={{flex:1}} />
            <Input value={tr.v} onChange={e=>setTrait(i,"v",e.target.value)}
              placeholder="Value" style={{flex:1}} />
            <button onClick={()=>removeTrait(i)} style={{background:"none",border:"none",
              color:T.red,fontSize:18,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
          </div>
        ))}
        {form.traits.length===0&&(
          <p style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>
            No traits. Traits from OpenSea are auto-imported.
          </p>
        )}
      </div>

      {/* Perks — unlock files */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <label style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:"#a09cbc",
            letterSpacing:"0.08em",textTransform:"uppercase"}}>Perks & Unlockable Files</label>
          <Btn variant="ghost" size="sm" onClick={addPerk}>+ Perk</Btn>
        </div>
        {form.perks.map((pk,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <Input value={pk} onChange={e=>setPerk(i,e.target.value)}
              placeholder="🎧 Unreleased stems · 📁 File URL" style={{flex:1}} />
            <button onClick={()=>removePerk(i)} style={{background:"none",border:"none",
              color:T.red,fontSize:18,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
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
  const [form,setForm]=useState(event||{id:"ev_"+Date.now(),title:"",date:"",location:"",desc:""});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,
      padding:"clamp(16px,3vw,24px)",marginBottom:16}}>
      <h3 style={{fontFamily:T.font,fontSize:16,fontWeight:700,color:T.white,marginBottom:16}}>
        {event?"Edit Event":"New Event"}
      </h3>
      <Field label="Event Title">
        <Input value={form.title} onChange={e=>set("title",e.target.value)}
          placeholder="e.g. Live Recording Session" />
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Date">
          <Input value={form.date} onChange={e=>set("date",e.target.value)} placeholder="2025-08-14" />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={e=>set("location",e.target.value)}
            placeholder="Accra, Ghana" />
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={form.desc} onChange={e=>set("desc",e.target.value)} rows={2}
          placeholder="Details for NFT holders…" />
      </Field>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>onSave(form)}>Save Event</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── Collection Editor ─────────────────────────────────────────────────────────
function CollectionEditor({ existing, verifiedProfiles, onSave, onCancel, ethRate }) {
  const [form,setForm]=useState(existing||{
    name:"",creator:"",role:"Musician",accent:"#c9a96e",
    description:"",followers:"0",totalPieces:0,avatar:"◈",
    nfts:[],events:[],openSeaSlug:"",
  });
  const [customRole,setCustomRole]=useState("");
  const [showCustom,setShowCustom]=useState(false);
  const [showDrop,setShowDrop]=useState(false);
  const [editNFT,setEditNFT]=useState(null);
  const [editEvent,setEditEvent]=useState(null);
  const [importNFT,setImportNFT]=useState(false);

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const profiles=verifiedProfiles||[];

  const saveNFT=nft=>{
    setForm(p=>{
      const nfts=editNFT==="new"?[...p.nfts,nft]:p.nfts.map(n=>n.id===nft.id?nft:n);
      return {...p,nfts,totalPieces:nfts.length};
    });
    setEditNFT(null);
  };
  const importNFTFn=nft=>{
    setForm(p=>{
      const nfts=[...p.nfts,nft];
      return {...p,nfts,totalPieces:nfts.length};
    });
    setImportNFT(false);
  };
  const removeNFT=id=>setForm(p=>({...p,nfts:p.nfts.filter(n=>n.id!==id)}));
  const saveEvent=ev=>{
    setForm(p=>{
      const events=editEvent==="new"?[...p.events,ev]:p.events.map(e=>e.id===ev.id?ev:e);
      return {...p,events};
    });
    setEditEvent(null);
  };
  const removeEvent=id=>setForm(p=>({...p,events:p.events.filter(e=>e.id!==id)}));

  return (
    <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:10,
      padding:"clamp(20px,4vw,32px)",marginBottom:20}}>
      <h3 style={{fontFamily:T.font,fontSize:20,fontWeight:700,color:T.white,marginBottom:20}}>
        {existing?"Edit Collection":"New Collection"}
      </h3>

      <Field label="Collection Name">
        <Input value={form.name} onChange={e=>set("name",e.target.value)}
          placeholder="e.g. Ancestral Frequencies" />
      </Field>

      <Field label="OpenSea Collection Slug" hint="opensea.io/collection/SLUG — used to auto-fetch NFTs">
        <Input value={form.openSeaSlug||""} onChange={e=>set("openSeaSlug",e.target.value)}
          placeholder="e.g. boredapeyachtclub" />
      </Field>

      {/* Creator picker */}
      <Field label="Creator Name">
        <div style={{display:"flex",gap:8,position:"relative"}}>
          <div style={{flex:1}}>
            <Input value={form.creator} onChange={e=>set("creator",e.target.value)}
              placeholder="Creator name" />
          </div>
          {profiles.length>0&&(
            <button onClick={()=>setShowDrop(p=>!p)}
              style={{background:"rgba(201,169,110,0.1)",border:`1px solid ${T.gold}44`,
                borderRadius:6,padding:"0 12px",color:T.gold,cursor:"pointer",
                fontFamily:T.mono,fontSize:11,fontWeight:700,whiteSpace:"nowrap",
                flexShrink:0}}>
              Pick ▾
            </button>
          )}
          {showDrop&&profiles.length>0&&(
            <div className="glass-h" style={{position:"absolute",top:"calc(100%+6px)",left:0,
              right:0,border:`1px solid ${T.border}`,borderRadius:10,zIndex:50,
              overflow:"hidden",maxHeight:220,overflowY:"auto",
              boxShadow:"0 16px 40px rgba(0,0,0,0.8)"}}>
              {profiles.map(p=>(
                <div key={p.username}
                  onClick={()=>{set("creator",p.displayName||p.username);setShowDrop(false);}}
                  style={{padding:"11px 16px",cursor:"pointer",display:"flex",
                    alignItems:"center",gap:10,borderBottom:`1px solid ${T.border}`,
                    transition:"background 0.12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <AnimatedAvatar avatar={p.avatar||{type:"symbol",value:"◆"}}
                    zodiac={p.zodiac} size={28} border={false} />
                  <div>
                    <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white}}>
                      {p.displayName||p.username}
                    </div>
                    <div style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>
                      @{p.username} 👑
                    </div>
                  </div>
                </div>
              ))}
              <div onClick={()=>setShowDrop(false)}
                style={{padding:"11px 16px",cursor:"pointer",fontFamily:T.mono,
                  fontSize:11,color:T.muted,borderTop:`1px solid ${T.border}`}}>
                ✎ Enter name manually
              </div>
            </div>
          )}
        </div>
      </Field>

      {/* Creator role */}
      <Field label="Creator Role">
        {!showCustom?(
          <div style={{display:"flex",gap:8}}>
            <Select value={form.role} onChange={e=>set("role",e.target.value)} style={{flex:1}}>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </Select>
            <button onClick={()=>setShowCustom(true)}
              style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                borderRadius:6,padding:"0 12px",color:T.muted,cursor:"pointer",
                fontFamily:T.mono,fontSize:11,fontWeight:700,whiteSpace:"nowrap",
                flexShrink:0}}>
              + New
            </button>
          </div>
        ):(
          <div style={{display:"flex",gap:8}}>
            <Input value={customRole} onChange={e=>setCustomRole(e.target.value)}
              placeholder="Enter custom role…" style={{flex:1}} />
            <Btn size="sm" onClick={()=>{if(customRole.trim()){set("role",customRole.trim());setShowCustom(false);}}}>
              Add
            </Btn>
            <Btn variant="ghost" size="sm" onClick={()=>setShowCustom(false)}>Cancel</Btn>
          </div>
        )}
      </Field>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Symbol / Emoji">
          <Input value={form.avatar} onChange={e=>set("avatar",e.target.value)} placeholder="◈ ♪ ∞" />
        </Field>
        <Field label="Accent Color">
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="color" value={form.accent} onChange={e=>set("accent",e.target.value)}
              style={{width:44,height:44,borderRadius:6,border:"none",
                background:"none",cursor:"pointer",padding:0}} />
            <Input value={form.accent} onChange={e=>set("accent",e.target.value)}
              placeholder="#c9a96e" style={{flex:1}} />
          </div>
        </Field>
      </div>

      <Field label="Description">
        <Textarea value={form.description} onChange={e=>set("description",e.target.value)}
          placeholder="What is this collection about?" rows={2} />
      </Field>

      <Divider style={{margin:"4px 0 20px"}} />

      {/* NFTs */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:"#a09cbc",
            letterSpacing:"0.08em",textTransform:"uppercase"}}>
            NFTs ({form.nfts.length})
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" size="sm" onClick={()=>setImportNFT(p=>!p)}>
              🌊 OpenSea
            </Btn>
            <Btn variant="ghost" size="sm" onClick={()=>setEditNFT("new")}>+ New NFT</Btn>
          </div>
        </div>

        {importNFT&&(
          <OpenSeaImport onImport={importNFTFn} ethRate={ethRate} />
        )}

        {editNFT&&(
          <NFTEditor
            nft={editNFT==="new"?null:editNFT}
            onSave={saveNFT}
            onCancel={()=>setEditNFT(null)}
            ethRate={ethRate} />
        )}

        {form.nfts.length===0&&!editNFT&&!importNFT&&(
          <p style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>
            No NFTs yet. Import from OpenSea or create manually.
          </p>
        )}

        {form.nfts.map((nft,i)=>(
          <div key={nft.id} style={{display:"flex",alignItems:"center",gap:12,
            padding:"12px 14px",border:`1px solid ${T.border}`,borderRadius:8,
            marginBottom:8,background:"rgba(255,255,255,0.02)"}}>
            <div style={{width:40,height:40,borderRadius:6,overflow:"hidden",flexShrink:0,
              background:nft.bg||T.dim,display:"flex",alignItems:"center",
              justifyContent:"center",fontFamily:T.font,fontSize:20,color:T.gold}}>
              {nft.imageUrl
                ?<img src={nft.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                :nft.image}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {nft.name||"Unnamed"}
              </div>
              <div style={{display:"flex",gap:8,marginTop:2,flexWrap:"wrap"}}>
                <span style={{fontFamily:T.mono,fontSize:10,color:T.gold}}>{nft.price} ETH</span>
                <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>GHS {nft.momoPrice}</span>
                <Tag color={nft.rarity==="Legendary"?"#e8c87c":nft.rarity==="Epic"?"#b8a0c8":T.gold}>
                  {nft.rarity}
                </Tag>
                {nft.openSeaLink&&<span style={{fontFamily:T.mono,fontSize:9,color:T.muted}}>🌊 OpenSea</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>setEditNFT(nft)}
                style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                  borderRadius:6,padding:"6px 12px",color:T.muted,fontFamily:T.sans,
                  fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"uppercase",
                  letterSpacing:"0.06em"}}>Edit</button>
              <button onClick={()=>removeNFT(nft.id)}
                style={{background:"rgba(196,106,106,0.08)",border:`1px solid ${T.red}33`,
                  borderRadius:6,padding:"6px 12px",color:T.red,cursor:"pointer",fontSize:13}}>×</button>
            </div>
          </div>
        ))}
      </div>

      <Divider style={{margin:"4px 0 20px"}} />

      {/* Events */}
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:"#a09cbc",
            letterSpacing:"0.08em",textTransform:"uppercase"}}>
            Events ({form.events.length})
          </div>
          <Btn variant="ghost" size="sm" onClick={()=>setEditEvent("new")}>+ New Event</Btn>
        </div>
        {editEvent&&(
          <EventEditor
            event={editEvent==="new"?null:editEvent}
            onSave={saveEvent}
            onCancel={()=>setEditEvent(null)} />
        )}
        {form.events.map(ev=>(
          <div key={ev.id} style={{display:"flex",alignItems:"center",gap:12,
            padding:"12px 14px",border:`1px solid ${T.border}`,borderRadius:8,
            marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.white}}>
                {ev.title}
              </div>
              <div style={{fontFamily:T.mono,fontSize:10,color:T.gold,marginTop:2}}>
                {ev.date} · {ev.location}
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setEditEvent(ev)}
                style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                  borderRadius:6,padding:"6px 12px",color:T.muted,fontFamily:T.sans,
                  fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"uppercase"}}>Edit</button>
              <button onClick={()=>removeEvent(ev.id)}
                style={{background:"rgba(196,106,106,0.08)",border:`1px solid ${T.red}33`,
                  borderRadius:6,padding:"6px 12px",color:T.red,cursor:"pointer"}}>×</button>
            </div>
          </div>
        ))}
        {form.events.length===0&&!editEvent&&(
          <p style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>No events yet.</p>
        )}
      </div>

      <div style={{display:"flex",gap:10}}>
        <Btn onClick={()=>onSave(form)}>Save Collection</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── Moderation Tab ────────────────────────────────────────────────────────────
function ModerationTab({ posts, flaggedUsers, verifiedUsers, onBlockPost, onFlagUser, onVerify, onPin, onDeletePost, onWarn }) {
  const [search, setSearch] = useState("");

  const safePosts = Array.isArray(posts) ? posts : [];
  const users = [];
  const seen = new Set();
  safePosts.forEach(p=>{
    if(p?.username&&!seen.has(p.username)){
      seen.add(p.username);
      users.push({ username:p.username, user:p.user, avatar:p.avatar });
    }
  });
  const filtered = users.filter(u=>u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* User management */}
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,
          textTransform:"uppercase",marginBottom:12}}>User Management</div>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search @username…"
          style={{width:"100%",background:"rgba(255,255,255,0.04)",
            border:`1px solid ${T.border}`,borderRadius:8,padding:"11px 14px",
            color:T.white,fontFamily:T.sans,fontSize:13,outline:"none",marginBottom:14}}
          onFocus={e=>e.target.style.borderColor=T.gold}
          onBlur={e=>e.target.style.borderColor=T.border} />

        {filtered.length===0&&(
          <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:14}}>
            {search?"No users match that search.":"No users have posted yet."}
          </p>
        )}

        {filtered.map(u=>(
          <div key={u.username} className="glass"
            style={{border:`1px solid ${T.border}`,borderRadius:8,
              padding:"14px 18px",marginBottom:8,
              display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <AnimatedAvatar avatar={u.avatar||{type:"symbol",value:"◆"}}
              zodiac={null} size={34} border={false} />
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontFamily:T.mono,fontSize:13,color:T.white,fontWeight:700}}>
                @{u.username}
              </div>
              {u.user&&<div style={{fontFamily:T.sans,fontSize:11,color:T.muted}}>{u.user}</div>}
              <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                {verifiedUsers[u.username]&&(
                  <span style={{fontFamily:T.mono,fontSize:9,color:T.green}}>👑 Verified</span>
                )}
                {flaggedUsers[u.username]&&(
                  <span style={{fontFamily:T.mono,fontSize:9,color:T.flag}}>
                    ❓ Flagged · {flaggedUsers[u.username]?.at||""}
                  </span>
                )}
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>onVerify&&onVerify(u.username)}
                style={{background:verifiedUsers[u.username]?"rgba(106,170,136,0.15)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${verifiedUsers[u.username]?T.green:T.border}`,borderRadius:6,
                  padding:"7px 13px",color:verifiedUsers[u.username]?T.green:T.muted,
                  fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {verifiedUsers[u.username]?"✓ Verified":"Verify"}
              </button>
              <button onClick={()=>onFlagUser&&onFlagUser(u.username)}
                style={{background:flaggedUsers[u.username]?"rgba(224,160,48,0.12)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${flaggedUsers[u.username]?T.flag:T.border}`,borderRadius:6,
                  padding:"7px 13px",color:flaggedUsers[u.username]?T.flag:T.muted,
                  fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {flaggedUsers[u.username]?"✕ Unflag":"Flag"}
              </button>
              <button onClick={()=>onWarn&&onWarn(u.username)}
                style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                  borderRadius:6,padding:"7px 13px",color:T.muted,
                  fontFamily:T.sans,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                ⚠️
              </button>
            </div>
          </div>
        ))}
      </div>

      <Divider style={{margin:"4px 0 24px"}} />

      {/* Post moderation */}
      <div>
        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,
          textTransform:"uppercase",marginBottom:14}}>Post Moderation</div>
        {safePosts.length===0&&(
          <p style={{fontFamily:T.font,fontStyle:"italic",color:T.muted,fontSize:14}}>
            No posts yet.
          </p>
        )}
        {safePosts.slice(0,50).map(p=>(
          <div key={p.id} className="glass"
            style={{border:`1px solid ${p.blocked?T.red+"33":T.border}`,
              borderRadius:8,padding:"12px 16px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",
              alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:T.sans,fontSize:12,fontWeight:700,
                  color:T.white,marginBottom:3,display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span>@{p.username||"anon"}</span>
                  {p.pinned&&<span style={{fontFamily:T.mono,fontSize:10,color:T.gold}}>📌</span>}
                  {p.blocked&&<span style={{fontFamily:T.mono,fontSize:10,color:T.red}}>🚫</span>}
                </div>
                <div style={{fontFamily:T.sans,fontSize:12,color:T.muted,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:260}}>
                  {p.text||p.comment||"[no text]"}
                </div>
                <div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:3}}>
                  ♥ {p.likes||0} · 💬 {p.commentCount||p.comments||0}
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>onPin&&onPin(p.id)}
                  style={{background:p.pinned?"rgba(201,169,110,0.12)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${p.pinned?T.gold:T.border}`,borderRadius:6,
                    padding:"6px 11px",color:p.pinned?T.gold:T.muted,
                    fontFamily:T.sans,fontSize:11,cursor:"pointer"}}>
                  {p.pinned?"Unpin":"📌"}
                </button>
                <button onClick={()=>onBlockPost&&onBlockPost(p.id)}
                  style={{background:p.blocked?"rgba(196,106,106,0.12)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${p.blocked?T.red:T.border}`,borderRadius:6,
                    padding:"6px 11px",color:p.blocked?T.red:T.muted,
                    fontFamily:T.sans,fontSize:11,cursor:"pointer"}}>
                  {p.blocked?"Unblock":"🚫"}
                </button>
                <button onClick={()=>onDeletePost&&onDeletePost(p.id)}
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

// ── Main AdminPanel ───────────────────────────────────────────────────────────
export default function AdminPanel({
  collections=[],
  setCollections,
  posts=[],
  verifiedUsers={},
  flaggedUsers={},
  onBlockPost, onFlagUser, onVerify, onPin, onDeletePost, onWarn,
}) {
  const [tab,setTab]         = useState("collections");
  const [editing,setEditing] = useState(null);
  const [creating,setCreating]=useState(false);
  const [saving,setSaving]   = useState(false);
  const [ethRate,setEthRate] = useState(null);

  // Load live ETH rate on mount
  useEffect(()=>{
    getEthGhsRate().then(setEthRate);
  },[]);

  const verifiedProfiles = Object.entries(verifiedUsers||{})
    .filter(([,v])=>v)
    .map(([username])=>{
      const post=(posts||[]).find(p=>p?.username===username);
      return {
        username,
        displayName: post?.user||username,
        avatar: post?.avatar||{type:"symbol",value:"◆"},
        zodiac: post?.zodiac||null,
      };
    });

  const handleSave = async data=>{
    setSaving(true);
    try {
      if(editing){
        const updated={...data,id:editing.id};
        await saveCollection(updated);
        setCollections(prev=>prev.map(c=>c.id===editing.id?updated:c));
      } else {
        const newId=await saveCollection(data);
        setCollections(prev=>[...prev,{...data,id:newId}]);
      }
    } catch(e){
      if(editing) setCollections(prev=>prev.map(c=>c.id===editing.id?{...data,id:editing.id}:c));
      else setCollections(prev=>[...prev,{...data,id:"c_"+Date.now()}]);
    }
    setSaving(false);
    setEditing(null);
    setCreating(false);
  };

  const handleDelete=async id=>{
    if(!window.confirm("Delete this collection?")) return;
    try{ await deleteCollection(id); }catch(e){}
    setCollections(prev=>prev.filter(c=>c.id!==id));
  };

  const TABS=[["collections","Collections"],["moderation","🛡 Moderation"]];

  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(14px,4vw,28px)"}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:T.font,fontSize:"clamp(22px,5vw,34px)",fontWeight:700,
          color:T.white,marginBottom:4}}>Admin Panel</h2>
        <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.mono,fontSize:11,color:T.muted}}>
          <span>PARADISE on Earth</span>
          <span>·</span>
          <span className="god-text" style={{color:T.gold}}>GOD🤎 @humble_servant</span>
          {ethRate&&(
            <>
              <span>·</span>
              <span style={{color:T.green}}>ETH ${ethRate.usd?.toLocaleString()} · GHS {ethRate.ghs?.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>

      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,
        marginBottom:28,overflowX:"auto",scrollbarWidth:"none"}}>
        {TABS.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{background:"none",border:"none",
              borderBottom:tab===t?`2px solid ${T.gold}`:"2px solid transparent",
              color:tab===t?T.gold:T.muted,fontFamily:T.sans,fontSize:12,fontWeight:700,
              letterSpacing:"0.08em",textTransform:"uppercase",
              padding:"0 0 13px",marginRight:24,marginBottom:-1,
              cursor:"pointer",whiteSpace:"nowrap",transition:"color 0.18s"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Collections tab */}
      {tab==="collections"&&(
        <div>
          {(creating||editing)?(
            <CollectionEditor
              existing={editing}
              verifiedProfiles={verifiedProfiles}
              onSave={handleSave}
              onCancel={()=>{setCreating(false);setEditing(null);}}
              ethRate={ethRate} />
          ):(
            <>
              <div style={{marginBottom:20}}>
                <button onClick={()=>setCreating(true)}
                  style={{background:T.gold,border:"none",borderRadius:8,
                    padding:"11px 24px",color:"#08080e",fontFamily:T.sans,
                    fontSize:12,fontWeight:700,letterSpacing:"0.1em",
                    textTransform:"uppercase",cursor:"pointer",
                    boxShadow:`0 4px 20px ${T.gold}44`}}>
                  + New Collection
                </button>
              </div>

              {(collections||[]).length===0&&(
                <div style={{textAlign:"center",padding:"60px 0",fontFamily:T.font,
                  fontStyle:"italic",color:T.muted,fontSize:16}}>
                  No collections yet. Create your first.
                </div>
              )}

              <div style={{display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,280px),1fr))",gap:14}}>
                {(collections||[]).map(c=>(
                  <div key={c.id} className="glass"
                    style={{border:`1px solid ${c.accent||T.gold}22`,borderRadius:10,padding:"18px"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                      <div style={{width:44,height:44,borderRadius:"50%",
                        border:`2px solid ${c.accent||T.gold}44`,display:"flex",
                        alignItems:"center",justifyContent:"center",
                        fontFamily:T.font,fontSize:22,color:c.accent||T.gold,flexShrink:0}}>
                        {c.avatar}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:T.font,fontSize:14,fontWeight:700,color:T.white,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {c.name}
                        </div>
                        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginTop:2}}>
                          {c.creator} · {c.role}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:12,fontFamily:T.mono,fontSize:10,
                      color:T.dim,marginBottom:14}}>
                      <span>{c.nfts?.length||0} NFTs</span>
                      <span>{c.events?.length||0} events</span>
                      {c.openSeaSlug&&<span>🌊 {c.openSeaSlug}</span>}
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
                      <button onClick={()=>handleDelete(c.id)}
                        style={{background:"rgba(196,106,106,0.07)",
                          border:`1px solid ${T.red}33`,borderRadius:7,
                          padding:"8px 14px",color:T.red,cursor:"pointer",fontSize:14}}>
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

      {/* Moderation tab */}
      {tab==="moderation"&&(
        <ModerationTab
          posts={posts||[]}
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
