/* ═══════════════════════════════════════════
   OkadaRide — Register Screen
   ═══════════════════════════════════════════ */
'use strict';

function Register(p){
  var _step = useState(1); var step = _step[0]; var setStep = _step[1];
  var _ph = useState(""); var phone = _ph[0]; var setPhone = _ph[1];
  var _otp = useState(""); var otp = _otp[0]; var setOtp = _otp[1];
  var _code = useState(""); var code = _code[0]; var setCode = _code[1];
  var _name = useState(""); var name = _name[0]; var setName = _name[1];
  var _pin = useState(""); var pin = _pin[0]; var setPin = _pin[1];
  var _url = useState(""); var photoUrl = _url[0]; var setPhotoUrl = _url[1];
  var _photo = useState(null); var photo = _photo[0]; var setPhoto = _photo[1];
  var _err = useState(""); var err = _err[0]; var setErr = _err[1];
  var _load = useState(false); var load = _load[0]; var setLoad = _load[1];
  var fref = useRef();

  var sendCode = async function(){
    if(phone.replace(/\D/g,"").length<9){ setErr("Enter a valid Ghana phone number"); return; }
    setLoad(true); setErr("");
    var c = String(Math.floor(100000 + Math.random()*900000));
    setCode(c);
    // Format to Ghana international number
    var gh = phone.replace(/\D/g,"");
    if(gh.startsWith("0")) gh = "233"+gh.slice(1);
    else if(!gh.startsWith("233")) gh = "233"+gh;
    // Send SMS via Hubtel Ghana API
    var smsUrl = "https://smsc.hubtel.com/v1/messages/send"
      +"?clientsecret=HUBTEL_SECRET"
      +"&clientid=HUBTEL_ID"
      +"&from=OkadaRide"
      +"&to="+gh
      +"&content="+encodeURIComponent("OkadaRide: Your verification code is "+c+". Valid 10 mins. Do not share.");
    var smsSent = false;
    try{
      var r = await fetch(smsUrl);
      if(r.ok){ smsSent = true; }
    }catch(e){ smsSent = false; }
    setLoad(false);
    setStep(2);
    if(!smsSent) setErr("sms_fail");
  };
  var verify = function(){
    if(otp === code){ setStep(3); setErr(""); }
    else{ setErr("Wrong code. Please try again."); setOtp(""); }
  };
  var pickPhoto = function(e){
    var f = e.target.files[0]; if(!f) return;
    setPhoto(f);
    DB.photoToB64(f).then(function(url){ setPhotoUrl(url); });
  };
  var finish = async function(){
    if(!name.trim()){ setErr("Enter your full name"); return; }
    if(!photo){ setErr("Photo is required — riders need to identify you"); return; }
    if(pin.length < 4){ setErr("Set a 4-digit PIN"); return; }
    setLoad(true); setErr("");
    var pinHash = await hashPin(pin);
    var u = {name:name.trim(), phone:phone.trim(), photoURL:photoUrl, pin:pinHash, createdAt:new Date().toISOString()};
    await DB.savePassenger(u);
    ls.set("okada_user", u);
    setLoad(false);
    p.done(u);
  };

  return h("div",{style:{minHeight:"100dvh",paddingBottom:50},className:"page"},
    h(PHdr,{back:function(){ p.done(null); }, title:"Create Account", sub:"Step "+step+" of 3"}),
    h("div",{style:{display:"flex",gap:4,padding:"10px 16px 0"}},
      [1,2,3].map(function(s){ return h("div",{key:s,style:{flex:1,height:4,borderRadius:4,background:step>=s?GOLD:"rgba(27,122,47,.1)",transition:"background .4s ease, transform .3s ease",transform:step>=s?"scaleY(1.3)":"scaleY(1)"}}); })
    ),
    h("div",{style:{padding:"20px 16px"}},
      step===1 && h("div",{className:"page"},
        h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:14,padding:"14px 16px",marginBottom:18,border:"1px solid rgba(27,122,47,.1)"}},
          h("p",{style:{fontWeight:700,fontSize:13,color:"#3D6645",lineHeight:1.6}},"📱 We'll send a verification code to confirm your Ghana phone number.")
        ),
        h(TInput,{label:"Phone Number",placeholder:"e.g. 0241234567",value:phone,onChange:function(e){setPhone(e.target.value);setErr("");},type:"tel",inputMode:"tel",autoComplete:"tel",onKey:function(e){if(e.key==="Enter")sendCode();}}),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:sendCode,dis:phone.replace(/\D/g,"").length<9,kids:"Send Verification Code →"}),
        h("p",{style:{textAlign:"center",marginTop:16,fontSize:13,color:"#85A88C"}},
          "Already registered? ",h("span",{onClick:function(){p.done(null);},style:{color:G,cursor:"pointer",fontWeight:800}},"Sign in →")
        )
      ),
      step===2 && h("div",{className:"page"},
        h("div",{style:{background:GRD,borderRadius:16,padding:"18px 16px",marginBottom:18,textAlign:"center",boxShadow:"0 6px 20px rgba(13,74,26,.3)"}},
          h("p",{style:{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:8}},"YOUR VERIFICATION CODE"),
          h("p",{style:{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:900,color:"#fff",letterSpacing:8}},code),
          h("p",{style:{color:"rgba(255,255,255,.5)",fontSize:12,marginTop:8}},"Enter the code below to verify "+phone)
        ),
        h(TInput,{label:"Enter 6-digit code",placeholder:"000000",value:otp,onChange:function(e){setOtp(e.target.value.replace(/\D/g,"").slice(0,6));setErr("");},type:"tel",inputMode:"numeric",style:{fontSize:22,fontWeight:800,textAlign:"center",letterSpacing:8},onKey:function(e){if(e.key==="Enter")verify();}}),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:verify,dis:otp.length<6,kids:"Verify & Continue →"}),
        h("p",{onClick:function(){setStep(1);setOtp("");setErr("");},style:{textAlign:"center",marginTop:12,fontSize:13,color:"#85A88C",cursor:"pointer"}},"← Use a different number")
      ),
      step===3 && h("div",{className:"slide-in"},
        h("div",{style:{textAlign:"center",marginBottom:6}},
          h("div",{onClick:function(){fref.current&&fref.current.click();},style:{width:88,height:88,borderRadius:"50%",background:photoUrl?"transparent":"rgba(27,122,47,.08)",border:"3px dashed "+(photoUrl?G:BDR),display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",position:"relative"}},
            photoUrl
              ? h("img",{src:photoUrl,style:{width:"100%",height:"100%",objectFit:"cover"}})
              : h("div",{style:{textAlign:"center"}},h("div",{style:{fontSize:26}},"📷"),h("p",{style:{color:"#85A88C",fontSize:10,marginTop:3}},"Add Photo"))
          )
        ),
        h("input",{ref:fref,type:"file",accept:"image/*",capture:"user",onChange:pickPhoto,style:{display:"none"}}),
        h("p",{style:{color:GOLD,fontSize:12,fontWeight:700,textAlign:"center",marginBottom:18}},"⚠️ Photo required — riders use it to identify you"),
        h(TInput,{label:"Full Name",placeholder:"e.g. Kwame Asante",value:name,onChange:function(e){setName(e.target.value);setErr("");},autoComplete:"name",cap:"words"}),
        h(PinIn,{label:"🔐 Set a 4-digit PIN (protects your trip history)",value:pin,onChange:function(e){setPin(e.target.value.replace(/\D/g,"").slice(0,4));}}),
        h("p",{style:{color:"#85A88C",fontSize:12,marginBottom:16,marginTop:-10}},"You'll use this PIN to view your trip history"),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:finish,dis:load||!name.trim()||!photo||pin.length<4,kids:load?h(Spin,null):"Create My Account 🎉"})
      )
    )
  );
}


// ── RIDER APPLY ───────────────────────────────────────────────────────────────
