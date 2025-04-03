async function loadLevel(level) {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = ''; // Clear previous level
    gameContainer.classList.remove('visage', 'corps', 'animaux', 'fruits', 'legumes'); // Remove any existing level class
    gameContainer.classList.add(level); // Add class for the current level

    if (level === 'visage') {
        const img = document.createElement('img');
        img.src = 'levels/1-visage/visage.png';
        img.style.height = '100%';
        img.style.width = 'auto';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        gameContainer.appendChild(img);

        // Lire le fichier CSV
        const response = await fetch('levels/1-visage/clickable_areas.csv');
        const text = await response.text();

        // Parser le CSV
        const rows = text.split('\n').slice(1); // Ignorer l'en-tête
        rows.forEach(row => {
            const [id, top, left, width, height, sound] = row.split(',');
            if (id) {
                const div = document.createElement('div');
                div.classList.add('clickable-area');
                div.style.top = `${top}%`;
                div.style.left = `${left}%`;
                div.style.width = `${width}%`;
                div.style.height = `${height}%`;
                div.dataset.sound = sound;
                gameContainer.appendChild(div);

                div.addEventListener('click', () => {
                    playSound(sound);
                    div.classList.add('active');
                    setTimeout(() => div.classList.remove('active'), 500);
                });
            }
        });
    }
}

function playSound(sound) {
    const audio = new Audio(`sounds/${sound}`);
    audio.play();
}
