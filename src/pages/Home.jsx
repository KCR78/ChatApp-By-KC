import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import Register from './Register';
import { ChatContext } from '../context/ChatContext';
import Visitors from './Visitors';

const Home = () => {

  const { isRegisterUserOpen } = useContext(ChatContext);

  return (
    <div className='home'>
      <div className="container">
        <Sidebar />
        {isRegisterUserOpen ? <Visitors /> : <Chat />}
      </div>
    </div>
  )
};

export default Home