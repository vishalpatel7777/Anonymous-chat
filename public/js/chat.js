// instance of socket.io
const socket = io();

// select elements
const sendButton = document.querySelector('#send-button');
const messageInput = document.querySelector('#messageInput');
const messageArea = document.querySelector('#messageArea');
const usersList = document.querySelector('#usersList');

// Store connected users
let connectedUsers = new Set();

// Request notification permission on load
function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Service Worker registered successfully');
      })
      .catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
  }
}

// Show system notification
function showNotification(senderName, message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const title = `New Message from ${senderName}...`;
    const options = {
      body: message.substring(0, 100),
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%234CAF50"/><text x="50" y="60" font-size="50" text-anchor="middle" fill="white" font-weight="bold">💬</text></svg>',
      tag: 'chat-message',
      requireInteraction: true
    };

    // Try to use service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: title,
        options: options
      });
    } else {
      // Fallback to direct notification
      try {
        new Notification(title, options);
      } catch (e) {
        console.log('Notification failed:', e);
      }
    }
  }
}

// add regular message
function addMessage(message, sender, senderId = null){
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  // If it's from another user, show their ID
  if (sender === 'server' && senderId) {
    const senderLabel = document.createElement('div');
    senderLabel.className = 'sender-label';
    senderLabel.textContent = `${senderId.substring(0, 8)}...`;
    messageDiv.appendChild(senderLabel);
  }
  
  const messageText = document.createElement('div');
  messageText.className = 'message-text';
  messageText.textContent = message;
  messageDiv.appendChild(messageText);
  
  messageArea.appendChild(messageDiv);
  messageArea.scrollTop = messageArea.scrollHeight;
}

// add system notification (join/leave)
function addSystemNotification(message, type) {
  const notificationDiv = document.createElement('div');
  notificationDiv.className = `system-notification ${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'notification-icon';
  icon.textContent = type === 'join' ? '✓' : '✗';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  notificationDiv.appendChild(icon);
  notificationDiv.appendChild(text);
  
  messageArea.appendChild(notificationDiv);
  messageArea.scrollTop = messageArea.scrollHeight;
}

// update users list display
function updateUsersDisplay() {
  usersList.innerHTML = '';
  
  // Add user count header
  const countDiv = document.createElement('div');
  countDiv.className = 'user-count';
  countDiv.textContent = `Online: ${connectedUsers.size}`;
  usersList.appendChild(countDiv);
  
  // Add each user
  connectedUsers.forEach(userId => {
    if (!userId) return; // Skip undefined users
    
    const userDiv = document.createElement('div');
    userDiv.className = 'user-item';
    
    // Create user icon
    const userIcon = document.createElement('span');
    userIcon.className = 'user-icon';
    userIcon.textContent = '👤';
    
    // Create user ID text
    const userText = document.createElement('span');
    userText.className = 'user-id';
    
    if (userId === socket.id) {
      userDiv.classList.add('current-user');
      userText.textContent = `You (${userId.substring(0, 8)}...)`;
    } else {
      userText.textContent = userId.substring(0, 8) + '...';
    }
    
    // Create status indicator
    const statusDot = document.createElement('span');
    statusDot.className = 'status-dot';
    
    userDiv.appendChild(userIcon);
    userDiv.appendChild(userText);
    userDiv.appendChild(statusDot);
    usersList.appendChild(userDiv);
  });
}

// When a new user connects
socket.on('user-connected', (userId) => {
  connectedUsers.add(userId);
  updateUsersDisplay();
  addSystemNotification(`${userId.substring(0, 8)}... joined the chat`, 'join');
});

// When a user disconnects
socket.on('user-disconnected', (userId) => {
  connectedUsers.delete(userId);
  updateUsersDisplay();
  addSystemNotification(`${userId.substring(0, 8)}... left the chat`, 'leave');
});

// Receive initial users list
socket.on('users-list', (users) => {
  connectedUsers = new Set(users);
  updateUsersDisplay();
});

// Receive message from OTHER users and display in chat
socket.on('message-from-server', (data) => {
  if (typeof data === 'string') {
    // Old format - just text (welcome message)
    addMessage(data, 'server');
  } else {
    // New format - object with message and senderId
    addMessage(data.message, 'server', data.senderId);
  }
});

// Listen for notification event - shows popup on ALL users
socket.on('new-message-notification', (data) => {
  showNotification(data.senderName, data.message);
});

// send message to server on button click or Enter key
function sendMessage(){
  const message = messageInput.value.trim();
  if(message){
    socket.emit('message-from-client', message);
    addMessage(message, 'client');
    messageInput.value = '';
  }
}

// Send on button click
sendButton.addEventListener('click', sendMessage);

// Send on Enter key press
messageInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    e.preventDefault();
    sendMessage();
  }
});

socket.on('greeting', (msg, ackCallback) => {
    console.log('Greeting from server: ', msg);
    ackCallback({
      status: 'Received',
      message: 'Greeting message received loud and clear!',
      timestamp: new Date()
    });
});

// Initialize - add current user and request notification permission
socket.on('connect', () => {
  connectedUsers.add(socket.id);
  updateUsersDisplay();
});

requestNotificationPermission();
