
import React, { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import Layout from './components/Layout'
import AppointmentForm from './components/AppointmentForm'
import ConfirmModal from './components/ConfirmModal'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Calendar from './pages/Calendar'

import { useAuth } from './contexts/AuthContext'
import { useAppointments } from './hooks/useAppointments'
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from './services/appointments'

function Protected({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="screen-loading">Memuat aplikasi...</div>
  }

  return session ? children : <Navigate to="/login" replace />
}

function App() {
  const { session } = useAuth()
  const { items, loading, error, refresh } = useAppointments()

  const [form, setForm] = useState({
    open: false,
    item: null,
  })

  const [del, setDel] = useState(null)

  const nav = useNavigate()

  const save = async (values) => {
    if (form.item) {
      await updateAppointment(form.item.id, values)
    } else {
      await createAppointment(values)
    }

    await refresh()
  }

  const remove = async () => {
    if (del) {
      await deleteAppointment(del.id)
      setDel(null)
      await refresh()
    }
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/" /> : <Login />}
      />

      <Route
        path="*"
        element={
          <Protected>
            <Layout
              onAdd={() =>
                setForm({
                  open: true,
                  item: null,
                })
              }
            >
              {loading ? (
                <div className="screen-loading">
                  Memuat jadwal...
                </div>
              ) : error ? (
                <div className="page">
                  <div className="error">{error}</div>

                  <button
                    className="primary"
                    onClick={refresh}
                  >
                    Coba lagi
                  </button>
                </div>
              ) : (
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Dashboard
                        items={items}
                        onAdd={() =>
                          setForm({
                            open: true,
                            item: null,
                          })
                        }
                        onEdit={(x) =>
                          setForm({
                            open: true,
                            item: x,
                          })
                        }
                        onDelete={setDel}
                      />
                    }
                  />

                  <Route
                    path="/jadwal"
                    element={
                      <Schedule
                        items={items}
                        onAdd={() =>
                          setForm({
                            open: true,
                            item: null,
                          })
                        }
                        onEdit={(x) =>
                          setForm({
                            open: true,
                            item: x,
                          })
                        }
                        onDelete={setDel}
                      />
                    }
                  />

                  <Route
                    path="/kalender"
                    element={
                      <Calendar
                        items={items}
                        onEdit={(x) =>
                          setForm({
                            open: true,
                            item: x,
                          })
                        }
                        onDelete={setDel}
                      />
                    }
                  />

                  <Route
                    path="*"
                    element={
                      <div className="page empty">
                        <h1>404</h1>
                        <p>Halaman tidak ditemukan.</p>

                        <button
                          className="primary"
                          onClick={() => nav('/')}
                        >
                          Kembali ke Dashboard
                        </button>
                      </div>
                    }
                  />
                </Routes>
              )}

              <AppointmentForm
                open={form.open}
                initial={form.item}
                onClose={() =>
                  setForm({
                    open: false,
                    item: null,
                  })
                }
                onSubmit={save}
              />

              <ConfirmModal
                open={!!del}
                onClose={() => setDel(null)}
                onConfirm={remove}
              />
            </Layout>
          </Protected>
        }
      />
    </Routes>
  )
}

export default App

