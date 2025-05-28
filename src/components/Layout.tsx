import { Outlet, NavLink } from 'react-router-dom'

function Layout() {
  return (
    <>
      <div className="sticky-header">
        <nav className="nav-links">
          <NavLink to="/stock-price" className="nav-link">Stock Price</NavLink>
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        </nav>
      </div>
      <Outlet />
    </>
  )
}

export default Layout