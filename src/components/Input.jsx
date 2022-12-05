import React, { useContext, useState } from "react";
import Img from "../img/img.png";
// import Attach from "../img/attach.png";
import Cancel from "../img/cancel.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { dataEncrypt } from "./dataEncryptDcrypt";


const Input = () => {

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imgToggle, setImgToggle] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);


  const pushNotification = (token, textContent) => {

    let body = {
      to: token,
      notification: {
        title: `Message from ${currentUser.displayName}`,
        body: textContent,
        click_action: 'https://fcm.googleapis.com/fcm/send'
      }
    };

    let options = {
      method: 'POST',
      headers: new Headers({
        Authorization: 'key=AAAARNFqDq0:APA91bGELvxn2jUWXM6-S73Qss519Hx_OYKJ_GriuPUWyLQS1IfWR1eErkVmt9p5LN1dK_BPsMvS1551qaEajSgQGjzjSDd8CS5sgtk-CY25-hvAjVbcIF_POLsyd0GQSlXq-WYUn-fc',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body)
    }

    fetch('https://fcm.googleapis.com/fcm/send', options).then().catch(e => console.log(e));
  };

  const updtDocs = async (textContent) => {
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text: dataEncrypt(textContent, data.chatId),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text: dataEncrypt(textContent, data.chatId),
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
  };

  const handleSend = async () => {

    const result = await getDoc(doc(db, "fcmTokens", data.user.uid));
    // This registration token comes from the client FCM SDKs.
    const regdToken = result.data().token_id;


    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        (error) => {
          //TODO:Handle Error
          console.log(error);
          console.log(error.response);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {

            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text: dataEncrypt(text, data.chatId),
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });

            pushNotification(regdToken, text === '' ? 'Image' : text.substring(0, 30));
            updtDocs(text !== '' ? text.substring(0, 20) : 'Image');
          });
        }
      );
    } else {
      if (text.trim() !== '') {

        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text: dataEncrypt(text, data.chatId),
            senderId: currentUser.uid,
            date: Timestamp.now(),
          }),
        });

        pushNotification(regdToken, text.substring(0, 30));
        updtDocs(text !== '' ? text.substring(0, 20) : 'Image');

      }
    };

    setText("");
    setImg(null);
    setImgToggle(false);
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send">
        {/* <img src={Attach} alt="" /> */}
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => { setImg(e.target.files[0]); setImgToggle(true); }}
        />
        {imgToggle ?
          <div className="imageBox" onClick={() => { setImg(null); setImgToggle(false); }}>
            <label>1Img</label>
            <img src={Cancel} alt="" />
          </div>
          :
          <label htmlFor="file">
            <img src={Img} alt="" />
          </label>
        }
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Input;
