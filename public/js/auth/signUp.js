// signUp.js - Main application logic

// Get the supabase instance that was initialized in supabase.js
// const _supabase = window.supabaseInstance;
// Display signup forms
// import { handleLogout } from '../../pages/main/explore.js';

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        console.error('Could not connect to Supabase. Please check your console for more details.');
        return;
    }

    // displayAuthForms();
    
    // Add event listeners for login and signup
    document.getElementById('signUpForm').addEventListener('submit', handleSignup);
    // document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // const createAccountButton = document.querySelector("#createAccountBtn");
  
    // if (createAccountButton) {
    //   createAccountButton.addEventListener("click", function () {
    //     // Redirect to the location page to start the survey portion
    //     console.log('Redirecting to location.html');
    //     // window.location.href = "location.html";
    //   });
    // }
});


// Rest of your app.js functions remain the same, using the supabase variable

async function handleLoginRedirect () {
    try {
        const loginStatus = await checkUser();
        console.log('loginStatus: ', loginStatus);
        if (loginStatus === undefined) {
            // User is NOT logged in
            // alert('You need to log in first.');
            
            // window.location.href = './pages/login.html';
            return; // Stop execution
        } else if (loginStatus) {
            // User IS logged in
            // alert('logged in');
            
            window.location.href = 'location.html';
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
    const fullname = document.getElementById('signup-full-name').value;
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const phonenumber = document.getElementById('signup-phone-number').value;
    const password = document.getElementById('signup-password').value;
    

    console.log(fullname, username, email, phonenumber, password);
    try {
        // 1. First, create user in Supabase Auth
        const { data: authData, error: authError } = await _supabase.auth.signUp({
            email: email,
            phone: phonenumber,
            password: password,
            options: {
                // Optional: include any additional metadata
                data: {
                    display_name: username,
                    full_name: fullname,
                    phone_number: phonenumber
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
                    email: email,
                    phone_number: phonenumber,
                    full_name: fullname,
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
