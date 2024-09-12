import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
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
    // Actualiza el estado de horas ocupadas en el componente CustomTimeSelect
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
            <Typography variant="h6" component="h2" align="center" gutterBottom>
              Seleccionar Empleado, Servicio y Cliente
            </Typography>
            <Box>
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
              <FormControl fullWidth margin="normal">
                <InputLabel id="select-empleado-label">Empleado</InputLabel>
                <Select
                  labelId="select-empleado-label"
                  value={selectedEmpleado}
                  onChange={(e) => setSelectedEmpleado(e.target.value)}
                >
                  {empleados.map((empleado) => (
                    <MenuItem
                      key={empleado.IdEmpleado}
                      value={empleado.IdEmpleado}
                    >
                      {empleado.Nombre} {empleado.Apellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            </Box>
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
          <Paper
            elevation={4}
            style={{
              padding: "20px",
              borderRadius: "10px",
              marginTop: "20px",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Confirmar Cita
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              {imagenServicio && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  mr={2}
                  sx={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    width: "150px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={imagenServicio}
                    alt="Servicio"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "10px",
                      cursor: "pointer",
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
                </Box>
              )}
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                ml={2}
                sx={{ width: "100%" }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6">Servicio:</Typography>
                    <Typography variant="body1">
                      {servicioSeleccionado?.Nombre_Servicio}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Empleado:</Typography>
                    <Typography variant="body1">
                      {empleadoSeleccionado?.Nombre}{" "}
                      {empleadoSeleccionado?.Apellido}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Cliente:</Typography>
                    <Typography variant="body1">
                      {clienteSeleccionado?.Nombre}{" "}
                      {clienteSeleccionado?.Apellido}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Fecha:</Typography>
                    <Typography variant="body1">
                      {dayjs(date).format("DD/MM/YYYY")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Hora:</Typography>
                    <Typography variant="body1">{selectedTime}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Precio:</Typography>
                    <Typography variant="body1">${precioServicio}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Duración:</Typography>
                    <Typography variant="body1">
                      {tiempoServicio} minutos
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        )}
      </div>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          <ArrowBackIosIcon /> Atrás
        </Button>
        <Button variant="contained" color="primary" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Confirmar" : "Siguiente"}
          <ArrowForwardIosIcon />
        </Button>
      </Box>
    </Container>
  );
};

export default CrearCitas;
