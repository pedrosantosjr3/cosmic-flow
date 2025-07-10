import React from 'react';
import { SevereWeatherEvent } from '../../services/severeWeatherAPI';
import './EarthWeather.css';

interface WeatherAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  startTime: string;
  endTime?: string;
  source: string;
  lastUpdated: string;
}

interface EarthWeatherProps {
  weatherAlerts: WeatherAlert[];
  severeWeatherEvents: SevereWeatherEvent[];
  weatherLastUpdated: string;
}

const EarthWeather: React.FC<EarthWeatherProps> = ({
  weatherAlerts,
  severeWeatherEvents,
  weatherLastUpdated
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'catastrophic': return '🚨';
      case 'major': return '⚠️';
      case 'moderate': return '🟡';
      default: return 'ℹ️';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hurricane': return '🌪️';
      case 'tornado': return '🌪️';
      case 'flooding': return '🌊';
      case 'wildfire': return '🔥';
      case 'heat': return '🌡️';
      case 'winter': return '❄️';
      case 'drought': return '🏜️';
      case 'earthquake': return '🌍';
      default: return '⛈️';
    }
  };

  return (
    <div className="earth-weather">
      <div className="weather-header">
        <h2>🌍 Real-Time Earth Weather Analysis</h2>
        <p>Live meteorological monitoring with satellite imagery and severe weather tracking</p>
        {weatherLastUpdated && (
          <div className="update-status">
            Last updated: {formatTime(weatherLastUpdated)}
          </div>
        )}
      </div>
      
      <div className="weather-dashboard">
        <div className="earth-visualization">
          <div className="earth-globe">
            <div className="real-earth-satellite">
              <img 
                src="https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg" 
                alt="Real-time Earth from GOES-16" 
                className="earth-satellite-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://cdn.star.nesdis.noaa.gov/GOES18/ABI/FD/GEOCOLOR/1808x1808.jpg';
                }}
              />
              <div className="satellite-overlay">
                <div className="live-data-badge">🛰️ GOES-16 East Live</div>
                <div className="earth-stats">
                  <div className="stat">🌍 Full Disk | 📡 GeoColor Enhanced</div>
                  <div className="stat">⏰ Updated every 10 minutes</div>
                  <div className="stat">📊 Resolution: 0.5km visible</div>
                </div>
              </div>
            </div>

            {/* Dynamic weather overlay markers based on severe events */}
            <div className="weather-overlay">
              {severeWeatherEvents.slice(0, 5).map((event, index) => (
                <div 
                  key={event.id}
                  className={`storm-marker ${event.type}`} 
                  style={{
                    top: `${35 + index * 8}%`, 
                    left: `${25 + index * 15}%`
                  }}
                >
                  <div className="storm-icon pulse">{getEventIcon(event.type)}</div>
                  <div className="storm-info">
                    <strong>{event.title}</strong>
                    <span>{event.coordinates.lat.toFixed(1)}°N, {Math.abs(event.coordinates.lon).toFixed(1)}°W</span>
                    <span>{event.status} - {event.impact.deaths > 0 ? `${event.impact.deaths} deaths` : 'Active'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="weather-panels">
          <div className="severe-weather-panel">
            <div className="panel-header">
              <h3>🚨 Severe Weather Events</h3>
              <div className="live-indicator">🔴 LIVE</div>
            </div>
            
            {severeWeatherEvents.length === 0 ? (
              <div className="no-events">
                <p>✅ No severe weather events currently active</p>
                <p>Monitoring systems operational</p>
              </div>
            ) : (
              <div className="severe-alerts">
                {severeWeatherEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="emergency-bar">
                    <div className="emergency-icon">
                      {getSeverityIcon(event.severity)} {getEventIcon(event.type)}
                    </div>
                    <div className="emergency-content">
                      <h4>{event.title.toUpperCase()}</h4>
                      <p className="event-location">{event.location}</p>
                      <p className="event-description">{event.description}</p>
                      
                      {(event.impact.deaths > 0 || event.impact.injuries > 0 || event.impact.displaced > 0) && (
                        <div className="emergency-stats">
                          {event.impact.deaths > 0 && (
                            <span className="stat-critical">💀 Deaths: {event.impact.deaths}</span>
                          )}
                          {event.impact.injuries > 0 && (
                            <span className="stat-warning">🏥 Injured: {event.impact.injuries}</span>
                          )}
                          {event.impact.displaced > 0 && (
                            <span className="stat-info">🏠 Displaced: {event.impact.displaced.toLocaleString()}</span>
                          )}
                          {event.impact.economicLoss > 0 && (
                            <span className="stat-info">💰 Loss: ${event.impact.economicLoss}M</span>
                          )}
                        </div>
                      )}
                      
                      <span className="alert-time">
                        🕐 Updated {formatTime(event.lastUpdated)} | Source: {event.sources[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="weather-alerts-panel">
            <div className="panel-header">
              <h3>⚠️ Weather Alerts</h3>
              <div className="alert-count">{weatherAlerts.length} Active</div>
            </div>
            
            {weatherAlerts.length === 0 ? (
              <div className="no-alerts">
                <p>✅ No weather alerts currently active</p>
              </div>
            ) : (
              <div className="alert-list">
                {weatherAlerts.slice(0, 8).map((alert) => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <div className="alert-header">
                      <span className="alert-type">{getEventIcon(alert.type)}</span>
                      <h4>{alert.title}</h4>
                      <span className={`severity-badge ${alert.severity}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="alert-content">
                      <p className="alert-location">📍 {alert.location.name}</p>
                      <p className="alert-description">{alert.description}</p>
                      <div className="alert-meta">
                        <span>🕐 {formatTime(alert.lastUpdated)}</span>
                        <span>📡 {alert.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthWeather;