import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import google from '../img/suwg.png';

const Login = () => {

  // const [err, setErr] = useState(false);
  const navigate = useNavigate();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const email = e.target[0].value;
  //   const password = e.target[1].value;

  //   try {
  //     await signInWithEmailAndPassword(auth, email, password);
  //     navigate("/")
  //   } catch (err) {
  //     setErr(true);
  //   }
  // };

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
        {/* <span className="title">Login</span> */}
        {/* <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <button>Sign in</button>
          {err && <span className="text-red">Something went wrong</span>}
        </form> */}
        {/* <p>You don't have an account? <Link to="/register">Register</Link></p> */}
        <hr className="hr-line" />
        <div>
          <img src={google} alt="" className="google-btn" onClick={signInWithGoogle} />
        </div>
      </div>
    </div>
  );
};

export default Login;