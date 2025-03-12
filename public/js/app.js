// app.js - Main application logic

// Get the supabase instance that was initialized in supabase.js
// const _supabase = window.supabaseInstance;

// Declare allPosts in a higher scope accessible to search functions
let allPosts = [];

// Display login and signup forms
function displayAuthForms() {
    const authContainer = document.getElementById('auth-container');
    authContainer.innerHTML = `
        <div class="auth-forms">
            <div class="login-form">
                <h2>Login</h2>
                <form id="login-form">
                    <input type="email" id="login-email" placeholder="Email" required>
                    <input type="password" id="login-password" placeholder="Password" required>
                    <button type="submit">Login</button>
                    <button type="submit">Login Anonymously</button>
                </form>
            </div>
            
            <div class="signup-form">
                <h2>Sign Up</h2>
                <form id="signup-form">
                    <input type="email" id="signup-email" placeholder="Email" required>
                    <input type="password" id="signup-password" placeholder="Password" required>
                    <input type="text" id="signup-username" placeholder="Username" required>
                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    `;
    
    // Add event listeners for login and signup
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
}

// Initialize everything when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // First check if Supabase is properly loaded
    if (!_supabase) {
        document.body.innerHTML = '<h1>Error: Could not connect to Supabase</h1><p>Please check your console for more details.</p>';
        return;
    }
  
    // fetchuserData()

    // Check if user is logged in
    // checkUser();

    const fetchpostData = async () => {
        await checkUser();
        console.log('Fetching posts data...');
        const {data, error} = await supabase
            .from('posts')
            .select(`
                *,
                profiles (
                    username,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });
  
          if(error){
            console.log('Could not fetch the data')
            console.log(error)
          }
          if(data){
            console.log('Data fetched successfully')
            console.log(JSON.stringify(data))
            console.log("posts", data)
            allPosts = data; // Store fetched posts globally
            loadPosts(allPosts); // Load all posts initially
        }
    }
  
    fetchpostData()

    // Add event listeners for search functionality
    document.querySelector('.search-btn').addEventListener('click', handleSearch);
    document.querySelector('.search-bar').addEventListener('keypress', (event) => {
        // if not 'enter key' just exit here
        if (event.keyCode !== 13) return
        // search if enter key pressed
        handleSearch()
    })
    
    // // Initialize post form
    // const postForm = document.getElementById('post-form');
    // if (postForm) {
    //     postForm.addEventListener('submit', handleCreatePost);
    // }
    
    // // Hide post creation form until logged in
    // document.getElementById('create-post').style.display = 'none';

    // let postContent = document.getElementById('post-content');


    //     // When saving an edit
    // postContent.querySelector('.save-edit-btn').addEventListener('click', async () => {
    //     const newContent = postContent.querySelector('.edit-content').value;
        
    //     try {
    //         // Update in Supabase
    //         await supabase.from('posts').update({ content: newContent }).eq('id', post.id);
            
    //         // Update just this post's content in the DOM
    //         postContent.innerHTML = newContent;
    //     } catch (error) {
    //         alert('Error updating post: ' + error.message);
    //         postContent.innerHTML = originalContent;
    //     }
    // });
});




// const handleCreatePost = () => {
//     event.preventDefault();
//     console.log("create post");
// }

async function handleCreatePost(e) {
    e.preventDefault();
    
    // ... create post in Supabase ...
    
    // Clear form
    document.getElementById('post-content').value = '';
    
    // Reload all posts to show the new one
    loadnewPosts();
}


let selectedCategory = null; // Track selected category

function handleCategoryClick(category) {
    // Toggle category if clicked again
    selectedCategory = selectedCategory === category ? null : category;
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.querySelector('.search-bar').value.trim().toLowerCase();
    
    // Apply category filter first
    let filteredPosts = selectedCategory 
        ? allPosts.filter(post => post.category.toLowerCase() === selectedCategory.toLowerCase())
        : allPosts;

    // Then apply search filter
    filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm)
    );

    loadPosts(filteredPosts);
}

// Add event listeners for category buttons
document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const image = this.querySelector('img');
        const category = this.querySelector('span').textContent.trim();
        
        
        if (image.classList.contains('active-filter-item')) {
            // Remove active state if already active
            image.classList.remove('active-filter-item');
        } else {
            // Remove active class from all filter images
            document.querySelectorAll('.filter-link img').forEach(img => {
              img.classList.remove('active-filter-item');
            });
            // Add active state to the clicked filter image
            image.classList.add('active-filter-item');
        }

        console.log("category", category);
        handleCategoryClick(category);
    });
});

// Update existing search handler to use applyFilters
function handleSearch() {
    applyFilters();
}

async function loadPosts(posts) {
    const postsContainer = document.getElementById('events-container');
    //console.log("whet are posts ", posts);
    // console.log("whet are posts ", posts[0].content);
    // ... fetch posts from Supabase ...
    
    // Clear and rebuild the entire posts container
    postsContainer.innerHTML = '';

    if (posts === "") {
        postsContainer.insertAdjacentHTML('beforeend', '<p>No posts found.</p>');
        return;
    } else {
        posts.forEach((post, index) => {
            // Access post properties directly (no [0])
            const html_to_insert = `
            <div class="event-box">
                ${post.image_url ? `<img src="${post.image_url}" 
                    alt="Post Image" 
                    class="event-image"
                >` : ''}    

                <a href="../events/eventOV.html" class="clickable-text">
                    <h3 class="event-title">${post.title}</h3>
                    <p>${post.description} | ${new Date(post.created_at).toLocaleDateString()} </p>
                    <small class="event-category">${post.category} </small>
                    <p>Organizer ${post.profiles?.username || 'Unknown User'}</p>
                </a>
                <div class="post-actions">
                    <button class="heart-btn" onclick="toggleHeart(this)">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <i class="far fa-comment" title="Comment"></i>
                    <i class="fas fa-share" title="Share"></i>
                </div>
        </div>`;

            // Insert HTML for each post
            postsContainer.insertAdjacentHTML('beforeend', html_to_insert);
        });
    }
}

async function deletePost(postId) {
    // ... delete from Supabase ...
    
    // Remove just this post from the DOM
    document.querySelector(`.post[data-id="${postId}"]`).remove();
}