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

// Handle "Create Account" button click on signup.html
document.addEventListener("DOMContentLoaded", function () {
  const createAccountButton = document.querySelector("#createAccountBtn");

  if (createAccountButton) {
    createAccountButton.addEventListener("click", function () {
      // Redirect to the location page to start the survey portion
      window.location.href = "location.html";
    });
  }
});

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
