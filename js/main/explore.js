// explore.js - explore page logic

// Get the supabase instance that was initialized in supabase.js
// const _supabase = window.supabaseInstance;

// Declare allPosts in a higher scope accessible to search functions
let allEvents = [];
let userLat, userLon;
let currentUser;

// Store event distances in miles
let eventsWithDistances = [];

function metersToMiles(meters) {
  // console.log("Converting meters to miles:", meters);
  // console.log(meters / 1609.34);
  const convertedToMiles = meters / 1609.34;
  return convertedToMiles; // 1 mile = 1609.34 meters
}

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        document.body.innerHTML = '<h1>Error: Could not connect to Supabase</h1><p>Please check your console for more details.</p>';
        return;
    }
    try {
      currentUser = await fetchuserData();
      if (currentUser) {
        let coords = await convertuserCoords(currentUser);
        // console.log(coords);
        // userLat = currentUser.latitude;
        // userLon = currentUser.longitude;
        userLat = coords.latitude;
        userLon = coords.longitude;
        fetcheventData();
        document.querySelector(".location-text").textContent = ` ${currentUser.location}`;
        await applyFavoriteStates();
        let distanceTo = await getDistanceToEvents(coords);
        // console.log(distanceTo);
        distanceTo.forEach(event => {
          eventsWithDistances.push({
            id: event.id,
            distance: metersToMiles(event.distance_meters)
          });
        });

        // console.log(eventsWithDistances);
      }
      } catch (error) {
        console.error('Error fetching user:', error);
      }

    // Add event listeners for search functionality
    document.querySelector('.search-btn').addEventListener('click', handleSearch);
    document.querySelector('.search-bar').addEventListener('keypress', (event) => {
        // if not 'enter key' just exit here
        if (event.keyCode !== 13) return
        // search if enter key pressed
        handleSearch()
      })

     // Event listeners for distance dropdowns (both mobile and desktop)
    const distanceSelects = [
      document.getElementById('distance'),
      ...document.querySelectorAll('input[name="distance"]')
    ];

  distanceSelects.forEach(select => {
    if (select.type === 'radio') {
      select.addEventListener('change', function() {
        if (this.checked) {
          selectedDistance = this.value;
          // console.log('Selected distance:', selectedDistance);
          applyFilters();
        }
      });
    } else if (select.tagName === 'SELECT') {
      select.addEventListener('change', function() {
        selectedDistance = this.value || null;
        // console.log('Selected distance:', selectedDistance);
        applyFilters();
      });
    }
  });
});


// Set up event listeners for all filter types
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners for category buttons (your existing code)
  
  // Event listeners for date filters
  const dateSelects = [
      document.getElementById('date'),
      ...document.querySelectorAll('input[name="date"]')
  ];
  
  dateSelects.forEach(select => {
      if (select.type === 'radio') {
          select.addEventListener('change', function() {
              if (this.checked) {
                  selectedDate = this.value;
                  applyFilters();
              }
          });
      } else if (select.tagName === 'SELECT') {
          select.addEventListener('change', function() {
              selectedDate = this.value || null;
              applyFilters();
          });
      }
  });
  
  // Event listeners for admission filters
  const admissionSelects = [
      document.getElementById('admission'),
      ...document.querySelectorAll('input[name="admission"]')
  ];
  
  admissionSelects.forEach(select => {
      if (select.type === 'radio') {
          select.addEventListener('change', function() {
              if (this.checked) {
                  selectedAdmission = this.value;
                  applyFilters();
              }
          });
      } else if (select.tagName === 'SELECT') {
          select.addEventListener('change', function() {
              selectedAdmission = this.value || null;
              applyFilters();
          });
      }
  });
  
  // Add event listener for the Apply Filters button on mobile
  const applyFiltersBtn = document.querySelector('.apply-filters');
  if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', function() {
          applyFilters();
          // If you have a function to close the mobile filter panel
          // closeMobileFilterPanel();
      });
  }
});

const convertuserCoords = async (currentUser) => {

// Convert the user's geolocation WKB to coordinates
const { data, error } = await supabase.rpc('get_user_coords', {
  geo: currentUser.geolocation // Pass the WKB string (e.g., '0101000020E6100000...')
});
if (data) {
  // console.log('Latitude:', data[0].latitude);
  // console.log('Longitude:', data[0].longitude);
  const coords=data[0];
  return coords;
}
  if (error) {
  console.error('Error fetching user coords:', error);
}
}

const getDistanceToEvents = async (coords) => {
  console.log("getting nearby events soorted by coords");
   const { data, error } = await supabase.rpc('get_nearby_events', { 
      lat: coords.latitude,  // Parameter names must match the function definition
      lon: coords.longitude  // "lat" and "lon" (not "latitude"/"longitude")
    });
    if (data) {
      return data;
    }
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
}

const fetcheventData = async () => {
    console.log('Fetching events data...');

    try {
        const cachedData = await getCachedEvents();
        if (cachedData) {
          console.log('Using cached events');
          allEvents = cachedData;
          loadEvents(allEvents);
          // await applyFavoriteStates();
        }
      } catch (error) {
        console.log('Cache read error:', error);
      }
    
      // Always fetch fresh data (stale-while-revalidate pattern)
      try {
        console.log('Fetching fresh events...');
        const { data, error } = await supabase
          .from('events')
          .select(`
            *
          `)
          .order('datetime', { ascending: true });
    
        if (data) {
          console.log('Fresh data received');
          allEvents = data;
          loadEvents(allEvents);
          
          // Update cache in background
          await cacheEvents(data);
        }
      } catch (error) {
        console.log('Fetch error:', error);
      }
}



let selectedCategory = null; // Track selected category

function handleCategoryClick(category) {
  // Toggle category if clicked again
  console.log('Category clicked:', category);
  selectedCategory = selectedCategory === category ? null : category;
  console.log('Selected Category:', selectedCategory);
  applyFilters();
}

function applyFilters() {
  const searchTerm = document.querySelector('.search-bar').value.trim().toLowerCase();
  
  // Apply category filter first
  let filteredEvents = selectedCategory 
    ? allEvents.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase())
    : allEvents;

  console.log('Filtered Events:', filteredEvents);
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
    const item = this.querySelector('.filter-item');
    const category = this.querySelector('span').textContent.trim();
    // Remove active class from all items
    // document.querySelectorAll('.filter-item').forEach(filterItem => {
    //   filterItem.classList.remove('active-filter-item');
    // });

    // Check if the item is already active
    item.classList.toggle('active-filter-item');
    
    const isActive = item.classList.contains('active-filter-item');


    // Re-add the class only if it wasn't active before
    if (!isActive) {
      // item.classList.add('active-filter-item');
      selectedCategory = category;
    } else {
      selectedCategory = null;
    }

    handleCategoryClick(category);
  });
});


// Update existing search handler to use applyFilters
function handleSearch() {
  applyFilters();
}

// IndexedDB setup
const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('eventsDB', 1);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
      };
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  // Cache events data
  const cacheEvents = async (events) => {
    try {
      const db = await openDB();
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      
      // Clear old entries
      store.clear();
      
      // Add new entries with timestamp
      events.forEach(event => {
        store.put({ ...event, cachedAt: Date.now() });
      });
  
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };
  
  // Get cached events
  const getCachedEvents = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          // Validate cache freshness (1 hour max age)
          if (result.length > 0 && Date.now() - result[0].cachedAt < 3600000) {
            resolve(result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  };

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
            <div class="event-box" data-longitude="${event.longitude}" data-latitude="${event.latitude}" data-geolocation="${event.geolocation}">
              <a href="../events/eventOV.html?id=${event.id}" class="event-link">
                <div class="event-box-header">
                  <p class="event-time"><i class="fa-regular fa-calendar-days"></i>${new Date(event.datetime).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</p> 
                </div>
                <figure class="event-image">
                  <img src="${event.image_url}" alt="${event.title}">
                </figure>
                
                <div class="event-content">
                  <div class="event-details">
                    <h3 class="event-title">${event.title}</h3>
                    <p><i class="fa-solid fa-location-dot"></i>${event.location}</p>
                    <ul class="event-tags">
                      <li>
                        <small class="event-category"><i class="fa-solid fa-icons"></i>${event.category}</small>
                      </li>
                      <li>
                        <small class="event-category"><i class="fa-solid fa-ticket"></i>${event.event_access}</small>
                      </li> 
                    </ul>
                  </div>
                </div>
              </a>
              <div class="post-actions">
                <button class="save-btn" onclick="toggleHeart(this)" data-event-id="${event.id}">
                  <i class="far fa-bookmark" title="Save"></i>
                </button>
                <button class="share-btn" data-event-id="${event.id}">
                  <i class="fas fa-share" title="Share"></i>
                </button>
              </div>
            </div>`;

            // Insert HTML for each post
            eventsContainer.insertAdjacentHTML('beforeend', html_to_insert);
        });
    }
}


async function fetchuserData () {
  let loggedInUser = await checkUser();
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

const fetchFavoritesData = async () => {
    // let thisUser = await fetchuserData();

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
        .eq('user_id', currentUser.id)

      if(error){
        console.log('Could not fetch the data')
        console.log(error)
      }
      if(data){
        console.log('Data fetched successfully')
        // console.log(JSON.stringify(data))
        allUserFavorites = data; // Store fetched posts globally
        // console.log("favorites", allUserFavorites)
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
    document.querySelectorAll('.save-btn').forEach(btn => {
      const eventId = btn.dataset.eventId;
      const saveIcon = btn.querySelector('i');
      
      if (favoriteIds.includes(eventId)) {
        saveIcon.classList.remove('fa-regular');
        saveIcon.classList.add('fa-solid');
        saveIcon.style.color = 'red';
      } else {
        saveIcon.classList.remove('fa-solid');
        saveIcon.classList.add('fa-regular');
        saveIcon.style.color = '';
      }
    });
  } catch (error) {
    console.error('Error applying favorites:', error);
  }
}


async function toggleHeart(button) {
  let saveIcon = button.querySelector("i");
  let eventId = button.getAttribute("data-event-id");
  // let user = await fetchuserData();

  if (!currentUser) {
    console.log("User not logged in.");
    return;
  } else {
    console.log("User logged in:", currentUser.id);
  }

  // Check if the event is already favorited
  let { data: existingFavs, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", currentUser.id)
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
      .eq("user_id", currentUser.id)
      .eq("event_id", eventId);

    if (deleteError) {
      console.error("Error removing favorite:", deleteError);
      return;
    }

    saveIcon.classList.remove("fa-solid");
    saveIcon.classList.add("fa-regular");
    saveIcon.style.color = "";
  } else {
    // Add to favorites
    let { error: insertError } = await supabase
      .from("favorites")
      .insert([{ user_id: currentUser.id, event_id: eventId }]);

    if (insertError) {
      console.error("Error adding favorite:", insertError);
      return;
    }

    saveIcon.classList.remove("fa-regular");
    saveIcon.classList.add("fa-solid");
    saveIcon.style.color = "red";
  }

  // Refresh favorites state
  fetchFavoritesData();
}

// Simple toggle for mobile filter panel
document.querySelector('.filter-button').addEventListener('click', function() {
  document.querySelector('.mobile-filter-panel').style.display = 'flex';
});

document.querySelector('.close-filter').addEventListener('click', function() {
  document.querySelector('.mobile-filter-panel').style.display = 'none';
});

document.querySelector('.apply-filters').addEventListener('click', function() {
  document.querySelector('.mobile-filter-panel').style.display = 'none';
  // Filter logic would go here
});

// Track all filter selections
// let selectedCategory = null;
let selectedDistance = null;
let selectedDate = null;
let selectedAdmission = null;

function applyFilters() {
    const searchTerm = document.querySelector('.search-bar').value.trim().toLowerCase();
    
    // Start with all events
    let filteredEvents = allEvents;
    
    // Apply category filter if selected
    if (selectedCategory) {
        filteredEvents = filteredEvents.filter(event => 
          event.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        console.log("Filtered by category:", filteredEvents);
    }
    
    // Apply distance filter if selected
    // if (selectedDistance) {
    //   filteredEvents = filteredEvents.filter(event => {
    //     // Implement distance filtering logic
    //     // This depends on how you store location/distance data
    //     // Example placeholder:
    //     console.log("Filtering by distance:", selectedDistance);
    //     return filterByDistance(event, selectedDistance);
    //   });
    // }
    if (selectedDistance) {
      filteredEvents = filteredEvents.filter(event => {
        // Pass the event ID instead of the entire event object
        console.log("Filtering by distance:", selectedDistance);
        return filterByDistance(event.id, selectedDistance); // <-- Fix here
      });
    }

    // Apply date filter if selected
    if (selectedDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.datetime);
        const today = new Date();
        
        switch(selectedDate) {
          case 'today':
            return isSameDay(eventDate, today);
          case 'tomorrow':
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            return isSameDay(eventDate, tomorrow);
          case 'thisweek':
            return isInCurrentWeek(eventDate);
          case 'thismonth':
            return eventDate.getMonth() === today.getMonth() && 
                    eventDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }
    
    // Apply admission filter if selected
    if (selectedAdmission) {
        filteredEvents = filteredEvents.filter(event => 
            event.event_access.toLowerCase() === selectedAdmission.toLowerCase()
        );
    }
    
    // Apply search term filter
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
            event.title.toLowerCase().includes(searchTerm)
        );
    }
    
    loadEvents(filteredEvents);
    // IIFE to handle async operation
   (async () => {
    await applyFavoriteStates();
  })();
}

// Helper functions for date filtering
function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear();
}

function isInCurrentWeek(date) {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    const day = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Adjust to get first day of week (Sunday)
    firstDayOfWeek.setDate(today.getDate() - day);
    
    // Last day of week (Saturday)
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

// Simplified filter function
function filterByDistance(eventId, distanceFilter) {
  // const eventDistance = eventsWithDistances.find(e => e.id)?.distance;
  
  // For debugging 
  // console.log(eventId);
  // console.log(distanceFilter);
  // console.log(eventsWithDistances);
  // // eventsWithDistances.forEach(e => console.log(`Event ID: ${e.id}, distance: ${e.distance}`));
  // console.log(`Event ID ${eventId} has distance: ${eventDistance}`);
  
  // // Exclude events with unknown distance
  // if (typeof eventDistance === 'undefined') return false;

  // Skip filtering if no distance filter is provided
  if (!distanceFilter) return eventsWithDistances.map(e => e.id);
  
 
  // Find this specific event in the eventsWithDistances array
  const eventWithDistance = eventsWithDistances.find(e => e.id === eventId);
  
  // If we can't find distance info for this event, filter it out
  if (!eventWithDistance) return false;
  
  // Get the distance value
  const distance = eventWithDistance.distance;
  
  // If no distance filter, include all events
  if (!distanceFilter) return true;
  
  // Parse the numeric value from the filter (e.g., "5miles" -> 5)
  const maxDistance = parseInt(distanceFilter.replace('miles', ''));
  
  // Return true if event is within the selected distance
  switch(distanceFilter) {
    case '5miles': return distance <= 5;
    case '10miles': return distance <= 10;
    case '25miles': return distance <= 25;
    case '50miles': return distance <= 50;
    default: return true;
  }
}
