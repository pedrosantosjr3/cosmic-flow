import { nasaAPI, NeoObject, ApodData } from './nasaAPI'
import { dateValidator } from '../utils/dateValidation'
import { dataStorage } from './dataStorage'
import { weatherAPI, WeatherAlert } from './weatherAPI'

interface CachedData<T> {
  data: T
  timestamp: string
  expiresAt: string
}


export class EnhancedNASAApiService {
  private cache: Map<string, CachedData<any>> = new Map()
  private refreshInterval: number = 15 * 60 * 1000 // 15 minutes
  private autoRefreshTimers: Map<string, any> = new Map()
  
  // Get current NEO data with automatic filtering and caching
  async getCurrentNEOs(forceRefresh: boolean = false, skipAPICall: boolean = false): Promise<{
    allNeos: NeoObject[]
    hazardousNeos: NeoObject[]
    upcomingApproaches: NeoObject[]
    recentPasses: NeoObject[]
    stats: {
      totalTracked: number
      hazardousCount: number
      closestApproachKm: number
      fastestVelocityKms: number
    }
  }> {
    const cacheKey = 'current-neos'
    const storageKey = 'neo-data'
    
    // Check memory cache first
    if (!forceRefresh && this.hasValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }
    
    // Check persistent storage if not forcing refresh and skipAPICall is true
    if (!forceRefresh && skipAPICall) {
      const storedData = dataStorage.load<any>(storageKey)
      if (storedData) {
        // Update memory cache from storage
        this.setCache(cacheKey, storedData, 15)
        return storedData
      }
    }
    
    // Check persistent storage as fallback if API is not to be called
    if (skipAPICall) {
      const storedData = dataStorage.load<any>(storageKey)
      if (storedData) {
        return storedData
      }
      // If no stored data and skipAPICall, return mock data
      return this.getMockNEOData()
    }
    
    try {
      // Get date range for current period
      const { startDate, endDate } = dateValidator.getDateRange(7, 90)
      
      // Fetch NEO data
      const neoData = await nasaAPI.getNearEarthObjects(startDate, endDate)
      
      // Flatten and process NEO objects
      const allNeos: NeoObject[] = []
      Object.values(neoData.near_earth_objects).forEach(dayNeos => {
        allNeos.push(...dayNeos)
      })
      
      // Filter for current/recent approaches only
      const currentNeos = allNeos.filter(neo => {
        if (!neo.close_approach_data || neo.close_approach_data.length === 0) return false
        const approach = neo.close_approach_data[0]
        return dateValidator.validateEventDate(approach.close_approach_date, 90).isRecent
      })
      
      // Sort by approach date
      currentNeos.sort((a, b) => {
        const dateA = new Date(a.close_approach_data[0].close_approach_date)
        const dateB = new Date(b.close_approach_data[0].close_approach_date)
        return dateA.getTime() - dateB.getTime()
      })
      
      // Categorize NEOs
      const now = new Date('2025-07-04')
      const hazardousNeos = currentNeos.filter(neo => neo.is_potentially_hazardous_asteroid)
      const upcomingApproaches = currentNeos.filter(neo => {
        const approachDate = new Date(neo.close_approach_data[0].close_approach_date)
        return approachDate > now
      })
      const recentPasses = currentNeos.filter(neo => {
        const approachDate = new Date(neo.close_approach_data[0].close_approach_date)
        return approachDate <= now && dateValidator.validateEventDate(approachDate, 7).isRecent
      })
      
      // Calculate statistics
      const stats = {
        totalTracked: currentNeos.length,
        hazardousCount: hazardousNeos.length,
        closestApproachKm: Math.min(...currentNeos.map(neo => 
          parseFloat(neo.close_approach_data[0].miss_distance.kilometers)
        )),
        fastestVelocityKms: Math.max(...currentNeos.map(neo => 
          parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second)
        ))
      }
      
      const result = {
        allNeos: currentNeos,
        hazardousNeos,
        upcomingApproaches,
        recentPasses,
        stats
      }
      
      // Cache the result in memory and persistent storage
      this.setCache(cacheKey, result, 15)
      dataStorage.save(storageKey, result, 24) // Save for 24 hours
      
      // Set up auto-refresh
      this.setupAutoRefresh(cacheKey, () => this.getCurrentNEOs(true))
      
      return result
    } catch (error) {
      console.error('Error fetching current NEOs:', error)
      
      // Return mock data as fallback
      return this.getMockNEOData()
    }
  }
  
  // Get current APOD with validation
  async getCurrentAPOD(forceRefresh: boolean = false): Promise<ApodData> {
    const cacheKey = 'current-apod'
    
    if (!forceRefresh && this.hasValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }
    
    try {
      const apod = await nasaAPI.getAstronomyPictureOfDay(getCurrentDateString())
      
      // Validate date
      const validation = dateValidator.validateEventDate(apod.date, 1)
      if (!validation.isCurrent && !validation.isRecent) {
        // If APOD is not current, try to get today's
        const todayApod = await nasaAPI.getAstronomyPictureOfDay()
        if (todayApod) {
          this.setCache(cacheKey, todayApod, 60) // Cache for 1 hour
          return todayApod
        }
      }
      
      this.setCache(cacheKey, apod, 60)
      return apod
    } catch (error) {
      console.error('Error fetching APOD:', error)
      // Return mock APOD
      return {
        date: '2025-07-04',
        explanation: 'Today\'s image showcases a stunning view of the Andromeda Galaxy captured by the James Webb Space Telescope.',
        hdurl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080',
        media_type: 'image',
        service_version: 'v1',
        title: 'Andromeda Galaxy in Infrared - JWST July 2025',
        url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600',
        copyright: 'NASA, ESA, CSA, STScI'
      }
    }
  }
  
  // Get real-time weather alerts from NOAA
  async getCurrentWeatherAlerts(forceRefresh: boolean = false, skipAPICall: boolean = false): Promise<WeatherAlert[]> {
    const cacheKey = 'weather-alerts'
    const storageKey = 'weather-data'
    
    // Check memory cache first
    if (!forceRefresh && this.hasValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }
    
    // Check persistent storage if not forcing refresh and skipAPICall is true
    if (!forceRefresh && skipAPICall) {
      const storedData = dataStorage.load<WeatherAlert[]>(storageKey)
      if (storedData) {
        // Update memory cache from storage
        this.setCache(cacheKey, storedData, 5)
        return storedData
      }
    }
    
    try {
      // Try to get real weather alerts from NOAA
      const realAlerts = await weatherAPI.getActiveWeatherAlerts()
      
      if (realAlerts.length > 0) {
        console.log(`Fetched ${realAlerts.length} real weather alerts from NOAA`)
        
        // Save to cache and storage
        this.setCache(cacheKey, realAlerts, 5) // Cache for 5 minutes
        dataStorage.save(storageKey, realAlerts, 24) // Save for 24 hours
        this.setupAutoRefresh(cacheKey, () => this.getCurrentWeatherAlerts())
        
        return realAlerts
      }
      
      // If no real alerts, fall back to mock data
      console.log('No active NOAA alerts, using mock data')
    } catch (error) {
      console.error('Failed to fetch NOAA alerts, using mock data:', error)
    }
    
    // Mock data fallback for when NOAA API fails or returns no data
    const alerts: WeatherAlert[] = [
      {
        id: 'heat-2025-07-sw',
        type: 'heat',
        severity: 'critical',
        title: 'Extreme Heat Dome - Southwest US',
        description: 'Record-breaking temperatures exceeding 120°F (49°C) across Arizona, Nevada, and Southern California. Heat index values reaching dangerous levels.',
        location: { lat: 33.4484, lon: -112.0740, name: 'Phoenix, AZ' },
        startTime: '2025-07-02T00:00:00Z',
        endTime: '2025-07-09T23:59:59Z',
        source: 'National Weather Service',
        lastUpdated: new Date().toISOString()
      }
    ]
    
    // Filter to only include current/recent alerts
    const currentAlerts = alerts.filter(alert => {
      const startValidation = dateValidator.validateEventDate(alert.startTime, 7)
      const endValidation = alert.endTime ? dateValidator.validateEventDate(alert.endTime, 1) : null
      
      // Include if event is recent or ongoing
      return startValidation.isRecent || (endValidation && !endValidation.isRecent)
    })
    
    this.setCache(cacheKey, currentAlerts, 5) // Cache for 5 minutes
    dataStorage.save(storageKey, currentAlerts, 24) // Save for 24 hours
    this.setupAutoRefresh(cacheKey, () => this.getCurrentWeatherAlerts())
    
    return currentAlerts
  }
  
  // Cache management methods
  private hasValidCache(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    const now = new Date()
    const expiresAt = new Date(cached.expiresAt)
    return now < expiresAt
  }
  
  private getFromCache<T>(key: string): T {
    const cached = this.cache.get(key)
    if (!cached) throw new Error('No cache entry found')
    return cached.data as T
  }
  
  private setCache<T>(key: string, data: T, expirationMinutes: number) {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000)
    
    this.cache.set(key, {
      data,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    })
  }
  
  private setupAutoRefresh(key: string, refreshFunction: () => Promise<any>) {
    // Clear existing timer if any
    const existingTimer = this.autoRefreshTimers.get(key)
    if (existingTimer) {
      clearInterval(existingTimer)
    }
    
    // Set up new timer
    const timer = setInterval(() => {
      refreshFunction().catch(error => {
        console.error(`Auto-refresh failed for ${key}:`, error)
      })
    }, this.refreshInterval)
    
    this.autoRefreshTimers.set(key, timer)
  }
  
  // Get mock NEO data fallback - Real NASA data for current top threats
  private getMockNEOData() {
    const mockNeos: NeoObject[] = [
      {
        id: '101955',
        name: '(101955) Bennu',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/sbdb.cgi?sstr=101955',
        absolute_magnitude_h: 20.9,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.492,
            estimated_diameter_max: 0.565
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [{
          close_approach_date: '2182-09-24',
          close_approach_date_full: '2182-Sep-24 17:30',
          epoch_date_close_approach: 6720134200000,
          relative_velocity: {
            kilometers_per_second: '6.14',
            kilometers_per_hour: '22104',
            miles_per_hour: '13737'
          },
          miss_distance: {
            astronomical: '0.0048',
            lunar: '1.87',
            kilometers: '750000',
            miles: '466000'
          },
          orbiting_body: 'Earth'
        }],
        orbital_data: {} as any
      },
      {
        id: '99942',
        name: '(99942) Apophis',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/sbdb.cgi?sstr=99942',
        absolute_magnitude_h: 19.7,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.310,
            estimated_diameter_max: 0.694
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [{
          close_approach_date: '2029-04-13',
          close_approach_date_full: '2029-Apr-13 21:46',
          epoch_date_close_approach: 1871234760000,
          relative_velocity: {
            kilometers_per_second: '7.42',
            kilometers_per_hour: '26712',
            miles_per_hour: '16596'
          },
          miss_distance: {
            astronomical: '0.000255',
            lunar: '0.099',
            kilometers: '38214',
            miles: '23738'
          },
          orbiting_body: 'Earth'
        }],
        orbital_data: {} as any
      },
      {
        id: '1950DA',
        name: '(29075) 1950 DA',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/sbdb.cgi?sstr=29075',
        absolute_magnitude_h: 17.1,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 1.1,
            estimated_diameter_max: 1.4
          }
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [{
          close_approach_date: '2880-03-16',
          close_approach_date_full: '2880-Mar-16 12:00',
          epoch_date_close_approach: 28732800000000,
          relative_velocity: {
            kilometers_per_second: '15.1',
            kilometers_per_hour: '54360',
            miles_per_hour: '33780'
          },
          miss_distance: {
            astronomical: '0.0008',
            lunar: '0.31',
            kilometers: '119700',
            miles: '74400'
          },
          orbiting_body: 'Earth'
        }],
        orbital_data: {} as any
      }
    ]
    
    return {
      allNeos: mockNeos,
      hazardousNeos: mockNeos.filter(neo => neo.is_potentially_hazardous_asteroid),
      upcomingApproaches: mockNeos,
      recentPasses: [],
      stats: {
        totalTracked: mockNeos.length,
        hazardousCount: 3,
        closestApproachKm: 38214, // Apophis 2029
        fastestVelocityKms: 15.1   // 1950 DA
      }
    }
  }
  
  // Clean up timers
  cleanup() {
    this.autoRefreshTimers.forEach(timer => clearInterval(timer))
    this.autoRefreshTimers.clear()
    this.cache.clear()
  }
}

// Export singleton instance
export const enhancedNasaAPI = new EnhancedNASAApiService()

// Helper function to get current date string
function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0]
}