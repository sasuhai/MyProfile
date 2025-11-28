import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import UsernamePrompt from './pages/UsernamePrompt'
import LandingPage from './pages/LandingPage'
import UserPortfolio from './pages/UserPortfolio'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Routes>
              {/* Username prompt at root */}
              <Route path="/" element={<UsernamePrompt />} />

              {/* Browse all portfolios */}
              <Route path="/all" element={<LandingPage />} />

              {/* Admin routes (no navbar/footer) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* User portfolio routes (with username) */}
              <Route path="/:username/*" element={<UserPortfolio />} />
            </Routes>
          </div>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
