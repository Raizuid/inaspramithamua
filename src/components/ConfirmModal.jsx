import React from 'react'

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
}) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <section className="modal confirm">
        <p className="eyebrow">DELETE APPOINTMENT</p>

        <h2>Yakin ingin menghapus jadwal ini?</h2>

        <p>
          Data appointment akan dihapus dari database dan
          tidak dapat dikembalikan.
        </p>

        <div className="modal-actions">
          <button onClick={onClose}>
            Batal
          </button>

          <button
            className="danger"
            onClick={onConfirm}
          >
            Hapus
          </button>
        </div>
      </section>
    </div>
  )
}