# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Universal Simulation Webapp - A groundbreaking platform that simulates the entire known universe through an interactive 3D knowledge graph interface with AI voice assistant integration (J.A.R.V.I.S.-style).

## Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Three.js + react-three-fiber for 3D universe visualization
- React-Spring for animations
- D3.js for 2D knowledge graph visualizations

**Backend:**
- Node.js with Express.js
- GraphQL for flexible data querying
- WebSocket for real-time updates

**Database:**
- Neo4j for knowledge graph storage
- Pinecone/Chroma for vector database (RAG implementation)

**AI Integration:**
- OpenAI GPT-4 for natural language processing
- Browser speech recognition API + Whisper AI
- Advanced text-to-speech for voice interface

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Universe3D/      # 3D visualization components
│   ├── KnowledgeGraph/  # Graph visualization components
│   ├── VoiceInterface/  # AI voice assistant components
│   └── Dashboard/       # Admin dashboard components
├── services/            # API services and integrations
│   ├── nasa/           # NASA API integration
│   ├── ai/             # AI services (OpenAI, speech)
│   └── knowledge/      # Knowledge graph services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## Key Features

1. **3D Universe Visualization**: Interactive 1:1 scale universe simulation
2. **Knowledge Graph**: Neo4j-powered cosmic object relationships
3. **AI Voice Assistant**: J.A.R.V.I.S.-style voice interaction
4. **NASA API Integration**: Real-time astronomical data
5. **News Aggregation**: Live astronomy and quantum physics news
6. **JWST Integration**: James Webb Space Telescope imagery
7. **Admin Dashboard**: User analytics and content management

## API Keys Required

- NASA API key for astronomical data
- OpenAI API key for AI assistant
- (Optional) Pinecone API key for vector database

## Performance Considerations

- Target 60+ FPS for 3D rendering
- Implement LOD (Level of Detail) for distant objects
- Use instanced rendering for similar objects (stars, particles)
- Lazy loading for detailed cosmic object information
- Progressive loading of 3D assets

## Security Notes

- GDPR-compliant user data handling
- Rate limiting for NASA API usage
- Multi-factor authentication for admin access
- End-to-end encryption for sensitive data