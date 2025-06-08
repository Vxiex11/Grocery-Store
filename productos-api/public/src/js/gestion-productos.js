document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const productoForm = document.getElementById('productoForm');
    const nuevoProductoBtn = document.getElementById('nuevoProducto');
    const cancelarEdicionBtn = document.getElementById('cancelarEdicion');
    const eliminarProductoBtn = document.getElementById('eliminarProducto');
    const listarProductosBtn = document.getElementById('listarProductos');
    const mensajeDiv = document.getElementById('mensaje');
    const productoActionsDiv = document.getElementById('productoActions');
    const submitBtn = document.getElementById('submit-btn');
    const formTitle = document.getElementById('form-title');
    const logoutBtn = document.getElementById('logoutBtn');

    const buscarProductoInput = document.getElementById('buscarProducto');
    const resultadosBusqueda = document.createElement('div');
    resultadosBusqueda.id = 'resultadosBusqueda';
    resultadosBusqueda.className = 'resultados-busqueda';
    buscarProductoInput.parentNode.insertBefore(resultadosBusqueda, buscarProductoInput.nextSibling);

    // Event Listeners
    productoForm.addEventListener('submit', handleFormSubmit);
    nuevoProductoBtn.addEventListener('click', resetForm);
    cancelarEdicionBtn.addEventListener('click', resetForm);
    eliminarProductoBtn.addEventListener('click', eliminarProductoActual);
    listarProductosBtn.addEventListener('click', listarTodosProductos);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    } else {
        console.warn('El botón de logout no se encontró en el DOM');
    }

    buscarProductoInput.addEventListener('input', buscarProductosEnTiempoReal);
    document.addEventListener('click', cerrarResultadosBusqueda);

    // Verificar sesión al cargar la página
    verificarSesion();

    /* FUNCTIONS */

    function mostrarMensaje(mensaje, tipo) {
        mensajeDiv.innerHTML = `<p>${mensaje}</p>`;
        mensajeDiv.className = tipo;

        setTimeout(() => {
            if (mensajeDiv.textContent === mensaje) {
                mensajeDiv.textContent = '';
                mensajeDiv.className = '';
            }
        }, 5000);
    }

    function mostrarListaProductos(productos) {
    const lista = document.createElement('div');
    lista.innerHTML = '<h3>Lista de productos:</h3>';

    const ul = document.createElement('ul');
    productos.forEach(producto => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>ID: ${producto.product_id}</strong> - ${producto.product_name}
            (Existencia: ${producto.existence})
            <button class="secondary" onclick="cargarProductoDesdeLista(${producto.product_id})">Editar</button>
        `;
        ul.appendChild(li);
    });

        lista.appendChild(ul);
        mensajeDiv.appendChild(lista);
    }

    function configurarManejoHistorial() {
        if (!window.location.pathname.includes('/login.html')) {
            const currentPage = window.location.pathname.split('/').pop() || 'menu.html';

            if (!window.history.state || window.history.state.page !== currentPage) {
                window.history.replaceState({
                    page: currentPage,
                    timestamp: Date.now(),
                    authenticated: true
                }, '', window.location.href);
            }

            window.addEventListener('popstate', function(event) {
                if (!event.state || (event.state.page === 'login.html' && event.state.authenticated !== true)) {
                    window.history.pushState({
                        page: currentPage,
                        timestamp: Date.now(),
                        authenticated: true
                    }, '', window.location.href);

                    mostrarMensaje('Ya estás en la página actual', 'info');
                }
            });

            window.history.pushState({
                page: currentPage,
                timestamp: Date.now(),
                authenticated: true
            }, '', window.location.href);
        }
    }

    function mostrarSugerencias(prodcuts) {
    resultadosBusqueda.innerHTML = '';

    prodcuts.forEach(prodcuts => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';

        suggestionItem.innerHTML = `
            <div class = "suggestion-info">
                <p>${prodcuts.product_name}</p>
                <span class="price">$${Number(prodcuts.sale_price).toFixed(2)}</span>
                <span class="id">ID: ${prodcuts.product_id}</span>
            </div>
        `;

        suggestionItem.addEventListener('click', () => {
            cargarProductoEnFormulario(prodcuts);
            buscarProductoInput.value = prodcuts.product_id;
            resultadosBusqueda.innerHTML = '';
            mostrarMensaje('Producto cargado', 'success');
        });

        resultadosBusqueda.appendChild(suggestionItem);
    });

        resultadosBusqueda.style.display = 'block';
    }



    function buscarProductosEnTiempoReal(e) {
        const query = e.target.value.trim();

        if (query.length < 2) {
            resultadosBusqueda.innerHTML = '';
            resultadosBusqueda.style.display = 'none';
            return;
        }

        clearTimeout(buscarProductoInput.debounceTimer);
        buscarProductoInput.debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

                if (response.ok) {
                    const productos = await response.json();
                    if (productos.length > 0) {
                        mostrarSugerencias(productos);
                    } else {
                        resultadosBusqueda.innerHTML = '<div class="no-results">No se encontraron productos</div>';
                        resultadosBusqueda.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error en búsqueda:', error);
            }
        }, 300);
    }


    function cerrarResultadosBusqueda(e) {
        if (!buscarProductoInput.contains(e.target) && !resultadosBusqueda.contains(e.target)) {
            resultadosBusqueda.style.display = 'none';
        }
    }

    function cargarProductoEnFormulario(prodcuts) {
        //console.log("Datos del producto recibidos:", prodcuts); -> ONLY WHEN WE WANNA SEE THIS !!!!
        document.getElementById('productoId').value = prodcuts.product_id || prodcuts.id;
        document.getElementById('nombre').value = prodcuts.product_name || '';
        document.getElementById('codigo_barras').value = prodcuts.barcode || '';
        document.getElementById('precio_compra').value = prodcuts.purchase_price || '';
        document.getElementById('precio_venta').value = prodcuts.sale_price || '';
        document.getElementById('existencia').value = prodcuts.existence || '';
        document.getElementById('id_proveedor').value = prodcuts.supplier_id || '';

        submitBtn.textContent = 'Actualizar Producto';
        cancelarEdicionBtn.classList.remove('hidden');
        productoActionsDiv.classList.remove('hidden');
        formTitle.textContent = 'Editar Producto';
    }

    function resetForm() {
        productoForm.reset();
        document.getElementById('productoId').value = '';
        submitBtn.textContent = 'Guardar Producto';
        cancelarEdicionBtn.classList.add('hidden');
        productoActionsDiv.classList.add('hidden');
        formTitle.textContent = 'Nuevo Producto';
        mostrarMensaje('Formulario listo para nuevo producto', 'info');
        buscarProductoInput.value = '';
    }


    /* ASYNC ' S */

    async function verificarSesion() {
        try {
            const response = await fetch('/api/session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Error al verificar la sesión';
                console.error('Error del backend:', errorMessage);
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.authenticated || data.user?.role !== 'admin') {
                window.location.replace('/login.html');
                return false;
            }

            // console.log('Sesión verificada:', data); -> do not remove comment unless it is a production !!!
            document.getElementById('userName').textContent = data.user?.username || 'username';

            configurarManejoHistorial();
            return true;

        } catch (error) {
            console.error('Error en verificarSesion:', error.message);
            window.location.replace('/login.html');
            return false;
        }
    }

    async function cerrarSesion() {
        try {
            const response = await fetch('/api/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.redirected) {
                window.location.replace(response.url);
                return;
            }

            if (response.ok) {
                window.location.replace('/login.html');
                return;
            }

            const errorText = await response.text();
            throw new Error(errorText || 'Error al cerrar sesión');

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            mostrarMensaje(`Error al cerrar sesión: ${error.message}`, 'error');
            window.location.replace('/login.html');
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        const productoId = document.getElementById('productoId').value;
        const url = productoId ? `/${productoId}` : '/api/crear';
        const method = productoId ? 'PUT' : 'POST';

        const product_name = document.getElementById('nombre').value.trim();
        const precioVenta = document.getElementById('precio_venta').value;

        if (!product_name || !precioVenta) {
            mostrarMensaje('Nombre y precio de venta son campos obligatorios', 'error');
            return;
        }

        const data_product = {
            product_name: document.getElementById('nombre').value.trim(),
            barcode: document.getElementById('codigo_barras').value.trim(),
            purchase_price: parseFloat(document.getElementById('precio_compra').value),
            sale_price: parseFloat(document.getElementById('precio_venta').value),
            existence: parseInt(document.getElementById('existencia').value),
            supplier_id: parseInt(document.getElementById('id_proveedor').value),
            product_id: parseInt(document.getElementById('productoId').value)
        };


        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data_product)
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(text || 'Respuesta no JSON recibida');
            }

            const data = await response.json();

            if (response.ok) {
                mostrarMensaje(
                    productoId ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                    'success'
                );
                if (!productoId) {
                    document.getElementById('productoId').value = data.product_id || data.id;
                    cargarProductoEnFormulario(data);
                }
            } else {
                throw new Error(data.error || data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error en handleFormSubmit:', error);

            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Error de conexión con el servidor';
            } else if (error.message.includes('Unexpected token')) {
                errorMessage = 'Respuesta inválida del servidor';
            }

            mostrarMensaje(`Error: ${errorMessage}`, 'error');
        }
    }


    async function eliminarProductoActual() {
        const productoId = document.getElementById('productoId').value;

        if (!productoId) {
            mostrarMensaje('No hay producto cargado para eliminar', 'error');
            return;
        }

        if (!confirm('¿Está seguro que desea eliminar este producto permanentemente?')) {
            return;
        }

        try {
            const response = await fetch(`/${productoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al eliminar el producto');
            }

            mostrarMensaje('Producto eliminado correctamente', 'success');
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje(`Error al eliminar: ${error.message}`, 'error');
        }
    }

    async function listarTodosProductos() {
        try {
            const response = await fetch('/api/listar');
            const productos = await response.json();

            if (response.ok) {
                if (productos.length === 0) {
                    mostrarMensaje('No hay productos registrados', 'info');
                } else {
                    mostrarMensaje(`Mostrando ${productos.length} productos`, 'info');
                    mostrarListaProductos(productos);
                }
            } else {
                throw new Error(productos.error || 'Error al obtener productos');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    }

    window.cargarProductoDesdeLista = async function(id) {
        try {
            const response = await fetch(`/api/productos/${id}`);
            const producto = await response.json();

            if (response.ok) {
                cargarProductoEnFormulario(producto);
                mostrarMensaje(`Producto ID: ${id} cargado para edición`, 'success');
                buscarProductoInput.value = id;
            } else {
                throw new Error(producto.error || 'Error al cargar producto');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje(`Error: ${error.message}`, 'error');
        }
    };
});