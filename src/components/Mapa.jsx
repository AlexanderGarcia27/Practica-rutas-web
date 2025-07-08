import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

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

export default function Mapa({ ruta = [], setRuta }) {
  const [ubicacion, setUbicacion] = React.useState([19.4326, -99.1332]);

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
    <MapContainer center={ubicacion} zoom={15} style={{ height: "400px", width: "100%" }}>
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