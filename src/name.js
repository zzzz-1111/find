import AV from 'leancloud-storage';

// 初始化 LeanCloud
AV.init({
    appId: 'a4O2WP8ZKjkOH8RbLNXgLTAE-gzGzoHsz',
    appKey: 'At7BrmqGKGPqcbHXwtEL6Y3e',
    serverURLs: 'http://a4o2wp8z.lc-cn-n1-shared.com',
});

// 定义全局变量
let userName = null;
let currentUserObjectId = null;

// 页面加载时提示输入用户名并保存到 LeanCloud
window.addEventListener('load', async () => {
    userName = prompt('Please enter your name:');
    if (!userName) {
        alert('Name is required!');
        throw new Error('Name is required!');
    }

    await saveUserToCloud();
    await refreshUserList();
});

// 保存用户到 `uusser` 表
async function saveUserToCloud() {
    const Uusser = AV.Object.extend('uusser');
    const userObject = new Uusser();
    userObject.set('name', userName);

    try {
        const savedUser = await userObject.save();
        console.log('User saved successfully:', savedUser);
        currentUserObjectId = savedUser.id; // 记录 objectId 用于退出时删除
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

// 查询并显示所有用户
async function refreshUserList() {
    const query = new AV.Query('uusser');

    try {
        const users = await query.find();
        console.log('Fetched users:', users);

        const userList = document.getElementById('userList');
        if (!userList) {
            console.error('No user list element found in the DOM!');
            return;
        }

        userList.innerHTML = ''; // 清空列表

        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.get('name');
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// 广播消息给所有用户，并分配唯一数字
async function sendMessageToAll() {
    const query = new AV.Query('uusser');

    try {
        const users = await query.find();
        if (users.length === 0) {
            alert('No users to broadcast!');
            return;
        }

        const userNames = users.map(user => user.get('name'));
        const numbers = Array.from({ length: userNames.length }, (_, i) => i + 1);

        // 打乱数字顺序（Fisher-Yates shuffle）
        shuffle(numbers);

        // 广播消息
        userNames.forEach((name, index) => {
            alert(`To ${name}: 你是 ${name}，分配的数字是 ${numbers[index]}`);
        });

        console.log('Broadcast completed successfully.');
    } catch (error) {
        console.error('Error broadcasting message:', error);
    }
}

// 打乱数组的顺序
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 页面关闭时删除用户记录
window.addEventListener('beforeunload', async () => {
    if (currentUserObjectId) {
        try {
            const query = new AV.Query('uusser');
            const user = await query.get(currentUserObjectId);
            if (user) {
                await user.destroy();
                console.log('User deleted successfully:', currentUserObjectId);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
});

// 页面按钮操作：广播消息
document.getElementById('startButton').addEventListener('click', sendMessageToAll);
