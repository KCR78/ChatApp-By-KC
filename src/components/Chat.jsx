import React, { useContext } from "react";
import Cancel from "../img/cancel.png";
import usr from "../img/user.png";
// import Cam from "../img/cam.png";
// import Add from "../img/add.png";
// import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {

  const { data, dispatch } = useContext(ChatContext);

  const handleRemove = () => {
    dispatch({ type: "REMOVE_USER", payload: null });
  };

  return (
    <div className="chat">

      {data.chatId === 'null' ?
        <div className="demoInfo">
          <h1>ChatApp</h1>
          <p>Choose a chat to start conversation</p>
        </div>
        :
        <>
          <div className="chatInfo">
            <span>
              <img src={data.user.photoURL ? data.user.photoURL : usr} alt="" className="userImage" />
              {data.user?.displayName}
            </span>
            <div className="chatIcons">
              {/* <img src={Cam} alt="" /> */}
              {/* <img src={Add} alt="" /> */}
              {/* <img src={More} alt="" /> */}
              <img src={Cancel} alt="" onClick={handleRemove} />
            </div>
          </div>
          <Messages />
          <Input />
        </>
      }
    </div>
  );
};

export default Chat;
