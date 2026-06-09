import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar, Home, About, Features, Works, Footer } from './components/layout'
import { Login, SignUp, EmailConfirmed, Forgot_Password, VerifyNotice } from './validation'
import { User_Dashboard } from './components/User'
import { UserFavorites, UserInbox, UserProfile, UserSettings, PublicMessages } from './components/UserActivity'
import { useEffect } from 'react'

function ThemeManager() {
  const location = useLocation();

  useEffect(() => {
    const theme = localStorage.getItem("theme");

    const publicPages = [
      "/",
      "/login",
      "/signup",
      "/VerifyNotice",
      "/EmailConfirmed",
      "/forgot_password"
    ];

    const isPublicPage = publicPages.includes(location.pathname);

    if (isPublicPage) {
      document.documentElement.classList.remove("dark");
      return;
    }

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

  }, [location.pathname]);

  return null;
}

function App() {

  return (
    <>

      <BrowserRouter>
        <ThemeManager />
        <Routes>
          <Route path="/" element={
            <div className='grid justify-center items-center'>
              <Navbar />

              <section id="home">
                <Home />
              </section>

              <section id="about">
                <About />
              </section>

              <section id="features">
                <Features />
              </section>

              <section id="works">
                <Works />
              </section>

              <Footer />
            </div>
          } />

          {/* LOGIN */}
          <Route path="/login" element={
            <div className='grid justify-center items-center mt-12'>
              <Login />
            </div>
          } />

          {/* SIGNUP */}
          <Route path="/signup" element={
            <div className='grid justify-center items-center mt-8'>
              <SignUp />
            </div>
          } />

          {/* VERIFY NOTICE */}
          <Route path="/VerifyNotice" element={
            <VerifyNotice />
          } />

          {/* EMAIL CONFIRMATION */}
          <Route path="/EmailConfirmed" element={
            <EmailConfirmed />
          } />

          {/* FORGOR PASSWORD */}
          <Route path="/forgot_password" element={
            <div className='grid justify-center items-center mt-32'>
              <Forgot_Password />
            </div>
          } />

          {/* USER DASHBOARD */}
          <Route path="/user_dashboard" element={
            <div>
              <User_Dashboard />
            </div>
          } />

          {/* FAVORITES INBOX */}
          <Route path="/user_inbox" element={
            <div>
              <UserInbox />
            </div>
          } />

          {/* USER FAVORITES */}
          <Route path="/user_favorites" element={
            <div>
              <UserFavorites />
            </div>
          } />

          {/* USER SETTINGS */}
          <Route path="/user_settings" element={
            <div>
              <UserSettings />
            </div>
          } />

          {/* USER PROFILE */}
          <Route path="/user_profile" element={
            <div>
              <UserProfile />
            </div>
          } />

          {/* USER MESSAGES */}
          <Route path="/u/:username" element={
            <div>
              <PublicMessages />
            </div>
          } />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
