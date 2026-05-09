import React from "react"

function InfoModal({ isOpen, onClose, children, movie }) {
  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <p>{movie.title}</p>
        <button className="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    </div>
  )
}

export default InfoModal
