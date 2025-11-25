const axios = require('axios');

async function testTranslate(text) {
  try {
    const res = await axios.post(
      'https://libretranslate.com/translate',
      {
        q: text,
        source: 'auto',
        target: 'en',
        format: 'text',
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    console.log('API response:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Status:', err.response.status);
    } else {
      console.error('Request error:', err.message);
    }
  }
}

const text = process.argv.slice(2).join(' ') || 'hola amigo';
console.log('Testing translate for:', text);
testTranslate(text);
