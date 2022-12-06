import React, { useContext, useState } from "react";
import AddUser from "../img/add.png";
import cancel from "../img/cancel.png";
import { db, } from "../firebase";
import { useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { useEffect } from "react";
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const Visitors = () => {

    const [err, setErr] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allUsersList, setAllUsersList] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);

    const { setIsRegisterUserOpen } = useContext(ChatContext);

    const emailRef = useRef();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const regx = /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@(([^<>()[\]\\.,;:\s@\\"]+\.)+[^<>()[\]\\.,;:\s@\\"]{2,})$/i

        if (emailRef.current.value.trim() === '') setErr('Please add all value.');
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