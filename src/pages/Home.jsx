import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import { ChatContext } from '../context/ChatContext';
import Visitors from './Visitors';
import { useEffect } from 'react';
import LockScreen from "react-lock-screen";
import { useState } from 'react';
import locked from '../img/locked.jpg';

const Home = () => {

  const { isRegisterUserOpen } = useContext(ChatContext);
  const [isLockedScreen, setIsLockedScreen] = useState(false);
  const [lockTimer, setLockTimer] = useState(4000);

  useEffect(() => {
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        console.log("Browser tab is hidden");
        setIsLockedScreen(true);
        setLockTimer(0);
      } else {
        console.log("Browser tab is visible");
      }
    });
  }, []);

  const getLockScreenUi = setLock => {

    let passKey = '';

    const unlockScreen = () => {
      console.log(passKey);
      setLock(false);
      setIsLockedScreen(false);
      setLockTimer(4000);
    };

    return (
      <div className='locker'>
        <div className="react-lock-screen__ui">
          <div className="pinBox">
            <input name="token" type='password' maxLength='4' autoComplete='off' onChange={(e) => passKey = e.target.value} />
          </div>

          <button onClick={unlockScreen}>unlock</button>
        </div>
      </div>
    );
  };

  return (
    <LockScreen
      className='lock'
      timeout={lockTimer}
      ui={getLockScreenUi}
      onScreenLocked={() => setIsLockedScreen(true)}
      onScreenUnlocked={() => setIsLockedScreen(false)}
    >
      {isLockedScreen ?
        <div className='lockedScreen'>
          <img src={locked} alt='locked' />
        </div>
        :
        <div className='home'>
          <div className="container">
            <Sidebar />
            {isRegisterUserOpen ? <Visitors /> : <Chat />}
          </div>
        </div>
      }
    </LockScreen>
  )
};

export default Home