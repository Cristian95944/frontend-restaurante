const API_RESERVAS = 'http://localhost:8002';
const tokenReservas = verificarAuth();

// Actualizar tag de usuario en navbar
const userObj = getUsuario();
if (userObj) {
    document.getElementById('nombre-usuario').textContent = `👤 ${userObj.nom || 'Admin'}`;
}

// Headers con token de sesión de forma global para cumplir con el requerimiento de validación [cite: 101, 245]
const headersAuth = {
    'Authorization': `Bearer ${tokenReservas}`,
    'Content-Type': 'application/json'
};

// 1. Cargar Mesas y cargarlas en el Selector del Formulario
async function cargarMesas() {
    try {
        const response = await fetch(`${API_RESERVAS}/mesas`, { headers: headersAuth });
        const resData = await response.json();
        const mesas = resData.data || resData;

        const contenedorMesas = document.getElementById('lista-mesas');
        const selectMesa = document.getElementById('res-mesa');
        
        contenedorMesas.innerHTML = '';
        selectMesa.innerHTML = '<option value="">Seleccione una mesa...</option>';

        mesas.forEach(mesa => {
            // Renderizar tarjetas de mesas
            const div = document.createElement('div');
            div.style.padding = '1rem';
            div.style.borderRadius = '6px';
            div.style.border = '1px solid #cbd5e1';
            div.style.backgroundColor = mesa.estado === 'Disponible' ? '#f0fdf4' : '#fef2f2';
            
            div.innerHTML = `
                <strong>${mesa.numero || mesa.nombre}</strong><br>
                Capacidad: ${mesa.capacidad_maxima || mesa.capacidad}<br>
                <small>Estado: ${mesa.estado}</small><br>
                <select onchange="cambiarEstadoMesa(${mesa.id}, this.value)" style="margin-top:0.5rem; font-size:0.8rem; padding:0.2rem;">
                    <option value="Disponible" ${mesa.estado === 'Disponible' ? 'selected' : ''}>Disponible</option>
                    <option value="Reservada" ${mesa.estado === 'Reservada' ? 'selected' : ''}>Reservada</option>
                    <option value="Ocupada" ${mesa.estado === 'Ocupada' ? 'selected' : ''}>Ocupada</option>
                    <option value="Fuera de servicio" ${mesa.estado === 'Fuera de servicio' ? 'selected' : ''}>Fuera de servicio</option>
                </select>
            `;
            contenedorMesas.appendChild(div);

            // Añadir al select solo si no está fuera de servicio para cumplir la validación [cite: 168]
            if (mesa.estado !== 'Fuera de servicio') {
                const opt = document.createElement('option');
                opt.value = mesa.id;
                opt.textContent = `${mesa.numero || mesa.nombre} (Cap: ${mesa.capacidad_maxima || mesa.capacidad})`;
                selectMesa.appendChild(opt);
            }
        });
    } catch (e) {
        console.error("Error cargando mesas:", e);
    }
}

// 2. Cambiar Estado de la Mesa desde el select dinámico
async function cambiarEstadoMesa(id, nuevoEstado) {
    try {
        const response = await fetch(`${API_RESERVAS}/mesas/${id}`, {
            method: 'PUT',
            headers: headersAuth,
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (response.ok) {
            cargarMesas(); // Recarga la vista reflejando el cambio
        }
    } catch (e) {
        console.error("Error cambiando estado de mesa:", e);
    }
}

// 3. Listar Reservas creadas
async function cargarReservas() {
    try {
        const response = await fetch(`${API_RESERVAS}/reservas`, { headers: headersAuth });
        const resData = await response.json();
        const reservas = resData.data || resData;

        const tbody = document.getElementById('lista-reservas');
        tbody.innerHTML = '';

        reservas.forEach(res => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';
            tr.innerHTML = `
                <td style="padding: 0.5rem;">${res.nombre_cliente || res.cliente}</td>
                <td style="padding: 0.5rem;">Mesa ${res.mesa_id}</td>
                <td style="padding: 0.5rem;">${res.fecha} a las ${res.hora}</td>
                <td style="padding: 0.5rem;">${res.cantidad_personas}</td>
                <td style="padding: 0.5rem;"><span style="color: green; font-weight: bold;">${res.estado}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Error cargando reservas:", e);
    }
}

// 4. Crear Nueva Reserva con validaciones del cliente [cite: 248]
document.getElementById('form-reserva').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const alertDiv = document.getElementById('reserva-alert');
    alertDiv.style.display = 'none';

    const fechaSeleccionada = new Date(document.getElementById('res-fecha').value);
    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    // Validación obligatoria en cliente: No permitir reservas pasadas [cite: 167, 248]
    if (fechaSeleccionada < hoy) {
        alertDiv.textContent = "No puedes hacer reservas en fechas pasadas.";
        alertDiv.style.display = 'block';
        return;
    }

    const payload = {
        nombre_cliente: document.getElementById('res-cliente').value,
        telefono: document.getElementById('res-telefono').value,
        cantidad_personas: parseInt(document.getElementById('res-personas').value),
        fecha: document.getElementById('res-fecha').value,
        hora: document.getElementById('res-hora').value,
        mesa_id: document.getElementById('res-mesa').value,
        observaciones: document.getElementById('res-observaciones').value,
        estado: 'Pendiente' // Estado inicial por defecto [cite: 162]
    };

    try {
        const response = await fetch(`${API_RESERVAS}/reservas`, {
            method: 'POST',
            headers: headersAuth,
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('form-reserva').reset();
            cargarMesas();
            cargarReservas();
        } else {
            alertDiv.textContent = data.message || "Error al registrar la reserva.";
            alertDiv.style.display = 'block';
        }
    } catch (err) {
        alertDiv.textContent = "Error de conexión con el servidor de reservas.";
        alertDiv.style.display = 'block';
    }
});

// Inicializar ejecución al cargar la vista
document.addEventListener('DOMContentLoaded', () => {
    cargarMesas();
    cargarReservas();
});