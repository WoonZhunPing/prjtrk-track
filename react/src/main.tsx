import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
    // Route,
    // Link
} from 'react-router-dom';

import './index.css'
import App from "./pages/App";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectPage from "./pages/ProjectPage";
import CreateProject from './pages/CreateProject';
import UserPage from "./pages/UserPage";
import CreateUser from './pages/CreateUser';
import Logout from './pages/Logout';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/project',
        element: <ProjectPage />,
    },
    {
        path: '/createproject',
        element: <CreateProject />,
        children: [
            {
                path: '/createproject/:id',
                element: <CreateProject />
            }
        ]
    },
    {
        path: '/user',
        element: <UserPage />
    },
    {
        path: '/createuser',
        element: <CreateUser />,
        children: [
            {
                path: '/createuser/:id',
                element: <CreateUser />
            }
        ]
    },
    /*
    TODO add feedback page
    * {
    *   path: '/feedback',
    *   element: 
    * },
    */
    {
        path: '/logout',
        element: <Logout />
    }
], {
    basename: '/prjtrk/web/'
});


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
