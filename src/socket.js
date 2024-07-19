// socket.js
import io from 'socket.io-client';

// Initialize the socket connection
const socket = io('http://10.121.214.142:3000');

// Function to send a message
export const sendMessage = (message) => {
  socket.emit('sendMessage', message);
};

// Function to listen for messages
export const onMessage = (callback) => {
  socket.on('message', callback);
};

// Function to remove the message listener
export const offMessage = () => {
  socket.off('message');
};

export default socket;
