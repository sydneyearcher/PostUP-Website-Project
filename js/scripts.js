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
      window.location.href = "profile.html";
    });
  }
});

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
//   preferredevents: JSON.parse(localStorage.getItem("cuisine")) || [],
//   food: JSON.parse(localStorage.getItem("cuisine")) || [],
//   cuisine: JSON.parse(localStorage.getItem("cuisine")) || [],
//   art: JSON.parse(localStorage.getItem("cuisine")) || [],
//   artstyle: JSON.parse(localStorage.getItem("cuisine")) || [],
//   music: JSON.parse(localStorage.getItem("cuisine")) || [],
// };


let preferences = JSON.parse(localStorage.getItem("preferences")) || [];

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
     
      preferences.push(selectedValue);
      console.log("preferences:", preferences);
    } else {
      option.style.border = "none";
      preferences = preferences.filter((option) => option !== selectedValue);
      //remove the selected class from localstorage if selected again
      console.log("preferences:", preferences);
      localStorage.clear();
    }
    // Store the selected value in local storage
  });
});

document
  .querySelector(".survey-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const submitButton = document.querySelector(".submit-btn");

    const selectedOptions = [];
    const selectedCircles = document.querySelectorAll(
      ".circle-option.selected"
    );

    selectedCircles.forEach(function (circle) {
      selectedOptions.push(circle.dataset.value); // Collect the selected event types
    });

    console.log("Selected Event Types:", selectedOptions); // You can replace this with your own logic

    localStorage.setItem("preferences", JSON.stringify(preferences));

    console.log("preferences:", preferences);
    // Redirect to the next page
    const url = submitButton.getAttribute('data-href');
    console.log(url);
    if (url) {
      // Navigate to the URL
      window.location.href = url;
    }
    // const link = document.querySelector(".submit-btn");
    // window.location.href = link;
    // You can process the selected options here, like sending them to a backend or showing a confirmation page
  });

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
  const distanceKm = howFarSlider.value;
  const distanceMiles = (distanceKm * 0.621371).toFixed(1); // Convert km to miles

  howFarText.textContent = `Distance: ${distanceMiles} miles`;
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
    let heartIcon = eventBox.querySelector(".save-btn i");

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
      <button class="save-btn" onclick="toggleHeart(this)">
        <i class="fa-solid fa-heart" style="color: red;"></i> <!-- Set the heart to be filled initially -->
      </button>
    `;
    container.appendChild(eventCard);
  });
}
