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

let todosLosProductos = []; // Guardado local para aplicar filtros rápidos sin saturar el microservicio

// 1. Obtener y listar productos
async function cargarProductos() {
    try {
        const response = await fetch(`${API_PRODUCTOS}/productos`, { headers: headersAuth });
        const resData = await response.json();
        
        // Maneja si viene envuelto en .data o directo como arreglo
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
        
        const badgeColor = prod.disponibilidad == 1 ? 'green' : 'red';
        const badgeText = prod.disponibilidad == 1 ? 'Disponible' : 'Agotado';

        tr.innerHTML = `
            <td style="padding: 0.5rem; font-weight: 500;">${prod.nombre}</td>
            <td style="padding: 0.5rem; color: #64748b;">${prod.categoria}</td>
            <td style="padding: 0.5rem;">$${parseFloat(prod.precio).toFixed(2)}</td>
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
        const filtrados = todosLosProductos.filter(p => p.categoria === categoria);
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

    // Validación obligatoria en cliente
    if (!nombre) {
        alertDiv.textContent = "El nombre del producto no puede estar vacío.";
        alertDiv.style.display = 'block';
        return;
    }
    if (precio <= 0) {
        alertDiv.textContent = "El precio debe ser un número mayor a cero.";
        alertDiv.style.display = 'block';
        return;
    }

    const payload = {
        nombre: nombre,
        categoria: document.getElementById('prod-categoria').value,
        precio: precio,
        disponibilidad: parseInt(document.getElementById('prod-disponible').value)
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

// Ejecución inicial
document.addEventListener('DOMContentLoaded', cargarProductos);