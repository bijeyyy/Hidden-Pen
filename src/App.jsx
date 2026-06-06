import './App.css'
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { Navbar, Home, About, Features, Works, Footer } from './components/layout'
import { Login, SignUp, EmailConfirmed, Forgot_Password, VerifyNotice } from './validation'
import { User_Dashboard } from './components/User'
import { UserFavorites, UserInbox, UserLink, UserProfile, UserSettings, PublicMessages } from './components/UserActivity'
import { useEffect } from 'react'

function App() {

  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <>

      <BrowserRouter>
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

        {/* FAVORITES lINK */}
        <Route path="/user_link" element={
          <div>
            <UserLink />
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

export default App
