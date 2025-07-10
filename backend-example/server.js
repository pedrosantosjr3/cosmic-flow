// Example Node.js Express server for visitor analytics
// You can deploy this to Vercel, Netlify, or any cloud provider

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb'); // or use any database you prefer
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Database connection (replace with your preferred database)
let db;
if (process.env.MONGODB_URI) {
  MongoClient.connect(process.env.MONGODB_URI)
    .then(client => {
      db = client.db('cosmic-flow-analytics');
      console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));
}

// Store visitor data
app.post('/api/analytics/visitor', async (req, res) => {
  try {
    const visitorData = req.body;
    
    // Add server timestamp
    visitorData.serverTimestamp = new Date().toISOString();
    
    // Get IP address (considering proxies)
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    visitorData.serverIP = ip;
    
    // Store in database
    if (db) {
      await db.collection('visitors').insertOne(visitorData);
    }
    
    res.status(200).json({ success: true, message: 'Visitor data stored' });
  } catch (error) {
    console.error('Error storing visitor data:', error);
    res.status(500).json({ success: false, error: 'Failed to store visitor data' });
  }
});

// Get visitor analytics (protected endpoint)
app.get('/api/analytics/visitors', async (req, res) => {
  try {
    // Simple authentication - replace with proper auth in production
    const authToken = req.headers.authorization;
    if (authToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    // Query parameters for filtering
    const { startDate, endDate, limit = 1000 } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    const visitors = await db.collection('visitors')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(visitors);
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    res.status(500).json({ error: 'Failed to fetch visitor data' });
  }
});

// Get analytics statistics
app.get('/api/analytics/stats', async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    if (authToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    const { timeRange = '24h' } = req.query;
    
    // Calculate time filter
    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const cutoffTime = new Date(now.getTime() - timeRanges[timeRange]);
    
    // Aggregation pipelines for statistics
    const [
      totalVisitors,
      uniqueVisitors,
      topCountries,
      deviceStats,
      browserStats
    ] = await Promise.all([
      // Total visitors
      db.collection('visitors').countDocuments({
        timestamp: { $gte: cutoffTime.toISOString() }
      }),
      
      // Unique visitors
      db.collection('visitors').distinct('id', {
        timestamp: { $gte: cutoffTime.toISOString() }
      }),
      
      // Top countries
      db.collection('visitors').aggregate([
        { $match: { timestamp: { $gte: cutoffTime.toISOString() } } },
        { $group: { _id: '$location.country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Device statistics
      db.collection('visitors').aggregate([
        { $match: { timestamp: { $gte: cutoffTime.toISOString() } } },
        { $group: { _id: '$device.type', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Browser statistics
      db.collection('visitors').aggregate([
        { $match: { timestamp: { $gte: cutoffTime.toISOString() } } },
        { $group: { _id: '$device.browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray()
    ]);
    
    res.json({
      totalVisitors,
      uniqueVisitors: uniqueVisitors.length,
      topCountries,
      deviceStats,
      browserStats
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`Analytics server running on port ${PORT}`);
});

module.exports = app;