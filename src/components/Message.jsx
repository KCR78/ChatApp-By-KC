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
  const ref = useRef();

  const imageDecrypt = (imgData, elemId) => {

    const loaderImg = document.getElementById(`loader_span_${elemId}`);
    const loadBtn = document.getElementById(`load_btn_${elemId}`);

    loadBtn.style.display = 'none';
    loaderImg.style.display = 'flex';

    const elem = document.getElementById(elemId);

    fetch(imgData)
      .then((r) => {
        r.text()
          .then(d => {
            elem.src = dataDecrypt(d, chatId);
            loaderImg.style.display = 'none';
          })
          .catch(e => console.log(e))
      })
      .catch(err => console.log(err));
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
          <div className="imgBox">
            <img
              src={thumbnail}
              alt=""
              id={message.id}
            />
            <div className="loaderBox">
              <span id={`loader_span_${message.id}`} className="loader_span">
                <div className="loader"></div>
              </span>
              <button
                type="button"
                id={`load_btn_${message.id}`}
                className="load_btn pointer"
                onClick={() => imageDecrypt(message.img, message.id)}
              >
                <span className="material-icons">refresh</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default Message;