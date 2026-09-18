import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

// ============================================================
// App root – just provides the router.
// All layout, shell, and pages live inside the router.
// ============================================================

function App() {
  return <RouterProvider router={router} />;
}

export default App;
