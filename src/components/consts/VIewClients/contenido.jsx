import React, { useState, useEffect,  useRef } from "react";
import NavbarClient from "./Navbarclient";
import Footer from "./Footer";
import { Box, TextField, InputAdornment, Typography, Grid, Card, CardHeader, CardContent, CardActions, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider } from '@mui/material';
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function Contenidoitems() {
  const [servicios, setServicios] = useState([]);
  const navigate = useNavigate();
  const [maxCardHeight, setMaxCardHeight] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const cardRefs = useRef([]);
  const [filter, setFilter] = useState({ nombre: "", precio: "", hora: "" });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/servicios")
      .then((response) => {
        setServicios(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los servicios:", error);
      });
  }, []);

  useEffect(() => {
    if (cardRefs.current.length) {
      const heights = cardRefs.current.map(ref => ref ? ref.getBoundingClientRect().height : 0);
      const maxHeight = Math.max(...heights);
      console.log("Max Card Height:", maxHeight); 
      setMaxCardHeight(maxHeight);
    }
  }, [servicios]);
  

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredServicios = servicios.filter((servicio) => {
    return (
      (filter.nombre === "" ||
        servicio.Nombre_Servicio.toLowerCase().includes(
          filter.nombre.toLowerCase()
        )) &&
      (filter.precio === "" ||
        servicio.Precio_Servicio <= parseFloat(filter.precio)) &&
      (filter.hora === "" ||
        servicio.Tiempo_Servicio <= parseFloat(filter.hora))
    );
  });

  const handleCardClick = (servicio) => {
    setSelectedService(servicio);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedService(null);
  };

  const handleRedirect = () => {
    navigate("/solicitarCita"); 
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <NavbarClient />
        <header id="header-hero" className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 300 }}
        >
          <div
            className="header-bg relative p-8 rounded-xl"
            style={{
              backgroundColor: "#ae81d6",
              boxShadow: "0px 1.5px 3px rgba(0, 0, 0, 0.5)",
              paddingTop: "4rem",
              paddingBottom: "4rem",
            }}
          >
            <h2 className="text-3xl font-bold text-white">
              CATALOGO DE NUESTROS SERVICIOS
            </h2>
            <p className="text-lg text-white mt-4">
              Servicios de manicure con estilos únicos y modernos, diseñados
              para resaltar tu belleza y personalidad.
            </p>
          </div>
        </motion.div>
      </header>
  
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          mt: -1,
          mb: 2,
          py: 3,
          backgroundColor: "#f0f4f8", // Color neutro
        }}
      >
        {["Colores Vibrantes", "Diseños Creativos", "Buen Cuidado"].map((title, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: "center", color: "#ff6f61", maxWidth: 200 }} // Color coral claro
          >
            <i className={`bx ${index === 0 ? "bxs-paint" : index === 1 ? "bxs-brush" : "bxs-heart"}`} style={{ fontSize: "55px" }}></i>
            <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold", fontFamily: "Franklin Gothic Medium", textTransform: "uppercase" }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontFamily: "Cambria", fontStyle: "italic" }}>
              {index === 0 ? "Explora una amplia gama de colores que resaltarán tu estilo único y personal." : 
               index === 1 ? "Lleva la creatividad a tus uñas con diseños exclusivos que te encantarán." :
               "Ofrecemos un cuidado completo y profesional para la salud de tus uñas."}
            </Typography>
          </motion.div>
        ))}
      </Box>
  
      {/* Search Filters and Service Cards */}
      <Box sx={{ p: 2, backgroundColor: "#f3f3f3", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            mt: 4,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              type="text"
              name="nombre"
              placeholder="Buscar por nombre"
              value={filter.nombre}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              sx={{ width: "200px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type="number"
              name="precio"
              placeholder="Máx. Precio"
              value={filter.precio}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              sx={{ width: "150px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type="number"
              name="hora"
              placeholder="Máx. Hora"
              value={filter.hora}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              sx={{ width: "150px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
  
        {/* Service Cards */}
        <Grid container spacing={4} justifyContent="center">
          {filteredServicios.map((servicio, index) => (
            <Grid item xs={12} sm={6} md={3} key={servicio.IdServicio}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.05 }}
                ref={(el) => (cardRefs.current[index] = el)}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: `0px 4px 8px rgba(138, 43, 226, 0.5)`,
                    width: "90%",
                    minHeight: maxCardHeight,
                    mx: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <CardHeader
                    title={servicio.Nombre_Servicio}
                    subheader={`Tiempo: ${servicio.Tiempo_Servicio}`}
                  />
                  <Box
                    sx={{
                      height: 200,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`http://localhost:5000${servicio.ImgServicio}`}
                      alt={servicio.Nombre_Servicio}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Precio: {servicio.Precio_Servicio.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
                      })}
                    </Typography>
                  </CardContent>
                  <CardActions
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      py: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#ae81d6",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#ae81d6",
                        },
                        borderRadius: 4,
                      }}
                      onClick={() => handleCardClick(servicio)}
                    >
                      <i
                        className="bx bx-calendar"
                        style={{ fontSize: "20px", marginRight: "8px" }}
                      ></i>
                      Agendar
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
  
      <Dialog
      open={dialogOpen}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          width: "70%", // Ajusta el ancho como desees
          maxWidth: "none", // Desactiva el ancho máximo predeterminado
          height: "70%", // Ajusta la altura como desees
          maxHeight: "90vh", // Limita la altura máxima con un valor en vista altura
        }
      }}
    >
      <DialogTitle>Detalles del Servicio</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(60% - 56px)", // Ajusta la altura restante después del título y acciones
          overflowY: "auto", // Habilita el desplazamiento vertical si el contenido excede la altura
        }}
      >
        {selectedService && (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <img
                src={`http://localhost:5000${selectedService.ImgServicio}`}
                alt={selectedService.Nombre_Servicio}
                style={{
                  maxWidth: "100%",
                  width: "400px", // Ajusta el ancho de la imagen
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              />
            </Box>
            <Box sx={{ flex: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                {selectedService.Nombre_Servicio}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Tiempo:</strong> {selectedService.Tiempo_Servicio}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Precio:</strong> {selectedService.Precio_Servicio.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                })}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Descripción:</strong> {selectedService.Descripcion_Servicio}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
      <Footer />
    </div>
  );
}

export default Contenidoitems;
