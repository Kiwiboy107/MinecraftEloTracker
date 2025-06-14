# Minecraft PvP Rankings System

## Overview

This is a full-stack web application for tracking and managing Minecraft PvP battles and player rankings. The system uses an Elo rating system to calculate player skill levels and provides comprehensive battle tracking, statistics, and leaderboards.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js with react-chartjs-2 for data visualization
- **Theme**: Dark-themed "gaming" UI with Minecraft-inspired green accents

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Build Tool**: esbuild for production bundling
- **Development**: tsx for TypeScript execution

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Database Schema
- **Players Table**: Stores player information (id, name, elo, wins, losses, last_battle, created_at)
- **Battles Table**: Tracks battle history (id, team_a, team_b, winning_team, elo_changes, battle_type, notes, created_at)
- **Validation**: Zod schemas for runtime type checking and API validation

### API Endpoints
- `GET /api/players` - Retrieve all players with rankings
- `POST /api/players` - Create new player
- `DELETE /api/players/:id` - Remove player
- `POST /api/battles` - Record new battle
- `GET /api/battles` - Retrieve battle history
- `GET /api/battles/recent` - Get recent battles
- `POST /api/reset` - Reset all data

### Frontend Components
- **RankingsSection**: Player leaderboard with Elo ratings and win/loss stats
- **BattleInputSection**: Form for recording new battles (1v1, 2v2 support)
- **StatisticsSection**: Charts and analytics using Chart.js
- **PlayerManagementSection**: Add/remove players interface
- **ResetModal**: Data reset functionality

### Elo Rating System
- K-factor of 32 for rating calculations
- Team-based Elo calculations for multi-player battles
- Real-time rating updates after each battle
- Expected score calculations based on rating differences

## Data Flow

1. **Battle Recording**: Users input battle results through forms
2. **Elo Calculation**: Server calculates rating changes using Elo algorithm
3. **Database Update**: Player stats and battle history stored in PostgreSQL
4. **Real-time Updates**: React Query invalidates and refetches data
5. **UI Refresh**: Rankings and statistics update automatically

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon Database driver
- **drizzle-orm**: TypeScript ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **chart.js**: Data visualization

### UI Dependencies
- **@radix-ui**: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant handling
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: Production bundling
- **drizzle-kit**: Database toolkit

## Deployment Strategy

- **Platform**: Replit with autoscale deployment
- **Build Process**: 
  1. Frontend built with Vite to `dist/public`
  2. Backend bundled with esbuild to `dist/index.js`
- **Environment**: Node.js 20 with PostgreSQL 16
- **Port Configuration**: Internal port 5000, external port 80
- **Database**: Provisioned PostgreSQL instance via Replit

## Changelog

Changelog:
- June 14, 2025. Initial setup
- June 14, 2025. Migrated from in-memory storage to PostgreSQL database with Drizzle ORM
- June 14, 2025. Fixed battle recording form state issues and added missing battle formats (3v2, 4v2, 4v4)
- June 14, 2025. Fixed Select component errors with empty values by using "none" placeholder values

## User Preferences

Preferred communication style: Simple, everyday language.