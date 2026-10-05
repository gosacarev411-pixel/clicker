let score = 0;
let maxEnergy = 1000;
let energy = 1000;
let profitPerClick = 0.1; // Начисление за 1 тап
let energyCost = 1;      // Трата энергии за 1 тап

const scoreEl = document.getElementById('score');
const coinEl = document.getElementById('coin');
const energyTextEl = document.getElementById('energy-text');
const energyProgressEl = document.getElementById('energy-progress');

// Обработка клика по хомяку
coinEl.addEventListener('click', (e) => {
    if (energy >= energyCost) {
        score += profitPerClick;
        energy -= energyCost;

        updateUI();
        
        // Создаем летящую цифру при клике
        createFloatingText(e.clientX, e.clientY, +${profitPerClick});
    }
});

// Автоматическое восстановление энергии (по 5 единиц каждую секунду)
setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + 5);
        updateUI();
    }
}, 1000);

function updateUI() {
    // Округляем счет до 1 знака после запятой, чтобы не было длинных хвостов
    scoreEl.textContent = score.toFixed(1);
    energyTextEl.textContent = ${energy} / ${maxEnergy};
    
    const energyPercent = (energy / maxEnergy) * 100;
    energyProgressEl.style.width = ${energyPercent}%;
}

// Эффект всплывающего плюсика при клике
function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = ${x}px;
    el.style.top = ${y}px;
    el.style.color = '#fff';
    el.style.fontSize = '24px';
    el.style.fontWeight = 'bold';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.6s ease-out';
    el.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(el);

    setTimeout(() => {
        el.style.top = ${y - 60}px;
        el.style.opacity = '0';
    }, 10);

    setTimeout(() => {
        el.remove();
    }, 600);
}
