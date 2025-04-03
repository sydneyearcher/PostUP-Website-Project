function populateEventData(event, user) {

  document.getElementById('event-title').textContent = event.title;

  console.log(typeof(event.datetime)); //string
  document.getElementById('event-date').textContent = 
    new Date(event.datetime).toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  document.getElementById('event-location').textContent = event.location;
  document.querySelector('.ticket-image').src = event.image_url;
  
  document.getElementById('username').textContent = user.display_name;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Get event ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  try {
    let event = await fetchOneEventData(eventId);
    let loggedInUser = await checkUser();
    let user = loggedInUser.user.user_metadata;
    
    if (event){
      populateEventData(event, user);
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    // Redirect or show error message
  }
});