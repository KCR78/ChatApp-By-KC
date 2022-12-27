import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
// import CryptoJS from 'crypto-js';
import { dataDecrypt } from "./dataEncryptDcrypt";

const Chats = () => {

  const [newChatToggle, setNewChatToggle] = useState(false);

  const { currentUser, isAdminView } = useContext(AuthContext);
  const { data, dispatch,
    setIsRegisterUserOpen,
    chats, setChats,
    newChats, setNewChats,
    setMessages,
    unReadMsgCount, setUnReadMsgCount,
    unReadMsgUserIds, setUnReadMsgUserIds,
  } = useContext(ChatContext);


  const decr = (msg, key) => {
    // var bytes = CryptoJS.AES.decrypt(msg, key);
    // var data = bytes.toString(CryptoJS.enc.Utf8);
    // return data === '' ? '' : JSON.parse(data).text;

    const data = dataDecrypt(msg, key);
    return data === '' ? '' : data;
  };


  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());

        const chts = doc.data();
        let count = 0;
        const temp = unReadMsgUserIds;

        Object.entries(chts)?.forEach((chat, i) => {
          if (chat[0] !== data.chatId && chat[1].unReadMsgIds && chat[1].unReadMsgIds.length > 0) {
            count += chat[1].unReadMsgIds.length;

            // set unique unRead Msg User Ids to array.
            temp.push(chat[0]);
            let unique = [...new Set(temp)];
            setUnReadMsgUserIds(unique);
          };
        });

        setUnReadMsgCount(count);

      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid, data.chatId, setChats, setUnReadMsgCount, setUnReadMsgUserIds, unReadMsgCount, unReadMsgUserIds]);

  useEffect(() => {
    const getAllUsers = async () => {

      const q = query(collection(db, "users"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });
        setNewChats(data);
      });

      return () => {
        unsubscribe();
      };
    };

    getAllUsers();
  }, [setNewChats]);

  const handleSelect = (u) => {
    if (data && data.user.uid !== u.uid) {
      setMessages([]);
      setIsRegisterUserOpen(false);
      dispatch({ type: "CHANGE_USER", payload: u });
    };
  };

  const selectNewChat = async (data) => {
    //check whether the group(chats in firestore) exists, if not create

    const combinedId =
      currentUser.uid > data.uid
        ? currentUser.uid + data.uid
        : data.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: data.uid,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
        setNewChatToggle(false);
      }
    } catch (err) {
      console.log(err);
    }

    handleSelect(data);
    setNewChatToggle(false);
  };

  return (
    <div className="chats">

      {!newChatToggle ?
        <div className={`allChats ${isAdminView ? 'adminTop' : 'userTop'}`} >
          {
            typeof chats === 'object' && Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map((chat) =>
              <div
                className={`userChat ${chat[0] === data.chatId && 'activeChat'}`}
                key={chat[0]}
                onClick={() => handleSelect(chat[1].userInfo)}
              >
                <img src={chat[1].userInfo?.photoURL} alt="" />
                <div className="userChatInfo">
                  <div>{chat[1].userInfo?.displayName}</div>
                  <p>{chat[1].lastMessage && decr(chat[1].lastMessage.text, chat[0])}</p>
                </div>
                {chat[1].unReadMsgIds && chat[1].unReadMsgIds.length > 0 &&
                  <span className="unReadCount">
                    {chat[1].unReadMsgIds.length}
                  </span>
                }
              </div>
            )
          }
        </div>
        :
        <div className="users">
          <div className="heading">
            <p>All Users</p>
            <span className="material-icons close" onClick={() => setNewChatToggle(false)}>close</span>
          </div>

          {newChats.length > 1 ?
            <div className="userBox">
              {newChats.map(item =>
                item.uid !== currentUser.uid &&
                <div className="user" onClick={() => selectNewChat(item)} key={item.uid}>
                  <img src={item.photoURL} alt="" />
                  <p key={item.uid}>{item?.displayName}</p>
                </div>
              )}
            </div>
            :
            <p className="noUser">-- No Users Found -- </p>
          }
        </div>
      }

      {isAdminView &&
        <div className="newChats">
          <span className="material-icons add-chats" title="Add New Charts" onClick={() => setNewChatToggle(true)}>chat</span>
          <span className="material-icons add-users" title="Add New Visitors"
            onClick={() => {
              setIsRegisterUserOpen(true);
              dispatch({ type: "REMOVE_USER", payload: null });
            }}
          >
            person_add
          </span>
        </div>
      }

    </div >
  );
};

export default Chats;
