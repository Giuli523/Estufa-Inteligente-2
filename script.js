
const API_URL = "SUA_URL_DA_API_DE_BACKEND_AQUI"; // <<<<<< SUBSTITUA AQUI PELA URL DO SEU SERVIDOR

// Elementos de UI
const currentTempEl = document.getElementById('current-temp');
const targetTempEl = document.getElementById('target-temp');
const tempProgressEl = document.getElementById('temp-progress');
const airHumidityEl = document.getElementById('air-humidity');
const soilHumidityEl = document.getElementById('soil-humidity');
const humidityProgressEl = document.getElementById('humidity-progress');
const dryAlarmEl = document.getElementById('dry-alarm');
const historyTableBodyEl = document.getElementById('history-table-body'); // Elemento da tabela de histórico

// Estado do aplicativo (Temperatura alvo definida pelo usuário)
let state = {
    targetTemperature: 25,
};

// Simulação de Histórico para demonstração. 
// EM PRODUÇÃO, esses dados viriam da sua API de backend conectada ao MySQL.
let simulatedHistory = [
    { time: "10:00", temp: 22.5, air: 60, soil: 55 },
    { time: "10:05", temp: 22.8, air: 61, soil: 54 },
    { time: "10:10", temp: 23.0, air: 62, soil: 56 },
    { time: "10:15", temp: 23.2, air: 63, soil: 57 },
    { time: "10:20", temp: 23.5, air: 64, soil: 58 },
];


// --- FUNÇÕES DE LÓGICA E CONEXÃO ---

/**
 * FUNÇÃO DE BUSCA DE DADOS (SIMULADA): 
 * SUBSTITUA ESTE CÓDIGO pelo seu 'fetch' para a API real que se conecta ao MySQL.
 */
function fetchGreenhouseData() {
    // CÓDIGO DE SIMULAÇÃO (Para manter o app rodando sem o MySQL):
    const newReading = {
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        temp: (Math.random() * (28 - 18) + 18), 
        air: (Math.random() * (90 - 40) + 40),   
        soil: (Math.random() * (80 - 30) + 30),  
    };
    
    // Adiciona a nova leitura ao histórico (mantendo 5 entradas para simulação)
    simulatedHistory.push(newReading);
    if (simulatedHistory.length > 5) {
        simulatedHistory.shift();
    }

    const simulatedData = {
        currentTemp: newReading.temp.toFixed(1),
        airHumidity: newReading.air.toFixed(0),
        soilHumidity: newReading.soil.toFixed(0),
        history: simulatedHistory
    };

    return simulatedData; // Retorna os dados simulados
}

/**
 * Atualiza a interface (DOM) com os dados recebidos.
 */
function renderData(data) {
    if (!data) return;

    // 1. Temperatura
    currentTempEl.textContent = `${data.currentTemp}°C`;
    targetTempEl.textContent = state.targetTemperature;
    const currentTemp = parseFloat(data.currentTemp);
    
    // Lógica para a barra de progresso da Temperatura 
    const tempPercentage = ((currentTemp - 18) / 10) * 100; 
    tempProgressEl.style.width = `${Math.min(100, Math.max(0, tempPercentage))}%`;

    // 2. Umidade
    airHumidityEl.textContent = `${data.airHumidity}%`;
    soilHumidityEl.textContent = `${data.soilHumidity}%`;
    
    // Umidade Média para o progresso
    const avgHumidity = (parseInt(data.airHumidity) + parseInt(data.soilHumidity)) / 2;
    humidityProgressEl.style.width = `${avgHumidity}%`;
    
    // Alarme de Seca (Solo < 40%)
    const isDry = parseInt(data.soilHumidity) < 40;
    dryAlarmEl.textContent = isDry ? 'SIM' : 'NÃO';
    dryAlarmEl.classList.toggle('text-red-500', isDry);
    dryAlarmEl.classList.toggle('text-accent-green', !isDry);

    // 3. Histórico de Dados
    if (data.history) {
        historyTableBodyEl.innerHTML = ''; // Limpa o corpo da tabela

        // Pega as ÚLTIMAS 3 entradas e inverte para mostrar a mais recente no topo.
        const lastThree = data.history.slice(-3).reverse(); 

        lastThree.forEach(entry => {
            const row = historyTableBodyEl.insertRow();
            row.className = 'hover:bg-gray-700 transition-colors';

            // Hora
            row.insertCell().textContent = entry.time; 
            // Temperatura
            row.insertCell().textContent = entry.temp.toFixed(1);
            // Umidade Ar
            row.insertCell().textContent = entry.air.toFixed(0);
            // Umidade Solo
            row.insertCell().textContent = entry.soil.toFixed(0);
            
            // Adiciona classes Tailwind para espaçamento nas células
            Array.from(row.cells).forEach(cell => {
                cell.classList.add('px-2', 'py-2');
            });
        });
    }
}

/**
 * Loop principal que chama a busca de dados e renderiza a interface.
 */
function mainLoop() {
    const data = fetchGreenhouseData();
    renderData(data);
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // Listeners para controle de Temperatura Alvo
    document.getElementById('temp-up').addEventListener('click', () => {
        if (state.targetTemperature < 40) {
            state.targetTemperature++;
            mainLoop(); 
        }
    });

    document.getElementById('temp-down').addEventListener('click', () => {
        if (state.targetTemperature > 15) {
            state.targetTemperature--;
            mainLoop(); 
        }
    });

    // Inicia o loop de atualização a cada 3 segundos (simulando a leitura do sensor)
    setInterval(mainLoop, 3000); 

    // Roda a primeira vez para carregar os dados iniciais
    mainLoop();
});