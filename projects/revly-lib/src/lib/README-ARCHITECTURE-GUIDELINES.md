# Architectural Guidelines

## Service Access Rules

### Facade Pattern Enforcement

Our architecture follows a strict facade pattern that should be maintained for all future development. This document outlines the rules and patterns to follow.

## Directory Structure

```
/lib
  /core
    /api               - API configuration
    /interceptors      - HTTP interceptors
    /internal          - INTERNAL IMPLEMENTATION SERVICES (not for direct use by components nor by facades)
      /state           - Internal state management services
      /storage         - Internal storage services
      /token           - Internal token management
    /facades           - PUBLIC FACADES (the only services components should use)
      auth-facade.service.ts
      user-facade.service.ts
```

## Rules of Engagement

1. **Component Code Must Only Use Facades**
    - Components should NEVER directly import or depend on internal services
    - If a facade is missing functionality, extend the facade (don't bypass it)

2. **Facades Coordinate Between Internal Services**
    - Facades are allowed to depend on multiple internal services
    - Facades should handle all orchestration between services

3. **Internal Services Must Not Know About Facades**
    - Internal services should have no dependencies on facades
    - This prevents circular dependencies

4. **Naming Conventions**
    - `*Facade` - Public services that components can use directly
    - `*Internal` or no suffix - Implementation services not for direct use

## Implementation

We can enforce these patterns through:

1. **Fine-grained Export Control**

    ```typescript
    // src/exports/public-services.ts
    // ONLY export facade services, not implementation services
    export { AuthFacade } from '../lib/core/facades/auth-facade.service';
    export { IdentityFacade } from '../lib/core/facades/user-facade.service';
    // NEVER export internal implementation services
    ```

    **Benefits of Fine-grained Exports**:
    - Prevents bundle bloat by only including what's actually used
    - Provides explicit control over public API surface
    - Enforces architectural boundaries at the export level

2. **Code Reviews**
    - Flag any PR that exposes internal services in export files
    - Reject PRs where components directly import internal services
    - Ensure new services follow the proper naming and folder structure

3. **Documentation**
    - Add `@internal` JSDoc tags to implementation services
    - Add warnings in service documentation about proper usage

## Future Enforcement

In the future, we could implement:

1. **Custom ESLint Rules** to detect and prevent:
    - Direct imports of internal services from components
    - Exports of internal services in public API files
    - Circular dependencies
2. **Path Aliases** in tsconfig.json to make the distinction clearer:

    ```json
    {
    	"paths": {
    		"@revly/facades/*": ["./src/lib/core/facades/*"],
    		"@revly/models/*": ["./src/lib/models/*"]
    	}
    }
    ```

3. **Build-time checks** to verify export compliance:
    - Create scripts that verify only facade services are exported
    - Run as part of CI/CD pipeline to prevent non-compliant exports
