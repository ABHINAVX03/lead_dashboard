# Smart Leads Dashboard

Smart Leads Dashboard is a full-stack MERN lead management app with authentication, role-based access, lead CRUD, filtering, pagination, CSV export, dark mode, and Docker deployment support.

## Tech Stack

- Client: React 18, TypeScript, Vite, Tailwind CSS
- Server: Node.js, Express, TypeScript, MongoDB, Mongoose
- Auth: JWT with admin and sales roles
- Deployment: Docker Compose with Nginx serving the client and proxying `/api`

## Features

- Register and log in users
- Register admin users with an admin secret key
- Sales users can manage their own leads
- Admin users can view and manage all leads
- Create, edit, delete, search, filter, sort, and paginate leads
- Export visible leads to CSV
- Seed sample demo data
- Toggle light and dark mode

## Local Setup

### Requirements

- Node.js 18 or newer
- npm
- MongoDB running locally, or Docker Desktop

### 1. Configure Environment

Copy the example files and update values as needed:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

For local development, the default values are:

```env
server/.env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lead_dashboard
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
ADMIN_SECRET_KEY=replace_with_a_private_admin_signup_secret
CLIENT_ORIGIN=http://localhost:3000
```

```env
client/.env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
cd server
npm install

cd ..\client
npm install
```

### 3. Run the App Locally

Open one terminal for the server:

```bash
cd server
npm run dev
```

Open another terminal for the client:

```bash
cd client
npm run dev
```

Visit:

```text
http://localhost:3000
```

## Seed Sample Data

Make sure MongoDB is running and `server/.env` points to the same database used by the server.

```bash
cd server
npm run seed
```

By default this creates or reuses:

```text
Email: admin@example.com
Password: Admin123
```

Then it inserts 50 sample leads owned by that admin user.

To seed leads for a different user email:

```bash
npm run seed -- --email=your-user@example.com
```

## Application Manual

### Sign In

1. Open the client URL.
2. Use an existing account, or use the seeded demo admin account after running `npm run seed`.
3. After login, the app opens the dashboard.

### Register a Sales User

1. Go to the register page.
2. Enter name, email, and password.
3. Leave "Register as Admin" unchecked.
4. Submit the form.

Sales users can only see and manage leads they created.

### Register an Admin

1. Go to the register page.
2. Check "Register as Admin".
3. Enter the admin secret from `ADMIN_SECRET_KEY`.
4. Submit the form.

Admins can view and manage all leads.

### Manage Leads

- Add Lead: click `+ Add Lead`, fill in the form, and save.
- Edit Lead: click `Edit` in the table row.
- Delete Lead: click `Delete` in the table row and confirm.
- Search: use the search box to match name or email.
- Filter: select status or source.
- Sort: choose latest or oldest.
- Pagination: use the page controls below the table.
- Export CSV: click `Export CSV` to download the currently filtered lead list.

## Docker Deployment

Create a root `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Set strong production values:

```env
JWT_SECRET=use_a_long_random_secret
ADMIN_SECRET_KEY=use_a_private_admin_signup_secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/lead_dashboard
CLIENT_ORIGIN=
```

Build and run:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost
```

The Nginx client container proxies API requests from `/api` to the server container.

## Production Notes

- Do not commit real `.env` files.
- Replace all example secrets before deployment.
- Use HTTPS in front of the app.
- Use a managed MongoDB service or a backed-up MongoDB volume.
- Set `CLIENT_ORIGIN` to your production origin if the API is exposed directly.
- Run `npm run build` in both `client` and `server` before release.
- Review [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md) before deployment.

## Useful Commands

```bash
cd client && npm run build
cd server && npm run build
cd server && npm run seed
docker compose --env-file .env.example config
docker compose up -d --build
docker compose logs -f
docker compose down
```
