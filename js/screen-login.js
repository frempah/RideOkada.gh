/* ═══════════════════════════════════════════
   OkadaRide — Login Screen
   ═══════════════════════════════════════════ */
'use strict';

function Login(p){
  var _mode = useState("choose"); var mode = _mode[0]; var setMode = _mode[1];
  var _ph = useState(""); var phone = _ph[0]; var setPhone = _ph[1];
  var _pin = useState(""); var pin = _pin[0]; var setPin = _pin[1];
  var _plate = useState(""); var plate = _plate[0]; var setPlate = _plate[1];
  var _rpin = useState(""); var rpin = _rpin[0]; var setRpin = _rpin[1];
  var _np = useState(""); var np = _np[0]; var setNp = _np[1];
  var _cp = useState(""); var cp = _cp[0]; var setCp = _cp[1];
  var _rd = useState(null); var rd = _rd[0]; var setRd = _rd[1];
  var _rs = useState("plate"); var rs = _rs[0]; var setRs = _rs[1];
  var _err = useState(""); var err = _err[0]; var setErr = _err[1];
  var _load = useState(false); var load = _load[0]; var setLoad = _load[1];

  var loginPass = async function(){
    if(phone.replace(/\D/g,"").length<9){ setErr("Enter a valid phone number"); return; }
    if(pin.length<4){ setErr("Enter your 4-digit PIN"); return; }
    // Check lockout
    var lockKey = "pass_"+phone.replace(/\D/g,"");
    var lockStatus = SEC.isLocked(lockKey);
    if(lockStatus.locked){
      setErr("Account locked. Too many wrong PINs. Try again in "+lockStatus.minsLeft+" minute"+(lockStatus.minsLeft===1?"":"s")+".");
      setLoad(false); return;
    }
    setLoad(true); setErr("");
    var u = await DB.getPassenger(phone.trim());
    if(!u){ setErr("Not registered. Please register first."); setLoad(false); return; }
    var pinMatch = await checkPin(pin, u.pin);
    if(!pinMatch){
      var result = SEC.recordFail(lockKey);
      if(result.locked){
        setErr("Account locked for 30 minutes after too many wrong PINs.");
      } else {
        setErr("Wrong PIN. "+result.attemptsLeft+" attempt"+(result.attemptsLeft===1?"":"s")+" remaining before lockout.");
      }
      setPin(""); setLoad(false); return;
    }
    SEC.clearFails(lockKey);
    ls.set("okada_user", u);
    p.onPass(u); setLoad(false);
  };

  var findRider = async function(){
    if(!plate.trim()){ setErr("Enter your plate number"); return; }
    setLoad(true); setErr("");
    var res = await DB.findDriver(plate.trim());
    if(res.ok){ setRd(res.driver); setRs(res.driver.pin ? "pin" : "newpin"); setErr(""); }
    else setErr(res.error||"Not found. Contact admin.");
    setLoad(false);
  };

  var verifyRider = async function(){
    if(rpin.length<4){ setErr("Enter your PIN"); return; }
    var lockKey = "rider_"+(rd.plate||rd.id||"");
    var lockStatus = SEC.isLocked(lockKey);
    if(lockStatus.locked){
      setErr("Account locked for "+lockStatus.minsLeft+" more minute"+(lockStatus.minsLeft===1?"":"s")+". Too many wrong PINs.");
      return;
    }
    var rpinMatch = await checkPin(rpin, rd.pin);
    if(!rpinMatch){
      var result = SEC.recordFail(lockKey);
      if(result.locked){
        setErr("Rider account locked for 30 minutes.");
      } else {
        setErr("Wrong PIN. "+result.attemptsLeft+" attempt"+(result.attemptsLeft===1?"":"s")+" left.");
      }
      setRpin(""); return;
    }
    SEC.clearFails(lockKey);
    ls.set("okada_driver", rd);
    p.onRider(rd);
  };

  var savePin = async function(){
    if(np.length<4){ setErr("Enter 4 digits"); return; }
    if(np !== cp){ setErr("PINs don't match"); return; }
    setLoad(true);
    var npHash = await hashPin(np);
    await DB.saveDriverPin(rd.id, npHash);
    var updated = Object.assign({}, rd, {pin:npHash});
    ls.set("okada_driver", updated);
    p.onRider(updated); setLoad(false);
  };

  // ── CHOOSE
  if(mode==="choose") return h("div",{style:{height:"100dvh",background:GRD,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"},className:"page"},
    h(Ghana,null),
    h("div",{style:{position:"absolute",top:-80,right:-80,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}),
    h("div",{style:{maxWidth:370,width:"100%"}},
      h("div",{style:{textAlign:"center",marginBottom:28}},
        h("div",{style:{width:90,height:90,background:"rgba(255,255,255,.12)",borderRadius:28,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14,border:"2px solid rgba(255,255,255,.22)",animation:"float 3s ease-in-out infinite",boxShadow:"0 16px 36px rgba(0,0,0,.2)"}},
          h("span",{style:{fontSize:46}},"🛺")
        ),
        h("h1",{style:{fontFamily:"'Syne',sans-serif",fontSize:34,fontWeight:900,color:"#fff",letterSpacing:-1}},"OkadaRide"),
        h("p",{style:{color:GOLD,fontWeight:800,fontSize:11,letterSpacing:3,marginTop:5}},"SUNYANI 🇬🇭"),
        h("p",{style:{color:"rgba(255,255,255,.45)",fontSize:13,marginTop:8}},"Ghana's Trusted Tricycle Ride App")
      ),
      h("p",{style:{color:"rgba(255,255,255,.55)",fontSize:12,fontWeight:700,textAlign:"center",marginBottom:12,textTransform:"uppercase",letterSpacing:1}},"Who are you?"),
      h("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:18}},
        h("button",{onClick:function(){setMode("pass");setErr("");},style:{background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.18)",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:13,cursor:"pointer",width:"100%"}},
          h("div",{style:{width:50,height:50,background:"linear-gradient(135deg,#4285F4,#1565C0)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}},"🧑🏾"),
          h("div",{style:{textAlign:"left",flex:1}},h("p",{style:{color:"#fff",fontWeight:800,fontSize:16,marginBottom:2}},"I'm a Passenger"),h("p",{style:{color:"rgba(255,255,255,.5)",fontSize:12}},"Book rides · Track")),
          h("span",{style:{color:"rgba(255,255,255,.35)",fontSize:22}},"›")
        ),
        h("button",{onClick:function(){setMode("rider");setErr("");},style:{background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.18)",borderRadius:16,padding:"16px 18px",display:"flex",alignItems:"center",gap:13,cursor:"pointer",width:"100%"}},
          h("div",{style:{width:50,height:50,background:"linear-gradient(135deg,#FFB300,#E65100)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}},"🛺"),
          h("div",{style:{textAlign:"left",flex:1}},h("p",{style:{color:"#fff",fontWeight:800,fontSize:16,marginBottom:2}},"I'm a Rider"),h("p",{style:{color:"rgba(255,255,255,.5)",fontSize:12}},"Accept rides · Earn")),
          h("span",{style:{color:"rgba(255,255,255,.35)",fontSize:22}},"›")
        )
      ),
      h("p",{style:{color:"rgba(255,255,255,.4)",fontSize:13,textAlign:"center",marginBottom:10}},
        "New passenger? ",h("span",{onClick:p.onReg,style:{color:GOLD,cursor:"pointer",fontWeight:800,textDecoration:"underline"}},"Register free →")
      ),
      h("p",{style:{color:"rgba(255,255,255,.3)",fontSize:13,textAlign:"center"}},
        "Want to earn? ",h("span",{onClick:p.onRiderReg,style:{color:"#FFB300",cursor:"pointer",fontWeight:800,textDecoration:"underline"}},"Apply as a Rider 🛺 →")
      )
    )
  );

  // ── PASSENGER LOGIN
  if(mode==="pass") return h("div",{style:{minHeight:"100dvh",paddingBottom:40},className:"slide-in"},
    h(PHdr,{back:function(){setMode("choose");setErr("");setPin("");setPhone("");},title:"Passenger Login",sub:"Enter your phone and PIN"}),
    h("div",{style:{padding:"20px 16px"}},
      h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:13,padding:"13px 15px",marginBottom:20,border:"1px solid rgba(27,122,47,.1)"}},
        h("p",{style:{fontSize:13,color:"#3D6645",lineHeight:1.6}},"💡 Use the phone number and PIN you registered with. Your login is saved automatically.")
      ),
      h(TInput,{label:"📱 Phone Number",placeholder:"e.g. 0241234567",value:phone,onChange:function(e){setPhone(e.target.value);setErr("");},type:"tel",inputMode:"tel",autoComplete:"tel"}),
      h(PinIn,{label:"🔐 Your 4-Digit PIN",value:pin,onChange:function(e){setPin(e.target.value.replace(/\D/g,"").slice(0,4));setErr("");},onKey:function(e){if(e.key==="Enter")loginPass();}}),
      h(ErrMsg,{msg:err}),
      h(PBtn,{onClick:loginPass,dis:load||phone.replace(/\D/g,"").length<9||pin.length<4,kids:load?h(Spin,null):"Sign In 🔐"}),
      h("p",{style:{textAlign:"center",marginTop:16,fontSize:13,color:"#85A88C"}},
        "No account? ",h("span",{onClick:p.onReg,style:{color:G,cursor:"pointer",fontWeight:800}},"Register free →")
      )
    )
  );

  // ── RIDER LOGIN
  if(mode==="rider") return h("div",{style:{minHeight:"100dvh",paddingBottom:40},className:"slide-in"},
    h(PHdr,{back:function(){setMode("choose");setErr("");setRs("plate");setRd(null);setRpin("");setNp("");setCp("");},title:"Rider Login",sub:"Sign in with your plate number"}),
    h("div",{style:{padding:"20px 16px"}},
      rs==="plate" && h("div",{className:"page"},
        h(TInput,{label:"🛺 Plate Number",placeholder:"e.g. GR-1234-20",value:plate,onChange:function(e){setPlate(e.target.value.toUpperCase());setErr("");},cap:"characters",style:{fontSize:20,fontWeight:800,textAlign:"center",letterSpacing:2},onKey:function(e){if(e.key==="Enter")findRider();}}),
        h("p",{style:{color:"#85A88C",fontSize:12,marginBottom:14,marginTop:-10}},"Enter exactly as registered — capital letters"),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:findRider,dis:load||!plate.trim(),kids:load?h(Spin,null):"Find My Account →"}),
        h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:12,padding:"12px 14px",marginTop:14,display:"flex",gap:8,border:"1px solid rgba(27,122,47,.1)"}},
          h("span",null,"ℹ️"),
          h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.5}},"Your application must be approved by admin before you can log in.")
        )
      ),
      rs==="pin" && rd && h("div",{className:"page"},
        h("div",{style:{background:"rgba(27,122,47,.07)",borderRadius:14,padding:"14px",marginBottom:18,display:"flex",alignItems:"center",gap:12,border:"1px solid "+BDR}},
          h("div",{style:{width:46,height:46,borderRadius:"50%",background:GRD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}},"🧑🏾"),
          h("div",null,
            h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14"}},rd.fullName||rd.name),
            h("p",{style:{color:GOLD,fontSize:12,fontWeight:700,marginTop:2}},"🛺 "+rd.plate),
            h("p",{style:{color:"#00C853",fontSize:11,fontWeight:700,marginTop:1}},"✅ Verified Rider")
          )
        ),
        h(PinIn,{label:"🔐 Enter Your PIN",value:rpin,onChange:function(e){setRpin(e.target.value.replace(/\D/g,"").slice(0,4));setErr("");},onKey:function(e){if(e.key==="Enter")verifyRider();}}),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:verifyRider,dis:rpin.length<4,kids:"Sign In ✓"}),
        h("p",{onClick:function(){setRs("plate");setRpin("");setErr("");},style:{textAlign:"center",marginTop:12,fontSize:13,color:"#85A88C",cursor:"pointer"}},"← Change plate number")
      ),
      (rs==="newpin"||rs==="confirm") && h("div",{className:"page"},
        h("p",{style:{fontWeight:800,fontSize:17,color:"#0D2E14",marginBottom:4}},rs==="newpin"?"🔐 Create Your PIN":"🔐 Confirm Your PIN"),
        h("p",{style:{color:"#85A88C",fontSize:13,marginBottom:16}},"Set a secret 4-digit PIN to protect your account"),
        h(PinIn,{label:rs==="newpin"?"Choose a PIN":"Re-enter to confirm",value:rs==="newpin"?np:cp,
          onChange:function(e){var v=e.target.value.replace(/\D/g,"").slice(0,4); rs==="newpin"?setNp(v):setCp(v); setErr("");},
          onKey:function(e){
            if(e.key!=="Enter") return;
            if(rs==="newpin"){ if(np.length===4){setRs("confirm");setErr("");}else setErr("Enter 4 digits"); }
            else savePin();
          }
        }),
        h(ErrMsg,{msg:err}),
        rs==="newpin"
          ? h(PBtn,{onClick:function(){if(np.length===4){setRs("confirm");setErr("");}else setErr("Enter 4 digits");},dis:np.length<4,kids:"Next →"})
          : h(PBtn,{onClick:savePin,dis:load||cp.length<4,kids:load?h(Spin,null):"Save PIN & Enter 🎉"})
      )
    )
  );

  return null;
}

// ── HOME ──────────────────────────────────────────────────────────────────────
