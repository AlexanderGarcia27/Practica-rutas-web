// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Panel from './pages/Panel';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/register" element={<Register />} /> {/* <- esta línea */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
