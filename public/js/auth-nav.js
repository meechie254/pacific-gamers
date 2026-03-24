/**
 * Pacific Gamers - Dynamic Navigation Utility
 * Updates the navbar based on authentication status.
 */

document.addEventListener('DOMContentLoaded', () => {
    const navUl = document.querySelector('.navbar ul');
    if (!navUl) return;

    const token = localStorage.getItem('pacific_token');
    const user = JSON.parse(localStorage.getItem('pacific_user'));

    const li = document.createElement('li');
    
    if (token && user) {
        // User is logged in
        const link = document.createElement('a');
        link.href = user.role === 'admin' ? 'admin.html' : 'profile.html';
        link.textContent = user.username;
        link.style.color = 'var(--primary)';
        link.style.fontWeight = 'bold';
        link.style.border = '1px solid rgba(0, 255, 204, 0.3)';
        link.style.padding = '5px 12px';
        link.style.borderRadius = '20px';
        li.appendChild(link);
    } else {
        // User is not logged in
        const link = document.createElement('a');
        link.href = 'login.html';
        link.textContent = 'Login';
        li.appendChild(link);
    }

    navUl.appendChild(li);
});
