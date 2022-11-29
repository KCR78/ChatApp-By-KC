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


const Input = () => {

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imgToggle, setImgToggle] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {

    console.log(currentUser);
    console.log(data);

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
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      if (text.trim() !== '') {

        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
          }),
        });
      }
    };

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text !== '' ? text : 'Image',
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text !== '' ? text : 'Image',
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    const result = await getDoc(doc(db, "fcmTokens", data.user.uid));
    console.log(result.data().token_id);

    // This registration token comes from the client FCM SDKs.
    const regdToken = result.data().token_id;

    let body = {
      to: regdToken,
      notification: {
        title: `Message from ${data.user.displayName}`,
        body: text.substring(0, 30),
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

    fetch('https://fcm.googleapis.com/fcm/send', options).then(res => {
      console.log(res);
    }).catch(e => console.log(e))

    setText("");
    setImg(null);
    setImgToggle(false);
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
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
