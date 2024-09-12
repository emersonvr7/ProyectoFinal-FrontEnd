import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../../../context/ContextoUsuario";
import { Typography, Box, Button } from "@mui/material";
import NavbarClient from "../Navbarclient";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import EventModal from "../components/EventModal";
import dayjs from "dayjs";
import NoCitasCard from "../components/NoCitasCard";
import Swal from "sweetalert2";
import MessageModal from "../components/MessageModal"; // Importa MessageModal

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user } = useContext(UserContext);
  
  const [openMessageModal, setOpenMessageModal] = useState(false); // Estado para el modal
  const [selectedAgendaId, setSelectedAgendaId] = useState(null); // ID de la agenda

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/agendas/misCitas",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (Array.isArray(response.data)) {
          setCitas(response.data);
        } else {
          setCitas([]);
        }
        setLoading(false);
      } catch (error) {
        setError("Hubo un problema al cargar las citas.");
        setLoading(false);
      }
    };

    if (user) {
      fetchCitas();
    }
  }, [user]);

  if (loading) {
    return <p>Cargando citas...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const eventos = citas.map((cita) => ({
    title: `${cita.servicio.Nombre_Servicio} con ${cita.empleado.Nombre}`,
    start: `${cita.Fecha}T${cita.Hora}`,
    end: `${cita.Fecha}T${cita.HoraFin}`,
    extendedProps: {
      servicio: cita.servicio.Nombre_Servicio,
      empleado: `${cita.empleado.Nombre} ${cita.empleado.Apellido}`,
      imgServicio: `http://localhost:5000${cita.servicio.ImgServicio}`,
      idAgenda: cita.IdAgenda,
      estadoAgenda: cita.EstadoAgenda,
    },
  }));

  const handleCancelCita = (idAgenda) => {
    setSelectedAgendaId(idAgenda); // Guardar el idAgenda
    setOpenMessageModal(true); // Abrir el modal
  };

  const handleCloseMessageModal = () => {
    setOpenMessageModal(false);
    setSelectedAgendaId(null); // Limpiar el idAgenda al cerrar
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const truncateTitle = (title, maxLength = 20) => {
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + "...";
    }
    return title;
  };

  const currentDate = new Date();
  const minDate = currentDate.toISOString().split("T")[0];
  const maxDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1)).toISOString().split("T")[0];

  return (
    <div className="mis-citas-container">
      <NavbarClient />
      <Box
        sx={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "auto",
          marginTop: "60px",
        }}
      >
        {citas.length === 0 ? (
          <NoCitasCard /> // Usa el nuevo componente cuando no haya citas
        ) : (
          <Box
            sx={{
              marginTop: "40px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              backgroundColor: "#fdf7ff",
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              events={eventos}
              eventContent={(eventInfo) => {
                const startTime = dayjs(eventInfo.event.start).format("HH:mm");
                const endTime = dayjs(eventInfo.event.end).format("HH:mm");

                // Obtener el estado de la cita desde extendedProps
                const estadoAgenda = eventInfo.event.extendedProps.estadoAgenda;

                // Definir los colores en base al estado
                let eventBackgroundColor = "#44b700"; // Por defecto en verde
                if (estadoAgenda === 1) {
                  eventBackgroundColor = "#2196f3"; // Azul para estado 1
                } else if (estadoAgenda === 2) {
                  eventBackgroundColor = "#f44336"; // Rojo para estado 2 (anulado)
                }

                return (
                  <div style={{ position: "relative", backgroundColor: eventBackgroundColor, padding: '5px', borderRadius: '5px' }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "-35px",
                        left: "16%",
                        transform: "translateX(-50%)",
                        fontSize: "20px",
                      }}
                    >
                      💅
                    </div>
                    <div style={{ color: "#fff" }}> {/* Para asegurar que el texto sea visible */}
                      <strong>{truncateTitle(eventInfo.event.title)}</strong>
                      <br />
                      {startTime} - {endTime}
                    </div>
                  </div>
                );
              }}
              eventClick={handleEventClick} // Evento de clic en cita
              height="auto"
              contentHeight="500px"
              aspectRatio={1.5}
              dayMaxEventRows={3}
              eventTextColor="white"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              validRange={{
                start: minDate,
                end: maxDate,
              }}
              views={{
                dayGridMonth: {
                  titleFormat: { year: "numeric", month: "long" },
                },
              }}
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
              }}
              dayCellClassNames="day-cell"
            />
          </Box>
        )}

        {selectedEvent && (
          <EventModal
            open={Boolean(selectedEvent)}
            handleClose={handleCloseModal}
            event={selectedEvent}
            handleCancel={handleCancelCita} // Función de cancelación
          />
        )}

        {/* Modal para enviar el mensaje */}
        <MessageModal
          open={openMessageModal}
          handleClose={handleCloseMessageModal}
          idAgenda={selectedAgendaId}
        />
      </Box>
    </div>
  );
};

export default MisCitas;
