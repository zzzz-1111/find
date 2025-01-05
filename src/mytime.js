import AV from 'leancloud-storage';

// 初始化 LeanCloud
AV.init({
    appId: 'a4O2WP8ZKjkOH8RbLNXgLTAE-gzGzoHsz',
    appKey: 'At7BrmqGKGPqcbHXwtEL6Y3e',
    serverURLs: 'https://a4o2wp8z.lc-cn-n1-shared.com',
});

const apiKey = '68RUC9FIB396';
const apiUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=Asia/Shanghai`;

const secondsInput = document.getElementById('secondsInput');
const startButton = document.getElementById('startButton');
const removeButton = document.getElementById('removeButton');
const countdownDisplay = document.getElementById('countdown');
const alertSound = document.getElementById('alertSound');

let countdownInterval;

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

// 从 TimeZoneDB 获取当前北京时间
async function fetchCurrentTime() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data && data.timestamp) {
            return data.timestamp * 1000; // 转换为毫秒
        } else {
            throw new Error('获取当前时间失败');
        }
    } catch (error) {
        console.error('获取北京时间失败:', error);
        throw error;
    }
}

// 显示倒计时
async function startCountdown(targetTime) {
    clearInterval(countdownInterval);

    countdownInterval = setInterval(async () => {
        try {
            // 每次刷新倒计时时重新获取北京时间
            const now = await fetchCurrentTime(); // 当前时间（毫秒）
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
            countdownDisplay.textContent = '倒计时更新失败，请检查网络连接';
            console.error('倒计时刷新失败:', error);
        }
    }, 1000);
}

// 获取北京时间并加上秒数保存
async function fetchBeijingTimeAndSave(seconds) {
    try {
        const currentTimestamp = await fetchCurrentTime(); // 获取当前时间戳（毫秒）
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

// 页面加载时检查 LeanCloud 数据
async function initializeCountdown() {
    const storedTime = await getStoredTime();
    if (storedTime) {
        const now = await fetchCurrentTime(); // 获取当前时间
        const diff = storedTime - now; // 计算剩余时间

        if (diff > 0) {
            startCountdown(storedTime.getTime());
        } else {
            countdownDisplay.textContent = '倒计时已结束，请重新设置时间。';
        }
    } else {
        countdownDisplay.textContent = '请输入秒数并点击 Start。';
    }
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

// 初始化页面
initializeCountdown();
