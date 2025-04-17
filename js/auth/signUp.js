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
    const city = document.getElementById('signup-city').value;
    const state = document.getElementById('signup-state').value;
    const location = city && state ? `${city}, ${state}` : city || state || "";

    console.log(fullname, username, email, phonenumber, password);
    try {
        // 1. Create Auth user
        const { data: authData, error: authError } = await _supabase.auth.signUp({
            email: email,
            phone: phonenumber,
            password: password,
            options: {
                data: {
                    display_name: username,
                    full_name: fullname,
                    phone_number: phonenumber
                }
            }
        });
        if (authError) throw authError;
        console.log("Auth user created:", authData.user.id);

        // 2. Geocode location (if provided)
        let lat, lng;
        if (location) {
            console.log("Geocoding location:", location);
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyDradz2mjYgwEDQP2TJ195DIcaSj3KTcxk`;
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            if (data.status !== "OK") throw new Error("Geocoding failed: " + data.status);
            lat = data.results[0].geometry.location.lat;
            lng = data.results[0].geometry.location.lng;
        }

        // 3. Insert profile (even if location is empty)
        const profileData = {
            id: authData.user.id,
            username: username,
            email: email,
            phone_number: phonenumber,
            full_name: fullname,
            ...(location && { location: location }), // Include if exists
            ...(lat && lng && { 
                latitude: lat,
                longitude: lng,
                geolocation: `POINT(${lng} ${lat})`
            })
        };

        const { error: profileError } = await _supabase
            .from('profiles')
            .insert(profileData);
        
        if (profileError) {
            console.error("Profile Error Details:", profileError);
            throw profileError;
        }

        alert('Signup successful! Check your email to verify.');
        
        // Optional: Auto-login
        const { data, error: loginError } = await _supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (loginError) throw loginError;
        
        // Redirect to location page
        window.location.href = 'location.html';

    } catch (error) {
        console.error('Signup Error:', error);
        alert(`Signup failed: ${error.message}`);
    }
}

