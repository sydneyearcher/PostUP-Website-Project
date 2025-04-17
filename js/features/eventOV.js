document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        window.location.href = '../main/explore.html';
        return;
    }

    try {
        let event = await fetchOneEventData(eventId);
        if (event){
            populateEventData(event);
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        // Redirect or show error message
    }
});



function populateEventData(event) {
    document.getElementById('event-title').textContent = event.title;

    document.getElementById('event-date').textContent = 
        new Date(event.datetime).toLocaleDateString('en-US', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    document.getElementById('event-category').textContent = event.category;
    document.getElementById('event-location').textContent = event.location;

    document.getElementById('event-image').src = event.image_url; 
    
    // Update other elements similarly
    document.querySelector('.buy-tickets-btn').addEventListener('click', () => {
        window.location.href = `../tickets/ticket.html?id=${event.id}`;
    });

    document.querySelector('.edit-btn').addEventListener('click', () => {
        window.location.href = `./editevent.html?id=${event.id}`;
    });

    document.getElementById('event-description').textContent = event.description;

    document.getElementById('address').textContent = event.location;

    const eventtime = new Date(event.datetime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    document.getElementById('event-time').textContent = `Doors open at ${eventtime}`;

    // Get the address from your dynamic source
    const address = document.getElementById('address').textContent.trim();

    // URL encode the address
    const encodedAddress = encodeURIComponent(address);

    // Construct the Google Maps URL
    const apiKey = 'AIzaSyCBYsHzYCmxpnhAD18w1N7I3R4LixY__-Q';
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`;

    // Update the iframe
    document.getElementById('dynamicMap').src = mapUrl;
}

