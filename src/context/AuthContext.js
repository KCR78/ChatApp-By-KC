import { createContext, useEffect, useState } from "react";
import { auth, db, messaging } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log(currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log(user);

      if (user) {
        if (!isLoggedIn) {
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
          console.log('Registering User by Admin');
        }
      } else {
        console.log('No Token');
        setIsLoggedIn(false);
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
