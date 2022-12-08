import React, { useContext, useState } from "react";
import AddUser from "../img/add.png";
import cancel from "../img/cancel.png";
import { db, } from "../firebase";
import { useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { useEffect } from "react";
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const Visitors = () => {

    const [err, setErr] = useState(false);
    const [pinErr, setPinErr] = useState();
    const [loading, setLoading] = useState(false);
    const [isEditPin, setIsEditPin] = useState('');
    const [allUsersList, setAllUsersList] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);

    const { setIsRegisterUserOpen } = useContext(ChatContext);

    const emailRef = useRef();
    const pinRef = useRef();

    const [editPinCodeValue, setEditPinCodeValue] = useState('');

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

    const editVisitor = async (data, type) => {
        setPinErr();
        setIsEditPin(data.uuid);

        if (type === 'Save') {

            if (editPinCodeValue === '' || editPinCodeValue.length < 6) { console.log('Invalid PIN.'); setPinErr('Invalid PIN'); }
            else {
                try {
                    console.log('Saving Pincode.');

                    await updateDoc(doc(db, "visitors", data.uuid), {
                        pin: editPinCodeValue
                    });

                    setIsEditPin('');
                    setEditPinCodeValue('');
                    console.log('Pincode Saved.');
                } catch (err) {
                    console.log(err);
                }
            }
        }

        else {
            console.log('Edit Pincode.');
            setEditPinCodeValue(data.pin);
        }
    };

    const deleteVisitor = async (data) => {
        if (window.confirm("Are you sure you want to delete this Visitor?") === true) {
            try {
                await deleteDoc(doc(db, "visitors", data.uuid));
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const regx = /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@(([^<>()[\]\\.,;:\s@\\"]+\.)+[^<>()[\]\\.,;:\s@\\"]{2,})$/i

        if (emailRef.current.value.trim() === '' || pinRef.current.value.trim() === '') setErr('Please add all values.');
        else {
            if (!regx.test(emailRef.current.value.trim())) setErr('Please enter valid email.');
            else {
                setErr(false);
                setLoading(true);
                const email = emailRef.current.value;
                const pin = pinRef.current.value;

                if (!allUsersList.find(data => data.email === email)) {

                    let uuid = uuidv4();
                    try {
                        //create user on firestore
                        await setDoc(doc(db, "visitors", uuid), {
                            uuid,
                            email,
                            pin
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
                    <div className="head">Visitors</div>

                    <div className="user-table">

                        {allUsersList.length > 0 ?
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sl No.</th>
                                        <th>Name</th>
                                        <th>PIN</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsersList.map((item, index) =>
                                        <tr key={item.uuid}>
                                            <td>{index + 1}</td>
                                            <td className="td-name">{item.email}</td>
                                            <td className="td-pin">
                                                <span className={isEditPin === item.uuid ? "disp-hide" : ''}>{item.pin}</span>
                                                <span className={isEditPin === item.uuid ? 'editPinBox' : 'disp-hide'}>
                                                    <input type="text" value={editPinCodeValue} onChange={(e) => setEditPinCodeValue(e.target.value)} maxLength='6' placeholder="6 Digit PIN" />
                                                    <img src={cancel} alt='cancel' onClick={() => { setIsEditPin(''); setPinErr(); }} />
                                                </span>
                                                {isEditPin === item.uuid && pinErr && <span className="text-red">{pinErr}</span>}
                                            </td>
                                            <td className="act-btn">
                                                <button onClick={() => editVisitor(item, isEditPin === item.uuid ? "Save" : "Edit")}>{isEditPin === item.uuid ? "Save" : "Edit"}</button>
                                                <button onClick={() => deleteVisitor(item)}>Delete</button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            :
                            <p className="noVisitor">-- No Visitors Found -- </p>
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
                            <input required type="text" ref={pinRef} maxLength='6' placeholder="Visitor's digit PIN" />

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