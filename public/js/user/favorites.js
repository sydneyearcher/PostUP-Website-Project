// favorites.js
let allUserFavorites = [];

async function fetchuserData () {
    let loggedInUser= await checkUser();
    
    console.log('Fetching data of...', loggedInUser.user.id);
    
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

const fetchFavoritesData = async () => {
    let thisUser = await fetchuserData();

    const {data, error} = await supabase
        .from('favorites')
        .select(`
            *,
            events (
                id,
                title,
                location,
                category,
                image_url,
                datetime
            )`
        )
        .eq('user_id', thisUser.id)

      if(error){
        console.log('Could not fetch the data')
        console.log(error)
      }
      if(data){
        console.log('Data fetched successfully')
        // console.log(JSON.stringify(data))
        allUserFavorites = data; // Store fetched posts globally
        console.log("favorites", allUserFavorites)
        await loadFavorites(allUserFavorites); // Load all posts initially
    }
}



async function loadFavorites(allUserFavorites) {
    const favoritesContainer = document.getElementById('favorites-container');
    let favorites = allUserFavorites.map( (element) => element.events );
    console.log("whet are favorites ", favorites);
    // console.log("whet are posts ", favorites[0].title);
    // ... fetch posts from Supabase ...
    
    // Clear and rebuild the entire posts container
    favoritesContainer.innerHTML = '';

    if (favorites === "") {
        favoritesContainer.insertAdjacentHTML('beforeend', '<p class="empty-message">NO FAVORITED EVENTS YET.</p>');
        return;
    } else {
        favorites.forEach((favorites, index) => {

            const html_to_insert = `
                <div class="event-card">
                    <figure class="favorite-event-image">
                        ${ favorites.image_url ? `<img src="${favorites.image_url}" 
                            alt="event image" 
                            class="event-image"
                            />`: ''}
                    </figure>
                    <div class="favorite-event-details">
                        <h3>${favorites.title}</h3>
                        <p>${favorites.location}</p>
                        <p>${new Date(favorites.datetime).toLocaleDateString()}</p>
                        <p class="event-category">${favorites.category}</p>
                    </div>
                </div>
            `;

            // Insert HTML for each post
            favoritesContainer.insertAdjacentHTML('beforeend', html_to_insert);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        console.error('Could not connect to Supabase. Please check your console for more details.');
        return;
    }
    
    // Add event listeners for login and signup
    // const User = checkUser()
    fetchFavoritesData();
});