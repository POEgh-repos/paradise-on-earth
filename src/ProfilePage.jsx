import { useState, useRef } from "react";
import { T, Btn, Divider, Field, Input, Textarea, Toast, AnimatedAvatar } from "./tokens";
import { ZODIAC_SIGNS } from "./zodiac";

// ── AvatarDisplay (shared export) ─────────────────────────────────────────────
export function AvatarDisplay({ avatar, zodiac, size=40, border=true, onClick }) {
  return <AnimatedAvatar avatar={avatar} zodiac={zodiac} size={size} border={border} onClick={onClick} />;
}

// ── Banner upload ─────────────────────────────────────────────────────────────
function BannerPicker({ current, coverColor, setCoverColor, onSelect }) {
  const fileRef = useRef();
  const PRESETS = ["#12100a","#0a120c","#08060d","#0d0608","#060a1a","#0a0a14","#1a0a08","#080d1a"];
  return (
    <div>
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Colour Presets</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {PRESETS.map(c=>(
            <button key={c} onClick={()=>setCoverColor(c)} style={{width:36,height:36,borderRadius:4,background:`linear-gradient(135deg,${c},${c}88)`,border:`2px solid ${coverColor===c?T.gold:"transparent"}`,cursor:"pointer",transition:`border-color 0.18s`}} />
          ))}
          <input type="color" value={coverColor} onChange={e=>setCoverColor(e.target.value)} style={{width:36,height:36,borderRadius:4,border:`1px solid ${T.border}`,cursor:"pointer",background:"none",padding:2}} />
          <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>Custom</span>
        </div>
      </div>
      <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Or Upload Banner Image</div>
      <div onClick={()=>fileRef.current.click()} style={{border:`1px dashed ${T.border}`,borderRadius:6,overflow:"hidden",cursor:"pointer",transition:`border-color 0.18s`,position:"relative"}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
        onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
        {current?.data
          ? <img src={current.data} alt="banner" style={{width:"100%",height:100,objectFit:"cover",display:"block"}} />
          : <div style={{height:80,background:`linear-gradient(135deg,${coverColor},${coverColor}66,${T.bg})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:11,color:T.muted}}>Click to upload banner (high-res recommended)</div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
        const f=e.target.files[0]; if(!f)return;
        const r=new FileReader(); r.onload=ev=>onSelect({name:f.name,data:ev.target.result}); r.readAsDataURL(f);
      }} />
    </div>
  );
}

// ── Avatar Picker ─────────────────────────────────────────────────────────────
function AvatarPicker({ current, onSelect }) {
  const [mode,setMode]=useState("zodiac");
  const fileRef=useRef();
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["zodiac","Zodiac"],["upload","Photo"]].map(([m,l])=>(
          <Btn key={m} variant={mode===m?"gold":"ghost"} size="sm" onClick={()=>setMode(m)}>{l}</Btn>
        ))}
      </div>
      {mode==="zodiac"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8}}>
          {ZODIAC_SIGNS.map(z=>(
            <button key={z.sign} onClick={()=>onSelect({type:"zodiac",value:z.sign,symbol:z.symbol})}
              style={{background:current?.value===z.sign?"rgba(201,169,110,0.14)":"rgba(255,255,255,0.03)",border:`1px solid ${current?.value===z.sign?T.gold:T.border}`,borderRadius:6,padding:"10px 6px",cursor:"pointer",textAlign:"center",transition:`all 0.18s`}}>
              <div style={{fontFamily:T.font,fontSize:22,color:T.gold,lineHeight:1,marginBottom:4}}>{z.symbol}</div>
              <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:0.5}}>{z.sign}</div>
            </button>
          ))}
        </div>
      )}
      {mode==="upload"&&(
        <div>
          <div onClick={()=>fileRef.current.click()} style={{border:`1px dashed ${T.border}`,borderRadius:6,padding:"28px 20px",textAlign:"center",cursor:"pointer",transition:`border-color 0.18s`}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            {current?.type==="photo"
              ?<div><img src={current.value} alt="avatar" style={{width:70,height:70,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.gold}`,marginBottom:10}} /><div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>Click to replace</div></div>
              :<div><div style={{fontFamily:T.font,fontSize:32,color:T.dim,marginBottom:8}}>◎</div><div style={{fontFamily:T.sans,fontSize:14,color:T.muted}}>Upload high-res profile photo</div><div style={{fontFamily:T.mono,fontSize:10,color:T.dim,marginTop:4}}>JPG · PNG · WEBP — any resolution</div></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
            const f=e.target.files[0]; if(!f)return;
            const r=new FileReader(); r.onload=ev=>onSelect({type:"photo",value:ev.target.result}); r.readAsDataURL(f);
          }} />
          {current?.type==="photo"&&(
            <div style={{marginTop:10,padding:"10px 0",fontFamily:T.mono,fontSize:10,color:T.muted}}>
              Your zodiac will animate alternately with this photo every 3 seconds.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
export default function ProfilePage({ user, onUpdateUser, onGoToFeed, onLogout }) {
  const [tab,setTab]                 = useState("profile");
  const [displayName,setDisplayName] = useState(user?.profile?.displayName||user?.name||"");
  const [username,setUsername]       = useState(user?.profile?.username||"");
  const [bio,setBio]                 = useState(user?.profile?.bio||"");
  const [location,setLocation]       = useState(user?.profile?.location||"");
  const [website,setWebsite]         = useState(user?.profile?.website||"");
  const [avatar,setAvatar]           = useState(user?.profile?.avatar||{type:"zodiac",value:"Leo",symbol:"♌"});
  const [zodiac,setZodiac]           = useState(user?.profile?.zodiac||null);
  const [coverColor,setCoverColor]   = useState(user?.profile?.coverColor||"#12100a");
  const [banner,setBanner]           = useState(user?.profile?.banner||null);
  const [usernameErr,setUsernameErr] = useState("");
  const [toast,setToast]             = useState(null);

  if(!user) return(
    <div style={{maxWidth:480,margin:"80px auto",textAlign:"center",padding:40}}>
      <div style={{fontFamily:T.font,fontSize:40,color:T.dim,marginBottom:24}}>◎</div>
      <h2 style={{fontFamily:T.font,fontSize:26,fontWeight:700,color:T.white,marginBottom:12}}>Sign In First</h2>
    </div>
  );

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2600);};
  const validateUsername=val=>{const c=val.toLowerCase().replace(/[^a-z0-9_.]/g,"");setUsername(c);setUsernameErr(c.length>0&&c.length<3?"At least 3 characters":"");};

  // When zodiac sign is selected, update both avatar symbol and zodiac
  const handleAvatarSelect=av=>{
    setAvatar(av);
    if(av.type==="zodiac") setZodiac({sign:av.value,symbol:av.symbol});
  };

  const handleSave=()=>{
    if(usernameErr||!displayName.trim()){showToast("Display name required","error");return;}
    const zodiacData = avatar.type==="zodiac"?{sign:avatar.value,symbol:avatar.symbol}:zodiac;
    onUpdateUser({...user,name:displayName,avatar:avatar.symbol||avatar.value,
      profile:{displayName,username,bio,location,website,avatar,zodiac:zodiacData,coverColor,banner}});
    showToast("Profile saved ✓");
  };

  const TABS=[["profile","Profile"],["appearance","Appearance"],["account","Account"]];
  const zodiacDisplay = avatar.type==="zodiac"?avatar:{type:"zodiac",value:zodiac?.sign||"Leo",symbol:zodiac?.symbol||"♌"};

  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"0 16px 100px",animation:`fadeUp 0.36s ${T.smooth} both`}}>
      {toast&&<Toast msg={toast.msg} type={toast.type} />}

      {/* Preview card */}
      <div className="glass" style={{marginBottom:28,borderRadius:10,overflow:"hidden",border:`1px solid ${T.border}`}}>
        <div style={{height:110,background:banner?.data?`url(${banner.data}) center/cover`:`linear-gradient(135deg,${coverColor},${coverColor}88,${T.bg})`,position:"relative"}}>
          <div style={{position:"absolute",bottom:-24,left:20}}>
            <AnimatedAvatar avatar={avatar} zodiac={zodiac} size={54} border />
          </div>
        </div>
        <div style={{padding:"36px 22px 18px"}}>
          <div style={{fontFamily:T.font,fontSize:22,fontWeight:700,color:T.white}}>{displayName||"Your Name"}</div>
          {username&&<div style={{fontFamily:T.mono,fontSize:12,color:T.gold,marginTop:2}}>@{username}</div>}
          {zodiac&&<div style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginTop:4}}>{zodiac.symbol} {zodiac.sign}</div>}
          {bio&&<p style={{fontFamily:T.sans,fontSize:13,color:T.muted,marginTop:8,lineHeight:1.7}}>{bio}</p>}
          <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap"}}>
            {location&&<span style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>◎ {location}</span>}
            {website&&<span style={{fontFamily:T.mono,fontSize:11,color:T.gold}}>↗ {website}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:28}}>
        {TABS.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",borderBottom:tab===k?`2px solid ${T.gold}`:"2px solid transparent",color:tab===k?T.gold:"#999",fontFamily:T.mono,fontSize:11,fontWeight:tab===k?700:400,letterSpacing:2,textTransform:"uppercase",padding:"0 0 12px",marginRight:22,marginBottom:-1,transition:`all 0.18s ${T.smooth}`,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {tab==="profile"&&(
        <div style={{animation:`fadeIn 0.28s ${T.smooth} both`}}>
          <Field label="Avatar & Zodiac Sign" hint="Select your zodiac — it shows as your avatar symbol. Upload a photo and it will animate alternately with your zodiac every 3 seconds.">
            <AvatarPicker current={avatar} onSelect={handleAvatarSelect} />
          </Field>
          <Divider style={{margin:"22px 0"}} />
          <Field label="Display Name" hint="Shown on posts and profile.">
            <div style={{position:"relative"}}>
              <Input value={displayName} onChange={e=>setDisplayName(e.target.value.slice(0,50))} placeholder="Your name" />
              <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontFamily:T.mono,fontSize:10,color:T.dim}}>{displayName.length}/50</span>
            </div>
          </Field>
          <Field label="Username" hint="Letters, numbers, dots, underscores. Used for @mentions.">
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:T.mono,fontSize:14,color:T.muted}}>@</span>
              <Input value={username} onChange={e=>validateUsername(e.target.value)} placeholder="yourhandle" style={{paddingLeft:28}} />
            </div>
            {usernameErr&&<p style={{fontFamily:T.mono,fontSize:10,color:T.red,marginTop:4}}>{usernameErr}</p>}
          </Field>
          <Field label="Bio" hint="Max 200 characters.">
            <div style={{position:"relative"}}>
              <Textarea value={bio} onChange={e=>setBio(e.target.value.slice(0,200))} placeholder="A few words about yourself…" rows={3} />
              <span style={{position:"absolute",bottom:10,right:12,fontFamily:T.mono,fontSize:10,color:T.dim}}>{bio.length}/200</span>
            </div>
          </Field>
          <Field label="Location"><Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Accra, Ghana" /></Field>
          <Field label="Website"><Input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yoursite.com" /></Field>
        </div>
      )}

      {tab==="appearance"&&(
        <div style={{animation:`fadeIn 0.28s ${T.smooth} both`}}>
          <Field label="Profile Banner">
            <BannerPicker current={banner} coverColor={coverColor} setCoverColor={setCoverColor} onSelect={setBanner} />
          </Field>
          <Divider style={{margin:"22px 0"}} />
          <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:20}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Preview</div>
            <div style={{height:70,background:banner?.data?`url(${banner.data}) center/cover`:`linear-gradient(135deg,${coverColor},${coverColor}66,${T.bg})`,borderRadius:4,position:"relative",marginBottom:8}}>
              <div style={{position:"absolute",bottom:-18,left:14}}>
                <AnimatedAvatar avatar={avatar} zodiac={zodiac} size={38} border />
              </div>
            </div>
            <div style={{paddingTop:24,paddingLeft:2}}>
              <div style={{fontFamily:T.font,fontSize:18,fontWeight:700,color:T.white}}>{displayName||"Your Name"}</div>
              {username&&<div style={{fontFamily:T.mono,fontSize:11,color:T.gold}}>@{username}</div>}
              {zodiac&&<div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginTop:2}}>{zodiac.symbol} {zodiac.sign}</div>}
            </div>
          </div>
        </div>
      )}

      {tab==="account"&&(
        <div style={{animation:`fadeIn 0.28s ${T.smooth} both`}}>
          <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:22,marginBottom:14}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Connected Account</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",border:`1px solid ${T.gold}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,fontSize:20,color:T.gold}}>{user.provider==="google"?"◉":"◈"}</div>
              <div><div style={{fontFamily:T.sans,fontSize:14,color:T.white,fontWeight:700}}>{user.name}</div><div style={{fontFamily:T.mono,fontSize:11,color:T.muted}}>{user.provider==="google"?"Google Account":"Apple Account"}</div></div>
              <div style={{marginLeft:"auto"}}><span style={{fontFamily:T.mono,fontSize:10,color:T.green,border:`1px solid ${T.green}44`,borderRadius:2,padding:"4px 10px"}}>Connected</span></div>
            </div>
          </div>
          <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:22,marginBottom:14}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Polygon Wallet</div>
            <div style={{fontFamily:T.mono,fontSize:13,color:T.gold,wordBreak:"break-all"}}>{user.wallet}</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,marginTop:5}}>Auto-assigned · Polygon Network · Non-custodial</div>
          </div>
          <div className="glass" style={{border:`1px solid ${T.border}`,borderRadius:6,padding:22,marginBottom:14}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Session</div>
            <Btn variant="ghost" full onClick={onLogout}>Sign Out</Btn>
          </div>
          <div style={{border:`1px solid rgba(196,106,106,0.2)`,borderRadius:6,padding:22}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.red,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Danger Zone</div>
            <p style={{fontFamily:T.sans,fontSize:13,color:T.muted,marginBottom:16,lineHeight:1.7}}>Deleting your account is permanent and cannot be undone.</p>
            <Btn variant="danger" onClick={()=>alert("Connect to backend to enable account deletion.")}>Delete Account</Btn>
          </div>
        </div>
      )}

      <Divider style={{margin:"28px 0 22px"}} />
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onGoToFeed}>Cancel</Btn>
        <Btn onClick={handleSave}>Save Profile</Btn>
      </div>
    </div>
  );
}
