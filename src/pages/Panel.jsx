import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import L from "leaflet";
import './Panel.css';

const iconoPersonalizado = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function CentrarVista({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 15);
  }, [coords]);
  return null;
}

function Mapa({ ruta, setRuta }) {
  const [ubicacion, setUbicacion] = useState([19.4326, -99.1332]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn("Ubicación no disponible:", err.message);
      }
    );
  }, []);

  function ClickRuta() {
    useMapEvents({
      click(e) {
        if (setRuta && Array.isArray(ruta)) {
          setRuta([...ruta, [e.latlng.lat, e.latlng.lng]]);
        }
      },
    });
    return null;
  }

  return (
    <MapContainer center={ubicacion} zoom={15}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <CentrarVista coords={ubicacion} />
      <ClickRuta />
      {Array.isArray(ruta) && ruta.map((p, i) => (
        <Marker key={i} position={p} icon={iconoPersonalizado} />
      ))}
      {Array.isArray(ruta) && ruta.length > 1 && <Polyline positions={ruta} color="blue" />}
    </MapContainer>
  );
}

export default function Panel() {
  const [ruta, setRuta] = useState([]);
  const [rutaGuardada, setRutaGuardada] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: "", email: "" });
  const [mostrarAgregarUsuario, setMostrarAgregarUsuario] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const usuariosRef = collection(db, "usuarios");
      const snapshot = await getDocs(usuariosRef);
      const usuariosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const guardarRuta = () => {
    if (ruta.length === 0) {
      alert("Primero debes marcar una ruta en el mapa");
      return;
    }
    setRutaGuardada([...ruta]);
    alert("Ruta guardada localmente. Ahora puedes seleccionar un usuario y enviarla.");
  };
  
  const limpiarRuta = () => {
    setRuta([]);
    setRutaGuardada(null);
  };

  const agregarUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email) {
      alert("Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "usuarios"), {
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        fechaCreacion: new Date()
      });
      setNuevoUsuario({ nombre: "", email: "" });
      setMostrarAgregarUsuario(false);
      await cargarUsuarios();
      alert("Usuario agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      alert("Error al agregar usuario");
    } finally {
      setLoading(false);
    }
  };

  const enviarRuta = async () => {
    if (!rutaGuardada) {
      alert("Primero debes guardar la ruta");
      return;
    }
    if (!usuarioSeleccionado) {
      alert("Debes seleccionar un usuario");
      return;
    }
    setLoading(true);
    try {
      const rutaData = {
        puntos: rutaGuardada.map(p => ({ lat: p[0], lng: p[1] })),
        usuarioOrigen: auth.currentUser?.email || "Usuario actual",
        usuarioDestino: usuarioSeleccionado,
        fechaEnvio: new Date(),
        estado: "pendiente"
      };
      await addDoc(collection(db, "rutas"), rutaData);
      setRuta([]);
      setRutaGuardada(null);
      setUsuarioSeleccionado("");
      alert("Ruta enviada exitosamente");
    } catch (error) {
      console.error("Error al enviar ruta:", error);
      alert("Error al enviar la ruta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-container">
      <div className="panel-content-wrapper">
        <h1>Panel de rutas</h1>
        <div className="map-wrapper">
          <Mapa ruta={ruta} setRuta={setRuta} />
        </div>

        <div className="actions-container">
          <div className="controls">
            <button 
              className="btn" 
              onClick={guardarRuta}
              disabled={ruta.length === 0}
            >
              Guardar Ruta
            </button>
            <select 
              className="form-select"
              value={usuarioSeleccionado}
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              disabled={!rutaGuardada}
            >
              <option value="">Elegir usuario</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.email}>
                  {usuario.nombre} ({usuario.email})
                </option>
              ))}
            </select>
            
            <button 
              className="btn" 
              onClick={enviarRuta}
              disabled={!rutaGuardada || !usuarioSeleccionado || loading}
            >
              {loading ? "Enviando..." : "Mandar ruta"}
            </button>

            <button 
              className="btn" 
              onClick={limpiarRuta}
              disabled={ruta.length === 0 && !rutaGuardada}
            >
              Limpiar Ruta
            </button>
            
            <button 
              className="btn"
              onClick={() => setMostrarAgregarUsuario(!mostrarAgregarUsuario)}
            >
              {mostrarAgregarUsuario ? "Cancelar" : "Agregar usuario"}
            </button>
          </div>

          {mostrarAgregarUsuario && (
            <div className="add-user-form">
              <h5 className="mb-3">Agregar Nuevo Usuario</h5>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Nombre del usuario"
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
              />
              <input
                type="email"
                className="form-control mb-2"
                placeholder="Email del usuario"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
              />
              <button 
                className="btn btn-success"
                onClick={agregarUsuario}
                disabled={loading}
              >
                {loading ? "Agregando..." : "Guardar Usuario"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}