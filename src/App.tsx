import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import BuildEntry from "./BuildEntry";
import Login from "./components/Login";
import { UserProvider } from "./context/user-context";
import { ThemeProvider } from "./context/theme-context";
import Settings from "./components/Settings";

function App() {
  const router = createBrowserRouter([
    {
      path: "/chatzy/",
      element: <BuildEntry />,
      children: [
        {
          path: "/chatzy/",
          element: <BuildEntry />,
        },
        {
          path: "/chatzy/setting",
          element: <Settings />,
        },
      ],
    },
    {
      path: "/chatzy/login",
      element: <Login />,
    },
  ]);

  return (
    <ThemeProvider>
      <UserProvider>
        <RouterProvider router={router}></RouterProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
