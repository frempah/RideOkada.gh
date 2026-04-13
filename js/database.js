/* ═══════════════════════════════════════════
   OkadaRide — Database Layer (Firebase)
   All Firestore operations go here.
   Never call firebase.firestore() directly
   from components — always use DB.*
   ═══════════════════════════════════════════ */
'use strict';

var DB = {
  savePassenger: async function(d){
    try{
      var s = await db.collection("passengers").where("phone","==",d.phone).get();
      if(!s.empty){ await s.docs[0].ref.update(Object.assign({},d,{updatedAt:new Date().toISOString()})); return {ok:true}; }
      await db.collection("passengers").add(Object.assign({},d,{createdAt:firebase.firestore.FieldValue.serverTimestamp()}));
      return {ok:true};
    }catch(e){ return {ok:false}; }
  },
  getPassenger: async function(phone){
    try{
      var s = await db.collection("passengers").where("phone","==",phone).get();
      if(s.empty) return null;
      return Object.assign({id:s.docs[0].id}, s.docs[0].data());
    }catch(e){ return null; }
  },
  saveBooking: async function(d){
    try{
      var r = await db.collection("bookings").add(Object.assign({},d,{status:"requested",createdAt:firebase.firestore.FieldValue.serverTimestamp()}));
      return {ok:true,id:r.id};
    }catch(e){ return {ok:false,id:""}; }
  },
  findDriver: async function(plate){
    try{
      var s = await db.collection("driver_applications").where("plate","==",plate.toUpperCase()).where("status","==","approved").get();
      if(s.empty) return {ok:false,error:"No approved rider found with plate: "+plate};
      return {ok:true,driver:Object.assign({id:s.docs[0].id},s.docs[0].data())};
    }catch(e){ return {ok:false,error:e.message}; }
  },
  saveDriverPin: async function(id,pin){
    try{ await db.collection("driver_applications").doc(id).update({pin:pin}); return {ok:true}; }
    catch(e){ return {ok:false}; }
  },
  applyAsRider: async function(data){
    try{
      // Check if plate already applied
      var existing = await db.collection("driver_applications").where("plate","==",data.plate.toUpperCase()).get();
      if(!existing.empty) return {ok:false,error:"This plate number already has an application."};
      // Check phone
      var byPhone = await db.collection("driver_applications").where("phone","==",data.phone).get();
      if(!byPhone.empty) return {ok:false,error:"This phone number already has an application."};
      await db.collection("driver_applications").add(Object.assign({},data,{
        status:"pending",
        plate:data.plate.toUpperCase(),
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      }));
      return {ok:true};
    }catch(e){ return {ok:false,error:e.message}; }
  },
  getDrivers: async function(){
    try{
      var s = await db.collection("driver_applications").where("status","==","approved").get();
      return s.docs.map(function(d){ return Object.assign({id:d.id},d.data()); });
    }catch(e){ return []; }
  },
  watchBooking: function(id,cb){
    try{ return db.collection("bookings").doc(id).onSnapshot(function(s){ if(s.exists) cb(Object.assign({id:s.id},s.data())); }, function(){}); }
    catch(e){ return function(){}; }
  },
  watchRider: function(name,plate,cb){
    try{ return db.collection("bookings").where("driverName","==",name).onSnapshot(function(s){ cb(s.docs.map(function(d){ return Object.assign({id:d.id},d.data()); })); }, function(){}); }
    catch(e){ return function(){}; }
  },
  watchRiderByPlate: function(plate,cb){
    try{ return db.collection("bookings").where("driverPlate","==",plate).onSnapshot(function(s){ cb(s.docs.map(function(d){ return Object.assign({id:d.id},d.data()); })); }, function(){}); }
    catch(e){ return function(){}; }
  },
  updateBooking: async function(id,data){
    try{ await db.collection("bookings").doc(id).update(data); return {ok:true}; }
    catch(e){ return {ok:false}; }
  },
  updateRiderLocation: async function(bookingId, lat, lng){
    try{
      await db.collection("bookings").doc(bookingId).update({
        riderLat: lat, riderLng: lng,
        locationUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return {ok:true};
    }catch(e){ return {ok:false}; }
  },
  watchRiderLocation: function(bookingId, cb){
    try{
      return db.collection("bookings").doc(bookingId).onSnapshot(function(snap){
        if(snap.exists){
          var d = snap.data();
          if(d.riderLat && d.riderLng){
            cb({lat:d.riderLat, lng:d.riderLng, status:d.status});
          }
        }
      }, function(){});
    }catch(e){ return function(){}; }
  },
  getMyRides: async function(phone){
    try{
      var s = await db.collection("bookings").where("passengerPhone","==",phone).get();
      return s.docs.map(function(d){ return Object.assign({id:d.id},d.data()); })
        .sort(function(a,b){ return ((b.createdAt&&b.createdAt.seconds)||0) - ((a.createdAt&&a.createdAt.seconds)||0); });
    }catch(e){ return []; }
  },
  photoToB64: function(file){
    return new Promise(function(res){
      var r = new FileReader();
      r.onload = function(e){ res(e.target.result); };
      r.onerror = function(){ res(""); };
      r.readAsDataURL(file);
    });
  }
};

// ── PIN SECURITY ─────────────────────────────────────────────────────────────
// SHA-256 hash PINs before storing — browser built-in, no library needed
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
