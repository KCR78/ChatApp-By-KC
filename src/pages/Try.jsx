import { getDownloadURL, getStorage, ref, uploadString } from "firebase/storage";
import React, { useState } from "react";
import { dataDecrypt, dataEncrypt } from "../components/dataEncryptDcrypt";
import thumbnail from '../img/thumbnail.jpg';

const Try = () => {

  const [err, setErr] = useState(false);
  const [bData, setBData] = useState();
  const [imgUrl, setImgUrl] = useState();
  const bDataSecret = '...Here_Is_My_Secret_Code...';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!e) setErr(true);
    // console.log(bData);

    const storage = getStorage();
    const storageRef = ref(storage, 'some-child');

    uploadString(storageRef, bData).then((snapshot) => {
      console.log('Uploaded a raw string!');
      console.log('snapshot : ', snapshot);

      getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        setImgUrl(downloadURL);
      });

    });
  };

  const handleChange = (e) => {
    setImgUrl();
    setBData();

    if (e.target.files.length > 0) {
      const elem = document.getElementById('chat_image');
      if (elem) elem.src = thumbnail;

      const file = e.target.files[0];

      let reader = new FileReader();
      reader.onloadend = function () {
        // console.log('String Output: ', reader.result);
        const data = dataEncrypt(reader.result, bDataSecret);
        setBData(data);
      };
      reader.readAsDataURL(file);
    };
  };

  const imageDecrypt = () => {
    const elem = document.getElementById('chat_image');

    console.log(imgUrl);

    fetch(imgUrl)
      .then((r) => {
        console.log(r);
        r.text()
          .then(d => {
            console.log(d)
            elem.src = dataDecrypt(d, bDataSecret);
          })
          .catch(e => console.log(e))
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="login-formContainer">
      <div className="formWrapper">
        <form onSubmit={handleSubmit}>
          <input type="file" placeholder="File" onChange={handleChange} />
          {bData && <button>Submit</button>}
          {err && <span className="text-red">Something went wrong</span>}
        </form>
        {imgUrl &&
          <div className="chat_image_box">
            <img src={thumbnail} alt='Image_File' id='chat_image' className="chat_image" onClick={imageDecrypt} width='120px' />
          </div>
        }
      </div>
    </div>
  );
};

export default Try;