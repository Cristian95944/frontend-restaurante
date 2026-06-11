document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formLogin');

    if (!formulario) {
        return;
    }

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuario = document.getElementById('usuario').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        if (usuario === '' || contrasena === '') {
            mostrarMensaje('mensajeLogin', 'Debe ingresar usuario y contraseña', 'error');
            return;
        }

        try {
            const respuesta = await apiRequest(API.auth + '/login', 'POST', {
                usuario: usuario,
                contrasena: contrasena
            });

            if (!respuesta.estado) {
                mostrarMensaje('mensajeLogin', respuesta.mensaje, 'error');
                return;
            }

            guardarToken(respuesta.token);
            guardarUsuario(respuesta.usuario);

            mostrarMensaje('mensajeLogin', 'Inicio de sesión correcto', 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);

        } catch (error) {
            mostrarMensaje('mensajeLogin', 'Error al conectar con ms-auth', 'error');
        }
    });
});