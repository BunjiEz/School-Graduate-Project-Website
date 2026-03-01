/* ════════════════════════════════
   CWK DEK69 — Main JavaScript
   JS/main.js
════════════════════════════════ */

/* ════════════════════════════════
   CONFETTI CANVAS
════════════════════════════════ */
/* วางไว้บนสุดของไฟล์ main.js */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdjfk9wgaMbOvKx_OrftRFXfs2FFiYTMif_s1r9NUpBZz-SXd77as19xoeR7WutPSHWg/exec';

const cv  = document.getElementById('confetti-canvas');
const cx  = cv.getContext('2d');

function rsz() { cv.width = innerWidth; cv.height = innerHeight; }
rsz();
window.addEventListener('resize', rsz);

const COL = ['#ff4444','#ff8888','#cc0000','#ff6666','#ffaaaa','#ccc','#aaa','#fff','#ffdddd','#ff2222'];
const SHP = ['rect','circle','tri'];

class Dot {
  constructor() { this.reset(true); }
  reset(ini = false) {
    this.x  = Math.random() * cv.width;
    this.y  = ini ? Math.random() * -cv.height : -20;
    this.s  = Math.random() * 10 + 5;
    this.c  = COL[Math.random() * COL.length | 0];
    this.sh = SHP[Math.random() * SHP.length | 0];
    this.vx = (Math.random() - .5) * 2.5;
    this.vy = Math.random() * 2 + 1.5;
    this.r  = Math.random() * Math.PI * 2;
    this.rs = (Math.random() - .5) * .15;
    this.op = .8 + Math.random() * .2;
    this.w  = Math.random() * Math.PI * 2;
    this.ws = Math.random() * .05 + .02;
  }
  tick() {
    this.w  += this.ws;
    this.x  += this.vx + Math.sin(this.w) * .8;
    this.y  += this.vy;
    this.vy += .04;
    this.r  += this.rs;
    if (this.y > cv.height + 20 || this.x < -50 || this.x > cv.width + 50) this.reset();
  }
  draw() {
    cx.save();
    cx.globalAlpha = this.op;
    for (let t = 3; t >= 1; t--) {
      cx.save();
      cx.globalAlpha = this.op * (t / 7.5);
      cx.translate(this.x - this.vx * t * 0.7, this.y - this.vy * t * 0.7);
      cx.rotate(this.r - this.rs * t);
      cx.fillStyle = this.c;
      drawShape(cx, this.sh, this.s * (0.7 + t * 0.1));
      cx.restore();
    }
    cx.translate(this.x, this.y);
    cx.rotate(this.r);
    cx.fillStyle = this.c;
    drawShape(cx, this.sh, this.s);
    cx.restore();
  }
}

function drawShape(ctx, sh, s) {
  if (sh === 'rect') {
    ctx.fillRect(-s/2, -s/4, s, s/2);
  } else if (sh === 'circle') {
    ctx.beginPath(); ctx.arc(0, 0, s/2.5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -s/2); ctx.lineTo(s/2, s/2); ctx.lineTo(-s/2, s/2);
    ctx.closePath(); ctx.fill();
  }
}

const dots = Array.from({ length: 90 }, () => new Dot());
(function confettiLoop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  dots.forEach(d => { d.tick(); d.draw(); });
  requestAnimationFrame(confettiLoop);
})();

/* ════════════════════════════════
   PER-CHARACTER TEXT BUILDER
════════════════════════════════ */
function buildChars(el, text) {
  el.innerHTML = '';
  let chars;
  try {
    const seg = new Intl.Segmenter('th', { granularity: 'grapheme' });
    chars = [...seg.segment(text)].map(s => s.segment);
  } catch (e) { chars = [...text]; }

  chars.forEach(ch => {
    const sp = document.createElement('span');
    if (ch === ' ') {
      sp.className = 'ch space';
      sp.innerHTML = '&nbsp;';
      sp.style.cssText = 'opacity:1;transform:none;animation:none;filter:none;';
    } else {
      sp.className = 'ch';
      sp.textContent = ch;
    }
    el.appendChild(sp);
  });
}

function animateChars(el, animType, delay, onDone) {
  const spans = [...el.querySelectorAll('.ch:not(.space)')];
  const STEP  = animType === 'bounce' ? 60 : 38;
  spans.forEach((sp, i) => {
    setTimeout(() => {
      sp.classList.add(animType === 'bounce' ? 'pop-bounce' : 'pop-ramp');
      if (i === spans.length - 1 && onDone) {
        sp.addEventListener('animationend', onDone, { once: true });
      }
    }, (delay || 0) + i * STEP);
  });
}

/* Build all texts (hidden until section scrolled into view) */
buildChars(document.getElementById('t1'), 'Congratulation นะครับ!');
buildChars(document.getElementById('t2'), 'ขอให้ทุกคนมีความสุขและสมหวังกับมหาลัยที่ฝันกันนะ');
buildChars(document.getElementById('t3'), 'อยากถ่ายรูปกันหน่อยมั้ย?');

/* ════════════════════════════════
   SCROLL-TRIGGERED ANIMATIONS
   Every section fires ONLY when it
   enters the viewport for the first time
════════════════════════════════ */
function onScrollInto(el, threshold, callback) {
  if (!el) return;
  let fired = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !fired) {
      fired = true;
      obs.disconnect();
      callback();
    }
  }, { threshold });
  obs.observe(el);
}



/* Camera: t3 ramp, fires when t3 enters view */
onScrollInto(document.getElementById('t3'), 0.35, () => {
  animateChars(document.getElementById('t3'), 'ramp', 0);
});

/* QR: label chars then image pop */
const qrCard  = document.getElementById('qrCard');
const qrImg   = document.getElementById('qrImg');
const qrLabel = document.getElementById('qrLabel');

onScrollInto(qrCard, 0.15, () => {
  const labelChars = [...qrLabel.querySelectorAll('.qr-label-ch')];
  // Chars animate fast (20ms step)
  labelChars.forEach((ch, i) => {
    setTimeout(() => ch.classList.add('pop-ramp'), i * 20);
  });
  // QR image pops in at the same time as label starts (small 80ms delay feels natural)
  setTimeout(() => {
    if (qrImg) qrImg.classList.add('animate');
  }, 80);
});

/* ════════════════════════════════
   WELCOME POPUP → then start music
════════════════════════════════ */
const welcomeOverlay = document.getElementById('welcomeOverlay');
const welcomeBtn     = document.getElementById('welcomeBtn');
let heroPlayed = false;

welcomeBtn.addEventListener('click', () => {
  // Fade out popup
  welcomeOverlay.classList.add('hide');
  setTimeout(() => { welcomeOverlay.style.display = 'none'; }, 500);

  // animation t1 → t2
  if (!heroPlayed) {
    heroPlayed = true;

    animateChars(document.getElementById('t1'), 'bounce', 0, () => {
      animateChars(document.getElementById('t2'), 'ramp', 180);
    });
  }
  // Start music (user just interacted — browser allows this)
  audio.play()
    .then(() => setPlayingUI(true))
    .catch(() => setPlayingUI(true));
});

/* ════════════════════════════════
   MUSIC TOGGLE
════════════════════════════════ */
const audio       = document.getElementById('bgMusic');
const musicBtn    = document.getElementById('musicBtn');
const iconMuted   = document.getElementById('iconMuted');
const iconPlaying = document.getElementById('iconPlaying');
let musicPlaying  = false;

function setPlayingUI(playing) {
  musicPlaying = playing;
  if (playing) {
    musicBtn.classList.add('playing');
    musicBtn.classList.remove('muted');
    iconMuted.style.display   = 'none';
    iconPlaying.style.display = 'block';
  } else {
    musicBtn.classList.remove('playing');
    musicBtn.classList.add('muted');
    iconMuted.style.display   = 'block';
    iconPlaying.style.display = 'none';
  }
}

/* Manual toggle button */
musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    audio.pause();
    setPlayingUI(false);
  } else {
    audio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(true));
  }
});

/* ════════════════════════════════
   CLOUDINARY — "Client Image" Folder
════════════════════════════════ */
const CLOUDINARY_CLOUD  = 'dudcilzjy';
const CLOUDINARY_PRESET = 'cwk_dek69';
const CLOUDINARY_FOLDER = 'Client_Image';

/* อัพโหลดรูปขึ้น Cloudinary, คืน URL */
async function uploadToCloudinary(dataURL) {
  const formData = new FormData();
  formData.append('file', dataURL);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', CLOUDINARY_FOLDER);
  
  // สำคัญ: การใส่ Tag จะช่วยให้ Cloudinary สร้างไฟล์ .json ให้เราดึงรูปมาโชว์ได้
  formData.append('tags', CLOUDINARY_FOLDER); 

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    {
      method: 'POST',
      body: formData // ส่งแบบ FormData ถูกต้องแล้วสำหรับ Unsigned Upload
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Upload Error:", errorData);
    throw new Error('Upload failed');
  }
  
  const data = await res.json();
  console.log("Upload Success, Tags assigned:", data.tags); // เช็คใน Console ว่ามี Tag ขึ้นไหม
  return data.secure_url;
}

/* ดึงรูปทั้งหมดจาก folder "Client_Image" ใน Cloudinary*/
async function fetchCloudinaryPhotos() {
  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/${CLOUDINARY_FOLDER}.json`
    );

    if (!res.ok) {
      console.error("Cloudinary fetch failed:", res.statusText);
      return [];
    }

    const data = await res.json();

    return (data.resources || []).map(r => {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/w_200,h_200,c_fill,g_auto,q_auto,f_auto/${r.public_id}.${r.format}`;
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}
/* ดึงรูปจาก Cloudinary ทุกๆ 30 วินาที → อัพเดท float layer แบบ realtime */
async function updatePhotosRealtime() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    const data = await res.json(); 
    
    data.forEach(item => {
      // เช็คว่ารูปนี้ลอยอยู่หรือยัง ถ้ายังให้แอดเพิ่ม
      const exists = floatPhotos.some(p => p.img.src === item.url);
      if (!exists) {
        addPhotoToFloat(item.url, item.caption);
      }
    });
  } catch (e) { console.log("Fetch error:", e); }
}

// ตั้งเวลาให้ทำงานทุกๆ n วิ
setInterval(updatePhotosRealtime, 3000);
/* ════════════════════════════════
   FLOATING PHOTOS CANVAS
   Pulls photos ONLY from "Client Image" DB.
   If DB is empty → canvas stays blank.
════════════════════════════════ */
const pc   = document.getElementById('photo-canvas');
const pctx = pc.getContext('2d');

function resizePC() { pc.width = innerWidth; pc.height = innerHeight; }
resizePC();
window.addEventListener('resize', resizePC);

const floatPhotos    = [];  // Image objects loaded from DB
const floatParticles = [];  // Active FloatParticle instances

class FloatParticle {
  constructor(img) { this.img = img; this.reset(true); }
  reset(ini = false) {
    const size    = 56 + Math.random() * 56;
    this.w        = size;
    this.h        = size;
    this.x        = Math.random() * pc.width;
    this.y        = ini ? Math.random() * pc.height : pc.height + this.h + 10;
    this.vx       = (Math.random() - .5) * 0.6;
    this.vy       = -(0.55 + Math.random() * 0.85);
    this.rot      = (Math.random() - .5) * 0.3;
    this.rotS     = (Math.random() - .5) * 0.004;
    this.op       = 0;
    this.targetOp = 0.13 + Math.random() * 0.17;
    this.fadeIn   = true;
    this.wobble   = Math.random() * Math.PI * 2;
    this.wobbleS  = 0.01 + Math.random() * 0.015;
  }
  tick() {
    if (this.fadeIn) {
      this.op += 0.008;
      if (this.op >= this.targetOp) { this.op = this.targetOp; this.fadeIn = false; }
    }
    this.wobble += this.wobbleS;
    this.x      += this.vx + Math.sin(this.wobble) * 0.35;
    this.y      += this.vy;
    this.rot    += this.rotS;
    // Fade out near top
    if (this.y < pc.height * 0.25) {
      this.op -= 0.006;
      if (this.op <= 0) { this.reset(); return; }
    }
    if (this.y < -this.h - 20) this.reset();
  }
  draw() {
  pctx.save();
  pctx.globalAlpha = this.op;
  pctx.translate(this.x + this.w / 2, this.y + this.h / 2);
  pctx.rotate(this.rot);

  // วาดรูปโค้งมน
  drawRoundedImage(pctx, this.img, -this.w/2, -this.h/2, this.w, this.h, 12);

  // --- เพิ่มส่วนวาดข้อความตรงนี้ ---
  if (this.caption) {
    pctx.font = "bold 12px 'Kanit'";
    const tw = pctx.measureText(this.caption).width;
    
    // วาดพื้นหลังข้อความ
    pctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    pctx.beginPath();
    pctx.roundRect(-tw/2 - 6, this.h/2 + 4, tw + 12, 18, 6); 
    pctx.fill();

    // วาดตัวอักษร
    pctx.fillStyle = "#ffffff";
    pctx.textAlign = "center";
    pctx.fillText(this.caption, 0, this.h/2 + 17);
     }
     pctx.restore();
   }
}

function drawRoundedImage(ctx, img, x, y, w, h, r) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);     ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);     ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);         ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

/* Add a single photo dataURL to the float pool */
function addPhotoToFloat(url, caption = "") {
  const img = new Image();
  img.onload = () => {
    // เก็บเป็น Object ที่มีทั้งรูปและข้อความ
    floatPhotos.push({ img: img, caption: caption });
    rebuildParticles();
  };
  img.src = url;
}

/* Sync particle count: 3 per unique photo, max 24 */
function rebuildParticles() {
  if (floatPhotos.length === 0) return;
  const target = Math.min(floatPhotos.length * 3, 24);
  while (floatParticles.length < target) {
    const img = floatPhotos[floatParticles.length % floatPhotos.length];
    floatParticles.push(new FloatParticle(img));
  }
}

(function photoLoop() {
  pctx.clearRect(0, 0, pc.width, pc.height);
  floatParticles.forEach(p => { p.tick(); p.draw(); });
  requestAnimationFrame(photoLoop);
})();

/* On page load: ดึงรูปทั้งหมดจาก Cloudinary "Client_Image" folder → float */
updatePhotosRealtime().then(() => {
  console.log("Database initialized from Google Sheets");
}).catch(err => {
  console.error("Initial fetch failed:", err);
});

/* ════════════════════════════════
   CAMERA & IMAGE OVERLAY
════════════════════════════════ */
const fileInput = document.getElementById('file-input');
const overlay   = document.getElementById('imageOverlay');
const wrapper   = document.getElementById('imageWrapper');
const imgEl     = document.getElementById('previewImg');

fileInput.addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const captionText = document.getElementById('captionInput').value || ""; // ดึงข้อความจากช่องพิมพ์

  const reader = new FileReader();
  reader.onload = async ev => {
    const dataURL = ev.target.result;

    // โชว์ Preview ทันที
    imgEl.src = dataURL;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('active'));

    try {
      // 1. ส่งรูปไป Cloudinary ก่อนเพื่อเอา URL
      const cloudURL = await uploadToCloudinary(dataURL);
      
      // 2. ส่ง URL รูป + ข้อความ ไปบันทึกลง Google Sheets
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({ url: cloudURL, caption: captionText })
      });

      // 3. สั่งให้รูปลอยขึ้นจอตัวเองทันที
      addPhotoToFloat(cloudURL, captionText);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };
  reader.readAsDataURL(f);
  fileInput.value = '';
});
/* ── Swipe image up to close ── */
let sy = null, cy = 0, prevCy = 0, dragging = false;

imgEl.addEventListener('touchstart', e => {
  sy = e.touches[0].clientY; dragging = true; prevCy = 0;
  wrapper.style.transition = 'none';
  wrapper.style.filter = 'blur(0px)';
}, { passive: true });

imgEl.addEventListener('touchmove', e => {
  if (!dragging || sy === null) return;
  const dy       = e.touches[0].clientY - sy; cy = dy;
  const velocity = Math.abs(dy - prevCy);
  const blurAmt  = Math.min(8, velocity * 0.35).toFixed(1);
  prevCy = dy;
  if (dy < 0) {
    const p = Math.min(1, Math.abs(dy) / 150);
    wrapper.style.transform = `translateY(${dy * .5}px) scale(${1 - p * .28})`;
    wrapper.style.opacity   = String(1 - p * .4);
    wrapper.style.filter    = `blur(${blurAmt}px)`;
  } else {
    wrapper.style.transform = `translateY(${dy * .1}px)`;
    wrapper.style.opacity   = '1';
    wrapper.style.filter    = `blur(${blurAmt}px)`;
  }
}, { passive: true });

imgEl.addEventListener('touchend', () => {
  if (cy < -65) {
    closeOverlay();
  } else {
    wrapper.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1), opacity .3s ease, filter .25s ease';
    wrapper.style.transform  = '';
    wrapper.style.opacity    = '';
    wrapper.style.filter     = 'blur(0px)';
    setTimeout(() => { wrapper.style.transition = 'none'; wrapper.style.filter = ''; }, 400);
  }
  dragging = false; sy = null; cy = 0; prevCy = 0;
});

function closeOverlay() {
  wrapper.style.transition = 'none';
  wrapper.style.transform  = '';
  wrapper.style.opacity    = '';
  wrapper.style.filter     = '';
  wrapper.classList.add('closing');
  wrapper.addEventListener('animationend', () => {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
    wrapper.classList.remove('closing');
    imgEl.src = '';
    document.getElementById('captionInput').value = '';
  }, { once: true });
}
history.scrollRestoration = 'manual';

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});
