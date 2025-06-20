import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LibraryView from './pages/LibraryView.jsx'
import './styles/App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/library" element={<LibraryView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
