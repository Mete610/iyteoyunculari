import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Plays from './components/Plays';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FestivalApplication from './components/FestivalApplication';
import Login from './components/admin/Login';
import AdminPanel from './components/admin/AdminPanel';
import JoinCommunity from './components/JoinCommunity';

const MainPage = () => (
  <>
    <Navbar />
    <Hero />
    <About />
    <Plays />
    <Contact />
    <Footer />
  </>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans selection:bg-red-900 selection:text-white">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/basvuru" element={<FestivalApplication />} />
          <Route path="/katil" element={<JoinCommunity />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
