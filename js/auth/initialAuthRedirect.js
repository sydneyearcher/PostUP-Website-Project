// app.js - Main application logic

// Get the supabase instance that was initialized in supabase.js
// const _supabase = window.supabaseInstance;

// Display login and signup forms

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!supabase) {
        document.body.innerHTML = '<h1>Error: Could not connect to Supabase</h1><p>Please check your console for more details.</p>';
        return;
    }
    // Check if user is logged in
    handleLoginRedirect();
});

// Rest of your app.js functions remain the same, using the supabase variable

// async function handleRedirect () {
//     console.log("login");
    
//     try {
//         // check if user is logged in. if not, redirect to login page
//         if (!checkUser()) {
//             // Redirect to login page
//             window.location.href = './pages/login.html';
//         } else if (checkUser()) {
//             // Redirect to dashboard
//             window.location.href = './pages/dashboard.html';
//         }
        
//         // 2. If auth successful, run checkuser.
        
//         // 3. Handle successful signup
//         alert('Signin successful!');
        
//         checkUser();
//     } catch (error) {
//         console.error('Signin error:', error);
//         
//     }
// }


async function handleLoginRedirect() {
    try {
        const loginStatus = await checkUser();
        console.log('loginStatus: ', loginStatus);
        if (loginStatus == undefined) {
             // User is NOT logged in
            // alert('You need to log in first.');
            
            window.location.href = './pages/login.html';
            return; // Stop execution after redirect
        } else if (loginStatus) {
             // User IS logged in
            // alert('logged in');
            window.location.href = './pages/dashboard.html';
            return;
        }
    } catch (error) {
        console.error('Redirect error:', error);
        alert(`redirect failed: ${error.message}`);
    }
}