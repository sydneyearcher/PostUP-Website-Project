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
}