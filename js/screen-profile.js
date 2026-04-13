/* ═══════════════════════════════════════════
   OkadaRide — Profile Screen
   ═══════════════════════════════════════════ */
'use strict';

function Profile(p){
  var user = p.user;
  return h("div",{style:{minHeight:"100dvh",background:BG,paddingBottom:90},className:"page"},
    h("div",{style:{background:GRD,paddingBottom:26,textAlign:"center",position:"relative",overflow:"hidden"}},
      h("div",{style:{position:"absolute",top:-70,right:-70,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}),
      h(Ghana,null),
      h("div",{style:{paddingTop:20,position:"relative",zIndex:1}},
        h("div",{style:{width:86,height:86,borderRadius:"50%",overflow:"hidden",background:"rgba(255,255,255,.2)",border:"3px solid rgba(255,255,255,.4)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12,boxShadow:"0 6px 22px rgba(0,0,0,.25)"}},
          user.photoURL ? h("img",{src:user.photoURL,style:{width:"100%",height:"100%",objectFit:"cover"}}) : h("span",{style:{fontSize:40}},"🧑🏾")
        ),
        h("p",{style:{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#fff",marginBottom:4}},user.name||"Passenger"),
        h("p",{style:{color:"rgba(255,255,255,.6)",fontSize:13,marginBottom:12}},"📞 "+(user.phone||"")),
        h("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,179,0,.2)",borderRadius:20,padding:"5px 14px",border:"1px solid rgba(255,179,0,.3)"}},
          h("span",null,"🇬🇭"),h("p",{style:{color:GOLD,fontSize:12,fontWeight:700}},"Sunyani Passenger")
        )
      )
    ),
    h("div",{style:{padding:"16px"}},
      h("div",{style:{background:"#fff",borderRadius:18,overflow:"hidden",border:"1.5px solid rgba(27,122,47,.1)",boxShadow:"0 3px 16px rgba(0,0,0,.06)",marginBottom:14}},
        h("div",{style:{padding:"13px 16px",background:"rgba(27,122,47,.04)",borderBottom:"1px solid rgba(27,122,47,.07)"}},
          h("p",{style:{fontWeight:800,fontSize:13,color:"#0D2E14"}},"Account Details")
        ),
        [
          ["👤","Full Name",user.name||"—"],
          ["📞","Phone Number",user.phone||"—"],
          ["🔐","Trip PIN","•••• (protected)"],
          ["📍","Location","Sunyani, Brong-Ahafo"],
          ["📅","Member Since",user.createdAt?new Date(user.createdAt).toLocaleDateString("en-GH",{day:"numeric",month:"long",year:"numeric"}):"Recent"]
        ].map(function(row,i,arr){
          return h("div",{key:i,style:{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderBottom:i<arr.length-1?"1px solid rgba(27,122,47,.06)":"none"}},
            h("div",{style:{width:40,height:40,borderRadius:12,background:"rgba(27,122,47,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}},row[0]),
            h("div",{style:{flex:1,minWidth:0}},
              h("p",{style:{color:"#85A88C",fontSize:11,fontWeight:700,marginBottom:2}},row[1].toUpperCase()),
              h("p",{style:{color:"#0D2E14",fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},row[2])
            )
          );
        })
      ),
      h("div",{style:{background:"linear-gradient(135deg,rgba(255,179,0,.13),rgba(255,179,0,.05))",borderRadius:16,padding:"16px",marginBottom:14,border:"1.5px solid rgba(255,179,0,.28)",display:"flex",gap:12,alignItems:"center"}},
        h("span",{style:{fontSize:32,flexShrink:0}},"🎉"),
        h("div",null,
          h("p",{style:{fontWeight:800,fontSize:14,color:"#0D2E14",marginBottom:4}},"First Ride FREE!"),
          h("p",{style:{color:"#3D6645",fontSize:13,lineHeight:1.5}},"Use code ",h("strong",{style:{color:G}},"OKADA001")," when booking your first ride")
        )
      ),
      h(GBtn,{onClick:p.signOut,red:true,kids:"Sign Out"})
    )
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function Nav(p){
  var tabs = [["home","🛺","Home"],["trips","📋","Trips"],["profile","👤","Me"]];
  return h("div",{style:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1.5px solid rgba(27,122,47,.1)",display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom,8px)",boxShadow:"0 -4px 24px rgba(0,0,0,.09)"}},
    tabs.map(function(t){
      var on = p.tab===t[0];
      return h("button",{key:t[0],onClick:function(){p.go(t[0]);},
        style:{flex:1,padding:"11px 0 9px",border:"none",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",position:"relative",minHeight:58}
      },
        h("span",{style:{fontSize:on?24:19,transition:"font-size .2s"}},t[1]),
        h("p",{style:{fontSize:10,fontWeight:on?900:600,color:on?G:"#aaa",transition:"color .2s"}},t[2]),
        on && h("div",{style:{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:22,height:3,borderRadius:"3px 3px 0 0",background:G}})
      );
    })
  );
}

// ── RIDER DASHBOARD ───────────────────────────────────────────────────────────
