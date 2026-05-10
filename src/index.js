import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Render with error boundary baked in
class RootBoundary extends React.Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(e) { console.error("Root crash:", e); }
  render() {
    if (this.state.crashed) return (
      <div style={{minHeight:"100vh",background:"#06060e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24}}>
        <div style={{fontFamily:"serif",fontSize:48,fontWeight:700,letterSpacing:"0.2em",color:"#f2ede7"}}>PARADISE</div>
        <div style={{fontFamily:"serif",fontStyle:"italic",fontSize:18,color:"#c9a96e"}}>on Earth</div>
        <p style={{color:"#7a7690",fontFamily:"monospace",fontSize:12,textAlign:"center",maxWidth:300}}>
          Something crashed. Tap refresh to reload.
        </p>
        <button onClick={()=>window.location.reload()}
          style={{background:"#c9a96e",border:"none",borderRadius:8,padding:"12px 28px",
            color:"#08080e",fontFamily:"sans-serif",fontSize:13,fontWeight:700,
            cursor:"pointer",letterSpacing:"0.1em"}}>
          Refresh
        </button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <RootBoundary><App /></RootBoundary>
);
