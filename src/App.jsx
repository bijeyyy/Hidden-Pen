import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate
} from 'react-router-dom'

import {
  Navbar,
  Home,
  About,
  Features,
  Works,
  Footer
} from './components/layout'

import {
  Login,
  SignUp,
  EmailConfirmed,
  Forgot_Password,
  VerifyNotice
} from './validation'

import { User_Dashboard } from './components/User'
import {
  UserFavorites,
  UserInbox,
  UserProfile,
  UserSettings,
  PublicMessages
} from './components/UserActivity'

import { useEffect, useState, useRef } from 'react'
import { supabase } from './lib/SupabaseClient'
import MaintenancePage from "./components/maintenance/MaintenancePage"


function AuthGate({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const checkedRef = useRef(false)
  const [ready, setReady] = useState(checkedRef.current)

  useEffect(() => {
    if (checkedRef.current) return

    let cancelled = false

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data?.session?.user

      const publicPages = [
        "/",
        "/login",
        "/signup",
        "/VerifyNotice",
        "/EmailConfirmed",
        "/forgot_password"
      ]

      const isPublic =
        publicPages.includes(location.pathname) ||
        location.pathname.startsWith("/u/")

      if (!cancelled) {
        if (!user && !isPublic) navigate("/login")
        checkedRef.current = true
        setReady(true)
      }
    }

    checkSession()
    return () => { cancelled = true }
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-body">Loading...</p>
      </div>
    )
  }

  return children
}


function ThemeManager() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const user = session.user

          const avatar =
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            ""

          if (avatar) {
            await supabase
              .from("profiles")
              .update({ avatar_url: avatar })
              .eq("id", user.id)
          }

          const hash = window.location.hash

          if (hash && hash.includes("access_token")) {
            window.history.replaceState(null, "", window.location.pathname)
            navigate("/user_settings")
          }
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const theme = localStorage.getItem("theme")

    const publicPages = [
      "/",
      "/login",
      "/signup",
      "/VerifyNotice",
      "/EmailConfirmed",
      "/forgot_password"
    ]

    const isPublicPage = publicPages.includes(location.pathname)

    if (isPublicPage) {
      document.documentElement.classList.remove("dark")
      return
    }

    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [location.pathname])

  return null
}

const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === "true";

function App() {
  if (MAINTENANCE_MODE) {
    return <MaintenancePage eta="Back online: We will update you" />;
  }
  return (
    <BrowserRouter>
      <AuthGate>
        <ThemeManager />

        <Routes>

          {/* HOME */}
          <Route path="/" element={
            <div className='grid justify-center items-center'>
              <Navbar />
              <section id="home"><Home /></section>
              <section id="about"><About /></section>
              <section id="features"><Features /></section>
              <section id="works"><Works /></section>
              <Footer />
            </div>
          } />

          {/* AUTH */}
          <Route path="/login" element={<div className='grid justify-center items-center mt-12'><Login /></div>} />
          <Route path="/signup" element={<div className='grid justify-center items-center mt-8'><SignUp /></div>} />
          <Route path="/VerifyNotice" element={<VerifyNotice />} />
          <Route path="/EmailConfirmed" element={<EmailConfirmed />} />
          <Route path="/forgot_password" element={<div className='grid justify-center items-center mt-32'><Forgot_Password /></div>} />

          {/* USER */}
          <Route path="/user_dashboard" element={<User_Dashboard />} />
          <Route path="/user_inbox" element={<UserInbox />} />
          <Route path="/user_favorites" element={<UserFavorites />} />
          <Route path="/user_settings" element={<UserSettings />} />
          <Route path="/user_profile" element={<UserProfile />} />

          {/* PUBLIC */}
          <Route path="/u/:username" element={<PublicMessages />} />

        </Routes>
      </AuthGate>
    </BrowserRouter>
  )
}

export default App