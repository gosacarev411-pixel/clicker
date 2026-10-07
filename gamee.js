const LEVELS = [
    { name: "Бомж", req: 0 },
    { name: "Попрошайка", req: 100000 },
    { name: "Бродяга", req: 1500000 },
    { name: "Работяга", req: 15000000 },
    { name: "Бизнесмен", req: 100000000 },
    { name: "Миллионер", req: 1000000000 }
];

let player = {
    name: "",
    levelIndex: 0,
    score: 0,
    money: 0,
    donate: 0,
    energy: 500,
    maxEnergy: 500,
    hunger: 100,
    maxHunger: 100,
    tapPower: 1,
    mineSpeed: 0,
    betsMade: 0,
    isStarvingPenalty: false,
    isEnergyEmpty: false,
    unlimitedEnergy: false,
    tapMultiplier: 1,
    lastSaveTime: Date.now(),
    energyEmptyUntil: 0,
    starvePenaltyUntil: 0
};

function initStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        container.appendChild(star);
    }
}

window.onload = () => {
    initStars();
    loadGame();
    calculateOfflineProgress();

    if (!player.name) {
        document.getElementById('regModal').classList.add('active');
    } else {
        document.getElementById('regModal').classList.remove('active');
        updateUI();
    }
    
    checkTimersOnLoad();
};

function calculateOfflineProgress() {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - player.lastSaveTime) / 1000);

    if (elapsedSeconds <= 0) return;

    if (player.mineSpeed > 0) {
        player.money += player.mineSpeed * elapsedSeconds;
    }

    if (player.energyEmptyUntil > 0 && now >= player.energyEmptyUntil) {
        player.energy = player.maxEnergy;
        player.isEnergyEmpty = false;
        player.energyEmptyUntil = 0;
    }

    if (player.starvePenaltyUntil > 0 && now >= player.starvePenaltyUntil) {
        player.hunger = player.maxHunger;
        player.isStarvingPenalty = false;
        player.starvePenaltyUntil = 0;
    }
}

document.getElementById('startBtn').onclick = () => {
    const nameInput = document.getElementById('usernameInput').value.trim();
    if (nameInput.length < 2) {
        alert("Введите имя длиной от 2 символов!");
        return;
    }
    player.name = nameInput;
    document.getElementById('regModal').classList.remove('active');
    saveGame();
    updateUI();
};

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const tab = e.target.getAttribute('data-tab');
        closeAllSubScreens();
        
        if (tab === 'menu') document.getElementById('menuModal').classList.remove('hidden');
        if (tab === 'wallet') {
            updateWalletUI();
            document.getElementById('walletModal').classList.remove('hidden');
        }
        if (tab === 'top') {
            renderTopList();
            document.getElementById('topModal').classList.remove('hidden');
        }
    };
});

document.querySelectorAll('.close-sub').forEach(btn => {
    btn.onclick = (e) => {
        const modalId = e.target.getAttribute('data-close');
        document.getElementById(modalId).classList.add('hidden');
        document.querySelector('[data-tab="game"]').click();
    };
});

function closeAllSubScreens() {
    document.getElementById('menuModal').classList.add('hidden');
    document.getElementById('wheelModal').classList.add('hidden');
    document.getElementById('upgradesModal').classList.add('hidden');
    document.getElementById('slotsModal').classList.add('hidden');
    document.getElementById('walletModal').classList.add('hidden');
    document.getEl


ementById('topModal').classList.add('hidden');
}

document.getElementById('tapButton').onclick = () => {
    if (player.isStarvingPenalty || player.isEnergyEmpty) return;
    if (player.hunger <= 0) {
        document.getElementById('foodModal').classList.add('active');
        return;
    }

    if (!player.unlimitedEnergy) {
        if (player.energy <= 0) {
            triggerEnergyTimer();
            return;
        }
        player.energy -= 1;
    }

    player.hunger = Math.max(0, player.hunger - 0.05);

    let earned = player.tapPower * player.tapMultiplier;
    player.score += earned;
    player.money += earned;

    checkLevelUp();
    updateUI();
};

function checkLevelUp() {
    if (player.levelIndex < LEVELS.length - 1 && player.score >= LEVELS[player.levelIndex + 1].req) {
        player.levelIndex++;
        alert("Поздравляем! Вы повысили уровень до: " + LEVELS[player.levelIndex].name + "! Теперь вы можете сменить имя.");
    }
}

function triggerEnergyTimer() {
    player.isEnergyEmpty = true;
    player.energyEmptyUntil = Date.now() + (30 * 60 * 1000);
    saveGame();
    startEnergyInterval();
}

function startEnergyInterval() {
    const timerContainer = document.getElementById('timerContainer');
    const timerDisplay = document.getElementById('timerDisplay');
    document.getElementById('timerLabel').innerText = "Энергия закончилась! Восстановление:";
    timerContainer.classList.remove('hidden');

    let interval = setInterval(() => {
        let timeLeft = Math.floor((player.energyEmptyUntil - Date.now()) / 1000);

        if (timeLeft <= 0 || !player.isEnergyEmpty) {
            clearInterval(interval);
            player.energy = player.maxEnergy;
            player.isEnergyEmpty = false;
            player.energyEmptyUntil = 0;
            timerContainer.classList.add('hidden');
            saveGame();
            updateUI();
            return;
        }

        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        timerDisplay.innerText = mins + ":" + (secs < 10 ? '0' : '') + secs;
    }, 1000);
}

document.getElementById('eatYes').onclick = () => {
    document.getElementById('foodModal').classList.remove('active');
    player.money -= 50;
    player.hunger = player.maxHunger;
    updateUI();
};

document.getElementById('eatNo').onclick = () => {
    document.getElementById('foodModal').classList.remove('active');
    triggerStarvePenalty();
};

function triggerStarvePenalty() {
    player.isStarvingPenalty = true;
    player.starvePenaltyUntil = Date.now() + (60 * 60 * 1000);
    saveGame();
    startStarveInterval();
}

function startStarveInterval() {
    const timerContainer = document.getElementById('timerContainer');
    const timerDisplay = document.getElementById('timerDisplay');
    document.getElementById('timerLabel').innerText = "Отказ от еды! Штраф (нельзя тапать 1 час):";
    timerContainer.classList.remove('hidden');

    let interval = setInterval(() => {
        let timeLeft = Math.floor((player.starvePenaltyUntil - Date.now()) / 1000);

        if (timeLeft <= 0 || !player.isStarvingPenalty) {
            clearInterval(interval);
            player.hunger = player.maxHunger;
            player.isStarvingPenalty = false;
            player.starvePenaltyUntil = 0;
            timerContainer.classList.add('hidden');
            saveGame();
            updateUI();
            return;
        }

        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        timerDisplay.innerText = mins + ":" + (secs < 10 ? '0' : '') + secs;
    }, 1000);
}

function checkTimersOnLoad() {
    const now = Date.now();
    if (player.isEnergyEmpty && player.energyEmptyUntil > now) {
        startEnergyInterval();
    }
    if (player.isStarvingPenalty && player.starvePenaltyUntil > now) {
        startStarveInterval();
    }
}

function openWheel() { closeAllSubScreens(); document.getElementById('wheelModal').classList.remove('hidden'); }
function op


enUpgrades() { closeAllSubScreens(); document.getElementById('upgradesModal').classList.remove('hidden'); renderUpgrades(); }
function openSlots() { closeAllSubScreens(); document.getElementById('slotsModal').classList.remove('hidden'); }

document.getElementById('spinWheelBtn').onclick = () => {
    const rewards = [
        { text: "+1 монета", apply: () => player.money += 1 },
        { text: "x2 на тап на 5 минут", apply: () => { player.tapMultiplier = 2; setTimeout(() => player.tapMultiplier = 1, 300000); } },
        { text: "Бесконечная энергия и здоровье на 10 мин", apply: () => { player.unlimitedEnergy = true; setTimeout(() => player.unlimitedEnergy = false, 600000); } },
        { text: "За тап x3", apply: () => player.tapPower *= 3 },
        { text: "За тап x5", apply: () => player.tapPower *= 5 }
    ];
    let win = rewards[Math.floor(Math.random() * rewards.length)];
    win.apply();
    document.getElementById('wheelResult').innerText = "Вы выиграли: " + win.text + "!";
    updateUI();
};

function switchUpgradeTab(tab) {
    if (tab === 'tap') {
        document.getElementById('tapUpgradesList').classList.remove('hidden');
        document.getElementById('mineUpgradesList').classList.add('hidden');
    } else {
        document.getElementById('tapUpgradesList').classList.add('hidden');
        document.getElementById('mineUpgradesList').classList.remove('hidden');
    }
}

function renderUpgrades() {
    document.getElementById('tapUpgradesList').innerHTML = '<div class="upgrade-item"><p>Улучшить силу тапа (+1)</p><button class="btn" onclick="buyTapUpgrade()">Купить за 500 монет</button></div>';
    document.getElementById('mineUpgradesList').innerHTML = '<div class="upgrade-item"><p>Пассивный майнинг (Требует 💎)</p><button class="btn green" onclick="buyMineUpgrade()">Купить за 10 💎</button></div>';
}

function buyTapUpgrade() {
    if (player.money >= 500) {
        player.money -= 500;
        player.tapPower += 1;
        updateUI();
        alert("Успешно улучшено!");
    } else {
        alert("Не хватает монет!");
    }
}

function buyMineUpgrade() {
    if (player.donate >= 10) {
        player.donate -= 10;
        player.mineSpeed += 5;
        updateUI();
        alert("Майнинг запущен!");
    } else {
        alert("Не хватает донат-валюты (💎)!");
    }
}

document.getElementById('playSlotBtn').onclick = () => {
    if (player.money < 50) { alert("Нужно минимум 50 монет для ставки!"); return; }
    player.money -= 50;
    player.betsMade++;
    
    let icons = ['🍒', '🍋', '⭐', '💎'];
    let r1, r2;

    if (player.betsMade >= 10) {
        r1 = '⭐'; r2 = '⭐';
        player.betsMade = 0;
        player.money += 500;
        alert("ДЖЕКПОТ! На 10-й ставке выпал выигрыш!");
    } else {
        r1 = icons[Math.floor(Math.random() * icons.length)];
        r2 = icons[Math.floor(Math.random() * icons.length)];
    }

    document.getElementById('s1').innerText = r1;
    document.getElementById('s2').innerText = r2;
    document.getElementById('betsCount').innerText = player.betsMade;
    updateUI();
};

function updateWalletUI() {
    document.getElementById('walletMoney').innerText = Math.floor(player.money);
    document.getElementById('walletDonate').innerText = player.donate;
}
function donateModal() {
    player.donate += 50;
    alert("Успешно зачислено 50 💎 через Telegram Stars!");
    updateWalletUI();
}
function withdrawModal() {
    alert("Заявка на вывод средств создана! Средства поступят в течение 24 часов.");
}

function renderTopList() {
    const list = document.getElementById('topListContainer');
    list.innerHTML = '<div class="top-row">1. ' + player.name + ' (Вы) — ' + Math.floor(player.score) + ' очков</div>' +
                     '<div class="top-row">2. Князь с теплотрассы — 450,000 очков</div>' +
                     '<div class="top-row">3. Оскар у Пятерочки — 120,000 очков</div>';
}

function updateUI() {
    document.getElementById('scoreCount').innerText = Math.floor(p


layer.score);
    document.getElementById('moneyCount').innerText = Math.floor(player.money);
    document.getElementById('donateCount').innerText = player.donate;
    document.getElementById('energyText').innerText = Math.floor(player.energy);
    document.getElementById('hungerText').innerText = Math.floor(player.hunger);
    document.getElementById('tapPower').innerText = player.tapPower;
    document.getElementById('displayName').innerText = player.name;
    document.getElementById('displayLevel').innerText = "Уровень " + (player.levelIndex + 1) + ": " + LEVELS[player.levelIndex].name;

    document.getElementById('energyBar').style.width = (player.energy / player.maxEnergy * 100) + '%';
    document.getElementById('hungerBar').style.width = (player.hunger / player.maxHunger * 100) + '%';
}

setInterval(() => {
    if (player.mineSpeed > 0) {
        player.money += player.mineSpeed;
        updateUI();
    }
    saveGame();
}, 1000);

window.addEventListener('beforeunload', () => {
    saveGame();
});

function saveGame() {
    player.lastSaveTime = Date.now();
    localStorage.setItem('homeless_game_save', JSON.stringify(player));
}

function loadGame() {
    const saved = localStorage.getItem('homeless_game_save');
    if (saved) {
        player = Object.assign(player, JSON.parse(saved));
    }
}