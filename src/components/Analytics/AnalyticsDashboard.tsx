import React, { useState, useEffect } from 'react';
import { VisitorData } from '../../services/visitorTracking';
import './AnalyticsDashboard.css';

interface AnalyticsStats {
  totalVisitors: number;
  uniqueVisitors: number;
  totalSessions: number;
  averageSessionDuration: number;
  averagePageViews: number;
  bounceRate: number;
  topCountries: Array<{ country: string; count: number }>;
  topPages: Array<{ page: string; count: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  hourlyVisits: Array<{ hour: number; count: number }>;
  realTimeVisitors: number;
}

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = 'cosmicreality7'; // Change this to your secure password

  const authenticate = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadAnalyticsData();
    } else {
      alert('Invalid password');
    }
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage first
      const localData = loadLocalData();
      setVisitors(localData);
      
      // Try to load from backend
      try {
        const response = await fetch('/api/analytics/visitors');
        if (response.ok) {
          const backendData = await response.json();
          setVisitors(backendData);
        }
      } catch (error) {
        console.log('Using local data only');
      }
      
      calculateStats(localData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    setIsLoading(false);
  };

  const loadLocalData = (): VisitorData[] => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('visitor-data-'));
    return keys.map(key => JSON.parse(localStorage.getItem(key) || '{}')).filter(data => data.id);
  };

  const calculateStats = (visitorData: VisitorData[]) => {
    const now = Date.now();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const cutoffTime = now - timeRanges[selectedTimeRange];
    const filteredData = visitorData.filter(v => new Date(v.timestamp).getTime() > cutoffTime);

    const uniqueVisitors = new Set(filteredData.map(v => v.id)).size;
    const totalSessions = new Set(filteredData.map(v => v.session.sessionId)).size;
    const avgSessionDuration = filteredData.reduce((sum, v) => sum + v.session.duration, 0) / filteredData.length;
    const avgPageViews = filteredData.reduce((sum, v) => sum + v.session.pageViews, 0) / filteredData.length;
    
    // Calculate bounce rate (sessions with only 1 page view)
    const bounceRate = filteredData.filter(v => v.session.pageViews === 1).length / filteredData.length * 100;

    // Top countries
    const countryCount = filteredData.reduce((acc, v) => {
      const country = v.location.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device types
    const deviceCount = filteredData.reduce((acc, v) => {
      acc[v.device.type] = (acc[v.device.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceTypes = Object.entries(deviceCount)
      .map(([type, count]) => ({ type, count }));

    // Browsers
    const browserCount = filteredData.reduce((acc, v) => {
      acc[v.device.browser] = (acc[v.device.browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const browsers = Object.entries(browserCount)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hourly visits for last 24 hours
    const hourlyVisits = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date();
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hour + 1);
      
      const count = filteredData.filter(v => {
        const visitTime = new Date(v.timestamp);
        return visitTime >= hourStart && visitTime < hourEnd;
      }).length;
      
      return { hour, count };
    });

    // Real-time visitors (last 5 minutes)
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const realTimeVisitors = filteredData.filter(v => 
      new Date(v.engagement.lastActiveTime).getTime() > fiveMinutesAgo
    ).length;

    setStats({
      totalVisitors: filteredData.length,
      uniqueVisitors,
      totalSessions,
      averageSessionDuration: avgSessionDuration,
      averagePageViews: avgPageViews,
      bounceRate,
      topCountries,
      topPages: [], // You can implement this based on your page tracking
      deviceTypes,
      browsers,
      hourlyVisits,
      realTimeVisitors
    });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatLocation = (visitor: VisitorData) => {
    const { city, region, country } = visitor.location;
    if (city && region && country) return `${city}, ${region}, ${country}`;
    if (region && country) return `${region}, ${country}`;
    if (country) return country;
    return 'Unknown Location';
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsData();
      
      // Refresh data every 30 seconds
      const interval = setInterval(loadAnalyticsData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, selectedTimeRange]);

  if (!isAuthenticated) {
    return (
      <div className="analytics-login">
        <div className="login-modal">
          <h2>🔒 Analytics Access</h2>
          <p>Enter admin password to view analytics</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            onKeyPress={(e) => e.key === 'Enter' && authenticate()}
          />
          <div className="login-buttons">
            <button onClick={authenticate}>Access Analytics</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>📊 Cosmic Flow Analytics</h1>
        <div className="header-controls">
          <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value as any)}>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading analytics data...</div>
      ) : (
        <>
          {/* Stats Overview */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>🔴 Real-time</h3>
                <div className="stat-number">{stats.realTimeVisitors}</div>
                <div className="stat-label">Active Now</div>
              </div>
              <div className="stat-card">
                <h3>👥 Total Visits</h3>
                <div className="stat-number">{stats.totalVisitors}</div>
                <div className="stat-label">Total Visitors</div>
              </div>
              <div className="stat-card">
                <h3>🎯 Unique Visitors</h3>
                <div className="stat-number">{stats.uniqueVisitors}</div>
                <div className="stat-label">Unique Users</div>
              </div>
              <div className="stat-card">
                <h3>⏱️ Avg Session</h3>
                <div className="stat-number">{formatDuration(stats.averageSessionDuration)}</div>
                <div className="stat-label">Session Duration</div>
              </div>
              <div className="stat-card">
                <h3>📄 Pages/Session</h3>
                <div className="stat-number">{stats.averagePageViews.toFixed(1)}</div>
                <div className="stat-label">Avg Page Views</div>
              </div>
              <div className="stat-card">
                <h3>📈 Bounce Rate</h3>
                <div className="stat-number">{stats.bounceRate.toFixed(1)}%</div>
                <div className="stat-label">Single Page Visits</div>
              </div>
            </div>
          )}

          <div className="analytics-content">
            {/* Charts and Graphs Section */}
            <div className="charts-section">
              {stats && (
                <>
                  <div className="chart-card">
                    <h3>🌍 Top Countries</h3>
                    <div className="country-list">
                      {stats.topCountries.map((country) => (
                        <div key={country.country} className="country-item">
                          <span className="country-name">{country.country}</span>
                          <span className="country-count">{country.count}</span>
                          <div className="country-bar" style={{
                            width: `${(country.count / stats.topCountries[0].count) * 100}%`
                          }}></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>📱 Device Types</h3>
                    <div className="device-chart">
                      {stats.deviceTypes.map(device => (
                        <div key={device.type} className="device-item">
                          <span>{device.type}</span>
                          <span>{device.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>🌐 Top Browsers</h3>
                    <div className="browser-list">
                      {stats.browsers.map(browser => (
                        <div key={browser.browser} className="browser-item">
                          <span>{browser.browser}</span>
                          <span>{browser.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Individual Visitor Details */}
            <div className="visitors-section">
              <h3>👤 Individual Visitors</h3>
              <div className="visitors-table">
                <div className="table-header">
                  <span>Timestamp</span>
                  <span>IP Address</span>
                  <span>ISP/Organization</span>
                  <span>Location</span>
                  <span>Device</span>
                  <span>Duration</span>
                  <span>Actions</span>
                </div>
                {visitors.slice(0, 50).map(visitor => (
                  <div key={visitor.id + visitor.timestamp} className="visitor-row">
                    <span>{new Date(visitor.timestamp).toLocaleString()}</span>
                    <span>{visitor.ip || 'Unknown'}</span>
                    <span>{visitor.location.isp || visitor.location.org || 'Unknown'}</span>
                    <span>{formatLocation(visitor)}</span>
                    <span>{visitor.device.type} - {visitor.device.browser}</span>
                    <span>{formatDuration(visitor.session.duration)}</span>
                    <button onClick={() => setSelectedVisitor(visitor)}>View Details</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visitor Detail Modal */}
          {selectedVisitor && (
            <div className="visitor-detail-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>👤 Visitor Details</h2>
                  <button onClick={() => setSelectedVisitor(null)}>✕</button>
                </div>
                <div className="visitor-details">
                  <div className="detail-section">
                    <h3>📍 Location & Network</h3>
                    <p><strong>IP Address:</strong> {selectedVisitor.ip || 'Unknown'}</p>
                    <p><strong>ISP/Organization:</strong> {selectedVisitor.location.isp || selectedVisitor.location.org || 'Unknown'}</p>
                    <p><strong>Network AS:</strong> {selectedVisitor.location.as || 'Unknown'}</p>
                    <p><strong>Country:</strong> {selectedVisitor.location.country || 'Unknown'}</p>
                    <p><strong>Region:</strong> {selectedVisitor.location.region || 'Unknown'}</p>
                    <p><strong>City:</strong> {selectedVisitor.location.city || 'Unknown'}</p>
                    <p><strong>Timezone:</strong> {selectedVisitor.location.timezone || 'Unknown'}</p>
                    <p><strong>Coordinates:</strong> {selectedVisitor.location.lat && selectedVisitor.location.lon ? 
                      `${selectedVisitor.location.lat}, ${selectedVisitor.location.lon}` : 'Unknown'}</p>
                  </div>

                  <div className="detail-section">
                    <h3>💻 Device & Browser</h3>
                    <p><strong>Device Type:</strong> {selectedVisitor.device.type}</p>
                    <p><strong>Operating System:</strong> {selectedVisitor.device.os}</p>
                    <p><strong>Browser:</strong> {selectedVisitor.device.browser}</p>
                    <p><strong>Screen Resolution:</strong> {selectedVisitor.device.screenResolution}</p>
                    <p><strong>User Agent:</strong> {selectedVisitor.userAgent}</p>
                  </div>

                  <div className="detail-section">
                    <h3>📊 Session Data</h3>
                    <p><strong>Session ID:</strong> {selectedVisitor.session.sessionId}</p>
                    <p><strong>New Session:</strong> {selectedVisitor.session.isNewSession ? 'Yes' : 'No'}</p>
                    <p><strong>Duration:</strong> {formatDuration(selectedVisitor.session.duration)}</p>
                    <p><strong>Page Views:</strong> {selectedVisitor.session.pageViews}</p>
                    <p><strong>Referrer:</strong> {selectedVisitor.session.referrer || 'Direct'}</p>
                    <p><strong>Entry Page:</strong> {selectedVisitor.session.entryPage}</p>
                    <p><strong>Exit Page:</strong> {selectedVisitor.session.exitPage || 'Still browsing'}</p>
                  </div>

                  <div className="detail-section">
                    <h3>🎯 Engagement</h3>
                    <p><strong>Time on Site:</strong> {formatDuration(selectedVisitor.engagement.timeOnSite)}</p>
                    <p><strong>Scroll Depth:</strong> {selectedVisitor.engagement.scrollDepth}%</p>
                    <p><strong>Clicks:</strong> {selectedVisitor.engagement.clickCount}</p>
                    <p><strong>Tab Switches:</strong> {selectedVisitor.engagement.tabSwitches}</p>
                    <p><strong>Last Active:</strong> {new Date(selectedVisitor.engagement.lastActiveTime).toLocaleString()}</p>
                  </div>

                  <div className="detail-section">
                    <h3>⚙️ Technical Details</h3>
                    <p><strong>Language:</strong> {selectedVisitor.technicalData.language}</p>
                    <p><strong>Color Depth:</strong> {selectedVisitor.technicalData.colorDepth}-bit</p>
                    <p><strong>Pixel Ratio:</strong> {selectedVisitor.technicalData.pixelRatio}x</p>
                    <p><strong>Cookies:</strong> {selectedVisitor.technicalData.cookiesEnabled ? 'Enabled' : 'Disabled'}</p>
                    <p><strong>JavaScript:</strong> {selectedVisitor.technicalData.javaScriptEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;