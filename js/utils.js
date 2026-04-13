/* ═══════════════════════════════════════════
   OkadaRide — Utilities
   - PIN hashing (SHA-256)
   - localStorage helpers
   - SMS sending (Hubtel Ghana)
   - WhatsApp helpers
   ═══════════════════════════════════════════ */
'use strict';

var hashPin = async function(pin){
  try{
    var msgBuffer = new TextEncoder().encode('okada_salt_2024_' + pin);
    var hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  }catch(e){
    // Fallback if crypto not available (very old browsers)
    return 'pin_' + pin + '_fallback';
  }
};

// Compare entered PIN against stored hash
var checkPin = async function(entered, storedHash){
  // Handle legacy plain-text PINs (existing users before hashing was added)
  if(storedHash && !storedHash.startsWith('0') && storedHash.length !== 64){
    return entered === storedHash; // plain text comparison for old accounts
  }
  var enteredHash = await hashPin(entered);
  return enteredHash === storedHash;
};

// ── SECURITY SYSTEM ──────────────────────────────────────────────────────────
// PIN Lockout — blocks brute force attacks
var SEC = {
  MAX_ATTEMPTS: 5,          // lock after 5 wrong PINs
  LOCKOUT_MINS: 30,         // locked for 30 minutes
  MAX_BOOKINGS_PER_HOUR: 3, // max 3 bookings per hour per user

  getLockout: function(key){
    try{
      var data = JSON.parse(localStorage.getItem('lock_'+key)||'{}');
      return data;
    }catch(e){ return {}; }
  },

  setLockout: function(key, data){
    try{ localStorage.setItem('lock_'+key, JSON.stringify(data)); }catch(e){}
  },

  // Check if account is locked — returns {locked, minsLeft}
  isLocked: function(key){
    var data = this.getLockout(key);
    if(!data.lockedUntil) return {locked:false, minsLeft:0};
    var now = Date.now();
    if(now < data.lockedUntil){
      var minsLeft = Math.ceil((data.lockedUntil - now) / 60000);
      return {locked:true, minsLeft:minsLeft};
    }
    // Lockout expired — clear it
    this.setLockout(key, {});
    return {locked:false, minsLeft:0};
  },

  // Record a failed attempt — returns {locked, attemptsLeft}
  recordFail: function(key){
    var data = this.getLockout(key);
    data.attempts = (data.attempts||0) + 1;
    data.lastAttempt = Date.now();
    if(data.attempts >= this.MAX_ATTEMPTS){
      data.lockedUntil = Date.now() + (this.LOCKOUT_MINS * 60 * 1000);
      data.attempts = 0;
      this.setLockout(key, data);
      return {locked:true, attemptsLeft:0};
    }
    this.setLockout(key, data);
    return {locked:false, attemptsLeft:this.MAX_ATTEMPTS - data.attempts};
  },

  // Clear attempts after successful login
  clearFails: function(key){
    this.setLockout(key, {});
  },

  // Check booking rate limit — returns {allowed, waitMins}
  checkBookingRate: function(phone){
    try{
      var key = 'brate_'+phone.replace(/\D/g,'');
      var data = JSON.parse(localStorage.getItem(key)||'{"bookings":[],"count":0}');
      var now = Date.now();
      var oneHourAgo = now - 3600000;
      // Remove bookings older than 1 hour
      data.bookings = (data.bookings||[]).filter(function(t){ return t > oneHourAgo; });
      if(data.bookings.length >= this.MAX_BOOKINGS_PER_HOUR){
        var oldest = data.bookings[0];
        var waitMins = Math.ceil((oldest + 3600000 - now) / 60000);
        return {allowed:false, waitMins:waitMins, count:data.bookings.length};
      }
      return {allowed:true, waitMins:0, count:data.bookings.length};
    }catch(e){ return {allowed:true, waitMins:0, count:0}; }
  },

  // Record a booking
  recordBooking: function(phone){
    try{
      var key = 'brate_'+phone.replace(/\D/g,'');
      var data = JSON.parse(localStorage.getItem(key)||'{"bookings":[]}');
      var now = Date.now();
      var oneHourAgo = now - 3600000;
      data.bookings = (data.bookings||[]).filter(function(t){ return t > oneHourAgo; });
      data.bookings.push(now);
      localStorage.setItem(key, JSON.stringify(data));
    }catch(e){}
  }
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
var h       = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;

var G    = "#1B7A2F";
var DG   = "#0D4A1A";
var GOLD = "#FFB300";
var RED  = "#CC0000";
var BG   = "#F0F7F1";
var GRD  = "linear-gradient(160deg,#0D4A1A,#1B7A2F)";
var BDR  = "rgba(27,122,47,.16)";
var FARE = 30;

var SPOTS = [
  "Sunyani Market","Sunyani Hospital","Sunyani Post Office","Sunyani SHS",
  "St. Ambrose College","Sunyani Polytechnic","Catholic Hospital","Bus Station",
  "Fiapre","Nsoatre","Odumasi","New Town","Kukuom Road",
  "Sunyani Stadium","GCB Bank","Sunyani Technical","Abesim","Berekum Road",
  "Dormaa Road","Newtown"
];

var DEMO_DRIVERS = [
  {id:"d1",name:"Kofi Mensah",rating:"4.9",plate:"GR-2234-20",color:"Yellow",phone:"0241234567",verified:true,eta:"2 min"},
  {id:"d2",name:"Kwame Asante",rating:"4.7",plate:"BA-1122-21",color:"Blue",phone:"0551234567",verified:true,eta:"4 min"},
  {id:"d3",name:"Yaw Boateng",rating:"4.8",plate:"GR-4456-19",color:"Red",phone:"0271234567",verified:true,eta:"6 min"}
];

// ── UTILS ─────────────────────────────────────────────────────────────────────
var ls = {
  get: function(k){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):null; }catch(e){ return null; } },
  set: function(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} },
  rm:  function(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
var ghNum = function(p){
  var c = String(p||"").replace(/\D/g,"");
  return c.startsWith("0") ? "233"+c.slice(1) : c.startsWith("233") ? c : "233"+c;
};
var sendWA = function(phone, msg){
  var n = ghNum(phone);
  if(n.length < 11) return;
  window.open("https://wa.me/"+n+"?text="+encodeURIComponent(msg),"_blank");
};
var fmtDate = function(ts){
  if(!ts||!ts.seconds) return "Recent";
  return new Date(ts.seconds*1000).toLocaleDateString("en-GH",{day:"numeric",month:"short",year:"numeric"});
};
var fmtTime = function(ts){
  if(!ts||!ts.seconds) return "Now";
  return new Date(ts.seconds*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
};

// ── UI ATOMS ──────────────────────────────────────────────────────────────────
var Spin = function(props){
  var sz = (props&&props.sz)||20;
  var co = (props&&props.co)||"#fff";
  return h("div",{style:{width:sz,height:sz,border:"2.5px solid rgba(255,255,255,.2)",borderTop:"2.5px solid "+co,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}});
};

var Ghana = function(){
  return h("div",{style:{height:5,display:"flex",flexShrink:0}},
    h("div",{style:{flex:1,background:RED}}),
    h("div",{style:{flex:1,background:GOLD}}),
    h("div",{style:{flex:1,background:"#006400"}})
  );
};

