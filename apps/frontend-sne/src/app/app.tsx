import { RouterProvider, type createBrowserRouter } from "react-router-dom";

export function App({ router }: { router: ReturnType<typeof createBrowserRouter> }) {
  return <RouterProvider router={router} />;
}

export default App;
