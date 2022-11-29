import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import cancel from "../img/cancel.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useRef } from "react";

const Register = () => {

  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImg, setIsImg] = useState(false);
  const [image, setImage] = useState();

  const dispNamRef = useRef();
  const emailRef = useRef();
  const passRef = useRef();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const regx = /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@(([^<>()[\]\\.,;:\s@\\"]+\.)+[^<>()[\]\\.,;:\s@\\"]{2,})$/i

    if (
      dispNamRef.current.value.trim() === '' ||
      emailRef.current.value.trim() === '' ||
      passRef.current.value.trim() === '' ||
      !isImg
    ) {
      setErr('Please add all value.');
    } else {
      if (!regx.test(emailRef.current.value.trim())) setErr('Please enter valid email.');
      else {
        setErr(false);
        setLoading(true);
        const displayName = dispNamRef.current.value;
        const email = emailRef.current.value;
        const password = passRef.current.value;
        const file = image;

        try {
          //Create user
          const res = await createUserWithEmailAndPassword(auth, email, password);

          //Create a unique image name
          const date = new Date().getTime();
          const storageRef = ref(storage, `${displayName + date}`);

          await uploadBytesResumable(storageRef, file).then(() => {
            getDownloadURL(storageRef).then(async (downloadURL) => {
              try {
                //Update profile
                await updateProfile(res.user, {
                  displayName,
                  photoURL: downloadURL,
                });

                //create user on firestore
                await setDoc(doc(db, "users", res.user.uid), {
                  uid: res.user.uid,
                  displayName,
                  email,
                  photoURL: downloadURL,
                });

                //create empty user chats on firestore
                await setDoc(doc(db, "userChats", res.user.uid), {});
                navigate("/");
              } catch (err) {
                console.log(err);
                setErr(true);
                setLoading(false);
              }
            });
          });
        } catch (err) {
          setErr(true);
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">ChatApp</span>
        <span className="title">Register</span>
        <form>
          <input required type="text" ref={dispNamRef} placeholder="display name" />
          <input required type="email" ref={emailRef} placeholder="email" />
          <input required type="password" ref={passRef} placeholder="password" />
          <input
            required
            id="file"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files.length !== 0) { setIsImg(true); setImage(e.target.files[0]); }
              else setIsImg(false);
            }}
          />

          {!isImg ?
            <label htmlFor="file">
              <img src={Add} alt="" />
              <span>Add an avatar</span>
            </label>
            :
            <div className="reg_imageBox" onClick={() => { setIsImg(false); setImage(); }}>
              <label>1 Image selected</label>
              <img src={cancel} alt="" />
            </div>
          }

          <button disabled={loading} onClick={handleSubmit}>Sign up</button>
          {loading && "Uploading and compressing the image please wait..."}
          {err ?
            (typeof err === 'string')
              ? <span className="text-red" >{err}</span>
              : <span className="text-red" >Something went wrong</span>
            : null}
        </form>
        <p>
          You do have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
