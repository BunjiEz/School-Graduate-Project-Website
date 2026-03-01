/* ════════════════════════════════
   CWK DEK69 — Main JavaScript
   (แก้ไข: Hybrid Cloudinary + Google Sheets)
════════════════════════════════ */

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweVh8HxiUHjekrCXHjgzF14I249n8Vnp9rjXGdxj9rJuIUNxyjQAY69wb_kDSr2Ma2Dg/exec';
const CLOUDINARY_CLOUD  = 'dudcilzjy';
const CLOUDINARY_PRESET = 'cwk_dek69';
const CLOUDINARY_FOLDER = 'Client_Image';

// --- Confetti Setup ---
const cv = document.getElementById('confetti-canvas');
const cx = cv.getContext('2d');
function rsz() { cv.width = innerWidth; cv.height = innerHeight; }
rsz(); window.addEventListener('resize', rsz);
const COL = ['#ff4444','#ff8888','#cc0000','#ff6666','#ffaaaa','#ccc','#aaa','#fff','#ffdddd','#ff2222'];
const SHP = ['rect','circle','tri'];

class Dot {
  constructor() { this.reset(true); }
  reset(ini = false) {
    this.x = Math.random() * cv.width;
    this.y = ini ? Math.random() * -cv.height : -20;
    this.s = Math.random() * 10 + 5;
    this.c = COL[Math.random() * COL.length | 0];
    this.sh = SHP[Math.random() * SHP.length | 0];
    this.vx = (Math.random() - .5) * 2.5;
    this.vy = Math.random() * 2 + 1.5;
    this.r = Math.random() * Math.PI * 2;
    this.rs = (Math.random() - .5) * .15;
    this.op = .8 + Math.random() * .2;
    this.w = Math.random() * Math.PI * 2;
    this.ws = Math.random() * .05 + .02;
  }
  tick() {
    this.w += this.ws;
    this.x += this.vx + Math.sin(this.w) * .8;
    this.y += this.vy; this.vy += .04; this.r += this.rs;
    if (this.y > cv.height + 20 || this.x < -50 || this.x > cv.width + 50) this.reset();
  }
  draw() {
    cx.save(); cx.globalAlpha = this.op;
    cx.translate(this.x, this.y); cx.rotate(this.r);
    cx.fillStyle = this.c; drawShape(cx, this.sh, this.s);
    cx.restore();
  }
}
function drawShape(ctx, sh, s) {
  if (sh === 'rect') ctx.fillRect(-s/2, -s/4, s, s/2);
  else if (sh === 'circle') { ctx.beginPath(); ctx.arc(0, 0, s/2.5, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(0, -s/2); ctx.lineTo(s/2, s/2); ctx.lineTo(-s/2, s/2); ctx.closePath(); ctx.fill(); }
}
const dots = Array.from({ length: 60 }, () => new Dot());
(function confettiLoop() { cx.clearRect(0, 0, cv.width, cv.height); dots.forEach(d => { d.tick(); d.draw(); }); requestAnimationFrame(confettiLoop); })();

// --- Text Builders & Animations ---
function buildChars(el, text) {
  el.innerHTML = ''; let chars;
  try { const seg = new Intl.Segmenter('th', { granularity: 'grapheme' }); chars = [...seg.segment(text)].map(s => s.segment); } catch (e) { chars = [...text]; }
  chars.forEach(ch => {
    const sp = document.createElement('span');
    if (ch === ' ') { sp.className = 'ch space'; sp.innerHTML = '&nbsp;'; } 
    else { sp.className = 'ch'; sp.textContent = ch; }
    el.appendChild(sp);
  });
}
function animateChars(el, animType, delay, onDone) {
  const spans = [...el.querySelectorAll('.ch:not(.space)')];
  spans.forEach((sp, i) => {
    setTimeout(() => {
      sp.classList.add(animType === 'bounce' ? 'pop-bounce' : 'pop-ramp');
      if (i === spans.length - 1 && onDone) sp.addEventListener('animationend', onDone, { once: true });
    }, (delay || 0) + i * (animType === 'bounce' ? 60 : 38));
  });
}

buildChars(document.getElementById('t1'), 'Congratulation นะครับ!');
buildChars(document.getElementById('t2'), 'ขอให้ทุกคนมีความสุขและสมหวังกับมหาลัยที่ฝันกันนะ');
buildChars(document.getElementById('t3'), 'อยากถ่ายรูปกันหน่อยมั้ย?');

function onScrollInto(el, threshold, callback) {
  if (!el) return; let fired = false;
  const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting && !fired) { fired = true; obs.disconnect(); callback(); } }, { threshold });
  obs.observe(el);
}
onScrollInto(document.getElementById('t3'), 0.35, () => animateChars(document.getElementById('t3'), 'ramp', 0));

// --- Music ---
const audio = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const iconMuted = document.getElementById('iconMuted');
const iconPlaying = document.getElementById('iconPlaying');
let musicPlaying = false;
function setPlayingUI(p) {
  musicPlaying = p;
  musicBtn.classList.toggle('playing', p); musicBtn.classList.toggle('muted', !p);
  iconMuted.style.display = p ? 'none' : 'block'; iconPlaying.style.display = p ? 'block' : 'none';
}
musicBtn.addEventListener('click', () => { if (musicPlaying) { audio.pause(); setPlayingUI(false); } else { audio.play().then(() => setPlayingUI(true)); } });

const welcomeOverlay = document.getElementById('welcomeOverlay');
const welcomeBtn = document.getElementById('welcomeBtn');
welcomeBtn.addEventListener('click', () => {
  welcomeOverlay.classList.add('hide'); setTimeout(() => { welcomeOverlay.style.display = 'none'; }, 500);
  animateChars(document.getElementById('t1'), 'bounce', 0, () => animateChars(document.getElementById('t2'), 'ramp', 180));
  audio.play().then(() => setPlayingUI(true));
});

// --- Floating Photos Logic ---
const pc = document.getElementById('photo-canvas');
const pctx = pc.getContext('2d');
function resizePC() { pc.width = innerWidth; pc.height = innerHeight; }
resizePC(); window.addEventListener('resize', resizePC);

const floatPhotos = []; // { img, caption }
const floatParticles = [];

class FloatParticle {
  constructor(obj) { this.img = obj.img; this.caption = obj.caption; this.reset(true); }
  reset(ini = false) {
    const size = 60 + Math.random() * 50;
    this.w = size; this.h = size;
    this.x = Math.random() * pc.width;
    this.y = ini ? Math.random() * pc.height : pc.height + 100;
    this.vx = (Math.random() - .5) * 0.5;
    this.vy = -(0.5 + Math.random() * 0.8);
    this.rot = (Math.random() - .5) * 0.3;
    this.rotS = (Math.random() - .5) * 0.003;
    this.op = 0; this.targetOp = 0.4 + Math.random() * 0.3;
    this.fadeIn = true;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleS = 0.01;
  }
  tick() {
    if (this.fadeIn) { this.op += 0.01; if (this.op >= this.targetOp) this.fadeIn = false; }
    this.x += this.vx + Math.sin(this.wobble += this.wobbleS) * 0.3;
    this.y += this.vy; this.rot += this.rotS;
    if (this.y < -150) this.reset();
  }
  draw() {
    pctx.save(); pctx.globalAlpha = this.op;
    pctx.translate(this.x + this.w / 2, this.y + this.h / 2); pctx.rotate(this.rot);
    
    // Draw Photo
    drawRoundedImage(pctx, this.img, -this.w/2, -this.h/2, this.w, this.h, 12);

    // Draw Caption
    if (this.caption) {
      pctx.font = "bold 12px 'Kanit'";
      const tw = pctx.measureText(this.caption).width;
      pctx.fillStyle = "rgba(0,0,0,0.5)";
      pctx.roundRect(-tw/2 - 5, this.h/2 + 5, tw + 10, 18, 5); pctx.fill();
      pctx.fillStyle = "white"; pctx.textAlign = "center";
      pctx.fillText(this.caption, 0, this.h/2 + 18);
    }
    pctx.restore();
  }
}

function drawRoundedImage(ctx, img, x, y, w, h, r) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip();
  ctx.drawImage(img, x, y, w, h); ctx.restore();
}

function addPhotoToFloat(obj) {
  const img = new Image();
  img.crossOrigin = "anonymous"; 
  img.onload = () => {
    floatPhotos.push({ img, caption: obj.caption });
    rebuildParticles();
  };
  img.src = obj.url;
}

function rebuildParticles() {
  const target = Math.min(floatPhotos.length * 2, 20);
  while (floatParticles.length < target) {
    floatParticles.push(new FloatParticle(floatPhotos[floatParticles.length % floatPhotos.length]));
  }
}

(function photoLoop() { pctx.clearRect(0, 0, pc.width, pc.height); floatParticles.forEach(p => { p.tick(); p.draw(); }); requestAnimationFrame(photoLoop); })();

// --- API Interactions ---
async function uploadToCloudinary(dataURL) {
  const formData = new FormData();
  formData.append('file', dataURL);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', CLOUDINARY_FOLDER);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData });
  return await res.json();
}

async function updatePhotosRealtime() {
  try {
    const sheetRes = await fetch(GOOGLE_SCRIPT_URL);
    const captionsMap = await sheetRes.json();
    
    const cloudRes = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/${CLOUDINARY_FOLDER}.json`);
    const cloudData = await cloudRes.json();

    cloudData.resources.forEach(r => {
      const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${r.public_id}.${r.format}`;
      const caption = captionsMap[r.public_id] || "";
      if (!floatPhotos.some(p => p.img.src === url)) addPhotoToFloat({ url, caption });
    });
  } catch (e) { console.error("Sync Error:", e); }
}
setInterval(updatePhotosRealtime, 15000);
updatePhotosRealtime();

// --- Camera & Upload Logic ---
const fileInput = document.getElementById('file-input');
const overlay = document.getElementById('imageOverlay');
const imgEl = document.getElementById('previewImg');

fileInput.addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const captionText = document.getElementById('captionInput').value || "";
  const reader = new FileReader();
  reader.onload = async ev => {
    const dataURL = ev.target.result;
    imgEl.src = dataURL; overlay.style.display = 'flex';
    overlay.classList.add('active');
    try {
      const cloudData = await uploadToCloudinary(dataURL);
      // ส่งไปจดใน Sheets
      fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ public_id: cloudData.public_id, caption: captionText }) });
      addPhotoToFloat({ url: cloudData.secure_url, caption: captionText });
    } catch (err) { addPhotoToFloat({ url: dataURL, caption: captionText }); }
  };
  reader.readAsDataURL(f);
  fileInput.value = '';
});

// Swipe to close
let sy = null;
imgEl.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, {passive:true});
imgEl.addEventListener('touchmove', e => {
  const dy = e.touches[0].clientY - sy;
  if (dy < -70) { 
    overlay.classList.remove('active'); 
    setTimeout(() => { overlay.style.display='none'; document.getElementById('captionInput').value=''; }, 300);
  }
}, {passive:true});