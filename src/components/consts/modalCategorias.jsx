import React, { useState, useRef, useEffect } from 'react';
import SendIcon from "@mui/icons-material/Send";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Modal, Box, Typography, TextField, Button, FormHelperText } from '@mui/material';

const ModalCategoria = ({ open, handleClose, onSubmit, title, fields, entityData, onChange }) => {
  const [errors, setErrors] = useState({});
  const [position, setPosition] = useState({ x: 600, y: 150 });
  const [dragging, setDragging] = useState(false);
  const modalContainerRef = useRef(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (open && modalContainerRef.current) {
      const { innerWidth, innerHeight } = window;
      const modalWidth = 450; // Ancho del modal
      const modalHeight = modalContainerRef.current.offsetHeight; // Altura calculada del modal
      setPosition({
        x: (innerWidth - modalWidth) / 2,
        y: (innerHeight - modalHeight) / 2,
      });
    }
  }, [open]); // Ejecuta solo cuando el modal se abre

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';

    if (name === 'nombre_categoria') {
      if (value.trim().length < 4) {
        error = 'El nombre de la categoría debe tener al menos 4 letras.';
      } else if (!/^[a-zA-Z0-9ñÑ\s]+$/.test(value)) {
        error = 'El nombre de la categoría no puede contener caracteres especiales.';
      } else if (value.trim() === '') {
        error = 'El nombre de la categoría es obligatorio.';
      }
    } else if (name === 'descripcion_categoria') {
      if (value.trim().length > 225) {
        error = 'La descripción debe tener hasta 225 caracteres.';
      } else if (!value.trim()) {
        error = "La descripción de la categoría está vacía.";
      } else if (value.trim().length < 20) {
        error = "La descripción de la categoría debe tener al menos 20 caracteres.";
      } else if ((value.match(/[a-zA-ZñÑ]/g) || []).length < 10) {
        error = "La descripción de la categoría debe contener al menos 10 letras.";
      }
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSubmit = () => {
    const validationErrors = {};

    fields.forEach((field) => {
      const value = entityData[field.name] || '';
      validateField(field.name, value);
      if (errors[field.name]) {
        validationErrors[field.name] = errors[field.name];
      }
    });

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(entityData);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        ref={modalContainerRef}
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          backgroundColor: 'white',
          borderRadius: '0.375rem',
          width: '450px',
          boxShadow: 24,
          padding: '1.5rem',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: dragging ? 'grabbing' : 'grab',
            padding: '1rem',
            backgroundColor: dragging ? '#f0f0f0' : 'transparent',
            boxShadow: dragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
            transition: 'background-color 0.3s, box-shadow 0.3s, cursor 0.3s',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {title}
          </Typography>
          <DragIndicatorIcon />
        </div>

        {fields.map((field) => (
          <Box key={field.name} sx={{ mb: 2 }}>
            <TextField
              label={field.label}
              name={field.name}
              type={field.type}
              value={entityData[field.name] || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline={field.type === 'textarea'}
              rows={field.rows || 1}
              InputProps={{
                readOnly: field.readOnly || false,
              }}
              error={!!errors[field.name]}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
                '& .MuiFormLabel-root': {
                  color: 'text.primary',
                },
                '& .MuiFormHelperText-root': {
                  color: 'error.main',
                }
              }}
            />
            {errors[field.name] && (
              <FormHelperText error>{errors[field.name]}</FormHelperText>
            )}
          </Box>
        ))}

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            onClick={handleClose}
            color="secondary"
            variant="contained"
            style={{ marginRight: "1rem", borderRadius: '8px' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            endIcon={<SendIcon />}
            sx={{ borderRadius: '8px' }}
          >
            {title.includes('Crear') ? 'Enviar' : 'Actualizar'}
          </Button>
        </Box>
      </div>
    </Modal>
  );
};

export default ModalCategoria;
