import React, { useMemo, useState } from 'react'
import AppointmentCard from '../components/AppointmentCard'
import {
  appointmentInstant,
  todayISO,
  statusOf,
} from '../utils/date'
import { formatInTimeZone } from 'date-fns-tz'

export default function Schedule({
  items,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('Semua')

  const filtered = useMemo(() => {
    const now = new Date()
    const today = todayISO()

    const tom = new Date(
      now.getTime() + 86400000
    )

    const tomorrow = formatInTimeZone(
      tom,
      'Asia/Jakarta',
      'yyyy-MM-dd'
    )

    const weekEnd = new Date(
      now.getTime() + 7 * 86400000
    )

    return items.filter((a) => {
      const hay =
        `${a.client_name} ${a.city} ${a.event_type}`.toLowerCase()

      if (
        q &&
        !hay.includes(q.toLowerCase())
      ) {
        return false
      }

      const t = appointmentInstant(
        a.appointment_date,
        a.appointment_time
      )

      if (filter === 'Hari ini') {
        return a.appointment_date === today
      }

      if (filter === 'Besok') {
        return a.appointment_date === tomorrow
      }

      if (filter === 'Minggu ini') {
        return t >= now && t <= weekEnd
      }

      if (filter === 'Bulan ini') {
        return a.appointment_date.startsWith(
          today.slice(0, 7)
        )
      }

      if (filter === 'Jadwal selesai') {
        return t < now
      }

      return true
    })
  }, [items, q, filter])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">APPOINTMENTS</p>
          <h1>Jadwal</h1>
        </div>

        <button
          className="primary desktop-add"
          onClick={onAdd}
        >
          + Tambah Jadwal
        </button>
      </div>

      <div className="toolbar">
        <input
          aria-label="Cari jadwal"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari client, kota, atau acara..."
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
        >
          {[
            'Semua',
            'Hari ini',
            'Besok',
            'Minggu ini',
            'Bulan ini',
            'Jadwal selesai',
          ].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>

      <div className="desktop-table">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Acara</th>
              <th>Kota</th>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Pemasukan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>
                  <b>{a.client_name}</b>
                </td>

                <td>{a.event_type}</td>

                <td>{a.city}</td>

                <td>{a.appointment_date}</td>

                <td>
                  {a.appointment_time.slice(0, 5)}
                </td>

                <td>
                  {new Intl.NumberFormat(
                    'id-ID',
                    {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }
                  ).format(a.income)}
                </td>

                <td>
                  <span className="status">
                    {statusOf(a)}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => onEdit(a)}
                  >
                    Edit
                  </button>

                  <button
                    className="danger-text"
                    onClick={() => onDelete(a)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-list">
        {filtered.map((a) => (
          <AppointmentCard
            key={a.id}
            a={a}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {!filtered.length && (
        <div className="empty">
          <h3>Tidak ada jadwal</h3>
          <p>
            Coba ubah pencarian atau filter.
          </p>
        </div>
      )}
    </div>
  )
}