import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { dataDecrypt } from "./dataEncryptDcrypt";

const Message = ({ message, chatId }) => {

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

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
        {dataDecrypt(message.text, chatId) !== '' && <p>{dataDecrypt(message.text, chatId)}</p>}
        {message.img && <img src={dataDecrypt(message.img, chatId)} alt="" />}
      </div>
    </div>
  );
};

export default Message;