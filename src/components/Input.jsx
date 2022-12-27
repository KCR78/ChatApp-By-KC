import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  // getDoc,
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


  // const pushNotification = (token) => {

  //   if (token) {
  //     let body = {
  //       to: token,
  //       notification: {
  //         title: `You have one message.`,
  //         click_action: 'https://fcm.googleapis.com/fcm/send'
  //       }
  //     };

  //     let options = {
  //       method: 'POST',
  //       headers: new Headers({
  //         Authorization: 'key=AAAARNFqDq0:APA91bGELvxn2jUWXM6-S73Qss519Hx_OYKJ_GriuPUWyLQS1IfWR1eErkVmt9p5LN1dK_BPsMvS1551qaEajSgQGjzjSDd8CS5sgtk-CY25-hvAjVbcIF_POLsyd0GQSlXq-WYUn-fc',
  //         'Content-Type': 'application/json',
  //       }),
  //       body: JSON.stringify(body)
  //     }

  //     fetch('https://fcm.googleapis.com/fcm/send', options).then().catch(e => console.log(e));

  //   } else console.log('Token not found. Push notification cannot be send.');
  // };

  const updtDocs = async (textContent, ids) => {
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
      [data.chatId + ".unReadMsgIds"]: arrayUnion(ids)
    });
  };

  const handleSend = async () => {
    const textContent = text;
    const imgData = img;

    setImg(null);
    setImgToggle(false);
    setText("");

    // const result = await getDoc(doc(db, "fcmTokens", data.user.uid));
    // This registration token comes from the client FCM SDKs.
    // const regdToken = result.data() ? result.data().token_id : null;
    const ids = uuid();

    if (imgData) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, imgData);
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
                id: ids,
                text: dataEncrypt(textContent, data.chatId),
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });

            // pushNotification(regdToken);
            updtDocs(textContent !== '' ? textContent.substring(0, 20) : 'Image', ids);
          });
        }
      );
    } else {
      if (textContent.trim() !== '') {

        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: ids,
            text: dataEncrypt(textContent, data.chatId),
            senderId: currentUser.uid,
            date: Timestamp.now(),
          }),
        });

        // pushNotification(regdToken);
        updtDocs(textContent !== '' ? textContent.substring(0, 20) : 'Image', ids);
      }
    };
  };

  return (
    <div className="input">
      <div className="inputField">
        <input
          className="textInput"
          type="text"
          placeholder="Type something..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        <input
          className="fileInput"
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => { setImg(e.target.files[0]); setImgToggle(true); }}
        />
        {imgToggle ?
          <div className="imageBox" onClick={() => { setImg(null); setImgToggle(false); }}>
            <label>1Img</label>
            <span className="material-icons cancelImg">cancel</span>
          </div>
          :
          <label htmlFor="file">
            <span className="material-icons addImg">add_photo_alternate</span>
          </label>
        }
      </div>
      <div className="send">
        {/* <img src={Attach} alt="" /> */}
        <button onClick={handleSend}>
          <span className="material-icons send">send</span>
        </button>
      </div>
    </div>
  );
};

export default Input;
