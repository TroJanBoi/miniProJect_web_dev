const connection = new signalR.HubConnectionBuilder()
    .withUrl("/postHub")
    .build();
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    try {
        const response = await fetch('/Register/Register', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();
        //console.log(result);
        if (result.success) {
            const modal = document.getElementById('registerSuccess');
            modal.classList.add('show');

            setTimeout(() => {
                modal.classList.remove('show');
                window.location.href = '/';
            }, 2400);
        } else {
            const modal = document.getElementById('registerFail');
            modal.classList.add('show');
            setTimeout(() => {
                modal.classList.remove('show');
                location.reload();
            }, 2000);
        }
        
    } catch (error) {}
});
function validateFullName(input) {
    const errorSpan = document.getElementById('fullNameError');
    if (input.value.trim() === '') {
        errorSpan.textContent = 'Full Name is required.';
    } else {
        errorSpan.textContent = '';
    }
}

function validateUsername(input) {
    const errorSpan = document.getElementById('usernameError');
    if (input.value.trim() === '') {
        errorSpan.textContent = 'Username is required.';
    } else {
        errorSpan.textContent = '';
    }
}

function validateEmail(input) {
    const errorSpan = document.getElementById('emailError');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (input.value.trim() === '') {
        errorSpan.textContent = 'Email is required.';
    } else if (!emailPattern.test(input.value)) {
        errorSpan.textContent = 'Invalid email format.';
    } else {
        errorSpan.textContent = '';
    }
}

function validatePassword(input) {
    const errorSpan = document.getElementById('passwordError');
    if (input.value.length < 6) {
        errorSpan.textContent = 'Password must be at least 6 characters.';
    } else {
        errorSpan.textContent = '';
    }
}