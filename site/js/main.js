(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root   = document.documentElement;

  /* ---------- 0. 深淺色 / 語言切換 ---------- */
  function save(key, val){ try{ localStorage.setItem(key, val); }catch(e){} }

  var themeBtn = document.getElementById("themeBtn");
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme(){
    return root.dataset.theme || (systemDark.matches ? "dark" : "light");
  }
  function setTheme(t){
    root.dataset.theme = t;
    themeBtn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    save("theme", t);
  }
  themeBtn.addEventListener("click", function(){
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
  themeBtn.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");
  // 使用者沒手動選過時，跟隨系統設定變化
  systemDark.addEventListener("change", function(e){
    try{ if(localStorage.getItem("theme")) return; }catch(err){}
    root.dataset.theme = e.matches ? "dark" : "light";
  });

  var langBtn = document.getElementById("langBtn");
  function setLang(l){
    var en = (l === "en");
    root.lang = en ? "en" : "zh-Hant";
    document.title = en
      ? "CHEN YU-HAO — Web Developer & System Integrator"
      : "CHEN YU-HAO — 網頁前端與系統整合";
    save("lang", en ? "en" : "zh");
    // 文字長度變了，讓跑馬燈重新量寬度
    window.dispatchEvent(new Event("resize"));
  }
  langBtn.addEventListener("click", function(){
    setLang(root.lang === "en" ? "zh" : "en");
  });
  // 首次造訪且瀏覽器語言非中文時，預設英文
  (function(){
    var saved = null;
    try{ saved = localStorage.getItem("lang"); }catch(e){}
    if(!saved && !/^zh/i.test(navigator.language || "")) setLang("en");
  })();

  /* ---------- 1. 開場序列：遮幕上收 + 文字揭示 ---------- */
  window.addEventListener("load", function(){
    requestAnimationFrame(function(){
      setTimeout(function(){ document.body.classList.add("is-ready"); }, 120);
      setTimeout(fillBars, 900);
    });
  });
  // 保險：load 若未觸發
  setTimeout(function(){ if(!document.body.classList.contains("is-ready")){ document.body.classList.add("is-ready"); fillBars(); } }, 2200);

  function fillBars(){
    document.querySelectorAll(".bar .track b").forEach(function(b,i){
      setTimeout(function(){ b.style.width = b.dataset.w + "%"; }, i*90);
    });
  }

  /* ---------- 2. 捲動進度條 ---------- */
  var prog = document.querySelector(".progress");
  function onScroll(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  }
  document.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---------- 3. 作品進場：黑幕橫向擦除 ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, {threshold:0.22, rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll(".work, .sec-head, .contact").forEach(function(el){ io.observe(el); });

  /* ---------- 4. 標題亂碼重組 scramble ---------- */
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*/";
  function scramble(el){
    var final = el.dataset.final || el.textContent;
    el.dataset.final = final;
    if(reduce){ el.textContent = final; return; }
    var frame = 0, total = final.length * 3 + 18;
    var id = setInterval(function(){
      var out = "";
      for(var i=0;i<final.length;i++){
        if(final[i] === " "){ out += " "; continue; }
        if(frame > i*3 + 10){ out += final[i]; }
        else { out += CHARS[Math.floor(Math.random()*CHARS.length)]; }
      }
      el.textContent = out;
      if(++frame > total){ clearInterval(id); el.textContent = final; }
    }, 28);
  }
  var sio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ scramble(e.target); sio.unobserve(e.target); }
    });
  }, {threshold:0.9});
  document.querySelectorAll("[data-scramble]").forEach(function(el){ sio.observe(el); });

  /* ---------- 5. 作品編號浮標 ---------- */
  var counter = document.querySelector(".counter");
  var cNum = counter.querySelector("b");
  var works = Array.prototype.slice.call(document.querySelectorAll(".work"));
  var worksWrap = document.querySelector(".works");
  function updateCounter(){
    if(!worksWrap) return;
    var r = worksWrap.getBoundingClientRect();
    var inside = r.top < window.innerHeight*0.5 && r.bottom > window.innerHeight*0.5;
    counter.classList.toggle("is-on", inside);
    if(!inside) return;
    for(var i=0;i<works.length;i++){
      var wr = works[i].getBoundingClientRect();
      if(wr.top <= window.innerHeight*0.5 && wr.bottom >= window.innerHeight*0.5){
        cNum.textContent = String(i+1).padStart(2,"0");
        break;
      }
    }
  }
  document.addEventListener("scroll", updateCounter, {passive:true});
  updateCounter();

  /* ---------- 6. 跑馬燈（隨捲動微調速度） ---------- */
  document.querySelectorAll("[data-marquee]").forEach(function(track){
    var base = parseFloat(track.dataset.speed) || 0.6;
    track.innerHTML += track.innerHTML; // 複製一份做無縫循環
    var x = 0, half = 0, last = 0, boost = 0, lastY = window.scrollY;
    function measure(){ half = track.scrollWidth / 2; }
    measure();
    window.addEventListener("resize", measure);
    document.addEventListener("scroll", function(){
      boost = Math.min(Math.abs(window.scrollY - lastY) * 0.25, 9);
      lastY = window.scrollY;
    }, {passive:true});
    function tick(t){
      var dt = last ? Math.min(t - last, 40) : 16; last = t;
      x -= (base + boost) * dt / 16;
      boost *= 0.92;
      if(half && -x >= half) x += half;
      track.style.transform = "translate3d(" + x + "px,0,0)";
      requestAnimationFrame(tick);
    }
    if(!reduce) requestAnimationFrame(tick);
  });

  /* ---------- 7. 自訂游標 + 磁吸按鈕 ---------- */
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if(fine && !reduce){
    var cur = document.querySelector(".cursor");
    var cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
    document.addEventListener("mousemove", function(e){ tx = e.clientX; ty = e.clientY; });
    (function loop(){
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cur.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, .logo").forEach(function(el){
      el.addEventListener("mouseenter", function(){ cur.classList.add("is-big"); });
      el.addEventListener("mouseleave", function(){ cur.classList.remove("is-big"); });
    });

    document.querySelectorAll("[data-magnetic]").forEach(function(btn){
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width/2;
        var my = e.clientY - r.top - r.height/2;
        btn.style.transform = "translate(" + mx*0.22 + "px," + my*0.3 + "px)";
      });
      btn.addEventListener("mouseleave", function(){
        btn.style.transition = "transform .45s cubic-bezier(.2,.8,.2,1)";
        btn.style.transform = "translate(0,0)";
        setTimeout(function(){ btn.style.transition = ""; }, 450);
      });
    });
  }

  /* ---------- 8. 導覽列目前區塊 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var nio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      navLinks.forEach(function(a){ a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id); });
    });
  }, {rootMargin:"-45% 0px -50% 0px"});
  ["top","work","clients","contact"].forEach(function(id){
    var el = document.getElementById(id); if(el) nio.observe(el);
  });
})();
