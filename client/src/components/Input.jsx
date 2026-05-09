import React from "react"

const Input = (props) => {
  const {
    value,
    onChange,
    style,
    placeholder,
    type,
    className,
    required,
    errorMessage,
  } = props
  return (
    <React.Fragment>
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={style}
        placeholder={placeholder}
        className={className}
        required={required}
      />
      {value === "" && <p className="error">{errorMessage}</p>}
    </React.Fragment>
  )
}

export default Input
