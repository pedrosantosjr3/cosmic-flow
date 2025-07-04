// Date validation utilities to ensure current and recent data

export interface DateValidationResult {
  isValid: boolean
  isCurrent: boolean
  isRecent: boolean
  daysSinceEvent: number
  message: string
}

export class DateValidator {
  private currentDate: Date
  
  constructor() {
    // Use the current date from the environment (July 4, 2025)
    this.currentDate = new Date('2025-07-04')
  }
  
  // Validate if a date is current or recent
  validateEventDate(eventDate: string | Date, maxDaysOld: number = 30): DateValidationResult {
    const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        isCurrent: false,
        isRecent: false,
        daysSinceEvent: -1,
        message: 'Invalid date format'
      }
    }
    
    // Calculate days difference
    const daysDiff = Math.floor((this.currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    // Future events are current
    if (daysDiff < 0) {
      return {
        isValid: true,
        isCurrent: true,
        isRecent: true,
        daysSinceEvent: daysDiff,
        message: `Event scheduled in ${Math.abs(daysDiff)} days`
      }
    }
    
    // Check if event is current (today)
    const isCurrent = daysDiff === 0
    
    // Check if event is recent (within maxDaysOld)
    const isRecent = daysDiff <= maxDaysOld
    
    let message = ''
    if (isCurrent) {
      message = 'Event is happening today'
    } else if (isRecent) {
      message = `Event occurred ${daysDiff} days ago`
    } else {
      message = `Event is outdated (${daysDiff} days old)`
    }
    
    return {
      isValid: true,
      isCurrent,
      isRecent,
      daysSinceEvent: daysDiff,
      message
    }
  }
  
  // Filter array of events to only include current/recent ones
  filterCurrentEvents<T extends { date?: string; close_approach_date?: string }>(
    events: T[],
    maxDaysOld: number = 30
  ): T[] {
    return events.filter(event => {
      const dateField = event.date || event.close_approach_date
      if (!dateField) return false
      
      const validation = this.validateEventDate(dateField, maxDaysOld)
      return validation.isRecent
    })
  }
  
  // Get a date range for API queries (e.g., 30 days before and after current date)
  getDateRange(daysBefore: number = 30, daysAfter: number = 90): {
    startDate: string
    endDate: string
    currentDate: string
  } {
    const start = new Date(this.currentDate)
    start.setDate(start.getDate() - daysBefore)
    
    const end = new Date(this.currentDate)
    end.setDate(end.getDate() + daysAfter)
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      currentDate: this.currentDate.toISOString().split('T')[0]
    }
  }
  
  // Format date for display with recency indicator
  formatDateWithRecency(date: string | Date): string {
    const validation = this.validateEventDate(date)
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const formatted = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    if (validation.isCurrent) {
      return `${formatted} (Today)`
    } else if (validation.daysSinceEvent < 0) {
      return `${formatted} (In ${Math.abs(validation.daysSinceEvent)} days)`
    } else if (validation.isRecent) {
      return `${formatted} (${validation.daysSinceEvent} days ago)`
    } else {
      return `${formatted} (Outdated)`
    }
  }
  
  // Check if we should refresh cached data
  shouldRefreshData(lastFetchTime: Date | string, refreshIntervalMinutes: number = 15): boolean {
    const lastFetch = typeof lastFetchTime === 'string' ? new Date(lastFetchTime) : lastFetchTime
    const minutesSinceLastFetch = (this.currentDate.getTime() - lastFetch.getTime()) / (1000 * 60)
    
    return minutesSinceLastFetch >= refreshIntervalMinutes
  }
}

// Export singleton instance
export const dateValidator = new DateValidator()

// Utility functions for common date operations
export const getCurrentDateString = (): string => {
  return new Date('2025-07-04').toISOString().split('T')[0]
}

export const isEventCurrent = (eventDate: string, maxDaysOld: number = 30): boolean => {
  return dateValidator.validateEventDate(eventDate, maxDaysOld).isRecent
}

export const getTimeSinceEvent = (eventDate: string): string => {
  const validation = dateValidator.validateEventDate(eventDate)
  
  if (validation.daysSinceEvent === 0) {
    return 'happening now'
  } else if (validation.daysSinceEvent < 0) {
    return `in ${Math.abs(validation.daysSinceEvent)} days`
  } else if (validation.daysSinceEvent === 1) {
    return 'yesterday'
  } else if (validation.daysSinceEvent < 7) {
    return `${validation.daysSinceEvent} days ago`
  } else if (validation.daysSinceEvent < 30) {
    return `${Math.floor(validation.daysSinceEvent / 7)} weeks ago`
  } else {
    return 'over a month ago'
  }
}