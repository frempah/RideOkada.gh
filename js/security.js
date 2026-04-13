/* ═══════════════════════════════════════════
   OkadaRide — Security System
   - PIN lockout (5 attempts → 30 min lock)
   - Booking rate limiting (max 3/hour)
   - Brute force protection
   ═══════════════════════════════════════════ */
'use strict';

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
