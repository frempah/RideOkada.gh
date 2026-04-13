/* ═══════════════════════════════════════════
   OkadaRide — Rider Dashboard Screen
   ═══════════════════════════════════════════ */
'use strict';

function RiderDash(p){
  var driver = p.driver;
  var _b = useState([]); var bookings = _b[0]; var setBookings = _b[1];
  var _tab = useState("rides"); var tab = _tab[0]; var setTab = _tab[1];
  var _toast = useState(null); var toast = _toast[0]; var setToast = _toast[1];
  var _busy = useState({}); var busy = _busy[0]; var setBusy = _busy[1];

  var toast2 = function(msg,type){ setToast({msg:msg,type:type||"ok"}); setTimeout(function(){setToast(null);},3000); };

  useEffect(function(){
    if(!driver||!driver.plate) return;
    var name = driver.fullName||driver.name||"";
    var plate = driver.plate||"";
    var u1, u2;
    try{ u1 = DB.watchRider(name,plate,function(b){
      setBookings(function(prev){
        var nr = b.filter(function(x){return x.status==="requested";}).length;
        var pr = prev.filter(function(x){return x.status==="requested";}).length;
        if(nr>pr) toast2("🔔 New ride request!","new");
        return b.sort(function(a,c){return ((c.createdAt&&c.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0);});
      });
    }); }catch(e){}
    try{ u2 = DB.watchRiderByPlate(plate,function(b){
      setBookings(function(prev){
        var ids = new Set(prev.map(function(x){return x.id;}));
        return prev.concat(b.filter(function(x){return !ids.has(x.id);}))
          .sort(function(a,c){return ((c.createdAt&&c.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0);});
      });
    }); }catch(e){}
    return function(){ try{if(u1)u1();}catch(e){} try{if(u2)u2();}catch(e){} };
  },[driver]);

  var doAccept = async function(b){
    setBusy(function(prev){return Object.assign({},prev,{[b.id]:"accept"});});
    var r = await DB.updateBooking(b.id,{status:"accepted",acceptedAt:new Date().toISOString(),driverName:driver.fullName||driver.name||"",driverPlate:driver.plate,driverPhone:driver.phone||""});
    if(r.ok){
      toast2("✅ Accepted! Notifying passenger...","ok");
      // Start sharing rider GPS location every 10 seconds
      if(navigator.geolocation){
        var locInterval = setInterval(function(){
          navigator.geolocation.getCurrentPosition(function(pos){
            DB.updateRiderLocation(b.id, pos.coords.latitude, pos.coords.longitude);
          }, function(){}, {enableHighAccuracy:true, timeout:8000});
        }, 10000);
        // Store interval so we can clear it when ride completes
        window._activeRideInterval = locInterval;
        // Get initial location immediately
        navigator.geolocation.getCurrentPosition(function(pos){
          DB.updateRiderLocation(b.id, pos.coords.latitude, pos.coords.longitude);
        }, function(){}, {enableHighAccuracy:true, timeout:8000});
      }
      var fare = parseFloat(b.fare)||FARE;
      sendWA(b.passengerPhone,"✅ *OkadaRide — Ride Confirmed!*\n\nHello "+b.passengerName+"! 👋\n\nYour rider *"+(driver.fullName||driver.name)+"* accepted!\n\n🛺 Plate: *"+driver.plate+"*\n📞 Call: *"+(driver.phone||"")+"*\n📍 Pickup: "+b.pickup+"\n🎯 Dropoff: "+b.dropoff+"\n💰 Fare: GHS "+fare+"\n\n⏱️ On the way!\n\n_OkadaRide Sunyani 🇬🇭_");
    } else toast2("❌ Error. Check connection.","err");
    setBusy(function(prev){var n=Object.assign({},prev);delete n[b.id];return n;});
  };
  var doDecline = async function(b){
    setBusy(function(prev){return Object.assign({},prev,{[b.id]:"decline"});});
    await DB.updateBooking(b.id,{status:"declined",declinedAt:new Date().toISOString()});
    toast2("Ride declined");
    setBusy(function(prev){var n=Object.assign({},prev);delete n[b.id];return n;});
  };
  var doComplete = async function(b){
    setBusy(function(prev){return Object.assign({},prev,{[b.id]:"complete"});});
    await DB.updateBooking(b.id,{status:"completed",completedAt:new Date().toISOString()});
    // Stop sharing location
    if(window._activeRideInterval){ clearInterval(window._activeRideInterval); window._activeRideInterval=null; }
    toast2("🎉 Ride completed! Great work 💪","ok");
    setBusy(function(prev){var n=Object.assign({},prev);delete n[b.id];return n;});
  };

  var active = bookings.filter(function(b){return b.status==="requested"||b.status==="accepted";});
  var done   = bookings.filter(function(b){return b.status==="completed";});
  var earned = done.reduce(function(s,b){return s+(parseFloat(b.fare)||FARE)*0.9;},0);

  var BCard = function(b){
    var fare = parseFloat(b.fare)||FARE;
    var isNew=b.status==="requested", isAcc=b.status==="accepted", isDone=b.status==="completed", isDec=b.status==="declined";
    var bBusy = busy[b.id];
    return h("div",{style:{background:"#fff",borderRadius:16,border:"2px solid "+(isNew?GOLD:isAcc?"#00C853":isDec?RED:"#ddd"),overflow:"hidden",marginBottom:12,boxShadow:isNew?"0 4px 18px rgba(255,179,0,.2)":"0 2px 8px rgba(0,0,0,.05)"}},
      h("div",{style:{background:isNew?GOLD:isAcc?"#00C853":isDec?RED:"#888",padding:"9px 14px",display:"flex",justifyContent:"space-between"}},
        h("p",{style:{color:isNew?"#000":"#fff",fontWeight:800,fontSize:12}},isNew?"🔔 NEW RIDE REQUEST":isAcc?"✅ Accepted":"isDone"?"✓ Completed":isDec?"❌ Declined":"✓ Done"),
        h("p",{style:{color:isNew?"rgba(0,0,0,.5)":"rgba(255,255,255,.7)",fontSize:11,fontWeight:700}},fmtTime(b.createdAt))
      ),
      h("div",{style:{padding:13}},
        h("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:11,paddingBottom:11,borderBottom:"1px solid rgba(27,122,47,.08)"}},
          h("div",{style:{width:44,height:44,borderRadius:"50%",overflow:"hidden",background:GRD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}},
            b.passengerPhotoURL ? h("img",{src:b.passengerPhotoURL,style:{width:"100%",height:"100%",objectFit:"cover"}}) : h("span",null,"🧑🏾")
          ),
          h("div",{style:{flex:1}},h("p",{style:{fontWeight:800,fontSize:14,color:"#0D2E14"}},b.passengerName||"Passenger"),h("p",{style:{color:"#3D6645",fontSize:12,marginTop:2}},"📞 "+(b.passengerPhone||"—"))),
          h("div",{style:{background:b.paymentMethod==="cash"?"rgba(27,122,47,.1)":"rgba(255,179,0,.12)",borderRadius:10,padding:"6px 10px",textAlign:"center"}},h("p",{style:{fontSize:17}},b.paymentMethod==="cash"?"💵":"📱"),h("p",{style:{fontSize:9,fontWeight:800,color:"#3D6645",marginTop:1}},b.paymentMethod==="cash"?"Cash":"MoMo"))
        ),
        h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}},
          h("div",{style:{background:BG,borderRadius:10,padding:"8px 10px"}},h("p",{style:{color:"#85A88C",fontSize:9,fontWeight:700,marginBottom:2}},"📍 PICKUP"),h("p",{style:{fontWeight:700,fontSize:12,color:"#0D2E14"}},b.pickup||"—")),
          h("div",{style:{background:BG,borderRadius:10,padding:"8px 10px"}},h("p",{style:{color:"#85A88C",fontSize:9,fontWeight:700,marginBottom:2}},"🎯 DROPOFF"),h("p",{style:{fontWeight:700,fontSize:12,color:"#0D2E14"}},b.dropoff||"—"))
        ),
        h("div",{style:{background:"rgba(27,122,47,.06)",borderRadius:11,padding:"9px 12px",marginBottom:11,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid rgba(27,122,47,.08)"}},
          h("div",null,h("p",{style:{color:"#85A88C",fontSize:9,fontWeight:700,marginBottom:2}},"YOUR EARNINGS (90%)"),h("p",{style:{fontWeight:800,color:"#007A33",fontSize:16}},"GHS "+(fare*0.9).toFixed(2))),
          h("div",{style:{textAlign:"right"}},h("p",{style:{color:"#85A88C",fontSize:9,fontWeight:700,marginBottom:2}},"TOTAL FARE"),h("p",{style:{fontFamily:"'Syne',sans-serif",fontWeight:900,color:G,fontSize:18}},"GHS "+fare))
        ),
        isNew && h("div",{style:{display:"flex",gap:8}},
          h("button",{onClick:function(){doAccept(b);},disabled:bBusy==="accept",
            style:{flex:2,padding:"13px",borderRadius:12,border:"none",background:bBusy==="accept"?"#D0D0D0":"linear-gradient(135deg,#00C853,#006B2E)",color:"#fff",fontWeight:800,fontSize:14,cursor:bBusy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:bBusy?"none":"0 4px 14px rgba(0,200,83,.3)"}
          },bBusy==="accept"?h(Spin,null):"✅ Accept Ride"),
          h("button",{onClick:function(){doDecline(b);},disabled:bBusy==="decline",
            style:{flex:1,padding:"13px",borderRadius:12,border:"none",background:bBusy==="decline"?"#D0D0D0":"linear-gradient(135deg,#CC0000,#8B0000)",color:"#fff",fontWeight:800,fontSize:13,cursor:bBusy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}
          },bBusy==="decline"?h(Spin,null):"❌ Decline")
        ),
        isAcc && h("div",{style:{display:"flex",flexDirection:"column",gap:8}},
          h("div",{style:{display:"flex",gap:8}},
            h("a",{href:"tel:"+(b.passengerPhone||""),style:{flex:1,textDecoration:"none"}},h("div",{style:{background:GRD,borderRadius:11,padding:"12px",textAlign:"center"}},h("p",{style:{color:"#fff",fontWeight:800,fontSize:13}},"📞 Call Passenger"))),
            h("button",{onClick:function(){sendWA(b.passengerPhone,"✅ Hello "+b.passengerName+"! I am "+(driver.fullName||driver.name)+" your OkadaRide rider 🛺 On the way!\nPlate: "+driver.plate);},
              style:{flex:1,padding:"12px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#25D366,#128C7E)",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}
            },"💬 WhatsApp")
          ),
          h("button",{onClick:function(){doComplete(b);},disabled:bBusy==="complete",
            style:{padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#FFB300,#E65100)",color:"#000",fontWeight:800,fontSize:14,cursor:bBusy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 14px rgba(255,179,0,.3)"}
          },bBusy==="complete"?h(Spin,{co:"#000"}):"✓ Complete Ride — Earn GHS "+(fare*0.9).toFixed(2))
        ),
        isDone && h("div",{style:{background:"rgba(0,200,83,.07)",borderRadius:10,padding:"10px",textAlign:"center",border:"1px solid rgba(0,200,83,.18)"}},h("p",{style:{color:"#006B2E",fontWeight:800,fontSize:13}},"✅ Completed! Earned GHS "+(fare*0.9).toFixed(2)+" 💪")),
        isDec  && h("div",{style:{background:"rgba(204,0,0,.05)",borderRadius:10,padding:"10px",textAlign:"center",border:"1px solid rgba(204,0,0,.1)"}},h("p",{style:{color:RED,fontWeight:700,fontSize:12}},"❌ Ride declined"))
      )
    );
  };

  return h("div",{style:{paddingBottom:20},className:"page"},
    toast&&h("div",{style:{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:toast.type==="new"?GOLD:toast.type==="err"?RED:"#00C853",color:toast.type==="new"?"#000":"#fff",borderRadius:12,padding:"11px 18px",fontWeight:800,fontSize:13,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 5px 20px rgba(0,0,0,.25)"}},toast.msg),
    h("div",{style:{background:GRD,position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 14px rgba(0,0,0,.2)"}},
      h(Ghana,null),
      h("div",{style:{padding:"13px 16px 0",display:"flex",alignItems:"center",gap:11}},
        h("div",{style:{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,.15)",border:"2px solid rgba(255,255,255,.25)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}},
          driver.photoURL?h("img",{src:driver.photoURL,style:{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}):h("span",{style:{fontSize:24}},"🧑🏾")
        ),
        h("div",{style:{flex:1}},
          h("p",{style:{color:"rgba(255,255,255,.55)",fontSize:11,fontWeight:600}},"Welcome back,"),
          h("p",{style:{fontFamily:"'Syne',sans-serif",color:"#fff",fontWeight:900,fontSize:19,lineHeight:1.1}},driver.fullName||driver.name||"Rider")
        ),
        h("p",{style:{color:GOLD,fontSize:12,fontWeight:700,marginRight:8}},"🛺 "+(driver.plate||"")),
        h("button",{onClick:p.onLogout,style:{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.75)",borderRadius:9,padding:"7px 11px",fontSize:12,fontWeight:700,cursor:"pointer"}},"Out")
      ),
      h("div",{style:{display:"flex",gap:7,padding:"12px 16px"}},
        [["GHS "+earned.toFixed(2),"Earned"],[done.length+"","Done"],[active.length+"","Active"]].map(function(row,i){
          return h("div",{key:i,style:{flex:1,background:"rgba(255,255,255,.1)",borderRadius:11,padding:"9px 7px",textAlign:"center"}},
            h("p",{style:{color:GOLD,fontWeight:900,fontSize:14,marginBottom:2}},row[0]),
            h("p",{style:{color:"rgba(255,255,255,.45)",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:.3}},row[1])
          );
        })
      )
    ),
    h("div",{style:{display:"flex",margin:"10px 14px 0",background:"#fff",borderRadius:12,padding:3,border:"1.5px solid rgba(27,122,47,.1)"}},
      [["rides","🛺 Rides"],["history","📋 History"]].map(function(row){
        var on = tab===row[0];
        return h("button",{key:row[0],onClick:function(){setTab(row[0]);},style:{flex:1,padding:"10px",borderRadius:10,border:"none",background:on?GRD:"transparent",color:on?"#fff":"#85A88C",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .25s"}},row[1]);
      })
    ),
    h("div",{style:{padding:"11px 14px"}},
      tab==="rides" && h("div",null,
        active.length===0 && h("div",{style:{textAlign:"center",padding:"44px 16px"}},
          h("div",{style:{fontSize:42,marginBottom:12,animation:"float 2s ease-in-out infinite"}},"🛺"),
          h("p",{style:{fontWeight:800,fontSize:16,color:"#0D2E14",marginBottom:6}},"Waiting for rides..."),
          h("p",{style:{color:"#85A88C",fontSize:13,lineHeight:1.6}},"New requests appear here automatically")
        ),
        active.map(BCard)
      ),
      tab==="history" && h("div",null,
        h("p",{style:{fontWeight:700,fontSize:11,color:"#85A88C",marginBottom:10,textTransform:"uppercase",letterSpacing:.5}},"Completed ("+done.length+")"),
        done.length===0 && h("p",{style:{color:"#85A88C",fontSize:13,textAlign:"center",padding:"20px 0"}},"No completed rides yet"),
        done.map(BCard)
      )
    )
  );
}