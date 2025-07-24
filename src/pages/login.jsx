// src/pages/Login.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginCustom.css'; 
import logo from '../assets/images/logo.jpg'// tu CSS personalizado
import Swal from 'sweetalert2';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
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

        try {
            await signInWithEmailAndPassword(auth, email, password);
            Swal.fire({
                title: '¡Bienvenido!',
                text: 'Inicio de sesión exitoso.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            setTimeout(() => navigate('/panel'), 1500);
        } catch (err) {
            let msg = 'Error al iniciar sesión.';
            if (err.code === 'auth/user-not-found') {
                msg = 'El usuario no está registrado.';
            } else if (err.code === 'auth/wrong-password') {
                msg = 'Contraseña incorrecta.';
            } else if (err.code === 'auth/invalid-email') {
                msg = 'Correo electrónico inválido.';
            }
            Swal.fire('Error', msg, 'error');
        }
    };

    return (
        <div className="login-bg">
            <div className="login-box">
                <img className="avatar" src={logo} alt="Avatar" />
                <h2 className="login-title">Bienvenido</h2>

                <form onSubmit={handleLogin}>
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

                    <button className="login-btn" type="submit">Entrar</button>
                </form>

                <div className="text-center">
                    <a className="register-link" href="/register">
                        Crear nueva cuenta
                        <i className="fa fa-long-arrow-right m-l-5"></i>
                    </a>
                </div>
            </div>
        </div>
    );
}
