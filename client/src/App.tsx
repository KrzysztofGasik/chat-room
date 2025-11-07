import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route';
import { AuthContextProvider, useAuthContext } from './context/auth-context';
import { SignIn } from './components/auth/signin';
import { SignUp } from './components/auth/signup';
import { RoomsPage } from './pages/rooms-page';
import { ChatRoomPage } from './pages/chat-room-page';
import { SocketContextProvider } from './context/socket-context';
import { ProfilePage } from './pages/profile-page';
import { Navbar } from './components/navbar/navbar';
import { AuthLayout } from './layout/auth-layout';
import { MainLayout } from './layout/main-layout';
import { SnackbarContextProvider } from './context/snackbar-context';

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <SnackbarContextProvider>
          <AppContent />
        </SnackbarContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { user } = useAuthContext();
  return (
    <SocketContextProvider>
      {user && <Navbar />}
      <Routes>
        <Route
          path="/signin"
          element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignUp />
            </AuthLayout>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <RoomsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChatRoomPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <ProfilePage />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </SocketContextProvider>
  );
}

export default App;
