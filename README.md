# Monk Mode

Monk Mode is a full-stack productivity app built with React (Vite) on the frontend and C# with Entity Framework Core on the backend. It allows users to manage tasks and time blocks, connect with friends, and view profiles.

## Features
- Add and manage time blocks
- Create tasks and link them to time blocks
- Connect with friends
- User authentication and profile management

## Tech Stack
- **Frontend:** React, Vite
- **Backend:** C#, .NET, Entity Framework Core
- **Database:** SQL Server

## Setup
### Backend
1. Navigate to the backend directory:
   ```sh
   cd monk-mode-backend
   ```
2. Install dependencies:
   ```sh
   dotnet restore
   ```
3. Run database migrations:
   ```sh
   dotnet ef database update
   ```
4. Start the backend server:
   ```sh
   dotnet run
   ```

### Frontend
1. Navigate to the frontend directory:
   ```sh
   cd monk-mode-frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm run dev
   ```
