// Logout.js - Main application logic

// Get the supabase instance that was initialized in supabase.js
async function handleLogout(e) {
    e.preventDefault();
    
    console.log("logout", e.target);

    // 1. First, create user in Supabase Auth

    const { error } = await _supabase.auth.signOut()
    
    if (error) throw error;
    
    // 2. If auth successful, run checkuser.
    
    // 3. Handle successful signup
    alert('Signout successful!');
   
    // Refresh the page or update UI 
    // implement this using promises in the future
    await checkUser();
    await handleLogoutRedirect();
}

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
});

async function handleLogoutRedirect() {
    try {
        const loginStatus = await checkUser();
        console.log('loginStatus: ', loginStatus);
        if (loginStatus === undefined) {
             // User is NOT logged in
            // alert('You need to log in first.');
            
            window.location.href = '../../index.html';
            return; // Stop execution after redirect
        } else if (loginStatus) {
             // User IS logged in
            // alert('logged in');
            // window.location.href = './pages/dashboard.html';
            return;
        }
    } catch (error) {
        console.error('Redirect error:', error);
        alert(`redirect failed: ${error.message}`);
    }
}