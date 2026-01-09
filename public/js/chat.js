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
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Show browser notification
function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%234CAF50"/><text x="50" y="60" font-size="50" text-anchor="middle" fill="white" font-weight="bold">💬</text></svg>',
      ...options
    });
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

// receive message from server with sender ID
socket.on('message-from-server', (data) => {
  if (typeof data === 'string') {
    // Old format - just text
    addMessage(data, 'server');
  } else {
    // New format - object with message and senderId
    addMessage(data.message, 'server', data.senderId);
    // Show notification for new message from other users
    showNotification('New Message', {
      body: `${data.senderId.substring(0, 8)}...: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`
    });
  }
});

// send message to server on button click or Enter key
function sendMessage(){
  const message = messageInput.value.trim();
  if(message){
    socket.emit('message-from-client', message);
    addMessage(message, 'client');
    messageInput.value = '';
    // Optional: Show notification for your own message
    showNotification('Message Sent', {
      body: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    });
  }
}

// Send on button click
sendButton.addEventListener('click', sendMessage);

// Send on Enter key press
messageInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    e.preventDefault(); // Prevent default form submission behavior
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
connectedUsers.add(socket.id);
updateUsersDisplay();
requestNotificationPermission();
