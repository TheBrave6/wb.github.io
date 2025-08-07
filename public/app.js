// 全局变量
let socket;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// DOM 元素
const elements = {
    voiceBtn: document.getElementById('voice-btn'),
    textInput: document.getElementById('text-input'),
    sendBtn: document.getElementById('send-btn'),
    speakBtn: document.getElementById('speak-btn'),
    conversationContainer: document.getElementById('conversation-container'),
    clearBtn: document.getElementById('clear-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    closeSettings: document.getElementById('close-settings'),
    loadingOverlay: document.getElementById('loading-overlay'),
    errorToast: document.getElementById('error-toast'),
    errorMessage: document.getElementById('error-message'),
    connectionStatus: document.getElementById('connection-status'),
    statusText: document.getElementById('status-text'),
    voiceIndicator: document.getElementById('voice-indicator'),
    voiceStatusText: document.getElementById('voice-status-text'),
    refreshKpiBtn: document.getElementById('refresh-kpi-btn'),
    kpiContainer: document.getElementById('kpi-container'),
    speechRate: document.getElementById('speech-rate'),
    speechPitch: document.getElementById('speech-pitch'),
    autoSpeak: document.getElementById('auto-speak'),
    rateValue: document.getElementById('rate-value'),
    pitchValue: document.getElementById('pitch-value')
};

// 初始化应用
function initApp() {
    connectSocket();
    setupEventListeners();
    loadKpiData();
    updateSettings();
}

// 连接Socket.IO
function connectSocket() {
    socket = io();
    
    socket.on('connect', () => {
        updateConnectionStatus(true);
        showToast('连接成功', 'success');
    });
    
    socket.on('disconnect', () => {
        updateConnectionStatus(false);
        showToast('连接断开', 'error');
    });
    
    socket.on('speech-result', handleSpeechResult);
    socket.on('ai-response', handleAIResponse);
    socket.on('speech-output', handleSpeechOutput);
    socket.on('kpi-response', handleKpiResponse);
    socket.on('error', handleError);
}

// 更新连接状态
function updateConnectionStatus(connected) {
    const statusDot = elements.connectionStatus;
    const statusText = elements.statusText;
    
    if (connected) {
        statusDot.classList.add('connected');
        statusText.textContent = '已连接';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = '连接中...';
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 语音按钮事件
    elements.voiceBtn.addEventListener('mousedown', startRecording);
    elements.voiceBtn.addEventListener('mouseup', stopRecording);
    elements.voiceBtn.addEventListener('mouseleave', stopRecording);
    elements.voiceBtn.addEventListener('touchstart', startRecording);
    elements.voiceBtn.addEventListener('touchend', stopRecording);
    
    // 文本输入事件
    elements.sendBtn.addEventListener('click', sendTextMessage);
    elements.textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendTextMessage();
        }
    });
    
    // 朗读按钮事件
    elements.speakBtn.addEventListener('click', toggleSpeech);
    
    // 清空对话按钮
    elements.clearBtn.addEventListener('click', clearConversation);
    
    // 设置面板事件
    elements.settingsBtn.addEventListener('click', toggleSettings);
    elements.closeSettings.addEventListener('click', toggleSettings);
    
    // 错误提示关闭
    document.querySelector('.close-toast').addEventListener('click', hideErrorToast);
    
    // KPI刷新按钮
    elements.refreshKpiBtn.addEventListener('click', loadKpiData);
    
    // 设置滑块事件
    elements.speechRate.addEventListener('input', updateSettings);
    elements.speechPitch.addEventListener('input', updateSettings);
    elements.autoSpeak.addEventListener('change', updateSettings);
}

// 开始录音
async function startRecording() {
    if (isRecording) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            
            socket.emit('audio-input', base64Audio);
            showLoading(true);
        };
        
        mediaRecorder.start();
        isRecording = true;
        updateVoiceStatus(true);
        
    } catch (error) {
        showToast('无法访问麦克风', 'error');
        console.error('录音错误:', error);
    }
}

// 停止录音
function stopRecording() {
    if (!isRecording || !mediaRecorder) return;
    
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    isRecording = false;
    updateVoiceStatus(false);
}

// 更新语音状态
function updateVoiceStatus(recording) {
    const voiceBtn = elements.voiceBtn;
    const voiceIndicator = elements.voiceIndicator;
    const voiceStatusText = elements.voiceStatusText;
    
    if (recording) {
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i><span>停止录音</span>';
        voiceIndicator.classList.add('active');
        voiceStatusText.textContent = '录音中...';
    } else {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i><span>按住说话</span>';
        voiceIndicator.classList.remove('active');
        voiceStatusText.textContent = '准备就绪';
    }
}

// 发送文本消息
function sendTextMessage() {
    const text = elements.textInput.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    elements.textInput.value = '';
    
    socket.emit('text-input', { 
        text: text, 
        speak: elements.autoSpeak.checked 
    });
    showLoading(true);
}

// 处理语音识别结果
function handleSpeechResult(data) {
    if (data.success) {
        addMessage(data.text, 'user');
    } else {
        showToast('语音识别失败', 'error');
    }
}

// 处理AI响应
function handleAIResponse(data) {
    showLoading(false);
    
    if (data.success) {
        addMessage(data.text, 'assistant');
    } else {
        showToast('AI响应失败', 'error');
    }
}

// 处理语音输出
function handleSpeechOutput(data) {
    if (data.success) {
        playAudio(data.audio);
    } else {
        showToast('语音合成失败', 'error');
    }
}

// 播放音频
function playAudio(base64Audio) {
    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
    audio.play().catch(error => {
        console.error('音频播放失败:', error);
        showToast('音频播放失败', 'error');
    });
}

// 切换语音朗读
function toggleSpeech() {
    const speakBtn = elements.speakBtn;
    
    if (speakBtn.classList.contains('active')) {
        stopSpeech();
    } else {
        const lastMessage = document.querySelector('.message.assistant:last-child');
        if (lastMessage) {
            const text = lastMessage.querySelector('.message-content').textContent;
            speakText(text);
        }
    }
}

// 朗读文本
function speakText(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = parseFloat(elements.speechRate.value);
    utterance.pitch = parseFloat(elements.speechPitch.value);
    
    utterance.onstart = () => {
        elements.speakBtn.classList.add('active');
    };
    
    utterance.onend = () => {
        elements.speakBtn.classList.remove('active');
    };
    
    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}

// 停止语音朗读
function stopSpeech() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    elements.speakBtn.classList.remove('active');
}

// 添加消息到对话
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <i class="${icon}"></i>
            <span>${type === 'user' ? '您' : 'AI助手'}</span>
            <span>${timestamp}</span>
        </div>
        <div class="message-content">${text}</div>
    `;
    
    elements.conversationContainer.appendChild(messageDiv);
    elements.conversationContainer.scrollTop = elements.conversationContainer.scrollHeight;
    
    // 移除欢迎消息
    const welcomeMessage = elements.conversationContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
}

// 清空对话
function clearConversation() {
    elements.conversationContainer.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-comments"></i>
            <p>欢迎使用AI语音助手！您可以：</p>
            <ul>
                <li>按住麦克风按钮进行语音输入</li>
                <li>在文本框中输入问题</li>
                <li>点击扬声器按钮听取回答</li>
            </ul>
        </div>
    `;
}

// 切换设置面板
function toggleSettings() {
    elements.settingsPanel.classList.toggle('open');
}

// 更新设置
function updateSettings() {
    const rate = elements.speechRate.value;
    const pitch = elements.speechPitch.value;
    
    elements.rateValue.textContent = rate;
    elements.pitchValue.textContent = pitch;
    
    // 保存设置到本地存储
    localStorage.setItem('speechRate', rate);
    localStorage.setItem('speechPitch', pitch);
    localStorage.setItem('autoSpeak', elements.autoSpeak.checked);
}

// 加载设置
function loadSettings() {
    const rate = localStorage.getItem('speechRate') || '1';
    const pitch = localStorage.getItem('speechPitch') || '1';
    const autoSpeak = localStorage.getItem('autoSpeak') !== 'false';
    
    elements.speechRate.value = rate;
    elements.speechPitch.value = pitch;
    elements.autoSpeak.checked = autoSpeak;
    
    elements.rateValue.textContent = rate;
    elements.pitchValue.textContent = pitch;
}

// 加载KPI数据
function loadKpiData() {
    elements.kpiContainer.innerHTML = `
        <div class="kpi-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>加载KPI数据...</span>
        </div>
    `;
    
    // 模拟KPI数据，实际应用中应该调用真实的API
    setTimeout(() => {
        const mockKpiData = [
            { name: '用户活跃度', value: '85%', trend: '+5%' },
            { name: '响应时间', value: '1.2s', trend: '-0.3s' },
            { name: '准确率', value: '92%', trend: '+2%' },
            { name: '满意度', value: '4.8/5', trend: '+0.2' }
        ];
        
        displayKpiData(mockKpiData);
    }, 1000);
}

// 显示KPI数据
function displayKpiData(data) {
    const kpiHtml = data.map(item => `
        <div class="kpi-card">
            <h4>${item.name}</h4>
            <div class="kpi-value">${item.value}</div>
            <div class="kpi-trend" style="color: ${item.trend.startsWith('+') ? '#38a169' : '#e53e3e'}">
                ${item.trend}
            </div>
        </div>
    `).join('');
    
    elements.kpiContainer.innerHTML = `
        <div class="kpi-data">
            ${kpiHtml}
        </div>
    `;
}

// 处理KPI响应
function handleKpiResponse(data) {
    if (data.success) {
        displayKpiData(data.data);
    } else {
        showToast('KPI数据加载失败', 'error');
    }
}

// 显示加载状态
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
    } else {
        elements.loadingOverlay.classList.remove('show');
    }
}

// 显示提示消息
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 显示错误提示
function showErrorToast(message) {
    elements.errorMessage.textContent = message;
    elements.errorToast.classList.add('show');
    
    setTimeout(() => {
        hideErrorToast();
    }, 5000);
}

// 隐藏错误提示
function hideErrorToast() {
    elements.errorToast.classList.remove('show');
}

// 处理错误
function handleError(data) {
    showLoading(false);
    showErrorToast(data.message);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initApp();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    if (socket) {
        socket.disconnect();
    }
});