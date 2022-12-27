import React, { useContext } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {

  const { data, dispatch } = useContext(ChatContext);

  const handleRemove = () => {
    dispatch({ type: "REMOVE_USER", payload: null });
  };

  return (
    <div className={window.innerWidth > 480 ? 'chat' : data.chatId === 'null' ? 'chat widthZero' : 'chat widthFull'}>

      {data.chatId === 'null' ?
        <div className="demoInfo">
          <h1>ChatApp</h1>
          <p>Choose a chat to start conversation</p>
        </div>
        :
        <>
          <div className="chatInfo">
            <span>
              <div className='chatBack'><span className="material-icons" onClick={handleRemove}>arrow_back</span></div>
              <img src={data.user.photoURL} alt="" className="userImage" />
              {data.user?.displayName}
            </span>
            <div className="chatIcons">
              {/* <img src={Cam} alt="" /> */}
              {/* <img src={Add} alt="" /> */}
              {/* <img src={More} alt="" /> */}
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
