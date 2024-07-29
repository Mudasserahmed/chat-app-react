import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, onMessage, offMessage } from '../socket';
import { useNavigate } from 'react-router-dom';
import { FaPaperclip, FaTimes } from "react-icons/fa";
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
    const [selectedFileName, setSelectedFileName] = useState('');
    const messageContainerRef = useRef(null);

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

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

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
                file: fileData,
                timestamp: new Date().toISOString()
            };
            console.log("message ",newMessage)
            sendMessage(newMessage);
            setMessageText('');
            setSelectedFile(null);
            setSelectedFileName('');
        }
    };

    const handleFileChange = (event) => {
        console.log("selected file",event.target.files[0])
        const file = event.target.files[0];
        if (file && file.size <= 25 * 1024 * 1024) {
            console.log(file);
            setSelectedFile(file);
            setSelectedFileName(file.name);
        } else {
            alert("File size exceeds 25 MB limit.");
        }
    };
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

    const handleFileReset = () => {
        setSelectedFile(null);
        setSelectedFileName('');
    };

    return (
        <div className={`flex flex-col h-screen w-[50%] mx-auto border border-gray-300 shadow-md rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <header className="bg-[#004890] font-serif text-white p-4  text-xl font-semibold flex justify-between items-center">
                <span> {userName}</span>
                <span> <img src="https://cdn.prod.website-files.com/6476dfb953dc2bc84373e1b2/650d2c2e05326b2de5695b99_JS%20Bank%20Logo-%20White.png" className='w-23 h-10' alt="" />  </span>
                {/* <span>JS Chat</span> */}
                <button className='text-sm border border-slate-950 p-2 rounded-md bg-gray-400' onClick={handleLogout}>Reset Chat</button>
            </header>
            <div ref={messageContainerRef} className="flex-1 overflow-auto p-4 bg-gray-100">
                <div className="space-y-4">
                    {messages?.map((message, index) => {
                        console.log(message)
                        return (
                            <div key={index} className={`flex ${message.username === userName ? 'justify-end' : 'justify-start'}`}>
                                {message.username !== userName && (
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpd4mJRIUwqgE8D_Z2znANEbtiz4GhI4M8NQ&s" alt="Logo" className="w-10 h-10 mr-3 rounded-full" />
                                )}
                                <div className={`p-3 rounded-lg max-w-xs ${message.username === userName ? 'bg-[#004890] text-white' : 'bg-gray-300 text-gray-800'}`}>
                                    <div className="flex items-center">
                                        <div>
                                            <p className='break-words'>{message.text}</p>
                                            {message.file && (
                                                <button onClick={() => handleFileDownload(message.file)} className="text-sm text-black underline">
                                                    Download {message.file.fileName}
                                                </button>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(message.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {message.username === userName && (
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpd4mJRIUwqgE8D_Z2znANEbtiz4GhI4M8NQ&s" alt="Logo" className="w-10 h-10 ml-3 rounded-full" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="bg-gray-100 p-4 border-t border-gray-200 flex items-center space-x-2">
                <input
                    type="text"
                    value={messageText}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-md no-focus-outline"
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
                    className="bg-[#004890] text-white p-2 rounded-md hover:bg-blue-700"
                >
                    Send
                </button>
                {selectedFileName && (
                    <div className="flex items-center text-lg text-gray-800">
                        {selectedFileName}
                        <FaTimes onClick={handleFileReset} className="ml-2 cursor-pointer text-gray-500" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat2;
