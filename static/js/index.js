// Story text
const storyText = `Sinä pomputit superpalloasi niin kuin joka ikinen ilta:
yksi pompahdus — toinen — kolmas. Pallo oli kuminen, kirkkaan sininen ja kimmoisa.
Se oli sinun paras kaverisi. Sinä nimesit sen Sir Pommiksi ja keksit sille uusia temppuja:
spagaatinpomputus, seinäkieppi, ilmalukitus. Kevyt syysyö henkäili ikkunasta sisään ja
kaupungin valot jahtasivat toisiaan kaukana horisontissa. Yhtäkkiä Sir Pomm teki jotain mitä
sinä et ollut koskaan nähnyt. Kun sinä lähetit tavallisen pompun, pallo ei palannutkaan
kämmenelle vaan se otti yhden valtavan ponnahduksen ja välähti taivaalla.
Pallo kimmahti korkeammalle ja korkeammalle, kunnes se näytti vain pieneltä pisteeltä.
Sitten piste katosi kokonaan, ja outo, matala humina värisytti ilmaa.
Sinä seisot silmät ammollaan ja haukot henkeäsi. Sir Pomm oli kadonnut.
Aluksi sinä etsit huoneen joka kolkan, sohvan alta ja kaappien taustat.
Sitten sinä solmit kengäsi ja laitoit repun selkään. Pallo oli lähtenyt maailmalle,
ja sinä aioit löytää sen. Helsingin lentoaseman valoisa aulatila oli
ensimmäinen pysäkki. Sinä kuljit portilta portille, kyselit turvatarkastuksesta
ja kauppakeskuksen myyjiltä. Mutta kukaan ei ollut nähnyt superpalloa.
Sinä et lannistunut vaan päätit koluta lentokentän toisensa jälkeen
kunnes Sir Pomm löytyy.`;

// DOM Elements
const storySection = document.getElementById('story-section');
const startSection = document.getElementById('start-section');
const storyTextElement = document.getElementById('story-text');
const skipStoryBtn = document.getElementById('skip-story-btn');
const readStoryBtn = document.getElementById('read-story-btn');
const startGameBtn = document.getElementById('start-game-btn');
const usernameInput = document.getElementById('username-input');
const errorMessage = document.getElementById('error-message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set story text (but don't show it by default)
    storyTextElement.textContent = storyText;
    
    // Show start section by default (sign-in form)
    showStartSection();
    
    // Check if user wants to go back from story
    skipStoryBtn.addEventListener('click', () => {
        showStartSection();
    });
    
    // Read story button
    readStoryBtn.addEventListener('click', () => {
        showStorySection();
    });
    
    // Start game button
    startGameBtn.addEventListener('click', () => {
        startGame();
    });
    
    // Enter key on username input
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
});

function showStorySection() {
    storySection.style.display = 'block';
    startSection.style.display = 'none';
}

function showStartSection() {
    storySection.style.display = 'none';
    startSection.style.display = 'block';
    usernameInput.focus();
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

async function startGame() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        showError('Syötä käyttäjänimi ennen pelin aloittamista');
        return;
    }
    
    if (username.length > 50) {
        showError('Käyttäjänimi on liian pitkä (max 50 merkkiä)');
        return;
    }
    
    try {
        const response = await fetch('/api/new_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                reset: false
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store player_id in sessionStorage
            sessionStorage.setItem('player_id', data.player_id);
            sessionStorage.setItem('username', username);
            
            // Redirect to game page
            window.location.href = '/game';
        } else {
            showError(data.message || 'Virhe pelin aloittamisessa');
        }
    } catch (error) {
        console.error('Error starting game:', error);
        showError('Yhteysvirhe. Tarkista että palvelin on käynnissä.');
    }
}

