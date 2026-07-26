(() => {
  "use strict";

  const data = window.MALL_DATA;
  const storesById = Object.fromEntries(data.stores.map((s) => [s.id, s]));
  const allItems = [];
  data.stores.forEach((store) => {
    store.items.forEach((item) => {
      allItems.push({ ...item, storeId: store.id, storeName: store.name });
    });
  });
  const itemsById = Object.fromEntries(allItems.map((i) => [i.id, i]));

  const state = {
    floor: 1,
    currentStoreId: null,
    inventory: [], // item ids (can have duplicates? no - unique try-ons; owned stay)
    owned: new Set(), // purchased item ids
    equipped: {
      top: null,
      bottom: null,
      shoes: null,
      bag: null,
      accessory: null,
    },
    bags: [], // { storeId, storeName, itemIds, at }
    purchasedStores: new Set(),
    prizeClaimed: false,
    toastTimer: null,
  };

  const els = {
    storeGrid: document.getElementById("storeGrid"),
    storeModal: document.getElementById("storeModal"),
    storeFloor: document.getElementById("storeFloor"),
    storeName: document.getElementById("storeName"),
    storeBlurb: document.getElementById("storeBlurb"),
    itemGrid: document.getElementById("itemGrid"),
    inventoryModal: document.getElementById("inventoryModal"),
    inventoryGrid: document.getElementById("inventoryGrid"),
    fittingModal: document.getElementById("fittingModal"),
    fittingInventory: document.getElementById("fittingInventory"),
    fittingAvatar: document.getElementById("fittingAvatar"),
    cashierModal: document.getElementById("cashierModal"),
    cashierStore: document.getElementById("cashierStore"),
    cashierLine: document.getElementById("cashierLine"),
    checkoutList: document.getElementById("checkoutList"),
    bagsModal: document.getElementById("bagsModal"),
    bagsList: document.getElementById("bagsList"),
    prizeModal: document.getElementById("prizeModal"),
    prizeAvatar: document.getElementById("prizeAvatar"),
    prizeBanner: document.getElementById("prizeBanner"),
    progressText: document.getElementById("progressText"),
    avatarStage: document.getElementById("avatarStage"),
    equippedList: document.getElementById("equippedList"),
  };

  function toast(message) {
    let node = document.getElementById("toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "toast";
      node.style.cssText =
        "position:fixed;left:50%;bottom:1.2rem;transform:translateX(-50%);z-index:40;background:#fff;border:1px solid rgba(255,143,183,.45);padding:.7rem 1rem;border-radius:999px;font-weight:800;box-shadow:0 10px 30px rgba(255,105,180,.25);max-width:90vw;text-align:center;";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      node.hidden = true;
    }, 1800);
  }

  function openModal(id) {
    document.getElementById(id).hidden = false;
  }

  function closeModal(id) {
    document.getElementById(id).hidden = true;
  }

  function renderAvatar(target, equipped = state.equipped) {
    const top = equipped.top ? itemsById[equipped.top] : null;
    const bottom = equipped.bottom ? itemsById[equipped.bottom] : null;
    const shoes = equipped.shoes ? itemsById[equipped.shoes] : null;
    const bag = equipped.bag ? itemsById[equipped.bag] : null;
    const acc = equipped.accessory ? itemsById[equipped.accessory] : null;

    const torso = top ? top.swatch : "#ff9ec8";
    const legs = bottom ? bottom.swatch : "#f7c1d8";
    const shoe = shoes ? shoes.swatch : "#ffffff";
    const bagColor = bag ? bag.swatch : "#d4a017";
    const accColor = acc ? acc.swatch : "#ffd700";
    const showCrown = acc && acc.id === "prize-crown";

    target.innerHTML = `
      <div class="roblox" aria-hidden="true">
        <div class="roblox__body">
          <div class="roblox__hair"></div>
          <div class="roblox__acc ${acc ? "is-on" : ""}" style="background:${accColor}; ${
            showCrown ? "" : "clip-path:none;border-radius:10px;height:12px;top:48px;width:22px;left:49px;"
          }"></div>
          <div class="roblox__head"><div class="roblox__face"><div class="roblox__smile"></div></div></div>
          <div class="roblox__arm roblox__arm--l"><div class="roblox__sleeve" style="background:${torso}"></div></div>
          <div class="roblox__arm roblox__arm--r"><div class="roblox__sleeve" style="background:${torso}"></div></div>
          <div class="roblox__torso" style="background:${torso}"></div>
          <div class="roblox__leg roblox__leg--l" style="background:${legs}"></div>
          <div class="roblox__leg roblox__leg--r" style="background:${legs}"></div>
          <div class="roblox__shoe roblox__shoe--l" style="background:${shoe}"></div>
          <div class="roblox__shoe roblox__shoe--r" style="background:${shoe}"></div>
          <div class="roblox__bag ${bag ? "is-on" : ""}" style="background:${bagColor}"></div>
        </div>
      </div>
    `;
  }

  function renderEquippedList() {
    const chips = Object.entries(state.equipped)
      .filter(([, id]) => id)
      .map(([, id]) => {
        const item = itemsById[id] || (id === data.prize.id ? data.prize : null);
        return item ? `<span class="chip">${item.name}</span>` : "";
      });
    els.equippedList.innerHTML = chips.length
      ? chips.join("")
      : `<span class="chip">Base Roblox look</span>`;
  }

  function updateProgress() {
    els.progressText.textContent = `${state.purchasedStores.size} / ${data.stores.length}`;
    if (state.purchasedStores.size >= data.stores.length) {
      els.prizeBanner.hidden = false;
      if (!state.prizeClaimed) {
        openModal("prizeModal");
        renderAvatar(els.prizeAvatar);
      }
    }
  }

  function renderStores() {
    const floorStores = data.stores.filter((s) => s.floor === state.floor);
    els.storeGrid.innerHTML = floorStores
      .map((store) => {
        const bought = state.purchasedStores.has(store.id);
        return `
          <button type="button" class="store-card ${bought ? "has-purchase" : ""}" data-store="${store.id}">
            ${store.fancy ? `<span class="store-card__badge">Fancy</span>` : ""}
            <h3 class="store-card__name">${store.name}</h3>
            <p class="store-card__meta">${store.items.length} pieces · Floor ${store.floor}</p>
          </button>
        `;
      })
      .join("");
  }

  function openStore(storeId) {
    const store = storesById[storeId];
    if (!store) return;
    state.currentStoreId = storeId;
    els.storeFloor.textContent = `Floor ${store.floor}`;
    els.storeName.textContent = store.name;
    els.storeBlurb.textContent = store.blurb;
    els.itemGrid.innerHTML = store.items
      .map((item) => {
        const owned = state.owned.has(item.id);
        const inInv = state.inventory.includes(item.id);
        return `
          <button type="button" class="item-card ${owned ? "is-owned" : ""}" data-item="${item.id}">
            <div class="swatch ${item.shape}" style="background:${item.swatch}"></div>
            <strong>${item.name}</strong>
            <span>${owned ? "Purchased" : inInv ? "In inventory" : `$${item.price.toLocaleString()}`}</span>
          </button>
        `;
      })
      .join("");
    openModal("storeModal");
  }

  function addToInventory(itemId) {
    if (state.owned.has(itemId)) {
      toast("You already bought that!");
      return;
    }
    if (state.inventory.includes(itemId)) {
      toast("Already in your inventory");
      return;
    }
    if (state.inventory.length >= data.inventorySlots) {
      toast("Inventory is full (wow!)");
      return;
    }
    state.inventory.push(itemId);
    const item = itemsById[itemId];
    toast(`Added ${item.name} to inventory`);
    if (!els.storeModal.hidden) openStore(state.currentStoreId);
  }

  function renderInventoryGrid(target, { tryOn = false } = {}) {
    const slots = [];
    for (let i = 0; i < data.inventorySlots; i += 1) {
      const itemId = state.inventory[i];
      if (!itemId) {
        slots.push(`<div class="inv-slot empty"></div>`);
        continue;
      }
      const item = itemsById[itemId] || (itemId === data.prize.id ? data.prize : null);
      if (!item) continue;
      const owned = state.owned.has(itemId);
      slots.push(`
        <button type="button" class="inv-slot ${owned ? "is-owned" : ""}" data-item="${itemId}" data-tryon="${tryOn}">
          <div class="swatch ${item.shape || "square"}" style="background:${item.swatch}"></div>
          <strong>${item.name}</strong>
          <span>${item.storeName || item.slot}${owned ? " · owned" : ""}</span>
        </button>
      `);
    }
    target.innerHTML = slots.join("");
  }

  function tryOn(itemId) {
    const item =
      itemsById[itemId] ||
      (itemId === data.prize.id
        ? { ...data.prize, storeName: "Prize" }
        : null);
    if (!item) return;
    state.equipped[item.slot] = itemId;
    // Ensure prize exists in itemsById for avatar rendering
    if (itemId === data.prize.id && !itemsById[itemId]) {
      itemsById[itemId] = { ...data.prize, storeName: "Prize" };
    }
    renderAvatar(els.avatarStage);
    renderAvatar(els.fittingAvatar);
    renderEquippedList();
    toast(`Tried on ${item.name}`);
  }

  function clearTryOn() {
    state.equipped = { top: null, bottom: null, shoes: null, bag: null, accessory: null };
    // Keep owned worn items? User asked to try from inventory - clearing try-on is fine
    // Re-equip purchased items that were bought (optional nicety)
    renderAvatar(els.avatarStage);
    renderAvatar(els.fittingAvatar);
    renderEquippedList();
    toast("Try-on cleared");
  }

  function openFittingRoom() {
    renderInventoryGrid(els.fittingInventory, { tryOn: true });
    renderAvatar(els.fittingAvatar);
    openModal("fittingModal");
  }

  function openCashier() {
    const store = storesById[state.currentStoreId];
    if (!store) {
      toast("Enter a store first");
      return;
    }
    const pending = state.inventory.filter(
      (id) => itemsById[id]?.storeId === store.id && !state.owned.has(id)
    );
    els.cashierStore.textContent = store.name;
    const extra =
      data.cashierLines[Math.floor(Math.random() * data.cashierLines.length)];
    els.cashierLine.textContent = `${store.cashier} ${extra}`;

    if (!pending.length) {
      els.checkoutList.innerHTML = `<p class="tip">You don’t have unpaid ${store.name} items in inventory yet. Grab something you like first!</p>`;
      document.getElementById("btnBuyAll").disabled = true;
    } else {
      document.getElementById("btnBuyAll").disabled = false;
      els.checkoutList.innerHTML = pending
        .map((id) => {
          const item = itemsById[id];
          return `
            <label class="checkout-row">
              <input type="checkbox" name="buy" value="${id}" checked />
              <div class="swatch ${item.shape}" style="background:${item.swatch};width:36px;aspect-ratio:1;margin:0;flex:0 0 36px;"></div>
              <div>
                <strong>${item.name}</strong>
                <span style="display:block;color:var(--mute);font-size:.78rem;">$${item.price.toLocaleString()} · infinite wallet covers it</span>
              </div>
            </label>
          `;
        })
        .join("");
    }
    openModal("cashierModal");
  }

  function buySelected() {
    const store = storesById[state.currentStoreId];
    const checked = [...els.checkoutList.querySelectorAll('input[name="buy"]:checked')].map(
      (el) => el.value
    );
    if (!checked.length) {
      toast("Select at least one item");
      return;
    }

    checked.forEach((id) => state.owned.add(id));
    state.purchasedStores.add(store.id);
    state.bags.push({
      storeId: store.id,
      storeName: store.name,
      itemIds: checked,
      at: Date.now(),
      color: store.color,
    });

    // Keep items in inventory (lots of space) but mark owned; also keep wearing
    closeModal("cashierModal");
    toast(`${store.name} cashier: “Here’s your pretty shopping bag!”`);
    renderStores();
    updateProgress();
    if (!els.storeModal.hidden) openStore(store.id);
  }

  function renderBags() {
    if (!state.bags.length) {
      els.bagsList.innerHTML = `<p class="tip">No bags yet — buy something from a cashier!</p>`;
      return;
    }
    els.bagsList.innerHTML = state.bags
      .slice()
      .reverse()
      .map((bag) => {
        const names = bag.itemIds.map((id) => itemsById[id]?.name || "Item").join(", ");
        return `
          <div class="bag-card">
            <div class="bag-icon" style="background:linear-gradient(180deg, ${bag.color}aa, ${bag.color})"></div>
            <div>
              <strong>${bag.storeName} Shopping Bag</strong>
              <span style="display:block;color:var(--mute);font-size:.82rem;">${names}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function claimPrize() {
    const prize = { ...data.prize, storeName: "Prize" };
    itemsById[prize.id] = prize;
    if (!state.inventory.includes(prize.id)) {
      state.inventory.unshift(prize.id);
    }
    state.owned.add(prize.id);
    state.equipped.accessory = prize.id;
    state.prizeClaimed = true;
    renderAvatar(els.avatarStage);
    renderAvatar(els.prizeAvatar);
    renderEquippedList();
    closeModal("prizeModal");
    toast("Mall Princess Crown added — you earned it!");
  }

  // Events
  document.querySelectorAll(".floor-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.floor = Number(btn.dataset.floor);
      document.querySelectorAll(".floor-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderStores();
    });
  });

  els.storeGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-store]");
    if (card) openStore(card.dataset.store);
  });

  els.itemGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-item]");
    if (card) addToInventory(card.dataset.item);
  });

  document.getElementById("btnInventory").addEventListener("click", () => {
    renderInventoryGrid(els.inventoryGrid, { tryOn: false });
    openModal("inventoryModal");
  });

  document.getElementById("btnFitting").addEventListener("click", openFittingRoom);
  document.getElementById("btnGoFitting").addEventListener("click", () => {
    closeModal("storeModal");
    openFittingRoom();
  });
  document.getElementById("btnGoCashier").addEventListener("click", openCashier);
  document.getElementById("btnClearOutfit").addEventListener("click", clearTryOn);
  document.getElementById("btnBuyAll").addEventListener("click", buySelected);
  document.getElementById("btnBags").addEventListener("click", () => {
    renderBags();
    openModal("bagsModal");
  });
  document.getElementById("btnClaimPrize").addEventListener("click", claimPrize);

  els.inventoryGrid.addEventListener("click", (e) => {
    const slot = e.target.closest("[data-item]");
    if (!slot) return;
    toast("Open the Fitting Room to try items on");
  });

  els.fittingInventory.addEventListener("click", (e) => {
    const slot = e.target.closest("[data-item]");
    if (slot) tryOn(slot.dataset.item);
  });

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.hidden = true;
    });
  });

  // Boot
  if (data.stores.length < 20) {
    console.warn("Expected at least 20 stores");
  }
  renderStores();
  renderAvatar(els.avatarStage);
  renderEquippedList();
  updateProgress();
})();
