import React, { useState, useEffect } from "react"

const FlashMessage = ({ message }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 3000) // Adjust the time (in milliseconds) to control how long the flash message remains visible

    return () => clearTimeout(timer)
  }, [])

  return visible ? (
    <div className="flash-message">
      <p>{message}</p>
    </div>
  ) : null
}

export default FlashMessage
