// Check if the user is returning from signup
// const returningUser = sessionStorage.getItem("returningUser");

// Wait for the page to fully load before transitioning

// Handle "Back to Login" button click on signup.html
const backToProfileButton = document.querySelector(".back-btn");
if (backToProfileButton) {
  backToProfileButton.addEventListener("click", () => {
    window.location.href = "../main/profile.html";
  });
}

// Handle "Profile" button on explore.html
document.addEventListener("DOMContentLoaded", function () {
    const now = new Date();

    // Format date as yyyy-mm-dd
    const date = now.toISOString().split('T')[0];
    document.getElementById('event-date').value = date;

    // Format time as hh:mm
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('event-time').value = `${hours}:${minutes}`;

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
    
  document.querySelector('#form').addEventListener('submit', handleEvent);
});

// edit profile
async function handleEvent(event) {
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

    // console.log(title, datetime, category, location, description, eventPicInput.value);

//   let loggedInUser = await checkUser();
//   let loggedInUserId = loggedInUser.user.id;

    let createdEvent = await handleCreateEvent(title, datetime, category, location, description);
    console.log("created event", createdEvent.id);
//   // Upload profile picture if a file was selected
    let eventPicUrl = null;
    if (eventPicInput.files && eventPicInput.files.length > 0) {
        eventPicUrl = await handleUploadEventPicture(eventPicInput.files[0], createdEvent.id);

        console.log("pfp url ", eventPicUrl);
        const success = await handleUpdateEventPicture(eventPicUrl, createdEvent.id);
        if (success) {
            window.location.href = "../main/profile.html";
        }
    }
    // eventPicUrl = await handleUpdateEventPicture(profilePicInput.files[0], createdEvent.id);

//   await handleUpdateEventPicture();
}


async function handleCreateEvent(title, datetime, category, location, description) {
  // console.log(fullname, username, location, bio); 

  console.log('Fetching data...');

  try {
    let updateData = {};
    
    if (title) updateData.title = title;
    if (datetime) updateData.datetime = datetime;
    if (category) updateData.category = category;
    if (location) updateData.location = location;
    if (description) updateData.description = description;

    // console.log('Update Data:', Object.keys(updateData));
    // console.log('Update Data:', Object.keys(updateData).length);
    
    // Only proceed with the update if there's at least one field to update
    if (Object.keys(updateData).length > 0) {

      // 2. If auth successful, create a profile in your custom profiles table
      const { data, error } = await _supabase
        .from('events')
        .insert(updateData)
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