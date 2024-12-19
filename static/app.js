let token = localStorage.getItem('token');
let currentUser = null;

// 檢查用戶是否已登入
function checkAuth() {
    // 獲取當前頁面路徑
    const path = window.location.pathname;
    
    // 如果是用戶個人頁面，允許未登入用戶訪問
    if (path.startsWith('/users/profile/')) {
        // if (token) {
            fetchCurrentUser();
            loadFriendRequests();
            loadFriends();
        // }
        return;
    }
    
    // 其他頁面需要登入
    if (!token) {
        window.location.href = '/login.html';
    } else {
        fetchCurrentUser();
        loadFriendRequests();
        loadFriends();
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
                <div class="tweet-header">
                    <a href="/users/profile/${tweet.author.username}" class="user-link">@${tweet.author.username}</a>
                </div>
                <div class="tweet-content">${tweet.content}</div>
                <div class="tweet-footer">
                    ${new Date(tweet.created_at).toLocaleString()}
                    ${tweet.author.id === currentUser?.id ? 
                        `<button class="btn btn-sm btn-danger float-end" onclick="deleteTweet(${tweet.id})">Delete</button>` 
                        : `<button class="btn btn-sm btn-primary float-end" onclick="sendFriendRequest(${tweet.author.id})">Add Friend</button>`}
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

// 發送好友請求
async function sendFriendRequest(userId) {
    try {
        const response = await fetch('/api/friend-requests/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ receiver_id: userId })
        });

        if (response.ok) {
            alert('Friend request sent!');
        } else {
            const error = await response.json();
            alert(error.detail);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 載入好友請求
async function loadFriendRequests() {
    try {
        const response = await fetch('/api/friend-requests/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const requests = await response.json();
        const requestsContainer = document.getElementById('friendRequests');
        if (!requestsContainer) return;
        
        requestsContainer.innerHTML = '';
        requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'friend-request-box';
            requestElement.innerHTML = `
                <strong>@${request.username}</strong> wants to be your friend
                <div class="btn-group float-end">
                    <button class="btn btn-sm btn-success" onclick="acceptFriendRequest(${request.id})">Accept</button>
                    <button class="btn btn-sm btn-danger" onclick="rejectFriendRequest(${request.id})">Reject</button>
                </div>
            `;
            requestsContainer.appendChild(requestElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// 接受好友請求
async function acceptFriendRequest(userId) {
    try {
        const response = await fetch(`/api/friend-requests/${userId}/accept`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadFriendRequests();
            loadFriends();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 拒絕好友請求
async function rejectFriendRequest(userId) {
    try {
        const response = await fetch(`/api/friend-requests/${userId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadFriendRequests();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 載入好友列表
async function loadFriends() {
    try {
        const response = await fetch('/api/friends/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const friends = await response.json();
        const friendsContainer = document.getElementById('friends');
        if (!friendsContainer) return;
        
        friendsContainer.innerHTML = '';
        friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = 'friend-box';
            friendElement.innerHTML = `
                <strong>@${friend.username}</strong>
                <button class="btn btn-sm btn-danger float-end" onclick="removeFriend(${friend.id})">Remove</button>
            `;
            friendsContainer.appendChild(friendElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// 移除好友
async function removeFriend(userId) {
    try {
        const response = await fetch(`/api/friends/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadFriends();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 載入用戶個人資料
async function loadUserProfile() {
    const pathParts = window.location.pathname.split('/');
    const username = pathParts[pathParts.length - 1];
    
    try {
        // Get user info
        const response = await fetch(`/api/users/by-username/${username}`);
        if (!response.ok) {
            window.location.href = '/';
            return;
        }
        
        const user = await response.json();
        document.getElementById('profileUsername').textContent = `@${user.username}`;
        document.getElementById('profileJoinDate').textContent = 
            `Joined ${new Date(user.created_at).toLocaleDateString()}`;
        
        // Load wall messages
        loadWallMessages(user.id);
        
        // Load user's tweets
        loadUserTweets(user.id);
        
        // 只有在用戶已登入時才更新好友操作區域
        // if (token) {
            updateFriendActionArea(user);
        /*
        } else {
            document.getElementById('friendActionArea').innerHTML = `
                <div class="alert alert-info">
                    <a href="/login">Login</a> to interact with ${user.username}
                </div>
            `;
        }
        */
        // Store wall owner ID for posting messages
        window.wallOwnerId = user.id;
    } catch (error) {
        console.error('Error:', error);
    }
}

// 載入用戶的推文
async function loadUserTweets(userId) {
    try {
        const response = await fetch(`/api/tweets/user/${userId}`);
        const tweets = await response.json();
        const tweetsContainer = document.getElementById('userTweets');
        tweetsContainer.innerHTML = '';

        tweets.forEach(tweet => {
            const tweetElement = document.createElement('div');
            tweetElement.className = 'tweet-box';
            tweetElement.innerHTML = `
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

// 載入留言板消息
async function loadWallMessages(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/wall`);
        const messages = await response.json();
        const messagesContainer = document.getElementById('wallMessages');
        messagesContainer.innerHTML = '';

        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'wall-message';
            messageElement.innerHTML = `
                <div class="message-header">
                    <strong>@${message.author.username}</strong>
                    <small class="text-muted">${new Date(message.created_at).toLocaleString()}</small>
                </div>
                <div class="message-content">${message.content}</div>
                ${message.author.id === currentUser?.id || message.wall_owner.id === currentUser?.id ? 
                    `<button class="btn btn-sm btn-danger float-end" onclick="deleteWallMessage(${message.id})">Delete</button>` 
                    : ''}
            `;
            messagesContainer.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// 發布留言板消息
async function postWallMessage() {
    const content = document.getElementById('wallMessage').value;
    if (!content.trim()) return;

    try {
        const response = await fetch('/api/wall-messages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: content,
                wall_owner_id: window.wallOwnerId
            })
        });

        if (response.ok) {
            document.getElementById('wallMessage').value = '';
            loadWallMessages(window.wallOwnerId);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 刪除留言板消息
async function deleteWallMessage(messageId) {
    try {
        const response = await fetch(`/api/wall-messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadWallMessages(window.wallOwnerId);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 更新好友操作區域
async function updateFriendActionArea(user) {
    const actionArea = document.getElementById('friendActionArea');
    if (user.id === currentUser?.id) {
        actionArea.innerHTML = '<p class="text-muted">This is your profile</p>';
        return;
    }

    try {
        const response = await fetch('/api/friends/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const friends = await response.json();
        
        if (friends.some(friend => friend.id === user.id)) {
            actionArea.innerHTML = `
                <button class="btn btn-danger" onclick="removeFriend(${user.id})">Remove Friend</button>
            `;
        } else {
            actionArea.innerHTML = `
                <button class="btn btn-primary" onclick="sendFriendRequest(${user.id})">Add Friend</button>
            `;
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
