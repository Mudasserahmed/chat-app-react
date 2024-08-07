// socket.js
import io from 'socket.io-client';

// Initialize the socket connection
const socket = io('http://10.216.92.141:3000');

// Function to send a message
export const sendMessage = (message) => {
  socket.emit('sendMessage', message);
};

// Function to listen for incoming messages
export const onMessage = (callback) => {
  socket.on('message', callback);
};

// Function to remove the message listener
export const offMessage = (callback) => {
  socket.off('message', callback);
};

// Function to listen for user addition events
export const onUserAdded = (callback) => {
  socket.on('userAdded', callback);
};

// Function to remove the user added listener
export const offUserAdded = (callback) => {
  socket.off('userAdded', callback);
};

// Function to listen for chat addition events
export const onChatAdded = (callback) => {
  socket.on('chatAdded', callback);
};

// Function to remove the chat added listener
export const offChatAdded = (callback) => {
  socket.off('chatAdded', callback);
};

// Function to listen for messages cleared events
export const onMessagesCleared = (callback) => {
  socket.on('messagesCleared', callback);
};

// Function to remove the messages cleared listener
export const offMessagesCleared = (callback) => {
  socket.off('messagesCleared', callback);
};

export default socket;
