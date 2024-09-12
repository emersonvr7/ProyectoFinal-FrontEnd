import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RecuperarContrasena = () => {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      await axios.post('http://localhost:5000/api/recuperarContrasena', { correo, tipo: 'cliente' });
      setMensaje('Nueva contraseña enviada al correo.');
      navigate(`/codigo?correo=${encodeURIComponent(correo)}`); // Navega a la página de verificación con el correo en la URL
    } catch (err) {
      setError('Error en la recuperación de contraseña.');
    }
  };

  return (
    <div 
    className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
    style={{ 
      backgroundImage: "url('/fondo2.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}
  >     
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // Ajusta el color y la opacidad aquí
      zIndex: 1,
    }}
  ></div>
   <div style={{borderRadius:'25px', zIndex: 2, boxShadow: '0 10px 15px rgba(0, 0, 0, 0.4)', backgroundColor: '#F2EBFF', /* Ajusta el tamaño, desplazamiento y color de la sombra */
  }} className="p-10 max-w-md w-full bg-white shadow-md rounded-xl border border-gray-600">
        <img 
          src="/jacke.png" 
          alt="Logo" 
          className="w-32 h-32 rounded-full mx-auto mb-8"
          />
        <h2 className="text-2xl  mb-6 text-center text-gray-800 mb-12"><i class='bx bx-lock'></i> Recuperar Contraseña </h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
          <label htmlFor="correo" className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
  <i className='bx bx-envelope' style={{fontSize: '20px'}}></i>
  Correo Electrónico:
</label>

            <input
            style={{borderRadius:'20px'}}
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-12"
              required
              placeholder='Ejemplo@gmail.com'
            />
          </div>
          {mensaje && <p className="text-green-600 mb-4">{mensaje}</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button 
                     style={{borderRadius:'20px'}}

  type="submit" 
  className="w-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md py-2 px-4 flex items-center justify-center gap-2 mb-8"
>
  Enviar código <i className='bx bx-send' style={{fontSize: '20px'}}></i>
</button>
<a 
  href="/iniciarSesion"
  className="inline-flex items-center bg-gray-100 text-gray-700 hover:bg-gray-300 rounded-md px-4 py-2 text-center font-medium transition-colors"
>
  <i className='bx bx-chevron-left' style={{fontSize: '24px', marginRight: '8px'}}></i>
  Volver
</a>



        </form>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
