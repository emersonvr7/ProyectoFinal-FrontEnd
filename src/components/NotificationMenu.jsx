import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, IconButton, Typography, Divider, Tabs, Tab, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const NotificationCard = styled('div')(({ theme, read, expanded }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: read ? 'transparent' : theme.palette.action.hover,
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  minHeight: expanded ? '100px' : '50px',  // Expande el tamaño al hacer clic
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const NotificationModal = ({ open, handleClose, setNotificaciones, notificaciones, unreadCount, setUnreadCount }) => {
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState('aplazamiento'); // Estado para el valor de la pestaña

  // Marcar notificación como leída
  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.put(`http://localhost:5000/api/notificaciones/${notifId}/leido`);
      setNotificaciones(prevNotifs => 
        prevNotifs.map(notif => 
          notif.IdNotificacion === notifId ? { ...notif, Leido: true } : notif
        )
      );
      setUnreadCount(prevCount => prevCount - 1);
    } catch (error) {
      console.error("Error al marcar la notificación como leída", error);
    }
  };

  // Expandir notificación
  const handleExpandNotification = (notifId) => {
    setExpandedNotification(prev => prev === notifId ? null : notifId);
  };

  // Eliminar notificación
  const handleDeleteNotification = async (notifId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notificaciones/${notifId}`);
      setNotificaciones(prevNotifs => prevNotifs.filter(notif => notif.IdNotificacion !== notifId));
    } catch (error) {
      console.error("Error al eliminar la notificación", error);
    }
  };

  // Filtrar notificaciones basadas en la pestaña seleccionada
  const filteredNotificaciones = notificaciones
  .filter(notif => tabValue === 'otro' || notif.Tipo === tabValue)  // Añadido el filtro para "Otro"
  .filter(notif =>
    notif.Tipo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    notif.Mensaje.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"  // Esto hace que el modal sea más grande
    >
      <DialogTitle>
        Notificaciones
        <IconButton aria-label="close" onClick={handleClose} style={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Barra de pestañas */}
        <Tabs
  value={tabValue}
  onChange={(e, newValue) => setTabValue(newValue)}
  aria-label="notificaciones tabs"
  variant="scrollable"
  scrollButtons="auto"
  sx={{ marginBottom: '20px' }}
>
  <Tab label="Aplazar cita" value="aplazar" />
  <Tab label="Anular cita" value="anular" />
  <Tab label="Otro" value="otro" />
</Tabs>

        {/* Barra de búsqueda */}
        <TextField
          label="Buscar"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <Divider />

        {/* Lista de Notificaciones */}
        {filteredNotificaciones.length === 0 ? (
          <Typography variant="body2" color="textSecondary" style={{ marginTop: '20px' }}>
            No se encontraron notificaciones.
          </Typography>
        ) : (
          filteredNotificaciones.map((notif) => (
            <NotificationCard
              key={notif.IdNotificacion}
              onClick={() => handleMarkAsRead(notif.IdNotificacion)}
              read={notif.Leido}
              expanded={expandedNotification === notif.IdNotificacion}
            >
              <div onClick={() => handleExpandNotification(notif.IdNotificacion)} style={{ flex: 1 }}>
                <Typography variant="body1" component="p" noWrap={!expandedNotification === notif.IdNotificacion}>
                  <strong>{notif.Tipo}</strong>
                </Typography>
                <Typography variant="body2" component="p" noWrap={!expandedNotification === notif.IdNotificacion}>
                  {notif.Mensaje}
                </Typography>
              </div>
              <IconButton onClick={() => handleDeleteNotification(notif.IdNotificacion)} aria-label="delete">
                <DeleteIcon color="error" />
              </IconButton>
            </NotificationCard>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
