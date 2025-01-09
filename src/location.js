import AV from 'leancloud-storage';

// 初始化 LeanCloud
AV.init({
    appId: 'a4O2WP8ZKjkOH8RbLNXgLTAE-gzGzoHsz',
    appKey: 'At7BrmqGKGPqcbHXwtEL6Y3e',
    serverURLs: 'http://a4o2wp8z.lc-cn-n1-shared.com',
});

// 保存地点到 LeanCloud
function saveLocation() {
    const locationInput = document.getElementById('locationInput').value.trim();
    if (!locationInput) {
        alert('请输入地点！');
        return;
    }

    const Location = AV.Object.extend('Location');
    const location = new Location();
    location.set('name', locationInput);

    location.save()
        .then(() => {
            alert('地点保存成功！');
            document.getElementById('locationInput').value = ''; // 清空输入框
            displayLocations(); // 更新显示的地点
        })
        .catch((error) => {
            console.error('保存地点时发生错误：', error);
            alert(`保存地点失败：${error.message}`);
        });
}

// 获取并显示所有地点
function displayLocations() {
    const query = new AV.Query('Location');
    query.find()
        .then((results) => {
            const locationList = document.getElementById('locationList');
            locationList.innerHTML = ''; // 清空列表

            results.forEach((location) => {
                const locationName = location.get('name');
                const locationId = location.id;

                const span = document.createElement('span');
                span.textContent = locationName;
                span.style.marginRight = '10px'; // 添加空格分隔

                const deleteButton = document.createElement('button');
                deleteButton.textContent = '删除';
                deleteButton.style.marginLeft = '5px';
                deleteButton.onclick = () => deleteLocation(locationId);

                const wrapper = document.createElement('span');
                wrapper.appendChild(span);
                wrapper.appendChild(deleteButton);

                locationList.appendChild(wrapper);
            });
        })
        .catch((error) => {
            console.error('获取地点时发生错误：', error);
            alert(`获取地点失败：${error.message}`);
        });
}

// 删除地点
function deleteLocation(locationId) {
    const location = AV.Object.createWithoutData('Location', locationId);
    location.destroy()
        .then(() => {
            alert('地点删除成功！');
            displayLocations(); // 更新显示的地点
        })
        .catch((error) => {
            console.error('删除地点时发生错误：', error);
            alert(`删除地点失败：${error.message}`);
        });
}

// 随机弹出通知
function startNotifications() {
    const timeInput = parseInt(document.getElementById('timeInput').value.trim(), 10);
    const timesInput = parseInt(document.getElementById('timesInput').value.trim(), 10);

    if (!timeInput || !timesInput || timeInput <= 0 || timesInput <= 0) {
        alert('请输入有效的时间和次数！');
        return;
    }

    const query = new AV.Query('Location');
    query.find()
        .then((results) => {
            if (results.length === 0) {
                alert('LeanCloud 中没有保存的地点！');
                return;
            }

            Notification.requestPermission().then((permission) => {
                if (permission !== 'granted') {
                    alert('请允许通知权限！');
                    return;
                }

                for (let i = 0; i < timesInput; i++) {
                    const randomIndex = Math.floor(Math.random() * results.length);
                    const locationName = results[randomIndex].get('name');
                    setTimeout(() => {
                        showNotification(locationName);
                    }, getRandomTime(timeInput));
                }
            });
        })
        .catch((error) => {
            console.error('获取地点时发生错误：', error);
            alert(`获取地点失败：${error.message}`);
        });
}

// 显示通知
function showNotification(locationName) {
    new Notification('随机通知', {
        body: `地点：${locationName}`,
    });
    alert(locationName)
}

// 生成随机时间（毫秒）
function getRandomTime(maxSeconds) {
    return Math.random() * maxSeconds * 1000;
}

// 初始化时加载地点列表
window.onload = function () {
    displayLocations();
};

// 将函数挂载到全局作用域
window.saveLocation = saveLocation;
window.startNotifications = startNotifications;
