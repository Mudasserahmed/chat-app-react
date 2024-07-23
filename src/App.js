import React from 'react';
import Chat2 from './components/chat2';
import Chat from './components/chat';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/login';


const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Login  />}></Route>
          <Route path="/chat" element={<Chat2  />}></Route>
          <Route path="/chat1" element={<Chat  />}></Route>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
