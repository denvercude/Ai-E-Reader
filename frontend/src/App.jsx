import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LibraryView from './pages/LibraryView.jsx'
import LoginSignUpPage from './pages/LoginSignUpPage.jsx'
import './styles/App.css'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/library" element={
            <ProtectedRoute>
                <LibraryView />
            </ProtectedRoute>
        } />
        <Route path="/login-signup" element={<LoginSignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
