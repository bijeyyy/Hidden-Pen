import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import logo from '../../assets/hidden_pen.svg';
import './styles/home.css';

function Navbar() {
    const [NavOpen, setNavOpen] = useState(false);
    const [active, setActive] = useState("home");

    const NavMenu = () => {
        setNavOpen(prev => !prev);
    };

    const closeMenu = (section) => {
        setActive(section);
        setNavOpen(false);
    };

    useEffect(() => {
        const sections = document.querySelectorAll("section");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                    }
                });
            },
            {
                threshold: 0.5,
            }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });

        return () => {
            sections.forEach((section) => {
                observer.unobserve(section);
            });
        };
    }, []);

    return (
        <header>
            <div className="fixed top-0 left-0 right-0 z-50 w-full max-w-screen overflow-x-hidden bg-navbar text-navbar-text shadow-card-shadow">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex w-full items-center justify-between">
                        <a href="#home" onClick={() => closeMenu("home")} className="shrink-0">
                            <img
                                src={logo}
                                alt="hidden-pen"
                                className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                            />
                        </a>

                        <nav className="hidden lg:flex items-center gap-8 font-body">
                            <a
                                href="#home"
                                className={`nav-link ${active === "home" ? "active" : ""}`}
                                onClick={() => setActive("home")}
                            >
                                Home
                            </a>

                            <a
                                href="#about"
                                className={`nav-link ${active === "about" ? "active" : ""}`}
                                onClick={() => setActive("about")}
                            >
                                About
                            </a>

                            <a
                                href="#features"
                                className={`nav-link ${active === "features" ? "active" : ""}`}
                                onClick={() => setActive("features")}
                            >
                                Features
                            </a>

                            <a
                                href="#how-it-works"
                                className={`nav-link ${active === "how-it-works" ? "active" : ""}`}
                                onClick={() => setActive("how-it-works")}
                            >
                                How It Works
                            </a>
                        </nav>

                        <div className="hidden lg:flex items-center">
                            <Link to="/Login">
                                <button
                                    type="button"
                                    className="text-white bg-button border border-transparent hover:bg-button-hover shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer"
                                >
                                    Get Started
                                </button>
                            </Link>
                        </div>

                        <button
                            onClick={NavMenu}
                            aria-label="Toggle navigation menu"
                            aria-expanded={NavOpen}
                            className="lg:hidden shrink-0 text-3xl leading-none p-2"
                        >
                            {NavOpen ? "×" : "☰"}
                        </button>
                    </div>

                    {NavOpen && (
                        <nav className="lg:hidden mt-4 pb-3 font-body">
                            <a href="#home" onClick={() => closeMenu("home")} className="block text-lg text-pink-500 py-3 px-2">Home</a>
                            <hr className="border-t border-gray-300" />

                            <a href="#about" onClick={() => closeMenu("about")} className="block text-lg text-pink-500 py-3 px-2">About</a>
                            <hr className="border-t border-gray-300" />

                            <a href="#features" onClick={() => closeMenu("features")} className="block text-lg text-pink-500 py-3 px-2">Features</a>
                            <hr className="border-t border-gray-300" />

                            <a href="#how-it-works" onClick={() => closeMenu("how-it-works")} className="block text-lg text-pink-500 py-3 px-2">How It Works</a>
                            <hr className="border-t border-gray-300" />

                            <div className="pt-4 px-2">
                                <Link to="/login" onClick={() => setNavOpen(false)}>
                                    <button
                                        type="button"
                                        className="h-12 w-full text-white bg-button border border-transparent hover:bg-button-hover focus:ring-4 focus:ring-button-hover shadow-xs font-medium rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer"
                                    >
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;