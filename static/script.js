const socket = io();
let isConnected = false;

// Bağlantı yönetimi
socket.on('connect', () => {
    isConnected = true;
    document.getElementById('connection-status').textContent = 'Bağlı';
    document.getElementById('connection-status').style.color = 'green';
});

socket.on('disconnect', () => {
    isConnected = false;
    document.getElementById('connection-status').textContent = 'Bağlantı Kesildi';
    document.getElementById('connection-status').style.color = 'red';
});

// Komut gönderme
document.getElementById('send-btn').addEventListener('click', sendCommand);
document.getElementById('command-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendCommand();
});

function sendCommand() {
    const input = document.getElementById('command-input');
    const command = input.value.trim();
    
    if (command) {
        socket.emit('send_command', { command: command });
        addMessage('user', command);
        input.value = '';
    }
}

// Yanıt alma
socket.on('response', (data) => {
    addMessage('asena', data.response);
});

// Mesaj ekleme
function addMessage(sender, message) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Ses kontrolü
const volumeSlider = document.getElementById('volume-slider');
volumeSlider.addEventListener('change', () => {
    socket.emit('send_command', { 
        command: `ses seviyesini ${volumeSlider.value} yap` 
    });
});

// Parlaklık kontrolü
const brightnessSlider = document.getElementById('brightness-slider');
brightnessSlider.addEventListener('change', () => {
    socket.emit('send_command', { 
        command: `ekran parlaklığını ${brightnessSlider.value} yap` 
    });
});

// Işık kontrolü
const lightSlider = document.getElementById('light-slider');
const roomSelect = document.getElementById('room-select');

function toggleLight() {
    const room = roomSelect.value;
    socket.emit('send_command', { 
        command: `${room} ışıkları aç` 
    });
}

lightSlider.addEventListener('change', () => {
    const room = roomSelect.value;
    socket.emit('send_command', { 
        command: `${room} ışıklarını ${lightSlider.value} yap` 
    });
});

// Durum güncellemeleri
socket.on('status_update', (status) => {
    document.getElementById('current-time').textContent = status.date;
    volumeSlider.value = status.volume;
    brightnessSlider.value = status.brightness;
});


// script.js içinde, socket.on('response') kısmını güncelleyin:
socket.on('response', (data) => {
    console.log('Asena yanıtı:', data); // Debug için
    if (data.response) {
        addMessage('asena', data.response);
    } else {
        addMessage('asena', 'Yanıt alınamadı');
    }
});

// Ses tanıma
const micBtn = document.getElementById('mic-btn');
let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        document.getElementById('command-input').value = command;
        sendCommand();
    };
} else {
    micBtn.style.display = 'none';
}

micBtn.addEventListener('click', () => {
    if (recognition) {
        recognition.start();
        micBtn.style.backgroundColor = 'red';
        setTimeout(() => {
            recognition.stop();
            micBtn.style.backgroundColor = '';
        }, 5000);
    }
});