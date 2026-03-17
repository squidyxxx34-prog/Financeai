import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const INTERVALS = ["1m","5m","15m","1H","4H","1D","1W"];
const ASSETS = ["BTC/USD","ETH/USD","SOL/USD","AAPL","TSLA","NVDA","MSFT","EUR/USD","GBP/USD","XAU/USD","SPX500","NDX100"];

const SIG = {
  BUY:  { label:"BUY",  icon:"↑", grad:"linear-gradient(135deg,#00c97a,#00e5a0)", glow:"rgba(0,201,122,.4)",  text:"#00e5a0", bg:"rgba(0,201,122,.08)",  border:"rgba(0,201,122,.22)", pct:78 },
  SELL: { label:"SELL", icon:"↓", grad:"linear-gradient(135deg,#ff3d5a,#ff6b81)", glow:"rgba(255,61,90,.4)",  text:"#ff5c73", bg:"rgba(255,61,90,.08)",  border:"rgba(255,61,90,.22)",  pct:72 },
  WAIT: { label:"WAIT", icon:"→", grad:"linear-gradient(135deg,#f5a623,#ffd166)", glow:"rgba(245,166,35,.4)", text:"#ffc14d", bg:"rgba(245,166,35,.08)", border:"rgba(245,166,35,.22)", pct:55 },
};

/* ── hooks ── */
function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

function useTypewriter(text, speed = 5) {
  const [d, setD] = useState(""); const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) return; setD(""); setDone(false); let i = 0;
    const id = setInterval(() => { i++; setD(text.slice(0,i)); if(i>=text.length){clearInterval(id);setDone(true);} }, speed);
    return () => clearInterval(id);
  }, [text]);
  return { displayed: d, done };
}

/* ── shared components ── */
function Label({ children, small }) {
  return <div style={{ fontSize:small?9:10, color:"#3a3a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:6, paddingLeft:2 }}>{children}</div>;
}

function SignalPill({ signal, compact }) {
  const s = SIG[signal]; if (!s) return null;
  const sz = compact ? 36 : 42, br = compact ? 10 : 12;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:compact?12:16, padding:compact?"12px 14px":"16px 20px", background:s.bg, border:`1px solid ${s.border}`, borderRadius:compact?14:16, marginBottom:compact?14:20 }}>
      <div style={{ width:sz, height:sz, borderRadius:br, background:s.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:compact?16:20, color:"#fff", fontWeight:800, boxShadow:`0 6px 20px ${s.glow}`, flexShrink:0 }}>{s.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:compact?11:13, fontWeight:700, color:s.text, letterSpacing:2, marginBottom:6 }}>SIGNAL {s.label}</div>
        <div style={{ height:3, background:"rgba(255,255,255,.06)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${s.pct}%`, background:s.grad, borderRadius:99, animation:"growBar .8s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>
      <div style={{ fontSize:compact?18:22, fontWeight:800, color:s.text, minWidth:36, textAlign:"right" }}>{s.pct}<span style={{fontSize:10,opacity:.5}}>%</span></div>
    </div>
  );
}

function AnalysisCard({ entry, compact }) {
  const { displayed, done } = useTypewriter(entry.analysis || "", 5);
  return (
    <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:compact?16:20, padding:compact?"16px":"20px 22px", marginBottom:12, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        {entry.asset    && <div style={{ background:"rgba(255,255,255,.07)", borderRadius:8, padding:"3px 10px", fontSize:compact?11:12, fontWeight:700, color:"#e0e0e0", letterSpacing:1 }}>{entry.asset}</div>}
        {entry.interval && <div style={{ background:"rgba(255,255,255,.04)", borderRadius:8, padding:"3px 8px", fontSize:10, color:"#555" }}>{entry.interval}</div>}
        <div style={{ marginLeft:"auto", fontSize:10, color:"#333" }}>{entry.time}</div>
      </div>
      {entry.userText && <div style={{ fontSize:12, color:"#555", marginBottom:12, paddingLeft:10, borderLeft:"2px solid #1e1e2e" }}>{entry.userText}</div>}
      {entry.image && (
        <div style={{ marginBottom:14, borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,.06)" }}>
          <img src={entry.image} alt="chart" style={{ width:"100%", maxHeight:compact?200:260, objectFit:"contain", display:"block", background:"#08080f" }} />
        </div>
      )}
      {entry.signal && <SignalPill signal={entry.signal} compact={compact} />}
      <div style={{ fontSize:compact?12:13, color:"#777", lineHeight:1.85, whiteSpace:"pre-wrap", letterSpacing:.2 }}>
        {entry.loading
          ? <span style={{color:"#2a2a3a"}}>Analyse en cours…</span>
          : <>{displayed}{!done && <span style={{color:"#5566ff",animation:"blink .7s step-end infinite"}}>▌</span>}</>}
      </div>
    </div>
  );
}

function EmptyState({ mobile }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, minHeight: mobile ? "55vh" : 300 }}>
      <div style={{ width:mobile?72:80, height:mobile?72:80, borderRadius:mobile?20:24, background:"rgba(85,102,255,.08)", border:"1px solid rgba(85,102,255,.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:mobile?32:36 }}>📊</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:mobile?15:16, fontWeight:700, color:"#2a2a3a", marginBottom:8 }}>Prêt pour l'analyse</div>
        <div style={{ fontSize:12, color:"#222", lineHeight:2.2 }}>
          {mobile ? <>Appuyez sur ⊕ pour importer un graphique<br/>puis → pour lancer l'analyse IA</>
                  : <>Importez un graphique via ⊕<br/>Sélectionnez actif + intervalle<br/>Appuyez sur Analyser</>}
        </div>
      </div>
      {!mobile && <div style={{ fontSize:10, color:"#1e1e2e", letterSpacing:2, background:"rgba(255,255,255,.02)", padding:"8px 16px", borderRadius:99, border:"1px solid rgba(255,255,255,.04)" }}>CTRL + ENTER</div>}
    </div>
  );
}

function InputBar({ state, compact }) {
  const { query, setQuery, imageData, imagePreview, setImagePreview, setImageData, loading, run, fileRef, handleFile } = state;
  return (
    <div style={{ padding:compact?"12px 14px 24px":"16px 24px 20px", borderTop:"1px solid rgba(255,255,255,.05)", background:"rgba(10,10,20,.95)", backdropFilter:"blur(20px)", flexShrink:0, zIndex:10 }}>
      {imagePreview && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", marginBottom:10, background:"rgba(85,102,255,.07)", border:"1px solid rgba(85,102,255,.15)", borderRadius:12 }}>
          <img src={imagePreview} alt="" style={{ height:36, borderRadius:8, objectFit:"contain" }} />
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"#8899ff"}}>Graphique chargé</div><div style={{fontSize:10,color:"#444",marginTop:1}}>Prêt à analyser</div></div>
          <button onClick={()=>{setImagePreview(null);setImageData(null);}} style={{ background:"rgba(255,255,255,.05)", border:"none", borderRadius:99, width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", color:"#555", cursor:"pointer", fontSize:12 }}>✕</button>
        </div>
      )}
      <div style={{ display:"flex", gap:compact?8:10, alignItems:"center" }}>
        <button className="upload-btn" onClick={()=>fileRef.current.click()} style={{ width:compact?42:44, height:compact?42:44, borderRadius:12, background:"rgba(255,255,255,.03)", border:`1px solid ${imageData?"rgba(85,102,255,.35)":"rgba(255,255,255,.07)"}`, color:imageData?"#8899ff":"#444", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>⊕</button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}} />
        <textarea value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))run();}}
          placeholder={compact?"Question ou contexte…":"Question ou contexte supplémentaire (optionnel)…"}
          rows={1}
          style={{ flex:1, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, color:"#ccc", padding:compact?"10px 14px":"11px 16px", fontFamily:"'Outfit',sans-serif", fontSize:13, outline:"none", resize:"none", lineHeight:1.5, transition:"all .15s" }} />
        <button className="run-btn" onClick={run} disabled={loading||(!imageData&&!query.trim())} style={{ height:compact?42:44, padding:`0 ${compact?16:22}px`, borderRadius:12, background:"linear-gradient(135deg,#4455ee,#6677ff)", border:"none", color:"#fff", fontFamily:"'Outfit',sans-serif", fontSize:compact?12:13, fontWeight:700, cursor:"pointer", flexShrink:0, transition:"all .15s", boxShadow:"0 4px 16px rgba(85,102,255,.3)", display:"flex", alignItems:"center", gap:6 }}>
          {loading ? <span style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}} /> : compact ? "→" : "Analyser →"}
        </button>
      </div>
      {!compact && <div style={{marginTop:8,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:"#222"}}>PNG · JPG · WEBP · Llama 4 Scout (Groq)</span><span style={{fontSize:10,color:"#222"}}>Ctrl+Enter</span></div>}
    </div>
  );
}

/* ── sidebar shared ── */
function Sidebar({ state }) {
  const { entries, asset, setAsset, interval, setIntervalVal, assetOpen, setAssetOpen, sessionCount, sigCfg } = state;
  return (
    <div style={{ width:240, flexShrink:0, borderRight:"1px solid rgba(255,255,255,.05)", display:"flex", flexDirection:"column", padding:"20px 16px", gap:8, zIndex:1, background:"rgba(10,10,20,.9)", overflowY:"auto" }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,.05)", marginBottom:4 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#5566ff,#8899ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, boxShadow:"0 4px 14px rgba(85,102,255,.4)" }}>◈</div>
        <div><div style={{fontSize:14,fontWeight:800,color:"#e0e0e0"}}>FinTerm</div><div style={{fontSize:9,color:"#3a3a4a",letterSpacing:1}}>AI ANALYST · GROQ</div></div>
      </div>

      <Label>Actif</Label>
      <div style={{position:"relative"}}>
        <button onClick={()=>setAssetOpen(!assetOpen)} style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, color:"#e0e0e0", padding:"9px 14px", fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          {asset} <span style={{color:"#333",fontSize:9}}>{assetOpen?"▲":"▼"}</span>
        </button>
        {assetOpen && (
          <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:99, background:"#0f0f1a", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, overflow:"hidden", boxShadow:"0 16px 40px rgba(0,0,0,.7)" }}>
            {ASSETS.map(a=>(
              <div key={a} className="asset-item" onClick={()=>{setAsset(a);setAssetOpen(false);}} style={{ padding:"8px 14px", fontSize:12, color:a===asset?"#8899ff":"#555", cursor:"pointer", fontWeight:a===asset?700:400, transition:"all .12s" }}>{a}</div>
            ))}
          </div>
        )}
      </div>

      <Label>Intervalle</Label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }}>
        {INTERVALS.map(iv=>(
          <button key={iv} className="ivl" onClick={()=>setIntervalVal(iv)} style={{ padding:"6px 0", borderRadius:8, border:`1px solid ${interval===iv?"rgba(85,102,255,.4)":"rgba(255,255,255,.06)"}`, background:interval===iv?"rgba(85,102,255,.12)":"transparent", color:interval===iv?"#8899ff":"#444", fontSize:11, fontWeight:interval===iv?700:400, cursor:"pointer", transition:"all .12s", fontFamily:"'Outfit',sans-serif" }}>{iv}</button>
        ))}
      </div>

      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:14, padding:14, border:"1px solid rgba(255,255,255,.05)", marginTop:4 }}>
        <Label small>Dernier signal</Label>
        {sigCfg ? (
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
            <div style={{width:36,height:36,borderRadius:10,background:sigCfg.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",fontWeight:800,boxShadow:`0 4px 14px ${sigCfg.glow}`}}>{sigCfg.icon}</div>
            <div><div style={{fontSize:16,fontWeight:800,color:sigCfg.text}}>{sigCfg.label}</div><div style={{fontSize:10,color:"#444"}}>{sigCfg.pct}% confiance</div></div>
          </div>
        ) : <div style={{fontSize:12,color:"#2a2a3a",marginTop:8}}>— aucune analyse</div>}
      </div>

      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:14, padding:14, border:"1px solid rgba(255,255,255,.05)" }}>
        <Label small>Session</Label>
        {[["Analyses",sessionCount,"#666"],["BUY",entries.filter(e=>e.signal==="BUY").length,"#00e5a0"],["SELL",entries.filter(e=>e.signal==="SELL").length,"#ff5c73"],["WAIT",entries.filter(e=>e.signal==="WAIT").length,"#ffc14d"]].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
            <span style={{fontSize:11,color:"#444"}}>{l}</span><span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{marginTop:"auto",display:"flex",alignItems:"center",gap:8,padding:"10px 4px 0"}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#00e5a0",animation:"pulse 2s infinite"}} />
        <span style={{fontSize:10,color:"#2a2a3a",letterSpacing:1}}>GROQ · LLAMA 4 SCOUT · VISION</span>
      </div>
    </div>
  );
}

/* ── layouts ── */
function DesktopApp({ state }) {
  const { entries, bottomRef } = state;
  return (
    <div style={{background:"#0a0a0f",height:"100vh",display:"flex",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 60% 40% at 20% 0%,rgba(85,102,255,.06) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 80% 100%,rgba(0,201,122,.04) 0%,transparent 60%)"}} />
      <Sidebar state={state} />
      <div style={{flex:1,display:"flex",flexDirection:"column",zIndex:1,overflow:"hidden"}}>
        <div style={{padding:"18px 28px",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#e0e0e0"}}>Analyse de Marché</div>
            <div style={{fontSize:12,color:"#2a2a3a",marginTop:2}}>Importez un graphique · Signal IA via Groq (gratuit)</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {["Analyse","Historique","Paramètres"].map((t,i)=>(
              <div key={t} style={{padding:"6px 14px",borderRadius:99,fontSize:11,fontWeight:600,cursor:"pointer",background:i===0?"rgba(85,102,255,.15)":"transparent",color:i===0?"#8899ff":"#333",border:i===0?"1px solid rgba(85,102,255,.25)":"1px solid transparent"}}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
          {entries.length===0 ? <EmptyState /> : entries.map(e=><AnalysisCard key={e.id} entry={e} />)}
          <div ref={bottomRef} />
        </div>
        <InputBar state={state} compact={false} />
      </div>
    </div>
  );
}

function MobileApp({ state }) {
  const { entries, asset, setAsset, interval, setIntervalVal, assetOpen, setAssetOpen, sessionCount, bottomRef, sigCfg } = state;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div style={{background:"#0a0a0f",height:"100svh",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 40% at 50% 0%,rgba(85,102,255,.07) 0%,transparent 60%)"}} />

      {/* Header */}
      <div style={{padding:"14px 18px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,zIndex:10,background:"rgba(10,10,20,.95)",backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#5566ff,#8899ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,boxShadow:"0 3px 12px rgba(85,102,255,.4)"}}>◈</div>
          <div><span style={{fontSize:15,fontWeight:800,color:"#e0e0e0"}}>FinTerm</span><span style={{fontSize:9,color:"#3a3a4a",marginLeft:6,letterSpacing:1}}>GROQ</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {sigCfg && (
            <div style={{display:"flex",alignItems:"center",gap:6,background:sigCfg.bg,border:`1px solid ${sigCfg.border}`,borderRadius:99,padding:"4px 12px"}}>
              <span style={{fontSize:10,fontWeight:800,color:sigCfg.text,letterSpacing:1}}>{sigCfg.icon} {sigCfg.label}</span>
            </div>
          )}
          <button onClick={()=>setSheetOpen(true)} style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",color:"#555",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>⚙</button>
        </div>
      </div>

      {/* Asset + interval strip */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",flexShrink:0,zIndex:5,borderBottom:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{position:"relative",flex:"0 0 130px"}}>
          <button onClick={()=>setAssetOpen(!assetOpen)} style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,color:"#e0e0e0",padding:"7px 10px",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            {asset}<span style={{color:"#333",fontSize:8}}>▼</span>
          </button>
          {assetOpen && (
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:99,background:"#0f0f1a",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,overflow:"hidden",boxShadow:"0 16px 40px rgba(0,0,0,.8)",maxHeight:220,overflowY:"auto"}}>
              {ASSETS.map(a=>(
                <div key={a} className="asset-item" onClick={()=>{setAsset(a);setAssetOpen(false);}} style={{padding:"10px 14px",fontSize:13,color:a===asset?"#8899ff":"#666",cursor:"pointer",fontWeight:a===asset?700:400,borderBottom:"1px solid rgba(255,255,255,.03)"}}>{a}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:4,overflowX:"auto",flex:1}}>
          {INTERVALS.map(iv=>(
            <button key={iv} onClick={()=>setIntervalVal(iv)} style={{padding:"6px 9px",borderRadius:8,border:`1px solid ${interval===iv?"rgba(85,102,255,.4)":"rgba(255,255,255,.06)"}`,background:interval===iv?"rgba(85,102,255,.12)":"transparent",color:interval===iv?"#8899ff":"#444",fontSize:11,fontWeight:interval===iv?700:400,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{iv}</button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{flex:1,overflowY:"auto",padding:"14px",WebkitOverflowScrolling:"touch",zIndex:1}}>
        {entries.length===0 ? <EmptyState mobile /> : entries.map(e=><AnalysisCard key={e.id} entry={e} compact />)}
        <div ref={bottomRef} style={{height:8}} />
      </div>

      <InputBar state={state} compact />

      {/* Stats sheet */}
      {sheetOpen && (
        <>
          <div onClick={()=>setSheetOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:50,backdropFilter:"blur(4px)"}} />
          <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:51,background:"#0f0f1a",borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",border:"1px solid rgba(255,255,255,.08)",animation:"slideUp .3s cubic-bezier(.4,0,.2,1)"}}>
            <div style={{width:36,height:4,borderRadius:99,background:"#2a2a3a",margin:"0 auto 20px"}} />
            <div style={{fontSize:15,fontWeight:700,color:"#e0e0e0",marginBottom:4}}>Session</div>
            <div style={{fontSize:11,color:"#3a3a4a",marginBottom:16,letterSpacing:1}}>GROQ · LLAMA 4 SCOUT · VISION</div>
            {[["Analyses",sessionCount,"#666"],["BUY",entries.filter(e=>e.signal==="BUY").length,"#00e5a0"],["SELL",entries.filter(e=>e.signal==="SELL").length,"#ff5c73"],["WAIT",entries.filter(e=>e.signal==="WAIT").length,"#ffc14d"]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{fontSize:14,color:"#555"}}>{l}</span><span style={{fontSize:16,fontWeight:700,color:c}}>{v}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── root ── */
export default function Home() {
  const isMobile = useIsMobile();
  const [entries,    setEntries]    = useState([]);
  const [asset,      setAsset]      = useState("BTC/USD");
  const [interval,   setIntervalVal]= useState("1H");
  const [query,      setQuery]      = useState("");
  const [imageData,  setImageData]  = useState(null);
  const [imagePreview,setImagePreview]= useState(null);
  const [loading,    setLoading]    = useState(false);
  const [assetOpen,  setAssetOpen]  = useState(false);
  const [sessionCount,setSessionCount]= useState(0);
  const fileRef   = useRef();
  const bottomRef = useRef();

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [entries]);

  const now = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setImagePreview(ev.target.result); setImageData(ev.target.result.split(",")[1]); };
    r.readAsDataURL(file); e.target.value = "";
  }

  async function run() {
    if (!imageData && !query.trim()) return;
    setLoading(true); setSessionCount(n=>n+1);
    const id=Date.now(), cq=query, ci=imageData, cp=imagePreview;
    setEntries(p=>[...p, {id, time:now(), asset, interval, userText:cq||null, image:cp, hasImage:!!ci, analysis:undefined, signal:null, loading:true}]);
    setQuery(""); setImagePreview(null); setImageData(null);

    try {
      const res = await fetch("/api/analyze", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ asset, interval, query:cq, imageData:ci }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const raw = data.result || "";
      let signal=null, analysis=raw;
      if      (raw.startsWith("[BUY]"))  { signal="BUY";  analysis=raw.replace("[BUY]","").trim();  }
      else if (raw.startsWith("[SELL]")) { signal="SELL"; analysis=raw.replace("[SELL]","").trim(); }
      else if (raw.startsWith("[WAIT]")) { signal="WAIT"; analysis=raw.replace("[WAIT]","").trim(); }

      setEntries(p=>p.map(e=>e.id===id ? {...e, signal, analysis, loading:false} : e));
    } catch(err) {
      setEntries(p=>p.map(e=>e.id===id ? {...e, analysis:`Erreur: ${err.message}`, loading:false} : e));
    }
    setLoading(false);
  }

  const lastSig = [...entries].reverse().find(e=>e.signal)?.signal;
  const sigCfg  = lastSig ? SIG[lastSig] : null;

  const shared = { entries, asset, setAsset, interval, setIntervalVal, query, setQuery, imageData, imagePreview, setImagePreview, setImageData, loading, assetOpen, setAssetOpen, sessionCount, fileRef, bottomRef, run, handleFile, lastSig, sigCfg };

  return (
    <>
      <Head>
        <title>FinTerm — AI Market Analyst</title>
        <meta name="description" content="Analyse technique IA — Groq + Llama 4 Scout Vision" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      {isMobile ? <MobileApp state={shared} /> : <DesktopApp state={shared} />}
    </>
  );
}
