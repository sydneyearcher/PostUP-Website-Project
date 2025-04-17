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

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Handle "Allow Location" button click
  const allowLocationButton = document.getElementById("allowLocationBtn");

  if (allowLocationButton) {
    allowLocationButton.addEventListener("click", function () {
      // Redirect to the survey page
      window.location.href = "startsurvey.html";
    });
  }

  // Handle "Maybe Later" link click
  const maybeLaterLink = document.getElementById("maybeLater");

  if (maybeLaterLink) {
    maybeLaterLink.addEventListener("click", function () {
      // Redirect to the survey page (or any other page you'd like)
      window.location.href = "startsurvey.html";
    });
  }
});

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Handle "Allow Location" button click
  const allowLocationButton = document.getElementById("allowLocationBtn");

  if (allowLocationButton) {
    allowLocationButton.addEventListener("click", function () {
      // Redirect to the survey start page
      window.location.href = "surveystart.html";
    });
  }

  // Handle "Maybe Later" link click
  const maybeLaterLink = document.getElementById("maybeLater");

  if (maybeLaterLink) {
    maybeLaterLink.addEventListener("click", function () {
      // Redirect to the survey start page (or any other page you'd like)
      window.location.href = "surveystart.html";
    });
  }
});

// EDITPROFILE CANCEL BUTTON
document.addEventListener("DOMContentLoaded", function () {
  // Handle "Cancel" button click on editprofile.html
  const cancelButton = document.querySelector(".cancel-btn");

  if (cancelButton) {
    cancelButton.addEventListener("click", function () {
      window.location.href = "profile.html"; // Redirect back to the profile page
    });
  }
});

// let preferences = {
//   preferredevents: JSON.parse(localStorage.getItem("preferredevents")) || [],
//   food: JSON.parse(localStorage.getItem("food")) || [],
//   cuisine: JSON.parse(localStorage.getItem("cuisine")) || [],
//   art: JSON.parse(localStorage.getItem("art")) || [],
//   artstyle: JSON.parse(localStorage.getItem("artstyle")) || [],
//   music: JSON.parse(localStorage.getItem("music")) || [],
// };


let selectedPreferences = JSON.parse(localStorage.getItem("preferences")) || [];

// SURVEY
document.querySelectorAll(".circle-option").forEach((option) => {
  option.addEventListener("click", function () {
    
    // Toggle the selected class to add/remove the black border
    option.classList.toggle("selected");
    let selectedValue = option.dataset.value;

    if (option.classList.contains("selected")) {
      // Get the value of the selected option
      option.style.border = "2px solid black";
      
      console.log("Selected Value:", selectedValue);
     
      selectedPreferences.push(selectedValue);
      console.log("preferences:", selectedPreferences);
    } else {
      option.style.border = "none";
      selectedPreferences = selectedPreferences.filter((option) => option !== selectedValue);
      //remove the selected class from localstorage if selected again
      console.log("preferences:", selectedPreferences);
      // localStorage.clear();
    }
    // Store the selected value in local storage
  });
});

// Handle form submissions for each category
document.querySelectorAll('#artstyle-form, #eventtype-form, #music-form, #food-form, #cuisine-form, #artform-form')
  .forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const formId = this.id;
      const category = formId.replace('-form', '');
      
      // Get selected options from the current form
      const selectedOptions = [];
      const selectedElements = this.querySelectorAll('.circle-option.selected, .preference-option.selected');
      
      selectedElements.forEach(element => {
        selectedOptions.push(element.dataset.value);
      });
      
      // Store in localStorage with appropriate key name
      localStorage.setItem(category, JSON.stringify(selectedOptions));
      console.log(`Saved ${category} preferences:`, selectedOptions);

      // console.log("Selected Options:", selectedOptions);
      
      // Redirect to the next page if specified
      const submitButton = this.querySelector('.submit-btn');
      if (submitButton) {
        const nextUrl = submitButton.getAttribute('data-href');
        if (nextUrl) {
          window.location.href = nextUrl;
        }
      }
    });
  });

// Handle the final submission and database update
document.getElementById('createPreferenceBtn')?.addEventListener('click', async function(event) {
  event.preventDefault();
  const preferred_distance = document.getElementById('how-far').value;
  let loggedInUser = await checkUser();
  if (!loggedInUser || !loggedInUser.user) {
    console.error("No logged in user found");
    return false;
  }
  if (loggedInUser) {
    try {
      let updatedPreferences = await createOrUpdateUserPreferences(loggedInUser);
      let updatedDistancePrefers = await updateUserPreferredLocation(loggedInUser, preferred_distance);
      if (updatedPreferences && updatedDistancePrefers) {
        console.log('User preferences updated successfully');
        // Redirect to the next page
        window.location.href = '../main/explore.html';
      } else {
        console.error('Failed to update user preferences');
      }
    } catch (error) {
      console.error('Error creating or updating user preferences:', error);
    }
  }
});

// Function to create or update user preferences in database
async function createOrUpdateUserPreferences(loggedInUser) {
  // Get the currently logged in user

  const preferences = {
    events_category: JSON.parse(localStorage.getItem('eventtype') || '[]'),
    music_category: JSON.parse(localStorage.getItem('music') || '[]'),
    food_category: JSON.parse(localStorage.getItem('food') || '[]'),
    cuisine_category: JSON.parse(localStorage.getItem('cuisine') || '[]'),
    art_category: JSON.parse(localStorage.getItem('artform') || '[]'),
    artstyle_category: JSON.parse(localStorage.getItem('artstyle') || '[]')
  };
  
  console.log('Consolidated preferences from localStorage:', preferences);
  
  const userId = loggedInUser.user.id;

  console.log('User ID:', userId);
  
  // Retrieve all preferences from localStorage

  try {
    // Check if the user already has preferences stored
    const { data, error } = await supabase
      .from('preferences')
      .select()
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching existing preferences:', error);
      return false;
    }
    
    let result;
    
    if (data && data.length > 0) {
      // Update existing preferences
      result = await supabase
        .from('preferences')
        .update({
          events_category: preferences.events_category,
          music_category: preferences.music_category,
          food_category: preferences.food_category,
          cuisine_category: preferences.cuisine_category,
          art_category: preferences.art_category,
          artstyle_category: preferences.artstyle_category,
        })
        .eq('user_id', userId);
      
      console.log('Updated preferences for existing user');
    } else {
      // Insert new preferences
      result = await supabase
        .from('preferences')
        .insert([{
          user_id: userId,
          events_category: preferences.events_category,
          music_category: preferences.music_category,
          food_category: preferences.food_category,
          cuisine_category: preferences.cuisine_category,
          art_category: preferences.art_category,
          artstyle_category: preferences.artstyle_category
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


// Function to create or update user preferences in database
async function updateUserPreferredLocation(loggedInUser, preferred_distance) {
  // Get the currently logged in user
  
  const userId = loggedInUser.user.id;
  
  // Retrieve all preferences from localStorage

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId);
      
    if (error) {
      console.error('Error fetching existing preferences:', error);
      return false;
    }

    let result;
    
    if (data && data.length > 0) {
      // Update existing preferences
      result = await supabase
        .from('profiles')
        .update({
          preferred_distance: preferred_distance
        })
        .eq('id', userId);
      
      console.log('Updated preferred location for existing user');
    }
    
    if (result.error) {
      console.error('Error saving preferred location:', result.error);
      return false;
    }
    
    console.log('Preferred location saved successfully');
    return true;
    
  } catch (error) {
    console.error('Error updating location:', error);
    return false;
  }
}

// document
//   .querySelector(".survey-form")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();
//     const submitButton = document.querySelector(".submit-btn");

//     const selectedOptions = [];
//     const selectedCircles = document.querySelectorAll(
//       ".circle-option.selected"
//     );

//     selectedCircles.forEach(function (circle) {
//       selectedOptions.push(circle.dataset.value); // Collect the selected event types
//     });

//     console.log("Selected Event Types:", selectedOptions); // You can replace this with your own logic

//     localStorage.setItem("preferences", JSON.stringify(preferences));

//     console.log("preferences:", preferences);
//     // Redirect to the next page
//     const url = submitButton.getAttribute('data-href');
//     console.log(url);
//     if (url) {
//       // Navigate to the URL
//       window.location.href = url;
//     }
//     // const link = document.querySelector(".submit-btn");
//     // window.location.href = link;
//     // You can process the selected options here, like sending them to a backend or showing a confirmation page
//   });


//   async function updateUserPreferencesData() {
//     // Get the currently logged in user
//     let loggedInUser = await checkUser();
//     if (!loggedInUser || !loggedInUser.user) {
//       console.error("No logged in user found");
//       return;
//     }
    
//     const userId = loggedInUser.user.id;
    
//     // Get all selected preference options
//     const selectedOptions = document.querySelectorAll('.preference-option.selected');
    
//     // Create category-specific arrays
//     const categorizedPreferences = {
//       events_category: [],
//       music_category: [],
//       food_category: [],
//       cuisine_category: [],
//       art_category: [],
//       artstyle_category: []
//     };
    
//     // Map each option to its appropriate category based on its parent fieldset
//     selectedOptions.forEach(option => {
//       const value = option.dataset.value;
//       const category = option.closest('fieldset').querySelector('legend').textContent.trim();
      
//       switch (category) {
//         case 'EVENTS':
//           categorizedPreferences.events_category.push(value);
//           break;
//         case 'MUSIC':
//           categorizedPreferences.music_category.push(value);
//           break;
//         case 'FOOD':
//           categorizedPreferences.food_category.push(value);
//           break;
//         case 'CUISINE':
//           categorizedPreferences.cuisine_category.push(value);
//           break;
//         case 'ART':
//           categorizedPreferences.art_category.push(value);
//           break;
//         case 'ART STYLE':
//           categorizedPreferences.artstyle_category.push(value);
//           break;
//       }
//     });
    
//     console.log('Categorized preferences:', categorizedPreferences);
    
//     try {
//       // First check if the user already has preferences stored
//       const { data, error } = await supabase
//         .from('preferences')
//         .select()
//         .eq('user_id', userId);
        
//       if (error) {
//         console.error('Error fetching existing preferences:', error);
//         return;
//       }
      
//       let result;
      
//       if (data && data.length > 0) {
//         // Update existing preferences
//         result = await supabase
//           .from('preferences')
//           .update({
//             events_category: categorizedPreferences.events_category,
//             music_category: categorizedPreferences.music_category,
//             food_category: categorizedPreferences.food_category,
//             cuisine_category: categorizedPreferences.cuisine_category,
//             art_category: categorizedPreferences.art_category,
//             artstyle_category: categorizedPreferences.artstyle_category,
//           })
//           .eq('user_id', userId);
        
//         console.log('Updated preferences for existing user');
//       } else {
//         // Insert new preferences
//         result = await supabase
//           .from('preferences')
//           .insert([{
//             user_id: userId,
//             events_category: categorizedPreferences.events_category,
//             music_category: categorizedPreferences.music_category,
//             food_category: categorizedPreferences.food_category,
//             cuisine_category: categorizedPreferences.cuisine_category,
//             art_category: categorizedPreferences.art_category,
//             artstyle_category: categorizedPreferences.artstyle_category
//           }]);
        
//         console.log('Created new preferences for user');
//       }
      
//       if (result.error) {
//         console.error('Error saving preferences:', result.error);
//         return false;
//       }
      
//       console.log('Preferences saved successfully');
//       return true;
      
//     } catch (error) {
//       console.error('Error updating preferences:', error);
//       return false;
//     }
//   }

// SURVEY SLIDER
// How often slider
const howOftenSlider = document.getElementById("how-often");
const howOftenText = document.getElementById("how-often-text");

howOftenSlider.addEventListener("input", function () {
  const value = parseInt(howOftenSlider.value);
  let frequency = "";

  if (value <= 2) {
    frequency = "Rarely";
  } else if (value <= 4) {
    frequency = "Once a Month";
  } else if (value <= 7) {
    frequency = "Every Few Weeks";
  } else {
    frequency = "Frequently";
  }

  howOftenText.textContent = `Frequency: ${frequency}`;
});

// How far slider (miles)
const howFarSlider = document.getElementById("how-far");
const howFarText = document.getElementById("how-far-text");

howFarSlider.addEventListener("input", function () {
  // const distanceKm = howFarSlider.value;
  // const distanceMiles = (distanceKm * 0.621371).toFixed(1);

  const distanceMiles = howFarSlider.value;

  howFarText.textContent = `Distance: ${distanceMiles} miles`;
});
