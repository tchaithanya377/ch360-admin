# CampusHub360 Admin Dashboard

A modern React-based admin dashboard for college management system, built with Vite and Firebase.

## Features

- Student Management
- Faculty Management
- Course Management
- Attendance Tracking
- Timetable Management
- No Dues Management
- User Management
- Form Customization
- Progressive Web App (PWA)

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: React Query
- **Routing**: React Router DOM
- **UI Components**: Custom components with Tailwind CSS
- **PWA**: Vite PWA Plugin

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode using Vite.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run preview`

Previews the production build locally.

## Deployment

This project is configured for deployment on Vercel with the following settings:

- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite
- Node.js Version: 18+

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── firebase.js         # Firebase configuration
├── main.jsx           # Application entry point
└── App.jsx            # Main App component
```

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
To learn Vite, check out the [Vite documentation](https://vitejs.dev/).
