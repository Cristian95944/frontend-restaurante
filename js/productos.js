const API_PRODUCTOS = 'http://localhost:8003';
const tokenProductos = verificarAuth();

// Inicializar Navbar con el usuario
const userObj = getUsuario();
if (userObj) {
    document.getElementById('nombre-usuario').textContent = `👤 ${userObj.nom || 'Admin'}`;
}

const headersAuth = {
    'Authorization': `Bearer ${tokenProductos}`,
    'Content-Type': 'application/json'
};

let todosLosProductos = []; // Guardado local

// 1. Obtener y listar productos
async function cargarProductos() {
    try {
        const response = await fetch(`${API_PRODUCTOS}/productos`, { headers: headersAuth });
        const resData = await response.json();
        
        todosLosProductos = resData.data || resData || [];
        renderizarTabla(todosLosProductos);
    } catch (e) {
        console.error("Error al traer los productos:", e);
    }
}

// 2. Renderizar filas de la tabla de forma dinámica
function renderizarTabla(lista) {
    const tbody = document.getElementById('tabla-productos');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1rem; color:#94a3b8;">No hay productos en esta categoría.</td></tr>`;
        return;
    }

    lista.forEach(prod => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        
        // CORRECCIÓN DISPONIBILIDAD: Fusionamos y evaluamos tanto 'disponibilidad' como 'disponible'
        const valorDisp = prod.disponibilidad !== undefined ? prod.disponibilidad : prod.disponible;
        const esDisponible = valorDisp == 1 || valorDisp === true || valorDisp === '1' || valorDisp === 'Disponible';
        
        const badgeColor = esDisponible ? '#10b981' : '#ef4444'; // Verde esmeralda o Rojo
        const badgeText = esDisponible ? 'Disponible' : 'Agotado';

        // CORRECCIÓN CATEGORÍA: Extraemos el texto interno para evitar el [object Object]
        let nombreCategoria = 'Sin categoría';
        if (prod.categoria) {
            if (typeof prod.categoria === 'object') {
                nombreCategoria = prod.categoria.nombre || prod.categoria.nombre_categoria || prod.categoria.descripcion || 'Categoría';
            } else {
                nombreCategoria = prod.categoria;
            }
        }

        const precioMostrado = prod.precio_unitario || prod.precio || 0;

        tr.innerHTML = `
            <td style="padding: 0.5rem; font-weight: 500;">${prod.nombre_producto || prod.nombre}</td>
            <td style="padding: 0.5rem; color: #64748b;">${nombreCategoria}</td>
            <td style="padding: 0.5rem;">$${parseFloat(precioMostrado).toFixed(2)}</td>
            <td style="padding: 0.5rem;"><span style="color: ${badgeColor}; font-weight: bold; font-size: 0.85rem;">${badgeText}</span></td>
            <td style="padding: 0.5rem; text-align: center;">
                <button onclick="eliminarProducto(${prod.id})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold;">❌ Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. Filtrar por categoría en el cliente
function filtrarProductos(categoria) {
    if (categoria === 'Todos') {
        renderizarTabla(todosLosProductos);
    } else {
        const filtrados = todosLosProductos.filter(p => {
            const catNombre = (typeof p.categoria === 'object') ? (p.categoria.nombre || p.categoria.nombre_categoria) : p.categoria;
            return catNombre === categoria;
        });
        renderizarTabla(filtrados);
    }
}

// 4. Registrar nuevo Producto con validaciones
document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertDiv = document.getElementById('producto-alert');
    alertDiv.style.display = 'none';

    const nombre = document.getElementById('prod-nombre').value.trim();
    const precio = parseFloat(document.getElementById('prod-precio').value);
    const dispValue = parseInt(document.getElementById('prod-disponible').value);
    const categoriaSeleccionada = document.getElementById('prod-categoria').value;

    // Validación obligatoria en cliente
    if (!nombre) {
        alertDiv.textContent = "El nombre del producto no puede estar vacío.";
        alertDiv.style.display = 'block';
        return;
    }
    if (precio <= 0 || isNaN(precio)) {
        alertDiv.textContent = "El precio debe ser un número mayor a cero.";
        alertDiv.style.display = 'block';
        return;
    }

    // SOLUCIÓN DEFINITIVA: Enviamos variables numéricas y booleanas simultáneamente
    const payload = {
        nombre_producto: nombre,
        nombre: nombre,
        categoria: categoriaSeleccionada,
        categoria_id: parseInt(categoriaSeleccionada), 
        precio_unitario: precio,
        precio: precio,
        disponibilidad: dispValue, 
        disponible: dispValue === 1 ? true : false
    };

    try {
        const response = await fetch(`${API_PRODUCTOS}/productos`, {
            method: 'POST',
            headers: headersAuth,
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('form-producto').reset();
            cargarProductos(); // Refresca la lista completa
        } else {
            alertDiv.textContent = data.message || "Error al añadir el producto.";
            alertDiv.style.display = 'block';
        }
    } catch (err) {
        alertDiv.textContent = "Error de comunicación con el microservicio de productos.";
        alertDiv.style.display = 'block';
    }
});

// 5. Eliminar un producto
async function eliminarProducto(id) {
    if (!confirm('¿Seguro que deseas remover este producto del menú?')) return;

    try {
        const response = await fetch(`${API_PRODUCTOS}/productos/${id}`, {
            method: 'DELETE',
            headers: headersAuth
        });

        if (response.ok) {
            cargarProductos();
        } else {
            alert('No se pudo eliminar el producto.');
        }
    } catch (e) {
        console.error("Error al eliminar:", e);
    }
}

// Running al cargar la vista
document.addEventListener('DOMContentLoaded', cargarProductos);