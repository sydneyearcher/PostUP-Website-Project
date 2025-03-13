// supabase.js
const supabaseUrl = 'https://xgpfsjbludruqfjrtsxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncGZzamJsdWRydXFmanJ0c3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNTgxNDAsImV4cCI6MjA1NjYzNDE0MH0.3w5Ci7RAJt61NmBXU2sg0yo7xtTpuRys7KIjiiRiz0o';


// Check which global object is available
let supabase;

if (window.supabase) {
    // If supabase is directly available as a global
    console.log('Supabase found in window object');
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
} else if (window.supabaseClient) {
    // If exposed as supabaseClient
    supabase = window.supabaseClient.createClient(supabaseUrl, supabaseKey); 
} else {
    // Log error to help with debugging
    console.error('Supabase client not found in global scope.');
    alert('Error: Supabase client not properly loaded. Check console for details.');
}

// Check if user is already logged in
// async function checkUser() {
//     if (!supabase) {
//         console.error('Supabase client not initialized');
//         return;
//     }
    
//     try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (user) {
//             console.log('User is logged in', user);
//             displayUserInfo(user);
//             loadPosts();
//         } else {
//             console.log('User is not logged in', user);
//             displayAuthForms();
//         }
//     } catch (error) {
//         console.error('Error checking user:', error);
//         displayAuthForms();
//     }
// }

// Export supabase client for use in other files
window.supabaseInstance = supabase;