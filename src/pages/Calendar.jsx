import React, { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { id } from 'date-fns/locale'

import { appointmentInstant } from '../utils/date'
import AppointmentCard from '../components/AppointmentCard'

export default function Calendar({
  items,
  onEdit,
  onDelete,
}) {
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(null)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), {
      weekStartsOn: 1,
    })

    return Array.from(
      { length: 42 },
      (_, i) => addDays(start, i)
    )
  }, [month])

  const forDay = (day) => {
    return items
      .filter((a) =>
        isSameDay(
          appointmentInstant(
            a.appointment_date,
            a.appointment_time
          ),
          day
        )
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
  }

  const goToday = () => {
    const today = new Date()
    setMonth(today)
    setSelected(today)
  }

  return (
    <div className="page calendar-page">
      {/* HEADER */}
      <div className="page-head calendar-header">
        <div>
          <p className="eyebrow">PLANNER</p>
          <h1>Kalender</h1>
          <p className="muted">
            Lihat seluruh jadwal makeup kamu dalam satu tampilan.
          </p>
        </div>

        <div className="calendar-controls">
          <button
            className="today-button"
            onClick={goToday}
          >
            Hari ini
          </button>

          <div className="month-nav">
            <button
              onClick={() =>
                setMonth(subMonths(month, 1))
              }
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft />
            </button>

            <b>
              {format(month, 'MMMM yyyy', {
                locale: id,
              })}
            </b>

            <button
              onClick={() =>
                setMonth(addMonths(month, 1))
              }
              aria-label="Bulan berikutnya"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="calendar calendar-modern">
        <div className="weekdays">
          {[
            'Sen',
            'Sel',
            'Rab',
            'Kam',
            'Jum',
            'Sab',
            'Min',
          ].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="days">
          {days.map((day) => {
            const appointments = forDay(day)
            const isCurrentMonth = isSameMonth(
              day,
              month
            )
            const isSelected =
              selected && isSameDay(day, selected)

            return (
              <button
                key={day.toISOString()}
                className={[
                  'calendar-day',
                  !isCurrentMonth
                    ? 'muted-day'
                    : '',
                  isSelected
                    ? 'selected-day'
                    : '',
                  appointments.length
                    ? 'has-appointment'
                    : '',
                ].join(' ')}
                onClick={() => setSelected(day)}
              >
                {/* TANGGAL */}
                <div className="calendar-day-number">
                  <span>{format(day, 'd')}</span>

                  {appointments.length > 0 && (
                    <i>
                      {appointments.length}
                    </i>
                  )}
                </div>

                {/* APPOINTMENT */}
                <div className="calendar-events">
                  {appointments
                    .slice(0, 2)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="calendar-event"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(day)
                        }}
                      >
                        <strong>
                          {appointment.appointment_time?.slice(
                            0,
                            5
                          )}
                        </strong>

                        <span>
                          {appointment.client_name}
                        </span>

                        <small>
                          {appointment.event_type}
                        </small>
                      </div>
                    ))}

                  {appointments.length > 2 && (
                    <div className="more-events">
                      +{appointments.length - 2} lainnya
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* SELECTED DATE */}
      {selected && (
        <section className="section selected-date-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                SELECTED DATE
              </p>

              <h2>
                {format(
                  selected,
                  'EEEE, dd MMMM yyyy',
                  { locale: id }
                )}
              </h2>
            </div>

            <button
              onClick={() => setSelected(null)}
            >
              Tutup
            </button>
          </div>

          {forDay(selected).map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              a={appointment}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {!forDay(selected).length && (
            <p className="muted">
              Tidak ada appointment pada tanggal ini.
            </p>
          )}
        </section>
      )}
    </div>
  )
}