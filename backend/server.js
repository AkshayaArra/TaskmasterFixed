require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

// Initialize app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Notify other users that someone joined
  socket.broadcast.emit('userActivity', {
    username: socket.userId,
    action: 'joined'
  });

  // Handle task events
  socket.on('createTask', (data) => {
    socket.broadcast.emit('taskUpdate', {
      task: data.task,
      action: 'created'
    });
  });

  socket.on('updateTask', (data) => {
    socket.broadcast.emit('taskUpdate', {
      task: data.task,
      action: 'updated'
    });
  });

  socket.on('deleteTask', (data) => {
    socket.broadcast.emit('taskUpdate', {
      task: { id: data.taskId },
      action: 'deleted'
    });
  });

  socket.on('moveTask', (data) => {
    socket.broadcast.emit('taskUpdate', {
      task: {
        id: data.taskId,
        sourceColumn: data.sourceColumn,
        destinationColumn: data.destinationColumn,
        newIndex: data.newIndex
      },
      action: 'moved'
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    socket.broadcast.emit('userActivity', {
      username: socket.userId,
      action: 'left'
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
