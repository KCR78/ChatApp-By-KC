import React, { useContext } from 'react'
import { signOut } from "firebase/auth"
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {

  const { currentUser } = useContext(AuthContext)

  const dropdownToggle = () => document.getElementById("dropdownContent").classList.toggle("show");

  // Close the dropdown if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches('.dots')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  return (
    <div className='navbar'>
      <div className='brand'>
        <div className="user">
          <img src={currentUser.photoURL} alt="" />
          <div title={`${currentUser.displayName}`}>{currentUser.displayName}</div>
        </div>

        <div className="dropdown">
          <span className="material-icons dots" onClick={dropdownToggle}>more_vert</span>
          <div id="dropdownContent" className="dropdown-content">
            <div onClick={() => signOut(auth)}>Logout</div>
          </div>
        </div>
      </div>
    </div >
  )
};

export default Navbar;