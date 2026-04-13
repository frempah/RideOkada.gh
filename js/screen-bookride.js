/* ═══════════════════════════════════════════
   OkadaRide — BookRide Screen
   ═══════════════════════════════════════════ */
'use strict';

function BookRide(p){
  var _sel = useState(null); var sel = _sel[0]; var setSel = _sel[1];
  var _pay = useState("cash"); var pay = _pay[0]; var setPay = _pay[1];
  var _saving = useState(false); var saving = _saving[0]; var setSaving = _saving[1];
  var _drivers = useState([]); var drivers = _drivers[0]; var setDrivers = _drivers[1];
  var _loading = useState(true); var loading = _loading[0]; var setLoading = _loading[1];
  var _confirm = useState(false); var confirm = _confirm[0]; var setConfirm = _confirm[1];
  var fare = p.fare;

  useEffect(function(){
    DB.getDrivers().then(function(real){
      setDrivers(real.length>0 ? real.map(function(d){ return Object.assign({},d,{name:d.fullName||d.name,eta:"~3 min"}); }) : DEMO_DRIVERS);
      setLoading(false);
    });
  },[]);

  var doBook = async function(){
    // Rate limit check — max 3 bookings per hour
    var rateCheck = SEC.checkBookingRate(p.user.phone);
    if(!rateCheck.allowed){
      alert("⚠️ Too many bookings!\n\nYou have made "+rateCheck.count+" bookings in the last hour.\nPlease wait "+rateCheck.waitMins+" minute"+(rateCheck.waitMins===1?"":"s")+" before booking again.");
      setSaving(false); return;
    }
    setSaving(true);
    var data = {passengerName:p.user.name,passengerPhone:p.user.phone,passengerPhotoURL:p.user.photoURL||"",pickup:p.pickup,dropoff:p.dropoff,region:"Brong-Ahafo",driverName:sel.name,driverPlate:sel.plate,driverPhone:sel.phone||"",paymentMethod:pay,fare:fare};
    var r = await DB.saveBooking(data);
    SEC.recordBooking(p.user.phone);
    sendWA(sel.phone,"🔔 *New OkadaRide Request!*\n\nHello "+sel.name+"!\n\n👤 Passenger: *"+p.user.name+"*\n📞 Contact: *"+p.user.phone+"*\n📍 Pickup: "+p.pickup+"\n🎯 Dropoff: "+p.dropoff+"\n💰 Fare: GHS "+fare+"\n📱 Payment: "+(pay==="cash"?"Cash":"MoMo")+"\n\n_OkadaRide Sunyani 🇬🇭_");
    setTimeout(function(){sendWA("233542008513","🔔 New Booking!\nPassenger: "+p.user.name+" ("+p.user.phone+")\nPickup: "+p.pickup+"\nDropoff: "+p.dropoff+"\nRider: "+sel.name+" ("+sel.plate+")\nFare: GHS "+fare);},1500);
    setSaving(false);
    p.onConfirm(sel, pay, r.id||"", fare);
  };

  if(confirm) return h("div",{style:{minHeight:"100dvh",paddingBottom:40},className:"pop-in"},
    h(PHdr,{back:function(){setConfirm(false);},title:"Confirm Booking",sub:"Review before we notify your rider"}),
    h("div",{style:{padding:"16px"}},
      h(Card,{kids:[
        h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14",marginBottom:14}},sel.name+" — "+sel.plate),
        [["📍 Pickup",p.pickup],["🎯 Dropoff",p.dropoff],["💰 Fare","GHS "+fare+(fare===0?" — FREE 🎉":"")],["📱 Payment",pay==="cash"?"💵 Cash":"📱 MoMo"]].map(function(row,i){
          return h("div",{key:i,style:{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<3?"1px solid rgba(27,122,47,.08)":"none"}},
            h("p",{style:{color:"#85A88C",fontSize:13,fontWeight:600}},row[0]),
            h("p",{style:{color:"#0D2E14",fontWeight:700,fontSize:13}},row[1])
          );
        })
      ]}),
      h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:13,padding:"13px 15px",marginBottom:14,display:"flex",gap:10,border:"1px solid rgba(27,122,47,.1)"}},
        h("span",null,"🤝"),
        h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.6}},"We apologise in advance for any inconvenience. Your rider is verified and committed to your safety.")
      ),
      h(PBtn,{onClick:doBook,dis:saving,kids:saving?h(Spin,null):"Confirm & Notify Rider 🛺"})
    )
  );

  return h("div",{style:{minHeight:"100dvh",paddingBottom:40},className:"page"},
    h(PHdr,{back:p.onBack,title:"Choose Your Rider",sub:"GHS "+fare+" flat · "+p.pickup+" → "+p.dropoff}),
    h("div",{style:{padding:"14px 16px"}},
      loading
        ? h("div",{style:{textAlign:"center",padding:40}},h(Spin,{co:G,sz:32}),h("p",{style:{color:"#85A88C",marginTop:12,fontWeight:600}},"Finding riders..."))
        : h("div",null,
          h("p",{style:{fontWeight:700,fontSize:12,color:"#85A88C",marginBottom:10,textTransform:"uppercase",letterSpacing:.5}},drivers.length+" rider"+(drivers.length!==1?"s":"")+" available"),
          drivers.map(function(d){
            var on = sel&&sel.id===d.id;
            return h("div",{key:d.id,onClick:function(){setSel(d);},
              className:"tap-card",style:{background:on?"rgba(27,122,47,.07)":"#fff",border:"2px solid "+(on?G:BDR),borderRadius:16,padding:"14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:9,boxShadow:on?"0 4px 16px rgba(27,122,47,.15)":"0 2px 8px rgba(0,0,0,.04)",transition:"all .2s"}
            },
              h("div",{style:{width:50,height:50,borderRadius:"50%",background:on?"rgba(27,122,47,.12)":BG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:"2px solid "+(on?G:BDR)}},"🧑🏾"),
              h("div",{style:{flex:1}},
                h("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:3}},
                  h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14"}},d.name),
                  d.verified&&h("span",{style:{background:"rgba(0,200,83,.12)",color:"#00C853",fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:20}},"✓")
                ),
                h("p",{style:{color:"#3D6645",fontSize:12}},"⭐ "+d.rating+" · 🛺 "+d.plate),
                h("p",{style:{color:"#85A88C",fontSize:11,marginTop:1}},"🎨 "+d.color+" tricycle")
              ),
              h("div",{style:{background:"rgba(0,200,83,.1)",color:"#00C853",borderRadius:20,padding:"5px 11px",fontWeight:700,fontSize:12,flexShrink:0}},d.eta||"~3 min")
            );
          }),
          h("div",{style:{height:1,background:BDR,margin:"14px 0"}}),
          h("p",{style:{fontWeight:800,fontSize:14,color:"#0D2E14",marginBottom:10}},"💳 Payment Method"),
          h("div",{style:{display:"flex",gap:10,marginBottom:14}},
            [["cash","💵","Cash","Pay rider directly"],["momo","📱","MoMo","Mobile Money"]].map(function(row){
              var on = pay===row[0];
              return h("div",{key:row[0],onClick:function(){setPay(row[0]);},
                style:{flex:1,padding:"14px 10px",borderRadius:14,textAlign:"center",cursor:"pointer",border:"2px solid "+(on?G:BDR),background:on?"rgba(27,122,47,.07)":"#fff",transition:"all .2s",boxShadow:on?"0 3px 12px rgba(27,122,47,.15)":"none"}
              },
                h("p",{style:{fontSize:26,marginBottom:5}},row[1]),
                h("p",{style:{fontWeight:800,fontSize:13,color:on?G:"#0D2E14",marginBottom:2}},row[2]),
                h("p",{style:{fontSize:11,color:"#85A88C"}},row[3])
              );
            })
          ),
          sel&&h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:13,padding:"12px 15px",marginBottom:14,border:"1px solid rgba(27,122,47,.12)",display:"flex",justifyContent:"space-between",alignItems:"center"}},
            h("div",null,h("p",{style:{fontSize:11,color:"#85A88C",fontWeight:700,marginBottom:3}},"TOTAL FARE"),h("p",{style:{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,color:fare===0?"#00C853":G}},fare===0?"FREE 🎉":"GHS "+fare)),
            h("div",{style:{textAlign:"right"}},h("p",{style:{fontSize:11,color:"#85A88C",fontWeight:700,marginBottom:3}},"PAYING BY"),h("p",{style:{fontWeight:700,color:"#0D2E14",fontSize:14}},pay==="cash"?"💵 Cash":"📱 MoMo"))
          ),
          h(PBtn,{dis:!sel,onClick:function(){setConfirm(true);},kids:h("span",{style:{display:"flex",alignItems:"center",gap:8}},h("span",null,"→"),"Continue to Confirm")})
        )
    )
  );
}

// ── TRACKING ─────────────────────────────────────────────────────────────────
// ── TRACKING ─────────────────────────────────────────────────────────────────
function Tracking(p){
  var _st=useState("requested"); var status=_st[0]; var setStatus=_st[1];
  var _rl=useState(null); var riderLoc=_rl[0]; var setRiderLoc=_rl[1];
  var _ml=useState(null); var myLoc=_ml[0]; var setMyLoc=_ml[1];
  var _gErr=useState(""); var gpsErr=_gErr[0]; var setGpsErr=_gErr[1];
  var mapRef=useRef(null);
  var mapObj=useRef(null);
  var riderMarker=useRef(null);
  var myMarker=useRef(null);
  var routeLine=useRef(null);

  // Watch booking status + rider location
  useEffect(function(){
    if(!p.bookingId) return;
    var unsub=DB.watchRiderLocation(p.bookingId,function(loc){
      setStatus(loc.status);
      setRiderLoc({lat:loc.lat,lng:loc.lng});
      if(loc.status==="accepted"||loc.status==="completed") p.onAccepted();
    });
    return function(){ try{if(unsub)unsub();}catch(e){} };
  },[p.bookingId]);

  // Get passenger's own GPS location
  useEffect(function(){
    if(!navigator.geolocation){ setGpsErr("GPS not available on this device"); return; }
    var wid=navigator.geolocation.watchPosition(
      function(pos){
        setMyLoc({lat:pos.coords.latitude, lng:pos.coords.longitude});
        setGpsErr("");
      },
      function(err){
        if(err.code===1) setGpsErr("Please allow location access for live tracking");
        else setGpsErr("GPS signal weak — trying...");
      },
      {enableHighAccuracy:true, maximumAge:10000, timeout:15000}
    );
    return function(){ navigator.geolocation.clearWatch(wid); };
  },[]);

  // Init map when component mounts
  useEffect(function(){
    if(!mapRef.current || mapObj.current) return;
    // Sunyani default center
    var defaultLat=7.3349, defaultLng=-2.3267;
    try{
      var map=window.L.map(mapRef.current,{
        center:[defaultLat,defaultLng],
        zoom:14,
        zoomControl:true,
        attributionControl:false
      });
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19
      }).addTo(map);
      mapObj.current=map;

      // Passenger marker (green)
      var myIcon=window.L.divIcon({
        html:'<div style="width:36px;height:36px;background:linear-gradient(135deg,#0D4A1A,#1B7A2F);border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,.3)">🧑🏾</div>',
        iconSize:[36,36],iconAnchor:[18,18],className:''
      });
      myMarker.current=window.L.marker([defaultLat,defaultLng],{icon:myIcon}).addTo(map);
      myMarker.current.bindPopup("<b>Your location</b>");

      // Rider marker (gold)
      var riderIcon=window.L.divIcon({
        html:'<div style="width:40px;height:40px;background:linear-gradient(135deg,#FFB300,#E65100);border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 3px 10px rgba(0,0,0,.3)">🛺</div>',
        iconSize:[40,40],iconAnchor:[20,20],className:''
      });
      riderMarker.current=window.L.marker([defaultLat,defaultLng],{icon:riderIcon}).addTo(map);
      riderMarker.current.bindPopup("<b>Your Rider</b><br>"+(p.driver&&p.driver.name||""));
    }catch(e){ console.log("Map init error:",e); }

    return function(){
      try{ if(mapObj.current){ mapObj.current.remove(); mapObj.current=null; } }catch(e){}
    };
  },[]);

  // Update my location on map
  useEffect(function(){
    if(!mapObj.current||!myLoc||!myMarker.current) return;
    try{ myMarker.current.setLatLng([myLoc.lat,myLoc.lng]); }catch(e){}
  },[myLoc]);

  // Update rider location on map
  useEffect(function(){
    if(!mapObj.current||!riderLoc||!riderMarker.current) return;
    try{
      riderMarker.current.setLatLng([riderLoc.lat,riderLoc.lng]);
      // Draw route line between rider and passenger
      if(myLoc){
        if(routeLine.current){ routeLine.current.remove(); }
        routeLine.current=window.L.polyline(
          [[riderLoc.lat,riderLoc.lng],[myLoc.lat,myLoc.lng]],
          {color:'#1B7A2F',weight:4,opacity:.7,dashArray:'8,8'}
        ).addTo(mapObj.current);
        // Fit map to show both markers
        mapObj.current.fitBounds([
          [riderLoc.lat,riderLoc.lng],
          [myLoc.lat,myLoc.lng]
        ],{padding:[40,40]});
      }
    }catch(e){}
  },[riderLoc,myLoc]);

  var openGoogleMaps=function(){
    var dest=encodeURIComponent(p.pickup+", Sunyani, Ghana");
    window.open("https://www.google.com/maps/search/?api=1&query="+dest,"_blank");
  };

  var steps=[
    ["Booking Sent","Rider notified via WhatsApp 📱",true],
    ["Rider Accepted",(p.driver&&p.driver.name||"Rider")+" is on the way 🛺",status==="accepted"||status==="completed"],
    ["Rider Arriving","Almost at your pickup point",status==="completed"]
  ];

  return h("div",{style:{minHeight:"100dvh",paddingBottom:40},className:"page"},
    h(PHdr,{back:p.onHome,
      title:status==="requested"?"⏳ Waiting for Rider...":"🎉 Rider Accepted!",
      sub:p.pickup+" → "+p.dropoff
    }),
    h("div",{style:{padding:"14px 16px"}},

      // ── LIVE MAP
      h("div",{style:{background:"#fff",borderRadius:18,overflow:"hidden",border:"1.5px solid rgba(27,122,47,.15)",boxShadow:"0 3px 16px rgba(0,0,0,.08)",marginBottom:14}},
        h("div",{style:{background:GRD,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}},
          h("p",{style:{color:"#fff",fontWeight:800,fontSize:14}},"📍 Live Tracking"),
          h("div",{style:{display:"flex",alignItems:"center",gap:6,background:"rgba(0,200,83,.2)",borderRadius:20,padding:"4px 10px"}},
            h("div",{style:{width:7,height:7,borderRadius:"50%",background:"#00C853"}}),
            h("p",{style:{color:"#00C853",fontSize:11,fontWeight:700}},riderLoc?"Live":"Waiting...")
          )
        ),
        // Map container
        h("div",{ref:mapRef,style:{height:"220px",width:"100%",background:"#e8f5e9"}}),
        // Map legend
        h("div",{style:{padding:"10px 14px",display:"flex",gap:16,borderTop:"1px solid rgba(27,122,47,.08)"}},
          h("div",{style:{display:"flex",alignItems:"center",gap:6}},
            h("div",{style:{fontSize:16}},"🧑🏾"),
            h("p",{style:{fontSize:12,color:"#3D6645",fontWeight:600}},gpsErr?"GPS error":"Your location")
          ),
          h("div",{style:{display:"flex",alignItems:"center",gap:6}},
            h("div",{style:{fontSize:16}},"🛺"),
            h("p",{style:{fontSize:12,color:"#3D6645",fontWeight:600}},riderLoc?"Rider live":"Waiting for rider")
          ),
          h("div",{style:{flex:1,textAlign:"right"}},
            h("button",{onClick:openGoogleMaps,
              style:{background:GRD,border:"none",color:"#fff",borderRadius:10,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}
            },"🗺️ Google Maps")
          )
        ),
        gpsErr&&h("div",{style:{padding:"8px 14px",background:"rgba(255,179,0,.1)",borderTop:"1px solid rgba(255,179,0,.2)"}},
          h("p",{style:{color:"#E65100",fontSize:12,fontWeight:600}},"⚠️ "+gpsErr)
        )
      ),

      // ── STATUS STEPS
      h(Card,{kids:[
        h("p",{style:{fontWeight:800,fontSize:14,color:"#0D2E14",marginBottom:16}},"📋 Booking Status"),
        steps.map(function(s,i){
          return h("div",{key:i,style:{display:"flex",gap:12,marginBottom:i<2?16:0}},
            h("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}},
              h("div",{style:{width:34,height:34,borderRadius:"50%",background:s[2]?GRD:"rgba(0,0,0,.05)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:s[2]?"0 3px 10px rgba(13,74,26,.25)":"none"}},
                s[2]?h("span",{style:{color:"#fff",fontSize:14,fontWeight:900}},"✓"):h("span",{style:{color:"#ccc",fontSize:13}},"○")
              ),
              i<2&&h("div",{style:{width:2,height:18,background:s[2]?G:"rgba(0,0,0,.07)",marginTop:3}})
            ),
            h("div",{style:{paddingTop:6}},
              h("p",{style:{fontWeight:800,fontSize:13,color:s[2]?"#0D2E14":"#ccc"}},s[0]),
              h("p",{style:{color:s[2]?"#3D6645":"#ccc",fontSize:12,marginTop:2}},s[1])
            )
          );
        })
      ]}),

      // ── DRIVER CARD
      p.driver&&h(Card,{kids:[
        h("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(27,122,47,.08)"}},
          h("div",{style:{width:50,height:50,borderRadius:"50%",background:GRD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}},"🧑🏾"),
          h("div",{style:{flex:1}},
            h("p",{style:{fontWeight:800,fontSize:15,color:"#0D2E14"}},p.driver.name||"Your Rider"),
            h("p",{style:{color:"#3D6645",fontSize:12,marginTop:2}},"⭐ "+(p.driver.rating||"4.8")+" · 🛺 "+(p.driver.plate||""))
          ),
          h("div",{style:{background:"rgba(0,200,83,.1)",borderRadius:20,padding:"5px 11px"}},
            h("p",{style:{color:"#00C853",fontSize:12,fontWeight:700}},p.driver.eta||"~3 min")
          )
        ),
        h("div",{style:{display:"flex",gap:10}},
          h("a",{href:"tel:"+(p.driver.phone||""),style:{flex:1,textDecoration:"none"}},
            h("div",{style:{background:GRD,borderRadius:12,padding:"13px",textAlign:"center",boxShadow:"0 3px 10px rgba(13,74,26,.25)"}},
              h("p",{style:{fontSize:20,marginBottom:3}},"📞"),h("p",{style:{color:"#fff",fontWeight:800,fontSize:13}},"Call")
            )
          ),
          h("div",{onClick:function(){if(p.driver&&p.driver.phone)sendWA(p.driver.phone,"Hello! I am your OkadaRide passenger "+(p.user&&p.user.name||"")+". Ready at "+p.pickup+".");},
            style:{flex:1,background:"linear-gradient(135deg,#25D366,#128C7E)",borderRadius:12,padding:"13px",textAlign:"center",cursor:"pointer",boxShadow:"0 3px 10px rgba(37,211,102,.2)"}
          },h("p",{style:{fontSize:20,marginBottom:3}},"💬"),h("p",{style:{color:"#fff",fontWeight:800,fontSize:13}},"WhatsApp"))
        )
      ]}),

      // ── FARE
      h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:14,padding:"13px 15px",marginBottom:12,border:"1px solid rgba(27,122,47,.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}},
        h("div",null,
          h("p",{style:{fontSize:11,color:"#85A88C",fontWeight:700,marginBottom:3}},"TOTAL FARE"),
          h("p",{style:{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,color:p.fare===0?"#00C853":G}},p.fare===0?"FREE 🎉":"GHS "+p.fare)
        ),
        h("div",{style:{textAlign:"right"}},
          h("p",{style:{fontSize:11,color:"#85A88C",fontWeight:700,marginBottom:3}},"PAYMENT"),
          h("p",{style:{fontWeight:700,color:"#0D2E14",fontSize:14}},p.pay==="cash"?"💵 Cash":"📱 MoMo")
        )
      ),

      h(GBtn,{onClick:p.onHome,style:{marginBottom:10},kids:"🏠 Back to Home"}),
      h(GBtn,{onClick:p.onCancel,red:true,kids:"Cancel Booking"})
    )
  );
}



// ── TRIPS ─────────────────────────────────────────────────────────────────────
function Trips(p){
  var _locked = useState(true); var locked = _locked[0]; var setLocked = _locked[1];
  var _pi = useState(""); var pi = _pi[0]; var setPi = _pi[1];
  var _err = useState(""); var err = _err[0]; var setErr = _err[1];
  var _rides = useState([]); var rides = _rides[0]; var setRides = _rides[1];
  var _load = useState(false); var load = _load[0]; var setLoad = _load[1];

  var unlock = async function(){
    var lockKey = "trips_"+(p.user.phone||"").replace(/\D/g,"");
    var lockStatus = SEC.isLocked(lockKey);
    if(lockStatus.locked){
      setErr("Locked for "+lockStatus.minsLeft+" more minute"+(lockStatus.minsLeft===1?"":"s")+".");
      return;
    }
    var match = await checkPin(pi, p.user.pin);
    if(match){
      SEC.clearFails(lockKey);
      setLocked(false); setErr("");
    } else {
      var result = SEC.recordFail(lockKey);
      if(result.locked){
        setErr("Locked for 30 minutes after too many wrong PINs.");
      } else {
        setErr("Wrong PIN. "+result.attemptsLeft+" attempt"+(result.attemptsLeft===1?"":"s")+" left.");
      }
      setPi("");
    }
  };

  useEffect(function(){
    if(!locked){ setLoad(true); DB.getMyRides(p.user.phone).then(function(r){ setRides(r); setLoad(false); }); }
  },[locked]);

  if(locked) return h("div",{style:{minHeight:"100dvh",background:BG},className:"page"},
    h(PHdr,{title:"📋 Trip History",sub:"Protected by your secret PIN"}),
    h("div",{style:{padding:"24px 16px",display:"flex",justifyContent:"center"}},
      h("div",{style:{background:"#fff",borderRadius:20,padding:"28px 22px",width:"100%",maxWidth:320,textAlign:"center",border:"1.5px solid "+BDR,boxShadow:"0 4px 20px rgba(0,0,0,.07)"}},
        h("div",{style:{width:64,height:64,borderRadius:20,background:"rgba(27,122,47,.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:30}},"🔐"),
        h("p",{style:{fontWeight:900,fontSize:17,color:"#0D2E14",marginBottom:5}},"Enter Your PIN"),
        h("p",{style:{color:"#85A88C",fontSize:13,marginBottom:20,lineHeight:1.6}},"Your trip history is private\nand protected by your PIN"),
        h(PinIn,{value:pi,onChange:function(e){setPi(e.target.value.replace(/\D/g,"").slice(0,4));setErr("");},onKey:function(e){if(e.key==="Enter")unlock();},mb:12}),
        h(ErrMsg,{msg:err}),
        h(PBtn,{onClick:unlock,dis:pi.length<4,kids:"Unlock 🔓"})
      )
    )
  );

  return h("div",{style:{minHeight:"100dvh",background:BG,paddingBottom:90},className:"page"},
    h("div",{style:{background:GRD,position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 14px rgba(0,0,0,.18)"}},
      h(Ghana,null),
      h("div",{style:{padding:"13px 16px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}},
        h("div",null,
          h("p",{style:{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#fff"}},"📋 My Trips"),
          h("p",{style:{color:"rgba(255,255,255,.55)",fontSize:12,marginTop:2}},rides.length+" ride"+(rides.length!==1?"s":"")+" total")
        ),
        h("button",{onClick:function(){setLocked(true);setPi("");},style:{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.8)",borderRadius:10,padding:"8px 13px",fontSize:12,fontWeight:700,cursor:"pointer"}},"🔒 Lock")
      )
    ),
    h("div",{style:{padding:"14px 16px"}},
      load && h("div",{style:{textAlign:"center",padding:44}},h(Spin,{co:G,sz:32}),h("p",{style:{color:"#85A88C",fontWeight:600,marginTop:12}},"Loading your trips...")),
      !load && rides.length===0 && h("div",{style:{textAlign:"center",padding:"54px 16px"}},
        h("div",{style:{fontSize:52,marginBottom:14,animation:"float 2s ease-in-out infinite"}},"🛺"),
        h("p",{style:{fontWeight:900,fontSize:17,color:"#0D2E14",marginBottom:6}},"No trips yet"),
        h("p",{style:{color:"#85A88C",fontSize:13,lineHeight:1.7}},"Book your first ride!\nYour trips will appear here.")
      ),
      !load && rides.map(function(r,i){
        return h("div",{key:r.id||i,style:{background:"#fff",borderRadius:16,padding:"15px",border:"1.5px solid rgba(27,122,47,.1)",boxShadow:"0 2px 10px rgba(0,0,0,.05)",marginBottom:10}},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}},
            h("div",{style:{flex:1,marginRight:10}},
              h("p",{style:{fontWeight:800,fontSize:13,color:"#0D2E14",marginBottom:3}},(r.pickup||"—")+" → "+(r.dropoff||"—")),
              h("p",{style:{color:"#85A88C",fontSize:12}},"🛺 "+(r.driverName||"Rider")+" · "+fmtDate(r.createdAt))
            ),
            h("div",{style:{textAlign:"right",flexShrink:0}},
              h("p",{style:{fontFamily:"'Syne',sans-serif",fontWeight:900,color:G,fontSize:16,marginBottom:4}},"GHS "+(r.fare||FARE)),
              h("div",{style:{background:r.status==="completed"?"rgba(0,200,83,.1)":"rgba(255,179,0,.12)",borderRadius:20,padding:"3px 10px",display:"inline-block"}},
                h("p",{style:{color:r.status==="completed"?"#007A33":"#E65100",fontWeight:700,fontSize:10,textTransform:"capitalize"}},r.status||"requested")
              )
            )
          )
        );
      })
    )
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
