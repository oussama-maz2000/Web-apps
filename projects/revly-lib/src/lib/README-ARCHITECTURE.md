# Revly Library Architecture

## Overview

This document outlines the architecture improvements made to the Revly library to address various issues including circular dependencies, state management, and code organization.

## Core Architectural Principles

1. **Clear Separation of Concerns**
    - UI Components interact only with Facade services
    - Facade services orchestrate operations between state, storage, and API services
    - API services focus solely on data access
    - State services manage application state

2. **One-Way Data Flow**
    - Components → Facades → State/API Services
    - State changes flow back to components through signals

3. **Centralized Storage Management**
    - All localStorage/sessionStorage interactions go through StorageService
    - Consistent key naming via STORAGE_KEYS constants

4. **Modular Translation System**
    - Component-based translation requirements
    - Automatic language switching with state persistence
    - Efficient caching and loading of translation files

## Key Components

### Storage Layer

- **StorageService**: Centralizes all localStorage/sessionStorage operations
- **STORAGE_KEYS**: Maintains consistent key naming across the application

### State Management

- **AuthStateService**: Maintains authentication state with signals
    - Single source of truth for auth state
    - Provides read-only signals for components
- **IdentityStateService**: Manages user identity information including language preferences

### Facade Services

- **AuthFacade**: Orchestrates authentication operations
    - Coordinates between AuthService, AuthTokenService, and storage
    - Exposes simplified API for components
    - Handles error management and state updates
- **TranslationFacade**: Manages component translation requirements
    - Provides interface for components to load their translations
    - Abstracts away translation implementation details

### Services

- **AuthTokenService**: Manages secure token storage and retrieval
- **IdentityService**: Manages user profile data
- **TranslationManagerService**: Core service for handling translations
    - Manages loading, caching, and switching between languages
    - Implements efficient caching strategies for translations

## Dependency Flow

```
                     Components (*Component) [/components/*]
                                    ↓
                  Facades (*FacadeService) [core/facades/*, /facades/*]
                     ↓                                  ↓
State Services (*-state.service.ts) [/state/*]  ---> second layer Services (*Service) [/services/*]
                                                                    ↓
Internal services: (*CoreService) Storage Service, errorHandler, HttpClientApi, Language... [/core/Internal/*]
```

## Translation System Architecture

The translation system follows these key design principles:

1. **Component-Based Requirements**
    - Each component defines its own translation requirements
    - Translation requirements specify namespaces and loading priorities

2. **Centralized Management**
    - TranslationManagerService handles loading and caching of translations
    - Efficient deduplication of translation requests
    - TTL-based cache with LRU eviction

3. **Language Switching**
    - Automatic reloading of all required translations when language changes
    - RTL/LTR handling for proper document direction
    - Translation state persistence

4. **Optimized Loading**
    - Common translations loaded eagerly at startup
    - Component-specific translations loaded lazily when needed
    - HTTP interceptors bypass authentication for translation files

## Benefits

1. **Eliminating Circular Dependencies**
    - Unidirectional data flow prevents circular references
    - Clear boundaries between service responsibilities

2. **Improved State Management**
    - Signals provide reactive state with minimal boilerplate
    - State changes are properly propagated through the application

3. **Storage Consistency**
    - Centralized storage access prevents duplication and inconsistencies
    - Type-safe storage operations

4. **Simplified Component Logic**
    - Components interact only with facade services
    - Reduced cognitive load when developing UI

5. **Efficient Translation Management**
    - Components only load the translations they need
    - Caching reduces unnecessary network requests
    - Clear separation between translation concerns

## Future Improvements

1. **Error Handling Strategy**
    - Implement consistent error handling and user feedback

2. **Feature-Based Organization**
    - Group related components, services, and models by feature

3. **Testing Strategy**
    - Unit tests for services with mock dependencies
    - Integration tests for facades

- whnever we use DenyUnAuthenticated, extends the componen in question by AuthenticatedComponent, this will ensure redirection to login in case auth state switch to unauthenticated
