import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import dayjs from "dayjs";


const MessageModal = ({ open, handleClose, idAgenda }) => {
  const [message, setMessage] = useState(""); // Mensaje personalizado
  const [tipo, setTipo] = useState(""); // Tipo de mensaje

  // Opciones para el selector
  const opciones = [
    { label: "Anular cita", value: "anular" },
    { label: "Aplazar cita", value: "aplazar" },
    { label: "Otro", value: "otro" },
  ];

  const handleSend = async () => {
    if (!message || !tipo) {
      Swal.fire("Error", "Por favor selecciona un tipo de solicitud y escribe un mensaje.", "error");
      return;
    }
  
    // Obtener la fecha y hora actual
    const currentDateTime = dayjs().format('DD/MM/YYYY HH:mm');
  
    try {
      const token = localStorage.getItem("token");
      // Aquí envías el mensaje personalizado con el tipo seleccionado y la fecha/hora actual
      await axios.post(
        "http://localhost:5000/api/notificaciones/crear",
        {
          Tipo: tipo,
          Mensaje: `${message} (Enviado el ${currentDateTime})`, // Añadir la fecha y hora al mensaje
          IdAgenda: idAgenda, // Relaciona el mensaje con la cita
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      Swal.fire("Enviado", "Tu mensaje ha sido enviado correctamente.", "success");
      handleClose(); // Cierra el modal después de enviar el mensaje
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      Swal.fire("Error", "Hubo un problema al enviar tu mensaje.", "error");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Enviar mensaje personalizado
        </Typography>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Tipo de solicitud</InputLabel>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)} label="Tipo de solicitud">
            {opciones.map((opcion) => (
              <MenuItem key={opcion.value} value={opcion.value}>
                {opcion.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Escribe tu mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Box display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleSend}>
            Enviar
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default MessageModal;
