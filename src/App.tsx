// ============================================================
// App root – just provides the router.
// All layout, shell, and pages live inside the router.
// ============================================================

import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  useDarkMode();
  return <RouterProvider router={router} />;
}

export default App;
