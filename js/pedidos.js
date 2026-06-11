let productosDisponibles = [];
let productosPedido = [];

document.addEventListener('DOMContentLoaded', () => {
    validarSesion();

    cargarMesasPedido();
    cargarProductosPedido();
    cargarPedidos();

    document.getElementById('formPedido').addEventListener('submit', crearPedido);
    document.getElementById('btnAgregarProducto').addEventListener('click', agregarProductoTemporal);
    document.getElementById('btnFiltrarPedidos').addEventListener('click', cargarPedidos);
    document.getElementById('formDetallePedido').addEventListener('submit', agregarDetallePedido);
});

async function cargarMesasPedido() {
    try {
        const respuesta = await apiRequest(API.reservas + '/mesas');

        const selectMesa = document.getElementById('mesaPedido');
        selectMesa.innerHTML = '<option value="">Seleccione mesa</option>';

        respuesta.mesas.forEach(mesa => {
            selectMesa.innerHTML += `
                <option value="${mesa.id}" data-estado="${mesa.estado}">
                    ${mesa.numero} - ${mesa.estado}
                </option>
            `;
        });

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al cargar mesas desde ms-reservas', 'error');
    }
}

async function cargarProductosPedido() {
    try {
        const respuesta = await apiRequest(API.productos + '/productos?disponible=true');

        productosDisponibles = respuesta.productos;

        const selectProducto = document.getElementById('productoPedido');
        const selectDetalle = document.getElementById('productoDetalle');

        selectProducto.innerHTML = '<option value="">Seleccione producto</option>';
        selectDetalle.innerHTML = '<option value="">Seleccione producto</option>';

        productosDisponibles.forEach(producto => {
            const texto = '${producto.nombre} - $${Number(producto.precio).toLocaleString()}';

            selectProducto.innerHTML += <option value="${producto.id}">${texto}</option>;
            selectDetalle.innerHTML += <option value="${producto.id}">${texto}</option>;
        });

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al cargar productos desde ms-productos', 'error');
    }
}

function agregarProductoTemporal() {
    const productoId = Number(document.getElementById('productoPedido').value);
    const cantidad = Number(document.getElementById('cantidadProducto').value);

    if (productoId <= 0 || cantidad <= 0) {
        mostrarMensaje('mensajePedido', 'Seleccione un producto y una cantidad válida', 'error');
        return;
    }

    const producto = productosDisponibles.find(item => Number(item.id) === productoId);

    if (!producto) {
        mostrarMensaje('mensajePedido', 'Producto no encontrado', 'error');
        return;
    }

    productosPedido.push({
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        cantidad: cantidad,
        precio_unitario: Number(producto.precio)
    });

    renderizarProductosTemporales();

    document.getElementById('productoPedido').value = '';
    document.getElementById('cantidadProducto').value = 1;
}

function renderizarProductosTemporales() {
    const tabla = document.getElementById('tablaProductosPedido');
    tabla.innerHTML = '';

    let total = 0;

    productosPedido.forEach((item, index) => {
        const subtotal = item.cantidad * item.precio_unitario;
        total += subtotal;

        tabla.innerHTML += `
            <tr>
                <td>${item.nombre_producto}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio_unitario.toLocaleString()}</td>
                <td>$${subtotal.toLocaleString()}</td>
                <td>
                    <button class="danger" onclick="quitarProductoTemporal(${index})">Quitar</button>
                </td>
            </tr>
        `;
    });

    document.getElementById('totalTemporal').textContent = '$' + total.toLocaleString();
}

function quitarProductoTemporal(index) {
    productosPedido.splice(index, 1);
    renderizarProductosTemporales();
}

async function crearPedido(e) {
    e.preventDefault();

    const selectMesa = document.getElementById('mesaPedido');
    const mesaId = Number(selectMesa.value);
    const estadoMesa = selectMesa.options[selectMesa.selectedIndex]?.dataset.estado || '';

    if (mesaId <= 0) {
        mostrarMensaje('mensajePedido', 'Debe seleccionar una mesa', 'error');
        return;
    }

    if (productosPedido.length === 0) {
        mostrarMensaje('mensajePedido', 'Debe agregar al menos un producto', 'error');
        return;
    }

    try {
        const respuesta = await apiRequest(API.pedidos + '/pedidos', 'POST', {
            mesa_id: mesaId,
            estado_mesa: estadoMesa,
            productos: productosPedido
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajePedido', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajePedido', respuesta.mensaje, 'success');

        productosPedido = [];
        renderizarProductosTemporales();

        document.getElementById('formPedido').reset();

        cargarPedidos();

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al crear pedido', 'error');
    }
}
let productosDisponibles = [];
let productosPedido = [];

document.addEventListener('DOMContentLoaded', () => {
    validarSesion();

    cargarMesasPedido();
    cargarProductosPedido();
    cargarPedidos();

    document.getElementById('formPedido').addEventListener('submit', crearPedido);
    document.getElementById('btnAgregarProducto').addEventListener('click', agregarProductoTemporal);
    document.getElementById('btnFiltrarPedidos').addEventListener('click', cargarPedidos);
    document.getElementById('formDetallePedido').addEventListener('submit', agregarDetallePedido);
});

async function cargarMesasPedido() {
    try {
        const respuesta = await apiRequest(API.reservas + '/mesas');

        const selectMesa = document.getElementById('mesaPedido');
        selectMesa.innerHTML = '<option value="">Seleccione mesa</option>';

        respuesta.mesas.forEach(mesa => {
            selectMesa.innerHTML += `
                <option value="${mesa.id}" data-estado="${mesa.estado}">
                    ${mesa.numero} - ${mesa.estado}
                </option>
            `;
        });

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al cargar mesas desde ms-reservas', 'error');
    }
}

async function cargarProductosPedido() {
    try {
        const respuesta = await apiRequest(API.productos + '/productos?disponible=true');

        productosDisponibles = respuesta.productos;

        const selectProducto = document.getElementById('productoPedido');
        const selectDetalle = document.getElementById('productoDetalle');

        selectProducto.innerHTML = '<option value="">Seleccione producto</option>';
        selectDetalle.innerHTML = '<option value="">Seleccione producto</option>';

        productosDisponibles.forEach(producto => {
            const texto = '${producto.nombre} - $${Number(producto.precio).toLocaleString()}';

            selectProducto.innerHTML += <option value="${producto.id}">${texto}</option>;
            selectDetalle.innerHTML += <option value="${producto.id}">${texto}</option>;
        });

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al cargar productos desde ms-productos', 'error');
    }
}

function agregarProductoTemporal() {
    const productoId = Number(document.getElementById('productoPedido').value);
    const cantidad = Number(document.getElementById('cantidadProducto').value);

    if (productoId <= 0 || cantidad <= 0) {
        mostrarMensaje('mensajePedido', 'Seleccione un producto y una cantidad válida', 'error');
        return;
    }

    const producto = productosDisponibles.find(item => Number(item.id) === productoId);

    if (!producto) {
        mostrarMensaje('mensajePedido', 'Producto no encontrado', 'error');
        return;
    }

    productosPedido.push({
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        cantidad: cantidad,
        precio_unitario: Number(producto.precio)
    });

    renderizarProductosTemporales();

    document.getElementById('productoPedido').value = '';
    document.getElementById('cantidadProducto').value = 1;
}

function renderizarProductosTemporales() {
    const tabla = document.getElementById('tablaProductosPedido');
    tabla.innerHTML = '';

    let total = 0;

    productosPedido.forEach((item, index) => {
        const subtotal = item.cantidad * item.precio_unitario;
        total += subtotal;

        tabla.innerHTML += `
            <tr>
                <td>${item.nombre_producto}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio_unitario.toLocaleString()}</td>
                <td>$${subtotal.toLocaleString()}</td>
                <td>
                    <button class="danger" onclick="quitarProductoTemporal(${index})">Quitar</button>
                </td>
            </tr>
        `;
    });

    document.getElementById('totalTemporal').textContent = '$' + total.toLocaleString();
}

function quitarProductoTemporal(index) {
    productosPedido.splice(index, 1);
    renderizarProductosTemporales();
}

async function crearPedido(e) {
    e.preventDefault();

    const selectMesa = document.getElementById('mesaPedido');
    const mesaId = Number(selectMesa.value);
    const estadoMesa = selectMesa.options[selectMesa.selectedIndex]?.dataset.estado || '';

    if (mesaId <= 0) {
        mostrarMensaje('mensajePedido', 'Debe seleccionar una mesa', 'error');
        return;
    }

    if (productosPedido.length === 0) {
        mostrarMensaje('mensajePedido', 'Debe agregar al menos un producto', 'error');
        return;
    }

    try {
        const respuesta = await apiRequest(API.pedidos + '/pedidos', 'POST', {
            mesa_id: mesaId,
            estado_mesa: estadoMesa,
            productos: productosPedido
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajePedido', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajePedido', respuesta.mensaje, 'success');

        productosPedido = [];
        renderizarProductosTemporales();

        document.getElementById('formPedido').reset();

        cargarPedidos();

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al crear pedido', 'error');
    }
}
async function cargarPedidos() {
    try {
        const estado = document.getElementById('filtroEstadoPedido').value;

        let url = API.pedidos + '/pedidos';

        if (estado !== '') {
            url += '?estado=' + estado;
        }

        const respuesta = await apiRequest(url);

        const tabla = document.getElementById('tablaPedidos');
        tabla.innerHTML = '';

        respuesta.pedidos.forEach(pedido => {
            tabla.innerHTML += `
                <tr>
                    <td>${pedido.id}</td>
                    <td>${pedido.mesa_id}</td>
                    <td>${pedido.fecha}</td>
                    <td>${pedido.hora}</td>
                    <td>${pedido.estado}</td>
                    <td>$${Number(pedido.total).toLocaleString()}</td>
                    <td>
                        <button onclick="verPedido(${pedido.id})">Ver</button>
                        <button onclick="cambiarEstadoPedido(${pedido.id})">Estado</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al cargar pedidos', 'error');
    }
}

async function verPedido(id) {
    try {
        const respuesta = await apiRequest(API.pedidos + '/pedidos/' + id);

        if (!respuesta.estado) {
            mostrarMensaje('mensajePedido', respuesta.mensaje, 'error');
            return;
        }

        const pedido = respuesta.pedido;
        const contenedor = document.getElementById('detallePedido');

        let html = `
            <h3>Detalle del pedido #${pedido.id}</h3>
            <p><strong>Mesa:</strong> ${pedido.mesa_id}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            <p><strong>Total:</strong> $${Number(pedido.total).toLocaleString()}</p>
            <table>
                <thead>
                    <tr>
                        <th>ID Detalle</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pedido.detalles.forEach(detalle => {
            html += `
                <tr>
                    <td>${detalle.id}</td>
                    <td>${detalle.nombre_producto}</td>
                    <td>${detalle.cantidad}</td>
                    <td>$${Number(detalle.precio_unitario).toLocaleString()}</td>
                    <td>$${Number(detalle.subtotal).toLocaleString()}</td>
                    <td>
                        <button onclick="actualizarCantidadDetalle(${detalle.id})">Cantidad</button>
                        <button class="danger" onclick="eliminarDetalle(${detalle.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        contenedor.innerHTML = html;

        document.getElementById('pedidoDetalleId').value = pedido.id;

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al consultar pedido', 'error');
    }
}

async function cambiarEstadoPedido(id) {
    const estado = prompt('Nuevo estado: pendiente, en_preparacion, entregado, pagado, cancelado');

    if (!estado) {
        return;
    }

    try {
        const respuesta = await apiRequest(API.pedidos + '/pedidos/' + id + '/estado', 'PUT', {
            estado
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajePedido', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajePedido', respuesta.mensaje, 'success');
        cargarPedidos();

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al cambiar estado', 'error');
    }
}

async function agregarDetallePedido(e) {
    e.preventDefault();

    const pedidoId = Number(document.getElementById('pedidoDetalleId').value);
    const productoId = Number(document.getElementById('productoDetalle').value);
    const cantidad = Number(document.getElementById('cantidadDetalle').value);

    if (pedidoId <= 0 || productoId <= 0 || cantidad <= 0) {
        mostrarMensaje('mensajeDetallePedido', 'Complete correctamente los datos del detalle', 'error');
        return;
    }

    const producto = productosDisponibles.find(item => Number(item.id) === productoId);

    if (!producto) {
        mostrarMensaje('mensajeDetallePedido', 'Producto no encontrado', 'error');
        return;
    }

    try {
        const respuesta = await apiRequest(API.pedidos + '/pedidos/' + pedidoId + '/detalles', 'POST', {
            producto_id: producto.id,
            nombre_producto: producto.nombre,
            cantidad: cantidad,
            precio_unitario: Number(producto.precio)
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajeDetallePedido', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajeDetallePedido', respuesta.mensaje, 'success');
        document.getElementById('formDetallePedido').reset();
        document.getElementById('pedidoDetalleId').value = pedidoId;

        verPedido(pedidoId);
        cargarPedidos();

    } catch (error) {
        mostrarMensaje('mensajeDetallePedido', 'Error al agregar producto al pedido', 'error');
    }
}

async function actualizarCantidadDetalle(detalleId) {
    const cantidad = Number(prompt('Nueva cantidad:'));

    if (cantidad <= 0) {
        mostrarMensaje('mensajePedido', 'Cantidad no válida', 'error');
        return;
    }

    try {
        const respuesta = await apiRequest(API.pedidos + '/detalles-pedidos/' + detalleId, 'PUT', {
            cantidad
        });

        if (!respuesta.estado) {
            mostrarMensaje('mensajePedido', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajePedido', respuesta.mensaje, 'success');
        cargarPedidos();

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al actualizar cantidad', 'error');
    }
}

async function eliminarDetalle(detalleId) {
    if (!confirm('¿Desea eliminar este producto del pedido?')) {
        return;
    }

    try {
        const respuesta = await apiRequest(API.pedidos + '/detalles-pedidos/' + detalleId, 'DELETE');

        if (!respuesta.estado) {
            mostrarMensaje('mensajePedido', respuesta.mensaje, 'error');
            return;
        }

        mostrarMensaje('mensajePedido', respuesta.mensaje, 'success');
        cargarPedidos();

    } catch (error) {
        mostrarMensaje('mensajePedido', 'Error al eliminar detalle', 'error');
    }
}
