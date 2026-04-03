const API_BASE = 'http://localhost:5000/api';
const SOCKET_BASE = 'http://localhost:5000';

let socket = null;
let alertsCount = 0;

const elements = {
    apiKey: document.getElementById('apiKey'),
    connectBtn: document.getElementById('connectBtn'),
    loginError: document.getElementById('loginError'),
    dashboard: document.getElementById('dashboard'),
    status: document.getElementById('connectionStatus'),
    liveTemp: document.getElementById('liveTemp'),
    livePh: document.getElementById('livePh'),
    phStatus: document.getElementById('phStatus'),
    liveDo: document.getElementById('liveDo'),
    liveNitrate: document.getElementById('liveNitrate'),
    liveTime: document.getElementById('liveTime'),
    historyTable: document.getElementById('historyTable'),
    alertsList: document.getElementById('alertsList'),
    alertCount: document.getElementById('alertCount')
};

async function fetchHistory(apiKey) {
    try {
        const response = await fetch(`${API_BASE}/water-quality?limit=10`, {
            headers: { 'x-api-key': apiKey }
        });

        if (!response.ok) throw new Error('Failed to fetch history');

        const data = await response.json();
        elements.historyTable.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.station}</td>
                <td>${item.temperature}°C</td>
                <td>${item.ph}</td>
                <td>${item.dissolvedOxygen}</td>
                <td>${item.turbidity}</td>
                <td><span class="status-badge ${item.status}">${item.status}</span></td>
            `;
            elements.historyTable.appendChild(row);
        });
    } catch (error) {
        console.error('History fetch error:', error);
    }
}

function initSocket(apiKey) {
    if (socket) socket.disconnect();

    socket = io(SOCKET_BASE, {
        auth: { token: apiKey }
    });

    socket.on('connect', () => {
        elements.status.classList.add('connected');
        elements.status.querySelector('.text').innerText = 'Live-Sync Active';
        elements.dashboard.classList.remove('hidden');
        elements.loginError.innerText = '';
        elements.connectBtn.innerText = 'Sync Active';
        elements.connectBtn.disabled = true;
        
        fetchHistory(apiKey);
    });

    socket.on('connect_error', (err) => {
        elements.loginError.innerText = `Connection failed: ${err.message}`;
        elements.status.classList.remove('connected');
        elements.status.querySelector('.text').innerText = 'Auth Failed';
    });

    socket.on('water-quality-update', (data) => {
        animateValue(elements.liveTemp, data.temperature, '°C');
        animateValue(elements.livePh, data.ph);
        animateValue(elements.liveDo, data.dissolvedOxygen, 'mg/L');
        animateValue(elements.liveNitrate, data.nitrate, 'mg/L');
        
        elements.liveTime.innerText = `Updated at ${new Date(data.createdAt).toLocaleTimeString()}`;
        elements.phStatus.innerText = data.status;
        elements.phStatus.className = `status-badge ${data.status}`;
    });

    socket.on('alert-new', (alert) => {
        alertsCount++;
        elements.alertCount.innerText = alertsCount;
        
        const item = document.createElement('div');
        item.className = 'alert-item';
        item.innerHTML = `
            <span><strong>${alert.parameter}</strong>: ${alert.value}</span>
            <span class="status-badge ${alert.level}">${alert.level}</span>
        `;
        
        if (elements.alertsList.querySelector('.empty-msg')) {
            elements.alertsList.innerHTML = '';
        }
        
        elements.alertsList.prepend(item);
    });
}

function animateValue(element, value, unit = '') {
    const currentVal = parseFloat(element.innerText) || 0;
    const targetVal = parseFloat(value);
    
    // Simple direct update for now, could add gsap-like tweening
    element.innerHTML = `${targetVal}${unit ? `<span>${unit}</span>` : ''}`;
}

elements.connectBtn.addEventListener('click', () => {
    const key = elements.apiKey.value.trim();
    if (!key) {
        elements.loginError.innerText = 'Please enter your API Key';
        return;
    }
    elements.connectBtn.innerText = 'Connecting...';
    initSocket(key);
});
