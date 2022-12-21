import React, { useContext } from "react";
import Navbar from "./Navbar"
import Search from "./Search"
import Chats from "./Chats"
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Sidebar = () => {

  const { isAdminView } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  return (
    <div className={window.innerWidth > 480 ? 'sidebar' : data.chatId === 'null' ? 'sidebar widthFull' : 'sidebar widthZero'}>
      <Navbar />
      {isAdminView && <Search />}
      <Chats />
    </div>
  );
};

export default Sidebar;
