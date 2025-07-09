const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.get('/api/*', async (req, res) => {
  try {
    const apiPath = req.path.replace('/api', '');
    const apiUrl = `http://localhost:8000${apiPath}`;
    
    const response = await axios({
      method: req.method,
      url: apiUrl,
      headers: {
        ...req.headers,
        host: 'localhost:8000'
      },
      params: req.query,
      data: req.body
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`CORS proxy server running on http://localhost:${PORT}`);
  console.log('Use http://localhost:3001/api/proxy/stats/optimized to access the API');
});