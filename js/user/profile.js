async function fetchuserData (profileContainer) {
    
    let loggedInUser= await checkUser();

    console.log('Fetching data...');
    
    const {data, error} = await supabase
      .from('profiles')
      .select()
      .eq('id', loggedInUser.user.id)

      if(error){
        console.log('Could not fetch the data')
        console.log(error)
      }

      if(data){

        let loggedInUserProfile = data[0];
        
        //filter user data to check if its the same thing as logged in user
        profileContainer.innerHTML = ``;

        const html_to_insert = `
            <div class="profile-picture">
                <img src="${loggedInUserProfile.avatar_url || '../../images/profileicon.png'}" alt="Profile Picture" />
            </div>
            <h3 class="profile-name">
                 ${loggedInUserProfile.username ? 
                `${loggedInUserProfile.username} <i class="fas fa-check-circle"></i>` : 
                'Anonymous User'}
            </h3>
            <p class="profile-location">
                ${loggedInUserProfile.location ? 
                `${loggedInUserProfile.location.toUpperCase()}` : 
                'No Location Set'}
            </p>
            <p class="profile-bio">
                 ${loggedInUserProfile.user_bio ? 
                `${loggedInUserProfile.user_bio}` : 
                'No Description Set'}
            </p>

            <div class="profile-buttons">
                <a href="../profile/profilesettings.html" class="profile-btn"><i class="fas fa-user-gear"></i> PROFILE SETTINGS</a>
                <a href="../profile/create.html" class="profile-btn"><i class="fas fa-square-plus"></i> CREATE EVENT</a>
            </div>
            `;

        // Insert HTML
        profileContainer.insertAdjacentHTML('beforeend', html_to_insert);

        document.querySelector('.profile-attended-events-counter').textContent = loggedInUserProfile.attended_events_count;
        document.querySelector('.profile-points-counter').textContent = loggedInUserProfile.current_point_balance;
        document.querySelector('.profile-followers-counter').textContent = loggedInUserProfile.follower_count;


      }
    
    //   const {prefdata, preferror} = await supabase
    //     .from('preferences')
    //     .insert([{ 
    //         user_id: loggedInUser.user.id, 
    //         events_category: ['one', 'two', 'three', 'four'] ,
    //         food_category: ['one', 'two', 'three', 'four'] ,
    //         cuisine_category: ['one', 'two', 'three', 'four'] ,
    //         art_category: ['one', 'two', 'three', 'four'] ,
    //         artstyle_category: ['one', 'two', 'three', 'four'] ,
    //         music_category: ['one', 'two', 'three', 'four'] ,
    //     }])

    //   if(preferror){
    //     console.log('Could not fetch the data')
    //     console.log(preferror)
    //   }

    //   if(prefdata){

    //     console.log('Data inserted successfully', prefdata);
    //     let loggedInUserProfile = prefdata[0];
        
    //     //filter user data to check if its the same thing as logged in user
    //     profileContainer.innerHTML = ``;

    //     const html_to_insert = `
    //         <div class="profile-picture">
    //             <img src="${loggedInUserProfile.avatar_url || '../../images/profileicon.png'}" alt="Profile Picture" />
    //         </div>
    //         <h3 class="profile-name">
    //              ${loggedInUserProfile.username ? 
    //             `${loggedInUserProfile.username} <i class="fas fa-check-circle"></i>` : 
    //             'Anonymous User'}
    //         </h3>
    //         <p class="profile-location">
    //             ${loggedInUserProfile.location.toUpperCase() ? 
    //             `${loggedInUserProfile.location.toUpperCase()}` : 
    //             'No Location Set'}
    //         </p>
    //         <p class="profile-bio">
    //              ${loggedInUserProfile.user_bio ? 
    //             `${loggedInUserProfile.user_bio}` : 
    //             'No Description Set'}
    //         </p>

    //         <p class="profile">
    //              ${prefdata ? 
    //             `${prefdata}` : 
    //             'No Description Set'}
    //         </p>

    //         <div class="profile-buttons">
    //             <a href="../profile/editprofile.html" class="profile-btn">EDIT PROFILE</a>
    //             <a href="../profile/create.html" class="profile-btn">CREATE EVENT</a>
    //         </div>
    //         `;

    //     // Insert HTML
    //     profileContainer.insertAdjacentHTML('beforeend', html_to_insert);

    //   }
    
}



document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        console.error('Could not connect to Supabase. Please check your console for more details.');
        return;
    }

    
    // displayAuthForms();
    const profileContainer = document.getElementById('profile-info');

    
    // Add event listeners for login and signup
    // const User = checkUser()
    fetchuserData(profileContainer);

});


