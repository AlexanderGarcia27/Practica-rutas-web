// src/pages/Register.jsx
import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginCustom.css"; // Usa el mismo estilo que Login
import logo from '../assets/images/logo.jpg'
import Swal from 'sweetalert2';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validación de campos vacíos
    if (!email && !password) {
      Swal.fire('Campos requeridos', 'Por favor completa todos los campos.', 'warning');
      return;
    }
    if (!email) {
      Swal.fire('Campo requerido', 'Por favor ingresa tu correo.', 'warning');
      return;
    }
    if (!password) {
      Swal.fire('Campo requerido', 'Por favor ingresa tu contraseña.', 'warning');
      return;
    }
    // Validación de formato de correo
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire('Correo inválido', 'Por favor ingresa un correo electrónico válido.', 'warning');
      return;
    }
    // Validación de longitud de contraseña
    if (password.length < 6) {
      Swal.fire('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Swal.fire({
        title: '¡Registro exitoso!',
        text: 'Usuario registrado con éxito.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let msg = 'Error al registrar.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'El correo ya está registrado.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Correo electrónico inválido.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'La contraseña es muy débil.';
      }
      Swal.fire('Error', msg, 'error');
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
            />
          </div>

          <div className="input-container">
            <i className="fa fa-lock icon"></i>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
