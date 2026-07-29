# NamasteBitches — Anonymous Location-Based Chat

> Chat with people around you. Stay completely anonymous.

## 📖 Overview

NamasteBitches is a modern, real-time, anonymous, location-based social platform that allows users to chat with nearby people without revealing their identity.

Users join chat rooms automatically based on their current location. No phone number, email, or social profile is required.

The goal is to build a production-quality MVP that demonstrates scalable architecture, clean engineering practices, and modern full-stack development.

**Important:** This is not a clone of any existing application. Build an original product inspired by the concept, with unique features, excellent UX, and production-ready architecture.

---

# Product Goals

* Anonymous by default
* Location-aware
* Real-time messaging
* Mobile-first experience
* Fast and responsive
* Secure and scalable
* Production-ready architecture
* Excellent developer experience

---

# Tech Stack

## Frontend

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* React Hook Form
* Zod

---

## Backend

* Next.js Route Handlers
* Server Actions
* Prisma ORM
* Zod Validation

---

## Database

* PostgreSQL (Neon)
* Prisma ORM

---

## Realtime

Use Supabase Realtime for:

* Live chat
* Presence
* Online users
* Typing indicators

---

## Hosting

Frontend & Backend

* Vercel

Database

* Neon PostgreSQL

Realtime

* Supabase

---

# Core User Flow

1. User visits the website.
2. User grants location permission.
3. App creates an anonymous session.
4. Generate:

   * Random username
   * Random avatar
   * Random color theme
5. Convert user location into a Geohash.
6. Join the nearest chat room.
7. Connect to realtime messaging.
8. Display nearby users and messages.
9. Allow instant anonymous communication.

---

# Core Features

## Anonymous Authentication

* Guest login
* Secure session cookies
* Random identity generation
* Automatic login
* Logout

Future:

* Google Login
* GitHub Login

---

## Location

Use the Browser Geolocation API.

Features:

* Location permission
* Live location updates
* Radius selection
* Geohash generation
* Nearby room discovery
* Automatic room switching
* Privacy-first design

Never expose:

* Exact coordinates
* Home address
* GPS history

---

## Chat

Support:

* Realtime messages
* Typing indicator
* Presence
* Online count
* Message timestamps
* Emoji reactions
* Reply to message
* Delete own message
* Infinite scrolling
* Optimistic updates
* Message grouping

Future:

* Voice messages
* Images
* File sharing
* Polls

---

## Anonymous Identity

Every user receives:

* Random username
* Random avatar
* Random accent color

Example usernames:

* Blue Panda
* Silent Fox
* Crimson Eagle
* Shadow Wolf
* Cosmic Tiger

Users cannot edit these in the MVP.

---

## Nearby Rooms

Automatically create and join rooms based on Geohash.

Examples:

* Coffee Shop
* College Campus
* Airport
* Mall
* Library
* Office
* Metro Station
* Event Venue

Each room displays:

* Online users
* Active messages
* Room activity

---

## Moderation

Include:

* Report message
* Report user
* Block user
* Spam prevention
* Profanity filter
* Rate limiting
* Abuse detection

Admin-ready database structure.

---

## Notifications

Support:

* New messages
* Mentions
* Nearby activity
* Unread badge

Future:

* Push notifications

---

# UI Pages

## Landing Page

* Hero section
* Product features
* Screenshots
* CTA
* FAQ
* Footer

---

## Home

* Current room
* Nearby activity
* Join room
* Room information

---

## Chat

* Message list
* Typing indicator
* Input box
* Online users
* Reply UI
* Emoji reactions

---

## Profile

Display:

* Anonymous username
* Avatar
* Theme
* Session info

---

## Settings

* Theme
* Radius
* Notifications
* Privacy
* Logout

---

# UI Requirements

Design should be:

* Modern
* Minimal
* Clean
* Mobile-first
* Responsive
* Accessible
* Fast

Include:

* Dark mode
* Smooth animations
* Loading skeletons
* Empty states
* Error states
* Toast notifications

---

# Performance

Implement:

* Server Components
* Lazy loading
* Dynamic imports
* Infinite scrolling
* Image optimization
* Route prefetching
* Optimistic UI
* Memoization where appropriate

---

# Security

Implement:

* Rate limiting
* Secure cookies
* CSRF protection
* XSS prevention
* SQL injection prevention
* Input validation
* Authorization middleware
* Environment variable validation

---

# Database Schema

Design tables for:

* Users
* Sessions
* Rooms
* Messages
* Reports
* BlockedUsers
* Notifications
* Presence
* ActivityLogs

Include:

* Relationships
* Indexes
* Constraints
* Cascading rules

---

# API Design

Document every endpoint.

For each endpoint include:

* Route
* HTTP Method
* Purpose
* Authentication
* Request Body
* Response
* Validation
* Error Codes

---

# Folder Structure

```
app/
components/
features/
actions/
hooks/
lib/
server/
services/
providers/
middleware/
constants/
utils/
types/
prisma/
public/
styles/
tests/
```

Each folder should have a single responsibility.

Follow feature-based architecture wherever possible.

---

# Development Phases

## Phase 1

Project Setup

* Next.js
* Tailwind
* shadcn/ui
* Prisma
* PostgreSQL
* Vercel
* ESLint
* Prettier

---

## Phase 2

Database

* Prisma Schema
* Migrations
* Seed Data

---

## Phase 3

Authentication

* Anonymous session
* Guest login
* Cookies
* Middleware

---

## Phase 4

Location

* Browser Geolocation
* Geohash generation
* Room assignment
* Radius handling

---

## Phase 5

Realtime

* Supabase Realtime
* Presence
* Typing indicator
* Online users

---

## Phase 6

Messaging

* Send message
* Receive message
* Replies
* Reactions
* Delete
* Optimistic updates

---

## Phase 7

Moderation

* Reporting
* Blocking
* Spam prevention
* Rate limiting

---

## Phase 8

UI Polish

* Animations
* Responsive layouts
* Accessibility
* Empty states
* Skeleton loaders

---

## Phase 9

Testing

* Unit tests
* Integration tests
* End-to-end tests
* Performance testing

---

## Phase 10

Deployment

* Environment variables
* Vercel deployment
* Production database
* Monitoring
* Logging
* Analytics

---

# Production Checklist

* Feature-based architecture
* Strong TypeScript typing
* Reusable components
* Modular services
* No duplicated logic
* Error boundaries
* Input validation
* Optimistic UI
* Accessibility (WCAG)
* Mobile-first design
* SEO-friendly pages where applicable
* Clean Git history
* Production logging
* CI/CD ready

---

# Future Roadmap

* Voice chat
* Image sharing
* AI moderation
* AI conversation starters
* QR-code room joining
* Bluetooth-based nearby discovery
* Event-specific chat rooms
* Campus communities
* Local business communities
* Anonymous polls
* Friend requests (optional)
* Premium features
* Native mobile apps (React Native)

---

# Instructions for GitHub Copilot

You are acting as a Senior Staff Software Engineer.

Do **not** generate the entire application at once.

Build the project incrementally.

For every feature:

1. Explain the implementation approach.
2. Design the database changes first.
3. Implement backend logic.
4. Implement frontend UI.
5. Add validation.
6. Handle loading, success, and error states.
7. Write reusable components.
8. Keep the code modular.
9. Follow clean architecture principles.
10. Ensure the feature is production-ready before moving to the next phase.

Do not skip phases. Do not leave TODOs unless explicitly requested. Prefer maintainability, readability, scalability, and performance over shortcuts.

















