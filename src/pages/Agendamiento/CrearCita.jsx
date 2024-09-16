import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import StyledStaticDatePicker from "../../components/consts/StaticDatePickerLandscape";
import CustomTimeSelect from "../../components/consts/CustomTimeSelect";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';
const steps = [
  "Seleccionar Empleado, Servicio y Cliente",
  "Seleccionar Fecha y Hora",
  "Confirmar Cita",
];

const CrearCitas = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTime, setSelectedTime] = useState(
    dayjs().hour(15).minute(30).format("HH:mm")
  );
  const [date, setDate] = useState(dayjs());
  const [servicios, setServicios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [selectedCliente, setSelectedCliente] = useState("");
  const [precioServicio, setPrecioServicio] = useState(null);
  const [tiempoServicio, setTiempoServicio] = useState(null);
  const [imagenServicio, setImagenServicio] = useState(null);
  const [imagenEmpleado, setImagenEmpleado] = useState(null);
  const [imagenCliente, setImagenCliente] = useState(null);
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/servicios");
        const activeServices = response.data.filter(
          (servicio) => servicio.EstadoServicio === 1
        );
        setServicios(activeServices);
      } catch (error) {
        console.error("Error fetching servicios:", error);
      }
    };

    const fetchEmpleados = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/jackenail/Listar_Empleados"
        );
        const activeManicuristas = response.data.filter(
          (empleado) => empleado.Estado === 1 && empleado.IdRol === 2
        );
        setEmpleados(activeManicuristas);
      } catch (error) {
        console.error("Error fetching empleados:", error);
      }
    };

    const fetchClientes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/jackenail/Listar_Clientes"
        );
        const activeClient = response.data.filter(
          (cliente) => cliente.Estado === 1
        );
        setClientes(activeClient);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    };

    fetchServicios();
    fetchEmpleados();
    fetchClientes();
  }, []);

  const fetchOccupiedTimes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/agendas/horasOcupadas?fecha=${dayjs(
          date
        ).format("YYYY-MM-DD")}`
      );
      setOccupiedTimes(response.data);
    } catch (error) {
      console.error("Error fetching occupied times:", error);
    }
  };

  useEffect(() => {
    if (date) {
      fetchOccupiedTimes();
    }
  }, [date]);

  const canGoNextStep0 = selectedServicio !== "" && selectedEmpleado !== "" && selectedCliente !== "";
  const canGoNextStep1 = selectedTime !== "" && date !== null;
  
  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      const newAppointment = {
        IdCliente: selectedCliente,
        IdServicio: selectedServicio,
        Fecha: dayjs(date).format("YYYY-MM-DD"),
        Hora: selectedTime,
        IdEmpleado: selectedEmpleado,
        EstadoAgenda: 1,
      };

      try {
        const response = await axios.post(
          "http://localhost:5000/api/agendas/crearAgenda",
          newAppointment
        );
        console.log("Agendamiento creado exitosamente:", response.data);
        navigate("/Agendamiento");
      } catch (error) {
        console.error("Error creando agendamiento:", error);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleEmployeeChange = (event) => {
    const selectedEmployeeId = event.target.value;
    setSelectedEmpleado(selectedEmployeeId);

    const empleadoSeleccionado = empleados.find(
      (empleado) => empleado.IdEmpleado === selectedEmployeeId
    );
    if (empleadoSeleccionado) {
      setImagenEmpleado(
        `http://localhost:5000${empleadoSeleccionado.Img}`
      ); // Asegúrate de que la URL esté bien formada
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleServicioChange = (e) => {
    const servicioId = e.target.value;
    setSelectedServicio(servicioId);

    const servicioSeleccionado = servicios.find(
      (servicio) => servicio.IdServicio === servicioId
    );
    if (servicioSeleccionado) {
      setPrecioServicio(servicioSeleccionado.Precio_Servicio);
      setTiempoServicio(servicioSeleccionado.Tiempo_Servicio);
      setImagenServicio(
        `http://localhost:5000${servicioSeleccionado.ImgServicio}`
      ); // Asegúrate de que la URL esté bien formada
    }
  };
  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setSelectedCliente(clienteId);

    const clienteSeleccionado = clientes.find(
      (cliente) => cliente.IdCliente === clienteId
    );
    if (clienteSeleccionado) {
      setImagenCliente(
        `http://localhost:5000${clienteSeleccionado.Img}`
      ); // Asegúrate de que la URL esté bien formada
    }
  };


  const handleImageClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const servicioSeleccionado = servicios.find(
    (servicio) => servicio.IdServicio === selectedServicio
  );
  const empleadoSeleccionado = empleados.find(
    (empleado) => empleado.IdEmpleado === selectedEmpleado
  );
  const clienteSeleccionado = clientes.find(
    (cliente) => cliente.IdCliente === selectedCliente
  );

  const paperStyle = {
    padding: 16,
    marginTop: 13,
    minHeight: "400px",
  };

  const calcularHoraFin = () => {
    if (selectedTime && tiempoServicio) {
      // Crear un objeto dayjs con la fecha seleccionada y la hora de inicio
      const horaInicio = dayjs(`${dayjs(date).format('YYYY-MM-DD')} ${selectedTime}`, 'YYYY-MM-DD HH:mm');
  
      // Verifica si tiempoServicio es un número (en horas, por lo que se convierte a minutos)
      const duracionServicioEnHoras = parseFloat(tiempoServicio); // Si el tiempo está en horas
      const duracionServicioEnMinutos = duracionServicioEnHoras * 60; // Convertir horas a minutos
  
      if (isNaN(duracionServicioEnMinutos)) {
        console.error('El tiempo de servicio no es válido:', tiempoServicio);
        return 'N/A'; // Valor por defecto si no es válido
      }
  
      // Añadir el tiempo del servicio en minutos
      const horaFin = horaInicio.add(duracionServicioEnMinutos, 'minute');
  
      // Retornar la hora final formateada
      return horaFin.format('HH:mm');
    }
  
    return 'N/A'; // Si no hay tiempo o duración seleccionados
  };

  return (
    <Container>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ marginTop: -3 }}
      >
        Registrar citas!
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ marginTop: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
      {activeStep === 0 && (
  <Paper elevation={3} style={paperStyle}>
    <Typography variant="h5" component="h2" align="center" gutterBottom>
      Seleccionar Empleado, Servicio y Cliente
    </Typography>
    <Grid container spacing={2}>

      {/* Selector de Servicio */}
      <Grid item xs={12} md={4}>
        <Paper elevation={2} style={{ padding: 16 }}>
          <Typography variant="subtitle1" gutterBottom>
            <CalendarMonthIcon sx={{ marginRight: 1 }} />
            Selecciona un Servicio
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-servicio-label">Servicio</InputLabel>
            <Select
              labelId="select-servicio-label"
              value={selectedServicio}
              onChange={handleServicioChange}
            >
              {servicios.map((servicio) => (
                <MenuItem
                  key={servicio.IdServicio}
                  value={servicio.IdServicio}
                >
                  {servicio.Nombre_Servicio}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Mostrar imagen del servicio */}
          {imagenServicio && (
            <Box mt={2} display="flex" justifyContent="center">
              <img
                src={imagenServicio}
                alt="Servicio"
                style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }}
              />
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Selector de Empleado */}
      <Grid item xs={12} md={4}>
        <Paper elevation={2} style={{ padding: 16 }}>
          <Typography variant="subtitle1" gutterBottom>
            <PersonIcon sx={{ marginRight: 1 }} />
            Selecciona un Empleado
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-empleado-label">Empleado</InputLabel>
            <Select
              labelId="select-empleado-label"
              value={selectedEmpleado}
              onChange={(e) => setSelectedEmpleado(e.target.value)}
            >
              {empleados.map((empleado) => (
                <MenuItem key={empleado.IdEmpleado} value={empleado.IdEmpleado}>
                  {empleado.Nombre} {empleado.Apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
         
        </Paper>
      </Grid>

      {/* Selector de Cliente */}
      <Grid item xs={12} md={4}>
        <Paper elevation={2} style={{ padding: 16 }}>
          <Typography variant="subtitle1" gutterBottom>
            <PersonOutlineIcon sx={{ marginRight: 1 }} />
            Selecciona un Cliente
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-cliente-label">Cliente</InputLabel>
            <Select
              labelId="select-cliente-label"
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
            >
              {clientes.map((cliente) => (
                <MenuItem key={cliente.IdCliente} value={cliente.IdCliente}>
                  {cliente.Nombre} {cliente.Apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </Grid>

    </Grid>
  </Paper>
)}
        {activeStep === 1 && (
          <Paper elevation={3} style={paperStyle}>
            <Box display="flex" justifyContent="space-between">
              <Box width="50%">
                <StyledStaticDatePicker
                  date={date}
                  onDateChange={handleDateChange}
                />
              </Box>
              <Box
                width="50%"
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <CustomTimeSelect
                  selectedDate={date}
                  idEmpleado={selectedEmpleado}
                  occupiedTimes={occupiedTimes}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime} // Cambiado de onChange a setSelectedTime
                />
              </Box>
            </Box>
          </Paper>
        )}
        {activeStep === 2 && (
  <Paper elevation={3} style={paperStyle}>
    {/* Encabezado centrado */}
    <div className="text-center mb-4">
      <Typography variant="h4" component="h2" gutterBottom>
        Confirmar Cita
      </Typography>
    </div>

    {/* Contenedor de tarjeta e información en la misma fila */}
    <div className="flex flex-wrap gap-6">
      {/* Card para mostrar la imagen del servicio */}
      {imagenServicio && (
        <Paper
          elevation={2}
          style={{
            maxWidth: "300px",
            flex: "1 1 auto",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "10px", // Borde suavizado
          }}
        >
          <div className="relative">
            <img
              src={imagenServicio}
              alt="Servicio"
              className="w-full object-cover rounded-t-lg"
              style={{
                height: "280px",
                cursor: "pointer",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
              }}
              onClick={handleImageClick}
            />
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Imagen del Servicio</DialogTitle>
              <DialogContent>
                <img
                  src={imagenServicio}
                  alt="Servicio Grande"
                  style={{ width: "100%" }}
                />
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
                  sx={{ position: "absolute", top: 0, right: 0 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-2">
              <h5 className="text-lg font-semibold text-gray-800">
                {servicioSeleccionado?.Nombre_Servicio || "Nombre no disponible"}
              </h5>
              <span className="font-bold text-md text-gray-900">
                {precioServicio ? `$${precioServicio}` : "Precio no disponible"}
              </span>
              <p className="font-medium text-xs text-gray-600">
                Duración: {servicioSeleccionado?.Tiempo_Servicio || "Duración no disponible"}
              </p>
            </div>
          </div>
        </Paper>
      )}

      {/* Información de la cita */}
      <Box flex="1" mb={4}>
        <Typography variant="h6" gutterBottom>
          Información de la Cita
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
            <TableRow>
          <TableCell sx={{ fontWeight: "bold" }}>Empleado</TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ marginRight: 1 }} />
              {empleadoSeleccionado?.Nombre} {empleadoSeleccionado?.Apellido || "No disponible"}
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
  <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
  <TableCell>
    <Box display="flex" alignItems="center">
      <PersonOutlineIcon sx={{ marginRight: 1 }} />
      {clienteSeleccionado?.Nombre} {clienteSeleccionado?.Apellido || "No disponible"}
    </Box>
  </TableCell>
</TableRow>
              <TableRow>
  <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
  <TableCell>
    <Box display="flex" alignItems="center">
      <CalendarMonthIcon sx={{ marginRight: 1 }} />
      {dayjs(date).format("DD/MM/YYYY")}
    </Box>
  </TableCell>
</TableRow>

<TableRow>
  <TableCell sx={{ fontWeight: "bold" }}>Hora</TableCell>
  <TableCell>
    <Box display="flex" alignItems="center">
      <AccessTimeIcon sx={{ marginRight: 1 }} />
      {selectedTime}
    </Box>
  </TableCell>
</TableRow>

<TableRow>
  <TableCell sx={{ fontWeight: "bold" }}>Hora de Fin</TableCell>
  <TableCell>
    <Box display="flex" alignItems="center">
      <ScheduleIcon sx={{ marginRight: 1 }} />
      {calcularHoraFin()}
    </Box>
  </TableCell>
</TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  </Paper>
)}
      </div>
      <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !canGoNextStep0) ||
              (activeStep === 1 && !canGoNextStep1)
            }
          >
            {activeStep === steps.length - 1 ? "Confirmar" : "Siguiente"}
          </Button>
        </Box>
    </Container>
  );
};

export default CrearCitas;
