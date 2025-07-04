export interface CelestialBody {
  id: string
  name: string
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'galaxy' | 'nebula' | 'black_hole'
  position: [number, number, number]
  radius: number
  mass?: number
  color: string
  texture?: string
  description?: string
  orbitRadius?: number
  orbitalPeriod?: number
  rotationPeriod?: number
  temperature?: number
  atmosphere?: string[]
  moons?: string[]
  rings?: boolean
  luminosity?: number
  spectralClass?: string
  discoveryDate?: string
  discoveryMethod?: string
  distance?: number
  velocity?: [number, number, number]
  composition?: string[]
  magneticField?: number
  gravity?: number
  escapeVelocity?: number
  dayLength?: number
  yearLength?: number
  tilt?: number
  eccentricity?: number
  albedo?: number
  surfacePressure?: number
  numberOfMoons?: number
  knownFor?: string[]
  funFacts?: string[]
  images?: string[]
  wikiLink?: string
  nasaLink?: string
}

export interface CosmicEvent {
  id: string
  name: string
  type: 'supernova' | 'solar_flare' | 'asteroid_approach' | 'eclipse' | 'transit' | 'conjunction' | 'meteor_shower'
  date: Date
  duration?: number
  location?: [number, number, number]
  description: string
  severity?: 'low' | 'medium' | 'high' | 'extreme'
  visibleFromEarth: boolean
  relatedObjects: string[]
  impact?: string
  frequency?: string
  nextOccurrence?: Date
  historicalOccurrences?: Date[]
  observationTips?: string[]
  images?: string[]
  videoLinks?: string[]
  scientificImportance?: string
  publicInterest?: 'low' | 'medium' | 'high'
}

export interface ObservationData {
  id: string
  objectId: string
  timestamp: Date
  observer: string
  location: [number, number, number]
  instrument: string
  wavelength?: string
  magnitude?: number
  notes?: string
  images?: string[]
  dataQuality: 'poor' | 'fair' | 'good' | 'excellent'
  weatherConditions?: string
  seeingConditions?: number
  confirmed: boolean
  publicSubmission: boolean
  scientificValue: 'low' | 'medium' | 'high'
  followUpRequired: boolean
  tags?: string[]
}

export interface KnowledgeNode {
  id: string
  type: 'object' | 'concept' | 'phenomenon' | 'theory' | 'mission' | 'person' | 'instrument'
  name: string
  description: string
  category: string
  subcategory?: string
  relationships: {
    nodeId: string
    relationshipType: 'contains' | 'orbits' | 'discovered_by' | 'part_of' | 'influenced_by' | 'related_to' | 'observed_by'
    strength: number
    description?: string
  }[]
  position?: [number, number, number]
  properties: Record<string, any>
  tags: string[]
  importance: number
  confidence: number
  lastUpdated: Date
  sources: string[]
  images?: string[]
  dataLinks?: string[]
  aiGenerated: boolean
  verified: boolean
}

export interface UniverseScale {
  name: string
  minSize: number
  maxSize: number
  unit: 'meters' | 'kilometers' | 'au' | 'light_years' | 'parsecs' | 'megaparsecs'
  description: string
  examples: string[]
  visualizationLevel: number
  lodDistance: number
  detailLevel: 'low' | 'medium' | 'high' | 'ultra'
  renderingTechnique: 'point' | 'sprite' | 'mesh' | 'instanced' | 'procedural'
}

export interface AstronomicalConstant {
  name: string
  symbol: string
  value: number
  unit: string
  uncertainty?: number
  description: string
  category: 'fundamental' | 'derived' | 'measured' | 'conventional'
  lastUpdated: Date
  source: string
  relatedConstants?: string[]
  applications: string[]
  precision: number
  historicalValues?: {
    year: number
    value: number
    source: string
  }[]
}