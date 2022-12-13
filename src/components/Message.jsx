import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import usr from '../img/user.png'
import { useState } from "react";
// import CryptoJS from 'crypto-js';
import { dataDecrypt } from "./dataEncryptDcrypt";

const Message = ({ message, chatId }) => {

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const [msg, setMsg] = useState('');
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  useEffect(() => {
    // var bytes = CryptoJS.AES.decrypt(message.text, chatId);
    // var data = bytes.toString(CryptoJS.enc.Utf8);
    // setMsg(data === '' ? '' : JSON.parse(data).text);

    const data = dataDecrypt(message.text, chatId);
    setMsg(data === '' ? '' : data);
  }, [message, chatId]);

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL ? currentUser.photoURL : usr
              : data.user.photoURL ? data.user.photoURL : usr
          }
          alt=""
        />
        {/* <span>just now</span> */}
      </div>
      <div className="messageContent">
        {msg !== '' && <p>{msg}</p>}
        {message.img && <img src={message.img} alt="" />}
      </div>
    </div>
  );
};

export default Message;