
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>TweetApp</h2>

        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/profile/1">Profile</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>

        {isAuthenticated ? (
          <div>
            <p>{currentUser?.name}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
