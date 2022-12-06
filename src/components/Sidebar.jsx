import React, { useContext } from "react";
import Navbar from "./Navbar"
import Search from "./Search"
import Chats from "./Chats"
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {

  const { isAdminView } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <Navbar />
      {isAdminView && <Search />}
      <Chats />
    </div>
  );
};

export default Sidebar;
