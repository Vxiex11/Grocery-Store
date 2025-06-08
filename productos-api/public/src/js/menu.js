document.addEventListener('DOMContentLoaded', function() {
    // Configurar elementos del DOM
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameSpan = document.getElementById('userName');
    const gestionProductosBtn = document.getElementById('gestionProductosBtn');
    const cajeroBtn = document.getElementById('cajeroBtn');
    const mensajeDiv = document.getElementById('mensaje');
    
    
    // Inicializar la aplicación
    initMenu();

    // FUNCTIONS
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

    async function verificarSesionAdmin() {
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
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();
            
            // Verificar autenticación y rol
            if (!data.authenticated || data.user?.role !== 'admin') {
                throw new Error('Acceso no autorizado');
            }
            
            return data;
            
        } catch (error) {
            console.error('Error verificando sesión:', error.message);
            setTimeout(() => window.location.replace('/login.html'), 1000);
            throw error;
        }
    }

    async function initMenu() {
        try {
            // Verificar sesión primero
            const sessionData = await verificarSesionAdmin();
            
            // Configurar elementos de la UI
            if (userNameSpan && sessionData.user) {
                userNameSpan.textContent = sessionData.user.username || 'admin';
            }
            
            // Configurar botón de logout
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // Previene un salto innecesario si es un <a>
                    fetch('/api/logout')
                        .then(res => {
                            if (res.redirected) {
                                window.location.href = res.url; // Redirige al login si el backend lo hace
                            }else if (res.ok) {
                                window.location.href = '/login.html';
                             } else {
                                return res.text().then(text => { throw new Error(text); });
                            }
                        })
                        .catch(err => {
                            console.error('[!] Error al cerrar sesión:', err);
                            alert('Error al cerrar sesión.');
                        });
                });
            }
            
            // Configurar botón de gestión de productos
            if (gestionProductosBtn) {
                gestionProductosBtn.addEventListener('click', irAGestionProductos);
            } else {
                console.warn('Botón de gestión de productos no encontrado');
            }
            
            // Configurar botón de cajero
            if (cajeroBtn) {
                cajeroBtn.addEventListener('click', irACajero);
            } else {
                console.warn('Botón de cajero no encontrado');
            }
            
            // Configurar manejo del historial
            configurarManejoHistorial();
            
            console.log('Menú administrativo cargado correctamente');
            
        } catch (error) {
            console.error('Error inicializando el menú:', error);
            window.location.replace('/login.html');
        }
    }

    // Función para redirigir a gestión de productos
    function irAGestionProductos() {
        // Verificar sesión nuevamente antes de redirigir
        verificarSesionAdmin()
            .then(() => {
                window.location.href = '/gestion-productos.html';
            })
            .catch(error => {
                console.error('Error de sesión:', error);
                window.location.replace('/login.html');
            });
    }

    // Función para redirigir a cajero
    function irACajero() {
        // Verificar sesión nuevamente antes de redirigir
        verificarSesionAdmin()
            .then(() => {
                window.location.href = '/cajero.html';
            })
            .catch(error => {
                console.error('Error de sesión:', error);
                window.location.replace('/login.html');
            });
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
});