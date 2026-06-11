document.addEventListener('DOMContentLoaded', () => {
    validarSesion();
    mostrarUsuario();
    verificarMicroservicios();
    cargarResumenDashboard();
});

function mostrarUsuario() {
    const usuario = obtenerUsuario();
    const contenedor = document.getElementById('infoUsuario');

    if (!usuario) {
        contenedor.textContent = 'Usuario no identificado';
        return;
    }

    contenedor.textContent =
        'Bienvenido, ' + usuario.nombre + ' | Usuario: ' + usuario.usuario + ' | Rol: ' + usuario.rol;
}

async function verificarMicroservicios() {
    await verificarServicio(API.auth + '/', 'estadoAuth');
    await verificarServicio(API.reservas + '/', 'estadoReservas');
    await verificarServicio(API.productos + '/', 'estadoProductos');
    await verificarServicio(API.pedidos + '/', 'estadoPedidos');
}

async function verificarServicio(url, idElemento) {
    const elemento = document.getElementById(idElemento);

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.estado) {
            elemento.textContent = 'Activo';
            elemento.style.color = 'green';
            elemento.style.fontWeight = 'bold';
        } else {
            elemento.textContent = 'Con error';
            elemento.style.color = 'red';
            elemento.style.fontWeight = 'bold';
        }

    } catch (error) {
        elemento.textContent = 'No disponible';
        elemento.style.color = 'red';
        elemento.style.fontWeight = 'bold';
    }
}

async function cargarResumenDashboard() {
    try {
        await contarMesas();
        await contarReservas();
        await contarProductos();
        await contarPedidos();

    } catch (error) {
        mostrarMensaje('mensajeDashboard', 'Error al cargar el resumen del dashboard', 'error');
    }
}

async function contarMesas() {
    try {
        const respuesta = await apiRequest(API.reservas + '/mesas');

        if (respuesta.estado && Array.isArray(respuesta.mesas)) {
            document.getElementById('totalMesas').textContent = respuesta.mesas.length;
        } else {
            document.getElementById('totalMesas').textContent = '0';
        }

    } catch (error) {
        document.getElementById('totalMesas').textContent = '0';
    }
}

async function contarReservas() {
    try {
        const respuesta = await apiRequest(API.reservas + '/reservas');

        if (respuesta.estado && Array.isArray(respuesta.reservas)) {
            document.getElementById('totalReservas').textContent = respuesta.reservas.length;
        } else {
            document.getElementById('totalReservas').textContent = '0';
        }

    } catch (error) {
        document.getElementById('totalReservas').textContent = '0';
    }
}

async function contarProductos() {
    try {
        const respuesta = await apiRequest(API.productos + '/productos');

        if (respuesta.estado && Array.isArray(respuesta.productos)) {
            document.getElementById('totalProductos').textContent = respuesta.productos.length;
        } else {
            document.getElementById('totalProductos').textContent = '0';
        }

    } catch (error) {
        document.getElementById('totalProductos').textContent = '0';
    }
}

async function contarPedidos() {
    try {
        const respuesta = await apiRequest(API.pedidos + '/pedidos');

        if (respuesta.estado && Array.isArray(respuesta.pedidos)) {
            document.getElementById('totalPedidos').textContent = respuesta.pedidos.length;
        } else {
            document.getElementById('totalPedidos').textContent = '0';
        }

    } catch (error) {
        document.getElementById('totalPedidos').textContent = '0';
    }
}