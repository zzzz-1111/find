import AV from 'leancloud-storage';

// Initialize LeanCloud
AV.init({
    appId: 'a4O2WP8ZKjkOH8RbLNXgLTAE-gzGzoHsz',
    appKey: 'At7BrmqGKGPqcbHXwtEL6Y3e',
    serverURLs: 'https://a4o2wp8z.lc-cn-n1-shared.com',
});

let userName = null;

// Prompt user to enter a name when the page loads
window.addEventListener('load', async () => {
    userName = prompt('Please enter your name:');
    if (!userName) {
        alert('Name is required!');
        return;
    }

    try {
        // Save the user's name to LeanCloud
        const User = AV.Object.extend('User');
        const userObject = new User();
        userObject.set('name', userName);
        await userObject.save();

        // Refresh the user list to display all users
        await refreshUserList();
    } catch (error) {
        console.error('Error saving user:', error);
    }
});

// Handle the "start" button click
async function startGame() {
    try {
        // Fetch all logged-in users
        const query = new AV.Query('User');
        const users = await query.find();

        const userNames = users.map(user => user.get('name'));

        // Randomly assign numbers 1 to n (n = total users)
        const numbers = Array.from({ length: userNames.length }, (_, i) => i + 1);
        shuffle(numbers);

        // Broadcast messages to all users
        userNames.forEach((name, index) => {
            alert(`To ${name}: 你是 ${name}, 分配到的数字是 ${numbers[index]}`);
        });
    } catch (error) {
        console.error('Error starting game:', error);
    }
}

// Shuffle an array (Fisher-Yates algorithm)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Refresh the user list
async function refreshUserList() {
    try {
        const query = new AV.Query('User');
        const users = await query.find();

        const userList = document.getElementById('userListContent'); // Correct element ID
        userList.innerHTML = ''; // Clear existing list

        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.get('name');
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching user list:', error);
    }
}

// Event listener for the "start" button
document.getElementById('startButton').addEventListener('click', startGame);
