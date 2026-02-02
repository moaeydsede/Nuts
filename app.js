(function(){
  // ================= CSV LINKS =================
  var SETTINGS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQ1V6ULLg5Eqm_HSDWXIDVlXZMenjMnnH8nhLku5RolKjlOAzgWbPQpOjc1mUF43CdYdjyA0fK18Fs/pub?gid=1575853082&single=true&output=csv";
  var ITEMS_CSV_URL    = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQ1V6ULLg5Eqm_HSDWXIDVlXZMenjMnnH8nhLku5RolKjlOAzgWbPQpOjc1mUF43CdYdjyA0fK18Fs/pub?gid=496750562&single=true&output=csv";

  // ============== SVG ICONS ==============
  var SVG = {
    instagram:'<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2ZM17.7 6.8a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9Z"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24"><path d="M16.5 2c.3 2.6 2 4.7 4.5 5.2v3.2c-1.7.1-3.3-.4-4.5-1.2V16a6 6 0 1 1-6-6c.4 0 .8 0 1.2.1v3.3a3 3 0 1 0 1.8 2.7V2h3z"/></svg>',
    telegram:'<svg viewBox="0 0 24 24"><path d="M21.8 4.6 19 19.6c-.2 1.1-.8 1.4-1.7.9l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-5.2 9.4-8.5c.4-.4-.1-.6-.6-.3l-11.6 7.3-5-1.6c-1.1-.3-1.1-1.1.2-1.6l19.5-7.5c.9-.3 1.6.2 1.3 1.3Z"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24"><path d="M12 2a9.8 9.8 0 0 0-8.3 15.1L3 22l5-1.3A9.8 9.8 0 1 0 12 2Zm0 18a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20Zm4.7-6.1c-.3-.2-1.7-.8-2-.9s-.5-.2-.7.2-.8.9-.9 1.1-.3.2-.6.1a6.6 6.6 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5a.6.6 0 0 0 0-.6c-.1-.2-.7-1.8-1-2.4s-.5-.6-.7-.6h-.6a1.2 1.2 0 0 0-.9.4 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.1 11.1 0 0 0 4.3 3.8 4.9 4.9 0 0 0 3.2.6 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.4Z"/></svg>'
  };

  // ============== STATE ==============
  var CONFIG = {
    shopName: "Menu",
    deliveryLine: "",
    currency: "EGP",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    telegram: "",
    logoDirect: ""
  };

  var ITEMS = [];
  var ACTIVE_CAT = "";
  var CART = {};
  var LS_KEY = "noran_sham_cart_vip_settings_v1";

  // ============== DOM ==============
  var elLoading = byId("loading");
  var elErrorBox = byId("errorBox");
  var elErrorText = byId("errorText");
  var elContent = byId("content");
  var elTabs = byId("tabs");
  var elGrid = byId("grid");
  var elQ = byId("q");
  var elItemsCount = byId("itemsCount");

  var elFab = byId("fab");
  var elCartBadge = byId("cartBadge");
  var elTotalVal = byId("totalVal");

  var elOverlay = byId("overlay");
  var elCartLines = byId("cartLines");
  var elCartSearch = byId("cartSearch");
  var elCartAddList = byId("cartAddList");
  var elHint = byId("hint");

  byId("retryBtn").onclick = function(){ loadAll(); };
  byId("openCartBtn").onclick = openCart;
  byId("checkoutBtn").onclick = openCart;
  byId("closeBtn").onclick = closeCart;
  elOverlay.onclick = function(e){ if(e && e.target && e.target.id==="overlay") closeCart(); };

  elQ.oninput = render;
  byId("clearCartBtn").onclick = function(){ CART={}; saveCart(); updateFab(); renderCart(); renderCartAdd(); };

  elCartSearch.oninput = renderCartAdd;
  byId("sendWaBtn").onclick = sendWhatsApp;
  byId("copyBtn").onclick = copyOrderText;

  loadCart();
  updateFab();
  loadAll();

  function loadAll(){
    showLoading(true);
    byId("loadingHint").textContent = "تحميل الإعدادات...";

    fetchText(SETTINGS_CSV_URL, function(err, csv){
      if(err) return showError("تعذر تحميل SETTINGS.\n" + err);
      try{
        applySettings(parseCSV(csv));
        paintHeader();
        renderSocial();
      }catch(e){
        return showError("خطأ في SETTINGS: " + (e && e.message ? e.message : e));
      }

      byId("loadingHint").textContent = "تحميل المنتجات...";
      fetchText(ITEMS_CSV_URL, function(err2, csv2){
        if(err2) return showError("تعذر تحميل ITEMS.\n" + err2);
        try{
          ITEMS = normalizeItems(parseCSV(csv2));
          if(!ITEMS.length) return showError("لا توجد منتجات.\nتأكد أن ورقة ITEMS فيها بيانات والهيدر صحيح.");
          buildTabs();
          render();
          showLoading(false);
          updateFab();
        }catch(e2){
          showError("خطأ في ITEMS: " + (e2 && e2.message ? e2.message : e2));
        }
      });
    });
  }

  function showLoading(on){
    elLoading.style.display = on ? "" : "none";
    elContent.style.display = on ? "none" : "";
    elErrorBox.style.display = "none";
  }
  function showError(msg){
    elLoading.style.display = "none";
    elContent.style.display = "none";
    elErrorBox.style.display = "";
    elErrorText.textContent = msg;
  }

  // SETTINGS
  function applySettings(rows){
    var map = {};
    for(var i=0;i<rows.length;i++){
      var k = trim(rows[i].key);
      if(!k) continue;
      map[k] = trim(rows[i].value);
    }
    CONFIG.shopName = map.shopName || CONFIG.shopName;
    CONFIG.deliveryLine = map.deliveryLine || "";
    CONFIG.currency = map.currency || CONFIG.currency;
    CONFIG.whatsapp = normalizeWhatsApp(map.whatsapp || "");
    CONFIG.instagram = map.social_instagram || "";
    CONFIG.tiktok = map.social_tiktok || "";
    CONFIG.telegram = map.social_telegram || "";
    CONFIG.logoDirect = toDriveDirect(map.logoUrl || "");
  }

  function paintHeader(){
    document.title = (CONFIG.shopName || "Menu") + " - VIP";
    byId("shopName").textContent = CONFIG.shopName || "Menu";

    var dl = byId("deliveryLine");
    if(CONFIG.deliveryLine){
      dl.textContent = CONFIG.deliveryLine;
      dl.style.display = "";
    }else{
      dl.textContent = "";
      dl.style.display = "none";
    }

    var logoImg = byId("logoImg");
    var logoFallback = byId("logoFallback");

    if(CONFIG.logoDirect){
      logoImg.onload = function(){ logoImg.style.display="block"; logoFallback.style.display="none"; };
      logoImg.onerror = function(){ logoImg.style.display="none"; logoFallback.style.display="block"; };
      logoImg.src = CONFIG.logoDirect;
    }else{
      logoImg.style.display="none";
      logoFallback.style.display="block";
    }
  }

  function normalizeWhatsApp(v){
    return String(v||"").replace(/[^\d]/g,"");
  }

  function toDriveDirect(url){
    url = String(url||"").trim();
    if(!url) return "";
    var m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if(m && m[1]) return "https://drive.google.com/uc?export=view&id=" + m[1];
    var m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if(m2 && m2[1]) return "https://drive.google.com/uc?export=view&id=" + m2[1];
    return url;
  }

  // ITEMS
  function normalizeItems(rows){
    var out = [];
    for(var i=0;i<rows.length;i++){
      var r = rows[i];
      if(!r.id || !r.name) continue;

      var active = String(r.active||"").toLowerCase();
      if(active==="false" || active==="0") continue;

      out.push({
        id: String(r.id),
        name: String(r.name),
        category: r.category ? String(r.category) : "أصناف",
        unitType: (String(r.unitType)==="weight") ? "weight" : "piece",
        price: toNum(r.price),
        sort: toNum(r.sort) || 999999,
        desc: r.desc ? String(r.desc) : "",
        defaultWeightG: toNum(r.defaultWeightG) || 250
      });
    }

    out.sort(function(a,b){
      var c = a.category.localeCompare(b.category, "ar");
      if(c!==0) return c;
      var s = (a.sort||999999)-(b.sort||999999);
      if(s!==0) return s;
      return a.name.localeCompare(b.name, "ar");
    });
    return out;
  }

  // UI
  function buildTabs(){
    var cats = [];
    for(var i=0;i<ITEMS.length;i++){
      var c = ITEMS[i].category || "أصناف";
      if(cats.indexOf(c)===-1) cats.push(c);
    }
    ACTIVE_CAT = ACTIVE_CAT || cats[0] || "أصناف";

    elTabs.innerHTML = "";
    for(i=0;i<cats.length;i++){
      (function(cat){
        var b = document.createElement("button");
        b.className = "tab" + (cat===ACTIVE_CAT ? " active":"");
        b.textContent = cat;
        b.onclick = function(){
          ACTIVE_CAT = cat;
          var kids = elTabs.children;
          for(var k=0;k<kids.length;k++) kids[k].className = kids[k].className.replace(" active","");
          b.className += " active";
          render();
        };
        elTabs.appendChild(b);
      })(cats[i]);
    }
    elItemsCount.textContent = ITEMS.length + " صنف";
  }

  function render(){
    var q = (elQ.value||"").trim().toLowerCase();
    var list = [];
    for(var i=0;i<ITEMS.length;i++){
      var it = ITEMS[i];
      if((it.category||"أصناف")!==ACTIVE_CAT) continue;
      if(!q){ list.push(it); continue; }
      if(it.name.toLowerCase().indexOf(q)!==-1 || it.desc.toLowerCase().indexOf(q)!==-1){
        list.push(it);
      }
    }

    elGrid.innerHTML = "";
    for(i=0;i<list.length;i++){
      (function(it){
        var card = document.createElement("div");
        card.className = "card";
        var priceLabel = (it.unitType==="weight") ? (fmt(it.price)+" / كيلو") : (fmt(it.price)+" / قطعة");

        card.innerHTML =
          '<div class="row">' +
            '<div class="strong">'+esc(it.name)+'</div>' +
            '<div class="price">'+esc(priceLabel)+'</div>' +
          '</div>' +
          '<div class="desc">'+esc(it.desc||"")+'</div>' +
          '<div class="badges">' +
            '<span class="badge2">'+(it.unitType==="weight"?"بالكيلو":"بالقطعة")+'</span>' +
            (it.unitType==="weight" ? '<span class="badge2">افتراضي: '+(it.defaultWeightG||250)+' جم</span>' : '') +
          '</div>' +
          '<div style="margin-top:10px">' +
            '<button class="btn primary" style="width:100%">إضافة للسلة</button>' +
          '</div>';

        card.querySelector("button").onclick = function(){ addToCart(it); };
        elGrid.appendChild(card);
      })(list[i]);
    }
  }

  // SOCIAL (only show if not empty)
  function renderSocial(){
    var wrap = byId("social");
    wrap.innerHTML = "";

    addSocialBtn(wrap, CONFIG.instagram, SVG.instagram);
    addSocialBtn(wrap, CONFIG.tiktok, SVG.tiktok);
    addSocialBtn(wrap, CONFIG.telegram, SVG.telegram);

    if(CONFIG.whatsapp){
      var b = mkBtn(SVG.whatsapp);
      b.onclick = function(){ window.open("https://wa.me/"+CONFIG.whatsapp, "_blank"); };
      wrap.appendChild(b);
    }
  }

  function addSocialBtn(parent, url, svg){
    url = trim(url);
    if(!url) return;
    var b = mkBtn(svg);
    b.onclick = function(){ window.open(url, "_blank"); };
    parent.appendChild(b);
  }

  function mkBtn(svg){
    var b = document.createElement("button");
    b.className = "sbtn";
    b.innerHTML = svg;
    return b;
  }

  // CART
  function addToCart(it){
    var id = String(it.id);
    if(!CART[id]){
      CART[id] = { id:id, name:it.name, unitType:it.unitType, price:it.price, qty:1, weightG:it.defaultWeightG||250 };
    }else{
      if(CART[id].unitType==="piece") CART[id].qty = (CART[id].qty||1)+1;
      else CART[id].weightG = (CART[id].weightG||250) + (it.defaultWeightG||250);
    }
    saveCart(); updateFab(); renderCart();
  }

  function updateFab(){
    var keys = Object.keys(CART);
    if(!keys.length){ elFab.style.display="none"; return; }
    var count = 0;
    for(var i=0;i<keys.length;i++){
      var x = CART[keys[i]];
      count += (x.unitType==="piece") ? (x.qty||0) : 1;
    }
    elCartBadge.textContent = String(count);
    elTotalVal.textContent = fmt(calcTotal());
    elFab.style.display = "";
  }

  function openCart(){
    elHint.textContent = "✅ تقدر تعدّل وزن/كمية + تضيف أصناف من داخل السلة ثم ترسل واتساب.";
    renderCart(); renderCartAdd();
    elOverlay.style.display = "flex";
  }
  function closeCart(){ elOverlay.style.display="none"; }

  function renderCart(){
    var keys = Object.keys(CART);
    if(!keys.length){
      elCartLines.innerHTML = '<div class="center muted">السلة فارغة</div>';
      return;
    }

    var html = "";
    for(var i=0;i<keys.length;i++){
      var x = CART[keys[i]];
      var lineTotal = (x.unitType==="piece") ? (x.price*(x.qty||0)) : (x.price*((x.weightG||0)/1000));

      html +=
        '<div class="cartLine">' +
          '<div class="lineTop">' +
            '<div>' +
              '<div class="lineName">'+esc(x.name)+'</div>' +
              '<div class="lineSub">الإجمالي: <b style="color:var(--brand)">'+esc(fmt(lineTotal))+'</b></div>' +
            '</div>' +
          '</div>' +
          '<div class="qtyRow">' +
            '<button class="qbtn" data-m="'+esc(x.id)+'">−</button>' +
            '<input class="qin" data-i="'+esc(x.id)+'" value="'+(x.unitType==="piece"?(x.qty||1):(x.weightG||250))+'" />' +
            '<button class="qbtn" data-p="'+esc(x.id)+'">+</button>' +
            '<span class="badge2">'+(x.unitType==="piece"?"قطعة":"جرام")+'</span>' +
            '<button class="trash" data-d="'+esc(x.id)+'">حذف</button>' +
          '</div>' +
        '</div>';
    }
    elCartLines.innerHTML = html;
    bindCartEvents();
  }

  function bindCartEvents(){
    var minus = elCartLines.querySelectorAll("[data-m]");
    for(var i=0;i<minus.length;i++){
      minus[i].onclick = function(){
        var id = this.getAttribute("data-m");
        var x = CART[id]; if(!x) return;
        if(x.unitType==="piece") x.qty = Math.max(1,(x.qty||1)-1);
        else x.weightG = Math.max(50,(x.weightG||250)-50);
        saveCart(); updateFab(); renderCart();
      };
    }

    var plus = elCartLines.querySelectorAll("[data-p]");
    for(i=0;i<plus.length;i++){
      plus[i].onclick = function(){
        var id = this.getAttribute("data-p");
        var x = CART[id]; if(!x) return;
        if(x.unitType==="piece") x.qty = (x.qty||1)+1;
        else x.weightG = (x.weightG||250)+50;
        saveCart(); updateFab(); renderCart();
      };
    }

    var ins = elCartLines.querySelectorAll("[data-i]");
    for(i=0;i<ins.length;i++){
      ins[i].onchange = function(){
        var id = this.getAttribute("data-i");
        var x = CART[id]; if(!x) return;
        var v = parseInt(this.value,10) || 0;
        if(x.unitType==="piece") x.qty = Math.max(1, v);
        else x.weightG = Math.max(50, v);
        saveCart(); updateFab(); renderCart();
      };
    }

    var del = elCartLines.querySelectorAll("[data-d]");
    for(i=0;i<del.length;i++){
      del[i].onclick = function(){
        var id = this.getAttribute("data-d");
        delete CART[id];
        saveCart(); updateFab(); renderCart();
      };
    }
  }

  function renderCartAdd(){
    var q = (elCartSearch.value||"").trim().toLowerCase();
    if(!q){ elCartAddList.innerHTML=""; return; }

    var found = [];
    for(var i=0;i<ITEMS.length;i++){
      if(ITEMS[i].name.toLowerCase().indexOf(q)!==-1){
        found.push(ITEMS[i]);
        if(found.length>=6) break;
      }
    }
    if(!found.length){
      elCartAddList.innerHTML = '<div class="err">لا يوجد أصناف مطابقة</div>';
      return;
    }

    var html = "";
    for(i=0;i<found.length;i++){
      html +=
        '<div class="cartLine">' +
          '<div class="lineTop">' +
            '<div><div class="lineName">'+esc(found[i].name)+'</div></div>' +
            '<button class="btn primary" data-add="'+esc(found[i].id)+'">إضافة</button>' +
          '</div>' +
        '</div>';
    }
    elCartAddList.innerHTML = html;

    var btns = elCartAddList.querySelectorAll("[data-add]");
    for(i=0;i<btns.length;i++){
      btns[i].onclick = function(){
        var id = this.getAttribute("data-add");
        for(var j=0;j<ITEMS.length;j++){
          if(String(ITEMS[j].id)===String(id)){ addToCart(ITEMS[j]); break; }
        }
      };
    }
  }

  function calcTotal(){
    var total = 0;
    var keys = Object.keys(CART);
    for(var i=0;i<keys.length;i++){
      var x = CART[keys[i]];
      total += (x.unitType==="piece") ? (x.price*(x.qty||0)) : (x.price*((x.weightG||0)/1000));
    }
    return round2(total);
  }

  function buildWhatsAppText(){
    var keys = Object.keys(CART);
    var name = trim(byId("customerName").value);
    var phone = trim(byId("customerPhone").value);
    var address = trim(byId("address").value);
    var notes = trim(byId("notes").value);

    var lines = [];
    for(var i=0;i<keys.length;i++){
      var x = CART[keys[i]];
      if(x.unitType==="piece"){
        var lt = round2(x.price*(x.qty||0));
        lines.push("▫️ " + x.name + " — " + (x.qty||0) + " قطعة — " + lt + " " + CONFIG.currency);
      }else{
        var lt2 = round2(x.price*((x.weightG||0)/1000));
        lines.push("▫️ " + x.name + " — " + (x.weightG||0) + " جم — " + lt2 + " " + CONFIG.currency);
      }
    }

    var total = calcTotal();
    var msg = [];
    msg.push("✨ *طلب جديد - " + CONFIG.shopName + "*");
    msg.push("— — — — — — — — — —");
    msg.push("👤 *الاسم:* " + name);
    if(phone) msg.push("📞 *الهاتف:* " + phone);
    if(address) msg.push("📍 *العنوان:* " + address);
    if(notes) msg.push("📝 *ملاحظات:* " + notes);
    msg.push("— — — — — — — — — —");
    msg.push("🛒 *تفاصيل الطلب:*");
    msg.push(lines.join("\\n"));
    msg.push("— — — — — — — — — —");
    msg.push("💰 *الإجمالي:* " + total + " " + CONFIG.currency);
    msg.push("✅ شكراً لتعاملكم مع " + CONFIG.shopName);
    return msg.join("\\n");
  }

  function sendWhatsApp(){
    if(!Object.keys(CART).length) return alert("السلة فارغة");
    var name = trim(byId("customerName").value);
    if(!name) return alert("اكتب اسم العميل");

    if(!CONFIG.whatsapp) return alert("رقم الواتساب غير موجود في SETTINGS");

    var text = buildWhatsAppText();
    window.open("https://wa.me/"+CONFIG.whatsapp+"?text="+encodeURIComponent(text), "_blank");
  }

  async function copyOrderText(){
    if(!Object.keys(CART).length) return alert("السلة فارغة");
    var name = trim(byId("customerName").value);
    if(!name) return alert("اكتب اسم العميل");

    var text = buildWhatsAppText();
    try{
      await navigator.clipboard.writeText(text);
      elHint.textContent = "✅ تم نسخ نص الطلب.";
    }catch(e){
      elHint.textContent = "⚠️ لم يتم النسخ تلقائيًا. استخدم زر الإرسال واتساب.";
    }
  }

  // helpers
  function byId(id){ return document.getElementById(id); }
  function trim(s){ return String(s||"").replace(/^\s+|\s+$/g,""); }
  function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
  function toNum(v){ var n = Number(v); return isNaN(n)?0:n; }
  function round2(n){ return Math.round((n+Number.EPSILON)*100)/100; }
  function fmt(n){ return round2(toNum(n)) + " " + CONFIG.currency; }
  function saveCart(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(CART)); }catch(e){} }
  function loadCart(){ try{ CART = JSON.parse(localStorage.getItem(LS_KEY)||"{}")||{}; }catch(e){ CART={}; } }

  function fetchText(url, cb){
    if(!url || url.indexOf("http")!==0) return cb("ضع رابط CSV صحيح");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function(){
      if(xhr.readyState!==4) return;
      if(xhr.status>=200 && xhr.status<300) return cb(null, xhr.responseText);
      cb("HTTP "+xhr.status+" - تأكد أنه Publish to web (CSV) والرابط صحيح");
    };
    xhr.send();
  }

  function parseCSV(csv){
    var lines = csv.split(/\r?\n/);
    if(!lines.length) return [];
    var headers = splitCSVLine(lines[0]).map(function(x){ return trim(x); });

    var rows = [];
    for(var i=1;i<lines.length;i++){
      if(!trim(lines[i])) continue;
      var cols = splitCSVLine(lines[i]);
      var obj = {};
      for(var c=0;c<headers.length;c++){
        obj[headers[c]] = (cols[c]!==undefined ? cols[c] : "");
      }
      rows.push(obj);
    }
    return rows;
  }

  function splitCSVLine(line){
    var out = [], cur = "", q = false;
    for(var i=0;i<line.length;i++){
      var ch = line.charAt(i);
      if(ch === '"'){
        if(q && line.charAt(i+1)==='"'){ cur+='"'; i++; }
        else q = !q;
      }else if(ch===',' && !q){
        out.push(cur); cur="";
      }else{
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  }
})();