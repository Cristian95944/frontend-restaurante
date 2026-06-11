const API = {
    auth: 'http://localhost:8000',
    reservas: 'http://localhost:8002',
    productos: 'http://localhost:8003',
    pedidos: 'http://localhost:8004'
};

function guardarToken(token) {
    localStorage.setItem('token', token);
}

function obtenerToken() {
    return localStorage.getItem('token');
}

function guardarUsuario(usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function obtenerUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

function eliminarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

function validarSesion() {
    const token = obtenerToken();

    if (!token) {
        window.location.href = 'login.html';
    }
}

async function apiRequest(url, metodo = 'GET', datos = null) {
    const opciones = {
        method: metodo,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const token = obtenerToken();

    if (token) {
        opciones.headers['Authorization'] = 'Bearer ' + token;
    }

    if (datos !== null) {
        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(url, opciones);
    const texto = await respuesta.text();

    try {
        return JSON.parse(texto);
    } catch (error) {
        console.error('Respuesta del servidor:', texto);
        throw new Error('El servidor no devolvió JSON válido');
    }
}

function mostrarMensaje(id, mensaje, tipo = 'info') {
    const contenedor = document.getElementById(id);

    if (!contenedor) {
        return;
    }

    contenedor.textContent = mensaje;
    contenedor.className = 'mensaje ' + tipo;
}

function cerrarSesionFrontend() {
    const token = obtenerToken();

    if (!token) {
        eliminarSesion();
        return;
    }

    fetch(API.auth + '/logout', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).finally(() => {
        eliminarSesion();
    });
}