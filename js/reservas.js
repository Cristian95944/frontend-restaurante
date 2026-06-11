document.addEventListener('DOMContentLoaded', () => {
    validarSesion();
    cargarMesas();
    cargarReservas();

    document.getElementById('formMesa').addEventListener('submit', guardarMesa);
    document.getElementById('formReserva').addEventListener('submit', guardarReserva);
    document.getElementById('btnFiltrarReservas').addEventListener('click', cargarReservas);
});

async function cargarMesas() {
    try {
        const respuesta = await apiRequest(API.reservas + '/mesas');

        const tabla = document.getElementById('tablaMesas');
        const selectMesa = document.getElementById('mesa_id');

        tabla.innerHTML = '';
        selectMesa.innerHTML = '<option value="">Seleccione mesa</option>';

        respuesta.mesas.forEach(mesa => {
            tabla.innerHTML += `
                <tr>
                    <td>${mesa.id}</td>
                    <td>${mesa.numero}</td>
                    <td>${mesa.capacidad}</td>
                    <td>${mesa.estado}</td>
                    <td>
                        <button onclick="editarMesa(${mesa.id})">Editar</button>
                        <button onclick="cambiarEstadoMesa(${mesa.id})">Cambiar estado</button>
                    </td>
                </tr>
            `;

            selectMesa.innerHTML += `
                <option value="${mesa.id}">${mesa.numero} - Capacidad ${mesa.capacidad} - ${mesa.estado}</option>
            `;
        });

    } catch (error) {
        mostrarMensaje('mensajeMesa', 'Error al cargar mesas', 'error');
    }
}

async function guardarMesa(e) {
    e.preventDefault();

    const id = document.getElementById('mesaId').value;
    const numero = document.getElementById('numeroMesa').value.trim();
    const capacidad = Number(document.getElementById('capacidadMesa').value);
    const estado = document.getElementById('estadoMesa').value;

    if (numero === '' || capacidad <= 0) {
        mostrarMensaje('mensajeMesa', 'Complete correctamente los datos de la mesa', 'error');
        return;
    }

    const datos = {
        numero,
        capacidad,
        estado
    };

    try {
        let respuesta;

        if (id === '') {
            respuesta = await apiRequest(API.reservas + '/mesas', 'POST', datos);
        } else {
            respuesta = await apiRequest(API.reservas + '/mesas/' + id, 'PUT', datos);
        }

        if (!respuesta.estado) {
            mostrarMensaje('mensajeMesa', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeMesa', respuesta.mensaje, 'success');
        document.getElementById('formMesa').reset();
        document.getElementById('mesaId').value = '';
        document.getElementById('btnMesa').textContent = 'Guardar mesa';

        cargarMesas();

    } catch (error) {
        mostrarMensaje('mensajeMesa', 'Error al guardar mesa', 'error');
    }
}

async function editarMesa(id) {
    try {
        const respuesta = await apiRequest(API.reservas + '/mesas/' + id);

        if (!respuesta.estado) {
            mostrarMensaje('mensajeMesa', respuesta.mensaje, 'error');
            return;
        }

        const mesa = respuesta.mesa;

        document.getElementById('mesaId').value = mesa.id;
        document.getElementById('numeroMesa').value = mesa.numero;
        document.getElementById('capacidadMesa').value = mesa.capacidad;
        document.getElementById('estadoMesa').value = mesa.estado;
        document.getElementById('btnMesa').textContent = 'Actualizar mesa';

    } catch (error) {
        mostrarMensaje('mensajeMesa', 'Error al consultar mesa', 'error');
    }
}

async function cambiarEstadoMesa(id) {
    const estado = prompt('Nuevo estado: disponible, reservada, ocupada, fuera_servicio');

    if (!estado) {
        return;
    }

    try {
        const respuesta = await apiRequest(API.reservas + '/mesas/' + id + '/estado', 'PUT', {
            estado
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajeMesa', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeMesa', respuesta.mensaje, 'success');
        cargarMesas();

    } catch (error) {
        mostrarMensaje('mensajeMesa', 'Error al cambiar estado', 'error');
    }
}

async function cargarReservas() {
    try {
        const fecha = document.getElementById('filtroFecha').value;
        const cliente = document.getElementById('filtroCliente').value.trim();
        const estado = document.getElementById('filtroEstadoReserva').value;

        let url = API.reservas + '/reservas?';

        if (fecha !== '') {
            url += 'fecha=' + fecha + '&';
        }

        if (cliente !== '') {
            url += 'cliente=' + cliente + '&';
        }

        if (estado !== '') {
            url += 'estado=' + estado + '&';
        }

        const respuesta = await apiRequest(url);

        const tabla = document.getElementById('tablaReservas');
        tabla.innerHTML = '';

        respuesta.reservas.forEach(reserva => {
            tabla.innerHTML += `
                <tr>
                    <td>${reserva.id}</td>
                    <td>${reserva.nombre_cliente}</td>
                    <td>${reserva.telefono_cliente}</td>
                    <td>${reserva.cantidad_personas}</td>
                    <td>${reserva.fecha}</td>
                    <td>${reserva.hora}</td>
                    <td>${reserva.mesa ? reserva.mesa.numero : reserva.mesa_id}</td>
                    <td>${reserva.estado}</td>
                    <td>
                        <button onclick="editarReserva(${reserva.id})">Editar</button>
                        <button onclick="cambiarEstadoReserva(${reserva.id})">Estado</button>
                        <button class="danger" onclick="cancelarReserva(${reserva.id})">Cancelar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        mostrarMensaje('mensajeReserva', 'Error al cargar reservas', 'error');
    }
}

async function guardarReserva(e) {
    e.preventDefault();

    const id = document.getElementById('reservaId').value;

    const datos = {
        nombre_cliente: document.getElementById('nombreCliente').value.trim(),
        telefono_cliente: document.getElementById('telefonoCliente').value.trim(),
        cantidad_personas: Number(document.getElementById('cantidadPersonas').value),
        fecha: document.getElementById('fechaReserva').value,
        hora: document.getElementById('horaReserva').value,
        observaciones: document.getElementById('observaciones').value.trim(),
        estado: document.getElementById('estadoReserva').value,
        mesa_id: Number(document.getElementById('mesa_id').value)
    };

    if (
        datos.nombre_cliente === '' ||
        datos.telefono_cliente === '' ||
        datos.cantidad_personas <= 0 ||
        datos.fecha === '' ||
        datos.hora === '' ||
        datos.mesa_id <= 0
    ) {
        mostrarMensaje('mensajeReserva', 'Complete correctamente los datos de la reserva', 'error');
        return;
    }

    try {
        let respuesta;

        if (id === '') {
            respuesta = await apiRequest(API.reservas + '/reservas', 'POST', datos);
        } else {
            respuesta = await apiRequest(API.reservas + '/reservas/' + id, 'PUT', datos);
        }

        if (!respuesta.estado) {
            mostrarMensaje('mensajeReserva', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeReserva', respuesta.mensaje, 'success');

        document.getElementById('formReserva').reset();
        document.getElementById('reservaId').value = '';
        document.getElementById('btnReserva').textContent = 'Guardar reserva';

        cargarReservas();
        cargarMesas();

    } catch (error) {
        mostrarMensaje('mensajeReserva', 'Error al guardar reserva', 'error');
    }
}

async function editarReserva(id) {
    try {
        const respuesta = await apiRequest(API.reservas + '/reservas/' + id);

        if (!respuesta.estado) {
            mostrarMensaje('mensajeReserva', respuesta.mensaje, 'error');
            return;
        }

        const reserva = respuesta.reserva;

        document.getElementById('reservaId').value = reserva.id;
        document.getElementById('nombreCliente').value = reserva.nombre_cliente;
        document.getElementById('telefonoCliente').value = reserva.telefono_cliente;
        document.getElementById('cantidadPersonas').value = reserva.cantidad_personas;
        document.getElementById('fechaReserva').value = reserva.fecha;
        document.getElementById('horaReserva').value = reserva.hora;
        document.getElementById('observaciones').value = reserva.observaciones ?? '';
        document.getElementById('estadoReserva').value = reserva.estado;
        document.getElementById('mesa_id').value = reserva.mesa_id;
        document.getElementById('btnReserva').textContent = 'Actualizar reserva';

    } catch (error) {
        mostrarMensaje('mensajeReserva', 'Error al consultar reserva', 'error');
    }
}

async function cambiarEstadoReserva(id) {
    const estado = prompt('Nuevo estado: pendiente, confirmada, cancelada, finalizada');

    if (!estado) {
        return;
    }

    try {
        const respuesta = await apiRequest(API.reservas + '/reservas/' + id + '/estado', 'PUT', {
            estado
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajeReserva', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeReserva', respuesta.mensaje, 'success');
        cargarReservas();
        cargarMesas();

    } catch (error) {
        mostrarMensaje('mensajeReserva', 'Error al cambiar estado', 'error');
    }
}

async function cancelarReserva(id) {
    if (!confirm('¿Desea cancelar esta reserva?')) {
        return;
    }

    try {
        const respuesta = await apiRequest(API.reservas + '/reservas/' + id + '/cancelar', 'PUT');

        if (!respuesta.estado) {
            mostrarMensaje('mensajeReserva', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeReserva', respuesta.mensaje, 'success');
        cargarReservas();
        cargarMesas();

    } catch (error) {
        mostrarMensaje('mensajeReserva', 'Error al cancelar reserva', 'error');
    }
}