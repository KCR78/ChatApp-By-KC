import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {

  const { data, messages, setMessages, unReadMsgUserIds, setUnReadMsgUserIds } = useContext(ChatContext);

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
    <div className="messages">
      {messages?.map((m) => (
        <Message message={m} chatId={data.chatId} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
