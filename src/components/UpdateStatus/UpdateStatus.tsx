import React, { useState, useEffect } from 'react';
import { dataStorage } from '../../services/dataStorage';
import { dataUpdateScheduler } from '../../services/dataUpdateScheduler';
import './UpdateStatus.css';

interface UpdateInfo {
  name: string;
  lastUpdate: Date | null;
  nextUpdate: Date | null;
  storageKey: string;
  taskId: string;
}

const UpdateStatus: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUpdateInfo();
    const interval = setInterval(loadUpdateInfo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadUpdateInfo = () => {
    const scheduleInfo = dataUpdateScheduler.getScheduleInfo();
    
    const info: UpdateInfo[] = [
      {
        name: 'NEO Tracker',
        lastUpdate: dataStorage.getLastUpdateTime('neo-data'),
        nextUpdate: scheduleInfo.find(s => s.id === 'neo-update')?.nextRun || null,
        storageKey: 'neo-data',
        taskId: 'neo-update'
      },
      {
        name: 'Earth Weather',
        lastUpdate: dataStorage.getLastUpdateTime('weather-data'),
        nextUpdate: scheduleInfo.find(s => s.id === 'weather-update')?.nextRun || null,
        storageKey: 'weather-data',
        taskId: 'weather-update'
      }
    ];
    
    setUpdateInfo(info);
  };

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const formatTimeUntil = (date: Date | null): string => {
    if (!date) return 'Not scheduled';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    return 'Soon';
  };

  const handleForceUpdate = async (taskId: string) => {
    setIsUpdating(taskId);
    try {
      await dataUpdateScheduler.forceUpdate(taskId);
      // Wait a bit for the update to complete
      setTimeout(() => {
        loadUpdateInfo();
        setIsUpdating(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to force update:', error);
      setIsUpdating(null);
    }
  };

  return (
    <div className={`update-status-container ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="update-status-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="View update status"
      >
        <span className="update-icon">🔄</span>
        <span className="update-label">Updates</span>
      </button>
      
      {isExpanded && (
        <div className="update-status-panel">
          <h3>Data Update Status</h3>
          
          {updateInfo.map(info => (
            <div key={info.taskId} className="update-item">
              <div className="update-header">
                <h4>{info.name}</h4>
                <button
                  className={`update-refresh ${isUpdating === info.taskId ? 'updating' : ''}`}
                  onClick={() => handleForceUpdate(info.taskId)}
                  disabled={isUpdating !== null}
                  title="Force update now"
                >
                  {isUpdating === info.taskId ? '⏳' : '🔄'}
                </button>
              </div>
              
              <div className="update-details">
                <div className="update-row">
                  <span className="update-label">Last updated:</span>
                  <span className="update-value">{formatTimeAgo(info.lastUpdate)}</span>
                </div>
                <div className="update-row">
                  <span className="update-label">Next update:</span>
                  <span className="update-value">{formatTimeUntil(info.nextUpdate)}</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="update-footer">
            <p>Data updates automatically</p>
            <p className="update-note">NEO: Daily • Weather: Every 6 hours</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateStatus;