import { createContext, useEffect, useState } from "react";
import { auth, db, messaging } from "../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getToken } from "firebase/messaging";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState({});
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      let noUserExist = false;
      let isUserAdmin = null;

      if (user) {

        const q = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );

        try {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const usr = doc.data();
            if (usr) {
              noUserExist = true;
              isUserAdmin = usr.isAdmin;
            }
          });
        } catch (err) {
          console.log(err);
        }

        if (noUserExist) console.log('User Available..');
        else {
          console.log('User Not Available...');

          //Update profile
          await updateProfile(user, {
            displayName: user.displayName ? user.displayName : user.email.slice(0, user.email.indexOf('@')),
            isAdmin: false
          });

          //create user on firestore
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName ? user.displayName : user.email.slice(0, user.email.indexOf('@')),
            email: user.email,
            photoURL: user.photoURL,
            isAdmin: false
          });

          //create empty user chats on firestore
          await setDoc(doc(db, "userChats", user.uid), {});

          console.log('Tables Created for the user.');
        }

        getToken(messaging, { vapidKey: 'BG9avsAhLPsY9k2b0FZpTCwcsWEkT3lqSkAyL2k6Duo94BnxEXMkoD0kzrLsZwz7dKSP6jq0MBsppDmnukwO9RY' }).then((currentToken) => {
          if (currentToken) {
            user['token_id'] = currentToken;
            user['isAdmin'] = isUserAdmin;
            setCurrentUser(user);
            setIsAdminView(isUserAdmin);

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
    <AuthContext.Provider value={{ currentUser, isAdminView }}>
      {children}
    </AuthContext.Provider>
  );
};
