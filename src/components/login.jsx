import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const BASE_URL = "http://10.216.92.141:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a new chat directly
      const response = await axios.post(`${BASE_URL}/addChat`, { userName });
      if (response) {
        console.log(response.data);
        localStorage.setItem('userName', userName);
        navigate('/chat');
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <form className="home__container" onSubmit={handleSubmit}>
      <h2 className="home__header">Sign in to Open Chat</h2>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        minLength={6}
        name="username"
        id="username"
        style={{ border: "1px solid black" }}
        className="username__input"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button className="home__cta">SIGN IN</button>
    </form>
  );
};

export default Login;
