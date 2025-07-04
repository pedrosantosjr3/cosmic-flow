import axios from 'axios'

const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY'
const NASA_BASE_URL = 'https://api.nasa.gov'

export interface APODData {
  date: string
  explanation: string
  hdurl?: string
  media_type: string
  service_version: string
  title: string
  url: string
  copyright?: string
}

export interface NearEarthObject {
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
  }>
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
  }
}

class NasaAPI {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = NASA_API_KEY
    this.baseUrl = NASA_BASE_URL
  }

  async getAPOD(date?: string): Promise<APODData> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        ...(date && { date })
      })

      const response = await axios.get(`${this.baseUrl}/planetary/apod?${params}`)
      return response.data
    } catch (error) {
      console.error('Error fetching APOD:', error)
      throw new Error('Failed to fetch Astronomy Picture of the Day')
    }
  }

  async getNearEarthObjects(startDate: string, endDate: string): Promise<NearEarthObject[]> {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        api_key: this.apiKey
      })

      const response = await axios.get(`${this.baseUrl}/neo/rest/v1/feed?${params}`)
      const neoData = response.data.near_earth_objects

      const allObjects: NearEarthObject[] = []
      Object.values(neoData).forEach((dayObjects: any) => {
        allObjects.push(...dayObjects)
      })

      return allObjects
    } catch (error) {
      console.error('Error fetching Near Earth Objects:', error)
      throw new Error('Failed to fetch Near Earth Objects')
    }
  }

  async getEarthImagery(date?: string): Promise<EarthImageData[]> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        ...(date && { date })
      })

      const response = await axios.get(`${this.baseUrl}/EPIC/api/natural/date/${date || 'latest'}?${params}`)
      return response.data
    } catch (error) {
      console.error('Error fetching Earth imagery:', error)
      throw new Error('Failed to fetch Earth imagery')
    }
  }

  async getMarsRoverPhotos(sol: number = 1000, rover: string = 'curiosity'): Promise<any> {
    try {
      const params = new URLSearchParams({
        sol: sol.toString(),
        api_key: this.apiKey
      })

      const response = await axios.get(`${this.baseUrl}/mars-photos/api/v1/rovers/${rover}/photos?${params}`)
      return response.data.photos
    } catch (error) {
      console.error('Error fetching Mars rover photos:', error)
      throw new Error('Failed to fetch Mars rover photos')
    }
  }

  async getSpaceWeatherData(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/DONKI/notifications?api_key=${this.apiKey}`)
      return response.data
    } catch (error) {
      console.error('Error fetching space weather data:', error)
      throw new Error('Failed to fetch space weather data')
    }
  }

  async getExoplanetData(): Promise<any> {
    try {
      const response = await axios.get('https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,discoverymethod,disc_year,pl_orbper,pl_bmassj,pl_radj+from+pscomppars+where+default_flag=1&format=json')
      return response.data
    } catch (error) {
      console.error('Error fetching exoplanet data:', error)
      throw new Error('Failed to fetch exoplanet data')
    }
  }

  getEarthImageUrl(date: string, imageType: string = 'natural'): string {
    return `${this.baseUrl}/EPIC/archive/${imageType}/${date.replace(/-/g, '/')}/png`
  }

  async searchImages(query: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&media_type=image`)
      return response.data
    } catch (error) {
      console.error('Error searching NASA images:', error)
      throw new Error('Failed to search NASA images')
    }
  }
}

export const nasaApi = new NasaAPI()
export default NasaAPI