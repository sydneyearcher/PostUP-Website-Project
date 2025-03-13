// Check if the user is returning from signup
const returningUser = sessionStorage.getItem("returningUser");

// Wait for the page to fully load before transitioning
window.addEventListener("load", () => {
  if (!returningUser) {
    // Set a delay for the loading screen
    setTimeout(() => {
      // Fade out the loading screen
      document.getElementById("loadingScreen").style.opacity = "0";

      // After the loading screen fades out, show the main content with transition
      setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none"; // Hide the loading screen
        document.getElementById("mainContentSection").style.opacity = "1"; // Show the main content
      }, 1000); // Wait 1 second for the opacity transition
    }, 3000); // Keep the loading screen for 3 seconds before transitioning
  } else {
    // Skip the loading screen and show the main content immediately
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("mainContentSection").style.opacity = "1";

    // Remove returningUser flag for next visit
    sessionStorage.removeItem("returningUser");
  }
});

// Handle "Back to Login" button click on signup.html
const backToLoginButton = document.getElementById("backToLogin");
if (backToLoginButton) {
  backToLoginButton.addEventListener("click", () => {
    sessionStorage.setItem("returningUser", "true");
  });
}



// Handle "Profile" button on explore.html
document.addEventListener("DOMContentLoaded", function () {
  const profileBtn = document.getElementById("profile-btn");

  if (profileBtn) {
    profileBtn.addEventListener("click", function () {
      window.location.href = "../profile.html";
    });
  }
  
  // EDITPROFILE CANCEL BUTTON
  // Handle "Cancel" button click on editprofile.html
  const cancelButton = document.querySelector(".cancel-btn");

  if (cancelButton) {
    cancelButton.addEventListener("click", function () {
      window.location.href = "../main/profile.html"; // Redirect back to the profile page
    });
  }
  
  document.querySelector('.edit-form').addEventListener('submit', handleChangeUserProfile);
});

document.addEventListener('DOMContentLoaded', function() {
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

// Toggle favorite function for heart button
function toggleHeart(button) {
  let heartIcon = button.querySelector("i");
  let eventBox = button.closest(".event-box");
  let eventTitle = eventBox.querySelector(".event-title").innerText;

  // Retrieve the list of favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.includes(eventTitle)) {
    // Remove from favorites
    favorites = favorites.filter((event) => event !== eventTitle);
    heartIcon.classList.remove("fa-solid");
    heartIcon.classList.add("fa-regular");
    heartIcon.style.color = "";
  } else {
    // Add to favorites
    favorites.push(eventTitle);
    heartIcon.classList.remove("fa-regular");
    heartIcon.classList.add("fa-solid");
    heartIcon.style.color = "red";
  }

  // Update the localStorage with the new list of favorites
  localStorage.setItem("favorites", JSON.stringify(favorites));
  console.log("Favorites:", favorites);
  // Reapply the favorite state on both pages (useful if toggling happens on explore page)
  applyFavoriteState(favorites);
}

// DISPLAY FAVORITED EVENTS IN EVENTS.HTML
function displayFavoritedEvents(favorites) {
  let container = document.getElementById("favorites-container");

  // Clear any existing content before adding new events
  container.innerHTML = "";

  if (favorites.length === 0) {
    container.innerHTML = "<p>No favorited events yet.</p>";
    return;
  }

  // Create event cards for each favorited event
  favorites.forEach((eventTitle) => {
    let eventCard = document.createElement("div");
    eventCard.classList.add("event-box");
    eventCard.innerHTML = `
      <p class="event-title">${eventTitle}</p>
      <button class="heart-btn" onclick="toggleHeart(this)">
        <i class="fa-solid fa-heart" style="color: red;"></i> <!-- Set the heart to be filled initially -->
      </button>
    `;
    container.appendChild(eventCard);
  });
}

// edit profile


async function handleChangeUserProfile(event) {
  event.preventDefault();
  console.log("sign up", event);

  // Get form values
  const fullname = document.getElementById('edituser-full-name').value;
  const username = document.getElementById('edituser-username').value;
  const profilePicInput = document.getElementById('profile-pic');
  const state = document.getElementById('edituser-state').value;
  const bio = document.getElementById('edituser-bio').value;
  const city = document.getElementById('edituser-city').value;
  const location = city && state ? `${city}, ${state}` : city || state || "";

  const email = document.getElementById('edituser-email').value;
  const phonenumber = document.getElementById('edituser-phone-number').value;
  const password = document.getElementById('edituser-password').value;

  console.log(fullname, username, profilePicInput, location, bio);

  let loggedInUser = await checkUser();
  let loggedInUserId = loggedInUser.user.id;

  // Upload profile picture if a file was selected
  let profilePicUrl = null;
  if (profilePicInput.files && profilePicInput.files.length > 0) {
    profilePicUrl = await handleUpdateUserProfilePicture(profilePicInput.files[0], loggedInUserId);
    // console.log("pfp url ", profilePicUrl);
  }

  // const profileStatsContainer = document.getElementById('profile-preference-stats');
  await handleUpdateUserProfileInfo(loggedInUser, fullname, username, location, bio, email, phonenumber, profilePicUrl);
  await handleUpdateUserInfo(username, email, phonenumber, password);
  await updateUserPreferencesData();
}


async function handleUpdateUserProfileInfo(loggedInUser, fullname, username, location, bio, email, phonenumber, profilePicUrl) {
  // console.log(fullname, username, location, bio); 

  console.log('Fetching data...');

  try {
    let updateData = {};
    
    if (fullname) updateData.full_name = fullname;
    if (username) updateData.username = username;
    if (bio) updateData.user_bio = bio;
    if (location) updateData.location = location;
    if (email) updateData.email = email;
    if (phonenumber) updateData.phone_number = phonenumber;
    if (profilePicUrl) updateData.avatar_url = profilePicUrl;
    
    // console.log('Update Data:', Object.keys(updateData));
    // console.log('Update Data:', Object.keys(updateData).length);
    
    // Only proceed with the update if there's at least one field to update
    if (Object.keys(updateData).length > 0) {

      // 2. If auth successful, create a profile in your custom profiles table
      const { error: profileError } = await _supabase
        .from('profiles')
        .update(updateData)
        .eq('id', loggedInUser.user.id);  // You'll need to get the actual user ID

          //   avatar_url: profileImageUrl || undefined  // Only update if a new image was uploaded
          // })
          // .eq('id', 'YOUR_USER_ID');  // You'll need to get the actual user ID

        if (profileError) throw profileError;
        console.log('User profile info updated successfully!');
      } else {
        console.log('No fields to update.');
      }
  } catch (error) {
    console.error(' error:', error);
    alert(`edit user info failed: ${error.message}`);
  }
}

async function handleUpdateUserProfilePicture(file, userId) {
  // console.log(fullname, username, location, bio); 

  console.log('uploading picture...');

  try {
    // Create a unique file name using the user ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;
    
    console.log('Uploading profile picture...');
    
    // Upload the file to your Supabase bucket
    const { data, error } = await _supabase
      .storage
      .from('postup-avatars') // Replace with your actual bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite any existing file with the same name
      });
      
    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = _supabase
      .storage
      .from('postup-avatars') // Replace with your actual bucket name
      .getPublicUrl(filePath);
    
    console.log('Profile picture uploaded successfully!');
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Profile picture upload failed: ${error.message}`);
    return null;
  }
}

async function handleUpdateUserInfo(username, email, phonenumber, password) {
  // console.log(fullname, username, location, bio); 
  
  console.log(username);

  try {
    let updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phonenumber) updateData.phone_number = phonenumber;
    if (password) updateData.password = password;

    // console.log('Update Data:', Object.keys(updateData));
    // console.log('Update Data:', Object.keys(updateData).length);
    
    // Only proceed with the update if there's at least one field to update
    if (Object.keys(updateData).length > 0) {
      // 2. If auth successful, create a profile in your custom profiles table
      const { data, error } = await _supabase.auth.updateUser({
        email: updateData.email,
        password: updateData.password,
        phone: updateData.phone_number,
        data: {
          display_name: updateData.username,
        }
      })

      console.log('User info updated successfully!');
      
      if (error) throw error;
    }

  } catch (error) {
      console.error(' error:', error);
      alert(`edit user info failed: ${error.message}`);
  }
}

// Initialize preferences from localStorage
let preferences = JSON.parse(localStorage.getItem("preferences")) || [];

// Apply selected state to buttons based on stored preferences
document.addEventListener('DOMContentLoaded', function() {
  // Mark buttons as selected if they're in preferences
  document.querySelectorAll('.preference-option').forEach(option => {
    if (preferences.includes(option.dataset.value)) {
      option.classList.add('selected');
    }
  });
  // insertStatsData(profileStatsContainer);
});

// Set up click handlers for all preference options
document.querySelectorAll('.preference-option').forEach(option => {
  option.addEventListener('click', function() {
    const selectedValue = option.dataset.value;
    
    // Toggle selection state
    option.classList.toggle('selected');
    
    if (option.classList.contains('selected')) {
      // Add to preferences if selected
      if (!preferences.includes(selectedValue)) {
        preferences.push(selectedValue);
      }
    } else {
      // Remove from preferences if deselected
      preferences = preferences.filter(value => value !== selectedValue);
    }
    
    // Save updated preferences to localStorage
    localStorage.setItem('preferences', JSON.stringify(preferences));
    console.log('Updated preferences:', preferences);
  });
});

async function loadUserPreferences() {
  try {
    // Get the currently logged in user
    let loggedInUser = await checkUser();
    if (!loggedInUser || !loggedInUser.user) {
      console.log("No logged in user found");
      return;
    }
    
    const userId = loggedInUser.user.id;
    
    // Fetch user preferences from database
    const { data, error } = await supabase
      .from('preferences')
      .select('events_category, music_category, food_category, cuisine_category, art_category, artstyle_category')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching preferences:', error);
      return;
    }
    
    if (!data) {
      console.log('No preferences found for this user');
      return;
    }
    
    console.log('Fetched user preferences:', data);
    
    // Reset all buttons to non-selected state
    document.querySelectorAll('.preference-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    // Map category names to their corresponding fieldset legend text
    const categoryMap = {
      'events_category': 'EVENTS',
      'music_category': 'MUSIC',
      'food_category': 'FOOD',
      'cuisine_category': 'CUISINE',
      'art_category': 'ART',
      'artstyle_category': 'ART STYLE'
    };
    
    // Highlight buttons based on user preferences
    Object.entries(data).forEach(([category, values]) => {
      // Skip if not a preference category or if values is empty/null
      if (!categoryMap[category] || !values || !Array.isArray(values) || values.length === 0) {
        return;
      }
      
      const categoryLegendText = categoryMap[category];
      
      // Find the correct fieldset
      const fieldset = Array.from(document.querySelectorAll('fieldset.preference-category'))
        .find(fs => fs.querySelector('legend').textContent.trim() === categoryLegendText);
      
      if (!fieldset) {
        console.log(`Could not find fieldset for ${categoryLegendText}`);
        return;
      }
      
      // For each value in the category, find and highlight the corresponding button
      values.forEach(value => {
        const button = fieldset.querySelector(`.preference-option[data-value="${value}"]`);
        if (button) {
          button.classList.add('selected');
        }
      });
    });
    
    console.log('User preferences loaded and displayed');
    
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

// Call this function when the page loads after login
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in before loading preferences
  checkUser().then(loggedInUser => {
    if (loggedInUser && loggedInUser.user) {
      loadUserPreferences();
    }
  });
});


async function updateUserPreferencesData() {
  // Get the currently logged in user
  let loggedInUser = await checkUser();
  if (!loggedInUser || !loggedInUser.user) {
    console.error("No logged in user found");
    return;
  }
  
  const userId = loggedInUser.user.id;
  
  // Get all selected preference options
  const selectedOptions = document.querySelectorAll('.preference-option.selected');
  
  // Create category-specific arrays
  const categorizedPreferences = {
    events_category: [],
    music_category: [],
    food_category: [],
    cuisine_category: [],
    art_category: [],
    artstyle_category: []
  };
  
  // Map each option to its appropriate category based on its parent fieldset
  selectedOptions.forEach(option => {
    const value = option.dataset.value;
    const category = option.closest('fieldset').querySelector('legend').textContent.trim();
    
    switch (category) {
      case 'EVENTS':
        categorizedPreferences.events_category.push(value);
        break;
      case 'MUSIC':
        categorizedPreferences.music_category.push(value);
        break;
      case 'FOOD':
        categorizedPreferences.food_category.push(value);
        break;
      case 'CUISINE':
        categorizedPreferences.cuisine_category.push(value);
        break;
      case 'ART':
        categorizedPreferences.art_category.push(value);
        break;
      case 'ART STYLE':
        categorizedPreferences.artstyle_category.push(value);
        break;
    }
  });
  
  console.log('Categorized preferences:', categorizedPreferences);
  
  try {
    // First check if the user already has preferences stored
    const { data, error } = await supabase
      .from('preferences')
      .select()
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching existing preferences:', error);
      return;
    }
    
    let result;
    
    if (data && data.length > 0) {
      // Update existing preferences
      result = await supabase
        .from('preferences')
        .update({
          events_category: categorizedPreferences.events_category,
          music_category: categorizedPreferences.music_category,
          food_category: categorizedPreferences.food_category,
          cuisine_category: categorizedPreferences.cuisine_category,
          art_category: categorizedPreferences.art_category,
          artstyle_category: categorizedPreferences.artstyle_category,
        })
        .eq('user_id', userId);
      
      console.log('Updated preferences for existing user');
    } else {
      // Insert new preferences
      result = await supabase
        .from('preferences')
        .insert([{
          user_id: userId,
          events_category: categorizedPreferences.events_category,
          music_category: categorizedPreferences.music_category,
          food_category: categorizedPreferences.food_category,
          cuisine_category: categorizedPreferences.cuisine_category,
          art_category: categorizedPreferences.art_category,
          artstyle_category: categorizedPreferences.artstyle_category
        }]);
      
      console.log('Created new preferences for user');
    }
    
    if (result.error) {
      console.error('Error saving preferences:', result.error);
      return false;
    }
    
    console.log('Preferences saved successfully');
    return true;
    
  } catch (error) {
    console.error('Error updating preferences:', error);
    return false;
  }
}
