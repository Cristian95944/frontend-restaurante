const API_AUTH = 'http://localhost:8001';

async function login() {
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const errorMsg = document.getElementById('error-msg');
    const btn = document.getElementById('btn-login');

    if (!usuario || !contrasena) {
        mostrarError('Por favor ingresa usuario y contraseña');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Ingresando...';

    try {
        const response = await fetch(`${API_AUTH}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasena })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
            window.location.href = 'dashboard.html';
        } else {
            mostrarError(data.message || 'Credenciales incorrectas');
        }
    } catch (error) {
        mostrarError('Error al conectar con el servidor');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesión';
    }
}

function mostrarError(mensaje) {
    const errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = mensaje;
    errorMsg.style.display = 'block';
}

function logout() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_AUTH}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

function verificarAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

function getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

// Presionar Enter para login
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    });
});