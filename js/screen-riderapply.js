/* ═══════════════════════════════════════════
   OkadaRide — RiderApply Screen
   ═══════════════════════════════════════════ */
'use strict';

function RiderApply(p){
  var _step=useState(1); var step=_step[0]; var setStep=_step[1];
  var _fn=useState(""); var fullName=_fn[0]; var setFullName=_fn[1];
  var _ph=useState(""); var phone=_ph[0]; var setPhone=_ph[1];
  var _pl=useState(""); var plate=_pl[0]; var setPlate=_pl[1];
  var _co=useState(""); var color=_co[0]; var setColor=_co[1];
  var _yr=useState(""); var year=_yr[0]; var setYear=_yr[1];
  var _gn=useState(""); var gender=_gn[0]; var setGender=_gn[1];
  var _gh=useState(""); var ghCard=_gh[0]; var setGhCard=_gh[1];
  var _photo=useState(""); var photo=_photo[0]; var setPhoto=_photo[1];
  var _bike=useState(""); var bikePhoto=_bike[0]; var setBikePhoto=_bike[1];
  var _err=useState(""); var err=_err[0]; var setErr=_err[1];
  var _load=useState(false); var load=_load[0]; var setLoad=_load[1];
  var _done=useState(false); var done=_done[0]; var setDone=_done[1];
  var photoRef=useRef(); var bikeRef=useRef();

  var pickFile=function(e,setter){
    var f=e.target.files[0]; if(!f) return;
    DB.photoToB64(f).then(function(url){ setter(url); });
  };

  var next=function(){
    if(step===1){
      if(!fullName.trim()){setErr("Enter your full name");return;}
      if(phone.replace(/\D/g,"").length<9){setErr("Enter a valid Ghana phone number");return;}
      if(!gender){setErr("Select your gender");return;}
    }
    if(step===2){
      if(!plate.trim()){setErr("Enter your plate number");return;}
      if(!color){setErr("Select tricycle colour");return;}
      if(!year){setErr("Select the year of your tricycle");return;}
    }
    if(step===3){
      if(!photo){setErr("Add your profile photo");return;}
      if(!bikePhoto){setErr("Add a photo of your tricycle");return;}
      if(!ghCard.trim()){setErr("Enter your Ghana Card number");return;}
    }
    setErr(""); setStep(step+1);
  };

  var submit=async function(){
    setLoad(true); setErr("");
    var data={
      fullName:fullName.trim(), phone:phone.trim(),
      plate:plate.trim().toUpperCase(), color:color, year:year,
      gender:gender, ghCard:ghCard.trim(),
      photoURL:photo, bikePhotoURL:bikePhoto,
      region:"Brong-Ahafo", zone:"Sunyani",
      rating:"5.0", trips:0, verified:false,
      appliedAt:new Date().toISOString()
    };
    var r=await DB.applyAsRider(data);
    if(r.ok){
      // Notify admin via WhatsApp
      sendWA("233542008513",
        "🛺 *New Rider Application!*\n\n"+
        "👤 Name: *"+fullName+"*\n"+
        "📞 Phone: *"+phone+"*\n"+
        "🛺 Plate: *"+plate.toUpperCase()+"*\n"+
        "🎨 Colour: "+color+"\n"+
        "📅 Year: "+year+"\n"+
        "🪪 Ghana Card: "+ghCard+"\n\n"+
        "Please review and approve in Firebase Console.\n\n"+
        "_OkadaRide Sunyani 🇬🇭_"
      );
      setDone(true);
    } else {
      setErr(r.error||"Submission failed. Try again.");
    }
    setLoad(false);
  };

  var COLOURS=["Yellow","Red","Blue","Green","White","Orange","Black","Silver","Purple","Other"];
  var YEARS=["2024","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013"];

  // Done screen
  if(done) return h("div",{style:{minHeight:"100dvh",background:"linear-gradient(160deg,#0D4A1A,#1B7A2F)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center"},className:"page"},
    h(Ghana,null),
    h("div",{style:{fontSize:60,marginBottom:16,animation:"float 2s ease-in-out infinite"}},"🎉"),
    h("h2",{style:{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:900,color:"#fff",marginBottom:10}},"Application Submitted!"),
    h("p",{style:{color:"rgba(255,255,255,.7)",fontSize:15,lineHeight:1.7,marginBottom:6}},"Thank you, "+fullName+"!"),
    h("p",{style:{color:"rgba(255,255,255,.6)",fontSize:14,lineHeight:1.7,marginBottom:24}},"Your application has been sent to OkadaRide admin for review.\n\nYou will be contacted on "+phone+" within 1-2 working days."),
    h("div",{style:{background:"rgba(255,255,255,.1)",borderRadius:16,padding:"16px 20px",marginBottom:24,width:"100%",maxWidth:320}},
      h("p",{style:{color:"rgba(255,255,255,.55)",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1}},"What happens next"),
      [["1️⃣","Admin reviews your application"],["2️⃣","You get a WhatsApp message"],["3️⃣","Log in with your plate number"],["4️⃣","Start accepting rides & earning!"]].map(function(row,i){
        return h("div",{key:i,style:{display:"flex",gap:10,marginBottom:8,textAlign:"left"}},
          h("span",{style:{fontSize:16,flexShrink:0}},row[0]),
          h("p",{style:{color:"rgba(255,255,255,.8)",fontSize:13,lineHeight:1.5}},row[1])
        );
      })
    ),
    h("button",{onClick:p.done,style:{background:GOLD,border:"none",borderRadius:14,padding:"15px 32px",color:"#000",fontWeight:800,fontSize:16,cursor:"pointer"}},"Back to Login")
  );

  return h("div",{style:{minHeight:"100dvh",paddingBottom:50},className:"page"},
    h(PHdr,{back:function(){if(step>1){setStep(step-1);setErr("");}else p.done();},title:"Become a Rider",sub:"Step "+step+" of 4 — Earn GHS 27 per ride"}),
    // Progress
    h("div",{style:{display:"flex",gap:4,padding:"10px 16px 0"}},
      [1,2,3,4].map(function(s){ return h("div",{key:s,style:{flex:1,height:4,borderRadius:4,background:step>=s?GOLD:"rgba(27,122,47,.1)",transition:"background .3s"}}); })
    ),
    h("div",{style:{padding:"20px 16px"}},

      // STEP 1 — Personal Info
      step===1&&h("div",{className:"page"},
        h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:14,padding:"14px 16px",marginBottom:18,border:"1px solid rgba(27,122,47,.1)"}},
          h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14",marginBottom:4}},"👤 Personal Information"),
          h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.6}},"Tell us about yourself. Your details will be reviewed by OkadaRide admin.")
        ),
        h(TInput,{label:"Full Name",placeholder:"e.g. Kofi Mensah",value:fullName,onChange:function(e){setFullName(e.target.value);setErr("");},autoComplete:"name",cap:"words"}),
        h(TInput,{label:"📱 Phone Number",placeholder:"e.g. 0241234567",value:phone,onChange:function(e){setPhone(e.target.value);setErr("");},type:"tel",inputMode:"tel",autoComplete:"tel"}),
        h("div",{style:{marginBottom:14}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645",marginBottom:8}},"Gender"),
          h("div",{style:{display:"flex",gap:10}},
            [["male","👨🏾 Male"],["female","👩🏾 Female"]].map(function(row){
              var on=gender===row[0];
              return h("button",{key:row[0],onClick:function(){setGender(row[0]);setErr("");},
                style:{flex:1,padding:"13px",borderRadius:12,border:"2px solid "+(on?G:BDR),background:on?"rgba(27,122,47,.08)":"#fff",color:on?G:"#3D6645",fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s"}
              },row[1]);
            })
          )
        ),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:next,dis:!fullName.trim()||phone.replace(/\D/g,"").length<9||!gender,kids:"Next →"})
      ),

      // STEP 2 — Tricycle Info
      step===2&&h("div",{className:"page"},
        h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:14,padding:"14px 16px",marginBottom:18,border:"1px solid rgba(27,122,47,.1)"}},
          h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14",marginBottom:4}},"🛺 Your Tricycle Details"),
          h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.6}},"Enter your tricycle information exactly as it appears on your registration.")
        ),
        h(TInput,{label:"Plate Number",placeholder:"e.g. GR-1234-20",value:plate,onChange:function(e){setPlate(e.target.value.toUpperCase());setErr("");},cap:"characters",style:{fontSize:18,fontWeight:800,textAlign:"center",letterSpacing:2}}),
        h("p",{style:{color:"#85A88C",fontSize:12,marginBottom:14,marginTop:-10}},"Enter exactly as on your registration document"),
        h("div",{style:{marginBottom:14}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645",marginBottom:8}},"Tricycle Colour"),
          h("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
            COLOURS.map(function(c){
              var on=color===c;
              return h("button",{key:c,onClick:function(){setColor(c);setErr("");},
                style:{padding:"8px 14px",borderRadius:20,border:"2px solid "+(on?G:BDR),background:on?"rgba(27,122,47,.1)":"#fff",color:on?G:"#3D6645",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s"}
              },c);
            })
          )
        ),
        h("div",{style:{marginBottom:14}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645",marginBottom:8}},"Year of Tricycle"),
          h("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
            YEARS.map(function(y){
              var on=year===y;
              return h("button",{key:y,onClick:function(){setYear(y);setErr("");},
                style:{padding:"8px 14px",borderRadius:20,border:"2px solid "+(on?G:BDR),background:on?"rgba(27,122,47,.1)":"#fff",color:on?G:"#3D6645",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s"}
              },y);
            })
          )
        ),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:next,dis:!plate.trim()||!color||!year,kids:"Next →"})
      ),

      // STEP 3 — Documents & Photo
      step===3&&h("div",{className:"page"},
        h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:14,padding:"14px 16px",marginBottom:18,border:"1px solid rgba(27,122,47,.1)"}},
          h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14",marginBottom:4}},"📸 Photos & Documents"),
          h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.6}},"We need your photo and tricycle photo so passengers can identify you.")
        ),
        // Profile photo
        h("div",{style:{marginBottom:18}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645",marginBottom:8}},"Your Profile Photo"),
          h("div",{style:{display:"flex",alignItems:"center",gap:14}},
            h("div",{onClick:function(){photoRef.current&&photoRef.current.click();},
              style:{width:80,height:80,borderRadius:"50%",background:photo?"transparent":"rgba(27,122,47,.08)",border:"3px dashed "+(photo?G:BDR),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",flexShrink:0}
            },
              photo?h("img",{src:photo,style:{width:"100%",height:"100%",objectFit:"cover"}}):h("div",{style:{textAlign:"center"}},h("div",{style:{fontSize:24}},"📷"),h("p",{style:{color:"#85A88C",fontSize:9,marginTop:2}},"Tap to add"))
            ),
            h("input",{ref:photoRef,type:"file",accept:"image/*",capture:"user",onChange:function(e){pickFile(e,setPhoto);},style:{display:"none"}}),
            h("div",null,
              h("p",{style:{fontWeight:700,fontSize:13,color:"#0D2E14",marginBottom:3}},"Clear face photo"),
              h("p",{style:{color:"#85A88C",fontSize:12,lineHeight:1.5}},"Passengers use this to identify you when you arrive")
            )
          )
        ),
        // Bike photo
        h("div",{style:{marginBottom:18}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645",marginBottom:8}},"Tricycle Photo"),
          h("div",{style:{display:"flex",alignItems:"center",gap:14}},
            h("div",{onClick:function(){bikeRef.current&&bikeRef.current.click();},
              style:{width:80,height:80,borderRadius:14,background:bikePhoto?"transparent":"rgba(27,122,47,.08)",border:"3px dashed "+(bikePhoto?G:BDR),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",flexShrink:0}
            },
              bikePhoto?h("img",{src:bikePhoto,style:{width:"100%",height:"100%",objectFit:"cover"}}):h("div",{style:{textAlign:"center"}},h("div",{style:{fontSize:24}},"🛺"),h("p",{style:{color:"#85A88C",fontSize:9,marginTop:2}},"Tap to add"))
            ),
            h("input",{ref:bikeRef,type:"file",accept:"image/*",capture:"environment",onChange:function(e){pickFile(e,setBikePhoto);},style:{display:"none"}}),
            h("div",null,
              h("p",{style:{fontWeight:700,fontSize:13,color:"#0D2E14",marginBottom:3}},"Photo of your tricycle"),
              h("p",{style:{color:"#85A88C",fontSize:12,lineHeight:1.5}},"Show the full tricycle with plate number visible")
            )
          )
        ),
        h(TInput,{label:"🪪 Ghana Card Number",placeholder:"e.g. GHA-123456789-0",value:ghCard,onChange:function(e){setGhCard(e.target.value.toUpperCase());setErr("");},cap:"characters"}),
        h("p",{style:{color:"#85A88C",fontSize:12,marginBottom:14,marginTop:-10}},"Required for identity verification"),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:next,dis:!photo||!bikePhoto||!ghCard.trim(),kids:"Next →"})
      ),

      // STEP 4 — Review & Submit
      step===4&&h("div",{className:"page"},
        h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:14,padding:"14px 16px",marginBottom:18,border:"1px solid rgba(27,122,47,.1)"}},
          h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14",marginBottom:4}},"✅ Review Your Application"),
          h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.6}},"Please check your details before submitting. Admin will review within 1-2 working days.")
        ),
        // Summary card
        h("div",{style:{background:"#fff",borderRadius:18,overflow:"hidden",border:"1.5px solid rgba(27,122,47,.12)",boxShadow:"0 3px 16px rgba(0,0,0,.06)",marginBottom:14}},
          // Photo header
          h("div",{style:{background:GRD,padding:"16px",display:"flex",alignItems:"center",gap:14}},
            h("div",{style:{width:60,height:60,borderRadius:"50%",overflow:"hidden",border:"3px solid rgba(255,255,255,.4)",flexShrink:0}},
              photo?h("img",{src:photo,style:{width:"100%",height:"100%",objectFit:"cover"}}):h("span",{style:{fontSize:30}},"🧑🏾")
            ),
            h("div",null,
              h("p",{style:{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17,color:"#fff"}}),fullName,
              h("p",{style:{color:GOLD,fontWeight:700,fontSize:13,marginTop:3}},"🛺 "+plate.toUpperCase())
            )
          ),
          [
            ["📞","Phone",phone],
            ["👤","Gender",gender.charAt(0).toUpperCase()+gender.slice(1)],
            ["🎨","Tricycle Colour",color],
            ["📅","Year",year],
            ["🪪","Ghana Card",ghCard],
            ["📍","Location","Sunyani, Brong-Ahafo"]
          ].map(function(row,i,arr){
            return h("div",{key:i,style:{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid rgba(27,122,47,.07)":"none"}},
              h("span",{style:{fontSize:16,flexShrink:0}},row[0]),
              h("div",{style:{flex:1}},
                h("p",{style:{color:"#85A88C",fontSize:11,fontWeight:600,marginBottom:1}},row[1].toUpperCase()),
                h("p",{style:{color:"#0D2E14",fontSize:13,fontWeight:700}},row[2])
              )
            );
          })
        ),
        // Tricycle photo preview
        bikePhoto&&h("div",{style:{marginBottom:14}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645",marginBottom:8}},"Tricycle Photo"),
          h("div",{style:{borderRadius:14,overflow:"hidden",border:"1.5px solid "+BDR,height:140}},
            h("img",{src:bikePhoto,style:{width:"100%",height:"100%",objectFit:"cover"}})
          )
        ),
        // Earnings info
        h("div",{style:{background:"linear-gradient(135deg,rgba(255,179,0,.12),rgba(255,179,0,.05))",borderRadius:14,padding:"14px 16px",marginBottom:14,border:"1.5px solid rgba(255,179,0,.25)"}},
          h("p",{style:{fontWeight:800,fontSize:14,color:"#0D2E14",marginBottom:8}},"💰 Your Potential Earnings"),
          h("div",{style:{display:"flex",gap:10}},
            [["GHS 27","Per ride (90%)"],["GHS 270","10 rides/day"],["GHS 1,890","Per week"]].map(function(row,i){
              return h("div",{key:i,style:{flex:1,background:"rgba(255,255,255,.6)",borderRadius:10,padding:"8px",textAlign:"center"}},
                h("p",{style:{fontFamily:"'Syne',sans-serif",fontWeight:900,color:G,fontSize:14}},row[0]),
                h("p",{style:{color:"#3D6645",fontSize:9,fontWeight:700,marginTop:2}},row[1])
              );
            })
          )
        ),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:submit,dis:load,kids:load?h(Spin,null):"Submit Application 🛺"})
      )
    )
  );
}


// ── LOGIN ─────────────────────────────────────────────────────────────────────

// ── MAP PICKER COMPONENT ──────────────────────────────────────────────────────
