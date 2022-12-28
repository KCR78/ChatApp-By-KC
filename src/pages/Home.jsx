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
import { useCallback } from 'react';
import OtpInput from 'react18-input-otp';

const Home = () => {

  const { data, isRegisterUserOpen,
    unReadMsgCount, setUnReadMsgCount,
    unReadMsgUserIds, setUnReadMsgUserIds,
    unReadCount, setUnReadCount,
  } = useContext(ChatContext);
  const { currentUser, isAdminView } = useContext(AuthContext);

  const EnvLockTime = 10000;

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
          <OtpInput
            containerStyle='pinput'
            value={passKey}
            onChange={(data) => setPassKey(data)}
            isInputSecure
            isInputNum
            shouldAutoFocus={true}
            numInputs={6}
          />
          <button onClick={unlockScreen}>unlock</button>
          {err && <p className='text-white'>{err}</p>}
        </div>
      </div>
    );
  };

  const showPushNotification = useCallback(() => {

    navigator.serviceWorker.register('firebase-messaging-sw.js');

    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      // const notification = new Notification("You have one message!");
      // notification.onclick = function () {
      //   window.parent.focus();
      //   notification.close();
      // };

      navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification("You have one new message!", {
          icon: '/chatapp.png',
          vibrate: [300, 100, 400, 100, 300, 100, 400]
        });
        // const notification = registration.showNotification('You have one message!');
        // notification.onclick = function () {
        //   window.parent.focus();
        //   notification.close();
        // };
      });


    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") showPushNotification();
      });
    };
  }, []);


  useEffect(() => {
    if (unReadMsgCount > unReadCount) {
      console.log("**** NOTIFICATION ****");

      if (isLockedScreen) { console.log('Locked'); showPushNotification(); }

      else if (!isLockedScreen && data.chatId === 'null') { console.log('UnLocked And Null User'); showPushNotification(); }
      else if (!isLockedScreen && data.chatId !== 'null' && unReadMsgUserIds.filter(item => item !== data.chatId).length > 0) {
        console.log('UnLocked and Active USER');
        showPushNotification();
      }

    };
    setUnReadCount(unReadMsgCount);
  }, [data, isLockedScreen, unReadMsgCount, unReadCount, unReadMsgUserIds, setUnReadCount, setUnReadMsgCount, setUnReadMsgUserIds, showPushNotification]);


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
            {isRegisterUserOpen ? <Visitors />
              :
              <>
                <Sidebar />
                <Chat />
              </>
            }
          </div>
        </div>
      }
    </LockScreen>
  )
};

export default Home