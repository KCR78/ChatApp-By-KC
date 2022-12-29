import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {

  const { data,
    messages, setMessages,
    unReadMsgUserIds, setUnReadMsgUserIds,
    isScrollToBottom, setIsScrollToBottom
  } = useContext(ChatContext);

  const scrollToBottom = () => {
    // console.log('scrollToBottom');
    var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
    setIsScrollToBottom(true);
  };

  const actionDown = useCallback(() => {
    // console.log('Scroll/Touch - Down');
    const objDiv = document.getElementById("messages");
    const scrl = Math.floor(objDiv.scrollHeight - objDiv.scrollTop);
    const hght = objDiv.clientHeight;
    const diff = Math.abs(hght - scrl);

    if (diff <= 10) {
      // console.log("Bottom");
      setIsScrollToBottom(true);
    }
  }, [setIsScrollToBottom]);

  const actionUp = useCallback(() => {
    // console.log('Scroll/Touch - Up');
    const objDiv = document.getElementById("messages");
    if (objDiv.scrollHeight === objDiv.clientHeight) setIsScrollToBottom(true);
    else setIsScrollToBottom(false);
  }, [setIsScrollToBottom]);


  useEffect(() => {
    window.onwheel = e => {
      if (e.deltaY >= 0) actionDown();
      else actionUp();
    }
  }, [actionDown, actionUp]);

  const [touchStartPosX, setTouchStartPosX] = useState(0);

  const touchMoveActions = (event) => {
    const currentPageX = Math.round(event.changedTouches[0].screenY);

    if (touchStartPosX === currentPageX) return;

    if (touchStartPosX - currentPageX > 0) actionDown();
    else actionUp();

    setTouchStartPosX(currentPageX)
  };

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
      setUnReadMsgUserIds(unReadMsgUserIds.filter(item => item !== data.chatId));
    });

    return () => {
      unSub();
    };
  }, [data.chatId, setMessages, unReadMsgUserIds, setUnReadMsgUserIds]);

  return (
    <div className="messages" id="messages" onTouchMove={touchMoveActions}>
      {messages?.map((m, i) => (
        <Message message={m} chatId={data.chatId} key={i} />
      ))}
      <label>
        <span
          className="material-icons scrollToBottom"
          onClick={scrollToBottom}
          style={{ "display": `${isScrollToBottom ? "none" : "block"}` }}
        >
          keyboard_double_arrow_down
        </span>
      </label>
    </div>
  );
};

export default Messages;