import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function isAdmin(roles: string[]): boolean {
  return roles.some((r) => r.toUpperCase().includes("ADMIN"));
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      {/* Promo Banner */}
      <div className="promo-banner">
        Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!
        <a href="#">ShopNow</a>
      </div>

      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            Exclusive
          </Link>
          
          <nav className="main-nav">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/contact" className={navClass}>
              Contact
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
            {!user && (
              <NavLink to="/register" className={navClass}>
                Sign Up
              </NavLink>
            )}
          </nav>

          <div className="header-search">
            <input type="text" placeholder="What are you looking for?" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          <div className="header-actions">
            {user && (
              <>
                <Link to="/orders" className="header-icon" title="Orders">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </Link>
                <Link to="/payments" className="header-icon" title="Payments">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </Link>
                <Link to="/cart" className="header-icon" title="Cart">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </Link>
              </>
            )}

            {user ? (
              <div className="header-actions">
                <Link to="/seller" className="header-icon" title="Seller Dashboard">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </Link>
                {isAdmin(user.roles) && (
                  <Link to="/admin" className="btn ghost small" title="Admin Portal">
                    Admin
                  </Link>
                )}
                <span className="user-pill" title={user.email}>
                  {user.username}
                </span>
                <button type="button" className="btn ghost small" onClick={logout}>
                  Log out
                </button>
              </div>
            ) : (
              <Link to="/login" className="header-icon" title="Login">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="site-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-section">
            <h4>Exclusive</h4>
            <p><strong>Subscribe</strong></p>
            <p>Get 10% off your first order</p>
            <div className="footer-subscribe">
              <input type="email" placeholder="Enter your email" />
              <button type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <p>111 Bijoy sarani, Dhaka,<br/>DH 1515, Bangladesh.</p>
            <p>exclusive@gmail.com</p>
            <p>+88015-88888-9999</p>
          </div>

          <div className="footer-section">
            <h4>Account</h4>
            <Link to="/login">My Account</Link>
            <Link to="/register">Login / Register</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/">Shop</Link>
          </div>

          <div className="footer-section">
            <h4>Quick Link</h4>
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms Of Use</Link>
            <Link to="/about">FAQ</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-section">
            <h4>Download App</h4>
            <p style={{ fontSize: "0.75rem", color: "#999" }}>Save $3 with App New User Only</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: "36px" }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style={{ height: "36px" }} />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <a href="#" style={{ color: "#fff" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" style={{ color: "#fff" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" style={{ color: "#fff" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" style={{ color: "#fff" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © Copyright Exclusive 2024. All right reserved
        </div>
      </footer>
    </div>
  );
}
