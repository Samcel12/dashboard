document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    const errorMessage = document.querySelector('#error-message');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        if (username === 'user' && password === 'pass') {
            // CORRECTION: Redirige vers le hub qui se trouve dans le dossier Pages
            window.location.href = 'Pages/accueil.html';
        } else {
            errorMessage.textContent = 'Identifiants incorrects.';
        }
    });
});