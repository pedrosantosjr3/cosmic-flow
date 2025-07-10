interface NOAAAlert {
  id: string
  areaDesc: string
  severity: string
  certainty: string
  urgency: string
  event: string
  headline: string
  description: string
  instruction: string
  response: string
  parameters: {
    AWIPSidentifier?: string[]
    WMOidentifier?: string[]
    NWSheadline?: string[]
    BLOCKCHANNEL?: string[]
    VTEC?: string[]
    eventEndingTime?: string[]
  }
  effective: string
  expires: string
  ends: string
  status: string
  messageType: string
  category: string
  sender: string
  senderName: string
  geometry?: {
    type: string
    coordinates: number[][]
  }
}

interface WeatherAlert {
  id: string
  type: 'heat' | 'storm' | 'fire' | 'flood' | 'hurricane' | 'tornado' | 'winter' | 'other'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  location: {
    lat: number
    lon: number
    name: string
  }
  startTime: string
  endTime?: string
  source: string
  lastUpdated: string
}

class WeatherAPIService {
  private readonly NOAA_API_BASE = 'https://api.weather.gov'
  
  // Map NOAA event types to our simplified types
  private mapEventType(event: string): WeatherAlert['type'] {
    const eventLower = event.toLowerCase()
    
    if (eventLower.includes('heat') || eventLower.includes('excessive heat')) return 'heat'
    if (eventLower.includes('hurricane') || eventLower.includes('tropical')) return 'hurricane'
    if (eventLower.includes('tornado')) return 'tornado'
    if (eventLower.includes('flood') || eventLower.includes('flash flood')) return 'flood'
    if (eventLower.includes('fire') || eventLower.includes('red flag')) return 'fire'
    if (eventLower.includes('winter') || eventLower.includes('snow') || eventLower.includes('ice') || eventLower.includes('freeze')) return 'winter'
    if (eventLower.includes('storm') || eventLower.includes('thunderstorm') || eventLower.includes('severe')) return 'storm'
    
    return 'other'
  }
  
  // Map NOAA severity to our simplified severity
  private mapSeverity(severity: string, certainty: string): WeatherAlert['severity'] {
    if (severity === 'Extreme' || severity === 'Severe') return 'critical'
    if (severity === 'Moderate' || (severity === 'Minor' && certainty === 'Observed')) return 'warning'
    return 'info'
  }
  
  // Get active weather alerts from NOAA
  async getActiveWeatherAlerts(): Promise<WeatherAlert[]> {
    try {
      // Fetch active alerts for the entire US
      const response = await fetch(`${this.NOAA_API_BASE}/alerts/active?status=actual&message_type=alert,update`)
      
      if (!response.ok) {
        throw new Error(`NOAA API error: ${response.status}`)
      }
      
      const data = await response.json()
      const features = data.features || []
      
      // Convert NOAA alerts to our format
      const alerts: WeatherAlert[] = features
        .filter((feature: any) => feature.properties)
        .map((feature: any) => {
          const props = feature.properties as NOAAAlert
          
          // Extract coordinates if available
          let lat = 0, lon = 0, locationName = props.areaDesc
          
          if (feature.geometry && feature.geometry.coordinates) {
            // For polygon geometries, calculate centroid
            if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates[0]) {
              const coords = feature.geometry.coordinates[0]
              lon = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length
              lat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length
            }
          }
          
          return {
            id: props.id,
            type: this.mapEventType(props.event),
            severity: this.mapSeverity(props.severity, props.certainty),
            title: props.headline || props.event,
            description: props.description,
            location: {
              lat,
              lon,
              name: locationName
            },
            startTime: props.effective,
            endTime: props.ends || props.expires,
            source: 'National Weather Service',
            lastUpdated: new Date().toISOString()
          }
        })
        // Sort by severity (critical first) then by start time
        .sort((a: WeatherAlert, b: WeatherAlert) => {
          const severityOrder = { critical: 0, warning: 1, info: 2 }
          const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
          if (severityDiff !== 0) return severityDiff
          
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        })
      
      // Limit to most relevant alerts
      return alerts.slice(0, 20)
    } catch (error) {
      console.error('Failed to fetch NOAA weather alerts:', error)
      
      // Return empty array on error - the enhanced API will provide fallback data
      return []
    }
  }
  
  // Get severe weather statistics
  async getWeatherStatistics(): Promise<{
    totalAlerts: number
    criticalAlerts: number
    alertsByType: Record<string, number>
  }> {
    try {
      const alerts = await this.getActiveWeatherAlerts()
      
      const stats = {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        alertsByType: {} as Record<string, number>
      }
      
      // Count alerts by type
      alerts.forEach(alert => {
        stats.alertsByType[alert.type] = (stats.alertsByType[alert.type] || 0) + 1
      })
      
      return stats
    } catch (error) {
      console.error('Failed to get weather statistics:', error)
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        alertsByType: {}
      }
    }
  }
}

export const weatherAPI = new WeatherAPIService()
export type { WeatherAlert }