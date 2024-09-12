import axios from 'axios';
import Fab from '@mui/material/Fab';
import { toast } from "react-toastify";
import { Avatar, DataGrid } from '@mui/material'; 
import Table from "../../components/consts/Tabla";
import React, { useState, useEffect } from "react";
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business'; 
import CustomSwitch from "../../components/consts/switch";
import ModalProveedor from "../../components/consts/modal";
import handleAddProveedor from '../Compras/agregarProveedor';
import CamposObligatorios from "../../components/consts/camposVacios";
import ModalEditarProveedor from "../../components/consts/modalEditar";

const Proveedores = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [openModalAgregar, setOpenModalAgregar] = useState(false);
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [compras, setCompras] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [buscar, setBuscar] = useState('')

  useEffect(() => {
    fetchProveedores();
    fetchCompras();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/proveedores');
      console.log('Datos de proveedores:', response.data); // Verifica la estructura de los datos
      setProveedores(response.data);
      toast.success("Proveedores cargados exitosamente");
    } catch (error) {
      console.error('Error fetching Proveedores:', error);
    }
  };
  

  const fetchCompras = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/compras');
      const data = response.data;
      // Ordenar por IdCompra en orden descendente
      data.sort((a, b) => b.IdCompra - a.IdCompra);
      setCompras(data); 
    } catch (error) {
      console.error('Error fetching Compras:', error);
    }
  };

  const filtrar = proveedores.filter(proveedor =>{
    const {NIT, nombre_proveedor, correo_proveedor, telefono_proveedor,direccion_proveedor, empresa_proveedor, IdProveedor} = proveedor
    const terminoABuscar = buscar.toLowerCase();
    const IdProveedorString = IdProveedor.toString(); 
    const NITString = NIT.toString();
    return(
      NITString.includes(terminoABuscar) ||
      nombre_proveedor.toLowerCase().includes(terminoABuscar) ||
      correo_proveedor.toLowerCase().includes(terminoABuscar) ||
      telefono_proveedor.includes(terminoABuscar) ||
      direccion_proveedor.toLowerCase().includes(terminoABuscar)||
      empresa_proveedor.toLowerCase().includes(terminoABuscar) ||
      IdProveedorString.includes(terminoABuscar) 

    )
  })

  const handleEditProveedor = async (formData) => {
    try {
      const { NIT, correo_proveedor, telefono_proveedor, empresa_proveedor } = formData;
      const response = await axios.get('http://localhost:5000/api/proveedores');
      const proveedores = response.data;
      const proveedorExistenteNIT = proveedores.find(proveedor => proveedor.NIT === NIT && proveedor.IdProveedor !== formData.IdProveedor);
      const proveedorExistenteCorreo = proveedores.find(proveedor => proveedor.correo_proveedor === correo_proveedor && proveedor.IdProveedor !== formData.IdProveedor);
      const proveedorExistenteTelefono = proveedores.find(proveedor => proveedor.telefono_proveedor === telefono_proveedor && proveedor.IdProveedor !== formData.IdProveedor);
      const proveedorExistenteEmpresa = proveedores.find(proveedor => proveedor.empresa_proveedor === empresa_proveedor && proveedor.IdProveedor !== formData.IdProveedor);
  
      const camposObligatorios = ['NIT','nombre_proveedor', 'correo_proveedor', 'telefono_proveedor', 'direccion_proveedor', 'empresa_proveedor'];
  
      if (!CamposObligatorios(formData, camposObligatorios, 'Por favor, complete todos los campos del proveedor.')) {
        console.log('Campos obligatorios incompletos');
        return;
      }
  
      const nit = formData['NIT'];
      if(nit.length < 9 || nit.length > 10){
        console.log('NIT invalido');
        window.Swal.fire({
          icon: 'error',
          title: 'NIT inválido',
          text: 'Por favor, asegúrate de que el NIT de la empresa tenga por lo menos 9 dígitos.',
        });
        return;
      }
      
      const telefono = formData['telefono_proveedor'];
      if (telefono.length < 10 || telefono.length > 15) {
        console.log('Teléfono invalido');
        window.Swal.fire({
          icon: 'error',
          title: 'Teléfono inválido',
          text: 'Por favor, asegúrate de que el número de teléfono tenga entre 10 y 15 dígitos.',
        });
        return;
      }

      if (proveedorExistenteCorreo) {
        console.log('Correo ya registrado');
        window.Swal.fire({
          icon: 'warning',
          title: 'Correo ya registrado',
          text: 'El correo electrónico ingresado ya está registrado para otro proveedor.',
        });
        return;
      }
  
      if (proveedorExistenteTelefono) {
        console.log('Teléfono ya registrado');
        window.Swal.fire({
          icon: 'warning',
          title: 'Teléfono ya registrado',
          text: 'El número de teléfono ingresado ya está registrado para otro proveedor.',
        });
        return;
      }

      if (proveedorExistenteEmpresa) {
        console.log('Empresa ya registrada');
        window.Swal.fire({
          icon: 'warning',
          title: 'Empresa ya registrada',
          text: 'La empresa ingresada ya está registrada para otro proveedor.',
        });
        return;
      }

      if (proveedorExistenteNIT) {
        console.log('NIT de la empresa ya registrado');
        window.Swal.fire({
          icon: 'warning',
          title: 'NIT de la empresa ya registrado',
          text: 'El NIT de la empresa ingresada ya está registrada para otro proveedor.',
        });
        return;
      }
  
      const confirmation = await window.Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres actualizar este proveedor?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
      });
  
      if (confirmation.isConfirmed) {
        formData.estado_proveedor = 1;
        await axios.put(`http://localhost:5000/api/proveedores/editar/${formData.IdProveedor}`, formData);
        handleCloseModalEditar();
        fetchProveedores();
        window.Swal.fire('¡Proveedor actualizado!', '', 'success');
      }
    } catch (error) {
      console.error('Error al editar proveedor:', error);
    }
  };
  
  const handleChange = (name, value) => {
    setProveedorSeleccionado((prevProveedor) => ({
      ...prevProveedor,
      [name]: value,
    }));
  };

  const handleToggleSwitch = async (id) => {
    const proveedor = proveedores.find((prov) => prov.IdProveedor === id);
    if (!proveedor) {
        console.error('Proveedor no encontrado');
        return;
    }

      // Verificar si hay alguna compra relacionada con este proveedor
      const estaRelacionadoConCompra = compras.some(compra => compra.IdProveedor === id);

      if (estaRelacionadoConCompra) {
          toast.error('No se puede inactivar esta proveedor porque está relacionado con una compra.');
          return; // Detener el proceso si está relacionada
      }

    const newEstado = proveedor.estado_proveedor === 1 ? 0 : 1;

    const result = await window.Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: '¿Quieres cambiar el estado del proveedor?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
        try {
            await axios.put(`http://localhost:5000/api/proveedores/editar/${id}`, { estado_proveedor: newEstado });
            await fetchProveedores(); // Actualiza la lista de proveedores después de la actualización
            window.Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: 'El estado del proveedor ha sido actualizado correctamente.',
            });
        } catch (error) {
            console.error('Error al cambiar el estado del proveedor:', error);
            window.Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al cambiar el estado del proveedor. Por favor, inténtalo de nuevo más tarde.',
            });
        }
    }
};

  const handleEditClick = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setOpenModalEditar(true);
  };

  const handleSubmitProveedor = (formData) => {
    handleAddProveedor(formData, handleCloseModalAgregar, fetchProveedores);
  };

  const handleCloseModalAgregar = () => {
    setOpenModalAgregar(false);
    setProveedorSeleccionado(null);
  };

  const handleCloseModalEditar = () => {
    setOpenModalEditar(false);
    setProveedorSeleccionado(null);
  };

  const renderEmpresa = (value) => {
    const empresa = value ? value.trim() : 'Sin empresa';
    return (
      <div className="flex items-center">
        <Avatar style={{ backgroundColor: '#FF5722', color: '#FFFFFF' }}> {/* Cambia #FF5722 al color que desees */}
          <BusinessIcon />
        </Avatar>
        <span className="ml-2">{empresa}</span>
      </div>
    );
  };
  
  const NombreProveedorCell = ({ value }) => {
    const nombre = value ? value.trim() : 'Sin nombre';
    return (
      <div className="flex items-center">
        <Avatar style={{ backgroundColor: '#3F51B5', color: '#FFFFFF' }}> {/* Cambia #3F51B5 al color que desees */}
          <PersonIcon />
        </Avatar>
        <span className="ml-2">{nombre}</span>
      </div>
    );
  };
  
return (
<div>
<div className="container mx-auto p-4 relative">   
  </div>
      <ModalProveedor
          open={openModalAgregar}
          handleClose={handleCloseModalAgregar}
          onSubmit={(formData) => handleSubmitProveedor(formData)} 
          title="Crear Nuevo Proveedor"
          fields={[
            { name: 'NIT', label: 'NIT', type: 'text' },
            { name: 'empresa_proveedor', label: 'Empresa', type: 'text' },
            { name: 'nombre_proveedor', label: 'Nombre', type: 'text' },
            { name: 'correo_proveedor', label: 'Correo', type: 'text' },
            { name: 'telefono_proveedor', label: 'Teléfono', type: 'text' },
            { name: 'direccion_proveedor', label: 'Direccion', type: 'text' },
          ]}
          onChange={handleChange}
        />
        <ModalProveedor
          open={openModalEditar}
          handleClose={handleCloseModalEditar}
          onSubmit={handleEditProveedor}
          title="Editar Proveedor"
          fields={[
            { name: 'NIT', label: 'NIT', type: 'text' },
            { name: 'empresa_proveedor', label: 'Empresa', type: 'text' },
            { name: 'nombre_proveedor', label: 'Nombre', type: 'text' },
            { name: 'correo_proveedor', label: 'Correo', type: 'text' },
            { name: 'telefono_proveedor', label: 'Teléfono', type: 'text' },
            { name: 'direccion_proveedor', label: 'Direccion', type: 'text' },
          ]}
          onChange={handleChange}
          entityData={proveedorSeleccionado} 
        />

      <Table
        columns={[
          { field: 'NIT', headerName: 'NIT', width: 'w-36' },
          {
            field: 'empresa_proveedor',
            headerName: 'EMPRESA',
            width: 'w-36',
            renderCell: (params) => renderEmpresa(params.row.empresa_proveedor),
          },
          {
            field: 'nombre_proveedor',
            headerName: 'NOMBRE',
            width: 'w-36',
            renderCell: (params) => <NombreProveedorCell value={params.row.nombre_proveedor} />,
          },
          { field: 'correo_proveedor', headerName: 'CORREO', width: 'w-36' },
          { field: 'telefono_proveedor', headerName: 'TELEFONO', width: 'w-36' },
          { field: 'direccion_proveedor', headerName: 'DIRECCION', width: 'w-36' },
          {
            field: 'Acciones',
            headerName: 'ACCIONES',
            width: 'w-48',
            renderCell: (params) => (
              <div className="flex justify-center space-x-4">
                {params.row.estado_proveedor === 1 && (
                <button onClick={() => handleEditClick(params.row)} className="text-yellow-500">
                  <i className="bx bx-edit" style={{ fontSize: "24px" }}></i>
                </button>
              )}
              <CustomSwitch
                active={params.row.estado_proveedor === 1}
                onToggle={() => handleToggleSwitch(params.row.IdProveedor)}
              />
            </div>
            ),
          },
        ]}
        data={filtrar}
        title={'Gestion de Proveedores'}
      />
      <Fab
        aria-label="add"
        style={{
          border: '0.5px solid grey',
          backgroundColor: '#94CEF2',
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 1000, 
        }}
        onClick={() => setOpenModalAgregar(true)}
      >
        <i className='bx bx-plus' style={{ fontSize: '1.3rem' }}></i>
     </Fab>
    </div>
  );
};

export default Proveedores;
