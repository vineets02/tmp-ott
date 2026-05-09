import React from "react"

const Button = (props) => {
  const { children, style, onClick, className } = props
  return (
    <React.Fragment>
      <button style={style} onClick={onClick} className={className}>
        {children}
      </button>
    </React.Fragment>
  )
}

export default Button
