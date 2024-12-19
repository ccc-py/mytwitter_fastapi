let token = localStorage.getItem('token');
let currentUser = null;

// 檢查用戶是否已登入
function checkAuth() {
    if (!token) {
        window.location.href = '/login.html';
    } else {
        fetchCurrentUser();
    }
}

// 獲取當前用戶信息
async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            currentUser = await response.json();
            document.getElementById('username').textContent = currentUser.username;
        } else {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 發布推文
async function postTweet() {
    const content = document.getElementById('tweetContent').value;
    if (!content.trim()) return;

    try {
        const response = await fetch('/api/tweets/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: content })
        });

        if (response.ok) {
            document.getElementById('tweetContent').value = '';
            loadTweets();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 載入推文列表
async function loadTweets() {
    try {
        const response = await fetch('/api/tweets/');
        const tweets = await response.json();
        const tweetsContainer = document.getElementById('tweets');
        tweetsContainer.innerHTML = '';

        tweets.forEach(tweet => {
            const tweetElement = document.createElement('div');
            tweetElement.className = 'tweet-box';
            tweetElement.innerHTML = `
                <strong>@${tweet.author.username}</strong>
                <div class="tweet-content">${tweet.content}</div>
                <div class="tweet-footer">
                    ${new Date(tweet.created_at).toLocaleString()}
                    ${tweet.author.id === currentUser?.id ? 
                        `<button class="btn btn-sm btn-danger float-end" onclick="deleteTweet(${tweet.id})">Delete</button>` 
                        : ''}
                </div>
            `;
            tweetsContainer.appendChild(tweetElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// 刪除推文
async function deleteTweet(tweetId) {
    try {
        const response = await fetch(`/api/tweets/${tweetId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadTweets();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 用戶登入
async function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            window.location.href = '/';
        } else {
            document.getElementById('loginError').textContent = 'Invalid username or password';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 用戶註冊
async function register(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            const error = await response.json();
            document.getElementById('registerError').textContent = error.detail || 'Registration failed';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 登出
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}
