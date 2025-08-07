# AI 语音助手

一个功能完整的AI语音助手，支持语音转文本、文本转语音、大模型调用和KPI数据展示。

## 功能特性

- 🎤 **语音输入**: 支持麦克风录音，实时语音转文本
- 🔊 **语音输出**: AI回答自动转换为语音播放
- 🤖 **AI对话**: 集成OpenAI GPT模型，智能对话
- 📊 **KPI展示**: 实时显示系统性能指标
- 🎨 **现代化UI**: 响应式设计，美观的用户界面
- ⚙️ **个性化设置**: 语音速度、音调等可调节
- 📱 **移动端适配**: 完美支持手机和平板设备

## 技术栈

### 后端
- **Node.js** - 服务器运行环境
- **Express** - Web框架
- **Socket.IO** - 实时通信
- **Axios** - HTTP客户端
- **Multer** - 文件上传处理

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript** - 交互逻辑
- **Web Speech API** - 语音识别和合成
- **Font Awesome** - 图标库

### AI服务
- **OpenAI GPT** - 大语言模型
- **OpenAI Whisper** - 语音转文本
- **OpenAI TTS** - 文本转语音
- **Defy API** - KPI数据接口

## 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd ai-voice-assistant
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 文件为 `.env` 并填写配置：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的API密钥：
```env
OPENAI_API_KEY=your-openai-api-key-here
DEFY_API_KEY=your-defy-api-key-here
DEFY_API_URL=https://api.defy.com/v1
PORT=3000
```

### 4. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 访问应用
打开浏览器访问 `http://localhost:3000`

## 使用说明

### 语音输入
1. 点击并按住麦克风按钮
2. 说出您的问题或指令
3. 松开按钮结束录音
4. 系统会自动识别语音并生成回答

### 文本输入
1. 在文本框中输入问题
2. 点击发送按钮或按Enter键
3. 系统会生成AI回答

### 语音设置
1. 点击右下角的设置按钮
2. 调整语音速度和音调
3. 开启/关闭自动朗读功能

### KPI数据
- 点击"刷新"按钮更新KPI数据
- 查看系统性能指标

## API接口

### 语音转文本
```
POST /api/speech-to-text
Content-Type: multipart/form-data
Body: audio file
```

### 文本转语音
```
POST /api/text-to-speech
Content-Type: application/json
Body: { "text": "要转换的文本" }
```

### AI对话
```
POST /api/llm
Content-Type: application/json
Body: { "prompt": "用户输入" }
```

### KPI数据
```
POST /api/kpi
Content-Type: application/json
Body: { "endpoint": "kpi-endpoint", "params": {} }
```

## Socket.IO 事件

### 客户端发送
- `audio-input`: 发送音频数据
- `text-input`: 发送文本输入
- `kpi-request`: 请求KPI数据

### 服务器发送
- `speech-result`: 语音识别结果
- `ai-response`: AI回答
- `speech-output`: 语音合成结果
- `kpi-response`: KPI数据响应
- `error`: 错误信息

## 项目结构

```
ai-voice-assistant/
├── public/                 # 静态文件
│   ├── index.html         # 主页面
│   ├── styles.css         # 样式文件
│   └── app.js            # 前端逻辑
├── server.js              # 服务器主文件
├── package.json           # 项目配置
├── .env.example          # 环境变量示例
└── README.md             # 项目说明
```

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- 现代浏览器（支持Web Speech API）

## 浏览器兼容性

- Chrome >= 66
- Firefox >= 60
- Safari >= 11.1
- Edge >= 79

## 故障排除

### 麦克风权限问题
确保浏览器允许访问麦克风，并在HTTPS环境下运行（本地开发除外）。

### API密钥错误
检查 `.env` 文件中的API密钥是否正确配置。

### 语音识别失败
- 检查网络连接
- 确保音频质量良好
- 验证OpenAI API配额

## 开发模式

```bash
# 启动开发服务器（自动重启）
npm run dev

# 构建生产版本
npm run build
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 创建 Pull Request

## 更新日志

### v1.0.0
- 初始版本发布
- 支持语音输入输出
- 集成AI对话功能
- 添加KPI数据展示
- 现代化UI设计