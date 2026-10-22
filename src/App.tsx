import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Home from './pages/Home';

const Evaluation = lazy(() => import('./pages/Evaluation'));
const Officer = lazy(() => import('./pages/Officer'));

export default function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/officer"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[60vh] text-gray-400 dark:text-gray-500">
                    Loading Command Portal…
                  </div>
                }
              >
                <Officer />
              </Suspense>
            }
          />
          <Route
            path="/evaluation"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[60vh] text-gray-400 dark:text-gray-500">
                    Loading…
                  </div>
                }
              >
                <Evaluation />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
