import './App.css'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { HackathonRegistration } from './components/HackathonRegistration'
import { AdminLayout } from './components/AdminLayout'
import { AdminDashboard } from './pages/admin/Dashboard'
import { Participants } from './pages/admin/Students'
import { Schedule } from './pages/admin/Schedule'
import { Settings } from './pages/admin/Settings'
import { Messages } from './pages/admin/Messages'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <BrowserRouter>
      <Toaster position='top-right' />
      <Routes>
        <Route path="/" element={<HackathonRegistration />} />
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/participants" element={<AdminLayout><Participants /></AdminLayout>} />
        <Route path="/admin/schedule" element={<AdminLayout><Schedule /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
        <Route path="/admin/messages" element={<AdminLayout><Messages /></AdminLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
