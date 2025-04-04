document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => loadLevel(btn.dataset.level));
    });

    let currentLevel;
    let currentMusic;
    let timelines = [];
    let selectedTimelineIndex = 0;

    async function loadLevel(level) {
    console.log(`Loading level: ${level}`);
    currentLevel = level;
    const gameContainer = document.getElementById('game-container');
    const menu = document.getElementById('menu');

    if (currentMusic) {
        currentMusic.pause();
    }

    if (level === 'menu') {
        menu.style.display = 'flex';
        gameContainer.style.display = 'none';
    } else {
        menu.style.display = 'none';
        gameContainer.style.display = 'block';
        gameContainer.innerHTML = '';
        gameContainer.classList.remove('visage', 'corps', 'animaux', 'fruits', 'legumes');
        gameContainer.classList.add(level);

        const img = document.createElement('img');
        img.src = `levels/${level}/${level}.png`;
        img.style.height = '100%';
        img.style.width = 'auto';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        gameContainer.appendChild(img);

        try {
            const response = await fetch(`levels/${level}/clickable_areas.csv`);
            const text = await response.text();
            const rows = text.split('\n').slice(1);

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
                        addSoundToTimeline(sound);
                        div.classList.add('active');
                        setTimeout(() => div.classList.remove('active'), 500);
                    });
                }
            });
        } catch (error) {
            console.error('Failed to load CSV file:', error);
        }
        initializeTimelines(); // Call initializeTimelines here, AFTER gameContainer is displayed

    }
}

    function initializeTimelines() {
        const timelinesContainer = document.getElementById('timelines-container');
        if (!timelinesContainer) {
            console.error("Conteneur des timelines introuvable.");
            return;
        }

        timelinesContainer.innerHTML = '';
        timelines = [];

        for (let i = 0; i < 3; i++) {
            const timeline = document.createElement('div');
            timeline.classList.add('timeline');
            if (i === selectedTimelineIndex) {
                timeline.classList.add('selected');
            }
            timeline.addEventListener('click', () => selectTimeline(i));

            const progressBar = document.createElement('div');
            progressBar.classList.add('timeline-progress');
            timeline.appendChild(progressBar);

            timelinesContainer.appendChild(timeline);
            timelines.push({ element: timeline, sounds: [] });
        }

        startTimer();
    }

    function startTimer() {
        const interval = 10000; // 10 secondes
        setInterval(() => {
            playAllTimelines();
        }, interval);
    }

    function addSoundToTimeline(sound) {
        if (!timelines[selectedTimelineIndex]) {
            console.error("Timeline sélectionnée introuvable ou non initialisée.");
            return;
        }

        const audio = new Audio(`sounds/${sound}`);
        audio.addEventListener('loadedmetadata', () => {
            const duration = audio.duration * 1000; // Durée en millisecondes
            const widthPercentage = (duration / 10000) * 100; // Largeur en pourcentage

            const soundBar = document.createElement('div');
            soundBar.classList.add('sound-bar');
            soundBar.style.width = `${widthPercentage}%`;
            soundBar.style.left = `${timelines[selectedTimelineIndex].sounds.length * widthPercentage}%`;
            soundBar.dataset.sound = sound;
            soundBar.dataset.startTime = Date.now() % 10000;

            timelines[selectedTimelineIndex].element.appendChild(soundBar);
            timelines[selectedTimelineIndex].sounds.push({ element: soundBar, sound, startTime: soundBar.dataset.startTime });

            soundBar.addEventListener('click', () => {
                soundBar.remove();
                const index = timelines[selectedTimelineIndex].sounds.indexOf(soundBar);
                if (index > -1) {
                    timelines[selectedTimelineIndex].sounds.splice(index, 1);
                }
            });
        });

        audio.play();
    }

    function playAllTimelines() {
        timelines.forEach(timeline => {
            timeline.sounds.forEach(soundData => {
                const currentTime = Date.now() % 10000;
                if (currentTime >= soundData.startTime && currentTime < soundData.startTime + soundData.element.offsetWidth / 18.2) {
                    const audio = new Audio(`sounds/${soundData.sound}`);
                    audio.play();
                }
            });
        });
    }

    function selectTimeline(index) {
        if (index < 0 || index >= timelines.length) {
            console.error("Index de timeline invalide :", index);
            return;
        }

        selectedTimelineIndex = index;
        timelines.forEach((timeline, i) => {
            if (i === index) {
                timeline.element.classList.add('selected');
            } else {
                timeline.element.classList.remove('selected');
            }
        });
    }

    function backToMenu() {
        loadLevel('menu');
    }

    document.getElementById('back-to-menu').addEventListener('click', () => backToMenu());

    // Charger le niveau initial
    loadLevel('menu');
});

/*version JS 1.003 */

