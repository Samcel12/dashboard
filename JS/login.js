document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    const errorMessage = document.querySelector('#error-message');

    loginForm.addEventListener('submit', (event) => {
        // Empêche la page de se recharger lors de la soumission du formulaire
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        // Logique de vérification ultra-simple (à ne JAMAIS utiliser en production)
        if (username === 'user' && password === 'pass') {
            // Redirige vers la page d'accueil si la connexion réussit
            window.location.href = './Pages/accueil.html';
        } else {
            errorMessage.textContent = 'Identifiants incorrects.';
        }
    });
});