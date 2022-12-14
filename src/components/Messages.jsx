import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {

  const { data, messages, setMessages } = useContext(ChatContext);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [data.chatId, setMessages]);

  return (
    <div className="messages">
      {messages?.map((m) => (
        <Message message={m} chatId={data.chatId} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
