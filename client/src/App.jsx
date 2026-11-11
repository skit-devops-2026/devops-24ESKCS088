import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <h1>📚 Study Planner (MERN Stack)</h1>
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Module 1 initialized successfully. Ready for Module 2 database schemas and frontend component migration.
            </p>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
