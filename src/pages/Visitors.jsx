import React, { useContext, useState } from "react";
// import Add from "../img/addAvatar.png";
import AddUser from "../img/add.png";
import cancel from "../img/cancel.png";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { auth, db, storage } from "../firebase";
import { db, } from "../firebase";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { useNavigate, Link } from "react-router-dom";
import { useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { useEffect } from "react";
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const Visitors = () => {

    const [err, setErr] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [isImg, setIsImg] = useState(false);
    // const [image, setImage] = useState();
    const [allUsersList, setAllUsersList] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);

    const { setIsRegisterUserOpen } = useContext(ChatContext);

    // const dispNamRef = useRef();
    const emailRef = useRef();
    // const passRef = useRef();

    // const navigate = useNavigate();

    console.log(allUsersList);

    useEffect(() => {
        const getAllUsers = async () => {

            const q = query(collection(db, "visitors"));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = [];
                querySnapshot.forEach((doc) => {
                    data.push(doc.data());
                });
                setAllUsersList(data);
            });

            return () => {
                unsubscribe();
            };
        };

        getAllUsers();
    }, []);

    const deleteVisitor = async (data) => {
        try {
            await deleteDoc(doc(db, "visitors", data.uuid));
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async (e, item) => {
        e.preventDefault();
        const regx = /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@(([^<>()[\]\\.,;:\s@\\"]+\.)+[^<>()[\]\\.,;:\s@\\"]{2,})$/i

        if (
            // dispNamRef.current.value.trim() === '' ||
            // emailRef.current.value.trim() === '' ||
            // passRef.current.value.trim() === '' ||
            // !isImg
            emailRef.current.value.trim() === ''
        ) {
            setErr('Please add all value.');
        }
        // else if (dispNamRef.current.value.trim().length > 20) {
        //   setErr(`Name can't be exceed more that 20 characters`);
        // }
        else {
            if (!regx.test(emailRef.current.value.trim())) setErr('Please enter valid email.');
            else {
                setErr(false);
                setLoading(true);
                const email = emailRef.current.value;

                if (!allUsersList.find(data => data.email === email)) {

                    let uuid = uuidv4();
                    try {

                        //create user on firestore
                        await setDoc(doc(db, "visitors", uuid), {
                            uuid,
                            email,
                        });

                        setLoading(false);
                        setShowAddUser(false);
                    } catch (err) {
                        console.log(err);
                        setErr(true);
                        setLoading(false);
                    }
                }
                else {
                    console.log("Visitor already exists.");
                    setErr("Visitor already exists.");
                    setLoading(false);
                }





                // setErr(false);
                // setLoading(true);
                // const displayName = dispNamRef.current.value;
                // const password = passRef.current.value;
                // const file = image;

                //   try {
                //     //Create user
                //     const res = await createUserWithEmailAndPassword(auth, email, password);

                //     //Create a unique image name
                //     const date = new Date().getTime();
                //     const storageRef = ref(storage, `${displayName + date}`);

                //     await uploadBytesResumable(storageRef, file).then(() => {
                //       getDownloadURL(storageRef).then(async (downloadURL) => {
                //         try {
                //           //Update profile
                //           await updateProfile(res.user, {
                //             displayName,
                //             photoURL: downloadURL,
                //             isAdmin: true
                //           });

                //           //create user on firestore
                //           await setDoc(doc(db, "users", res.user.uid), {
                //             uid: res.user.uid,
                //             displayName,
                //             email,
                //             photoURL: downloadURL,
                //             isAdmin: true
                //           });

                //           //create empty user chats on firestore
                //           await setDoc(doc(db, "userChats", res.user.uid), {});
                //           // navigate("/");
                //           setLoading(false);

                //           console.log('finish');
                //         } catch (err) {
                //           console.log(err);
                //           setErr(true);
                //           setLoading(false);
                //         }
                //       });
                //     });
                //   } catch (err) {
                //     setErr(true);
                //     setLoading(false);
                //   }
            }
        }
    };

    return (
        <>
            {!showAddUser ?
                <div className="user-lists">
                    <img src={cancel} alt="" className="close-regd" onClick={() => setIsRegisterUserOpen(false)} />
                    <div className="head">User Lists</div>

                    <div className="user-table">

                        {allUsersList.length > 0 ?
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sl No.</th>
                                        <th>Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsersList.map((item, index) =>
                                        <tr key={item.uuid}>
                                            <td>{index + 1}</td>
                                            <td className="td-name">{item.email}</td>
                                            <td><button onClick={() => deleteVisitor(item)}>Delete</button></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            :
                            <p className="noVisitor">-- No Users Found -- </p>
                        }
                    </div>

                    <div className="add-btn" onClick={() => { setShowAddUser(true); setErr(false); setLoading(false); }}>
                        <img src={AddUser} alt="" className="add-user" />
                    </div>
                </div>
                :
                <div className="visitors-formContainer">
                    <img src={cancel} alt="" className="close-regd" onClick={() => { setShowAddUser(false); setErr(false); }} />
                    <div className="formWrapper">
                        <span className="logo">Add Visitors</span>
                        <form>
                            <input required type="email" ref={emailRef} placeholder="Visitor's Email" />

                            <button
                                disabled={loading}
                                onClick={handleSubmit}>Add</button>
                            {err ?
                                (typeof err === 'string')
                                    ? <span className="text-red" >{err}</span>
                                    : <span className="text-red" >Something went wrong</span>
                                : null}
                        </form>
                    </div>
                </div>
            }
        </>
    );
};

export default Visitors;