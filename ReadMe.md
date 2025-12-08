# 💬 Anonymous Chat Application

A real-time anonymous chat application built with Node.js, Express, and Socket.IO. Users can join instantly and chat with others while seeing who's online in real-time.

---

## ✨ Features

- 🚀 **Real-time messaging** - Instant message delivery using WebSockets
- 👥 **Active users sidebar** - See all connected users in real-time
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 🔔 **System notifications** - Visual notifications when users join/leave
- 👤 **Sender identification** - See who sent each message
- 📱 **Responsive design** - Works on desktop and mobile devices
- ⚡ **Anonymous** - No registration required, just connect and chat

---
## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with gradients and animations

---
## 📁 Project Structure

```
anonymous-chat/
├── public/
│   ├── css/
│   │   └── style.css        # Styling for the application
│   ├── js/
│   │   └── chat.js          # Client-side Socket.IO logic
│   └── index.html           # Main HTML file
├── server.js                # Express & Socket.IO server
├── package.json             # Dependencies
└── README.md                # Project documentation
```
---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anonymous-chat
   ```

2. **Install dependencies**
   ```bash
   npm install express socket.io
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📦 Dependencies

```json
{
  "express": "^4.18.0",
  "socket.io": "^4.6.0"
}
```
---
## 🎯 How It Works

1. **Connection**: When a user opens the app, Socket.IO establishes a WebSocket connection
2. **User List**: The server tracks all connected users and broadcasts the list to everyone
3. **Messaging**: Messages are sent through Socket.IO and broadcast to all other connected users
4. **Notifications**: Join/leave events are displayed as system notifications
5. **Sender ID**: Each message includes the sender's socket ID (shortened for privacy)

---
## 🎨 Features Breakdown

### Active Users Sidebar
- Shows all connected users in real-time
- Highlights your own connection
- Displays online user count
- Animated status indicators

### Message System
- Your messages appear in green on the right
- Others' messages appear in blue on the left
- Sender ID displayed above each message
- System notifications for user activity

### UI/UX
- Purple gradient sidebar
- Smooth hover animations
- Pulsing status dots
- Custom scrollbar styling
- Responsive layout

---
## 🧑‍💻 Author

Made with 💙 by **Vishal patel**

📧 Contact: [patelvishal14642@gmail.com](mailto:patelvishal14642@gmail.com)

---
## 💬 Feedback or Suggestions?

Feel free to open an [Issue](https://github.com/vishalpatel7777/Book-Recommandation-app/issues) or [Contact Me](mailto:patelvishal14642@gmail.com). I'm always open to ideas that make BookMosaic better!

---

**Happy Chatting! 💬**
