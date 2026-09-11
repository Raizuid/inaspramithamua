import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { rupiah } from '../utils/date'

const empty = {
  client_name: '',
  event_type: 'Wedding',
  city: '',
  appointment_date: '',
  appointment_time: '',
  income: '',
  notes: '',
}

export default function AppointmentForm({
  open,
  onClose,
  onSubmit,
  initial,
}) {
  const [f, setF] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setF(
        initial
          ? {
              ...initial,
              income: String(initial.income ?? ''),
            }
          : empty
      )
      setErr('')
    }
  }, [open, initial])

  if (!open) return null

  const change = (e) => {
    setF((x) => ({
      ...x,
      [e.target.name]: e.target.value,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()

    if (
      !f.client_name ||
      !f.city ||
      !f.appointment_date ||
      !f.appointment_time ||
      f.income === ''
    ) {
      setErr(
        'Lengkapi nama client, kota, tanggal, jam, dan pemasukan.'
      )
      return
    }

    if (!/^\d+(\.\d+)?$/.test(f.income.replace(/,/g, ''))) {
      setErr('Pemasukan harus berupa angka.')
      return
    }

    try {
      setSaving(true)

      await onSubmit({
        ...f,
        income: Number(f.income.replace(/,/g, '')),
      })

      onClose()
    } catch (e) {
      console.error(e)
      setErr(
        'Gagal menyimpan jadwal. Periksa koneksi internet dan coba lagi.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">APPOINTMENT</p>
            <h2>{initial ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X />
          </button>
        </div>

        {err && <div className="error">{err}</div>}

        <form onSubmit={submit}>
          <label>
            Nama Client
            <input
              name="client_name"
              value={f.client_name}
              onChange={change}
              placeholder="Sarah"
              autoFocus
            />
          </label>

          <label>
            Jenis Acara
            <input
              name="event_type"
              value={f.event_type}
              onChange={change}
              placeholder="Wedding"
            />
          </label>

          <div className="two">
            <label>
              Kota
              <input
                name="city"
                value={f.city}
                onChange={change}
                placeholder="Surabaya"
              />
            </label>

            <label>
              Tanggal
              <input
                type="date"
                name="appointment_date"
                value={f.appointment_date}
                onChange={change}
              />
            </label>
          </div>

          <label>
            Jam WIB
            <input
              type="time"
              name="appointment_time"
              value={f.appointment_time?.slice(0, 5)}
              onChange={change}
            />
          </label>

          <label>
            Pemasukan
            <input
              inputMode="numeric"
              name="income"
              value={f.income}
              onChange={change}
              placeholder="1500000"
            />

            <small>
              {f.income
                ? rupiah(f.income)
                : 'Contoh: Rp1.500.000'}
            </small>
          </label>

          <label>
            Catatan <span className="optional">Opsional</span>

            <textarea
              name="notes"
              value={f.notes || ''}
              onChange={change}
              placeholder="Catatan untuk appointment..."
              rows="3"
            />
          </label>

          <button
            className="primary wide"
            disabled={saving}
          >
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </form>
      </section>
    </div>
  )
}