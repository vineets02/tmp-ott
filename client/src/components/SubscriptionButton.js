import React, { useEffect } from "react"

const SubscriptionButton = () => {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.razorpay.com/static/widget/subscription-button.js"
    script.setAttribute("data-subscription_button_id", "pl_MEmkv8eSeTDY2s")
    script.setAttribute("data-button_theme", "rzp-dark-standard")
    script.async = true

    const form = document.getElementById("subscription-form")
    form.appendChild(script)

    return () => {
      form.removeChild(script)
    }
  }, [])

  return <form id="subscription-form">{/* Your form content */}</form>
}

export default SubscriptionButton
