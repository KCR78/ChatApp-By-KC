import React, { useContext, useState } from "react";
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
  const { data, setIsSelectImg, setIsLoadingMsg } = useContext(ChatContext);


  const pushNotification = (token) => {

    if (token) {
      let body = {
        to: token,
        notification: {
          title: `You have one message.`,
          click_action: 'https://fcm.googleapis.com/fcm/send'
        }
      };

      let options = {
        method: 'POST',
        headers: new Headers({
          Authorization: `key=${process.env.REACT_APP_SERVER_KEY}`,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(body)
      }

      fetch('https://fcm.googleapis.com/fcm/send', options).then(e => console.log('Push notification send.')).catch(e => console.log(e));

    } else console.log('Token not found. Push notification cannot be send.');
  };

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
    setIsLoadingMsg(true);
    const textContent = text;
    const imgData = img;

    setImg(null);
    setImgToggle(false);
    setText("");

    const result = await getDoc(doc(db, "fcmTokens", data.user.uid));
    // This registration token comes from the client FCM SDKs.
    const regdToken = result.data() ? result.data().token_id : null;
    const ids = uuid();

    if (imgData) {
      // const storageRef = ref(storage, `image_${ids}`);

      // const uploadTask = uploadBytesResumable(storageRef, imgData);
      // uploadTask.on(
      //   (error) => {
      //     //TODO:Handle Error
      //     console.log(error);
      //     console.log(error.response);
      //   },
      //   () => {
      //     getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {

      //       await updateDoc(doc(db, "chats", data.chatId), {
      //         messages: arrayUnion({
      //           id: ids,
      //           text: dataEncrypt(textContent, data.chatId),
      //           senderId: currentUser.uid,
      //           date: Timestamp.now(),
      //           img: downloadURL,
      //         }),
      //       });

      //       pushNotification(regdToken);
      //       updtDocs(textContent !== '' ? textContent.substring(0, 20) : 'Image', ids);
      //     });
      //   }
      // );

      const storageRef = ref(storage, `image_${ids}`);

      await uploadBytesResumable(storageRef, imgData, imgData)
        .then(() => {
          getDownloadURL(storageRef).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: ids,
                text: dataEncrypt(textContent, data.chatId),
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
            pushNotification(regdToken);
            updtDocs(textContent !== '' ? textContent.substring(0, 20) : 'Image', ids);
            setIsLoadingMsg(false);
          });
        })
        .catch((err) => { console.log(err); setIsLoadingMsg(false); });
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

        pushNotification(regdToken);
        updtDocs(textContent !== '' ? textContent.substring(0, 20) : 'Image', ids);
        setIsLoadingMsg(false);
      }
    };
  };

  const initialize = () => {
    document.body.onfocus = checkIt;
    // console.log('initializing');
  };

  const checkIt = () => {
    setIsSelectImg(false);
    document.body.onfocus = null;
    // console.log('checked & flag closed');
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
          accept="image/*"
          onChange={(e) => {
            setImg(e.target.files[0]);
            setImgToggle(true);
            e.target.value = null;
            setIsSelectImg(false);
          }}
          onClick={initialize}
        />
        {imgToggle ?
          <div className="imageBox">
            <span className="material-icons cancelImg" onClick={() => { setImg(null); setImgToggle(false) }}>cancel</span>
            {img && <img src={URL.createObjectURL(img)} alt='selected_Image' className="selected_Image" />}
          </div>
          :
          <label htmlFor="file">
            <span className="material-icons addImg" onClick={() => { setImg(null); setIsSelectImg(true); }} >add_photo_alternate</span>
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
