// Check if the user is returning from signup
// const returningUser = sessionStorage.getItem("returningUser");

// Wait for the page to fully load before transitioning
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  if (!eventId) {
    window.location.href = '../main/explore.html';
    return;
  }

  document.querySelector(".back-btn").addEventListener("click", () => {
    handleToEventOVRedirect(eventId);
  });

  document.querySelector(".cancel-btn").addEventListener("click", function () {
    handleToEventOVRedirect(eventId); // Redirect back to the profile page
  });

  // try {
  //     let event = await fetchOneEventData(eventId);
  //     if (event){
  //       // populateEventData(event);
        
  //     }
  // } catch (error) {
  //     console.error('Error fetching event:', error);
  //     // Redirect or show error message
  // }

  document.querySelector('#form').addEventListener('submit', (e) => handleChangeEvent(e, eventId));
});

// Handle "Back to Login" button click on signup.html

function handleToEventOVRedirect(eventId) {
  window.location.href = `./eventOV.html?id=${eventId}`;
};

// Handle "Profile" button on explore.html
document.addEventListener("DOMContentLoaded", function () {

    const fileInput = document.querySelector('.custom-file-input');
  const fileNameDisplay = document.querySelector('.file-name-display');
  
  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        fileNameDisplay.textContent = this.files[0].name;
        console.log('File name:', this.files[0]);
      } else {
        fileNameDisplay.textContent = 'No file chosen';
      }
    });
  }
  
});

// edit profile
async function handleChangeEvent(event, eventId) {
  event.preventDefault();
//   console.log("sign up", event);

//   // Get form values
    const title = document.getElementById('event-title').value;

    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;

    // Get timezone offset (e.g., "-04:00" for EDT)
    const timezoneOffset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(timezoneOffset / 60)).toString().padStart(2, '0');
    const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
    const tz = `${timezoneOffset <= 0 ? '+' : '-'}${offsetHours}:${offsetMinutes}`;

    // Create ISO 8601 string with timezone
    const datetime = `${date}T${time}:00${tz}`;

    const category = document.getElementById('event-category').value;
    const location = document.getElementById('event-location').value;
    const description = document.getElementById('event-description').value;
    const eventPicInput = document.getElementById('event-pic');
    const access = document.getElementById('event-access').value;

    // console.log(title, datetime, category, location, description, eventPicInput.value);

//   let loggedInUser = await checkUser();
//   let loggedInUserId = loggedInUser.user.id;

    let fetchedEvent = await fetchOneEventData(eventId);

    let updatedEvent = await handleUpdateEventInfo(fetchedEvent, title, datetime, category, location, description, access);
    console.log("update event", updatedEvent.id);
//   // Upload profile picture if a file was selected
    if (location) {
      await updateEventLocation(updatedEvent.id, location)
    }
    let eventPicUrl = null;
    if (eventPicInput.files && eventPicInput.files.length > 0) {
        eventPicUrl = await handleUploadEventPicture(eventPicInput.files[0], updatedEvent.id);

        console.log("pfp url ", eventPicUrl);
        const success = await handleUpdateEventPicture(eventPicUrl, updatedEvent.id);
        if (success) {
          window.location.href = `./eventOV.html?id=${updatedEvent.id}`;
        }
    }
    // eventPicUrl = await handleUpdateEventPicture(profilePicInput.files[0], createdEvent.id);

//   await handleUpdateEventPicture();
}


async function handleUpdateEventInfo(fetchedEvent, title, datetime, category, location, description, access) {
  // console.log(fullname, username, location, bio); 

  console.log('Fetching data...');

  try {
    let updateData = {};
    
    if (title) updateData.title = title;
    if (datetime) updateData.datetime = datetime;
    if (category) updateData.category = category;
    if (location) updateData.location = location;
    if (description) updateData.description = description;
    if (access) updateData.event_access = access;

    // console.log('Update Data:', Object.keys(updateData));
    // console.log('Update Data:', Object.keys(updateData).length);
    
    // Only proceed with the update if there's at least one field to update
    if (Object.keys(updateData).length > 0) {

      // 2. If auth successful, create a profile in your custom profiles table
      const { data, error } = await _supabase
        .from('events')
        .update(updateData)
        .eq('id', fetchedEvent.id)
        .select();
        if (error) {
            console.error('Error creating event:', error);
        } else {
        // console.log('Ticket submitted successfully:', data[0]);
        // Redirect or show success message
        console.log('Event created successfully!');
            return data[0];
        }
    }
  } catch (error) {
    console.error(' error:', error);
    alert(`create event failed: ${error.message}`);
  }
}

async function handleUploadEventPicture(file, eventId) {
  // console.log(fullname, username, location, bio); 

  console.log('uploading picture...');

  try {
    // Create a unique file name using the user ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;
    const filePath = `event-images/${fileName}`;
    
    console.log('Uploading event image...');
    
    // Upload the file to your Supabase bucket
    const { data, error } = await _supabase
      .storage
      .from('postup-event-images') // Replace with your actual bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite any existing file with the same name
      });
      
    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = _supabase
      .storage
      .from('postup-event-images') // Replace with your actual bucket name
      .getPublicUrl(filePath);
    
    console.log('Event picture uploaded successfully!');
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Event picture upload failed: ${error.message}`);
    return null;
  }
}

async function handleUpdateEventPicture(eventPicUrl, eventId) {
  // console.log(fullname, username, location, bio); 

  console.log('uploading picture...');
  

  try {
    // Create a unique file name using the user ID and timestamp
    let updateData = {};

    if (eventPicUrl) updateData.image_url = eventPicUrl;
    // console.log('Uploading profile picture...');
    
    // Upload the file to your Supabase bucket
    const { data, error } = await _supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId); 
      
    if (error) {
        console.error('Error writing event picture url:', error);
    } else {
    // Redirect or show success message
        console.log('Event picture updated successfully!');
        return true;
    }
  } catch (error) {
    console.error('url replacement error:', error);
    alert(`picture url replacement failed: ${error.message}`);
    return null;
  }
}

async function updateEventLocation(eventId, location) {
  // 1. Geocode the address using Google API
  console.log('Updating location for event:', eventId);
  console.log('Location:', location);
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyDradz2mjYgwEDQP2TJ195DIcaSj3KTcxk`;
  const response = await fetch(geocodeUrl);
  const data = await response.json();
  
  if (data.status !== "OK") {
    throw new Error("Geocoding failed", data.status);
  }
  
  const geolocation = data.results[0].geometry.location;
  const { lat, lng } = geolocation;
  
  // 2. Update the user profile with both formats
  const { data: updateData, error } = await supabase
    .from('events')
    .update({
      latitude: lat,
      longitude: lng,
      geolocation: `POINT(${lng} ${lat})` // This gets converted to the binary format
    })
    .eq('id', eventId);
    
  if (error) throw error;
  return updateData;
}