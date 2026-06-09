const API_RESERVAS = 'http://localhost:8002';
const API_PRODUCTOS = 'http://localhost:8003';
const API_PEDIDOS = 'http://localhost:8004';
const tokenPedidos = verificarAuth();

// Colocar el nombre de usuario
const userObj = getUsuario();
if (userObj) {
    document.getElementById('nombre-usuario').textContent = `👤 ${userObj.nom || 'Admin'}`;
}

const headersAuth = {
    'Authorization': `Bearer ${tokenPedidos}`,
    'Content-Type': 'application/json'
};

// Estados en memoria local
let listadoMesas = [];
let listadoProductos = [];
let carrito = []; // Formato de cada item: { id, nombre, precio, cantidad }

// 1. Cargar datos cruzados al iniciar la pantalla
async function inicializarModulo() {
    try {
        // Traer mesas y productos de forma paralela
        const [resMesas, resProds] = await Promise.all([
            fetch(`${API_RESERVAS}/mesas`, { headers: headersAuth }).then(r => r.json()),
            fetch(`${API_PRODUCTOS}/productos`, { headers: headersAuth }).then(r => r.json())
        ]);

        listadoMesas = resMesas.data || resMesas || [];
        listadoProductos = resProds.data || resProds || [];

        poblarSelectMesas();
        poblarSelectProductos();
    } catch (e) {
        console.error("Error inicializando datos en pedidos:", e);
    }
}

// 2. Llenar el selector de Mesas
function poblarSelectMesas() {
    const select = document.getElementById('ped-mesa');
    select.innerHTML = '<option value="">-- Seleccione una Mesa --</option>';
    
    listadoMesas.forEach(mesa => {
        const opt = document.createElement('option');
        opt.value = mesa.id;
        opt.textContent = `Mesa ${mesa.numero || mesa.nombre} (${mesa.estado})`;
        select.appendChild(opt);
    });
}

// 3. Llenar el selector de Productos (Solo los que estén disponibles)
function poblarSelectProductos() {
    const select = document.getElementById('ped-producto');
    select.innerHTML = '<option value="">-- Seleccione un Ítem --</option>';
    
    // Evalúa disponibilidad tanto en formato numérico (1) como booleano (true)
    const disponibles = listadoProductos.filter(p => {
        const valorDisp = p.disponibilidad !== undefined ? p.disponibilidad : p.disponible;
        return valorDisp == 1 || valorDisp === true || valorDisp === '1' || valorDisp === 'Disponible';
    });

    disponibles.forEach(prod => {
        const opt = document.createElement('option');
        opt.value = prod.id;
        
        // Adaptación de los nombres de propiedades devueltos por el Backend
        const nombreItem = prod.nombre_producto || prod.nombre || 'Producto';
        const precioItem = prod.precio_unitario || prod.precio || 0;

        opt.textContent = `${nombreItem} - $${parseFloat(precioItem).toFixed(2)}`;
        select.appendChild(opt);
    });
}

// 4. Validación inmediata en cliente al cambiar la mesa seleccionada
function validarMesaSeleccionada(mesaId) {
    const alertDiv = document.getElementById('pedido-alert');
    alertDiv.style.display = 'none';

    if (!mesaId) return;

    const mesa = listadoMesas.find(m => m.id == mesaId);
    if (mesa && mesa.estado === 'Disponible') {
        alertDiv.textContent = `⚠️ Validación: No se permiten pedidos para mesas en estado "Disponible". Cambia su estado en el módulo de Mesas.`;
        alertDiv.style.display = 'block';
    }
}

// 5. Añadir producto seleccionado al carrito local
function agregarAlCarrito() {
    const alertDiv = document.getElementById('pedido-alert');
    alertDiv.style.display = 'none';

    const prodId = document.getElementById('ped-producto').value;
    const cantidad = parseInt(document.getElementById('ped-cantidad').value);

    if (!prodId) {
        alertDiv.textContent = "Por favor, selecciona un producto del menú.";
        alertDiv.style.display = 'block';
        return;
    }

    if (isNaN(cantidad) || cantidad < 1) {
        alertDiv.textContent = "La cantidad del producto debe ser mayor o igual a 1.";
        alertDiv.style.display = 'block';
        return;
    }

    const productoOriginal = listadoProductos.find(p => p.id == prodId);

    // Adaptación de propiedades al extraer el producto seleccionado
    const nombreItem = productoOriginal.nombre_producto || productoOriginal.nombre || 'Producto';
    const precioItem = parseFloat(productoOriginal.precio_unitario || productoOriginal.precio || 0);

    // Verificar si ya existe en el carrito para sumar la cantidad
    const existeIndex = carrito.findIndex(item => item.id == prodId);
    if (existeIndex !== -1) {
        carrito[existeIndex].cantidad += cantidad;
    } else {
        carrito.push({
            id: productoOriginal.id,
            nombre: nombreItem,
            precio: precioItem,
            cantidad: cantidad
        });
    }

    document.getElementById('ped-cantidad').value = 1;
    actualizarVistaCarrito();
}

// 6. Quitar ítem del carrito
function eliminarItemCarrito(index) {
    carrito.splice(index, 1);
    actualizarVistaCarrito();
}

// 7. Calcular automáticos y renderizar tabla del carrito
function actualizarVistaCarrito() {
    const tbody = document.getElementById('carrito-cuerpo');
    tbody.innerHTML = '';

    if (carrito.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">El carrito está vacío. Agrega productos.</td></tr>`;
        document.getElementById('total-items').textContent = '0';
        document.getElementById('subtotal-pedido').textContent = '$0.00';
        document.getElementById('total-pedido').textContent = '$0.00';
        return;
    }

    let acumuladoTotalItems = 0;
    let acumuladoSubtotal = 0;

    carrito.forEach((item, index) => {
        const itemSubtotal = item.precio * item.cantidad;
        acumuladoTotalItems += item.cantidad;
        acumuladoSubtotal += itemSubtotal;

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        tr.innerHTML = `
            <td style="padding: 0.5rem; font-weight: 500;">${item.nombre}</td>
            <td style="padding: 0.5rem;">$${item.precio.toFixed(2)}</td>
            <td style="padding: 0.5rem; text-align: center;">${item.cantidad}</td>
            <td style="padding: 0.5rem; font-weight: bold;">$${itemSubtotal.toFixed(2)}</td>
            <td style="padding: 0.5rem; text-align: center;">
                <button onclick="eliminarItemCarrito(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer;">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('total-items').textContent = acumuladoTotalItems;
    document.getElementById('subtotal-pedido').textContent = `$${acumuladoSubtotal.toFixed(2)}`;
    document.getElementById('total-pedido').textContent = `$${acumuladoSubtotal.toFixed(2)}`;
}

// 8. Confirmar y enviar la estructura completa JSON al microservicio de pedidos
async function enviarPedidoFinal() {
    const alertDiv = document.getElementById('pedido-alert');
    alertDiv.style.display = 'none';

    const mesaId = document.getElementById('ped-mesa').value;

    if (!mesaId) {
        alertDiv.textContent = "Debes asignar una mesa al pedido.";
        alertDiv.style.display = 'block';
        return;
    }

    const mesa = listadoMesas.find(m => m.id == mesaId);
    if (mesa && mesa.estado === 'Disponible') {
        alertDiv.textContent = "No está permitido crear pedidos para mesas que estén en estado 'Disponible'.";
        alertDiv.style.display = 'block';
        return;
    }

    if (carrito.length === 0) {
        alertDiv.textContent = "El pedido no se puede procesar porque el carrito está vacío.";
        alertDiv.style.display = 'block';
        return;
    }

  // Este objeto coincide exactamente con lo que el Backend espera (ver ms-pedidos.http)
    const payload = {
        mesa_id: parseInt(mesaId),
        estado: 'Pendiente',
        detalles: carrito.map(i => ({  // CAMBIA ESTO: de 'items' a 'detalles'
            producto_id: parseInt(i.id),
            nombre_producto: i.nombre, // Asegúrate de incluir el nombre si el backend lo pide
            cantidad: parseInt(i.cantidad),
            precio_unitario: parseFloat(i.precio)
        }))
    };
    try {
        const response = await fetch(`${API_PEDIDOS}/pedidos`, {
            method: 'POST',
            headers: headersAuth,
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            alert('🎉 ¡Pedido registrado y enviado a cocina con éxito!');
            carrito = [];
            document.getElementById('ped-mesa').value = '';
            actualizarVistaCarrito();
        } else {
            alertDiv.textContent = data.message || data.error || "Error al registrar el pedido en el servidor.";
            alertDiv.style.display = 'block';
        }
    } catch (err) {
        alertDiv.textContent = "Error catastrófico: No hay conexión con el microservicio de pedidos.";
        alertDiv.style.display = 'block';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', inicializarModulo);