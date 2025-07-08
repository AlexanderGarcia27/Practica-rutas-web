import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
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
  const [rutasEnviadas, setRutasEnviadas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

  useEffect(() => {
    cargarUsuarios();
    cargarRutasEnviadas();
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

  const cargarRutasEnviadas = async () => {
    try {
      if (!auth.currentUser) return;
      const rutasRef = collection(db, "rutas");
      const q = query(rutasRef, where("usuarioOrigen", "==", auth.currentUser.email));
      const snapshot = await getDocs(q);
      const rutasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRutasEnviadas(rutasData);
    } catch (error) {
      console.error("Error al cargar rutas enviadas:", error);
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
      await cargarRutasEnviadas(); // Actualizar la lista de rutas enviadas
    } catch (error) {
      console.error("Error al enviar ruta:", error);
      alert("Error al enviar la ruta");
    } finally {
      setLoading(false);
    }
  };

  const eliminarRuta = async (rutaId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta ruta?")) return;
    try {
      await deleteDoc(doc(db, "rutas", rutaId));
      setRutasEnviadas(rutasEnviadas.filter(r => r.id !== rutaId));
      if (rutaSeleccionada && rutaSeleccionada.id === rutaId) {
        setRutaSeleccionada(null);
      }
    } catch (error) {
      alert("Error al eliminar la ruta");
      console.error(error);
    }
  };

  return (
    <div className="panel-container" style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
      {/* Panel principal */}
      <div className="panel-content-wrapper" style={{ flex: 2 }}>
        <h1>Panel de rutas</h1>
        <div className="map-wrapper">
          <Mapa ruta={rutaSeleccionada ? rutaSeleccionada.puntos.map(p => [p.lat, p.lng]) : ruta} setRuta={setRuta} />
        </div>
        {rutaSeleccionada && (
          <button
            className="btn btn-primary"
            style={{ margin: "1rem 0" }}
            onClick={() => setRutaSeleccionada(null)}
          >
            Quitar ruta del mapa
          </button>
        )}

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
              onClick={() => setMostrarAgregarUsuario(true)}
            >
              Agregar usuario
            </button>
          </div>
        </div>
      </div>
      {/* Panel lateral de rutas enviadas */}
      <div className="rutas-lateral">
        <h3>Mis rutas enviadas</h3>
        {rutasEnviadas.length === 0 && <div style={{ color: '#888', marginTop: '1rem' }}>No has enviado rutas.</div>}
        {rutasEnviadas.map(ruta => (
          <div
            key={ruta.id}
            className="ruta-card"
            style={{
              background: "#f8f9fa",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              border: rutaSeleccionada && rutaSeleccionada.id === ruta.id ? '2px solid #007bff' : '1px solid #e0e0e0'
            }}
            onClick={() => setRutaSeleccionada(ruta)}
          >
            <div><b>Destino:</b> {ruta.usuarioDestino}</div>
            <div><b>Fecha:</b> {ruta.fechaEnvio?.toDate ? ruta.fechaEnvio.toDate().toLocaleString() : String(ruta.fechaEnvio)}</div>
            <div><b>Puntos:</b> {ruta.puntos.length}</div>
            <button
              className="btn btn-primary"
              style={{
                marginTop: "0.8rem",
                width: "100%",
                fontSize: "0.95rem",
                fontWeight: 600
              }}
              onClick={e => {
                e.stopPropagation();
                eliminarRuta(ruta.id);
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      {/* Modal para agregar usuario */}
      {mostrarAgregarUsuario && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ background: "#fff", opacity: 1 }}>
            <div
              className="modal-header"
              style={{
                padding: "2rem 2rem 1.2rem 2rem", // top right bottom left
                borderBottom: "1px solid #e9ecef",
                marginBottom: "0.5rem"
              }}
            >
              <h5 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "#333" }}>
                Agregar Nuevo Usuario
              </h5>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setMostrarAgregarUsuario(false);
                  setNuevoUsuario({ nombre: "", email: "" });
                }}
              >
                ✕
              </button>
            </div>
            <div
              className="modal-body"
              style={{
                padding: "2rem 2rem 0.5rem 2rem",
                paddingTop: "1.5rem"
              }}
            >
              <input
                type="text"
                className="form-control-custom"
                placeholder="Nombre del usuario"
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
              />
              <input
                type="email"
                className="form-control-custom"
                placeholder="Email del usuario"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
              />
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                padding: "0.5rem 2rem 2.5rem 2rem", // top right bottom left
                marginTop: "1rem"
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setMostrarAgregarUsuario(false);
                  setNuevoUsuario({ nombre: "", email: "" });
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={agregarUsuario}
                disabled={loading}
              >
                {loading ? "Agregando..." : "Guardar Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}