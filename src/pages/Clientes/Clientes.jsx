import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import ModalDinamico from "../../components/consts/modaled";
import Modal from "../../components/consts/modalContrasena";
import CustomSwitch from "../../components/consts/switch";
import { toast } from "react-toastify";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const [seleccionado, setSeleccionado] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChangeClick = (IdCliente) => {
    const clienteseleccionado = clientes.find(
      (Clientess) => Clientess.IdCliente === IdCliente
    );
    if (clienteseleccionado) {
      setSeleccionado(clienteseleccionado);
      setOpenPasswordModal(true);
    } else {
      console.error("Cliente no encontrado");
      toast.error(
        "Cliente no encontrado. Por favor, inténtalo de nuevo más tarde."
      );
    }
  };

  const handlePasswordModalClose = () => {
    setOpenPasswordModal(false);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setSeleccionado(null); // Limpiar el Cliente seleccionado al cerrar el modal
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/jackenail/Listar_Clientes"
        );
        setClientes(response.data);
      } catch (error) {
        console.error("Error al obtener los datos de clientes:", error);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (data) => {
    setModalData(data);
  };

  const columns = [
    { field: "tipoDocumento", headerName: "Tipo Documento" },
    {
      field: "Img",
      headerName: "Imagen",
      width: 100,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <img
            src={`http://localhost:5000${params.row.Img}`}
            alt={params.row.Nombre}
            style={{
              maxWidth: "100%",
              height: "auto",
              width: "3rem",
              height: "3rem",
              borderRadius: "50%",
            }}
          />
          </div>
        );
      },
    },
    { field: "Nombre", headerName: "Nombre" },
    { field: "Apellido", headerName: "Apellido" },
    { field: "Correo", headerName: "Correo" },
    { field: "Telefono", headerName: "Teléfono" },
    { field: "Documento", headerName: "Documento" },
   
  
    {
      field: "Acciones",
      headerName: "Acciones",
      width: 200,
      renderCell: (params) => (
        <div className="flex justify-center space-x-4">
          {params.row.Estado === 1 && (
            <button
              className="text-yellow-500"
              onClick={() =>
                handleOpenModal({
                  ...params.row,
                  modo: "actualizacion",
                  seleccionado: params.row,
                })
              }
            >
              <i className="bx bx-edit" style={{ fontSize: "24px" }}></i>
            </button>
          )}
          {params.row.Estado === 1 && (
            <button
              onClick={() => handlePasswordChangeClick(params.row.IdCliente)}
              className="text-black-500"
            >
              <i className="bx bx-lock" style={{ fontSize: "24px" }}></i>{" "}
            </button>
          )}
          <CustomSwitch
            active={params.row.Estado === 1}
            onToggle={() => handleToggleSwitch(params.row.IdCliente)}
          />
        </div>
      ),
    },
  ];
  
  
  const handleSubmit = async (formData) => {
    try {
      // Mostrar confirmación antes de registrar al cliente
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Quieres registrar este cliente?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar",
      });
  
      if (result.isConfirmed) {
        // Crear un objeto FormData
        const data = new FormData();

        const formDataNumerico = {
          Nombre: formData.Nombre,
          Apellido: formData.Apellido,
          Correo: formData.Correo,
          Telefono: formData.Telefono,
          Documento: formData.Documento,
          tipoDocumento: formData.Tip_Documento,
          Contrasena: formData.Contrasena,
          Img: formData.Img,
          Estado: 2,
          IdRol: 4,
        };
        
        console.log("Datos del formulario con imagen:", formDataNumerico);
  
        // Enviar los datos al backend
        const response = await axios.post(
          "http://localhost:5000/Jackenail/crearClientesedu",
          formDataNumerico,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
  
        const NuevoCliente = response.data;
        console.log("Nuevo cliente:", NuevoCliente);
        setClientes((prevClient) => [...prevClient, NuevoCliente]);
  
        // Mostrar una alerta de éxito si el registro es exitoso
        toast.success("El cliente se ha registrado correctamente.", {
          position: "top-right",
          autoClose: 3000,
        });
  
        setModalData(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errores = error.response.data.errores || [
          { mensaje: error.response.data.mensaje },
        ];
  
        errores.forEach((error) => {
          toast.error(`Error: ${error.mensaje}`, {
            position: "top-right",
            autoClose: 5000,
          });
        });
      } else {
        console.error("Error al registrar el cliente:", error);
  
        toast.error("Ocurrió un error al registrar el cliente.", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    }
  };
  

  const handleToggleSwitch = async (id) => {
    if (!id) {
      console.error("El ID del cliente es inválido");
      return;
    }

    const updatedClientes = clientes.map((cliente) => {
      if (cliente.IdCliente === id) {
        const newEstado = cliente.Estado === 1 ? 2 : 1; // Cambia 0 por 2 para el estado inactivo
        return { ...cliente, Estado: newEstado };
      }
      return cliente;
    });

    const updatedCliente = updatedClientes.find(
      (cliente) => cliente.IdCliente === id
    );

    if (!updatedCliente) {
      console.error("No se encontró el cliente actualizado");
      return;
    }

    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "¿Estás seguro?",
        text: "¿Quieres cambiar el estado del cliente?",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        // Asegúrate de usar el ID correcto aquí
        await axios.put(
          `http://localhost:5000/Jackenail/CambiarEstadocliente/${id}`,
          {
            Estado: updatedCliente.Estado,
          }
        );

        setClientes(updatedClientes);

        toast.info("El estado del cliente ha sido actualizado correctamente.", {
          position: "bottom-right",
          autoClose: 3000, // Cierra automáticamente después de 3 segundos
        });
      }
    } catch (error) {
      console.error("Error al cambiar el estado del cliente:", error);
      toast.error(
        "Hubo un error al cambiar el estado del cliente. Por favor, inténtalo de nuevo más tarde.",
        {
          position: "bottom-right",
          autoClose: 3000, // Cierra automáticamente después de 3 segundos
        }
      );
    }
  };

  const handleActualizacionSubmit = async (formData) => {
    try {
      // Verificar que formData tenga el IdCliente
      if (!formData.IdCliente) {
        throw new Error("El ID del cliente no está definido.");
      }

      // Verificar si el correo electrónico o el documento están siendo utilizados por otro cliente
      const correoExistente = clientes.some(
        (cliente) =>
          cliente.Correo === formData.Correo &&
          cliente.IdCliente !== formData.IdCliente
      );

      const documentoExistente = clientes.some(
        (cliente) =>
          cliente.Documento === formData.Documento &&
          cliente.IdCliente !== formData.IdCliente
      );

      if (correoExistente) {
        toast.error(
          "El correo electrónico ingresado ya está registrado. Por favor, elija otro correo electrónico.",
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      } else if (documentoExistente) {
        toast.error(
          "El documento ingresado ya está registrado. Por favor, elija otro documento.",
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      } else {
        const formDataNumerico = {
          ...formData,
          Telefono: parseInt(formData.Telefono, 10), // Asegúrate de que Telefono sea un número entero
          IdRol: 2,
        };

        console.log(formDataNumerico)

        // Verifica la URL y asegúrate de que IdCliente esté en la URL
        const url = `http://localhost:5000/Jackenail/actualizarClientes/${formDataNumerico.IdCliente}`;
        console.log("URL de solicitud:", url); // Agrega un log para depuración

        // Realizar la solicitud de actualización a la API utilizando axios.put
        const response = await axios.put(url, formDataNumerico);
        console.log("Respuesta de la API:", response.data); // Agrega un log para depuración

        // Actualizar el estado local de clientes
        const updatedClientes = clientes.map((cliente) =>
          cliente.IdCliente === formDataNumerico.IdCliente
            ? { ...cliente, ...formDataNumerico }
            : cliente
        );

        setClientes(updatedClientes);

        toast.success("El cliente se ha actualizado correctamente.", {
          position: "top-right",
          autoClose: 3000,
        });

        // Acciones adicionales después de la actualización
        setModalData(null);
      }
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      toast.error(
        "Ocurrió un error al actualizar el cliente. Inténtelo nuevamente.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const handleSubmitPasswordChange = async (newPassword, confirmPassword) => {
    // Paso 1: Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      console.error(
        "Las contraseñas no coinciden:",
        newPassword,
        confirmPassword
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    // Paso 2: Validar que la contraseña tenga al menos 8 caracteres
    if (newPassword.length < 8) {
      console.error("La contraseña es demasiado corta:", newPassword);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    try {
      // Paso 3: Realizar la solicitud PUT para actualizar la contraseña
      console.log("Datos a enviar al servidor:", {
        IdCliente: seleccionado.IdCliente,
        newPassword: newPassword,
      });

      const response = await axios.put(
        `http://localhost:5000/Jackenail/CambiarContrasena/${seleccionado.IdCliente}`,
        {
          nuevaContrasena: newPassword,
        }
      );

      // Verificar la respuesta de la solicitud PUT
      console.log("Respuesta de la API:", response);

      if (response.status === 200) {
        // La solicitud PUT fue exitosa
        console.log("Contraseña actualizada correctamente");
        Swal.fire({
          icon: "success",
          title: "Contraseña actualizada",
          text: "La contraseña del Cliente ha sido actualizada correctamente.",
        });

        // Cerrar el modal después de actualizar la contraseña
        handlePasswordModalClose();
      } else {
        // Manejar un caso donde la solicitud no tenga éxito
        console.error("Error en la solicitud PUT:", response);
        throw new Error("Error al actualizar la contraseña del Cliente");
      }
    } catch (error) {
      // Manejar errores capturados durante la solicitud PUT
      console.error("Error al cambiar la contraseña del empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al cambiar la contraseña del Cliente. Por favor, inténtalo de nuevo más tarde.",
      });
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-3 sm:py-5">
      <div
        className="fixed bg-white rounded-lg shadow-md"
        style={{
          padding: "5px",
          margin: "0 auto",
          borderRadius: "30px",
          marginTop: "20px",
          boxShadow: "0 4px 12px rgba(128, 0, 128, 0.5)",
          left: "82px",
          top: "70px",
          width: "calc(100% - 100px)",
        }}
      >
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-3xl">Gestion de Clientes</h4>

            <div className="relative w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search Mockups, Logos..."
                required
              />
            </div>
          </div>

          <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
            <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
              <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                >
                  <svg
                    className="h-3.5 w-3.5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    />
                  </svg>
                  Add new product
                </button>
                {/* Otros botones... */}
              </div>
            </div>
            {/* Tabla de datos */}
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto text-sm text-center text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.field}
                        scope="col"
                        className="px-6 py-3 text-center"
                      >
                        {column.headerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente, index) => (
                    <tr
                      key={index}
                      className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.field}
                          className="px-6 py-3 text-center whitespace-nowrap"
                        >
                          {column.field === "Acciones"
                            ? column.renderCell({ row: cliente })
                            : cliente[column.field]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {modalData && (
                <ModalDinamico
                  open={true}
                  handleClose={() => setModalData(null)}
                  title="Registrar clientes"
                  fields={[
                    {
                      label: "Tip_Documento",
                      name: "Tip_Documento",
                      type: "select",
                      required: true,
                      options: [
                        { value: "C.C", label: "Cédula de Ciudadanía (C.C)" },
                        { value: "C.E", label: "Cédula de extranjería (C.E)" },
                      ],
                    },
                    {
                      label: "Documento",
                      name: "Documento",
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Nombre",
                      name: "Nombre",
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Apellido",
                      name: "Apellido", // Nombre ajustado a "Apellido"
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Correo",
                      name: "Correo", // Nombre ajustado a "Correo"
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Teléfono",
                      name: "Telefono", // Nombre ajustado a "Telefono"
                      type: "text",
                      required: true,
                    },
                    

                    {
                      label: "Contraseña",
                      name: "Contrasena",
                      type: "password",
                      required: true,
                    },
                  ]}
                  onSubmit={handleSubmit}
                  seleccionado={modalData}
                />
              )}

              {modalData && modalData.modo === "actualizacion" && (
                <ModalDinamico
                  open={true}
                  handleClose={() => setModalData(null)}
                  title="Actualizar Cliente"
                  fields={[
                    {
                      label: "Tip_Documento",
                      name: "tipoDocumento",
                      type: "select",
                      required: true,
                      options: [
                        { value: "C.C", label: "Cédula de Ciudadanía (C.C)" },
                        { value: "C.E", label: "Cédula de extranjería (C.E)" },
                      ],
                    },
                    {
                      label: "Documento",
                      name: "Documento",
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Nombre",
                      name: "Nombre",
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Apellido",
                      name: "Apellido",
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Correo",
                      name: "Correo",
                      type: "text",
                      required: true,
                    },
                    {
                      label: "Teléfono",
                      name: "Telefono",
                      type: "text",
                      required: true,
                    },
                   
                  ]}
                  onSubmit={handleActualizacionSubmit}
                  seleccionado={modalData.seleccionado}
                />
              )}
            </div>

            <button
              className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-xl hover:shadow-2xl"
              style={{
                right: "4rem",
                bottom: "4rem",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.5)", // Sombra negra más pronunciada
              }}
              onClick={() => handleOpenModal(cliente)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Modal
        open={openPasswordModal}
        handleClose={handlePasswordModalClose}
        handleSubmit={handleSubmitPasswordChange}
      />
    </section>
  );
};

export default Clientes;
