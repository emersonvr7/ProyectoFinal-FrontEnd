import React, { useState, useEffect } from 'react';
import { Modal, Button, IconButton, Typography, Box, Paper, Checkbox } from '@mui/material';
import { ArrowLeft, ArrowRight, Close as CloseIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker, PickersDay } from '@mui/x-date-pickers';

dayjs.locale('es');

const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 11; hour++) {
        times.push(dayjs().hour(hour).minute(0).format('HH:mm'));
    }
    for (let hour = 13; hour <= 16; hour++) {
        times.push(dayjs().hour(hour).minute(0).format('HH:mm'));
    }
    return times;
};

const InactivarHorasModal = ({ open, onClose, onHoursInactivated }) => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedHours, setSelectedHours] = useState([]);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [inactiveDates, setInactiveDates] = useState([]);
    const [isDateInactive, setIsDateInactive] = useState(false); // Para verificar si el día es inactivo

    useEffect(() => {
        axios.get('http://localhost:5000/api/horarios')
            .then(response => {
                const inactiveDays = response.data
                    .filter(horario => horario.estado === 'inactivo')
                    .map(horario => dayjs(horario.fecha));
                setInactiveDates(inactiveDays);
            })
            .catch(error => console.error('Error al obtener horarios:', error));
    }, []);

    useEffect(() => {
        // Verificar si la fecha seleccionada está marcada como inactiva
        const isInactive = inactiveDates.some(inactiveDate => inactiveDate.isSame(selectedDate, 'day'));
        setIsDateInactive(isInactive);

        if (isInactive) {
            Swal.fire({
                icon: 'warning',
                title: 'Fecha Inactiva',
                text: 'No puedes inactivar horas en un día ya inactivo.',
            });
            setSelectedHours([]);  // Limpiar las horas seleccionadas si el día está inactivo
        }
    }, [selectedDate, inactiveDates]);

    const handleToggleHour = (hour) => {
        if (isDateInactive) return;  // Evitar selección si el día está inactivo

        setSelectedHours(prevHours =>
            prevHours.includes(hour) ? prevHours.filter(h => h !== hour) : [...prevHours, hour]
        );
    };

    const handleSubmit = async () => {
        if (!selectedDate || selectedHours.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos vacíos',
                text: 'Por favor, selecciona una fecha y al menos una hora.',
            });
            return;
        }

        const confirmation = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Quieres inactivar las horas seleccionadas?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, inactivar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmation.isConfirmed) return;

        try {
            await axios.post('http://localhost:5000/api/horarios/inactivarHoras', {
                fecha: selectedDate.format('YYYY-MM-DD'),
                horas: selectedHours
            });

            if (typeof onHoursInactivated === 'function') {
                onHoursInactivated();
            }

            Swal.fire('¡Horas inactivadas!', 'Las horas han sido registradas como inactivas con éxito.', 'success');
            onClose();
        } catch (error) {
            console.error('Error al inactivar horas', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema con la solicitud. Por favor, inténtalo de nuevo.',
            });
        }
    };

    const handleCarouselChange = (direction) => {
        setCarouselIndex(prev => {
            if (direction === 'left') {
                return Math.max(prev - 5, 0);
            } else if (direction === 'right') {
                return Math.min(prev + 5, generateTimeOptions().length - 5);
            }
        });
    };

    const renderDay = (date, selectedDate, pickersDayProps) => {
        const isInactive = inactiveDates.some(inactiveDate => inactiveDate.isSame(date, 'day'));
        return (
            <PickersDay
                {...pickersDayProps}
                sx={{
                    ...(isInactive && {
                        backgroundColor: 'red',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'darkred',
                        },
                    }),
                }}
                disabled={isInactive}
            />
        );
    };

    const timeOptions = generateTimeOptions();

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
            <Box
                sx={{
                    width: '90%',
                    maxWidth: 600,
                    bgcolor: 'background.paper',
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                    position: 'relative',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                    <Typography variant="h6" id="modal-title">
                        Inactivar Horas De Trabajo
                    </Typography>
                    <IconButton onClick={onClose} color="inherit">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Paper elevation={5} sx={{ mb: 2 }}>
                        <StaticDatePicker
                            displayStaticWrapperAs="desktop"
                            orientation="landscape"
                            openTo="day"
                            value={selectedDate}
                            onChange={setSelectedDate}
                            renderDay={renderDay}
                            minDate={dayjs()}
                        />
                    </Paper>
                </LocalizationProvider>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => handleCarouselChange('left')} disabled={carouselIndex === 0}>
                        <ArrowLeft />
                    </IconButton>
                    <Box sx={{ flex: 1, overflowX: 'auto' }}>
                        <motion.div
                            className="carousel-items"
                            initial={{ x: -100 }}
                            animate={{ x: 0 }}
                            exit={{ x: 100 }}
                            transition={{ duration: 0.3 }}
                            style={{ display: 'flex', flexDirection: 'row', paddingBottom: 16 }}
                        >
                            {timeOptions.slice(carouselIndex, carouselIndex + 5).map((hour, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: 80,
                                        height: 60,
                                        borderRadius: 1,
                                        backgroundColor: selectedHours.includes(hour) ? '#796EA8' : '#f0f0f0',
                                        mx: 1,
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: 1,
                                        '&:hover': {
                                            backgroundColor: selectedHours.includes(hour) ? '#554D74' : '#e0e0e0'
                                        }
                                    }}
                                    onClick={() => handleToggleHour(hour)}
                                >
                                    <Typography variant="body2">{hour}</Typography>
                                    <Checkbox checked={selectedHours.includes(hour)} />
                                </Box>
                            ))}
                        </motion.div>
                    </Box>
                    <IconButton onClick={() => handleCarouselChange('right')} disabled={carouselIndex >= timeOptions.length - 5}>
                        <ArrowRight />
                    </IconButton>
                </Box>

                <Box mt={2} display="flex" justifyContent="space-between">
                    <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ marginRight: 2 }} disabled={isDateInactive}>
                        Inactivar
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default InactivarHorasModal;
