import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import { Navigate, Route, Routes } from 'react-router-dom'
import ScanUpload from "./pages/ScanUpload";
import Home from './pages/Home'
import ScanCamera from './pages/ScanCamera'
import ScanHistoryPage from './pages/ScanHistoryPage'
import ScanPrescription from './pages/ScanPrescription'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        />
        <Route path="/scan" element={
          <ProtectedRoute>
            <ScanUpload />
          </ProtectedRoute>
        } />
        <Route
          path="/scan-camera" element={
            <ProtectedRoute>
              <ScanCamera />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan-history" element={
            <ProtectedRoute>
              <ScanHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan-prescription" element={
          <ProtectedRoute>
            <ScanPrescription />
          </ProtectedRoute>
        }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default App
