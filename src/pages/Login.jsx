import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

const Login = () => {

  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/")
    } catch (err) {
      setErr(true);
    }
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then(res => {
        console.log(res);
        navigate("/");
      })
      .catch(err => console.log(err))
  };

  return (
    <div className="login-formContainer">
      <div className="formWrapper">
        <span className="logo">ChatApp</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <button>Sign in</button>
          {err && <span>Something went wrong</span>}
        </form>
        {/* <p>You don't have an account? <Link to="/register">Register</Link></p> */}

        <button onClick={signInWithGoogle}>Sign In With Google</button>

      </div>
    </div>
  );
};

export default Login;
