import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import { ChatContext } from '../context/ChatContext';
import Visitors from './Visitors';
import { useEffect } from 'react';
import LockScreen from "react-lock-screen";
import { useState } from 'react';
import locked from '../img/locked.jpg';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';

const Home = () => {

  const { data, isRegisterUserOpen,
    unReadMsgCount, setUnReadMsgCount,
    unReadMsgUserIds, setUnReadMsgUserIds,
    unReadCount, setUnReadCount,
  } = useContext(ChatContext);
  const { currentUser, isAdminView } = useContext(AuthContext);

  const EnvLockTime = 100;

  const [passKey, setPassKey] = useState('');
  const [isLockedScreen, setIsLockedScreen] = useState(true);
  const [lockTimer, setLockTimer] = useState(EnvLockTime * 1000);
  const [err, setErr] = useState();

  useEffect(() => { setIsLockedScreen(true); setLockTimer(0); }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        // console.log("Browser tab is hidden");
        setIsLockedScreen(true);
        setLockTimer(0);
      } else {
        // console.log("Browser tab is visible");
      }
    });
  }, []);

  const getLockScreenUi = setLock => {

    const unlockScreen = async () => {
      setErr();

      const pinQry = query(
        collection(db, isAdminView ? "admin" : "visitors"),
        where("email", "==", currentUser.email)
      );

      try {
        console.log('Checking for Pincode......');
        const querySnapshot = await getDocs(pinQry);
        querySnapshot.forEach((doc) => {
          const visr = doc.data();
          if (visr && visr.pin === passKey) {
            console.log('Correct Pin.');
            setLock(false);
            setIsLockedScreen(false);
            setLockTimer(EnvLockTime * 1000);
            setPassKey('');
          } else {
            console.log('Incorrect Pin.');
            setErr('Incorrect Pin');
          }
        });
      } catch (err) {
        console.log(err);
      }

    };

    return (
      <div className='locker'>
        <div className="react-lock-screen__ui">
          <div className="pinBox">
            <input
              name="token"
              type='password'
              maxLength='6'
              autoFocus
              autoComplete='off'
              onKeyPress={(e) => e.key === "Enter" && unlockScreen()}
              onChange={(e) => setPassKey(e.target.value)}
            />
          </div>

          <button onClick={unlockScreen}>unlock</button>
          {err && <p className='text-white'>{err}</p>}
        </div>
      </div>
    );
  };


  useEffect(() => {
    if (unReadMsgCount > unReadCount) {
      console.log("**** NOTIFICATION ****");

      if (isLockedScreen) { console.log('Locked'); alert("**** NOTIFICATION ****"); }

      else if (!isLockedScreen && data.chatId === 'null') { console.log('UnLocked And Null User'); alert("**** NOTIFICATION ****"); }
      else if (!isLockedScreen && data.chatId !== 'null' && unReadMsgUserIds.filter(item => item !== data.chatId).length > 0) {
        console.log('UnLocked and Active USER');
        alert("**** NOTIFICATION ****");
      }

    };
    setUnReadCount(unReadMsgCount);
  }, [data, isLockedScreen, unReadMsgCount, unReadCount, unReadMsgUserIds, setUnReadCount, setUnReadMsgCount, setUnReadMsgUserIds]);


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