import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendMessage, onMessage, offMessage, onUserAdded, offUserAdded, onMessagesCleared, offMessagesCleared, onChatAdded, offChatAdded } from '../socket'; // Ensure these are correctly set up
import { FaPaperclip, FaSearch, FaTimes, FaDownload, FaFilePdf, FaFileAlt } from "react-icons/fa";
import axios from 'axios';

const Chat2 = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [userName, setUserName] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [filePreview, setFilePreview] = useState(null);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // State for chat search term
    const [users, setUsers] = useState([]); // Add state to store users
    const [userSearchTerm, setUserSearchTerm] = useState(''); // State for user search term
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const modalRef = useRef(null);
    const messageContainerRef = useRef(null);

    const BASEURL = "http://10.216.92.141:3000";

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get(`${BASEURL}/chats`);
                if (response) {
                    console.log("all chats", response);
                    setChats(response.data);
                    const savedActiveChat = localStorage.getItem('activeChat');
                    if (savedActiveChat) {
                        setActiveChat(savedActiveChat);
                        const initialChat = response.data.find(chat => chat.chatId === savedActiveChat);
                        if (initialChat) {
                            setMessages(initialChat.messages);
                        }
                    }
                } else {
                    console.error('Failed to fetch chats');
                }
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };


        fetchChats();

        const storedUserName = localStorage.getItem("userName");
        setUserName(storedUserName);
    }, []);

    useEffect(() => {
        if (activeChat) {
            localStorage.setItem('activeChat', activeChat);
            const fetchMessages = async () => {
                try {
                    const response = await axios.get(`${BASEURL}/chats/${activeChat}/messages`);
                    if (response && response.data) {
                        setMessages(response.data);
                    }
                } catch (error) {
                    console.log('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }
    }, [activeChat]);

    useEffect(() => {
        const handleMessage = (data) => {
            const { chatId, newMessage } = data;
            if (chatId === activeChat) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        };

        const handleUserAdded = (user) => {
            console.log("New user added:", user);
            // Handle new user added logic here if needed
        };

        const handleChatAdded = (chat) => {
            console.log("New chat added:", chat);
            setChats((prevChats) => [...prevChats, chat]);
        };

        const handleMessagesCleared = () => {
            if (activeChat) {
                setMessages([]);
            }
        };

        onMessage(handleMessage);
        onUserAdded(handleUserAdded);
        onChatAdded(handleChatAdded);
        onMessagesCleared(handleMessagesCleared);

        return () => {
            offMessage(handleMessage);
            offUserAdded(handleUserAdded);
            offChatAdded(handleChatAdded);
            offMessagesCleared(handleMessagesCleared);
        };
    }, [activeChat]);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                closeModal();
            }
        };
        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

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
                timestamp: new Date().toISOString(),
                chatId: activeChat
            };

            // Emit message via socket
            sendMessage(newMessage);

            // Clear input fields after sending the message
            setMessageText('');
            setSelectedFile(null);
            setSelectedFileName('');
            setFilePreview(null);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 25 * 1024 * 1024) {
            setSelectedFile(file);
            setSelectedFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview({
                    name: file.name,
                    type: file.type,
                    content: reader.result
                });
            };
            reader.readAsDataURL(file);
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

    const handleLogout = async () => {
        try {
            await axios.delete(`${BASEURL}/chats`);
            setMessages([]);
            window.location.reload();
        } catch (error) {
            console.log('Error resetting chat:', error);
        }
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
        setFilePreview(null);
    };

    const handleChatClick = (chat) => {
        setActiveChat(chat.chatId); // Set active chat by chatId
    };

    const handleFileClick = (file) => {
        setModalContent(file);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalContent(null);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const filteredChats = chats.filter(chat =>
        chat.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-[#F3F4F6] p-4 md:block hidden">
                <h2 className="text-2xl font-bold mb-4">Chats</h2>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 pl-10 w-full border border-gray-300 rounded-md"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                <ul className="space-y-2">
                    {filteredChats.map((chat, index) => (
                        <li key={index} className={`cursor-pointer p-2 rounded-md ${chat?.chatId === activeChat ? 'bg-[#004890] text-white' : 'bg-gray-200 text-gray-900'}`} onClick={() => handleChatClick(chat)}>
                            {chat?.userName}
                        </li>
                    ))}
                </ul>
            </div>

            <div className={`flex flex-col h-screen w-3/4 mx-auto border border-gray-300 shadow-md rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                <header className="bg-[#004890] font-serif text-white p-4 text-xl font-semibold flex justify-between items-center">
                    <span>{userName}</span>
                    <span>
                        <img src="https://cdn.prod.website-files.com/6476dfb953dc2bc84373e1b2/650d2c2e05326b2de5695b99_JS%20Bank%20Logo-%20White.png" className='w-23 h-10' alt="Logo" />
                    </span>
                    <button className='text-sm border border-slate-950 p-2 rounded-md bg-gray-400' onClick={handleLogout}>Reset Chat</button>
                </header>
                <div ref={messageContainerRef} className="flex-1 overflow-auto p-4 bg-gray-100">
                    <div className="space-y-4">
                        {messages?.map((message, index) => (
                            <div key={index} className={`flex ${message.username === userName ? 'justify-end' : 'justify-start'}`}>
                                {message.username !== userName && (
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpd4mJRIUwqgE8D_Z2znANEbtiz4GhI4M8NQ&s" alt="Logo" className="w-10 h-10 mr-3 rounded-full" />
                                )}
                                <div className={`p-3 rounded-lg max-w-xs ${message.username === userName ? 'bg-[#004890] text-white' : 'bg-gray-300 text-gray-800'}`}>
                                    <div className="flex items-center">
                                        <div>
                                            <p className='break-words'>{message.text}</p>
                                            {message.file && (
                                                <div className='cursor-pointer'>
                                                    {message.file.fileType.startsWith('image/') ? (
                                                        <img
                                                            src={`data:${message.file.fileType};base64,${message.file.base64}`}
                                                            alt={message.file.fileName}
                                                            className="w-50 h-50 object-cover rounded-md"
                                                            onClick={() => handleFileClick({
                                                                src: `data:${message.file.fileType};base64,${message.file.base64}`,
                                                                file: message.file
                                                            })}
                                                        />
                                                    ) : message.file.fileType === 'application/pdf' ? (
                                                        <div onClick={() => handleFileClick({
                                                            src: `data:${message.file.fileType};base64,${message.file.base64}`,
                                                            file: message.file
                                                        })} className="flex items-center space-x-2">
                                                            <FaFilePdf className="text-2xl text-red-500" />
                                                            <span className="underline text-blue-600">View PDF</span>
                                                        </div>
                                                    ) : (
                                                        <div onClick={() => handleFileClick({
                                                            src: `data:${message.file.fileType};base64,${message.file.base64}`,
                                                            file: message.file
                                                        })} className="flex items-center space-x-2">
                                                            <FaFileAlt className="text-2xl text-gray-500" />
                                                            <span className="underline text-blue-600">View Document</span>
                                                        </div>
                                                    )}
                                                </div>
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
                        ))}
                    </div>
                </div>
                <div className="bg-gray-100 p-4 border-t border-gray-200">
                    {selectedFile && (
                        <div className="flex items-center mb-2 space-x-2 ">
                            {filePreview && filePreview.type.startsWith('image/') ? (
                                <img src={filePreview.content} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                            ) : filePreview && filePreview.type === 'application/pdf' ? (
                                <div className="flex items-center space-x-2">
                                    <FaFilePdf className="text-2xl text-red-500" />
                                    <span>{selectedFileName}</span>
                                    <FaTimes onClick={handleFileReset} className="cursor-pointer text-gray-500" />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <FaFileAlt className="text-2xl text-gray-500" />
                                    <span>{selectedFileName}</span>
                                    <FaTimes onClick={handleFileReset} className="cursor-pointer text-gray-500" />
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
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
                    </div>
                </div>
            </div>
            {showModal && modalContent && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div ref={modalRef} className="relative bg-white p-4 rounded-lg max-w-screen-lg max-h-screen-lg">
                        <FaTimes className="cursor-pointer text-gray-500 absolute top-2 right-2" onClick={closeModal} />
                        <FaDownload className="cursor-pointer text-gray-500 absolute top-2 left-2" onClick={() => handleFileDownload(modalContent.file)} />
                        {modalContent.file.fileType.startsWith('image/') ? (
                            <img src={modalContent.src} alt="Full View" className="max-w-full max-h-full" />
                        ) : modalContent.file.fileType === 'application/pdf' ? (
                            <embed src={modalContent.src} type="application/pdf" width="600" height="600" />
                        ) : (
                            <iframe src={modalContent.src} width="700" height="500" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat2;
