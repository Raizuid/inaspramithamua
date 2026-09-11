
import React, { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  WalletCards,
} from 'lucide-react'

import AppointmentCard from '../components/AppointmentCard'
import {
  appointmentInstant,
  monthBounds,
  rupiah,
  todayISO,
} from '../utils/date'
import { enablePush } from '../services/push'

export default function Dashboard({
  items,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [notify, setNotify] = useState('')

  const stats = useMemo(() => {
    const today = todayISO()
    const m = monthBounds().start.slice(0, 7)

    const current = items.filter((x) =>
      x.appointment_date.startsWith(m)
    )

    const upcoming = items
      .filter(
        (x) =>
          appointmentInstant(
            x.appointment_date,
            x.appointment_time
          ) > new Date()
      )
      .sort(
        (a, b) =>
          appointmentInstant(
            a.appointment_date,
            a.appointment_time
          ) -
          appointmentInstant(
            b.appointment_date,
            b.appointment_time
          )
      )

    return {
      today: items.filter(
        (x) => x.appointment_date === today
      ).length,

      income: current.reduce(
        (s, x) => s + Number(x.income),
        0
      ),

      count: current.length,

      next: upcoming[0] || null,
    }
  }, [items])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="muted">
            Ringkasan jadwal makeup kamu.
          </p>
        </div>

        <button
          className="primary desktop-add"
          onClick={onAdd}
        >
          + Tambah Jadwal
        </button>
      </div>

      <section className="stats">
        <div className="stat">
          <span>JADWAL HARI INI</span>
          <CalendarDays />
          <strong>{stats.today}</strong>
          <small>Booking</small>
        </div>

        <div className="stat">
          <span>PEMASUKAN BULAN INI</span>
          <WalletCards />
          <strong className="money">
            {rupiah(stats.income)}
          </strong>
          <small>{stats.count} Booking</small>
        </div>

        <div className="stat">
          <span>TOTAL BOOKING</span>
          <ArrowUpRight />
          <strong>{stats.count}</strong>
          <small>Bulan berjalan</small>
        </div>
      </section>

      <section className="notify-box">
        <div>
          <p className="eyebrow">REMINDERS</p>
          <h3>Aktifkan notifikasi</h3>
          <p className="muted">
            Izinkan browser mengirim reminder H-1 dan H-3 jam.
          </p>
        </div>

        <button
          className="primary"
          onClick={async () => {
            try {
              setNotify('Mengaktifkan...')
              await enablePush()
              setNotify('Notifikasi aktif ✓')
            } catch (e) {
              console.error(e)
              setNotify(e.message)
            }
          }}
        >
          Aktifkan
        </button>

        {notify && <small>{notify}</small>}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">NEXT</p>
            <h2>Jadwal Terdekat</h2>
          </div>
        </div>

        {stats.next ? (
          <AppointmentCard
            a={stats.next}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <div className="empty">
            <h3>Belum ada jadwal</h3>
            <p>Tambahkan jadwal makeup pertamamu.</p>

            <button
              className="primary"
              onClick={onAdd}
            >
              + Tambah Jadwal
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
