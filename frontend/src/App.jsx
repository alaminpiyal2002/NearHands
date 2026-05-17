import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordConfirmPage from "./pages/ResetPasswordConfirmPage";
import ServiceListPage from "./pages/ServiceListPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import RequestBoardPage from "./pages/RequestBoardPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import PostRequestPage from "./pages/PostRequestPage";
import MyProfilePage from "./pages/MyProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ChatWindowPage from "./pages/ChatWindowPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthGuard from "./routes/AuthGuard";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import ProviderDashboardPage from "./pages/ProviderDashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "password-reset",
        element: <ForgotPasswordPage />,
      },
      {
        path: "password-reset/confirm",
        element: <ResetPasswordConfirmPage />,
      },
      {
        path: "services",
        element: <ServiceListPage />,
      },
      {
        path: "services/:id",
        element: <ServiceDetailPage />,
      },
      {
        path: "requests",
        element: <RequestBoardPage />,
      },
      {
        path: "requests/new",
        element: (
          <AuthGuard roles={["customer"]}>
            <PostRequestPage />
          </AuthGuard>
        ),
      },
      {
        path: "requests/:id",
        element: <RequestDetailPage />,
      },
      {
        path: "profile/me",
        element: (
          <AuthGuard>
            <MyProfilePage />
          </AuthGuard>
        ),
      },
      {
        path: "profile/:id",
        element: <ProviderProfilePage />,
      },
      {
        path: "dashboard",
        element: (
          <AuthGuard roles={["provider"]}>
            <ProviderDashboardPage />
          </AuthGuard>
        ),
      },
      {
        path: "messages",
        element: (
          <AuthGuard>
            <MessagesPage />
          </AuthGuard>
        ),
      },
      {
        path: "messages/:id",
        element: (
          <AuthGuard>
            <ChatWindowPage />
          </AuthGuard>
        ),
      },
      {
        path: "notifications",
        element: (
          <AuthGuard>
            <NotificationsPage />
          </AuthGuard>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;