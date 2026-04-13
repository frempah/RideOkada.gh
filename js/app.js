/* ═══════════════════════════════════════════
   OkadaRide — App Root & Entry Point
   Handles all screen routing and state
   ═══════════════════════════════════════════ */
'use strict';

// ── APP ───────────────────────────────────────────────────────────────────────
function App(){
  var _splash = useState(true); var splash = _splash[0]; var setSplash = _splash[1];
  var _user   = useState(function(){ return ls.get("okada_user"); }); var user = _user[0]; var setUser = _user[1];
  var _driver = useState(function(){ return ls.get("okada_driver"); }); var driver = _driver[0]; var setDriver = _driver[1];
  var _mode   = useState("login"); var mode = _mode[0]; var setMode = _mode[1];
  var _tab    = useState("home"); var tab = _tab[0]; var setTab = _tab[1];
  var _flow   = useState("home"); var flow = _flow[0]; var setFlow = _flow[1];
  var _pu     = useState(""); var pickup = _pu[0]; var setPickup = _pu[1];
  var _do     = useState(""); var dropoff = _do[0]; var setDropoff = _do[1];
  var _fare   = useState(FARE); var fare = _fare[0]; var setFare = _fare[1];
  var _sel    = useState(null); var sel = _sel[0]; var setSel = _sel[1];
  var _pay    = useState("cash"); var pay = _pay[0]; var setPay = _pay[1];
  var _bid    = useState(""); var bid = _bid[0]; var setBid = _bid[1];

  var reset = function(){ setFlow("home"); setPickup(""); setDropoff(""); setSel(null); setBid(""); setFare(FARE); };

  if(splash)  return h(Splash, {done:function(){setSplash(false);}});
  if(driver)  return h(RiderDash, {driver:driver, onLogout:function(){ls.rm("okada_driver");setDriver(null);}});
  if(mode==="register")   return h(Register,   {done:function(u){ if(u){setUser(u);setMode("login");}else setMode("login"); }});
  if(mode==="riderapply") return h(RiderApply, {done:function(){ setMode("login"); }});
  if(!user)   return h(Login,  {onPass:function(u){setUser(u);}, onRider:function(d){setDriver(d);}, onReg:function(){setMode("register");}, onRiderReg:function(){setMode("riderapply");}});

  return h("div",null,
    flow==="home" && h("div",null,
      tab==="home"    && h(Home,    {user:user, goBook:function(pu,do_,f){setPickup(pu);setDropoff(do_);setFare(f);setFlow("booking");}, signOut:function(){ls.rm("okada_user");setUser(null);}}),
      tab==="trips"   && h(Trips,   {user:user}),
      tab==="profile" && h(Profile, {user:user, signOut:function(){ls.rm("okada_user");setUser(null);}}),
      h(Nav, {tab:tab, go:function(t){setTab(t);}})
    ),
    flow==="booking"  && h(BookRide, {user:user, pickup:pickup, dropoff:dropoff, fare:fare, onBack:function(){setFlow("home");}, onConfirm:function(d,pm,id,f){setSel(d);setPay(pm);setBid(id);setFare(f);setFlow("tracking");}}),
    flow==="tracking" && h(Tracking, {user:user, bookingId:bid, driver:sel, pickup:pickup, dropoff:dropoff, pay:pay, fare:fare, onAccepted:function(){setFlow("home");}, onHome:function(){setFlow("home");}, onCancel:reset})
  );
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
// Register service worker for PWA
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/RideOkada.gh/sw.js')
      .then(function(reg){ console.log('SW registered'); })
      .catch(function(e){ console.log('SW failed:', e); });
  });
}

document.addEventListener('focusin', function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA'){
    setTimeout(function(){ e.target.scrollIntoView({block:'center',behavior:'smooth'}); }, 380);
  }
});

window.addEventListener('load', function(){
  try{
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  }catch(e){
    console.error('Boot error:', e);
    document.getElementById('root').innerHTML = '<div style="height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0D4A1A;padding:24px;text-align:center"><div style="font-size:52px;margin-bottom:16px">🛺</div><h2 style="color:#fff;font-family:sans-serif;font-size:22px;margin-bottom:10px">OkadaRide</h2><p style="color:rgba(255,255,255,.6);font-size:14px;margin-bottom:22px">Please reload the app.</p><button onclick="location.reload()" style="background:#FFB300;border:none;border-radius:14px;padding:14px 28px;color:#000;font-weight:800;font-size:16px;cursor:pointer">🔄 Reload</button></div>';
  }
});