import AV from 'leancloud-storage';

// 初始化 LeanCloud
AV.init({
    appId: 'a4O2WP8ZKjkOH8RbLNXgLTAE-gzGzoHsz',
    appKey: 'At7BrmqGKGPqcbHXwtEL6Y3e',
    serverURLs: 'http://a4o2wp8z.lc-cn-n1-shared.com',
});

const apiKey = '68RUC9FIB396';
const timeZoneDBUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=Asia/Shanghai`;
const nowApiUrl = 'https://sapi.k780.com/?app=life.time&appkey=75226&sign=fa340a9c0e85bd3567e6884d468e2f93&format=json';

const secondsInput = document.getElementById('secondsInput');
const startButton = document.getElementById('startButton');
const removeButton = document.getElementById('removeButton');
const countdownDisplay = document.getElementById('countdown');
const alertSound = document.getElementById('alertSound');
const settingsButton = document.getElementById('settingsButton');
const settingsPanel = document.getElementById('settingsPanel');
const switchAPIButton = document.getElementById('switchAPIButton');
const closeSettingsButton = document.getElementById('closeSettingsButton');
const currentTimeSource = document.getElementById('currentTimeSource');

let countdownInterval;
let initialTimeOffset; // 用于存储首次获取北京时间的时间戳
let usingTimeZoneDB = true; // 默认使用 TimeZoneDB

// 清空 LeanCloud 数据
async function clearLeanCloudData() {
    const query = new AV.Query('TimeData');
    const results = await query.find();
    for (const item of results) {
        await item.destroy();
    }
}

// 获取存储在 LeanCloud 上的时间
async function getStoredTime() {
    const query = new AV.Query('TimeData');
    const results = await query.find();
    if (results.length > 0) {
        const timeData = results[0];
        return new Date(timeData.get('time'));
    }
    return null;
}

// 获取当前时间戳（根据选中的 API）
async function fetchInitialTime() {
    try {
        let url = usingTimeZoneDB ? timeZoneDBUrl : nowApiUrl;
        const response = await fetch(url);
        const data = await response.json();

        if (usingTimeZoneDB) {
            if (data && data.status === 'OK' && data.timestamp) {
                const adjustedTimestamp = data.timestamp - 480 * 60; // 加上 480 分钟（8 小时），转换为北京时间（秒级时间戳）
                initialTimeOffset = adjustedTimestamp * 1000 - Date.now(); // 记录偏移值（毫秒）
                return adjustedTimestamp * 1000; // 返回北京时间（毫秒）
            } else {
                throw new Error('获取北京时间失败');
            }
        } else {
            if (data.success === '1' && data.result.timestamp) {
                initialTimeOffset = data.result.timestamp * 1000 - Date.now(); // 记录偏移值（毫秒）
                return data.result.timestamp * 1000; // 返回北京时间（毫秒）
            } else {
                throw new Error('获取北京时间失败');
            }
        }
    } catch (error) {
        console.error('获取北京时间失败:', error);
        throw error;
    }
}



// 使用初始偏移值计算当前北京时间
function getCurrentBeijingTime() {
    return Date.now() + initialTimeOffset; // 当前时间 + 偏移值 = 北京时间
}

// 显示倒计时
function startCountdown(targetTime) {
    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        try {
            const now = getCurrentBeijingTime(); // 使用偏移值计算当前时间
            const diff = targetTime - now; // 剩余时间（毫秒）

            if (diff <= 0) {
                clearInterval(countdownInterval);
                countdownDisplay.textContent = '倒计时结束！';

                // 播放音频提醒
                alertSound.play();
            } else {
                const minutes = Math.floor(diff / 60000); // 剩余分钟
                const seconds = Math.floor((diff % 60000) / 1000); // 剩余秒
                countdownDisplay.textContent = `还剩下：${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        } catch (error) {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = '倒计时更新失败';
            console.error('倒计时刷新失败:', error);
        }
    }, 1000);
}

// 获取北京时间并加上秒数保存
async function fetchBeijingTimeAndSave(seconds) {
    try {
        const currentTimestamp = getCurrentBeijingTime(); // 使用初始偏移值计算当前时间
        const newTimestamp = currentTimestamp + seconds * 1000; // 加上秒数
        const newTime = new Date(newTimestamp);

        // 保存到 LeanCloud
        await clearLeanCloudData(); // 清空旧数据
        const TimeData = AV.Object.extend('TimeData');
        const timeData = new TimeData();
        timeData.set('time', newTime); // 保存为标准 Date 类型
        await timeData.save();

        // 开始倒计时
        startCountdown(newTimestamp);
    } catch (error) {
        console.error('获取或保存时间失败:', error);
        alert('获取或保存时间失败，请稍后再试。');
    }
}

// 删除 LeanCloud 数据
async function removeLeanCloudData() {
    if (confirm('确认删除所有数据吗？')) {
        await clearLeanCloudData();
        countdownDisplay.textContent = '还剩下：--:--';
        alert('数据已删除');
    }
}

// 切换时间源
function toggleAPI() {
    usingTimeZoneDB = !usingTimeZoneDB; // 切换时间源
    switchAPIButton.textContent = usingTimeZoneDB ? '切换到 NowAPI' : '切换到 TimeZoneDB';
    currentTimeSource.textContent = usingTimeZoneDB ? 'TimeZoneDB' : 'NowAPI';
    initializeCountdown(); // 重新初始化倒计时
}

// 页面加载时检查 LeanCloud 数据
async function initializeCountdown() {
    try {
        await fetchInitialTime(); // 首次加载时从选中的 API 获取当前北京时间

        const storedTime = await getStoredTime();
        if (storedTime) {
            const now = getCurrentBeijingTime(); // 使用初始偏移值计算当前时间
            const diff = storedTime - now; // 计算剩余时间

            if (diff > 0) {
                startCountdown(storedTime.getTime());
            } else {
                countdownDisplay.textContent = '倒计时已结束，请重新设置时间。';
            }
        } else {
            countdownDisplay.textContent = '请输入秒数并点击 Start。';
        }
    } catch (error) {
        countdownDisplay.textContent = '初始化失败，请刷新页面重试';
        console.error('初始化失败:', error);
    }
}

// 打开设置面板
function openSettingsPanel() {
    settingsPanel.classList.remove('hidden');
}

// 关闭设置面板
function closeSettingsPanel() {
    settingsPanel.classList.add('hidden');
}

// 事件监听
startButton.addEventListener('click', async () => {
    const seconds = parseInt(secondsInput.value, 10);
    if (isNaN(seconds) || seconds <= 0) {
        alert('请输入有效的秒数');
        return;
    }

    // 获取时间并保存
    fetchBeijingTimeAndSave(seconds);
});

removeButton.addEventListener('click', removeLeanCloudData);
settingsButton.addEventListener('click', openSettingsPanel);
closeSettingsButton.addEventListener('click', closeSettingsPanel);
switchAPIButton.addEventListener('click', toggleAPI);

// 初始化页面
initializeCountdown();
