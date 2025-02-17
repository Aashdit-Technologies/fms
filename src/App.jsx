import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageLoader } from "./components/pageload/PageLoader";
import { ProtectedRoute } from "./components/proctectdroute/ProtectedRoute";
import { PublicRoute } from "./components/publicroute/PublicRoute";
import {
  setupTokenExpirationChecker,
  checkTokenExpiration,
} from "./utils/tokenUtils";
import GlobalStyleFont from "./Fonts/GlobalStyleFont";

const LoginPage = React.lazy(() => import("./components/LoginPage/LoginPage"));
const AdminPanel = React.lazy(() => import("./components/Admin/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    setupTokenExpirationChecker();

    return () => {
      window.removeEventListener("focus", checkTokenExpiration);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          closeOnClick
          pauseOnFocusLoss
        />
        <GlobalStyleFont />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
