const authToken = localStorage.getItem('authToken');


document.addEventListener('DOMContentLoaded', () => {
    const nav_logout = document.getElementById('nav-item-logout');

    if (authToken) {
        const nav_login = document.getElementById('nav-item-login');
        nav_login.innerHTML = '';
        const nav_signup = document.getElementById('nav-item-signup');
        nav_signup.innerHTML = '';
        
    } else {
        nav_logout.innerHTML = "";
    }

    nav_logout.addEventListener('click', (e) => {
        e.preventDefault();
        const confirmation = confirm('Are you sure you want to logout?');
        
        if (confirmation) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userGroup');
            window.location.href='login.html';

        } else {return;}

    })


})