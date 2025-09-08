![orange screenshot](/images/ogimage.png)

# Orange Board

Orange Board is a collaborative online whiteboard website. It allows users to create, draw, and collaborate in real-time on a shared canvas. Built with a Turborepo setup, the project includes an HTTP backend, a WebSocket backend, and a Next.js frontend.

## Features

- **Drawing Tools**:
  - Freehand, rectangles, circles, diamonds, lines, arrows, laser and text.
  - Customization with stroke color, stroke width, and fill options.

- **Selection & Editing**:
  - Select and move elements.
  - Resize shapes with bounding boxes and control points.
  - Edit text elements directly on the canvas.

- **Collaboration**:
  - Real-time multi-user drawing with WebSockets.
  - Shared rooms for collaboration.
  - Share sheets with others.

- **Authentication**:
  - JWT-based user authentication.
  - Guest login support with restrictions 
  - One sheet per guest and timelimit of 2hrs guest will be logged out after that.

- **Responsive Design**:
  - Optimized for desktop and mobile (including touch drawing).
  - Resizable sidebar and tool menus.

- **SEO & Marketing Ready**:
  - Optimized all pages for improved LCP and CLS performance.
  - Optimized backend calls by managing state with Zustand.
  - Added titles, meta descriptions, and OG images for SEO.

## How It Works

- **Login / Guest Access**:
  - Users can log in with an account or join as guests (2hr limit).

- **Create / Join Rooms**:
  - Registered users can create multiple sheets.
  - Guests are limited to one sheet.

- **Draw & Collaborate**:
  - Select a tool, draw shapes, or add text.
  - Move, resize, or edit existing elements.
  - Other users in the same room see updates instantly via WebSockets.
  - Also share sheets with others.

## Technology Stack

- **Frontend:** Next.js, Tailwind CSS, Zustand  
- **Backend:** Node.js, Express, WebSocket (ws), JWT, Prisma + PostgreSQL  
- **Monorepo & Tools:** Turborepo, Zod  

## Folder Structure

The project is organized as a **Turborepo** with multiple apps and shared packages:

- **apps:** Contains all the runnable applications
  - **web/**: Next.js frontend (landing page + drawing UI)
  - **http-backend/**: Express.js backend for authentication, and API routes
  - **ws-backend/**: WebSocket backend for real-time collaboration

- **packages:** Shared packages between apps
  - **database/**: Prisma client and database schema
  - **backend-common**: All common backend file 
  - **db-client**: Prisma client only for frontend
  - **schemas**: All zod schemas 

- **turbo.json**: Turborepo configuration  
- **package.json**: Root package.json with workspace scripts  
- **tsconfig.json**: Base TypeScript configuration  

## Installation & Running Locally

Clone the repository:

```bash

git clone https://github.com/VineshRajkumar/orange.git
cd orange
pnpm install

#set up environment variables:

#in root .env
PORT = 5000
CORS_ORIGIN="http://localhost:3000"
ACCESS_TOKEN_SECRET = your_acess_token
ACCESS_TOKEN_EXPIRY = 86460
GUEST_ACCESS_TOKEN_EXPIRY = 7260
REFRESH_TOKEN_SECRET = your_refresh_token
REFRESH_TOKEN_EXPIRY = 864000
WEBSOCKET_TICKET_SECRET = your_websocket_ticket_secret
WEBSOCKET_TICKET_EXPIRY = 300
DATABASE_URL= your_postgres_db_url
WEBSOCKET_PORT = 8080
WEBSOCKET_URL = "ws://localhost:8080/"
BACKEND_URL = "http://localhost:5000/"

#in web folder .env.local :- 
NEXT_PUBLIC_API_BASE_URL = "http://localhost:5000/api/v1"
NEXT_PUBLIC_GUEST_ACCESS_TOKEN_EXPIRY = 7260
NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY =  86460
NEXT_PUBLIC_BASE_URL = "http://localhost:3000"
NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
NEXT_PUBLIC_WS_URL = "ws://localhost:8080"
DATABASE_URL = your_postgres_db_url


#To run all :- 
pnpm run dev

#or run a specific app:

# Run frontend (web)
pnpm --filter web dev

# Run HTTP backend
pnpm --filter http-backend dev

# Run WebSocket backend
pnpm --filter ws-backend dev

#Build for production:
pnpm run build

#Test production:
pnpm run start


```

## What I Learned

In this project, I gained experience with:

- Structuring a **Turborepo** project with multiple apps and shared packages.
- Planned the project multiple times to implement the best approach.
- Building a **real-time collaborative app** and managing the rooms, handling race conditions using WebSockets.
- Using **Prisma** in turborepo project.
- Relearned frontend skills to make **responsive, mobile-friendly drawing UIs** with React.
- Learnt alot about the javascript canvas api
- Optimizing for **SEO and performance**.

## Future Work

- Add **undo/redo** functionality.  
- Improve **text editing** features (fonts, alignment, styling).  
- **Encrypt data elements** sent over WebSockets for added security.  
- Refine **guest session management**:
  - Currently, guest sessions are stored in local storage, which can be misused.
  - Implement **IP-based protection**:
    - Automatically delete IP data after a few days.
    - Display an IP disclaimer on the site.
- Add **visitor analytics**: track the number of visitors and likes on the website.

## Authors

- [VineshRajkumar](https://github.com/VineshRajkumar)





