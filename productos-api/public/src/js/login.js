document.addEventListener('DOMContentLoaded', async () => {
    // Comprobación de sesión
    try {
        const sessionCheck = await fetch('/api/session', {
            credentials: 'include'
        });
    
    const result = await sessionCheck.json();
    
    if (result.authenticated) {
        window.location.replace(result.user.role === 'admin' 
            ? '/menu.html' 
            : '/cajero.html');
    }

    } catch (error) {
        console.log('Already not active session');
    }

    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = e.target.elements['username'].value.trim();
        const password = e.target.elements['password'].value.trim();

        // Validations
        const xssPattern = /[<>"']/;
        const minLength = 4;
        const maxLength = 20;

        if (!username || !password) 
        { alert("All the fields are obligatoried"); return; }
        if (username.length < minLength || password.length < minLength) 
        { alert(`User and password must have at least ${minLength} characters.`); return; }
        if (username.length > maxLength || password.length > maxLength) 
        { alert(`Usuario y contraseña no pueden exceder los ${maxLength} caracteres.`); return; }
        if (xssPattern.test(username) || xssPattern.test(password)) 
        { alert("Characters not allowed: < > \" ' ");return; }

        try {
            const response = await fetch('/api/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (response.ok) 
            {
                const result = await response.json();
                window.location.replace(result.redirectUrl || '/menu.html');
            } else 
            {
                const error = await response.json();
                alert(error.error || 'Error en el login');
            }
        } catch (error) 
        {
            console.error('Error en login:', error);
            alert('Error de conexión con el servidor');
        }
    });
});
