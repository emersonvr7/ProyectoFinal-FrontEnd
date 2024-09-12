import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarIcon from "@mui/icons-material/Star";
import { motion } from "framer-motion"; // Importar framer-motion

const NoCitasCard = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "735px", // Centrar la card en la pantalla
        padding: "20px",
      }}
    >
      {/* Añadir animación al box */}
      <motion.div
        whileHover={{ scale: 1.05 }} // Al pasar el cursor, la card crece ligeramente
        whileTap={{ scale: 0.95 }}    // Al hacer clic, se reduce un poco
        initial={{ opacity: 0, y: 30 }} // Inicia con opacidad 0 y desplazada
        animate={{ opacity: 1, y: 0 }}  // Al cargar, la opacidad sube y vuelve a su posición original
        transition={{ duration: 0.5 }}  // Duración de la animación
      >
        <Box
          sx={{
            borderRadius: "16px",
            border: "none",
            padding: "30px",
            backgroundColor: "#ffffff",
            textAlign: "center",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            maxWidth: "550px",
            height: "auto",
            position: "relative",
          }}
        >
          {/* Ícono de calendario */}
          <Box
            sx={{
              fontSize: "50px",
              mb: 2,
              color: "#7b1fa2",
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: "50px" }} />
          </Box>

          {/* Texto principal */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: "#7b1fa2",
            }}
          >
            ¡Sin citas programadas!
          </Typography>

          {/* Texto descriptivo */}
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "#6a1b9a",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Relájate y no te preocupes, puedes{" "}
            <Link
              to="/solicitarCita"
              style={{
                color: "#ff80ab",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              agendar una cita
            </Link>{" "}
            cuando lo desees y disfrutar de nuestros{" "}
            <Link
              to="/Catalogo"
              style={{
                color: "#ff80ab",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              maravillosos servicios de manicura.
            </Link>
          </Typography>

          {/* Botón con animación de titileo */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }} // Animación de titileo
            transition={{ repeat: Infinity, duration: 1.5 }} // Repetir infinitamente
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#e91e63",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#d81b60",
                },
                borderRadius: "24px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              component={Link}
              to="/solicitarCita"
            >
              ¡Registrar cita ahora!
            </Button>
          </motion.div>

          {/* Ícono decorativo */}
          <Box
            sx={{
              position: "absolute",
              bottom: "-20px",
              right: "10px",
              fontSize: "80px",
              color: "#f8bbd0",
            }}
          >
            <StarIcon sx={{ fontSize: "80px" }} />
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default NoCitasCard;
