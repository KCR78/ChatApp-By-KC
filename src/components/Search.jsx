import React, { useContext, useState } from "react";
import { collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import usr from '../img/user.png'

const Search = () => {

  const [user, setUser] = useState([]);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const handleSearch = async (name) => {

    const q = query(
      collection(db, "users"),
      where("displayName", "==", name)
    );

    try {
      setUser([]);
      setErr(false);
      const querySnapshot = await getDocs(q);
      const arr = [];
      querySnapshot.forEach((doc) => {
        const usr = doc.data();
        if (currentUser.uid !== usr.uid) {
          arr.push(usr);
        }
      });
      setUser(arr);
    } catch (err) {
      setErr(true);
    }
  };

  const handleSelect = async (data) => {

    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > data.uid
        ? currentUser.uid + data.uid
        : data.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: data.uid,
            displayName: data.displayName,
            photoURL: data.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", data.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }

      dispatch({ type: "CHANGE_USER", payload: data });
    } catch (err) {
      console.log(err);
    }

    setUser(null);
  };

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      {err && <span>User not found!</span>}
      {user && user.length > 0 && user.map(item =>
        <div className="userChat search_result" onClick={() => handleSelect(item)}>
          <img src={item.photoURL ? item.photoURL : usr} alt="" />
          <div className="userChatInfo">
            <span>{item?.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;