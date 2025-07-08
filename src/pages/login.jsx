// src/pages/Login.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginCustom.css'; 
import logo from '../assets/images/logo.jpg'// tu CSS personalizado

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/panel');
        } catch (err) {
            alert('Error al iniciar sesión: ' + err.message);
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
