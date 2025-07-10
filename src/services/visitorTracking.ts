interface VisitorData {
  id: string;
  timestamp: string;
  ip?: string;
  userAgent: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    lat?: number;
    lon?: number;
    isp?: string;
    org?: string;
    as?: string;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    screenResolution: string;
  };
  session: {
    sessionId: string;
    isNewSession: boolean;
    duration: number;
    pageViews: number;
    referrer?: string;
    entryPage: string;
    exitPage?: string;
  };
  engagement: {
    timeOnSite: number;
    scrollDepth: number;
    clickCount: number;
    tabSwitches: number;
    lastActiveTime: string;
  };
  technicalData: {
    connectionSpeed?: string;
    language: string;
    colorDepth: number;
    pixelRatio: number;
    cookiesEnabled: boolean;
    javaScriptEnabled: boolean;
  };
}

interface PageVisit {
  page: string;
  timestamp: string;
  timeSpent: number;
  scrollDepth: number;
  interactions: number;
}

class VisitorTrackingService {
  private visitorId: string;
  private sessionId: string;
  private startTime: number;
  private lastActivityTime: number;
  private pageViews: PageVisit[] = [];
  private currentPage: string;
  private scrollDepth: number = 0;
  private clickCount: number = 0;
  private tabSwitches: number = 0;

  constructor() {
    this.visitorId = this.generateVisitorId();
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    this.currentPage = window.location.pathname;
    this.initializeTracking();
  }

  private generateVisitorId(): string {
    // Check if visitor already exists in localStorage
    let visitorId = localStorage.getItem('cosmic-flow-visitor-id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cosmic-flow-visitor-id', visitorId);
    }
    return visitorId;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async getLocationData(): Promise<any> {
    try {
      // Try multiple IP services for better data
      const services = [
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://api.ipdata.co?api-key=test' // test key for basic data
      ];
      
      for (const service of services) {
        try {
          const response = await fetch(service);
          if (response.ok) {
            const data = await response.json();
            
            // Normalize data from different services
            return {
              ip: data.ip,
              country_name: data.country_name || data.country,
              region: data.region || data.region_name,
              city: data.city,
              timezone: data.timezone || data.time_zone?.name,
              latitude: data.latitude || data.loc?.split(',')[0],
              longitude: data.longitude || data.loc?.split(',')[1],
              org: data.org || data.organisation || data.company?.name,
              isp: data.isp || data.asn?.name,
              asn: data.asn || data.as
            };
          }
        } catch (err) {
          continue; // Try next service
        }
      }
    } catch (error) {
      console.log('Location data unavailable');
    }
    return {};
  }

  private getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    // Detect device type
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobi|Android/i.test(userAgent)) deviceType = 'mobile';
    else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'tablet';

    // Detect OS
    let os = 'Unknown';
    if (userAgent.indexOf('Windows') !== -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) os = 'Android';
    else if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'iOS';

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
    else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
    else if (userAgent.indexOf('Opera') !== -1) browser = 'Opera';

    return {
      type: deviceType,
      os,
      browser,
      screenResolution: `${screen.width}x${screen.height}`
    };
  }

  private initializeTracking() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.scrollDepth = maxScroll;
      }
      this.lastActivityTime = Date.now();
    });

    // Track clicks
    document.addEventListener('click', () => {
      this.clickCount++;
      this.lastActivityTime = Date.now();
    });

    // Track tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.tabSwitches++;
      } else {
        this.lastActivityTime = Date.now();
      }
    });

    // Track page changes (for SPAs)
    window.addEventListener('popstate', () => {
      this.trackPageVisit();
      this.currentPage = window.location.pathname;
    });

    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      this.trackPageVisit();
      this.sendVisitorData();
    });

    // Send data periodically
    setInterval(() => {
      this.sendVisitorData();
    }, 30000); // Every 30 seconds
  }

  private trackPageVisit() {
    if (this.currentPage) {
      this.pageViews.push({
        page: this.currentPage,
        timestamp: new Date().toISOString(),
        timeSpent: Date.now() - this.startTime,
        scrollDepth: this.scrollDepth,
        interactions: this.clickCount
      });
    }
  }

  public async sendVisitorData() {
    try {
      const locationData = await this.getLocationData();
      const deviceInfo = this.getDeviceInfo();

      const visitorData: VisitorData = {
        id: this.visitorId,
        timestamp: new Date().toISOString(),
        ip: locationData.ip,
        userAgent: navigator.userAgent,
        location: {
          country: locationData.country_name,
          region: locationData.region,
          city: locationData.city,
          timezone: locationData.timezone,
          lat: locationData.latitude,
          lon: locationData.longitude,
          isp: locationData.org || locationData.isp,
          org: locationData.org,
          as: locationData.asn
        },
        device: deviceInfo,
        session: {
          sessionId: this.sessionId,
          isNewSession: !localStorage.getItem('cosmic-flow-session'),
          duration: Date.now() - this.startTime,
          pageViews: this.pageViews.length,
          referrer: document.referrer,
          entryPage: this.pageViews[0]?.page || window.location.pathname,
          exitPage: this.currentPage
        },
        engagement: {
          timeOnSite: Date.now() - this.startTime,
          scrollDepth: this.scrollDepth,
          clickCount: this.clickCount,
          tabSwitches: this.tabSwitches,
          lastActiveTime: new Date(this.lastActivityTime).toISOString()
        },
        technicalData: {
          language: navigator.language,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio,
          cookiesEnabled: navigator.cookieEnabled,
          javaScriptEnabled: true
        }
      };

      // Store in localStorage as backup
      this.storeLocally(visitorData);

      // Send to your backend (you'll need to implement this endpoint)
      await this.sendToBackend(visitorData);

      // Mark session as tracked
      localStorage.setItem('cosmic-flow-session', this.sessionId);

    } catch (error) {
      console.error('Failed to send visitor data:', error);
    }
  }

  private storeLocally(data: VisitorData) {
    const key = `visitor-data-${data.timestamp}`;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Clean up old entries (keep last 100)
    const keys = Object.keys(localStorage).filter(k => k.startsWith('visitor-data-'));
    if (keys.length > 100) {
      keys.sort();
      keys.slice(0, keys.length - 100).forEach(k => localStorage.removeItem(k));
    }
  }

  private async sendToBackend(data: VisitorData) {
    // Option 1: Send to your own backend
    try {
      await fetch('/api/analytics/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      // Fallback: Send to a third-party service like Google Analytics, Mixpanel, etc.
      console.log('Backend unavailable, data stored locally');
    }
  }

  // Method to change page tracking for SPA navigation
  public trackPageChange(newPage: string) {
    this.trackPageVisit();
    this.currentPage = newPage;
    this.startTime = Date.now();
    this.scrollDepth = 0;
    this.clickCount = 0;
  }

  // Get current session data
  public getCurrentSessionData() {
    return {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      timeOnSite: Date.now() - this.startTime,
      pageViews: this.pageViews.length,
      scrollDepth: this.scrollDepth,
      clickCount: this.clickCount
    };
  }
}

export const visitorTracker = new VisitorTrackingService();
export type { VisitorData, PageVisit };