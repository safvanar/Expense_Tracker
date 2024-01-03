const loginForm = document.getElementById('loginForm')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const resetBtn = document.getElementById('resetBtn')

loginForm.addEventListener('submit', loginCheck)
resetBtn.addEventListener('click', resetPassword)

async function loginCheck(e){
    try{
        e.preventDefault()
        const data = {
            email: emailInput.value,
            password: passwordInput.value
        }
        const login = await axios.post('/user/login', data)
        
        if(login.data.login === 'success'){
            localStorage.setItem('token', login.data.token)
            window.location.href = '/home'
            window.alert('Login successful!')
        }else{
            throw new Error('Authentication failed!')        
        }
    }catch(err){
        console.log(err)
        document.getElementById('response-message').innerText = `${err.response.data.message}`
    }
}

async function resetPassword(e){
    e.preventDefault()
    var resetModal = new bootstrap.Modal(document.getElementById('resetModal'));
    resetModal.show();
    var resetForm = document.getElementById('resetForm');
    var emailInput = document.getElementById('resetEmail');

    resetForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        var enteredEmail = emailInput.value;
        const data = {
            resetEmail: enteredEmail
        }
        // Handle the password reset logic (send email, etc.)
        const response = await axios.post('/password/resetPasswordReq', data)

        setTimeout(function () {
            // Display the success message
            successMessage.style.display = 'block';
        }, 1000);
        // Close the modal after handling the submission
        // resetModal.hide();
    });

    // Hide the success message when the modal is closed
    resetModal._element.addEventListener('hidden.bs.modal', function () {
        successMessage.style.display = 'none';
    });
}