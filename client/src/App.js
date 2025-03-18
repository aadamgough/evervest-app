import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Investments from './pages/Investments';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Responses from './pages/Responses';
import ResponseDetail from './pages/ResponseDetail';
import InvestmentPlan from './pages/InvestmentPlan';
import Questionnaire from './pages/Questionnaire';
import WealthQuestionnaire from './pages/WealthQuestionnaire';
import RiskToleranceQuestionnaire from './pages/RiskToleranceQuestionnaire';
import ESGQuestionnaire from './pages/ESGQuestionnaire';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';

import './App.css';

function App() {
  return (
    <AuthProvider>
    <AnimatePresence mode="wait">
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/responses" element={<Responses />} />
        <Route path="/responses/:type" element={<ResponseDetail />} />
        <Route path = "/investmentplan" element={<InvestmentPlan/>} />
        <Route path="/questionnaire/wealth" element={<WealthQuestionnaire />} />
      </Routes>
    </Router>
    </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
