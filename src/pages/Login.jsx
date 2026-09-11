
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErr('Email atau password salah. Pastikan akun Supabase sudah dibuat.')
    } else {
      nav('/')
    }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="monogram">IP</div>
        <p>INAS PRAMITHA MUA</p>
        <small>MAKEUP SCHEDULE & BOOKING</small>
      </div>

      <div className="login-box">
        <p className="eyebrow">PRIVATE APP</p>

        <h1>Welcome back.</h1>

        <p className="muted">
          Kelola jadwal makeup dan pemasukanmu dengan lebih tenang.
        </p>

        {err && <div className="error">{err}</div>}

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button className="primary wide" disabled={loading}>
            {loading ? 'LOGIN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  )
}