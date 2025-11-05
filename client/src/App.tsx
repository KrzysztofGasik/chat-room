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

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <AppContent />
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
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/:id"
          element={
            <ProtectedRoute>
              <ChatRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </SocketContextProvider>
  );
}

export default App;
