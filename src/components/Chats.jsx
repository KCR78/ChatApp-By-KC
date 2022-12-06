import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import add from "../img/add.png";
import addChats from "../img/add-chats.png";
import cancel from "../img/cancel.png";
import { dataDecrypt } from "./dataEncryptDcrypt";

const Chats = () => {

  const [chats, setChats] = useState([]);
  const [newChats, setNewChats] = useState([]);
  const [newChatToggle, setNewChatToggle] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data, dispatch, setIsRegisterUserOpen } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

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
  }, []);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
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
            displayName: data.displayName,
            photoURL: data.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
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

      <div className="allChats">
        {typeof chats === 'object' && Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map((chat) =>
          <div
            className={`userChat ${chat[0] === data.chatId && 'activeChat'}`}
            key={chat[0]}
            onClick={() => handleSelect(chat[1].userInfo)}
          >
            <img src={chat[1].userInfo.photoURL} alt="" />
            <div className="userChatInfo">
              <span>{chat[1].userInfo.displayName}</span>
              {/* <p>{chat[1].lastMessage && dataDecrypt(chat[1].lastMessage.text, chat[0])}</p> */}
            </div>
          </div>
        )}
      </div>
      <div className="newChats">

        <img src={addChats} onClick={() => setNewChatToggle(true)} className='add-chats' alt="" title="Add New Charts" />
        <img src={add} onClick={() => setIsRegisterUserOpen(true)} className='add-users' alt="" title="Register New User" />

        {newChatToggle && <div className="users">
          <div className="heading">
            <p>All Users</p>
            <img src={cancel} onClick={() => setNewChatToggle(false)} alt="" />
          </div>

          {newChats.length > 1 ?
            <div className="userBox">
              {newChats.map(item =>
                item.uid !== currentUser.uid &&
                <div className="user" onClick={() => selectNewChat(item)} key={item.uid}>
                  <img src={item.photoURL} alt="" />
                  <p key={item.uid}>{item.displayName}</p>
                </div>
              )}
            </div>
            :
            <p className="noUser">-- No Users Found -- </p>
          }
        </div>
        }
      </div>
    </div>
  );
};

export default Chats;
