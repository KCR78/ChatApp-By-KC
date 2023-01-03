import {
  createContext,
  useContext,
  useReducer,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {

  const [newChats, setNewChats] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [isRegisterUserOpen, setIsRegisterUserOpen] = useState(false);
  const [isSelectImg, setIsSelectImg] = useState(false);
  const [isLoadingMsg, setIsLoadingMsg] = useState(false);


  // Notification constants
  const [unReadMsgUserIds, setUnReadMsgUserIds] = useState([]);
  const [unReadMsgCount, setUnReadMsgCount] = useState(0);
  const [unReadCount, setUnReadCount] = useState(0);


  const { currentUser } = useContext(AuthContext);

  const INITIAL_STATE = {
    chatId: "null",
    user: {},
  };

  const chatReducer = (state, action) => {

    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId:
            currentUser.uid > action.payload.uid
              ? currentUser.uid + action.payload.uid
              : action.payload.uid + currentUser.uid,
        };

      case "REMOVE_USER":
        return {
          chatId: "null",
          user: {}
        };

      default:
        return state;
    }
  };


  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{
      data: state, dispatch,
      isRegisterUserOpen, setIsRegisterUserOpen,
      chats, setChats,
      newChats, setNewChats,
      messages, setMessages,
      unReadMsgCount, setUnReadMsgCount,
      unReadMsgUserIds, setUnReadMsgUserIds,
      unReadCount, setUnReadCount,
      isScrollToBottom, setIsScrollToBottom,
      isSelectImg, setIsSelectImg,
      isLoadingMsg, setIsLoadingMsg
    }}>
      {children}
    </ChatContext.Provider>
  );
};
