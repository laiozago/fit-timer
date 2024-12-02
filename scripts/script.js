// Código do Service Worker (registrando antes da lógica do timer)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch((error) => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}

// Lógica do timer e outras funções aqui

// Variáveis de controle
let isRunning = false;
let currentTime = 0; // tempo total em segundos
let timerInterval;
let isWalking = true; // Indica se está na fase de caminhada (true) ou corrida (false)

// Referências dos elementos do HTML
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const resetButton = document.getElementById('reset-btn');

// Entradas para o tempo configurado pelo usuário
const totalTimeInput = document.getElementById('total-time');
const walkTimeInput = document.getElementById('walk-time');
const runTimeInput = document.getElementById('run-time');

// Barra de progresso e traços
const progressTrack = document.getElementById('progress-track');
const progressMarker = document.getElementById('progress-marker');

// Função para obter os tempos configurados pelo usuário
function getConfig() {
    const totalTime = parseInt(totalTimeInput.value) * 60; // em segundos
    const walkTime = parseInt(walkTimeInput.value) * 60;  // em segundos
    const runTime = parseInt(runTimeInput.value) * 60;    // em segundos
    return { totalTime, walkTime, runTime };
}

// Atualiza o display do timer
function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Atualiza a barra de progresso
function updateProgressBar() {
    const { totalTime, walkTime, runTime } = getConfig();
    const totalCycleTime = walkTime + runTime; // Ciclo completo de caminhada + corrida
    const progress = (currentTime % totalCycleTime) / totalCycleTime * 100; // Progresso dentro do ciclo atual
    const totalProgress = (currentTime / totalTime) * 100; // Progresso total no treino

    // Atualiza o marcador de progresso
    progressMarker.style.width = `${totalProgress}%`;
}

// Inicia ou retoma o timer
function startTimer() {
    if (isRunning) return; // Impede iniciar mais de uma vez
    isRunning = true;
    
    const { totalTime, walkTime, runTime } = getConfig(); // Pega a configuração atual

    // Desenha os intervalos de caminhada e corrida na barra
    drawIntervalMarkers(walkTime, runTime, totalTime);

    timerInterval = setInterval(function() {
        currentTime++;
        updateDisplay();
        updateProgressBar();

        if (currentTime >= totalTime) {
            clearInterval(timerInterval);
            alert("Treino Finalizado!");
            resetTimer();
        } else if ((isWalking && currentTime >= walkTime) || (!isWalking && currentTime >= runTime)) {
            // Alterna entre caminhada e corrida
            isWalking = !isWalking;
            currentTime = 0; // Reseta o tempo para o novo intervalo
        }
    }, 1000);

    startButton.disabled = true;
    pauseButton.disabled = false;
    resetButton.disabled = false;
}

// Desenha os traços de intervalo na barra
function drawIntervalMarkers(walkTime, runTime, totalTime) {
    const totalCycleTime = walkTime + runTime;
    const markers = Math.floor(totalTime / totalCycleTime); // Quantos ciclos no total de tempo
    const intervalMarkersContainer = document.createElement('div');
    intervalMarkersContainer.classList.add('interval-markers');

    for (let i = 1; i < markers; i++) {
        const marker = document.createElement('div');
        marker.classList.add('interval-marker');
        marker.style.left = `${(i * totalCycleTime) / totalTime * 100}%`;
        intervalMarkersContainer.appendChild(marker);
    }

    progressTrack.appendChild(intervalMarkersContainer);
}

// Pausa o timer
function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
}

// Reseta o timer
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    currentTime = 0;
    updateDisplay();
    progressMarker.style.width = '0%';
    startButton.disabled = false;
    pauseButton.disabled = true;
    resetButton.disabled = true;
}

// Event listeners para os botões
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

// Inicializa o display
updateDisplay();
