import { createContext, useEffect, useState } from "react";
import { auth, db, messaging } from "../firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getToken } from "firebase/messaging";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState({});
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    console.log('Loging in...');
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      let isProceed = false;
      let noUserExist = true;
      let isUserAdmin = null;


      const initial = async () => {

        if (noUserExist) {
          console.log('User Tables dont exists, Creating tables......');

          //Update profile
          if (!user.displayName) {
            await updateProfile(user, {
              displayName: user.email.slice(0, user.email.indexOf('@')),
            });
          }

          //create user on firestore
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName ? user.displayName : user.email.slice(0, user.email.indexOf('@')),
            email: user.email,
            photoURL: user.photoURL,
            isAdmin: isUserAdmin
          });

          //create empty user chats on firestore
          await setDoc(doc(db, "userChats", user.uid), {});

          console.log('Tables Created for the User.');
        }

        console.log('Creating Token......');
        getToken(messaging, { vapidKey: process.env.REACT_APP_VAPID_KEY }).then((currentToken) => {
          if (currentToken) {
            user['token_id'] = currentToken;
            user['isAdmin'] = isUserAdmin;
            setCurrentUser(user);
            setIsAdminView(isUserAdmin);

            setDoc(doc(db, "fcmTokens", user.uid), {
              token_id: currentToken
            });

            console.log('Token Created.');

          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });

      };


      if (user) {

        const q = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );

        try {
          console.log('Searching for user in table......');
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const usr = doc.data();
            if (usr) {
              console.log('User Exist.');
              noUserExist = false;
            }
          });
        } catch (err) {
          console.log(err);
        }


        const adminQry = query(collection(db, "admin"));

        // check Visitor Email Ids
        try {
          console.log('Checking for Admin ID......');
          const querySnapshot = await getDocs(adminQry);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email === user.email) {
              console.log('Matched... Its a Admin.');
              isUserAdmin = true;
              isProceed = true;
            }
          });
        } catch (err) {
          console.log(err);
        }

        if (isUserAdmin && isProceed) {
          console.log('Proceed for Admin...');
          initial();
        }

        else {

          console.log('Not a Admin.');

          const vstrQry = query(
            collection(db, "visitors"),
            where("email", "==", user.email)
          );

          // check Visitor Email Ids
          try {
            console.log('Checking for Visitors Ids......');
            const querySnapshot = await getDocs(vstrQry);
            querySnapshot.forEach((doc) => {
              const usr = doc.data();
              if (usr) {
                console.log('Its a Visitor.');
                isProceed = true;
              }
            });
          } catch (err) {
            console.log(err);
          }

          if (!isUserAdmin && isProceed) {
            console.log('Proceed for Visitor...');
            initial();
          }
        }

        if (!isUserAdmin && !isProceed) {
          console.log('Unknown User... You are not allowed to proceed.');
          signOut(auth);
        }

      } else {
        console.log('No User');
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
