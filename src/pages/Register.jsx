// src/pages/Register.jsx
import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginCustom.css"; // Usa el mismo estilo que Login
import logo from '../assets/images/logo.jpg'

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Usuario registrado con éxito");
      navigate("/");
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-box">
        <img
          src={logo}
          alt="Avatar"
          className="avatar"
        />
        <h2 className="login-title">Crear cuenta</h2>

        <form onSubmit={handleRegister}>
          <div className="input-container">
            <i className="fa fa-user icon"></i>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-container">
            <i className="fa fa-lock icon"></i>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Registrarse
          </button>
        </form>

        <Link to="/" className="register-link">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </div>
    </div>
  );
};

export default Register;
