/* ═══════════════════════════════════════════
   OkadaRide — Home Screen
   ═══════════════════════════════════════════ */
'use strict';

function Home(p){
  var user = p.user;
  var _pu = useState(""); var pickup = _pu[0]; var setPickup = _pu[1];
  var _do = useState(""); var dropoff = _do[0]; var setDropoff = _do[1];
  var _pr = useState(""); var promo = _pr[0]; var setPromo = _pr[1];
  var _pa = useState(false); var promoOk = _pa[0]; var setPromoOk = _pa[1];
  var _sf = useState(false); var showFare = _sf[0]; var setShowFare = _sf[1];
  var _sos = useState(false); var sos = _sos[0]; var setSos = _sos[1];
  var _sm = useState(false); var showMap = _sm[0]; var setShowMap = _sm[1];
  var _mp = useState("dropoff"); var mapPicking = _mp[0]; var setMapPicking = _mp[1];
  var _gpsLoad = useState(false); var gpsLoad = _gpsLoad[0]; var setGpsLoad = _gpsLoad[1];
  var mapPickRef = useRef(null);
  var mapPickObj = useRef(null);
  var mapPickMarker = useRef(null);

  var hr = new Date().getHours();

  // Get GPS and reverse geocode to address
  var getMyGPS = function(setter){
    if(!navigator.geolocation){ alert("GPS not available on this device"); return; }
    setGpsLoad(true);
    navigator.geolocation.getCurrentPosition(
      function(pos){
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        // Reverse geocode using OpenStreetMap Nominatim (free)
        fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+lng+"&zoom=16&addressdetails=1")
          .then(function(r){ return r.json(); })
          .then(function(data){
            var addr = data.display_name || (lat.toFixed(5)+", "+lng.toFixed(5));
            // Simplify address — just show road + suburb
            var parts = [];
            if(data.address){
              if(data.address.road) parts.push(data.address.road);
              if(data.address.suburb) parts.push(data.address.suburb);
              else if(data.address.village) parts.push(data.address.village);
              else if(data.address.town) parts.push(data.address.town);
            }
            var simplified = parts.length>0 ? parts.join(", ") : addr.split(",").slice(0,2).join(",");
            setter(simplified || "My Current Location");
            setGpsLoad(false);
          })
          .catch(function(){
            setter("Location ("+lat.toFixed(4)+", "+lng.toFixed(4)+")");
            setGpsLoad(false);
          });
      },
      function(err){
        setGpsLoad(false);
        if(err.code===1) alert("Please allow location access in your browser settings.");
        else alert("Could not get your location. Please type it manually.");
      },
      {enableHighAccuracy:true, timeout:12000, maximumAge:0}
    );
  };
  var greet = hr<12 ? "Good morning" : hr<17 ? "Good afternoon" : "Good evening";
  var isNight = hr>=20||hr<6;
  var fare = promoOk ? 0 : isNight ? 33 : FARE;
  var name1 = user.name ? user.name.split(" ")[0] : "Friend";
  var both = pickup.trim().length>2 && dropoff.trim().length>2;

  return h("div",{style:{paddingBottom:100},className:"page"},
    // MAP PICKER MODAL
    showMap && h(MapPicker,{
      label: mapPicking==="dropoff"?"Dropoff":"Pickup",
      onClose: function(){
        setShowMap(false);
      },
      onConfirm: function(name){
        if(mapPicking==="dropoff") setDropoff(name);
        else setPickup(name);
        setShowMap(false);
      }
    }),

    // SOS overlay
    sos && h("div",{style:{position:"fixed",inset:0,background:"rgba(160,0,0,.95)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center"}},
      h("p",{style:{fontSize:52,marginBottom:10}},"🆘"),
      h("h2",{style:{color:"#fff",fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,marginBottom:8}},"EMERGENCY SOS"),
      h("p",{style:{color:"rgba(255,255,255,.7)",fontSize:14,marginBottom:22,lineHeight:1.7}},"OkadaRide Dispatcher\n+233 542 008 513"),
      h("a",{href:"tel:+233542008513",style:{display:"block",width:"100%",maxWidth:250,marginBottom:12,textDecoration:"none"}},
        h("div",{style:{background:"#fff",borderRadius:14,padding:"15px",textAlign:"center"}},
          h("p",{style:{color:RED,fontWeight:900,fontSize:16}},"📞 Call Dispatcher Now")
        )
      ),
      h("button",{onClick:function(){setSos(false);},style:{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:10,padding:"10px 22px",fontWeight:700,fontSize:14,cursor:"pointer"}},"Close")
    ),
    // ── HEADER
    h("div",{style:{background:GRD,position:"sticky",top:0,zIndex:50,boxShadow:"0 3px 16px rgba(0,0,0,.2)"}},
      h(Ghana,null),
      h("div",{style:{padding:"13px 14px 0",display:"flex",alignItems:"center",gap:10}},
        h("div",{style:{width:48,height:48,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,.18)",border:"2.5px solid rgba(255,255,255,.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 10px rgba(0,0,0,.25)"}},
          user.photoURL ? h("img",{src:user.photoURL,style:{width:"100%",height:"100%",objectFit:"cover"}}) : h("span",{style:{fontSize:24}},"🧑🏾")
        ),
        h("div",{style:{flex:1,minWidth:0}},
          h("p",{style:{color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:600,marginBottom:1}},greet+","),
          h("p",{style:{fontFamily:"'Syne',sans-serif",color:"#fff",fontWeight:900,fontSize:20,lineHeight:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},name1+" 👋")
        ),
        h("button",{onClick:function(){setSos(true);},style:{background:"rgba(204,0,0,.3)",border:"1.5px solid rgba(255,90,90,.4)",borderRadius:10,color:"#FF7070",fontWeight:800,fontSize:11,padding:"8px 10px",cursor:"pointer",flexShrink:0,marginRight:5}},"🆘 SOS"),
        h("button",{onClick:function(){if(window.confirm("Sign out?")) p.signOut();},style:{background:"rgba(255,255,255,.13)",border:"1px solid rgba(255,255,255,.22)",color:"rgba(255,255,255,.8)",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}},"Out")
      ),
      h("div",{style:{display:"flex",padding:"12px 14px 14px",gap:8}},
        [["🛺","32+ Riders"],["⏱️","~2 min"],["⭐","4.8 rating"],["💰","GHS 30"]].map(function(row,i){
          return h("div",{key:i,style:{flex:1,background:"rgba(255,255,255,.1)",borderRadius:11,padding:"9px 5px",textAlign:"center"}},
            h("p",{style:{fontSize:15,lineHeight:1,marginBottom:3}},row[0]),
            h("p",{style:{color:GOLD,fontWeight:800,fontSize:10,lineHeight:1}},row[1])
          );
        })
      )
    ),
    h("div",{style:{padding:"14px 14px 0"}},
      // ── BOOKING CARD
      h("div",{style:{background:"#fff",borderRadius:20,padding:"18px",border:"1.5px solid rgba(27,122,47,.14)",boxShadow:"0 4px 22px rgba(0,0,0,.08)",marginBottom:16}},
        h("div",{style:{display:"flex",alignItems:"center",gap:11,marginBottom:16,paddingBottom:14,borderBottom:"1.5px solid rgba(27,122,47,.08)"}},
          h("div",{style:{width:42,height:42,background:GRD,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:"0 3px 10px rgba(13,74,26,.3)"}},"🛺"),
          h("div",{style:{flex:1}},
            h("p",{style:{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17,color:"#0D2E14"}},"Book a Ride"),
            h("p",{style:{color:"#85A88C",fontSize:12,marginTop:3}},"Sunyani · GHS 30 flat rate · Fast pickup")
          ),
          h("div",{style:{display:"flex",alignItems:"center",gap:5,background:"rgba(0,200,83,.1)",borderRadius:20,padding:"5px 10px"}},
            h("div",{style:{width:7,height:7,borderRadius:"50%",background:"#00C853"}}),
            h("p",{style:{color:"#00C853",fontSize:11,fontWeight:800}},"Live")
          )
        ),
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645"}},"📍 Pickup Location"),
          h("button",{onClick:function(){getMyGPS(setPickup);},
            style:{background:"rgba(27,122,47,.1)",border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:G,cursor:"pointer"}
          },"📡 Use My GPS")
        ),
        h("input",{type:"text",placeholder:"Where are you now?",value:pickup,onChange:function(e){setPickup(e.target.value);},
          style:{width:"100%",padding:"14px 15px",borderRadius:13,fontSize:16,fontWeight:600,marginBottom:8,
            border:"2px solid "+(pickup.length>1?G:BDR),
            background:pickup.length>1?"#FAFFF9":"#F8F8F8",color:"#0D2E14",outline:"none",transition:"all .2s"}
        }),
        h("div",{style:{textAlign:"center",margin:"2px 0"}},
          h("button",{onClick:function(){var t=pickup;setPickup(dropoff);setDropoff(t);},style:{background:"#fff",border:"2px solid "+BDR,borderRadius:"50%",width:36,height:36,fontSize:18,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.1)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:G}},"⇅")
        ),
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,marginTop:2}},
          h("p",{style:{fontSize:13,fontWeight:700,color:"#3D6645"}},"🎯 Dropoff Location"),
          h("button",{onClick:function(){setMapPicking("dropoff");setShowMap(true);},
            style:{background:"rgba(27,122,47,.1)",border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:G,cursor:"pointer"}
          },"🗺️ Pick on Map")
        ),
        h("input",{type:"text",placeholder:"Where do you want to go?",value:dropoff,onChange:function(e){setDropoff(e.target.value);},
          style:{width:"100%",padding:"14px 15px",borderRadius:13,fontSize:16,fontWeight:600,marginBottom:16,
            border:"2px solid "+(dropoff.length>1?G:BDR),
            background:dropoff.length>1?"#FAFFF9":"#F8F8F8",color:"#0D2E14",outline:"none",transition:"all .2s"}
        }),
        both && h("div",{style:{background:GRD,borderRadius:15,padding:"15px",marginBottom:14,boxShadow:"0 4px 18px rgba(13,74,26,.28)"},className:"page"},
          h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:showFare?12:0}},
            h("div",null,
              h("p",{style:{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,letterSpacing:.5,marginBottom:4}},"YOUR FARE"),
              h("p",{style:{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:38,color:fare===0?GOLD:"#fff",lineHeight:1}},fare===0?"FREE 🎉":"GHS "+fare),
              isNight&&fare>0&&h("p",{style:{color:"rgba(255,179,0,.8)",fontSize:11,fontWeight:700,marginTop:4}},"🌙 Night rate (+GHS 3)"),
              fare===0&&h("p",{style:{color:GOLD,fontSize:12,fontWeight:700,marginTop:4}},"✅ OKADA001 applied!")
            ),
            h("button",{onClick:function(){setShowFare(!showFare);},style:{background:"rgba(255,255,255,.18)",border:"none",color:"#fff",borderRadius:9,padding:"8px 13px",fontSize:12,fontWeight:700,cursor:"pointer",marginTop:4}},showFare?"Hide ▲":"Details ▼")
          ),
          showFare && h("div",{className:"page"},
            h("div",{style:{display:"flex",gap:8,marginBottom:10}},
              h("div",{style:{flex:1,background:"rgba(255,255,255,.13)",borderRadius:10,padding:"9px",textAlign:"center"}},h("p",{style:{color:"rgba(255,255,255,.55)",fontSize:9,fontWeight:700,marginBottom:4}},"RIDER GETS (90%)"),h("p",{style:{color:"#fff",fontWeight:800,fontSize:16}},fare===0?"FREE":"GHS "+(fare*0.9).toFixed(0))),
              h("div",{style:{flex:1,background:"rgba(255,255,255,.13)",borderRadius:10,padding:"9px",textAlign:"center"}},h("p",{style:{color:"rgba(255,255,255,.55)",fontSize:9,fontWeight:700,marginBottom:4}},"OKADARIDE (10%)"),h("p",{style:{color:GOLD,fontWeight:800,fontSize:16}},fare===0?"FREE":"GHS "+(fare*0.1).toFixed(0)))
            ),
            h("div",{style:{display:"flex",gap:8}},
              h("input",{value:promo,onChange:function(e){setPromo(e.target.value.toUpperCase());setPromoOk(false);},placeholder:"🎟️ Promo code (try OKADA001)",disabled:promoOk,style:{flex:1,padding:"10px 13px",borderRadius:10,border:"1.5px solid rgba(255,255,255,.25)",background:"rgba(255,255,255,.12)",color:"#fff",fontSize:13,fontWeight:600,outline:"none"}}),
              promoOk
                ? h("button",{onClick:function(){setPromoOk(false);setPromo("");},style:{padding:"10px 13px",borderRadius:10,border:"none",background:"rgba(204,0,0,.35)",color:"#fff",fontWeight:800,cursor:"pointer"}},"✕")
                : h("button",{onClick:function(){if(promo==="OKADA001")setPromoOk(true);else alert("Invalid code.\n\nTry: OKADA001 (first ride FREE!)");},style:{padding:"10px 13px",borderRadius:10,border:"none",background:GOLD,color:"#000",fontWeight:800,cursor:"pointer"}},"Apply")
            ),
            promoOk && h("p",{style:{color:GOLD,fontSize:12,fontWeight:700,marginTop:8,textAlign:"center"}},"🎉 First ride FREE!")
          )
        ),
        h("button",{onClick:function(){if(both) p.goBook(pickup,dropoff,fare);},disabled:!both,
          style:{width:"100%",padding:"16px",borderRadius:14,border:"none",
            background:both?(fare===0?"linear-gradient(135deg,#00C853,#007A33)":GRD):"#D8D8D8",
            color:both?"#fff":"#aaa",fontWeight:900,fontSize:16,
            cursor:both?"pointer":"not-allowed",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            boxShadow:both?"0 6px 20px rgba(13,74,26,.35)":"none",transition:"all .2s"}
        },
          h("span",{style:{fontSize:22}},"🛺"),
          h("span",null,both?(fare===0?"Claim FREE Ride 🎉":"Book Now — GHS "+fare):"Enter pickup & dropoff above")
        )
      ),
      // ── POPULAR SPOTS
      h("div",{style:{marginBottom:16}},
        h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
          h("p",{style:{fontWeight:800,fontSize:14,color:"#0D2E14"}},"📍 Popular Spots"),
          h("p",{style:{fontSize:11,color:"#85A88C"}},pickup?"Tap to set dropoff":"Tap to set pickup")
        ),
        h("div",{style:{display:"flex",flexWrap:"wrap",gap:7}},
          SPOTS.map(function(s){
            var isP = pickup===s, isD = dropoff===s;
            return h("button",{key:s,onClick:function(){if(!pickup.trim()||pickup===s) setPickup(s); else setDropoff(s);},
              style:{background:isP?G:isD?"#1565C0":"#fff",color:isP||isD?"#fff":G,
                border:"1.5px solid "+(isP?G:isD?"#1565C0":BDR),
                borderRadius:30,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",
                boxShadow:"0 2px 6px rgba(0,0,0,.05)"}
            },(isP?"📍 ":isD?"🎯 ":"")+s);
          })
        )
      ),
      // ── PROMO BANNER
      h("div",{style:{background:"linear-gradient(135deg,rgba(255,179,0,.13),rgba(255,179,0,.05))",borderRadius:16,padding:"15px 16px",border:"1.5px solid rgba(255,179,0,.3)",display:"flex",alignItems:"center",gap:12,marginBottom:16}},
        h("span",{style:{fontSize:32,flexShrink:0}},"🎉"),
        h("div",null,
          h("p",{style:{fontWeight:800,fontSize:14,color:"#0D2E14",marginBottom:3}},"First Ride FREE!"),
          h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.5}},"Use code ",h("strong",{style:{color:G}},"OKADA001")," when booking your first ride")
        )
      )
    )
  );
}

// ── BOOK RIDE ─────────────────────────────────────────────────────────────────
