import { KnowledgeNode } from '../../types/celestialBody'

export interface GraphConnection {
  source: string
  target: string
  type: string
  strength: number
  metadata?: Record<string, any>
}

export interface GraphQuery {
  nodeId?: string
  nodeType?: string
  relationshipType?: string
  maxDepth?: number
  includeMetadata?: boolean
}

export interface GraphSearchResult {
  nodes: KnowledgeNode[]
  relationships: GraphConnection[]
  metadata: {
    totalNodes: number
    totalRelationships: number
    queryTime: number
  }
}

class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map()
  private connections: Map<string, GraphConnection[]> = new Map()
  private indexes: Map<string, Set<string>> = new Map()

  constructor() {
    this.initializeIndexes()
    this.loadInitialData()
  }

  private initializeIndexes(): void {
    this.indexes.set('type', new Set())
    this.indexes.set('category', new Set())
    this.indexes.set('tags', new Set())
  }

  private loadInitialData(): void {
    const solarSystemNodes = this.createSolarSystemNodes()
    const stellarNodes = this.createStellarNodes()
    const galaxyNodes = this.createGalaxyNodes()
    const cosmologyNodes = this.createCosmologyNodes()

    const allNodes = [
      ...solarSystemNodes,
      ...stellarNodes,
      ...galaxyNodes,
      ...cosmologyNodes
    ]

    allNodes.forEach(node => this.addNode(node))
    this.createRelationships()
  }

  private createSolarSystemNodes(): KnowledgeNode[] {
    return [
      {
        id: 'sun',
        type: 'object',
        name: 'Sun',
        description: 'The star at the center of our solar system',
        category: 'star',
        subcategory: 'main_sequence',
        relationships: [],
        position: [0, 0, 0],
        properties: {
          mass: 1.989e30,
          radius: 696340,
          temperature: 5778,
          age: 4.6e9,
          spectralClass: 'G2V',
          luminosity: 3.828e26
        },
        tags: ['star', 'solar_system', 'main_sequence'],
        importance: 10,
        confidence: 1.0,
        lastUpdated: new Date(),
        sources: ['NASA', 'ESA', 'Scientific Literature'],
        aiGenerated: false,
        verified: true
      },
      {
        id: 'earth',
        type: 'object',
        name: 'Earth',
        description: 'The third planet from the Sun and the only known planet to harbor life',
        category: 'planet',
        subcategory: 'terrestrial',
        relationships: [],
        position: [149597870.7, 0, 0],
        properties: {
          mass: 5.972e24,
          radius: 6371,
          orbitalPeriod: 365.25,
          rotationPeriod: 1.0,
          temperature: 288,
          atmosphere: ['nitrogen', 'oxygen', 'argon'],
          habitableZone: true
        },
        tags: ['planet', 'terrestrial', 'habitable', 'life'],
        importance: 10,
        confidence: 1.0,
        lastUpdated: new Date(),
        sources: ['NASA', 'NOAA', 'Scientific Literature'],
        aiGenerated: false,
        verified: true
      },
      {
        id: 'mars',
        type: 'object',
        name: 'Mars',
        description: 'The fourth planet from the Sun, known as the Red Planet',
        category: 'planet',
        subcategory: 'terrestrial',
        relationships: [],
        position: [227939200, 0, 0],
        properties: {
          mass: 6.39e23,
          radius: 3389.5,
          orbitalPeriod: 686.98,
          rotationPeriod: 1.026,
          temperature: 210,
          atmosphere: ['carbon_dioxide', 'nitrogen', 'argon'],
          polarIceCaps: true,
          moons: ['Phobos', 'Deimos']
        },
        tags: ['planet', 'terrestrial', 'red_planet', 'exploration'],
        importance: 9,
        confidence: 1.0,
        lastUpdated: new Date(),
        sources: ['NASA', 'ESA', 'Mars missions'],
        aiGenerated: false,
        verified: true
      }
    ]
  }

  private createStellarNodes(): KnowledgeNode[] {
    return [
      {
        id: 'stellar_evolution',
        type: 'concept',
        name: 'Stellar Evolution',
        description: 'The process by which stars change over time',
        category: 'astrophysics',
        subcategory: 'stellar_physics',
        relationships: [],
        properties: {
          mainSequenceDuration: 'varies by mass',
          finalStates: ['white_dwarf', 'neutron_star', 'black_hole'],
          nuclearFusion: true
        },
        tags: ['stars', 'evolution', 'physics', 'lifecycle'],
        importance: 8,
        confidence: 1.0,
        lastUpdated: new Date(),
        sources: ['Stellar Physics Literature', 'Observational Data'],
        aiGenerated: false,
        verified: true
      },
      {
        id: 'alpha_centauri',
        type: 'object',
        name: 'Alpha Centauri',
        description: 'The closest star system to Earth',
        category: 'star_system',
        subcategory: 'multiple_star',
        relationships: [],
        position: [40677600000000, 0, 0],
        properties: {
          distance: 4.37,
          components: ['Alpha Centauri A', 'Alpha Centauri B', 'Proxima Centauri'],
          exoplanets: ['Proxima Centauri b', 'Proxima Centauri c'],
          age: 5.3e9
        },
        tags: ['star_system', 'nearest_stars', 'exoplanets'],
        importance: 9,
        confidence: 1.0,
        lastUpdated: new Date(),
        sources: ['ESO', 'NASA', 'Exoplanet Archive'],
        aiGenerated: false,
        verified: true
      }
    ]
  }

  private createGalaxyNodes(): KnowledgeNode[] {
    return [
      {
        id: 'milky_way',
        type: 'object',
        name: 'Milky Way',
        description: 'Our home galaxy, a barred spiral galaxy',
        category: 'galaxy',
        subcategory: 'spiral',
        relationships: [],
        properties: {
          type: 'barred_spiral',
          diameter: 100000,
          mass: 1.5e12,
          stars: 400e9,
          age: 13.6e9,
          centralBlackHole: 'Sagittarius A*'
        },
        tags: ['galaxy', 'spiral', 'home_galaxy', 'local_group'],
        importance: 10,
        confidence: 1.0,
        lastUpdated: new Date(),
        sources: ['Gaia Mission', 'Hubble Space Telescope', 'Ground-based Observations'],
        aiGenerated: false,
        verified: true
      },
      {
        id: 'andromeda',
        type: 'object',
        name: 'Andromeda Galaxy',
        description: 'The nearest major galaxy to the Milky Way',
        category: 'galaxy',
        subcategory: 'spiral',
        relationships: [],
        position: [2.537e22, 0, 0],
        properties: {
          type: 'spiral',
          diameter: 220000,
          mass: 1.5e12,
          stars: 1e12,
          distance: 2.537e6,
          collisionDate: 4.5e9
        },
        tags: ['galaxy', 'spiral', 'nearest_galaxy', 'collision'],
        importance: 9,
        confidence: 1.0,
        lastUpdated: new Date(),
        sources: ['Hubble Space Telescope', 'Spitzer Space Telescope'],
        aiGenerated: false,
        verified: true
      }
    ]
  }

  private createCosmologyNodes(): KnowledgeNode[] {
    return [
      {
        id: 'big_bang',
        type: 'theory',
        name: 'Big Bang Theory',
        description: 'The prevailing cosmological model explaining the origin of the universe',
        category: 'cosmology',
        subcategory: 'origin',
        relationships: [],
        properties: {
          age: 13.8e9,
          initialSingularity: true,
          cosmicMicrowaveBackground: true,
          nucleosynthesis: true,
          inflation: true
        },
        tags: ['cosmology', 'origin', 'theory', 'universe'],
        importance: 10,
        confidence: 0.95,
        lastUpdated: new Date(),
        sources: ['WMAP', 'Planck Mission', 'Cosmological Literature'],
        aiGenerated: false,
        verified: true
      },
      {
        id: 'dark_matter',
        type: 'phenomenon',
        name: 'Dark Matter',
        description: 'A form of matter that does not emit, absorb, or reflect light',
        category: 'cosmology',
        subcategory: 'dark_sector',
        relationships: [],
        properties: {
          percentage: 27,
          evidence: ['gravitational_lensing', 'galaxy_rotation', 'cosmic_structure'],
          candidates: ['WIMPs', 'axions', 'sterile_neutrinos'],
          directDetection: false
        },
        tags: ['dark_matter', 'cosmology', 'mystery', 'gravity'],
        importance: 9,
        confidence: 0.85,
        lastUpdated: new Date(),
        sources: ['Dark Matter Experiments', 'Cosmological Observations'],
        aiGenerated: false,
        verified: true
      }
    ]
  }

  private createRelationships(): void {
    this.addRelationship('earth', 'sun', 'orbits', 1.0)
    this.addRelationship('mars', 'sun', 'orbits', 1.0)
    this.addRelationship('sun', 'stellar_evolution', 'follows', 0.9)
    this.addRelationship('alpha_centauri', 'stellar_evolution', 'follows', 0.9)
    this.addRelationship('sun', 'milky_way', 'part_of', 1.0)
    this.addRelationship('alpha_centauri', 'milky_way', 'part_of', 1.0)
    this.addRelationship('milky_way', 'andromeda', 'will_collide_with', 0.95)
    this.addRelationship('milky_way', 'big_bang', 'originated_from', 0.9)
    this.addRelationship('milky_way', 'dark_matter', 'contains', 0.8)
  }

  addNode(node: KnowledgeNode): void {
    this.nodes.set(node.id, node)
    
    this.indexes.get('type')?.add(`${node.type}:${node.id}`)
    this.indexes.get('category')?.add(`${node.category}:${node.id}`)
    node.tags.forEach(tag => {
      this.indexes.get('tags')?.add(`${tag}:${node.id}`)
    })
  }

  getNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id)
  }

  addRelationship(sourceId: string, targetId: string, type: string, strength: number): void {
    const connection: GraphConnection = {
      source: sourceId,
      target: targetId,
      type,
      strength
    }

    if (!this.connections.has(sourceId)) {
      this.connections.set(sourceId, [])
    }
    this.connections.get(sourceId)?.push(connection)

    const sourceNode = this.nodes.get(sourceId)
    if (sourceNode) {
      sourceNode.relationships.push({
        nodeId: targetId,
        relationshipType: type as any,
        strength,
        description: `${sourceNode.name} ${type} ${this.nodes.get(targetId)?.name}`
      })
    }
  }

  searchNodes(query: GraphQuery): GraphSearchResult {
    const startTime = Date.now()
    let matchingNodes: KnowledgeNode[] = []

    if (query.nodeId) {
      const node = this.nodes.get(query.nodeId)
      if (node) {
        matchingNodes = [node]
      }
    } else if (query.nodeType) {
      const typeIndex = this.indexes.get('type')
      if (typeIndex) {
        const matchingIds = Array.from(typeIndex)
          .filter(entry => entry.startsWith(`${query.nodeType}:`))
          .map(entry => entry.split(':')[1])
        
        matchingNodes = matchingIds
          .map(id => this.nodes.get(id))
          .filter(node => node !== undefined) as KnowledgeNode[]
      }
    } else {
      matchingNodes = Array.from(this.nodes.values())
    }

    const relationships = this.getRelationshipsForNodes(matchingNodes.map(n => n.id))
    
    const queryTime = Date.now() - startTime

    return {
      nodes: matchingNodes,
      relationships,
      metadata: {
        totalNodes: matchingNodes.length,
        totalRelationships: relationships.length,
        queryTime
      }
    }
  }

  private getRelationshipsForNodes(nodeIds: string[]): GraphConnection[] {
    const relationships: GraphConnection[] = []
    const nodeIdSet = new Set(nodeIds)

    nodeIds.forEach(nodeId => {
      const connections = this.connections.get(nodeId) || []
      connections.forEach(connection => {
        if (nodeIdSet.has(connection.target)) {
          relationships.push(connection)
        }
      })
    })

    return relationships
  }

  getConnectedNodes(nodeId: string, maxDepth: number = 2): KnowledgeNode[] {
    const visited = new Set<string>()
    const result: KnowledgeNode[] = []
    
    const traverse = (currentId: string, depth: number) => {
      if (depth > maxDepth || visited.has(currentId)) return
      
      visited.add(currentId)
      const node = this.nodes.get(currentId)
      if (node) {
        result.push(node)
        
        const connections = this.connections.get(currentId) || []
        connections.forEach(connection => {
          traverse(connection.target, depth + 1)
        })
      }
    }

    traverse(nodeId, 0)
    return result
  }

  searchByTags(tags: string[]): KnowledgeNode[] {
    const tagIndex = this.indexes.get('tags')
    if (!tagIndex) return []

    const matchingIds = new Set<string>()
    
    tags.forEach(tag => {
      Array.from(tagIndex)
        .filter(entry => entry.startsWith(`${tag}:`))
        .forEach(entry => {
          const id = entry.split(':')[1]
          matchingIds.add(id)
        })
    })

    return Array.from(matchingIds)
      .map(id => this.nodes.get(id))
      .filter(node => node !== undefined) as KnowledgeNode[]
  }

  getStatistics() {
    const nodesByType = new Map<string, number>()
    const nodesByCategory = new Map<string, number>()
    
    this.nodes.forEach(node => {
      nodesByType.set(node.type, (nodesByType.get(node.type) || 0) + 1)
      nodesByCategory.set(node.category, (nodesByCategory.get(node.category) || 0) + 1)
    })

    return {
      totalNodes: this.nodes.size,
      totalConnections: Array.from(this.connections.values()).reduce((sum, conns) => sum + conns.length, 0),
      nodesByType: Object.fromEntries(nodesByType),
      nodesByCategory: Object.fromEntries(nodesByCategory)
    }
  }
}

export const knowledgeGraph = new KnowledgeGraph()
export default KnowledgeGraph