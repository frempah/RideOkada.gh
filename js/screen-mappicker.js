/* ═══════════════════════════════════════════
   OkadaRide — MapPicker Screen
   ═══════════════════════════════════════════ */
'use strict';

function MapPicker(props){
  var _sq = useState(""); var sq = _sq[0]; var setSq = _sq[1];
  var _sr = useState([]); var sr = _sr[0]; var setSr = _sr[1];
  var mapRef    = useRef(null);
  var mapObj    = useRef(null);
  var markerRef = useRef(null);

  useEffect(function(){
    if(!mapRef.current) return;
    // Destroy old map if exists
    if(mapObj.current){
      try{ mapObj.current.remove(); }catch(e){}
      mapObj.current = null;
    }
    // Wait for DOM
    var t = setTimeout(function(){
      if(!mapRef.current) return;
      try{
        var lat = 7.3349, lng = -2.3267; // Sunyani center
        var m = window.L.map(mapRef.current, {
          center:[lat,lng], zoom:14,
          zoomControl:true, attributionControl:true
        });
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
          maxZoom:19,
          attribution:'© OpenStreetMap'
        }).addTo(m);

        // Pin icon
        var pinIcon = window.L.divIcon({
          html:'<div style="font-size:36px;line-height:1;filter:drop-shadow(0 3px 8px rgba(0,0,0,.5))">📍</div>',
          iconSize:[36,44], iconAnchor:[18,44], className:''
        });
        var marker = window.L.marker([lat,lng], {icon:pinIcon, draggable:true}).addTo(m);
        marker.bindPopup("Drag me or tap map").openPopup();
        markerRef.current = marker;
        mapObj.current = m;

        // Tap map to move marker
        m.on('click', function(e){
          marker.setLatLng(e.latlng);
          marker.closePopup();
        });

        // Force size recalculate
        setTimeout(function(){ try{m.invalidateSize();}catch(e){} }, 300);

        // Try GPS
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(
            function(pos){
              var glat=pos.coords.latitude, glng=pos.coords.longitude;
              m.setView([glat,glng], 16);
              marker.setLatLng([glat,glng]);
            },
            function(){},
            {enableHighAccuracy:true, timeout:8000, maximumAge:0}
          );
        }
      }catch(e){ console.error("Map init error:", e); }
    }, 400);

    return function(){
      clearTimeout(t);
      try{ if(mapObj.current){ mapObj.current.remove(); mapObj.current=null; } }catch(e){}
    };
  }, []);

  var doSearch = function(){
    if(!sq.trim()) return;
    fetch("https://nominatim.openstreetmap.org/search?format=json&q="+
          encodeURIComponent(sq+", Sunyani, Ghana")+"&limit=5&countrycodes=gh")
      .then(function(r){ return r.json(); })
      .then(function(data){ setSr(data); })
      .catch(function(){ setSr([]); });
  };

  var pickResult = function(r){
    if(!mapObj.current) return;
    var lat=parseFloat(r.lat), lng=parseFloat(r.lon);
    mapObj.current.setView([lat,lng], 16);
    if(markerRef.current) markerRef.current.setLatLng([lat,lng]);
    setSr([]); setSq(r.display_name.split(",")[0]);
    try{ mapObj.current.invalidateSize(); }catch(e){}
  };

  var confirm = function(){
    if(!markerRef.current){ alert("Please tap on the map to select a location first."); return; }
    var ll = markerRef.current.getLatLng();
    fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat="+ll.lat+"&lon="+ll.lng+"&zoom=16")
      .then(function(r){ return r.json(); })
      .then(function(data){
        var parts=[];
        if(data.address){
          if(data.address.road) parts.push(data.address.road);
          if(data.address.suburb) parts.push(data.address.suburb);
          else if(data.address.village) parts.push(data.address.village);
          else if(data.address.town) parts.push(data.address.town);
          else if(data.address.city) parts.push(data.address.city);
        }
        var name = parts.length>0 ? parts.join(", ") : data.display_name.split(",").slice(0,2).join(",").trim();
        props.onConfirm(name || "Selected Location");
      })
      .catch(function(){
        props.onConfirm("Location ("+ll.lat.toFixed(4)+", "+ll.lng.toFixed(4)+")");
      });
  };

  return h("div",{style:{position:"fixed",inset:0,zIndex:9000,display:"flex",flexDirection:"column",background:"#000"}},
    // Header
    h("div",{style:{background:GRD,flexShrink:0}},
      h(Ghana,null),
      h("div",{style:{padding:"12px 16px",display:"flex",alignItems:"center",gap:10}},
        h("button",{onClick:props.onClose,
          style:{background:"rgba(255,255,255,.18)",border:"none",color:"#fff",borderRadius:8,padding:"7px 12px",fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0}
        },"← Back"),
        h("div",{style:{flex:1}},
          h("p",{style:{color:"#fff",fontWeight:800,fontSize:15}},"🗺️ Pick "+(props.label||"Location")),
          h("p",{style:{color:"rgba(255,255,255,.6)",fontSize:11,marginTop:1}},"Tap on map or search to set location")
        )
      )
    ),
    // Search bar
    h("div",{style:{background:"#1a1a2e",padding:"10px 12px",flexShrink:0}},
      h("div",{style:{display:"flex",gap:8}},
        h("input",{
          value:sq,
          onChange:function(e){setSq(e.target.value);},
          placeholder:"Search e.g. Sunyani Market, Catholic Hospital...",
          onKeyDown:function(e){if(e.key==="Enter")doSearch();},
          style:{flex:1,padding:"10px 14px",borderRadius:10,fontSize:15,border:"none",background:"#fff",color:"#000",outline:"none"}
        }),
        h("button",{onClick:doSearch,
          style:{background:G,border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:15,flexShrink:0}
        },"🔍")
      ),
      sr.length>0&&h("div",{style:{marginTop:8,maxHeight:140,overflowY:"auto",borderRadius:8,overflow:"hidden"}},
        sr.map(function(r,i){
          return h("div",{key:i,onClick:function(){pickResult(r);},
            style:{background:"#fff",padding:"9px 12px",borderBottom:i<sr.length-1?"1px solid #eee":"none",cursor:"pointer",fontSize:13,color:"#000"}
          },r.display_name.split(",").slice(0,3).join(","));
        })
      )
    ),
    // Map
    h("div",{ref:mapRef,style:{flex:1,width:"100%",minHeight:0}}),
    // Confirm button
    h("div",{style:{background:"#1a1a2e",padding:"12px 14px",flexShrink:0}},
      h("p",{style:{color:"rgba(255,255,255,.55)",fontSize:11,textAlign:"center",marginBottom:8}},"📍 Drop pin on your location, then confirm"),
      h("button",{onClick:confirm,
        style:{width:"100%",padding:"14px",borderRadius:13,border:"none",background:GRD,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 4px 14px rgba(13,74,26,.3)"}
      },"✅ Confirm "+(props.label||"Location"))
    )
  );
}


