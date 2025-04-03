// const fetchOneEventData = async (eventId) => {
//     console.log('Fetching the event of...' + eventId);
//     const { data, error } = await _supabase
//     .from('events')
//     .select('*')
//     .eq('id', eventId)
//     .single();
//     if(error){
//         console.log('Could not fetch the data')
//         console.log(error)
//       }
//     if (!data) throw new Error('Event not found');
    
//     if (data) {
//         console.log('Event data:', data);
//         return data;
//     }
// }

const fetchOneEventData = async (eventId) => {
    // try {
    //   // First check cache
    //   const cachedEvent = await getCachedEvent(eventId);
    //   if (cachedEvent) {
    //     console.log('Returning cached event:');
    //     return cachedEvent;
    //   }
    // } catch (error) {
    //   console.log('Cache check error:', error);
    // }
  
    console.log('Fetching fresh event:');
    const { data, error } = await _supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
  
    if (error || !data) {
      console.log('Fetch error:', error || 'Event not found');
      throw error || new Error('Event not found');
    }
  
    // Cache the fetched event
    await cacheEvent(data);
    // console.log('Event data:', data);
    return data;
  };

  // IndexedDB setup
const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('eventsDB', 1);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
      };
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  // Get single cached event with expiration check
  const getCachedEvent = async (eventId) => {
    try {
      const db = await openDB();
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      
      const request = store.get(eventId);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          // Check if exists and is fresh (1 hour max age)
          if (result && Date.now() - result.cachedAt < 3600000) {
            resolve(result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  };
  
  // Cache single event
  const cacheEvent = async (event) => {
    try {
      const db = await openDB();
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      
      // Add timestamp and update existing entry
      store.put({ ...event, cachedAt: Date.now() });
  
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

// async function loadEvent () {
    
//     let loggedInUser= await checkUser();

//     console.log('Fetching data...');
    
//     const {data, error} = await supabase
//       .from('profiles')
//       .select()
//       .eq('id', loggedInUser.user.id)

//       if(error){
//         console.log('Could not fetch the data')
//         console.log(error)
//       }

//       if(data){

//         let loggedInUserProfile = data[0];
        
//         //filter user data to check if its the same thing as logged in user
//         profileContainer.innerHTML = ``;

//         const html_to_insert = `
//             <div class="profile-picture">
//                 <img src="${loggedInUserProfile.avatar_url || '../../images/profileicon.png'}" alt="Profile Picture" />
//             </div>
//             <h3 class="profile-name">
//                  ${loggedInUserProfile.username ? 
//                 `${loggedInUserProfile.username} <i class="fas fa-check-circle"></i>` : 
//                 'Anonymous User'}
//             </h3>
//             <p class="profile-location">
//                 ${loggedInUserProfile.location ? 
//                 `${loggedInUserProfile.location.toUpperCase()}` : 
//                 'No Location Set'}
//             </p>
//             <p class="profile-bio">
//                  ${loggedInUserProfile.user_bio ? 
//                 `${loggedInUserProfile.user_bio}` : 
//                 'No Description Set'}
//             </p>

//             <div class="profile-buttons">
//                 <a href="../profile/editprofile.html" class="profile-btn">EDIT PROFILE</a>
//                 <a href="../profile/create.html" class="profile-btn">CREATE EVENT</a>
//             </div>
//             `;

//         // Insert HTML
//         profileContainer.insertAdjacentHTML('beforeend', html_to_insert);

//       }
    
// }


window.fetchOneEventData = fetchOneEventData;