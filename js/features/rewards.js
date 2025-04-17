// rewards.js
let currentUser;
let totalPoints = 0; // Create a single global points variable

document.addEventListener('DOMContentLoaded', function() {
  if (!_supabase) {
    console.error('Could not connect to Supabase. Please check your console for more details.');
    return;
  }

  // Fetch user data and initialize points
  (async () => {
    try {
      // const thisUser = await fetchuserData();
      currentUser = await getProfile();
      
      // Set totalPoints from user data
      totalPoints = currentUser.current_point_balance;
      
      // Update display with initial points
      document.querySelector('.points-total').textContent = totalPoints.toLocaleString('en-US');
      
      // Update redeem buttons based on available points
      updateRedeemButtons();
      
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  })();
  
  // Tab functionality
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active classes from all tabs and contents
      tabs.forEach(t => t.classList.remove('active-tab'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active-tab');
      const tabId = tab.dataset.tab;
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Scanner button functionality
  const scanButton = document.getElementById('scanButton');
  const scannerPlaceholder = document.querySelector('.scanner-placeholder');
  
  scanButton.addEventListener('click', () => {
    // Simulate camera access
    scannerPlaceholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Accessing camera...</p>';
    
    // Simulate scanning delay
    setTimeout(() => {
      processScan();
    }, 2000);
  });

  function processScan() {
    // Generate random points between 25-100
    const pointsEarned = Math.floor(Math.random() * 76) + 25;
    
    // Show success message
    scannerPlaceholder.innerHTML = `
      <i class="fas fa-check-circle" style="color: #28a745; font-size: 3.5rem;"></i>
      <p style="color: #28a745; font-weight: bold; margin-top: 10px;">Points Added!</p>
      <p>You earned ${pointsEarned} points</p>
    `;
    
    // Update total points
    totalPoints += pointsEarned;
    updatePointsDisplay();
    
    // Add new transaction to history
    addPointsHistoryItem({
      type: 'earned',
      title: 'Scanned Item: Coffee Purchase',
      date: 'Just now',
      points: pointsEarned
    });
    
    // Reset scanner after delay
    setTimeout(() => {
      scannerPlaceholder.innerHTML = '<i class="fas fa-camera"></i><p>Tap to scan a QR code</p>';
    }, 3000);
  }

  // Update points display
  function updatePointsDisplay() {
    const pointsDisplay = document.querySelector('.points-total');
    pointsDisplay.innerText = totalPoints.toLocaleString();
    
    // Update redeem buttons based on available points
    updateRedeemButtons();
  }
  
  // Update redeem buttons (enable/disable based on points)
  function updateRedeemButtons() {
    const rewardCards = document.querySelectorAll('.reward-card');
    
    rewardCards.forEach(card => {
      const pointsCostText = card.querySelector('.points-cost').innerText;
      const pointsCost = parseInt(pointsCostText.replace(/[^0-9]/g, ''));
      const redeemBtn = card.querySelector('.redeem-btn');
      
      if (pointsCost > totalPoints) {
        redeemBtn.classList.add('disabled');
        redeemBtn.innerText = 'NOT ENOUGH POINTS';
        redeemBtn.disabled = true;
      } else {
        redeemBtn.classList.remove('disabled');
        redeemBtn.innerText = 'REDEEM REWARD';
        redeemBtn.disabled = false;
      }
    });
  }

  // Add item to points history
  function addPointsHistoryItem(item) {
    const pointsHistory = document.getElementById('points-history');
    const newHistoryItem = document.createElement('div');
    
    newHistoryItem.className = `history-item ${item.type}`;
    newHistoryItem.innerHTML = `
      <div class="history-item-left">
        <div class="history-icon">
          <i class="fas fa-${item.type === 'earned' ? 'plus' : 'minus'}"></i>
        </div>
        <div class="history-item-details">
          <h4>${item.title}</h4>
          <p>${item.date}</p>
        </div>
      </div>
      <div class="history-item-points">${item.type === 'earned' ? '+' : '-'}${item.points} pts</div>
    `;
    
    // Insert at top of history
    if (pointsHistory.firstChild) {
      pointsHistory.insertBefore(newHistoryItem, pointsHistory.firstChild);
    } else {
      pointsHistory.appendChild(newHistoryItem);
    }
    
    // If it's a redemption, also add to redemption history
    if (item.type === 'redeemed') {
      addRedemptionHistoryItem(item);
    }
  }
  
  // Add item to redemption history
  function addRedemptionHistoryItem(item) {
    const redemptionHistory = document.getElementById('redemption-history');
    const newRedemption = document.createElement('div');
    
    newRedemption.className = 'history-item redeemed';
    newRedemption.innerHTML = `
      <div class="history-item-left">
        <div class="history-icon">
          <i class="fas fa-gift"></i>
        </div>
        <div class="history-item-details">
          <h4>${item.title.replace('Reward Redemption: ', '')}</h4>
          <p>Redeemed ${item.date}</p>
        </div>
      </div>
      <div class="history-item-points">-${item.points} pts</div>
    `;
    
    // Insert at top of redemption history
    if (redemptionHistory.firstChild) {
      redemptionHistory.insertBefore(newRedemption, redemptionHistory.firstChild);
    } else {
      redemptionHistory.appendChild(newRedemption);
    }
  }

  // Redeem button functionality
  document.querySelectorAll('.reward-card').forEach(card => {
    const redeemBtn = card.querySelector('.redeem-btn');
    
    redeemBtn.addEventListener('click', function() {
      const rewardCard = this.closest('.reward-card');
      const rewardName = rewardCard.querySelector('h3').innerText;
      const pointsCostText = rewardCard.querySelector('.points-cost').innerText;
      const pointsCost = parseInt(pointsCostText.replace(/[^0-9]/g, ''));
      
      if (confirm(`Redeem "${rewardName}" for ${pointsCost} points?`)) {
        // Check if user has enough points
        if (totalPoints >= pointsCost) {
          // Update total points
          totalPoints -= pointsCost;
          updatePointsDisplay();
          
          // Show success message
          alert('Reward successfully redeemed! Check your redemption history for details.');
          
          // Add to histories
          addPointsHistoryItem({
            type: 'redeemed',
            title: `Reward Redemption: ${rewardName}`,
            date: 'Just now',
            points: pointsCost
          });
        } else {
          alert('Not enough points to redeem this reward.');
          
          // Update button state
          this.classList.add('disabled');
          this.innerText = 'NOT ENOUGH POINTS';
          this.disabled = true;
        }
      }
    });
  });
});