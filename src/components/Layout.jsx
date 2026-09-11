
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Plus,
} from 'lucide-react'

import { supabase } from '../services/supabase'

export default function Layout({ children, onAdd }) {
  const nav = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    nav('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>IP</span>

          <div>
            <b>INAS PRAMITHA</b>
            <small>MUA</small>
          </div>
        </div>

        <nav>
          <NavLink to="/">
            <LayoutDashboard />
            Dashboard
          </NavLink>

          <NavLink to="/jadwal">
            <CalendarDays />
            Jadwal
          </NavLink>

          <NavLink to="/kalender">
            <CalendarDays />
            Kalender
          </NavLink>
        </nav>

        <button className="logout" onClick={logout}>
          <LogOut />
          Keluar
        </button>
      </aside>

      <main className="main">
        <header className="mobile-header">
          <div className="brand">
            <span>IP</span>
            <b>INAS PRAMITHA MUA</b>
          </div>
        </header>

        {children}
      </main>

      <nav className="bottom-nav">
        <NavLink to="/">
          <LayoutDashboard />
          Dashboard
        </NavLink>

        <NavLink to="/jadwal">
          <CalendarDays />
          Jadwal
        </NavLink>

        <NavLink to="/kalender">
          <CalendarDays />
          Kalender
        </NavLink>
      </nav>

      <button
        className="fab"
        onClick={onAdd}
        aria-label="Tambah jadwal"
      >
        <Plus />
      </button>
    </div>
  )
}

