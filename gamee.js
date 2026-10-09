// --- УРОВНИ ИГРЫ ---
const LEVELS = [
    { имя: "Бомж", цена: 0 },
    { имя: "Попрошайка", цена: 100000 },
    { имя: "Бродяга", цена: 1500000 },
    { имя: "Работяга", цена: 150000000 },
    { имя: "Бизнесмен", цена: 2000000000 },
    { имя: "Миллионер", цена: 10000000000 }
];

// --- СОСТОЯНИЕ ИГРОКА ---
let player = {
    имя: "",
    levelIndex: 0,
    деньги: 0,
    tapPower: 1,
    mineSpeed: 0,
    энергия: 500,
    максЭнергия: 500,
    голод: 100,
    максГолод: 100,
    tapMultiplier: 1,
    activeSkin: "Стандартная монета",
    inventory: ["Стандартная монета"],
    lastSaveTime: Date.now()
};

// --- МАГАЗИН УЛУЧШЕНИЙ ---
const upgradesList = [
    { id: 'tap1', name: 'Крепкий палец (+1 тап)', cost: 50, type: 'tap', value: 1 },
    { id: 'tap2', name: 'Тяжелый удар (+5 тап)', cost: 300, type: 'tap', value: 5 },
    { id: 'mine1', name: 'Коробка картонная (+1/сек)', cost: 100, type: 'mine', value: 1 },
    { id: 'mine2', name: 'Сбор бутылок (+10/сек)', cost: 1200, type: 'mine', value: 10 },
    { id: 'mine3', name: 'Точка сбора (+50/сек)', cost: 7000, type: 'mine', value: 50 },
    { id: 'mine4', name: 'Бизнес-точка (+300/сек)', cost: 40000, type: 'mine', value: 300 }
];

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
window.onload = () => {
    loadGame();
    const regModal = document.getElementById('registerModal');
    if (!player.имя || player.имя.trim() === "") {
        if (regModal) regModal.classList.remove('hidden');
    } else {
        initGame();
    }
};

// Регистрация бомжа
function registerPlayer() {
    const input = document.getElementById('registerNameInput');
    if (input && input.value.trim() !== "") {
        player.имя = input.value.trim();
        const regModal = document.getElementById('registerModal');
        if (regModal) regModal.classList.add('hidden');
        saveGame();
        initGame();
    } else {
        alert("Пожалуйста, введите имя!");
    }
}

function initGame() {
    updateUI();
    renderUpgrades();
}

// --- КЛИК ПО МОНЕТЕ ---
const clickerBtn = document.getElementById('clickerBtn');
if (clickerBtn) {
    clickerBtn.onclick = () => {
        if (player.энергия <= 0) {
            alert("Энергия закончилась! Отдохните.");
            return;
        }
        player.деньги += player.tapPower * player.tapMultiplier;
        player.энергия = Math.max(0, player.энергия - 1);
        checkLevelUp();
        updateUI();
    };
}

// --- ПРОВЕРКА ПОВЫШЕНИ УРОВНЯ ---
function checkLevelUp() {
    if (player.levelIndex < LEVELS.length - 1) {
        if (player.деньги >= LEVELS[player.levelIndex + 1].цена) {
            player.levelIndex++;
            alert(`Поздравляем! Вы повысили уровень до: ${LEVELS[player.levelIndex].имя}`);
        }
    }
}

// --- МАГАЗИН: ПОКУПКА ---
function buyUpgrade(id) {
    const item = upgradesList.find(u => u.id === id);
    if (!item) return;

    if (player.деньги >= item.cost) {
        player.деньги -= item.cost;
        if (item.type === 'tap') {
            player.tapPower += item.value;
        } else if (item.type === 'mine') {
            player.mineSpeed += item.value;
        }
        item.cost = Math.floor(item.cost * 1.5);
        updateUI();
        renderUpgrades();
        saveGame();
    } else {
        alert("Недостаточно денег!");
    }
}

function renderUpgrades() {
    const container = document.getElementById('upgradesContainer');
    if (!container) return;
    container.innerHTML = "";
    upgradesList.forEach(item => {
        container.innerHTML += `
            <div class="upgrade-item" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc;">
                <strong>${item.name}</strong>

                Цена: ${item.cost} монет

                <button onclick="buyUpgrade('${item.id}')">Купить</button>
            </div>
        `;
    });
}

// --- КАЗИНО (СЛОТЫ) ---
function spinSlots() {
    const betInput = document.getElementById('slotBet');
    const bet = betInput ? parseInt(betInput.value) ||


10 : 10;
    
    if (player.деньги < bet) {
        alert("Недостаточно денег для ставки!");
        return;
    }
    player.деньги -= bet;

    const symbols = ['🍒', '🍋', '🔔', '💎'];
    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];

    const resElem = document.getElementById('slotResult');
    if (resElem) resElem.innerText = `${r1} | ${r2} | ${r3}`;

    if (r1 === r2 && r2 === r3) {
        const win = bet * 10;
        player.деньги += win;
        alert(`Джекпот! Вы выиграли ${win} монет!`);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        const win = bet * 2;
        player.деньги += win;
        alert(`Выигрыш! Получено ${win} монет.`);
    } else {
        alert("Эх, повезет в следующий раз!");
    }
    updateUI();
    saveGame();
}

// --- КЕЙСЫ СО СКИНАМИ ---
const availableSkins = [
    "Золотая монета",
    "Неоновая монета",
    "Бриллиантовая монета",
    "Ржавая монетка"
];

function openCase() {
    const caseCost = 500;
    if (player.деньги < caseCost) {
        alert("Кейс стоит 500 монет!");
        return;
    }
    player.деньги -= caseCost;

    const wonSkin = availableSkins[Math.floor(Math.random() * availableSkins.length)];
    if (!player.inventory.includes(wonSkin)) {
        player.inventory.push(wonSkin);
        alert(`Поздравляем! Вам выпал новый скин: ${wonSkin}`);
    } else {
        player.деньги += 200;
        alert(`Выпал уже имеющийся скин (${wonSkin}). Возвращено 200 монет!`);
    }
    updateUI();
    saveGame();
}

// --- НАВИГАЦИЯ ПО ОКНАМ ---
function closeAllSubScreens() {
    const modals = ['upgradesModal', 'slotsModal', 'casesModal', 'wheelModal'];
    modals.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function openUpgrades() { closeAllSubScreens(); const m = document.getElementById('upgradesModal'); if (m) m.classList.remove('hidden'); }
function openSlots() { closeAllSubScreens(); const m = document.getElementById('slotsModal'); if (m) m.classList.remove('hidden'); }
function openCases() { closeAllSubScreens(); const m = document.getElementById('casesModal'); if (m) m.classList.remove('hidden'); }
function openWheel() { closeAllSubScreens(); const m = document.getElementById('wheelModal'); if (m) m.classList.remove('hidden'); }

// --- ПАССИВНЫЙ ДОХОД И ТАЙМЕРЫ ---
setInterval(() => {
    if (player.mineSpeed > 0) {
        player.деньги += player.mineSpeed;
        checkLevelUp();
        updateUI();
    }
    if (player.энергия < player.максЭнергия) {
        player.энергия = Math.min(player.максЭнергия, player.энергия + 2);
        updateUI();
    }
    saveGame();
}, 1000);

// --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
function updateUI() {
    setInnerText('displayName', player.имя);
    setInnerText('displayMoney', Math.floor(player.деньги));
    setInnerText('tapPower', player.tapPower);
    setInnerText('mineSpeed', player.mineSpeed);
    setInnerText('energyText', Math.floor(player.энергия));
    setInnerText('hungerText', Math.floor(player.голод));
    setInnerText('displayLevel', "Уровень " + (player.levelIndex + 1) + ": " + LEVELS[player.levelIndex].имя);
    setInnerText('activeSkinText', player.activeSkin);

    setStyleWidth('energyBar', (player.энергия / player.максЭнергия * 100) + '%');
    setStyleWidth('hungerBar', (player.голод / player.максГолод * 100) + '%');
}

function setInnerText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function setStyleWidth(id, val) {
    const el = document.getElementById(id);
    if (el) el.style.width = val;
}

// --- СОХРАНЕНИЕ И ЗАГРУЗКА ---
function saveGame() {
    player.lastSaveTime = Date.now();
    localStorage.setItem('homeless_game_save', JSON.stringify(player));
}

function loadGame() {
    const saved = localStorage.getItem('homeless_game_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            player = Object.assign(player, parsed);
        } catch(e) {
            console.error("Ошибка загрузки сохранения", e);
        }
    }
}

window.addEventListener('beforeunload', () => {
    saveGame();
});
