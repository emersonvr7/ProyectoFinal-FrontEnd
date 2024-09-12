import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Typography, Grid, TextField, Select, MenuItem, InputLabel, IconButton, FormControl,TextareaAutosize,} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const ModalDinamico = ({
  open, handleClose, title = "", fields, onSubmit, onChange, entityData,
}) => {
  const [formValues, setFormValues] = useState({});
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 350, y: 150 });
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });
  const [extraFields, setExtraFields] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const modalContainerRef = useRef(null);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const [imagePreview, setImagePreview] = useState(null);
  const isEditing = !!imagePreview;

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialFormData = {};
      fields.forEach((field) => {
        if (!formValues[field.name]) {
          initialFormData[field.name] = field.value || "";
        }
      });
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        ...initialFormData,
      }));
    }

    if (open && modalContainerRef.current) {
      setModalSize({
        width: modalContainerRef.current.offsetWidth,
        height: modalContainerRef.current.offsetHeight,
      });
    }
  }, [fields, open]);

  useEffect(() => {
    if (entityData) {
      setFormValues(entityData);
    }
  }, [entityData]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("modal-header")) {
      setDragging(true);
      startPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }
  };

  useEffect(() => {
    if (entityData) {
      const initialData = {
        ...entityData,
        Precio_Servicio: parseFloat(entityData.Precio_Servicio) || '', 
      };
      setFormValues(initialData);

      if (entityData.ImgServicio) {
        setImagePreview(`http://localhost:5000${entityData.ImgServicio}`);
      } else if (entityData.image_preview) {
        setImagePreview(entityData.image_preview);
      } else {
        setImagePreview(null);
      }

      if (entityData.imagen) {
        setImagePreview(`http://localhost:5000${entityData.imagen}`);
      }
    }
  }, [entityData]);

  const handleMouseMove = (e) => {
    if (dragging) {
      requestAnimationFrame(() => {
        const maxX = window.innerWidth - modalSize.width;
        const maxY = window.innerHeight - modalSize.height;
        const newX = Math.max(
          0,
          Math.min(position.x + e.clientX - startPositionRef.current.x, maxX)
        );
        const newY = Math.max(
          0,
          Math.min(position.y + e.clientY - startPositionRef.current.y, maxY)
        );
        setPosition({ x: newX, y: newY });
        startPositionRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleChange = (e) => {
    const { name, files, value, type } = e.target;

    if (type === "file" && e.target.accept.includes("image/*")) {
      const file = files[0];

      // Validar que el archivo sea una imagen
      if (!file.type.startsWith('image/') && file.type !== 'image/gif') {
        setAlertOpen(true);
        setAlertMessage("Solo se permiten archivos de imagen.");
        setTimeout(() => {
          setAlertOpen(false);
          setAlertMessage("");
        }, 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const maxSizeBytes = 1 * 1024 * 1024; // 1 MB
        if (file.size > maxSizeBytes) {
          setAlertOpen(true);
          setAlertMessage(
            "El tamaño del archivo excede el límite permitido (1 MB)."
          );
          setTimeout(() => {
            setAlertOpen(false);
            setAlertMessage("");
          }, 3000);
          return;
        }

        setFormValues((prevFormValues) => ({
          ...prevFormValues,
          [name]: file,
          [`${name}_preview`]: reader.result,
        }));

        // No agregar campos adicionales para nombre y tamaño
      };
      reader.readAsDataURL(file);
    } else {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [name]: type === "file" ? files[0] : value,
      }));
    }

    if (onChange) {
      onChange(name, type === "file" ? files[0] : value);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleRemoveImage = (name) => {
    setFormValues((prevFormValues) => {
      const newFormValues = { ...prevFormValues };
      delete newFormValues[name];
      delete newFormValues[`${name}_preview`];
      return newFormValues;
    });
    setImagePreview(null);
    setExtraFields((prevExtraFields) =>
      prevExtraFields.filter(
        (field) =>
          field.name !== `${name}_name` && field.name !== `${name}_size`
      )
    );
  };

  const validateField = (name, value, type) => {
    let error = "";

// Validaciones para Descripcion_Servicio
if (name === "Descripcion_Servicio") {
  if (!value.trim()) {
    error = "La descripción está vacía.";
  } else if (value.trim().length < 20) {
    error = "La descripción debe tener al menos 20 caracteres.";
  } else if ((value.match(/[a-zA-ZñÑ]/g) || []).length < 10) {
    error = "La descripción debe contener al menos 10 letras.";
  }
  return error;
}

    if (name === "correo_proveedor") {
      if (!/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
        error = "El correo electrónico no es válido.";
      }
    } else if (name === "telefono_proveedor") {
      if (!/^\+?\d+$/.test(value)) {
        error = "El número de teléfono solo puede contener números.";
      }
    } else if (name === "direccion_proveedor") {
      const regex = /^[a-zA-ZñÑ0-9\s#-]*$/;
      const containsThreeLetters = /[a-zA-ZñÑ].*[a-zA-ZñÑ].*[a-zA-ZñÑ]/;
      const containsSixNumbers = /[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9]/;
      const containsOneHash = /^(?=(?:[^#]*#){0,1}[^#]*$)/;
      const containsOneDash = /^(?=(?:[^-]*-){0,1}[^-]*$)/;

      if (!regex.test(value)) {
        error =
          "La dirección solo puede contener letras, números, espacios, # y -.";
      } else if (!containsThreeLetters.test(value)) {
        error = "La dirección debe contener al menos 3 letras.";
      } else if (!containsSixNumbers.test(value)) {
        error = "La dirección debe contener al menos 6 números.";
      } else if (!containsOneHash.test(value)) {
        error =
          'La dirección solo puede contener un único carácter especial "#".';
      } else if (!containsOneDash.test(value)) {
        error =
          'La dirección solo puede contener un único carácter especial "-".';
      }
    } else if (name === "NIT") {
      if (!/^\d+(-\d+)?$/.test(value)) {
        error = 'El NIT solo puede contener números.';
      }
    }else if(name == "nombre_proveedor"){
      if (!/[a-zA-ZñÑ]{4,}/.test(value)) {
        error = "El nombre del proveedor debe contener al menos 4 letras.";
      }

    }else if (name === "NombreInsumos") {
      if (!/[a-zA-ZñÑ]{4,}/.test(value)) {
        error = "El nombre de la categoría debe contener al menos 4 letras.";
      }      
      else if (/[^a-zA-Z0-9ñÑ\s]/.test(value)) {
        error = "El nombre de la categoría no puede contener caracteres especiales.";
      }
    } else if (name === "empresa_proveedor") {
      if (!/[a-zA-ZñÑ]{4,}/.test(value)) {
        error = "El nombre de la categoría debe contener al menos 4 letras.";
      }
      
      else if (/[^a-zA-Z0-9ñÑ\s]/.test(value)) {
        error = "El nombre de la empresa no puede contener caracteres especiales.";
      }
    }else if (name === "Precio_Servicio") {
      if (value < 20000) {
        error = "El precio debe ser mayor de $20.000.";
      }
    } else {
      switch (type) {
        case "text":
          if (!/^[a-zA-ZñÑ\s]*$/.test(value)) {
            error = "El campo solo puede contener letras y espacios.";
          }
          break;
          case "textarea":
          if (!/^[a-zA-ZñÑ\s]*$/.test(value)) {
            error = "El campo solo puede contener letras y espacios.";
          }
          break;
        case "number":
          if (isNaN(value) || Number(value) <= 0) {
            error = "El campo debe ser un número positivo.";
          }
          break;
        default:
          break;
      }
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value, type } = e.target;
    const error = validateField(name, value, type);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSubmit = async () => {
    try {
      setProgressVisible(true); 
      if (typeof onSubmit === "function") {
        let hasErrors = false;

        const newErrors = {};
        fields.forEach((field) => {
          const error = validateField(
            field.name,
            formValues[field.name],
            field.type
          );
          if (error) {
            hasErrors = true;
            newErrors[field.name] = error;
          }
        });

        if (hasErrors) {
          setErrors(newErrors);
          setProgressVisible(false);
          return;
        }

        await onSubmit(formValues);
      } else {
        console.error("onSubmit is not a function");
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setAlertOpen(true);
      setAlertMessage(
        "Error al enviar el formulario. Por favor, inténtelo de nuevo."
      );
      setTimeout(() => {
        setAlertOpen(false);
        setAlertMessage("");
      }, 3000);
    } finally {
      setProgressVisible(false); // Ocultar la barra de progreso al finalizar
    }
  };

  const handleCancel = () => {
    // Limpiar formValues
    const clearedFormValues = {};
    Object.keys(formValues).forEach((key) => {
      clearedFormValues[key] = "";
    });
    setFormValues(clearedFormValues);

    setExtraFields([]);

    handleClose();
  };

  const renderFields = () => {
    return fields.concat(extraFields).map((field, index) => (
      <Grid item xs={12} sm={field.type === "file" ? 12 : 6} key={index}>
        {renderFieldByType(field)}
      </Grid>
    ));
  };

  const handleImageChange = (e, name) => {
    const { files } = e.target;
    const file = files[0];
  
    if (file) {
      if (!file.type.startsWith('image/') && file.type !== 'image/gif') {
        setAlertOpen(true);
        setAlertMessage("Solo se permiten archivos de imagen.");
        setTimeout(() => {
          setAlertOpen(false);
          setAlertMessage("");
        }, 3000);
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        const maxSizeBytes = 1 * 1024 * 1024; // 1 MB
        if (file.size > maxSizeBytes) {
          setAlertOpen(true);
          setAlertMessage("El tamaño del archivo excede el límite permitido (1 MB).");
          setTimeout(() => {
            setAlertOpen(false);
            setAlertMessage("");
          }, 3000);
          return;
        }
  
        setFormValues((prevFormValues) => ({
          ...prevFormValues,
          [name]: file,
          [`${name}_preview`]: reader.result,
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const renderFieldByType = (field) => {
    const { name, label, type, options, disabled } = field;

    switch (type) {
      case "text":
      case "password":
      case "number":
        return (
          <TextField
          id={name}
          name={name}
          label={label}
          variant="outlined"
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          size="medium"
          type={type}
          value={formValues[name] || ""}
          error={!!errors[name]}
          helperText={errors[name]}
          multiline={name === "Descripcion_Servicio"}
          minRows={name === "Descripcion_Servicio" ? 4 : 1} 
          maxRows={name === "Descripcion_Servicio" ? 4 : undefined} 
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
            '& .MuiFormLabel-root': {
              color: 'text.primary',
            },
            '& .MuiFormHelperText-root': {
              color: 'error.main',
            },
          }}
          InputProps={{
            style: {
              maxHeight: name === "Descripcion_Servicio" ? "200px" : "auto", 
              overflowY: "auto", 
            },
          }}
        />
        );
          case "textarea": // Añadido para el tipo textarea
      return (
        <TextareaAutosize
          id={name}
          name={name}
          minRows={4}
          placeholder={label}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            borderColor: '#ccc',
            fontFamily: 'inherit',
            fontSize: '16px',
          }}
          onChange={handleChange}
          value={formValues[name] || ""}
          disabled={disabled}
        />
      );
        case "select":
          return (
            <FormControl fullWidth variant="outlined" size="medium">
              <InputLabel id={`${name}-label`} sx={{ color: 'text.primary' }}>{label}</InputLabel>
              <Select
                labelId={`${name}-label`}
                id={name}
                name={name}
                onChange={handleChange}
                value={formValues[name] || ""}
                label={label}
                sx={{
                  marginBottom: "0.5rem",
                  textAlign: "center",
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px', // Bordes redondeados
                  },
                  '& .MuiSelect-select': {
                    textAlign: "center",
                  }
                }}
                InputLabelProps={{
                  shrink: true, // La etiqueta estará dentro del Select
                }}
              >
                {options &&
                  options.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          );
        case "file":
          return (
            <div className="flex items-center justify-center w-full relative">
      {isEditing ? (
        <>
          {imagePreview ? (
            <div style={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '150%',
                  maxWidth: '150px',
                  height: 'auto',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '50px',
                }}
              />
              <IconButton
                size="small"
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                }}
                onClick={() => handleRemoveImage(name)}
              >
                <CloseIcon />
              </IconButton>
            </div>
          ) : (
            <label
              htmlFor={`file-input-${name}`}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              style={{ width: '100%', height: '150px', maxWidth: '500px', textAlign: 'center', marginBottom: '0.5rem', position: 'relative' }}
            >
              <CameraAltIcon
                style={{
                  fontSize: '4rem',
                  color: '#9e9e9e',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              {/* <Typography variant="body1" style={{ fontWeight: 'bold', marginTop: '2rem' }}>
                Click para seleccionar una imagen
              </Typography> */}
              <input
                id={`file-input-${name}`}
                type="file"
                name={name}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, name)}
              />
            </label>
          )}
        </>
      ) : (
        <>
          {formValues[`${name}_preview`] ? (
            <div style={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
              <img
                src={formValues[`${name}_preview`]}
                alt="Preview"
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  height: 'auto',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
              <IconButton
                size="small"
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                }}
                onClick={() => handleRemoveImage(name)}
              >
                <CloseIcon />
              </IconButton>
            </div>
          ) : (
            <label
  htmlFor={`file-input-${name}`}
  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100"
  style={{
    width: '150px', // Aseguramos que el ancho y alto sean iguales
    height: '150px',
    textAlign: 'center',
    marginBottom: '0.5rem',
    position: 'relative',
    borderRadius: '50%', // Usamos 50% para que sea circular
  }}
>
  <CameraAltIcon
    style={{
      fontSize: '4rem',
      color: '#9e9e9e',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}
  />
  
  <input
    id={`file-input-${name}`}
    type="file"
    name={name}
    accept="image/*"
    className="hidden"
    onChange={(e) => handleImageChange(e, name)}
  />
</label>

          )}
        </>
      )}
    </div>
  );
      default:
        return null;
    }
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <div
        ref={modalContainerRef}
        className="modal-container"
        style={{
          position: "absolute",
          top: `${position.y}px`,
          left: `${position.x}px`,
          backgroundColor: "white",
          borderRadius: "0.375rem",
          width: "80%",
          borderRadius: "8px",
          maxWidth: "50rem",
          maxHeight: "80%",
          overflow: "auto",
          padding: "1.5rem",
          zIndex: 9999,
          boxShadow: dragging ? "0 8px 16px rgba(0,0,0,0.5)" : "none",
          transition: "box-shadow 0.3s",
        }}
      >
        <Stack
          sx={{
            position: "fixed",
            top: "1rem",
            width: "100%",
            display: alertOpen ? "flex" : "none",
            justifyContent: "center",
            zIndex: 10000,
          }}
          spacing={2}
        >
          <Alert severity="warning">{alertMessage}</Alert>
        </Stack>

        {progressVisible && (
          <div
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "2px",
              backgroundColor: "#29D",
              zIndex: "99999",
            }}
          />
        )}

        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: dragging ? "grabbing" : "grab", // Cambio de cursor aquí
            padding: "1rem",
            backgroundColor: dragging ? "#f0f0f0" : "transparent", // Cambio de color de fondo cuando se arrastra
            boxShadow: dragging ? "0 4px 8px rgba(0,0,0,0.2)" : "none", // Sombra cuando se arrastra
            transition: "background-color 0.3s, box-shadow 0.3s, cursor 0.3s", // Transiciones ajustadas
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
        <Grid container spacing={2} style={{ marginTop: "1rem" }}>
          {renderFields()}
        </Grid>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1rem",
          }}
        >
          <Button
            onClick={handleCancel}
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
            Enviar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalDinamico;
