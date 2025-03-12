// import { supabase } from '../../supabase.js'; // For modern module usage

// Optional: Also check global instance for fallback
const _supabase = window.supabaseInstance || supabase;

async function checkUser() {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }
    try {
        console.log('checkUser');
        const { data: { user }, error } = await _supabase.auth.getUser();

        if (user) {
            // console.log('User is logged in', user);
            return { user };
        } else {
            console.log('User is not logged in', user);
        }
    } catch (error) {
        console.error('Error checking user:', error);
        return { user: null, error };
    }
}

// Optional global export for legacy scripts
window.checkUser = checkUser;