// favorites.js
let allUserFavorites = [];
let allUserTickets = [];
let allUserAttendingEvents = [];

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

const fetchFavoritesData = async (thisUser) => {
    // let thisUser = await fetchuserData();

    const {data, error} = await supabase
        .from('favorites')
        .select(`
            *,
            events (
                id,
                title,
                location,
                image_url,
                datetime,
                category,
                event_access
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
        await loadFavorites(allUserFavorites); // Load all posts initially
    }
}

async function loadFavorites(allUserFavorites) {
    const favoritesContainer = document.getElementById('favorites-container');
    let favorites = allUserFavorites.map( (element) => element.events );
    // console.log("whet are favorites ", favorites);
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
                  <a href="../events/eventOV.html?id=${favorites.id}" class="event-link">
                    <div class="event-box-header">
                      <p class="event-time"><i class="fa-regular fa-calendar-days"></i>${new Date(favorites.datetime).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</p> 
                    </div>
                    <figure class="favorite-event-image">
                        ${ favorites.image_url ? `<img src="${favorites.image_url}" 
                        alt="${favorites.title}" 
                        class="event-image"
                        />`: ''}
                    </figure>
                    <div class="favorite-event-content">
                      <div class="favorite-event-details">
                        <h3>${favorites.title}</h3>
                        <p><i class="fa-solid fa-location-dot"></i>${favorites.location}</p>
                        <ul class="favorite-event-tags">
                          <li>
                            <small class="event-category"><i class="fa-solid fa-icons"></i>${favorites.category}</small>
                          </li>
                          <li>
                            <small class="event-category"><i class="fa-solid fa-ticket"></i>${favorites.event_access}</small>
                          </li> 
                        </ul>
                      </div>
                    </div>
                  </a>
                  <div class="post-actions">
                    <button class="save-btn">
                      <i class="far fa-bookmark fa-solid" title="Save" style="color:red"></i>
                    </button>
                    <button class="share-btn">
                      <i class="fas fa-share" title="Share"></i>
                    </button>
                  </div>
                </div>
            `;

            // Insert HTML for each post
            favoritesContainer.insertAdjacentHTML('beforeend', html_to_insert);
        });
    }
}

// Add this function to handle ticket fetching
const fetchTicketsData = async (thisUser) => {
  // let thisUser = await fetchuserData();

  const { data, error } = await supabase
      .from('tickets')
      .select(`
          *,
          events (
              id,
              title,
              location,
              datetime,
              image_url
          )
      `)
      .eq('user_id', thisUser.id);

  if (error) {
      console.error('Error fetching tickets:', error);
      return;
  }

  if (data) {
    allUserTickets = data;
    await loadTickets(allUserTickets);
  }
};

// Add this function to handle ticket display
async function loadTickets(tickets) {
  const ticketsContainer = document.getElementById('tickets-container');
  ticketsContainer.innerHTML = '';

  if (!tickets || tickets.length === 0) {
      ticketsContainer.innerHTML = '<p class="empty-message">NO TICKETS PURCHASED YET.</p>';
      return;
  }

  tickets.forEach(ticket => {
      const event = ticket.events;
      const html = `
          <div class="ticket-card">
              <div class="ticket-header">
              
                  <span class="event-date">${new Date(event.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                <p class="event-title">${event.title}</p>
              </div>
              <div class="ticket-body">
                  
                  <h3 class="ticket-holder-name">${ticket.ticket_holder_name}</h3>
                  <div class="ticket-details">
                      <span class="ticket-type">${ticket.admission}</span>
                      <span class="ticket-price">$${ticket.price.toFixed(2)}</span>
                      <span class="ticket-quantity">${ticket.quantity}</span>
                  </div>
                  <span class="event-venue">${event.location}</span>
                  <div class="ticket-barcode">
                      <i class="fas fa-barcode"></i>
                      <span>${ticket.barcode_number}</span>
                  </div>
              </div>
              <div class="ticket-notch"></div>
          </div>
      `;
      ticketsContainer.insertAdjacentHTML('beforeend', html);
  });
}

// Add this function to handle ticket fetching
const fetchAttendingEventData = async (thisUser) => {
  // let thisUser = await fetchuserData();

  const { data, error } = await supabase
      .from('attended_events')
      .select(`
          *,
          events (
              id,
              title,
              location,
              datetime,
              image_url,
              category,
              event_access
          )
      `)
      .eq('user_id', thisUser.id);

  if (error) {
      console.error('Error fetching events:', error);
      return;
  }

  if (data) {
    console.log('events data:', data);
    allUserAttendingEvents = data;
    await loadAttendingEvents(allUserAttendingEvents);
  }
};

// Add this function to handle ticket display
async function loadAttendingEvents(attendingEvents) {
  const container = document.getElementById('attending-container');
  container.innerHTML = '';

  if (!attendingEvents || attendingEvents.length === 0) { // Fixed variable name
    container.innerHTML = '<p class="empty-message">NO UPCOMING EVENTS.</p>';
    return;
  }

  console.log(attendingEvents)

  attendingEvents.forEach(attendingEvent => { // Fixed parameter name
    const event = attendingEvent.events;
    const html = `
      <div class="event-card">
        <a href="../events/eventOV.html?id=${event.id}" class="event-link">
          <div class="event-box-header">
            <p class="event-time"><i class="fa-regular fa-calendar-days"></i>${new Date(event.datetime).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</p> 
          </div>
          ${attendingEvent.status ? `<div class="status-badge"><p>${attendingEvent.status}</p></div>` : ''}
          <figure class="attending-event-image">
            ${ event.image_url ? `<img src="${event.image_url}" 
            alt="${event.title}"
            class="event-image"
            />`: ''}
          </figure>
          <div class="attending-event-content">
            <div class="attending-event-details">
              <h3>${event.title}</h3>
              <p><i class="fa-solid fa-location-dot"></i>${event.location}</p>
              <ul class="attending-event-tags">
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
          <button class="save-btn">
            <i class="far fa-bookmark" title="Save"></i>
          </button>
          <button class="share-btn">
            <i class="fas fa-share" title="Share"></i>
          </button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        console.error('Could not connect to Supabase. Please check your console for more details.');
        return;
    }
    
    // Add event listeners for login and signup
    // const User = checkUser()
    
    // fetchFavoritesData();
    // fetchTicketsData();

    (async () => {
      try {
        const thisUser = await fetchuserData();
        fetchFavoritesData(thisUser); // Pass user to favorites
        fetchTicketsData(thisUser);    // Pass user to tickets
        fetchAttendingEventData(thisUser); // Pass user to attending events
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    })();
});

document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.tab-button');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active classes
      document.querySelectorAll('.tab-button, .tab-content').forEach(el => {
        el.classList.remove('active-tab', 'active');
      });
      
      // Add active classes
      tab.classList.add('active-tab');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
});


