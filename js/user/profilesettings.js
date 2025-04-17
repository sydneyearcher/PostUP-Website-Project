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

async function fetchuserData () {
    
  let loggedInUserProfile = await getProfile();

  console.log('Fetching data...');

  if(loggedInUserProfile){
    console.log(loggedInUserProfile);

    document.querySelector('.user-profile-picture img').src = loggedInUserProfile.avatar_url || '../../images/profileicon.png';
    document.querySelector('.profile-name').textContent = loggedInUserProfile.username ?
    `${loggedInUserProfile.username}` :
    'Anonymous User';
    document.querySelector('.profile-location').textContent = loggedInUserProfile.location;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Tab navigation functionality
  const settingsLinks = document.querySelectorAll('.settings-link');
  const settingsSections = document.querySelectorAll('.settings-section');
  const settingsContents = document.querySelector('.settings-content');
  const mobileSectionTitle = document.querySelector('.mobile-section-title');
  const mobileSectionTitleH1 = document.querySelector('.mobile-section-title h1');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const settingsSidebar = document.querySelector('.settings-sidebar');
  
  // Mobile menu toggle
  mobileMenuToggle.addEventListener('click', function() {
    settingsSidebar.classList.toggle('active');
    document.querySelector('.mobile-section-title').classList.add('inactive');
    document.querySelector('.settings-container ').classList.add('no-margin');
    settingsSections.forEach(section => {
      section.classList.remove('active');
    });
    settingsContents.classList.add('inactive');
  });
  
  // Tab switching functionality
  settingsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active link
      settingsContents.classList.remove('inactive');
      settingsLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Show the corresponding section
      const targetSection = this.getAttribute('data-section');
      settingsSections.forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(targetSection).classList.add('active');
      
      // Update mobile title
      mobileSectionTitleH1.textContent = this.textContent.trim();

      document.querySelector('.mobile-section-title').classList.remove('inactive');
      document.querySelector('.settings-container ').classList.remove('no-margin');
      
      // On mobile, hide the sidebar after selection
      if (window.innerWidth <= 768) {
        settingsSidebar.classList.remove('active');
      }
    });
  });
  
  // File input handling
  const fileInput = document.querySelector('.custom-file-input');
  const fileNameDisplay = document.querySelector('.file-name-display');
  
  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        fileNameDisplay.textContent = this.files[0].name;
      } else {
        fileNameDisplay.textContent = 'No file chosen';
      }
    });
  }
  
  // Preference option selection
  const preferenceOptions = document.querySelectorAll('.preference-option');
  
  preferenceOptions.forEach(option => {
    option.addEventListener('click', function() {
      console.log('Preference option selected:', this.textContent);
      this.classList.toggle('selected');
    });
  });
  
  fetchuserData();

  // Handle cancel buttons
  const cancelButtons = document.querySelectorAll('.cancel-btn');
  
  cancelButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Redirect back to profile or reload to discard changes
      window.location.href = '../main/profile.html';
    });
  });

  const preferencesForm = document.getElementById('preferences');

  preferencesForm.addEventListener('submit', function(event) {
    event.preventDefault(); // important if it's a form
    (async () => {
      await updateUserPreferencesData();
    })();
  });

  document.getElementById('profile-info').addEventListener('submit', handleProfileFormSubmit);
  document.getElementById('account').addEventListener('submit', handleAccountFormSubmit);
});


// SURVEY SLIDER
// How often slider
const distanceSlider = document.getElementById("edituser-event-distance");
const distanceSliderText = document.getElementById("edituser-event-distance-text");

distanceSlider.addEventListener("input", function () {
  const value = parseInt(distanceSlider.value);
  let distanceInMiles = value;

  // if (value <= 2) {
  //   frequency = "Rarely";
  // } else if (value <= 4) {
  //   frequency = "Once a Month";
  // } else if (value <= 7) {
  //   frequency = "Every Few Weeks";
  // } else {
  //   frequency = "Frequently";
  // }

  distanceSliderText.textContent = `Distance: ${distanceInMiles} miles`;
});


// Initialize Autocomplete
async function initAutocomplete() {
  // Create the autocomplete object, restricting the search to cities

  // Import the Places library
  await google.maps.importLibrary("places");

  // // Bind autocomplete to your existing input
  // const input = document.getElementById('edituser-city');
  // const autocomplete = new google.maps.places.Autocomplete(input, {
  //   types: ['(cities)'],
  //   componentRestrictions: { country: 'us' } // Optional country restriction
  // });

  // Handle place selection
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    // Extract state from address components
    for (const component of place.address_components) {
      if (component.types.includes('administrative_area_level_1')) {
        const stateField = document.getElementById('edituser-state');
        if (stateField) {
          // Update state dropdown (adjust logic as needed)
          stateField.value = component.short_name;
        }
        break;
      }
    }
  });

  // Optional: Dynamically update country restriction based on state
  const stateSelect = document.getElementById('edituser-state');
  if (stateSelect) {
    stateSelect.addEventListener('change', () => {
      autocomplete.setComponentRestrictions({
        country: ['us'] // Adjust based on your logic
      });
    });
  }
  
  const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();


  document.getElementById('googlemaps-location').appendChild(placeAutocomplete);

  placeAutocomplete.classList.add('gmp-placeselect');

  // Inject HTML UI.
  const selectedPlaceTitle = document.createElement('p');
  selectedPlaceTitle.textContent = '';
  document.getElementById('googlemaps-location').appendChild(selectedPlaceTitle);
  const selectedPlaceInfo = document.createElement('pre');
  selectedPlaceInfo.textContent = '';
  document.getElementById('googlemaps-location').appendChild(selectedPlaceInfo);
  // Add the gmp-placeselect listener, and display the results.
  //@ts-ignore
  placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
      selectedPlaceTitle.textContent = 'Selected Place:';
      selectedPlaceInfo.textContent = JSON.stringify(place.toJSON(), /* replacer */ null, /* space */ 2);
  });

  // const autocomplete = new google.maps.places.Autocomplete(input, {
  //   types: ['(cities)'],
  // });

  // // Set the country restriction based on the selected state if desired
  // // This is optional but can improve relevance of results
  // const stateSelect = document.getElementById('edituser-state');
  // if (stateSelect) {
  //   stateSelect.addEventListener('change', function() {
  //     if (this.value === 'Florida') {
  //       autocomplete.setComponentRestrictions({country: 'us'});
  //     } else if (this.value) {
  //       autocomplete.setComponentRestrictions({country: 'us'});
  //     } else {
  //       autocomplete.setComponentRestrictions({}); // No restriction
  //     }
  //   });
  // }

  // // When a place is selected, populate related fields if needed
  // autocomplete.addListener('place_changed', function() {
  //   const place = autocomplete.getPlace();
  //   if (!place.geometry) {
  //     // User entered the name of a place that was not suggested
  //     return;
  //   }

  //   // You can extract additional place details here if needed
  //   // For example:
  //   // const cityName = place.name;
  //   // const lat = place.geometry.location.lat();
  //   // const lng = place.geometry.location.lng();
    
  //   // You might want to extract state from address components
  //   for (const component of place.address_components) {
  //     const componentType = component.types[0];
  //     if (componentType === 'administrative_area_level_1') {
  //       // If we found the state in the place details, update the state dropdown
  //       const stateField = document.getElementById('edituser-state');
  //       if (stateField) {
  //         // Find the option with this state name and select it
  //         for (const option of stateField.options) {
  //           if (option.text === component.long_name) {
  //             stateField.value = option.value;
  //             break;
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  // });
}


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
  
  // document.querySelector('.edit-form').addEventListener('submit', handleChangeUserProfile);
  
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


// edit profile

async function handleProfileFormSubmit(event) {
  event.preventDefault();
  const loggedInUser = await checkUser();
  const userId = loggedInUser.user.id;

  const fullname = document.getElementById('edituser-full-name').value;
  const username = document.getElementById('edituser-username').value;
  const profilePicInput = document.getElementById('profile-pic');
  const state = document.getElementById('edituser-state').value;
  const city = document.getElementById('edituser-city').value;
  const location = city && state ? `${city}, ${state}` : city || state || "";
  const bio = document.getElementById('edituser-bio').value;
  const eventdistance = document.getElementById('edituser-event-distance').value;

  let profilePicUrl = null;
  if (profilePicInput.files.length > 0) {
    profilePicUrl = await handleUpdateUserProfilePicture(profilePicInput.files[0], userId);
  }

  try {
    await updateProfileTable({
      id: userId,
      full_name: fullname,
      username,
      location,
      user_bio: bio,
      avatar_url: profilePicUrl,
      preferred_distance: eventdistance,
      state: state,
      city: city,
    });

    // 2. Sync username to the Supabase `auth.users` metadata
    if (username) {
      await updateAuthUser({ username });
    }

    if (location) {
      await updateUserLocation(loggedInUser.user.id, location)
    }

    console.log('Profile updated successfully!');
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}

async function handleAccountFormSubmit(event) {
  event.preventDefault();
  const loggedInUser = await checkUser();
  const userId = loggedInUser.user.id;

  const email = document.getElementById('edituser-email').value;
  const phone = document.getElementById('edituser-phone-number').value;
  const password = document.getElementById('edituser-password').value;

  // Update Supabase Auth (users table)
  await updateAuthUser({ email, password, phone, username });

  // Update Profiles table only for shared fields like username
  try {
    await updateProfileTable({
      id: userId,
      username,
      email,
      phone_number: phone
    });
    console.log('user updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

async function updateProfileTable(data) {
  const filtered = Object.fromEntries(Object.entries(data).filter(([_, v]) => v));
  if (Object.keys(filtered).length === 0) return;

  const { error } = await _supabase
    .from('profiles')
    .update(filtered)
    .eq('id', data.id);

  if (error) {
    console.error('Profile update failed', error);
    alert('Failed to update profile info.');
  }
}

async function updateAuthUser({ email, password, phone, username }) {
  const updateData = {};
  if (email) updateData.email = email;
  if (password) updateData.password = password;
  if (phone) updateData.phone = phone;
  if (username) updateData.data = { display_name: username }; // optional, depends on setup

  const { error } = await _supabase.auth.updateUser(updateData);

  if (error) {
    console.error('Auth user update failed', error);
    alert('Failed to update account info.');
  }
}


// async function handleChangeUserProfile(event) {
//   event.preventDefault();
//   console.log("sign up", event);

//   // Get form values
//   const fullname = document.getElementById('edituser-full-name').value;
//   const username = document.getElementById('edituser-username').value;
//   const profilePicInput = document.getElementById('profile-pic');
//   const state = document.getElementById('edituser-state').value;
//   const bio = document.getElementById('edituser-bio').value;
//   const city = document.getElementById('edituser-city').value;
//   const location = city && state ? `${city}, ${state}` : city || state || "";

//   const email = document.getElementById('edituser-email').value;
//   const phonenumber = document.getElementById('edituser-phone-number').value;
//   const password = document.getElementById('edituser-password').value;

//   console.log(fullname, username, profilePicInput, location, bio);

//   let loggedInUser = await checkUser();
//   let loggedInUserId = loggedInUser.user.id;

//   // Upload profile picture if a file was selected
//   let profilePicUrl = null;
//   if (profilePicInput.files && profilePicInput.files.length > 0) {
//     profilePicUrl = await handleUpdateUserProfilePicture(profilePicInput.files[0], loggedInUserId);
//     // console.log("pfp url ", profilePicUrl);
//   }

//   // const profileStatsContainer = document.getElementById('profile-preference-stats');
//   await handleUpdateUserProfileInfo(loggedInUser, fullname, username, location, bio, email, phonenumber, profilePicUrl);
//   await handleUpdateUserInfo(username, email, phonenumber, password);
//   // await updateUserPreferencesData();
// }

// async function handleUpdateUserProfileInfo(loggedInUser, fullname, username, location, bio, email, phonenumber, profilePicUrl) {
//   // console.log(fullname, username, location, bio); 

//   console.log('Fetching data...');

//   try {
//     let updateData = {};
    
//     if (fullname) updateData.full_name = fullname;
//     if (username) updateData.username = username;
//     if (bio) updateData.user_bio = bio;
//     if (location) updateData.location = location;
//     if (email) updateData.email = email;
//     if (phonenumber) updateData.phone_number = phonenumber;
//     if (profilePicUrl) updateData.avatar_url = profilePicUrl;
    
//     // console.log('Update Data:', Object.keys(updateData));
//     // console.log('Update Data:', Object.keys(updateData).length);
    
//     // Only proceed with the update if there's at least one field to update
//     if (Object.keys(updateData).length > 0) {

//       // 2. If auth successful, create a profile in your custom profiles table
//       const { error: profileError } = await _supabase
//         .from('profiles')
//         .update(updateData)
//         .eq('id', loggedInUser.user.id);  // You'll need to get the actual user ID

//           //   avatar_url: profileImageUrl || undefined  // Only update if a new image was uploaded
//           // })
//           // .eq('id', 'YOUR_USER_ID');  // You'll need to get the actual user ID

//         if (profileError) throw profileError;
//         console.log('User profile info updated successfully!');
//       } else {
//         console.log('No fields to update.');
//       }
//   } catch (error) {
//     console.error(' error:', error);
//     alert(`edit user info failed: ${error.message}`);
//   }
// }



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

// // Initialize preferences from localStorage
// let preferences = JSON.parse(localStorage.getItem("preferences")) || [];

// // Apply selected state to buttons based on stored preferences
// document.addEventListener('DOMContentLoaded', function() {
//   // Mark buttons as selected if they're in preferences
//   document.querySelectorAll('.preference-option').forEach(option => {
//     if (preferences.includes(option.dataset.value)) {
//       option.classList.add('selected');
//     }
//   });
// });

// Set up click handlers for all preference options
// document.querySelectorAll('.preference-option').forEach(option => {
//   option.addEventListener('click', function() {
//     const selectedValue = option.dataset.value;
    
//     // Toggle selection state
//     option.classList.toggle('selected');
    
//     if (option.classList.contains('selected')) {
//       // Add to preferences if selected
//       if (!preferences.includes(selectedValue)) {
//         preferences.push(selectedValue);
//       }
//     } else {
//       // Remove from preferences if deselected
//       preferences = preferences.filter(value => value !== selectedValue);
//     }
    
//     // Save updated preferences to localStorage
//     localStorage.setItem('preferences', JSON.stringify(preferences));
//     console.log('Updated preferences:', preferences);
//   });
// });

async function loadUserPreferences(loggedInUser) {
  try {
    // Get the currently logged in user
    
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

async function loadUserDistance(loggedInUser) {
  console.log('loadUserDistance function called');

  try {
    // Fetch user preferences from database
    const { data, error } = await supabase
      .from('profiles')
      .select('preferred_distance')
      .eq('id', loggedInUser.user.id)
      .single();
    if (data) {
      console.log('Fetched user preferences:', data);
      // Update the input field with the fetched distance
      const distanceInput = document.getElementById('edituser-event-distance');
      const distanceSliderText = document.getElementById("edituser-event-distance-text");

      if (distanceInput) {
        distanceInput.value = data.preferred_distance;
        distanceSliderText.textContent = `Distance: ${data.preferred_distance} miles`;
      }

      
    } else {
      console.error('Error fetching preferences:', error);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    return;
  }
}

// Call this function when the page loads after login
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in before loading preferences
  checkUser().then(loggedInUser => {
    if (loggedInUser && loggedInUser.user) {
      loadUserPreferences(loggedInUser);
      loadUserDistance(loggedInUser);
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
    alert('Preferences saved successfully');
    return true;
    
  } catch (error) {
    console.error('Error updating preferences:', error);
    return false;
  }
}

// When a user sets their location
async function updateUserLocation(userId, location) {
  // 1. Geocode the address using Google API
  console.log('Updating location for user:', userId);
  console.log('Location:', location);
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyDradz2mjYgwEDQP2TJ195DIcaSj3KTcxk`;
  const response = await fetch(geocodeUrl);
  const data = await response.json();
  
  if (data.status !== "OK") {
    throw new Error("Geocoding failed", data.status);
  }
  
  const geolocation = data.results[0].geometry.location;
  const { lat, lng } = geolocation;

  // console.log('Geolocation:', geolocation);
  // console.log('Latitude:', lat);
  // console.log('Longitude:', lng);
  // console.log(`POINT(${lng} ${lat})`);
  
  // 2. Update the user profile with both formats
  const { data: updateData, error } = await supabase
    .from('profiles')
    .update({
      latitude: lat,
      longitude: lng,
      geolocation: `POINT(${lng} ${lat})` // This gets converted to the binary format
    })
    .eq('id', userId);
    
  if (error) throw error;
  return updateData;
}

// // When filtering events by distance
// async function getEventsWithinDistance(userId, distanceMiles) {
//   const { data, error } = await supabase
//     .rpc('find_events_within_distance', {
//       user_id: userId,
//       max_distance: distanceMiles * 1609.34
//     });
    
//   if (error) throw error;
  
//   return data; // These will include the human-readable lat/lng values
// }