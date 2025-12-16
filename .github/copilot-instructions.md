# AI Coding Agent Instructions

## Project Overview
This project is a CMS (Content Management System) for managing blog posts, categories, tags, and market data. It includes both an admin interface and public-facing pages. The backend is built with Next.js API routes, and the frontend uses React components. Data is stored in MongoDB and cached in Redis.

### Key Features
- **Admin Panel**: Manage posts, categories, tags, and market lists.
- **Bulk Upload**: Upload CSV files for price bars and market lists.
- **Public Blog**: Display blog posts, categories, and tags.
- **API Endpoints**: Provide data for admin and public interfaces.

## Architecture
- **Frontend**: Located in the `app/` directory, with subdirectories for admin (`app/admin/`) and public pages (`app/blog/`).
- **Backend**: API routes are in `app/api/`, organized by feature (e.g., `app/api/admin/`, `app/api/cms/`).
- **Components**: Shared React components are in `components/`, with subdirectories for CMS-specific components (`components/CMS/`) and UI elements (`components/ui/`).
- **Models**: MongoDB models are defined in `models/`.
- **Utilities**: Helper functions are in `lib/`.

## Developer Workflows

### Running the Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Testing Bulk Upload
- **Price Bars**:
  1. Navigate to `/admin/instruments`.
  2. Use `sample-price-bars.csv` from the `public/` directory.
  3. Upload the file and verify the data.
- **Market Lists**:
  1. Navigate to `/admin/market-lists/new`.
  2. Use the sample CSV template provided in the interface.
  3. Upload the file and verify the data.

### Debugging
- Use the `debug/` directory for scripts to check system health (`check.ts`) and setup configurations (`setup.ts`).
- API health check: `GET /api/admin/health`.

## Project-Specific Conventions
- **File Structure**: Follow the modular structure under `app/` and `components/`.
- **API Design**: Use RESTful principles. All admin endpoints require authentication.
  - **CSV Formats**: Ensure CSV files match the expected formats described in the [README.md](../README.md).

## External Dependencies
- **MongoDB**: Database for storing CMS data.
- **Redis**: Caching layer for performance optimization.
- **Libraries**: Key libraries include `next-auth` for authentication and `mongoose` for MongoDB interactions.

## Examples
- **Admin Post Form**: See `components/CMS/AdminPostForm.tsx` for an example of form handling.
- **API Route**: See `app/api/admin/market-lists/route.ts` for an example of a bulk upload endpoint.

## Notes
- Refer to `README.md` for additional details on workflows and API endpoints.
- Ensure all new code adheres to the existing modular structure and naming conventions.