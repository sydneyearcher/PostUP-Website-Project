// app.js - Main application logic

// Get the supabase instance that was initialized in supabase.js
// const _supabase = window.supabaseInstance;
// Display login and signup forms
// import { handleLogout } from '../../pages/main/explore.js';

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        document.body.innerHTML = '<main><div class="error"><h1>Error: Could not connect to Supabase</h1><p>Please check your console for more details.</p></div></main>';
        return;
    }

    // displayAuthForms();
    
    // Add event listeners for login and signup
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    // document.getElementById('signup-form').addEventListener('submit', handleSignup);

    handleLoginRedirect ();
});


// Rest of your app.js functions remain the same, using the supabase variable

async function handleLogin (event) {
    event.preventDefault();
    console.log("login");

    // Get form values
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {

        const { data: userData, error: userError } = await supabase
        .from('profiles') // or your user table name
        .select('email')
        .eq('username', username)
        .single();
      
        if (userError || !userData) throw new Error('Username not found');
        
        // 1. First, create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password,
        });
        
        if (authError) throw authError;

        // 3. Handle successful signup
        alert('Signin successful!');
        await handleLoginRedirect();
        // Refresh the page or update UI
        
    } catch (error) {
        console.error('Signin error:', error);
        alert(`Signin failed: ${error.message}`);
    }
}

async function handleLoginRedirect () {
    try {
        const loginStatus = await checkUser();
        console.log('loginStatus: ', loginStatus);
        if (loginStatus === undefined) {
            // User is NOT logged in
            // alert('You need to log in first.');
            
            // window.location.href = './index.html';
            return; // Stop execution
        } else if (loginStatus) {
            // User IS logged in
            // alert('logged in');
            
            window.location.href = './pages/main/explore.html';
            return;
        }
    } catch (error) {
        console.error('Redirect error:', error);
        alert(`redirect failed: ${error.message}`);
    }
}


async function handleSignup(event) {
    event.preventDefault();
    console.log("sign up");

    // Get form values
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const username = document.getElementById('signup-username').value;
    
    try {
        // 1. First, create user in Supabase Auth
        const { data: authData, error: authError } = await _supabase.auth.signUp({
            email,
            password,
            options: {
                // Optional: include any additional metadata
                data: {
                    display_name: username
                }
            }
        });
        
        if (authError) throw authError;
        
        // 2. If auth successful, create a profile in your custom profiles table
        const { error: profileError } = await _supabase
            .from('profiles')
            .insert([
                { 
                    id: authData.user.id,  // Use the auth user's ID as the profile ID
                    username: username,
                    email: email
                    // Add any other profile-specific fields
                }
            ]);
        
        if (profileError) throw profileError;
        
        // 3. Handle successful signup
        alert('Signup successful! Please check your email to verify.');
        
        // Optional: Automatically sign in the user
        const { data, error } = await _supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        // Refresh the page or update UI
        await handleLoginRedirect();
    } catch (error) {
        console.error('Signup error:', error);
        alert(`Signup failed: ${error.message}`);
    }
}

