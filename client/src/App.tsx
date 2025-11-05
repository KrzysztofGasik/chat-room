import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route';
import { AuthContextProvider } from './context/auth-context';
import { SignIn } from './components/auth/signin';
import { SignUp } from './components/auth/signup';
import { RoomsPage } from './pages/rooms-page';
import { ChatRoomPage } from './pages/chat-room-page';
import { SocketContextProvider } from './context/socket-context';

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <SocketContextProvider>
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
          </Routes>
        </SocketContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
