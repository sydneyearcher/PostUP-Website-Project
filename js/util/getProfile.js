// import { supabase } from '../../supabase.js'; // For modern module usage

// Optional: Also check global instance for fallback

async function getProfile() {

    let loggedInUser= await checkUser();
        
    // console.log('Fetching data of...', loggedInUser.user.id);

    const {data, error} = await supabase
        .from('profiles')
        .select()
        .eq('id', loggedInUser.user.id)

        if(error){
        console.log('Could not fetch the data')
        console.log(error)
        }

        if(data){

        loggedInUserProfile = data[0];
        return loggedInUserProfile;
        }
}

// Optional global export for legacy scripts
window.getProfile = getProfile;