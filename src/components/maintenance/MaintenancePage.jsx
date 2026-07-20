import React, { useEffect, useState } from "react";
import { PenLine, Sparkles } from "lucide-react";
import Logo from "../../assets/hidden_pen.svg";

/**
 * MaintenancePage — "Under Maintenance" screen for Hidden Pen
 * -------------------------------------------------------------
 * Drop this file into src/components/MaintenancePage.jsx
 *
 * HOW TO USE (see bottom of file for a full App.js example):
 *
 *   1. Set an env variable in your .env file:
 *        REACT_APP_MAINTENANCE_MODE=true
 *
 *   2. In App.js, check it before rendering your routes:
 *        if (process.env.REACT_APP_MAINTENANCE_MODE === "true") {
 *          return <MaintenancePage />;
 *        }
 *
 *   3. To bring the site back, just set it to "false" (or remove it)
 *      and redeploy. No code changes needed.
 *
 * Optional prop:
 *   <MaintenancePage eta="Back online: July 22, 2026, 9:00 AM" />
 */

export default function MaintenancePage({ eta }) {
  // simple animated dot-trail so the page doesn't feel static
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
            <img src={Logo} alt="Hidden Pen logo" width={100} height={100} />
        </div>

        <p style={styles.eyebrow}>HIDDEN PEN</p>

        <h1 style={styles.heading}>
          We're sprucing things up{dots}
        </h1>

        <p style={styles.body}>
          Hidden Pen is offline for a short while as we make a few
          improvements behind the scenes. Your messages and links are safe —
          we'll be back shortly.
        </p>

        {eta && (
          <div style={styles.etaPill}>
            <Sparkles size={14} color="#ec4899" />
            <span>{eta}</span>
          </div>
        )}

        <p style={styles.footer}>Thanks for your patience — stay hidden. 💌</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f7fa",
    fontFamily:
      "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(236, 72, 153, 0.08)",
    padding: "48px 40px",
    maxWidth: "460px",
    width: "100%",
    textAlign: "center",
  },
  iconWrap: {
    width: "72px",
    height: "72px",
    margin: "0 auto 20px",
    borderRadius: "16px",
    background: "#fdf2f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#ec4899",
  },
  heading: {
    margin: "0 0 14px",
    fontSize: "28px",
    fontWeight: 800,
    color: "#ec4899",
    lineHeight: 1.25,
  },
  body: {
    margin: "0 0 20px",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#4b5563",
  },
  etaPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#fdf2f8",
    color: "#be185d",
    fontSize: "13px",
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: "999px",
    marginBottom: "18px",
  },
  footer: {
    margin: 0,
    fontSize: "13px",
    fontStyle: "italic",
    color: "#9ca3af",
  },
};

/* ------------------------------------------------------------------
   EXAMPLE: App.js integration

   import MaintenancePage from "./components/MaintenancePage";
   import { BrowserRouter, Routes, Route } from "react-router-dom";
   import Home from "./pages/Home";

   const MAINTENANCE_MODE = process.env.REACT_APP_MAINTENANCE_MODE === "true";

   function App() {
     if (MAINTENANCE_MODE) {
       return <MaintenancePage eta="Back online: July 22, 2026, 9:00 AM" />;
     }

     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<Home />} />
         </Routes>
       </BrowserRouter>
     );
   }

   export default App;
------------------------------------------------------------------- */