import AV from 'leancloud-storage';

// 初始化 LeanCloud
AV.init({
    appId: 'a4O2WP8ZKjkOH8RbLNXgLTAE-gzGzoHsz',
    appKey: 'At7BrmqGKGPqcbHXwtEL6Y3e',
    serverURLs: 'https://a4o2wp8z.lc-cn-n1-shared.com',
});

// 确保函数是全局的
window.addText = async function() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();

    if (text === '') {
        alert('请输入文本!');
        return;
    }

    const TextObject = AV.Object.extend('SharedText');
    const newText = new TextObject();
    newText.set('text', text);

    try {
        await newText.save();
        textInput.value = '';
        fetchTexts();
    } catch (error) {
        console.error('保存文本失败:', error);
    }
}

window.fetchTexts = async function() {
    const query = new AV.Query('SharedText');
    try {
        const results = await query.find();
        const textList = document.getElementById('textList');
        textList.innerHTML = '';

        results.forEach(result => {
            const text = result.get('text');
            const li = document.createElement('li');
            li.textContent = text;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.className = 'delete';
            deleteButton.onclick = () => deleteText(result.id);

            li.appendChild(deleteButton);
            textList.appendChild(li);
        });
    } catch (error) {
        console.error('获取文本失败:', error);
    }
}

window.deleteText = async function(objectId) {
    const object = AV.Object.createWithoutData('SharedText', objectId);
    try {
        await object.destroy();
        fetchTexts();
    } catch (error) {
        console.error('删除文本失败:', error);
    }
}

// 页面加载时获取初始数据
fetchTexts();