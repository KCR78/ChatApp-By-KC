import React, { useContext } from 'react'
import { signOut } from "firebase/auth"
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {

  const { currentUser } = useContext(AuthContext)

  return (
    <div className='navbar'>
      <div className='brand'>
        <span className="logo">ChatApp</span>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>
      <div className="user">
        <img src={currentUser.photoURL} alt="" />
        <span title={`${currentUser.displayName}`}>{currentUser.displayName}</span>
      </div>
    </div >
  )
};

export default Navbar