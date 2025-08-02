import { db, roomRef } from './firebase.js';
import { BLOCKS, POWERUPS } from './powerups.js';

let roomCode, playerId = Math.random().toString(36).slice(2,6);
let mode, timerSec, interval;
let myGrid = Array.from({length:8},()=>Array(8).fill(0));
let myBlocks = ['k2','l2','h5'];
let score = {A:0,B:0};
let team = '';

window.createRoom = () => {
  roomCode = Math.random().toString(36).slice(2,7).toUpperCase();
  mode = document.getElementById('mode').value;
  timerSec = +document.getElementById('timer').value;
  roomRef(roomCode).set({mode,timerSec,score,players:{},status:'waiting'});
  location.hash = roomCode;
  init();
};
window.joinRoom = () => {
  roomCode = document.getElementById('joinCode').value.toUpperCase();
  location.hash = roomCode;
  init();
};

function init(){
  document.getElementById('lobby').classList.remove('active');
  document.getElementById('game').classList.add('active');

  roomRef(roomCode).once('value',snap=>{
    const data = snap.val();
    mode = data.mode;
    timerSec = data.timerSec;
    startTimer();
  });

  roomRef(roomCode).child('score').on('value',s=>{
    score = s.val() || {A:0,B:0};
    updateBars();
  });

  // contoh tim
  team = Math.random() < 0.5 ? 'A' : 'B';
  roomRef(roomCode).child(`players/${playerId}`).set({team});
}

function startTimer(){
  interval = setInterval(()=>{
    timerSec--;
    const m = Math.floor(timerSec/60);
    const s = timerSec%60;
    document.getElementById('timeLeft').textContent = `${m}:${s.toString().padStart(2,'0')}`;
    if(timerSec<=0){
      clearInterval(interval);
      alert(`Waktu habis! Tim ${score.A>score.B?'A':'B'} menang`);
    }
  },1000);
}

function updateBars(){
  const total = score.A + score.B || 1;
  document.getElementById('barA').style.width = (score.A/total*100)+'%';
  document.getElementById('barB').style.width = (score.B/total*100)+'%';
  document.getElementById('scoreDisplay').textContent = `${score.A} – ${score.B}`;
}

// contoh clear baris
function clearRow(y){
  let full = myGrid[y].every(v=>v);
  if(full){
    myGrid[y].fill(0);
    roomRef(roomCode).child(`score/${team}`).set(firebase.database.ServerValue.increment(1));
  }
}