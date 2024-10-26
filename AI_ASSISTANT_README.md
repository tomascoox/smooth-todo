Before responding to any prompts, read and internalize the following guidelines to ensure you provide the highest-quality assistance for Next.js development.

General Guidelines:
Be the Best Next.js Developer
Your primary goal is to provide expert-level guidance on Next.js, leveraging cutting-edge practices and optimizations. Always aim for efficient, clean, and scalable solutions.

File Structure Preferences
This Next.js project follows a structured layout with the main application code residing in the app directory. The app folder contains subdirectories for different sections of the application, such as workgroups, profile, and tasks. Each of these subdirectories may contain a page.tsx file for the main page content and additional files for components or subpages. The API routes are located in the app/api directory, with separate files for different endpoints. Shared components are stored in the components directory at the root level. Authentication logic is handled in lib/auth.ts, while database connections are managed in lib/mongodb.ts. Email functionality is implemented in lib/email.ts. Environment variables are stored in the .env.local file at the project root. This structure allows for a clear separation of concerns and follows Next.js 13+ conventions with the App Router.

Tech Stack & Tools:
Next.js

Prioritize the latest stable features and best practices, using the app router. Take full advantage of server components, static site generation (SSG), incremental static regeneration (ISR), or server-side rendering (SSR) where appropriate.

Structure routes using the app directory for routing and layouts only.

Tailwind CSS
Recommend utility-first styling using Tailwind. Encourage using Tailwind's configuration to create a consistent design system.

ShadcnUI
Utilize ShadcnUI components where applicable, with customization through Tailwind for a cohesive look and feel.

Framer Motion
Provide animations and transitions using Framer Motion. Recommend best practices for integrating animations into Next.js projects.

Three.js
Use Three.js for 3D visualizations and interactive 3D content. Provide guidance on best practices for integrating Three.js with Next.js.
Optimize 3D models and scenes for performance, ensuring smooth rendering in the browser.

TypeScript
Use TypeScript throughout the project. Provide type safety, interfaces, and type annotations to minimize bugs and improve code quality.

MongoDB
Use MongoDB for database operations, connecting directly to the MongoDB instance.
Encourage creating collections with appropriate indexes and document structures to optimize performance.
Handle database operations securely, using the MongoDB driver for Node.js.
Utilize MongoDB's aggregation pipeline for complex queries and data transformations.

State Management Guidelines:

Handling State Through URLs
When appropriate, manage state using the URL's query parameters, path segments, or hash fragments. This approach works well for:
Navigation (e.g., tabs, views)
Filtering, sorting, or pagination
Deep linking and sharable app states

Recommend URL state management for simpler cases where state can naturally be represented as part of the URL. Consider the benefits, such as improved user experience, SEO, and leveraging browser navigation.

Traditional State Management Approaches

For more complex or deeply nested state, suggest using built-in React hooks like useState, useReducer, or useContext.

Recommend lightweight libraries like Zustand when managing global state across multiple components.
Avoid overcomplicating state management by introducing libraries unless necessary. Use URL-based state management first where it simplifies the project.
Guidelines for Choosing the Right Approach

Start with URL-based state management where it fits naturally. If more advanced state handling is required (e.g., global state, complex state relationships), consider traditional methods.

Avoid redundancy by not duplicating state across URLs and local state. Keep the source of truth clear.
Handle sensitive or complex data carefully, ensuring that sensitive data is not exposed in the URL and complex state is appropriately managed.

Coding Style:
Write clean, maintainable, and well-documented code.
Prioritize readability. Use meaningful variable and function names.
Provide comments where necessary, especially for complex logic.

Performance:
Suggest optimizations for faster build times and runtime performance.
Leverage Next.js features like caching, code-splitting, and lazy-loading to improve the user experience.

Best Practices:
Adhere to the latest industry standards and conventions.
Use Git best practices for version control. Encourage small, frequent commits with meaningful messages.
Consider SEO optimizations when building pages.

Only follow what's explicitly stated in the README

Wait for your specific instructions before making any changes

Do not make assumptions about anything
