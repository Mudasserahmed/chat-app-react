import React, { useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const contacts = [
  { id: 1, name: 'Alice', initial: 'A' },
  { id: 2, name: 'Bob', initial: 'B' },
  { id: 3, name: 'Charlie', initial: 'C' },
  { id: 4, name: 'Diana', initial: 'D' },
  { id: 5, name: 'Eve', initial: 'E' },
];

const initialChats = {
  1: [{ text: 'Hi there!', sender: 'Alice' }, { text: 'Hello Alice! How are you?', sender: 'You' }],
  2: [{ text: 'Hey Bob!', sender: 'Bob' }, { text: 'What’s up Bob?', sender: 'You' }],
  3: [{ text: 'Hello Charlie!', sender: 'Charlie' }, { text: 'Hi Charlie!', sender: 'You' }],
  4: [{ text: 'Good morning Diana!', sender: 'Diana' }, { text: 'Morning Diana!', sender: 'You' }],
  5: [{ text: 'Hey Eve!', sender: 'Eve' }, { text: 'Hey Eve! What’s up?', sender: 'You' }],
};

const socket = io('http://localhost:3000'); 

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState(initialChats);

  const handleContactClick = useCallback((contact) => {
    setSelectedContact(contact.id);
  }, []);

  const handleSendClick = () => {
    const selectedName = contacts.filter((i)=>i.id == selectedContact)[0].name
    console.log(selectedName)
    if (message.trim() === '') return; // Prevent sending empty messages
    // Emit a new message to the server
    socket.emit('send_message', { contactId: selectedContact, text: message ,sender:selectedName });
    // Add the new message to the chats state
    setChats(prevChats => {
      const updatedChats = { ...prevChats };

      if (selectedContact !== null) {
        // Append the new message to the current chat for the selected contact
        updatedChats[selectedContact] = [
          ...updatedChats[selectedContact],
          { text: message, sender: 'You' },
        ];
      }

      return updatedChats;
    });

    // Clear the input field
    setMessage('');
  };

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default behavior of the Enter key
      handleSendClick(); // Trigger the send message function
    }
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
        console.log("recieved data",data)
      setChats((prevChats) => {
        const updatedChats = { ...prevChats };
        if (data.contactId in updatedChats) {
          updatedChats[data.contactId] = [
            ...updatedChats[data.contactId],
            { text: data.text, sender: data.sender },
          ];
        } else {
          updatedChats[data.contactId] = [{ text: data.text, sender: data.sender }];
        }

        return updatedChats;
      });
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <header>
        <title>Chat Application</title>
        <meta name="description" content="A simple chat application" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-0 overflow-auto bg-sidebar-bg h-full w-64 p-4 flex flex-col md:relative md:w-64 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <h2 className="text-2xl text-sidebar-text mb-4">Contacts</h2>
        <ul className="flex flex-col space-y-2">
          {contacts.map(contact => (
            <li key={contact.id}>
              <button
                onClick={() => handleContactClick(contact)}
                className="w-full text-sidebar-text hover:bg-sidebar-hover p-2 rounded-md flex items-center space-x-2"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">{contact.initial}</div>
                <span>{contact.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Sidebar toggle button */}
        <button
          className="md:hidden p-4 bg-gray-400 text-white rounded-md fixed top-4 left-4 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="material-icons">menu</span>
        </button>

        {/* Chat window */}
        <main className="flex-1 p-4 bg-chat-bg h-full flex flex-col ">
          {selectedContact ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {chats[selectedContact]?.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 ${message.sender === 'You' ? 'justify-end' : ''}`}
                    >
                      {message.sender !== 'You' && (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">{contacts.find(c => c.id === selectedContact)?.initial}</div>
                      )}
                      <div
                        className={`p-3 rounded-lg text-gray-800 ${message.sender === 'You' ? 'bg-chat-reply' : 'bg-chat-message'}`}
                      >
                        <p>{message.text}</p>
                      </div>
                      {message.sender === 'You' && (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">You</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-100 p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown} // Added onKeyDown event
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleSendClick}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <p>Select a contact to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
