# Project Guidelines - PEDIPO Capiz IS

This document outlines the architectural standards, security protocols, and development workflows for the PEDIPO Capiz Economic Dashboard.

## Architecture
- **Backend:** Laravel 11+ with Sanctum for API authentication.
- **Frontend:** React with Vite, Tailwind CSS, and Shadcn UI.
- **Communication:** REST API using Axios.

## Authentication Flow
- **Tokens:** Authentication is handled via Bearer tokens stored in `localStorage`.
- **Backend:** Tokens are managed by Laravel Sanctum in the `personal_access_tokens` table.
- **Expiry/Security:**
    - Unauthorized requests (401) trigger an automatic logout and redirect to `/login`.
    - Login routes are rate-limited (`throttle:5,1`) to prevent brute-force attacks.

## Frontend Standards

### API Interaction
Always use the centralized API utilities instead of raw `fetch` or `axios` calls:
1.  **`AxiosInstance`**: Handles base URL, automatic token injection, and 401 response interceptors.
2.  **`ApiHandler`**: High-level wrapper for all HTTP methods. Automatically handles error notifications (toasts).
    - *Example:* `await ApiHandler.get("/v1/data")`
3.  **`AuthService`**: Manages login/logout logic and local storage state.

### Route Protection
- Use **`AuthGuard`** to wrap routes that require authentication.
- Use **`GuestGuard`** to wrap public-only routes (like Login) to redirect authenticated users away.

### Notifications
- Use the **`notify`** utility (`sonner` wrapper) for all user feedback.
- *Methods:* `success`, `error`, `info`, `warning`, `loading`.

## Security Conventions
- **CORS:** Only `http://localhost:5173` is allowed to access the API.
- **Password Safety:** Never store or compare plain-text passwords. Use Laravel's `Hash::make()` and `Hash::check()`.
- **SQL Injection:** Always use Eloquent or Query Builder parameter binding (built-in protection).

## Development Workflows
- **Database Changes:** Always use migrations and seeders.
- **Admin Setup:** Use `AdminUserSeeder` to manage administrative accounts.
    - *Command:* `php artisan db:seed --class=AdminUserSeeder`
