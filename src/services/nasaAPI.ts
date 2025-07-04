import axios from 'axios'

// NASA API configuration
const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY'
const NASA_BASE_URL = 'https://api.nasa.gov'

// Interface definitions for NASA API responses
export interface NeoObject {
  id: string
  name: string
  nasa_jpl_url: string
  absolute_magnitude_h: number
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
  }
  is_potentially_hazardous_asteroid: boolean
  close_approach_data: Array<{
    close_approach_date: string
    close_approach_date_full: string
    epoch_date_close_approach: number
    relative_velocity: {
      kilometers_per_second: string
      kilometers_per_hour: string
      miles_per_hour: string
    }
    miss_distance: {
      astronomical: string
      lunar: string
      kilometers: string
      miles: string
    }
    orbiting_body: string
  }>
  orbital_data: {
    orbit_id: string
    orbit_determination_date: string
    first_observation_date: string
    last_observation_date: string
    data_arc_in_days: number
    observations_used: number
    orbit_uncertainty: string
    minimum_orbit_intersection: string
    jupiter_tisserand_invariant: string
    epoch_osculation: string
    eccentricity: string
    semi_major_axis: string
    inclination: string
    ascending_node_longitude: string
    orbital_period: string
    perihelion_distance: string
    perihelion_argument: string
    aphelion_distance: string
    perihelion_time: string
    mean_anomaly: string
    mean_motion: string
    equinox: string
  }
}

export interface ApodData {
  date: string
  explanation: string
  hdurl?: string
  media_type: string
  service_version: string
  title: string
  url: string
  copyright?: string
}

export interface EarthImageData {
  identifier: string
  caption: string
  image: string
  version: string
  centroid_coordinates: {
    lat: number
    lon: number
  }
  dscovr_j2000_position: {
    x: number
    y: number
    z: number
  }
  lunar_j2000_position: {
    x: number
    y: number
    z: number
  }
  sun_j2000_position: {
    x: number
    y: number
    z: number
  }
  attitude_quaternions: {
    q0: number
    q1: number
    q2: number
    q3: number
  }
  date: string
  coords: {
    centroid_coordinates: {
      lat: number
      lon: number
    }
    dscovr_j2000_position: {
      x: number
      y: number
      z: number
    }
    lunar_j2000_position: {
      x: number
      y: number
      z: number
    }
    sun_j2000_position: {
      x: number
      y: number
      z: number
    }
    attitude_quaternions: {
      q0: number
      q1: number
      q2: number
      q3: number
    }
  }
}

export interface MarsRoverPhoto {
  id: number
  sol: number
  camera: {
    id: number
    name: string
    rover_id: number
    full_name: string
  }
  img_src: string
  earth_date: string
  rover: {
    id: number
    name: string
    landing_date: string
    launch_date: string
    status: string
    max_sol: number
    max_date: string
    total_photos: number
    cameras: Array<{
      name: string
      full_name: string
    }>
  }
}

export interface SolarFlareData {
  flrID: string
  instruments: Array<{
    displayName: string
  }>
  beginTime: string
  peakTime: string
  endTime: string
  classType: string
  sourceLocation: string
  activeRegionNum: number
  linkedEvents: Array<{
    activityID: string
  }>
  note: string
  submissionTime: string
  link: string
}

// NASA API service class
export class NASAApiService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = NASA_API_KEY
    this.baseUrl = NASA_BASE_URL
  }

  // Get Near Earth Objects (NEOs) data
  async getNearEarthObjects(startDate?: string, endDate?: string): Promise<{
    element_count: number
    near_earth_objects: Record<string, NeoObject[]>
  }> {
    try {
      const start = startDate || new Date().toISOString().split('T')[0]
      const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const response = await axios.get(`${this.baseUrl}/neo/rest/v1/feed`, {
        params: {
          start_date: start,
          end_date: end,
          api_key: this.apiKey
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching NEO data:', error)
      throw new Error('Failed to fetch Near Earth Objects data')
    }
  }

  // Get potentially hazardous asteroids
  async getHazardousAsteroids(): Promise<{
    links: any
    page: any
    near_earth_objects: NeoObject[]
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/neo/rest/v1/neo/browse`, {
        params: {
          is_potentially_hazardous: true,
          api_key: this.apiKey
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching hazardous asteroids:', error)
      throw new Error('Failed to fetch hazardous asteroids data')
    }
  }

  // Get Astronomy Picture of the Day
  async getAstronomyPictureOfDay(date?: string): Promise<ApodData> {
    try {
      const response = await axios.get(`${this.baseUrl}/planetary/apod`, {
        params: {
          date,
          api_key: this.apiKey,
          hd: true
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching APOD:', error)
      throw new Error('Failed to fetch Astronomy Picture of the Day')
    }
  }

  // Get Earth images from EPIC
  async getEarthImages(date?: string): Promise<EarthImageData[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      const response = await axios.get(`${this.baseUrl}/EPIC/api/natural/date/${targetDate}`, {
        params: {
          api_key: this.apiKey
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching Earth images:', error)
      throw new Error('Failed to fetch Earth images')
    }
  }

  // Get Mars rover photos
  async getMarsRoverPhotos(rover: string = 'curiosity', sol?: number, earthDate?: string): Promise<{
    photos: MarsRoverPhoto[]
  }> {
    try {
      const params: any = {
        api_key: this.apiKey
      }
      
      if (sol !== undefined) {
        params.sol = sol
      } else if (earthDate) {
        params.earth_date = earthDate
      } else {
        params.sol = 1000 // Default to sol 1000
      }
      
      const response = await axios.get(`${this.baseUrl}/mars-photos/api/v1/rovers/${rover}/photos`, {
        params
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching Mars rover photos:', error)
      throw new Error('Failed to fetch Mars rover photos')
    }
  }

  // Get solar flare data
  async getSolarFlares(startDate?: string, endDate?: string): Promise<SolarFlareData[]> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const end = endDate || new Date().toISOString().split('T')[0]
      
      const response = await axios.get(`${this.baseUrl}/DONKI/FLR`, {
        params: {
          startDate: start,
          endDate: end,
          api_key: this.apiKey
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching solar flares:', error)
      throw new Error('Failed to fetch solar flare data')
    }
  }

  // Get exoplanet data
  async getExoplanets(): Promise<any> {
    try {
      const response = await axios.get('https://exoplanetarchive.ipac.caltech.edu/TAP/sync', {
        params: {
          query: `SELECT pl_name,hostname,disc_year,pl_orbper,pl_bmasse,pl_rade,st_dist 
                  FROM ps WHERE default_flag=1 AND pl_name IS NOT NULL 
                  ORDER BY disc_year DESC`,
          format: 'json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching exoplanet data:', error)
      throw new Error('Failed to fetch exoplanet data')
    }
  }

  // Calculate impact probability for NEO
  calculateImpactProbability(neo: NeoObject): {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    probability: number
    impactDate: string | null
    details: string
  } {
    const closeApproach = neo.close_approach_data[0]
    if (!closeApproach) {
      return {
        riskLevel: 'LOW',
        probability: 0,
        impactDate: null,
        details: 'No close approach data available'
      }
    }

    const missDistance = parseFloat(closeApproach.miss_distance.kilometers)
    const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second)
    const diameter = neo.estimated_diameter.kilometers.estimated_diameter_max
    const isHazardous = neo.is_potentially_hazardous_asteroid

    // Calculate risk factors
    let riskScore = 0
    
    // Distance factor (closer = higher risk)
    if (missDistance < 1000000) riskScore += 40 // Very close
    else if (missDistance < 5000000) riskScore += 20 // Close
    else if (missDistance < 10000000) riskScore += 10 // Moderate distance
    
    // Size factor (larger = higher risk)
    if (diameter > 1) riskScore += 30 // Large asteroid
    else if (diameter > 0.5) riskScore += 20 // Medium asteroid
    else if (diameter > 0.1) riskScore += 10 // Small asteroid
    
    // Velocity factor (faster = higher risk)
    if (velocity > 20) riskScore += 20 // Very fast
    else if (velocity > 15) riskScore += 15 // Fast
    else if (velocity > 10) riskScore += 10 // Moderate speed
    
    // Hazardous designation
    if (isHazardous) riskScore += 10

    const probability = Math.min(riskScore / 100, 0.99) // Cap at 99%

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    if (riskScore > 80) riskLevel = 'CRITICAL'
    else if (riskScore > 60) riskLevel = 'HIGH'
    else if (riskScore > 30) riskLevel = 'MEDIUM'
    else riskLevel = 'LOW'

    return {
      riskLevel,
      probability,
      impactDate: closeApproach.close_approach_date,
      details: `Risk assessment based on distance (${(missDistance / 1000000).toFixed(2)}M km), size (${diameter.toFixed(3)} km), and velocity (${velocity.toFixed(1)} km/s)`
    }
  }

  // Get real-time space weather
  async getSpaceWeather(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/DONKI/notifications`, {
        params: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          type: 'all',
          api_key: this.apiKey
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching space weather:', error)
      throw new Error('Failed to fetch space weather data')
    }
  }
}

// Export singleton instance
export const nasaAPI = new NASAApiService()