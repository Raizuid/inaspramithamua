import React from 'react'
import {
  Clock,
  MapPin,
  Trash2,
  Edit3,
} from 'lucide-react'

import {
  dateLabel,
  rupiah,
  statusOf,
} from '../utils/date'

export default function AppointmentCard({
  a,
  onEdit,
  onDelete,
}) {
  const s = statusOf(a)

  return (
    <article
      className={`appointment-card ${
        s === 'Selesai' ? 'past' : ''
      }`}
    >
      <div className="card-date">
        <b>{dateLabel(a.appointment_date)}</b>
        <strong>
          {a.appointment_time.slice(0, 5)}
        </strong>
      </div>

      <div className="card-main">
        <h3>{a.client_name}</h3>

        <p>💄 {a.event_type}</p>

        <p>
          <MapPin /> {a.city}
        </p>

        {a.notes && (
          <p className="note">{a.notes}</p>
        )}
      </div>

      <div className="card-money">
        <span>{s}</span>
        <b>{rupiah(a.income)}</b>
      </div>

      <div className="card-actions">
        <button
          onClick={() => onEdit(a)}
          aria-label="Edit"
        >
          <Edit3 /> Edit
        </button>

        <button
          className="danger-text"
          onClick={() => onDelete(a)}
          aria-label="Hapus"
        >
          <Trash2 /> Hapus
        </button>
      </div>
    </article>
  )
}