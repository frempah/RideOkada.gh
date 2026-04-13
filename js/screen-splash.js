/* ═══════════════════════════════════════════
   OkadaRide — Splash Screen
   ═══════════════════════════════════════════ */
'use strict';

function Splash(p){
  var _c = useState(8); var cnt = _c[0]; var setCnt = _c[1];
  useEffect(function(){
    var t = setTimeout(p.done, 8000);
    var cd = setInterval(function(){ setCnt(function(v){ return v <= 1 ? 0 : v-1; }); }, 1000);
    return function(){ clearTimeout(t); clearInterval(cd); };
  },[]);
  return h("div",{style:{height:"100dvh",background:GRD,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center",position:"relative",overflow:"hidden"}},
    h(Ghana,null),
    h("div",{style:{position:"absolute",top:-70,right:-70,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}),
    h("div",{style:{width:96,height:96,background:"rgba(255,255,255,.12)",borderRadius:28,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,border:"2px solid rgba(255,255,255,.22)",animation:"float 3s ease-in-out infinite",boxShadow:"0 16px 40px rgba(0,0,0,.25)"}},
      h("span",{style:{fontSize:50}},"🛺")
    ),
    h("h1",{style:{fontFamily:"'Syne',sans-serif",fontSize:38,fontWeight:900,color:"#fff",letterSpacing:-1}},"OkadaRide"),
    h("p",{style:{color:GOLD,fontWeight:800,fontSize:12,letterSpacing:3,marginTop:6}},"SUNYANI 🇬🇭"),
    h("p",{style:{color:"rgba(255,255,255,.5)",fontSize:14,marginTop:8,lineHeight:1.6}},"Fast · Safe · Affordable"),
    h("div",{style:{marginTop:26,display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:290}},
      [["🛺","Book a ride in seconds"],["✅","Verified riders only"],["💰","GHS 30 flat rate"],["📞","WhatsApp confirmations"]].map(function(row,i){
        return h("div",{key:i,style:{background:"rgba(255,255,255,.09)",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:11}},
          h("span",{style:{fontSize:18,flexShrink:0}},row[0]),
          h("p",{style:{color:"rgba(255,255,255,.85)",fontSize:13,fontWeight:600}},row[1])
        );
      })
    ),
    h("button",{onClick:p.done,
      style:{marginTop:28,background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",
        color:"rgba(255,255,255,.85)",borderRadius:24,padding:"11px 28px",
        fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s"}
    },"Enter App ("+cnt+"s)"),
    h("p",{style:{color:"rgba(255,255,255,.3)",fontSize:11,marginTop:16,letterSpacing:1}},"v2.0 · OkadaRide Ghana · 2026")
  );
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
