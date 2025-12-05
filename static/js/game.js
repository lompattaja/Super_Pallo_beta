// Game state
let playerId = null;
let currentLocation = 'EFHK';
let map = null;
let markers = {};
let routeLine = null;
let airports = [];

// DOM Elements
const locationDisplay = document.getElementById('location-display');
const motivationDisplay = document.getElementById('motivation-display');
const distanceDisplay = document.getElementById('distance-display');
const treasureDisplay = document.getElementById('treasure-display');
const gameLog = document.getElementById('game-log');
const flyControls = document.getElementById('fly-controls');
const quizControls = document.getElementById('quiz-controls');
const icaoInput = document.getElementById('icao-input');
const flyBtn = document.getElementById('fly-btn');
const questionText = document.getElementById('question-text');
const answerOptions = document.getElementById('answer-options');
const textAnswerSection = document.getElementById('text-answer-section');
const textAnswerInput = document.getElementById('text-answer-input');
const submitTextAnswerBtn = document.getElementById('submit-text-answer-btn');
const quizResult = document.getElementById('quiz-result');
const availableAirportsDiv = document.getElementById('available-airports');
const gameEndModal = document.getElementById('game-end-modal');
const gameEndTitle = document.getElementById('game-end-title');
const gameEndMessage = document.getElementById('game-end-message');
const newGameBtn = document.getElementById('new-game-btn');
const menuBtn = document.getElementById('menu-btn');
const menuDropdown = document.getElementById('menu-dropdown');
const menuContainer = document.querySelector('.menu-container');
const menuHome = document.getElementById('menu-home');
const menuNewGame = document.getElementById('menu-new-game');
const menuAbout = document.getElementById('menu-about');
const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalButtons = document.getElementById('modal-buttons');

// Initialize game
document.addEventListener('DOMContentLoaded', async () => {
    playerId = sessionStorage.getItem('player_id');
    
    if (!playerId) {
        showAlert('Pelaajaa ei löytynyt', 'Siirrytään aloitusnäkymään.', () => {
            window.location.href = '/';
        });
        return;
    }
    
    // Initialize map
    initMap();
    
    // Load game state
    await loadGameState();
    
    // Load airports
    await loadAirports();
    
    // Set up event listeners
    flyBtn.addEventListener('click', handleFly);
    icaoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleFly();
        }
    });
    submitTextAnswerBtn.addEventListener('click', handleTextAnswer);
    newGameBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
    
    // Menu functionality
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuContainer.contains(e.target)) {
            menuDropdown.style.display = 'none';
        }
    });
    
    // Menu item handlers
    menuHome.addEventListener('click', (e) => {
        e.preventDefault();
        menuDropdown.style.display = 'none';
        window.location.href = '/';
    });
    
    menuNewGame.addEventListener('click', (e) => {
        e.preventDefault();
        menuDropdown.style.display = 'none';
        showConfirm(
            'Uusi peli',
            'Haluatko varmasti aloittaa uuden pelin? Nykyinen peli menetetään.',
            () => {
                sessionStorage.removeItem('player_id');
                sessionStorage.removeItem('username');
                window.location.href = '/';
            },
            () => {
                // Cancel - do nothing
            }
        );
    });
    
    menuAbout.addEventListener('click', (e) => {
        e.preventDefault();
        menuDropdown.style.display = 'none';
        showAlert(
            'Tietoa pelistä',
            'Sir Pommin Jäljillä - The Great Superball Chase\n\nEtsi superpallo lentämällä eri lentokentille ja vastaamalla kysymyksiin! Kerää motivaatiota ja löydä aarre.'
        );
    });
    
    addLogEntry('Peli aloitettu! Valitse mihin lentokenttään haluat lentää.', 'info');
});

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([60.3172, 24.9633], 3); // Center on Finland
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

// Load game state
async function loadGameState() {
    try {
        const response = await fetch(`/api/game_state?player_id=${playerId}`);
        const data = await response.json();
        
        if (data.success) {
            currentLocation = data.location;
            updateStats(data);
            updateMapLocation(data.location, data.visited_airports);
        }
    } catch (error) {
        console.error('Error loading game state:', error);
        addLogEntry('Virhe pelitilan lataamisessa', 'error');
    }
}

// Load airports
async function loadAirports() {
    try {
        const response = await fetch(`/api/airports?player_id=${playerId}`);
        const data = await response.json();
        
        if (data.success) {
            airports = data.airports;
            displayAvailableAirports(data.available);
            addAirportsToMap(data.airports);
        }
    } catch (error) {
        console.error('Error loading airports:', error);
        addLogEntry('Virhe lentokenttien lataamisessa', 'error');
    }
}

// Display available airports
function displayAvailableAirports(available) {
    if (available.length === 0) {
        availableAirportsDiv.innerHTML = '<p>Olet käynyt kaikilla kentillä!</p>';
        return;
    }
    
    let html = '<h4>Saatavilla olevat lentokentät:</h4><div class="airport-list">';
    available.forEach(airport => {
        html += `<div class="airport-item" onclick="selectAirport('${airport.icao}')">${airport.icao} - ${airport.name}</div>`;
    });
    html += '</div>';
    availableAirportsDiv.innerHTML = html;
}

// Select airport from list
function selectAirport(icao) {
    icaoInput.value = icao;
    icaoInput.focus();
}

// Add airports to map
function addAirportsToMap(airportsData) {
    airportsData.forEach(airport => {
        if (airport.latitude && airport.longitude) {
            const marker = L.marker([airport.latitude, airport.longitude]).addTo(map);
            
            marker.bindPopup(`<b>${airport.icao}</b><br>${airport.name}`);
            markers[airport.icao] = marker;
        }
    });
}

// Update map location
function updateMapLocation(location, visitedAirports) {
    // Update current location marker
    airports.forEach(airport => {
        if (airport.icao === location && airport.latitude && airport.longitude) {
            map.setView([airport.latitude, airport.longitude], 5);
            
            // Update marker color
            if (markers[location]) {
                map.removeLayer(markers[location]);
            }
            
            const marker = L.marker([airport.latitude, airport.longitude]).addTo(map);
            
            marker.bindPopup(`<b>${airport.icao}</b><br>${airport.name}<br><b>Nykyinen sijainti</b>`);
            markers[location] = marker;
        }
    });
    
    // Draw route line if we have visited airports
    if (visitedAirports.length > 1) {
        const routeCoordinates = [];
        visitedAirports.forEach(icao => {
            const airport = airports.find(a => a.icao === icao);
            if (airport && airport.latitude && airport.longitude) {
                routeCoordinates.push([airport.latitude, airport.longitude]);
            }
        });
        
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        
        if (routeCoordinates.length > 1) {
            routeLine = L.polyline(routeCoordinates, {
                color: '#e94560',
                weight: 3,
                opacity: 0.7
            }).addTo(map);
        }
    }
}

// Handle fly action
async function handleFly() {
    const icao = icaoInput.value.trim().toUpperCase();
    
    if (!icao) {
        addLogEntry('Syötä ICAO-koodi', 'error');
        return;
    }
    
    if (icao === currentLocation) {
        addLogEntry('Olet jo tällä kentällä!', 'error');
        return;
    }
    
    flyBtn.disabled = true;
    addLogEntry(`Lentää kentälle ${icao}...`, 'info');
    
    try {
        const response = await fetch('/api/fly', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player_id: playerId,
                icao: icao
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentLocation = data.location;
            addLogEntry(`Lensit ${data.distance} km! Kokonaismatka: ${data.total_distance} km.`, 'success');
            addLogEntry(`Sijainti päivitetty! Olet nyt kentällä ${data.location}.`, 'info');
            
            updateStats({
                location: data.location,
                total_distance: data.total_distance,
                motivation: data.motivation,
                has_treasure: data.has_treasure
            });
            
            // Check for treasure
            if (data.found_treasure) {
                addLogEntry('🎉🎉🎉 Löysit superpallon! Se on nyt repussasi. 🎉🎉🎉', 'success');
                addLogEntry('Palaa kentälle EFHK jos motivaatiosi taso on 10 tai enemmän.', 'info');
            } else {
                addLogEntry('Ei aarretta tällä kentällä, yritä uudestaan!', 'error');
            }
            
            // Check game end
            if (data.game_end && data.game_end.status !== 'playing') {
                showGameEnd(data.game_end);
                return;
            }
            
            // Check if there's a question
            if (data.has_question) {
                await loadQuestion(data.location);
            } else {
                addLogEntry('Tällä kentällä ei ole kysymystä. Voit lentää seuraavalle kentälle.', 'info');
            }
            
            // Reload airports to update available list
            await loadAirports();
            
            // Update map
            const gameState = await fetch(`/api/game_state?player_id=${playerId}`).then(r => r.json());
            if (gameState.success) {
                updateMapLocation(data.location, gameState.visited_airports);
            }
            
        } else {
            addLogEntry(data.message || 'Lentäminen epäonnistui', 'error');
        }
    } catch (error) {
        console.error('Error flying:', error);
        addLogEntry('Yhteysvirhe lentäessä', 'error');
    } finally {
        flyBtn.disabled = false;
        icaoInput.value = '';
    }
}

// Load question
async function loadQuestion(icao) {
    try {
        const response = await fetch(`/api/get_question/${icao}`);
        const data = await response.json();
        
        if (data.success) {
            questionText.textContent = data.question;
            quizResult.textContent = '';
            quizResult.className = 'quiz-result';
            
            if (data.type === 'text') {
                // Text input question
                answerOptions.style.display = 'none';
                textAnswerSection.style.display = 'block';
                textAnswerInput.value = '';
                textAnswerInput.focus();
            } else {
                // Multiple choice question
                textAnswerSection.style.display = 'none';
                answerOptions.style.display = 'grid';
                answerOptions.innerHTML = '';
                
                data.options.forEach((option, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'answer-btn';
                    btn.textContent = option;
                    btn.onclick = () => handleAnswer(option.split(')')[0].trim());
                    answerOptions.appendChild(btn);
                });
            }
            
            flyControls.style.display = 'none';
            quizControls.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading question:', error);
        addLogEntry('Virhe kysymyksen lataamisessa', 'error');
    }
}

// Handle answer (multiple choice)
function handleAnswer(answer) {
    submitAnswer(answer);
}

// Handle text answer
function handleTextAnswer() {
    const answer = textAnswerInput.value.trim();
    if (answer) {
        submitAnswer(answer);
    }
}

// Submit answer
async function submitAnswer(answer) {
    // Disable answer buttons
    const buttons = answerOptions.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    submitTextAnswerBtn.disabled = true;
    
    try {
        const response = await fetch('/api/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player_id: playerId,
                icao: currentLocation,
                answer: answer
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.correct) {
                quizResult.textContent = data.message;
                quizResult.className = 'quiz-result correct';
                addLogEntry(data.message, 'success');
            } else {
                quizResult.textContent = data.message;
                quizResult.className = 'quiz-result incorrect';
                addLogEntry(data.message, 'error');
            }
            
            // Update motivation
            updateStats({
                motivation: data.motivation
            });
            
            // Check game end
            if (data.game_end && data.game_end.status !== 'playing') {
                setTimeout(() => {
                    showGameEnd(data.game_end);
                }, 2000);
                return;
            }
            
            // Hide quiz after 2 seconds
            setTimeout(() => {
                quizControls.style.display = 'none';
                flyControls.style.display = 'block';
            }, 2000);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        addLogEntry('Virhe vastauksen lähettämisessä', 'error');
    } finally {
        buttons.forEach(btn => btn.disabled = false);
        submitTextAnswerBtn.disabled = false;
    }
}

// Update stats display
function updateStats(data) {
    if (data.location) {
        locationDisplay.textContent = data.location;
    }
    if (data.motivation !== undefined) {
        motivationDisplay.textContent = data.motivation;
    }
    if (data.total_distance !== undefined) {
        distanceDisplay.textContent = `${Math.round(data.total_distance)} km`;
    }
    if (data.has_treasure !== undefined) {
        treasureDisplay.textContent = data.has_treasure ? 'Löydetty!' : 'Ei löydetty';
        treasureDisplay.style.color = data.has_treasure ? '#4ade80' : '#ff6b6b';
    }
}

// Add log entry
function addLogEntry(message, type = 'info') {
    const entry = document.createElement('p');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    gameLog.appendChild(entry);
    gameLog.scrollTop = gameLog.scrollHeight;
}

// Toggle menu dropdown
function toggleMenu() {
    if (menuDropdown.style.display === 'none' || menuDropdown.style.display === '') {
        menuDropdown.style.display = 'block';
    } else {
        menuDropdown.style.display = 'none';
    }
}

// Custom modal functions
function showModal(title, message, buttons = []) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalButtons.innerHTML = '';
    
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.className = `modal-btn ${button.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}`;
        btn.onclick = () => {
            customModal.style.display = 'none';
            if (button.onClick) {
                button.onClick();
            }
        };
        modalButtons.appendChild(btn);
    });
    
    customModal.style.display = 'flex';
}

function showAlert(title, message, onOk) {
    showModal(title, message, [
        { text: 'OK', primary: true, onClick: onOk || (() => {}) }
    ]);
}

function showConfirm(title, message, onConfirm, onCancel) {
    showModal(title, message, [
        { text: 'Peruuta', primary: false, onClick: onCancel || (() => {}) },
        { text: 'Vahvista', primary: true, onClick: onConfirm || (() => {}) }
    ]);
}

// Show game end modal
function showGameEnd(gameEnd) {
    if (gameEnd.status === 'won') {
        gameEndTitle.textContent = '🎉 Voitit pelin! 🎉';
        gameEndTitle.style.color = '#4ade80';
    } else if (gameEnd.status === 'lost') {
        gameEndTitle.textContent = '😢 Peli päättyi 😢';
        gameEndTitle.style.color = '#ff6b6b';
    }
    
    gameEndMessage.textContent = gameEnd.message;
    gameEndModal.style.display = 'flex';
}

