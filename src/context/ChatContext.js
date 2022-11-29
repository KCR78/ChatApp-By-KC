import {
  createContext,
  useContext,
  useReducer,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {

  const [newChats, setnewChats] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const INITIAL_STATE = {
    chatId: "null",
    user: {},
  };

  const chatReducer = (state, action) => {
    // console.log(state, action);
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

  const getAllUsers = async () => {
    console.log('here');
    setnewChats([]);
    const q = query(collection(db, "users"));

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        newChats.push(doc.data());
        console.log(doc.data());
        setnewChats(v => v);
      });
    } catch (err) {
      console.log(err);
    }
  };


  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch, newChats, setnewChats, getAllUsers }}>
      {children}
    </ChatContext.Provider>
  );
};
