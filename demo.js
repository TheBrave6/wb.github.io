const axios = require('axios');

// 演示配置
const config = {
    baseURL: 'http://localhost:3000',
    timeout: 10000
};

// 演示函数
async function demo() {
    console.log('🤖 AI 语音助手演示\n');
    
    try {
        // 1. 测试文本转语音
        console.log('1. 测试文本转语音...');
        const ttsResponse = await axios.post(`${config.baseURL}/api/text-to-speech`, {
            text: '你好，我是AI语音助手！'
        }, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'arraybuffer'
        });
        console.log('✅ 文本转语音成功，音频大小:', ttsResponse.data.length, '字节');
        
        // 2. 测试AI对话
        console.log('\n2. 测试AI对话...');
        const llmResponse = await axios.post(`${config.baseURL}/api/llm`, {
            prompt: '请介绍一下你自己'
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ AI回答:', llmResponse.data.response);
        
        // 3. 测试KPI接口
        console.log('\n3. 测试KPI接口...');
        const kpiResponse = await axios.post(`${config.baseURL}/api/kpi`, {
            endpoint: 'demo',
            params: { test: true }
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ KPI接口调用成功');
        
        console.log('\n🎉 所有API测试完成！');
        console.log('\n📝 使用说明:');
        console.log('- 访问 http://localhost:3000 查看Web界面');
        console.log('- 按住麦克风按钮进行语音输入');
        console.log('- 在文本框中输入问题');
        console.log('- 点击设置按钮调整语音参数');
        
    } catch (error) {
        console.error('❌ 演示失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

// 运行演示
if (require.main === module) {
    demo();
}

module.exports = { demo };