// explore.js - explore page logic

// Get the supabase instance that was initialized in supabase.js
// const _supabase = window.supabaseInstance;

// Declare allPosts in a higher scope accessible to search functions
let allEvents = [];

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        document.body.innerHTML = '<h1>Error: Could not connect to Supabase</h1><p>Please check your console for more details.</p>';
        return;
    }
  
    // fetchuserData()

    // Check if user is logged in
    // checkUser();
  
    fetcheventData()

    // Add event listeners for search functionality
    document.querySelector('.search-btn').addEventListener('click', handleSearch);
    document.querySelector('.search-bar').addEventListener('keypress', (event) => {
        // if not 'enter key' just exit here
        if (event.keyCode !== 13) return
        // search if enter key pressed
        handleSearch()
    })
});

const fetcheventData = async () => {
    await checkUser();
    console.log('Fetching events data...');
    const {data, error} = await supabase
        .from('events')
        .select(``)
        .order('datetime', { ascending: true });

      if(error){
        console.log('Could not fetch the data')
        console.log(error)
      }
      if(data){
        console.log('Data fetched successfully')
        allEvents = data; // Store fetched posts globally
        loadEvents(allEvents); // Load all posts initially
        await applyFavoriteStates(); // Add this line
    }
}

let selectedCategory = null; // Track selected category

function handleCategoryClick(category) {
    // Toggle category if clicked again
    selectedCategory = selectedCategory === category ? null : category;
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.querySelector('.search-bar').value.trim().toLowerCase();
    
    // Apply category filter first
    let filteredEvents = selectedCategory 
        ? allEvents.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase())
        : allEvents;

    // Then apply search filter
    filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm)
    );

    loadEvents(filteredEvents);
}

// Add event listeners for category buttons
document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const image = this.querySelector('img');
        const category = this.querySelector('span').textContent.trim();
        
        
        if (image.classList.contains('active-filter-item')) {
            // Remove active state if already active
            image.classList.remove('active-filter-item');
        } else {
            // Remove active class from all filter images
            document.querySelectorAll('.filter-link img').forEach(img => {
              img.classList.remove('active-filter-item');
            });
            // Add active state to the clicked filter image
            image.classList.add('active-filter-item');
        }

        console.log("category", category);
        handleCategoryClick(category);
    });
});

// Update existing search handler to use applyFilters
function handleSearch() {
    applyFilters();
}

async function loadEvents(events) {
    const eventsContainer = document.getElementById('events-container');
    //console.log("whet are posts ", posts);
    // console.log("whet are posts ", posts[0].content);
    // ... fetch posts from Supabase ...
    
    // Clear and rebuild the entire posts container
    eventsContainer.innerHTML = '';

    if (events === "") {
        eventsContainer.insertAdjacentHTML('beforeend', '<p>No posts found.</p>');
        return;
    } else {
        events.forEach((event) => {
            // Access post properties directly (no [0])
            const html_to_insert = `
            <div class="event-box">
                <div class="event-image">
                    ${event.image_url ? `<img src="${event.image_url}" 
                    alt="Post Image" 
                    class="event-image"
                    >` : ''}   
                </div>
                <a href="../events/eventOV.html" class="clickable-text">
                    <h3 class="event-title">${event.title}</h3>
                    <p>${new Date(event.datetime).toLocaleDateString()} </p>
                    <p>${event.location}</p>
                    <small class="event-category">${event.category} </small>
                </a>
                <div class="post-actions">
                   <button class="heart-btn" onclick="toggleHeart(this)" data-event-id="${event.id}">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <i class="far fa-comment" title="Comment"></i>
                    <i class="fas fa-share" title="Share"></i>
                </div>
        </div>`;

            // Insert HTML for each post
            eventsContainer.insertAdjacentHTML('beforeend', html_to_insert);
        });
    }
}


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

// FAVORITE EVENT LOGIC
document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the list of favorites from localStorage (or initialize an empty array if none exist)
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  
    // Apply the 'favorited' state on both explore and events pages
    applyFavoriteState(favorites);
  });
  
  // Function to apply the favorited state (heart icon) on page load
  function applyFavoriteState(favorites) {
    // For explore page: Apply favorite heart state
    document.querySelectorAll(".event-box").forEach((eventBox) => {
      let eventTitle = eventBox.querySelector(".event-title").innerText;
      let heartIcon = eventBox.querySelector(".heart-btn i");
  
      if (favorites.includes(eventTitle)) {
        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid");
        heartIcon.style.color = "red";
      } else {
        heartIcon.classList.remove("fa-solid");
        heartIcon.classList.add("fa-regular");
        heartIcon.style.color = "";
      }
    });
  
    // For events page: Display favorited events and their heart state
    if (document.getElementById("favorites-container")) {
      displayFavoritedEvents(favorites);
    }
  }
  
//   // Toggle favorite function for heart button
//   function toggleHeart(button) {
//     let heartIcon = button.querySelector("i");
//     let eventBox = button.closest(".event-box");
//     let eventTitle = eventBox.querySelector(".event-title").innerText;
  
//     // Retrieve the list of favorites from localStorage
//     let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  
//     if (favorites.includes(eventTitle)) {
//       // Remove from favorites
//       favorites = favorites.filter((event) => event !== eventTitle);
//       heartIcon.classList.remove("fa-solid");
//       heartIcon.classList.add("fa-regular");
//       heartIcon.style.color = "";
//     } else {
//       // Add to favorites
//       favorites.push(eventTitle);
//       heartIcon.classList.remove("fa-regular");
//       heartIcon.classList.add("fa-solid");
//       heartIcon.style.color = "red";
//     }
  
//     // Update the localStorage with the new list of favorites
//     localStorage.setItem("favorites", JSON.stringify(favorites));
//     console.log("Favorites:", favorites);
//     // Reapply the favorite state on both pages (useful if toggling happens on explore page)
//     applyFavoriteState(favorites);
//   }

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
        // await loadFavorites(); // Load all posts initially
    }
}

async function applyFavoriteStates() {
    console.log("Applying favorite states...");
    try {
        const user = await fetchuserData();
        if (!user) return error("User not found");

        // Get user's favorites
        const { data: favorites, error } = await _supabase
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
            .eq('user_id', user.id);

        if (error) throw error;

        // console.log("Favorites:", favorites);

        // Create array of favorited event IDs
        const favoriteIds = favorites.map(fav => fav.event_id);

        const favoriteTitles = favorites.map(fav => fav.events.title);

        // console.log("Favorite IDs:", favoriteTitles);

        // Update heart icons
        document.querySelectorAll('.heart-btn').forEach(btn => {
            const eventId = btn.dataset.eventId;
            const heartIcon = btn.querySelector('i');
            
            if (favoriteIds.includes(eventId)) {
                heartIcon.classList.remove('fa-regular');
                heartIcon.classList.add('fa-solid');
                heartIcon.style.color = 'red';
            } else {
                heartIcon.classList.remove('fa-solid');
                heartIcon.classList.add('fa-regular');
                heartIcon.style.color = '';
            }
        });
    } catch (error) {
        console.error('Error applying favorites:', error);
    }
}


async function toggleHeart(button) {
    let heartIcon = button.querySelector("i");
    let eventId = button.getAttribute("data-event-id");
    let user = await fetchuserData();

    if (!user) {
        console.log("User not logged in.");
        return;
    } else {
        console.log("User logged in:", user.id);
    }

    // Check if the event is already favorited
    let { data: existingFavs, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", eventId);

    if (error) {
        console.error("Error checking favorites:", error);
        return;
    }

    if (existingFavs.length > 0) {
        // Remove from favorites
        let { error: deleteError } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("event_id", eventId);

        if (deleteError) {
            console.error("Error removing favorite:", deleteError);
            return;
        }

        heartIcon.classList.remove("fa-solid");
        heartIcon.classList.add("fa-regular");
        heartIcon.style.color = "";
    } else {
        // Add to favorites
        let { error: insertError } = await supabase
            .from("favorites")
            .insert([{ user_id: user.id, event_id: eventId }]);

        if (insertError) {
            console.error("Error adding favorite:", insertError);
            return;
        }

        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid");
        heartIcon.style.color = "red";
    }

    // Refresh favorites state
    fetchFavoritesData();
}
