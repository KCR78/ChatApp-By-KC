import { createContext, useEffect, useState } from "react";
import { auth, db, messaging } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getToken } from "firebase/messaging";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log(currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      console.log(user);
      let noUserExist = false;

      if (user) {

        const q = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );

        try {
          console.log('here');
          const querySnapshot = await getDocs(q);
          console.log(querySnapshot);
          querySnapshot.forEach((doc) => {
            console.log(doc.data());
            if (doc.data()) noUserExist = true;
          });
        } catch (err) {
          console.log(err);
        }

        if (noUserExist) console.log('Available..');
        else {
          console.log('Not Available...');

          //create user on firestore
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          });

          //create empty user chats on firestore
          await setDoc(doc(db, "userChats", user.uid), {});

          console.log('Tables Created for the user.');
        }

        getToken(messaging, { vapidKey: 'BG9avsAhLPsY9k2b0FZpTCwcsWEkT3lqSkAyL2k6Duo94BnxEXMkoD0kzrLsZwz7dKSP6jq0MBsppDmnukwO9RY' }).then((currentToken) => {
          if (currentToken) {
            user['token_id'] = currentToken;
            setCurrentUser(user);

            setDoc(doc(db, "fcmTokens", user.uid), {
              token_id: currentToken
            });

          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
      } else {
        console.log('No Token');
      }
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
