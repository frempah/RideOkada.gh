/* ═══════════════════════════════════════════
   OkadaRide — Shared UI Components
   PBtn, PHdr, TInput, PinIn, ErrMsg,
   OkMsg, Spin, Card, Ghana, Avatar
   ═══════════════════════════════════════════ */
'use strict';

// Standard primary button
var PBtn = function(props){
  var dis = !!props.dis;
  var bg  = dis ? "#D0D0D0" : props.red ? "linear-gradient(135deg,#CC0000,#8B0000)" : props.gold ? "linear-gradient(135deg,#FFB300,#E65100)" : GRD;
  var co  = dis ? "#999" : props.gold ? "#000" : "#fff";
  return h("button",{
    onClick: dis ? null : props.onClick,
    disabled: dis,
    style: Object.assign({
      width:"100%", padding:"15px 18px", borderRadius:14, border:"none",
      background:bg, color:co, fontWeight:800, fontSize:15,
      display:"flex", alignItems:"center", justifyContent:"center", gap:9,
      cursor: dis ? "not-allowed" : "pointer",
      boxShadow: dis ? "none" : "0 5px 18px rgba(13,74,26,.3)",
      transition:"opacity .15s", opacity:dis?.65:1
    }, props.style||{})
  }, props.kids);
};

// Ghost / outline button
var GBtn = function(props){
  return h("button",{
    onClick: props.onClick,
    style: Object.assign({
      width:"100%", padding:"14px 18px", borderRadius:14,
      border:"2px solid "+(props.red ? "rgba(204,0,0,.3)" : BDR),
      background:"#fff", color: props.red ? RED : G,
      fontWeight:800, fontSize:15,
      display:"flex", alignItems:"center", justifyContent:"center", gap:9,
      cursor:"pointer"
    }, props.style||{})
  }, props.kids);
};

// Text input — with live focus state
var TInput = function(props){
  var _f = useState(false); var focused = _f[0]; var setFocused = _f[1];
  var hasVal = props.value && String(props.value).length > 0;
  return h("div",{style:{marginBottom:props.mb===0?0:14}},
    props.label && h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6}},
      h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645"}},props.label),
      props.hint&&h("p",{style:{fontSize:11,color:"#85A88C",fontWeight:600}},props.hint)
    ),
    h("input",{
      id: props.id,
      type: props.type||"text",
      inputMode: props.inputMode,
      placeholder: props.placeholder,
      value: props.value,
      onChange: props.onChange,
      disabled: props.disabled,
      autoComplete: props.autoComplete||"off",
      autoCapitalize: props.cap||"none",
      onKeyDown: props.onKey,
      onFocus: function(){ setFocused(true); if(props.onFocus) props.onFocus(); },
      onBlur:  function(){ setFocused(false); if(props.onBlur)  props.onBlur();  },
      style: Object.assign({
        width:"100%", padding:"14px 15px", borderRadius:13, fontSize:16, fontWeight:600,
        border:"2px solid "+(focused?"#1B7A2F":hasVal?"#2E8B57":BDR),
        background: props.disabled?"#f5f5f5": focused?"#F0FAF2": hasVal?"#F5FFF6":"#F8F8F8",
        color:"#0D2E14",
        boxShadow: focused?"0 0 0 4px rgba(27,122,47,.1)":"none",
        transition:"all .2s", outline:"none",
        WebkitAppearance:"none"
      }, props.style||{})
    })
  );
};

// PIN input with show/hide
var PinIn = function(props){
  var _s = useState(false); var show = _s[0]; var setShow = _s[1];
  return h("div",{style:{marginBottom:props.mb===0?0:14}},
    props.label && h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645",marginBottom:6}},props.label),
    h("div",{style:{position:"relative"}},
      h("input",{
        type: show ? "tel" : "password",
        inputMode: "numeric",
        value: props.value,
        onChange: props.onChange,
        placeholder: "••••",
        onKeyDown: props.onKey,
        style:{
          width:"100%", padding:"13px 50px 13px 15px", borderRadius:12, fontSize:26,
          fontWeight:800, textAlign:"center", letterSpacing:10,
          border:"2px solid "+(props.value&&props.value.length>0 ? G : BDR),
          background: props.value&&props.value.length>0 ? "#FAFFF9" : "#F8F8F8",
          color:"#0D2E14", transition:"border-color .2s"
        }
      }),
      h("button",{
        onClick:function(){ setShow(!show); },
        style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:20,color:"#85A88C",cursor:"pointer",padding:4}
      }, show ? "🙈" : "👁️")
    )
  );
};

// Error banner — animated
var ErrMsg = function(props){
  if(!props.msg || props.msg==="sms_fail") return null;
  return h("div",{style:{background:"#FFF0F0",border:"1px solid rgba(204,0,0,.2)",
    borderRadius:12,padding:"11px 14px",marginBottom:12,
    display:"flex",gap:9,alignItems:"flex-start",
    animation:"popIn .25s cubic-bezier(.34,1.56,.64,1)"}},
    h("span",{style:{fontSize:18,flexShrink:0,marginTop:1}},"⚠️"),
    h("p",{style:{color:RED,fontSize:13,fontWeight:700,lineHeight:1.45}},props.msg)
  );
};

// Success banner
var OkMsg = function(props){
  if(!props.msg) return null;
  return h("div",{style:{background:"#F0FFF4",border:"1px solid rgba(27,122,47,.2)",
    borderRadius:12,padding:"11px 14px",marginBottom:12,
    display:"flex",gap:9,alignItems:"flex-start",
    animation:"popIn .25s cubic-bezier(.34,1.56,.64,1)"}},
    h("span",{style:{fontSize:18,flexShrink:0,marginTop:1}},"✅"),
    h("p",{style:{color:G,fontSize:13,fontWeight:700,lineHeight:1.45}},props.msg)
  );
};

// Page header (sticky green bar)
var PHdr = function(props){
  return h("div",{style:{background:GRD,position:"sticky",top:0,zIndex:50,boxShadow:"0 4px 20px rgba(0,0,0,.2)"}},
    h(Ghana,null),
    h("div",{style:{padding:"12px 16px 14px",display:"flex",alignItems:"center",gap:11}},
      props.back && h("button",{onClick:props.back,
        style:{background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.25)",
          color:"#fff",borderRadius:10,padding:"7px 13px",fontWeight:800,fontSize:13,
          cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:5,
          transition:"background .15s"}},
        h("span",{style:{fontSize:15,lineHeight:1}},"←"),
        h("span",null,"Back")
      ),
      h("div",{style:{flex:1,minWidth:0}},
        h("p",{style:{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:900,color:"#fff",
          lineHeight:1.15,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},props.title),
        props.sub && h("p",{style:{color:"rgba(255,255,255,.6)",fontSize:11,marginTop:2,
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},props.sub)
      ),
      props.right && props.right
    )
  );
};

// White card
var Card = function(props){
  return h("div",{style:Object.assign({
    background:"#fff", borderRadius:18, padding:"16px",
    border:"1.5px solid rgba(27,122,47,.12)",
    boxShadow:"0 3px 16px rgba(0,0,0,.06)", marginBottom:14
  }, props.style||{})}, props.kids);
};

// ── SPLASH ────────────────────────────────────────────────────────────────────
