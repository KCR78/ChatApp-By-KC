import Home from "./pages/Home";
import Login from "./pages/Login";
// import Register from "./pages/Register";
import "./style.scss";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { onMessageListener } from './firebase';
import Try from "./pages/Try";

function App() {

  const { currentUser } = useContext(AuthContext);

  onMessageListener().then().catch(err => console.log('failed: ', err));

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" />;

    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="try" element={<Try />} />
          <Route path="*" element={<Navigate to="/" />} />
          {/* <Route path="register" element={<Register />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
