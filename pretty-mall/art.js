// Product photo map (real lifestyle/product photos) + Roblox-y helpers.
// Photos are generic stock looks matched by product type (not official brand packshots).
window.MALL_ART = (() => {
  const PHOTOS = {
    lipstick: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=240&h=240&q=80",
    blush: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=240&h=240&q=80",
    perfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=240&h=240&q=80",
    makeup: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=240&h=240&q=80",
    mascara: "https://images.unsplash.com/photo-1631214500431-8402f4d0c0b1?auto=format&fit=crop&w=240&h=240&q=80",
    skincare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=240&h=240&q=80",
    handbag: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=240&h=240&q=80",
    tote: "https://images.unsplash.com/photo-1590874103328-eac38a68348a?auto=format&fit=crop&w=240&h=240&q=80",
    heels: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=240&h=240&q=80",
    sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&h=240&q=80",
    loafers: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=240&h=240&q=80",
    sandals: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=240&h=240&q=80",
    dress: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=240&h=240&q=80",
    blazer: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=240&h=240&q=80",
    hoodie: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=240&h=240&q=80",
    jacket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=240&h=240&q=80",
    pants: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=240&h=240&q=80",
    skirt: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=240&h=240&q=80",
    watch: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=240&h=240&q=80",
    jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=240&h=240&q=80",
    necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=240&h=240&q=80",
    ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=240&h=240&q=80",
    sunglasses: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=240&h=240&q=80",
    scarf: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=240&h=240&q=80",
    cap: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=240&h=240&q=80",
    headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&h=240&q=80",
    phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=240&h=240&q=80",
    wallet: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=240&h=240&q=80",
    crown: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=240&h=240&q=80",
    robe: "https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?auto=format&fit=crop&w=240&h=240&q=80",
    default: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=240&h=240&q=80",
  };

  function photoKeyForItem(item) {
    const n = `${item.name} ${item.slot} ${item.material || ""}`.toLowerCase();
    if (n.includes("crown")) return "crown";
    if (n.includes("lipstick") || n.includes("lip stick") || n.includes("rouge pur") || n.includes("rouge coco")) return "lipstick";
    if (n.includes("blush") || n.includes("highlighter") || n.includes("palette") || n.includes("glow")) return "blush";
    if (n.includes("mascara")) return "mascara";
    if (n.includes("perfume") || n.includes("eau de") || n.includes("fragrance") || n.includes("mist") || n.includes("cheirosa") || n.includes("libre") || n.includes("bombshell") || n.includes("chance") || n.includes("miss dior")) return "perfume";
    if (n.includes("serum") || n.includes("mask") || n.includes("balm") || n.includes("skincare") || n.includes("niacinamide") || n.includes("laneige") || n.includes("summer fridays")) return "skincare";
    if (n.includes("airpods") || n.includes("beats") || n.includes("headphone")) return "headphones";
    if (n.includes("iphone") || n.includes("phone") || n.includes("airtag") || n.includes("ipad")) return "phone";
    if (n.includes("watch") || n.includes("datejust") || n.includes("daytona") || n.includes("oyster") || n.includes("parker")) return "watch";
    if (n.includes("sunglass") || n.includes("glasses")) return "sunglasses";
    if (n.includes("necklace") || n.includes("pendant") || n.includes("earring") || n.includes("bracelet") || n.includes("ring") || n.includes("brooch") || n.includes("jewelry") || n.includes("tiffany") || n.includes("love bracelet") || n.includes("juste") || n.includes("trinity") || n.includes("clic h") || n.includes("stud")) {
      if (n.includes("ring")) return "ring";
      if (n.includes("necklace") || n.includes("pendant")) return "necklace";
      return "jewelry";
    }
    if (n.includes("scarf") || n.includes("bandeau") || n.includes("twilly") || n.includes("carré") || n.includes("carre")) return "scarf";
    if (n.includes("cap") || n.includes("hat")) return "cap";
    if (n.includes("wallet") || n.includes("card case") || n.includes("card holder") || n.includes("pochette") || n.includes("wristlet") || n.includes("pouchette")) return "wallet";
    if (n.includes("sneaker") || n.includes("dunk") || n.includes("samba") || n.includes("gazelle") || n.includes("air force") || n.includes("trainer") || n.includes("triple s") || n.includes("cloudbust")) return "sneakers";
    if (n.includes("heel") || n.includes("pump") || n.includes("slingback") || n.includes("opyum") || n.includes("stiletto")) return "heels";
    if (n.includes("sandal") || n.includes("oran") || n.includes("slipper") || n.includes("slide") || n.includes("mule")) return "sandals";
    if (n.includes("loafer") || n.includes("boot")) return "loafers";
    if (n.includes("tote") || n.includes("neverfull") || n.includes("shopper") || n.includes("belt bag")) return "tote";
    if (item.slot === "bag" || n.includes("bag") || n.includes("birkin") || n.includes("speedy") || n.includes("jackie") || n.includes("tabby") || n.includes("baguette") || n.includes("hourglass") || n.includes("saddle") || n.includes("flap")) return "handbag";
    if (n.includes("dress") || n.includes("robe")) return n.includes("robe") ? "robe" : "dress";
    if (n.includes("blazer") || n.includes("smoking")) return "blazer";
    if (n.includes("hoodie") || n.includes("scuba") || n.includes("sweat")) return "hoodie";
    if (n.includes("jacket") || n.includes("bomber") || n.includes("coat") || n.includes("cardigan") || n.includes("track")) return "jacket";
    if (n.includes("skirt")) return "skirt";
    if (n.includes("pant") || n.includes("trouser") || n.includes("legging") || n.includes("short") || item.slot === "bottom") return "pants";
    if (item.slot === "top") return "blazer";
    if (item.slot === "shoes") return "sneakers";
    if (item.slot === "accessory") return "makeup";
    return "default";
  }

  function photoUrlForItem(item) {
    return PHOTOS[photoKeyForItem(item)] || PHOTOS.default;
  }

  const imageCache = new Map();

  function loadImage(url) {
    if (imageCache.has(url)) return imageCache.get(url);
    const entry = { img: new Image(), ready: false };
    entry.img.crossOrigin = "anonymous";
    entry.img.onload = () => {
      entry.ready = true;
    };
    entry.img.onerror = () => {
      entry.ready = false;
    };
    entry.img.src = url;
    imageCache.set(url, entry);
    return entry;
  }

  function preloadAll(items) {
    items.forEach((item) => loadImage(photoUrlForItem(item)));
  }

  function drawProductPhoto(ctx, item, x, y, w, h, fallbackColor) {
    const url = photoUrlForItem(item);
    const entry = loadImage(url);
    ctx.save();
    // photo frame like a real tag
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, w, h);
    if (entry.ready) {
      const img = entry.img;
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, w - 4, h - 4);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    } else {
      // realistic fallback illustration while loading
      drawFallbackProduct(ctx, item, x + 4, y + 4, w - 8, h - 8, fallbackColor || item.swatch);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.restore();
    return entry.ready;
  }

  function drawFallbackProduct(ctx, item, x, y, w, h, color) {
    const key = photoKeyForItem(item);
    ctx.fillStyle = "#f6f1f4";
    ctx.fillRect(x, y, w, h);
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    const s = Math.min(w, h);
    if (key === "lipstick") {
      ctx.fillStyle = "#f0e6ea";
      ctx.fillRect(-s * 0.12, -s * 0.05, s * 0.24, s * 0.38);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.05);
      ctx.lineTo(s * 0.1, -s * 0.05);
      ctx.lineTo(s * 0.06, -s * 0.32);
      ctx.lineTo(-s * 0.02, -s * 0.32);
      ctx.fill();
    } else if (key === "sneakers" || key === "heels" || key === "sandals" || key === "loafers") {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, s * 0.08, s * 0.34, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-s * 0.3, -s * 0.05, s * 0.42, s * 0.14);
      ctx.fillStyle = "#222";
      ctx.fillRect(-s * 0.32, s * 0.14, s * 0.64, s * 0.05);
    } else if (key === "handbag" || key === "tote") {
      ctx.fillStyle = color;
      ctx.fillRect(-s * 0.28, -s * 0.05, s * 0.56, s * 0.38);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -s * 0.05, s * 0.18, Math.PI, 0);
      ctx.stroke();
    } else if (key === "watch") {
      ctx.fillStyle = "#ddd";
      ctx.fillRect(-s * 0.08, -s * 0.35, s * 0.16, s * 0.7);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(-s * 0.25, -s * 0.3, s * 0.5, s * 0.55);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(-s * 0.2, -s * 0.25, s * 0.12, s * 0.45);
    }
    ctx.restore();
  }

  // Brookhaven / Berry Ave style building pieces
  function drawBlockyTree(ctx, x, y) {
    ctx.fillStyle = "#6dbe6b";
    ctx.fillRect(x - 14, y - 36, 28, 28);
    ctx.fillRect(x - 18, y - 28, 36, 16);
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(x - 4, y - 8, 8, 18);
  }

  function drawStreetLamp(ctx, x, y) {
    ctx.fillStyle = "#9aa0a6";
    ctx.fillRect(x - 3, y - 50, 6, 50);
    ctx.fillStyle = "#ffe9a8";
    ctx.beginPath();
    ctx.arc(x, y - 54, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 230, 150, 0.25)";
    ctx.beginPath();
    ctx.arc(x, y - 54, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBench(ctx, x, y) {
    ctx.fillStyle = "#c9895c";
    ctx.fillRect(x, y - 12, 40, 8);
    ctx.fillRect(x, y - 4, 40, 6);
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(x + 4, y + 2, 5, 8);
    ctx.fillRect(x + 31, y + 2, 5, 8);
  }

  function drawBrookhavenStore(ctx, r, store, bagged) {
    const depth = 22;
    const roofH = 20;
    // side depth face
    ctx.fillStyle = shade(store.color || "#ff8fb7", -0.25);
    ctx.beginPath();
    ctx.moveTo(r.x + r.w, r.y + roofH);
    ctx.lineTo(r.x + r.w + depth, r.y + roofH - 8);
    ctx.lineTo(r.x + r.w + depth, r.y + r.h - 8);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    ctx.closePath();
    ctx.fill();

    // roof slab
    ctx.fillStyle = store.fancy ? "#ff8fb7" : "#b8e0ff";
    ctx.beginPath();
    ctx.moveTo(r.x - 6, r.y + roofH);
    ctx.lineTo(r.x + r.w + 6, r.y + roofH);
    ctx.lineTo(r.x + r.w + depth + 4, r.y + roofH - 10);
    ctx.lineTo(r.x + depth - 2, r.y + roofH - 10);
    ctx.closePath();
    ctx.fill();

    // front wall
    ctx.fillStyle = "#fff7fb";
    ctx.fillRect(r.x, r.y + roofH, r.w, r.h - roofH);

    // pastel stripe
    ctx.fillStyle = store.color || "#ff4f9a";
    ctx.fillRect(r.x, r.y + roofH, r.w, 10);

    // windows (Roblox panes)
    ctx.fillStyle = "#9fd9ff";
    ctx.fillRect(r.x + 12, r.y + roofH + 22, 28, 28);
    ctx.fillRect(r.x + r.w - 40, r.y + roofH + 22, 28, 28);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x + 12, r.y + roofH + 22, 28, 28);
    ctx.strokeRect(r.x + r.w - 40, r.y + roofH + 22, 28, 28);
    ctx.beginPath();
    ctx.moveTo(r.x + 26, r.y + roofH + 22);
    ctx.lineTo(r.x + 26, r.y + roofH + 50);
    ctx.moveTo(r.x + 12, r.y + roofH + 36);
    ctx.lineTo(r.x + 40, r.y + roofH + 36);
    ctx.stroke();

    // glass door
    ctx.fillStyle = "#7ec8ff";
    ctx.fillRect(r.door.x, r.door.y - 28, r.door.w, 36);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(r.door.x + 3, r.door.y - 25, r.door.w / 2 - 5, 30);
    ctx.fillStyle = "#ffe08a";
    ctx.fillRect(r.door.x + r.door.w - 8, r.door.y - 12, 3, 8);

    // sign
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(r.x + 18, r.y + roofH + 4, r.w - 36, 16);
    ctx.fillStyle = "#fff";
    ctx.font = "800 11px Nunito, sans-serif";
    ctx.fillText(store.name.slice(0, 12), r.x + 24, r.y + roofH + 16);

    if (store.fancy) {
      ctx.fillStyle = "#ffd76a";
      ctx.fillRect(r.x + r.w - 46, r.y + roofH + 56, 34, 12);
      ctx.fillStyle = "#5a3b00";
      ctx.font = "800 8px Nunito, sans-serif";
      ctx.fillText("FANCY", r.x + r.w - 42, r.y + roofH + 65);
    }

    if (bagged) {
      ctx.fillStyle = "#ff4f9a";
      ctx.font = "800 10px Nunito, sans-serif";
      ctx.fillText("BAGGED", r.x + 50, r.y + r.h - 18);
    }

    // ENTER mat
    ctx.fillStyle = "#ff4f9a";
    ctx.fillRect(r.door.x - 4, r.door.y + 6, r.door.w + 8, 12);
    ctx.fillStyle = "#fff";
    ctx.font = "800 8px Nunito, sans-serif";
    ctx.fillText("ENTER", r.door.x + 2, r.door.y + 15);
  }

  function shade(hex, amt) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const num = parseInt(full.slice(0, 6), 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.max(0, Math.min(255, Math.round(r + 255 * amt)));
    g = Math.max(0, Math.min(255, Math.round(g + 255 * amt)));
    b = Math.max(0, Math.min(255, Math.round(b + 255 * amt)));
    return `rgb(${r},${g},${b})`;
  }

  return {
    photoUrlForItem,
    photoKeyForItem,
    loadImage,
    preloadAll,
    drawProductPhoto,
    drawBrookhavenStore,
    drawBlockyTree,
    drawStreetLamp,
    drawBench,
  };
})();
