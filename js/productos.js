document.addEventListener('DOMContentLoaded', () => {
    validarSesion();
    cargarCategorias();
    cargarProductos();

    const formCategoria = document.getElementById('formCategoria');
    const formProducto = document.getElementById('formProducto');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroDisponible = document.getElementById('filtroDisponible');

    formCategoria.addEventListener('submit', guardarCategoria);
    formProducto.addEventListener('submit', guardarProducto);

    filtroCategoria.addEventListener('change', cargarProductos);
    filtroDisponible.addEventListener('change', cargarProductos);
});

async function cargarCategorias() {
    try {
        const respuesta = await apiRequest(API.productos + '/categorias');

        const tabla = document.getElementById('tablaCategorias');
        const selectCategoria = document.getElementById('categoria_id');
        const filtroCategoria = document.getElementById('filtroCategoria');

        tabla.innerHTML = '';
        selectCategoria.innerHTML = '<option value="">Seleccione categoría</option>';
        filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';

        respuesta.categorias.forEach(categoria => {
            tabla.innerHTML += `
                <tr>
                    <td>${categoria.id}</td>
                    <td>${categoria.nombre}</td>
                    <td>${categoria.descripcion ?? ''}</td>
                </tr>
            `;

            selectCategoria.innerHTML += `
                <option value="${categoria.id}">${categoria.nombre}</option>
            `;

            filtroCategoria.innerHTML += `
                <option value="${categoria.id}">${categoria.nombre}</option>
            `;
        });

    } catch (error) {
        mostrarMensaje('mensajeProducto', 'Error al cargar categorías', 'error');
    }
}

async function guardarCategoria(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombreCategoria').value.trim();
    const descripcion = document.getElementById('descripcionCategoria').value.trim();

    if (nombre === '') {
        mostrarMensaje('mensajeCategoria', 'El nombre de la categoría es obligatorio', 'error');
        return;
    }

    try {
        const respuesta = await apiRequest(API.productos + '/categorias', 'POST', {
            nombre,
            descripcion
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajeCategoria', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeCategoria', respuesta.mensaje, 'success');
        document.getElementById('formCategoria').reset();
        cargarCategorias();

    } catch (error) {
        mostrarMensaje('mensajeCategoria', 'Error al guardar categoría', 'error');
    }
}

async function cargarProductos() {
    try {
        const categoria = document.getElementById('filtroCategoria').value;
        const disponible = document.getElementById('filtroDisponible').value;

        let url = API.productos + '/productos?';

        if (categoria !== '') {
            url += 'categoria_id=' + categoria + '&';
        }

        if (disponible !== '') {
            url += 'disponible=' + disponible + '&';
        }

        const respuesta = await apiRequest(url);

        const tabla = document.getElementById('tablaProductos');
        tabla.innerHTML = '';

        respuesta.productos.forEach(producto => {
            tabla.innerHTML += `
                <tr>
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.categoria ? producto.categoria.nombre : ''}</td>
                    <td>$${Number(producto.precio).toLocaleString()}</td>
                    <td>${producto.disponible ? 'Disponible' : 'No disponible'}</td>
                    <td>
                        <button onclick="editarProducto(${producto.id})">Editar</button>
                        <button class="danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        mostrarMensaje('mensajeProducto', 'Error al cargar productos', 'error');
    }
}

async function guardarProducto(e) {
    e.preventDefault();

    const id = document.getElementById('producto_id').value;
    const nombre = document.getElementById('nombreProducto').value.trim();
    const descripcion = document.getElementById('descripcionProducto').value.trim();
    const precio = Number(document.getElementById('precioProducto').value);
    const disponible = document.getElementById('disponibleProducto').value === 'true';
    const categoria_id = Number(document.getElementById('categoria_id').value);

    if (nombre === '' || precio <= 0 || categoria_id <= 0) {
        mostrarMensaje('mensajeProducto', 'Complete correctamente los datos del producto', 'error');
        return;
    }

    const datos = {
        nombre,
        descripcion,
        precio,
        disponible,
        categoria_id
    };

    try {
        let respuesta;

        if (id === '') {
            respuesta = await apiRequest(API.productos + '/productos', 'POST', datos);
        } else {
            respuesta = await apiRequest(API.productos + '/productos/' + id, 'PUT', datos);
        }

        if (!respuesta.estado) {
            mostrarMensaje('mensajeProducto', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeProducto', respuesta.mensaje, 'success');

        document.getElementById('formProducto').reset();
        document.getElementById('producto_id').value = '';
        document.getElementById('btnProducto').textContent = 'Guardar producto';

        cargarProductos();

    } catch (error) {
        mostrarMensaje('mensajeProducto', 'Error al guardar producto', 'error');
    }
}

async function editarProducto(id) {
    try {
        const respuesta = await apiRequest(API.productos + '/productos/' + id);

        if (!respuesta.estado) {
            mostrarMensaje('mensajeProducto', respuesta.mensaje, 'error');
            return;
        }

        const producto = respuesta.producto;

        document.getElementById('producto_id').value = producto.id;
        document.getElementById('nombreProducto').value = producto.nombre;
        document.getElementById('descripcionProducto').value = producto.descripcion ?? '';
        document.getElementById('precioProducto').value = producto.precio;
        document.getElementById('disponibleProducto').value = producto.disponible ? 'true' : 'false';
        document.getElementById('categoria_id').value = producto.categoria_id;
        document.getElementById('btnProducto').textContent = 'Actualizar producto';

    } catch (error) {
        mostrarMensaje('mensajeProducto', 'Error al consultar producto', 'error');
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Desea eliminar este producto?')) {
        return;
    }

    try {
        const respuesta = await apiRequest(API.productos + '/productos/' + id, 'DELETE');

        if (!respuesta.estado) {
            mostrarMensaje('mensajeProducto', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeProducto', respuesta.mensaje, 'success');
        cargarProductos();

    } catch (error) {
        mostrarMensaje('mensajeProducto', 'Error al eliminar producto', 'error');
    }
}