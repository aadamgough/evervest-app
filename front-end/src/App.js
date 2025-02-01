import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Investments from './pages/Investments';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Questionnaire from './pages/Questionnaire';
import WealthQuestionnaire from './pages/WealthQuestionnaire';
import RiskToleranceQuestionnaire from './pages/RiskToleranceQuestionnaire';
import ESGQuestionnaire from './pages/ESGQuestionnaire';
import { AuthProvider } from './contexts/AuthContext';

import './App.css';

function App() {
  return (
    <AuthProvider>
    <AnimatePresence mode="wait">
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/our-story" element={<Investments />} />
        <Route path="/our-team" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/questionnaire/wealth" element={<WealthQuestionnaire />} />
        <Route path="/questionnaire/risk" element={<RiskToleranceQuestionnaire />} />
        <Route path="/questionnaire/esg" element={<ESGQuestionnaire />} />
      </Routes>
    </Router>
    </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
