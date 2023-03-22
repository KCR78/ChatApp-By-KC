import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { useState } from "react";
// import CryptoJS from 'crypto-js';
import { dataDecrypt } from "./dataEncryptDcrypt";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import thumbnail from '../img/thumbnail.jpg';

const Message = ({ message, chatId }) => {

  const { currentUser } = useContext(AuthContext);
  const { data, chats, isScrollToBottom } = useContext(ChatContext);

  const [msg, setMsg] = useState('');
  const [msgIds, setMsgIds] = useState([]);
  const ref = useRef();

  const imageDecrypt = (imgData, elemId) => {
    if (!msgIds.includes(elemId)) {
      const elem = document.getElementById(elemId);

      fetch(imgData)
        .then((r) => {
          r.text()
            .then(d => {
              elem.src = dataDecrypt(d, chatId);
              msgIds.push(elemId);
              setMsgIds(v => v);
            })
            .catch(e => console.log(e))
        })
        .catch(err => console.log(err));
    };
  };

  useEffect(() => {
    if (isScrollToBottom) {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isScrollToBottom]);

  useEffect(() => {
    // var bytes = CryptoJS.AES.decrypt(message.text, chatId);
    // var data = bytes.toString(CryptoJS.enc.Utf8);
    // setMsg(data === '' ? '' : JSON.parse(data).text);

    const data = dataDecrypt(message.text, chatId);
    setMsg(data === '' ? '' : data);
  }, [message, chatId]);

  useEffect(() => {

    if (chats[chatId] && chats[chatId].unReadMsgIds && chats[chatId].unReadMsgIds.length > 0) {
      if (chats[chatId].unReadMsgIds.includes(message.id)) {
        const tempArr = chats[chatId].unReadMsgIds.filter(item => item !== message.id);
        updateDoc(doc(db, "userChats", currentUser.uid), {
          [chatId + ".unReadMsgIds"]: tempArr
        });
      }
    }
  }, [chats, chatId, message, currentUser]);

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user.photoURL
          }
          alt=""
        />
        {/* <span>just now</span> */}
      </div>
      <div className="messageContent">
        {msg !== '' && <p>{msg}</p>}
        {message.img &&
          <img
            src={thumbnail}
            alt=""
            id={message.id}
            className="pointer"
            onClick={() => imageDecrypt(message.img, message.id)}
          />
        }
      </div>
    </div>
  );
};

export default Message;