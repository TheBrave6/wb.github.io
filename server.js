const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 文件上传配置
const upload = multer({ dest: 'uploads/' });

// 配置
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
  defyApiKey: process.env.DEFY_API_KEY || 'your-defy-api-key',
  defyApiUrl: process.env.DEFY_API_URL || 'https://api.defy.com/v1',
  port: process.env.PORT || 3000
};

// 语音转文本 - 使用OpenAI Whisper API
async function speechToText(audioBuffer) {
  try {
    // 检查API密钥是否为默认值
    if (config.openaiApiKey === 'your-openai-api-key-here') {
      // 模拟语音识别结果
      const mockResults = [
        '你好，我想问一个问题',
        '今天天气怎么样？',
        '请介绍一下人工智能',
        '帮我设置一个提醒',
        '什么是机器学习？'
      ];
      return mockResults[Math.floor(Math.random() * mockResults.length)];
    }
    
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', 
      audioBuffer,
      {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'audio/wav'
        }
      }
    );
    return response.data.text;
  } catch (error) {
    console.error('Speech to text error:', error);
    throw new Error('语音转文本失败');
  }
}

// 文本转语音 - 使用OpenAI TTS API
async function textToSpeech(text) {
  try {
    // 检查API密钥是否为默认值
    if (config.openaiApiKey === 'your-openai-api-key-here') {
      // 返回模拟的音频数据（空音频）
      return Buffer.from([]);
    }
    
    const response = await axios.post('https://api.openai.com/v1/audio/speech', 
      {
        model: "tts-1",
        input: text,
        voice: "alloy"
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    return response.data;
  } catch (error) {
    console.error('Text to speech error:', error);
    throw new Error('文本转语音失败');
  }
}

// 调用大模型 - 使用OpenAI GPT API
async function callLLM(prompt) {
  try {
    // 检查API密钥是否为默认值
    if (config.openaiApiKey === 'your-openai-api-key-here') {
      // 模拟AI回答
      const mockResponses = {
        '你好': '你好！我是AI语音助手，很高兴为您服务。我可以回答您的问题，帮助您完成各种任务。',
        '天气': '抱歉，我无法获取实时天气信息。建议您查看天气预报应用或网站获取准确的天气信息。',
        '人工智能': '人工智能（AI）是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统。包括机器学习、深度学习、自然语言处理等技术。',
        '机器学习': '机器学习是人工智能的一个子领域，它使计算机能够在没有明确编程的情况下学习和改进。通过分析数据，机器可以识别模式并做出预测。',
        '提醒': '我可以帮您设置提醒。请告诉我具体的时间和内容，我会为您记录下来。',
        'default': '这是一个很有趣的问题！作为AI助手，我会尽力为您提供有用的信息。如果您有更具体的问题，请随时告诉我。'
      };
      
      // 根据关键词匹配回答
      for (const [key, response] of Object.entries(mockResponses)) {
        if (prompt.includes(key)) {
          return response;
        }
      }
      return mockResponses.default;
    }
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个智能助手，请用中文回答用户的问题。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('LLM call error:', error);
    throw new Error('大模型调用失败');
  }
}

// 调用Defy KPI接口
async function callDefyKPI(endpoint, data = {}) {
  try {
    // 检查API密钥是否为默认值
    if (config.defyApiKey === 'your-defy-api-key-here') {
      // 模拟KPI数据
      const mockKpiData = [
        { name: '用户活跃度', value: '85%', trend: '+5%' },
        { name: '响应时间', value: '1.2s', trend: '-0.3s' },
        { name: '准确率', value: '92%', trend: '+2%' },
        { name: '满意度', value: '4.8/5', trend: '+0.2' },
        { name: '系统稳定性', value: '99.9%', trend: '+0.1%' },
        { name: '并发用户数', value: '1,234', trend: '+12%' }
      ];
      return mockKpiData;
    }
    
    const response = await axios.post(`${config.defyApiUrl}/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${config.defyApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Defy KPI API error:', error);
    throw new Error('KPI接口调用失败');
  }
}

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  // 处理语音输入
  socket.on('audio-input', async (audioData) => {
    try {
      // 将音频数据转换为Buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      // 语音转文本
      const text = await speechToText(audioBuffer);
      socket.emit('speech-result', { text, success: true });
      
      // 调用大模型
      const aiResponse = await callLLM(text);
      socket.emit('ai-response', { text: aiResponse, success: true });
      
      // 文本转语音
      const speechAudio = await textToSpeech(aiResponse);
      socket.emit('speech-output', { 
        audio: speechAudio.toString('base64'),
        success: true 
      });
      
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // 处理文本输入
  socket.on('text-input', async (data) => {
    try {
      const aiResponse = await callLLM(data.text);
      socket.emit('ai-response', { text: aiResponse, success: true });
      
      if (data.speak) {
        const speechAudio = await textToSpeech(aiResponse);
        socket.emit('speech-output', { 
          audio: speechAudio.toString('base64'),
          success: true 
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // 处理KPI接口调用
  socket.on('kpi-request', async (data) => {
    try {
      const result = await callDefyKPI(data.endpoint, data.params);
      socket.emit('kpi-response', { data: result, success: true });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

// REST API 路由
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    const text = await speechToText(req.file.buffer);
    res.json({ text, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    const audio = await textToSpeech(text);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/llm', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await callLLM(prompt);
    res.json({ response, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/kpi', async (req, res) => {
  try {
    const { endpoint, params } = req.body;
    const result = await callDefyKPI(endpoint, params);
    res.json({ data: result, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 服务静态文件
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
server.listen(config.port, () => {
  console.log(`服务器运行在 http://localhost:${config.port}`);
  console.log('请确保已设置环境变量: OPENAI_API_KEY, DEFY_API_KEY, DEFY_API_URL');
});