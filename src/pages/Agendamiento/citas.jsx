import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Paper,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";
import Swal from "sweetalert2";

const Citas = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs());
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [isInactiveDay, setIsInactiveDay] = useState(false);

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/jackenail/Listar_Empleados"
        );
        console.log("Empleados cargados:", response.data);
        if (Array.isArray(response.data)) {
          setEmpleados(response.data);
        } else {
          console.error("Los datos de empleados no son un array");
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      }
    };
    cargarEmpleados();
  }, []);

  useEffect(() => {
    const obtenerHorasOcupadas = async () => {
      if (!empleadoSeleccionado || !fechaSeleccionada) return;

      console.log(
        "Obteniendo horas ocupadas para empleado:",
        empleadoSeleccionado
      );
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/agendas/horasOcupadas",
          {
            params: {
              fecha: fechaSeleccionada.format("YYYY-MM-DD"),
              idEmpleado: empleadoSeleccionado,
            },
          }
        );
        console.log("Horas ocupadas obtenidas:", response.data); // Verifica si se obtienen las horas correctamente
        setHorasOcupadas(response.data);
      } catch (error) {
        console.error("Error al obtener horas ocupadas:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerHorasOcupadas();
  }, [empleadoSeleccionado, fechaSeleccionada]);

  const generarHorasDisponibles = () => {
    const horas = [];
    const inicioDia = 8;
    const finDia = 16;

    for (let i = inicioDia; i <= finDia; i++) {
      const hora = `${i < 10 ? "0" + i : i}:00`;
      const horaOcupada = horasOcupadas.includes(hora);
      if (!horaOcupada) {
        horas.push(hora);
      }
    }

    console.log("Horas disponibles generadas:", horas); // Muestra las horas disponibles generadas
    return horas;
  };

  const handleHoraSeleccionada = (time) => {
    console.log("Hora seleccionada:", time); // Verifica cuál hora seleccionas
    if (!horasOcupadas.includes(time)) {
      setHoraSeleccionada(time);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4">Crear Nueva Cita</Typography>

        <FormControl fullWidth margin="normal">
  <InputLabel>Selecciona un Empleado</InputLabel>
  <Select
  value={empleadoSeleccionado || ""}
  onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
>
    {empleados.length > 0 ? (
      empleados.map((empleado) => (
        <MenuItem key={empleado.id} value={empleado.id}>
          {empleado.Nombre} {empleado.Apellido}
        </MenuItem>
      ))
    ) : (
      <MenuItem value="" disabled>
        No hay empleados disponibles
      </MenuItem>
    )}
  </Select>
</FormControl>

        <StaticDatePicker
  displayStaticWrapperAs="desktop"
  value={fechaSeleccionada}
  onChange={(newValue) => {
    console.log('Fecha seleccionada:', newValue.format('YYYY-MM-DD')); // Verifica qué fecha se selecciona
    setFechaSeleccionada(newValue);
  }}
  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
/>

        <Paper
          sx={{
            padding: 2,
            marginTop: 3,
            borderRadius: "12px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Selecciona una Hora
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <List>
              {generarHorasDisponibles().map((time) => (
                <Tooltip
                  key={time}
                  title={horasOcupadas.includes(time) ? "Hora ocupada" : ""}
                >
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleHoraSeleccionada(time)}
                      disabled={horasOcupadas.includes(time)}
                      sx={{
                        backgroundColor: horasOcupadas.includes(time)
                          ? "#ffcdd2"
                          : "transparent",
                        margin: "4px 0",
                        borderRadius: "12px",
                      }}
                    >
                      {time}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default Citas;
