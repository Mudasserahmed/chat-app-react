import React, { useState, useEffect } from 'react';
import { sendMessage, onMessage, offMessage } from '../socket';
import { useNavigate } from 'react-router-dom';
import { FaPaperclip } from "react-icons/fa";
import axios from 'axios';

const Chat2 = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        return storedMessages ? JSON.parse(storedMessages) : [];
    });
    const [messageText, setMessageText] = useState('');
    const [userName, setUserName] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Data save on local storage
    useEffect(() => {
        const handleMessage = (message) => {
            const newMessages = [...messages, message];
            setMessages(newMessages);
            localStorage.setItem('chatMessages', JSON.stringify(newMessages));
        };
        onMessage(handleMessage);

        return () => {
            offMessage();
        };
    }, [messages]);

    useEffect(() => {
        const userName = localStorage.getItem("userName");
        setUserName(userName);
        console.log(userName);
    }, []);

    // Sending message
    const BASEURL = "http://10.121.214.142:3000";
    const handleSendMessage = async () => {
        if (messageText.trim() || selectedFile) {
            const formData = new FormData();
            let fileData = null;
            if (selectedFile) {
                formData.append("file", selectedFile);
                try {
                    const response = await axios.post(`${BASEURL}/upload`, formData);
                    if (response && response.data) {
                        fileData = {
                            fileName: response.data.fileName,
                            fileType: response.data.fileType,
                            fileSize: response.data.fileSize,
                            base64: response.data.data
                        };
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            const newMessage = {
                text: messageText,
                username: userName,
                file: fileData
            };

            sendMessage(newMessage);
            setMessageText('');
            setSelectedFile(null);
        }
    };

    // Handle file upload
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 25 * 1024 * 1024) { // Ensure file size is within 25 MB
            console.log(file);  // For demonstration
            setSelectedFile(file);
        } else {
            // Handle file size exceeds limit
            alert("File size exceeds 25 MB limit.");
        }
    };

    // Send message on enter press
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    const handleFileDownload = (file) => {
        const link = document.createElement('a');
        link.href = `data:${file.fileType};base64,${file.base64}`;
        link.download = file.fileName;
        link.click();
    };

    return (
        <div className={`flex flex-col h-screen max-w-md mx-auto border border-gray-300 shadow-md rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <header className="bg-blue-500 text-white p-4 text-center text-xl font-semibold flex justify-between items-center">
                <span>Real-Time Chat App</span>
                <button  onClick={handleLogout}>Logout</button>
            </header>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div className="space-y-4">
                    {messages?.map((message, index) => (
                        <div key={index} className={`flex ${message.username === userName ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xs ${message.username === userName ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                                <p className="font-semibold">{message.username}</p>
                                <p className='break-words'>{message.text}</p>
                                {message.file && (
                                    <button onClick={() => handleFileDownload(message.file)} className="text-sm text-blue-700 underline">
                                        Download {message.file.fileName}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-gray-100 p-4 border-t border-gray-200 flex items-center space-x-2">
                <input
                    type="text"
                    value={messageText}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                    <FaPaperclip />
                </label>
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat2;
