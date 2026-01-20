"use client"

import { useState, useEffect } from "react"
import { SMSCouponPopup } from "./sms-coupon-popup"

export function SMSPopupManager() {
  const [showSMSPopup, setShowSMSPopup] = useState(false)

  useEffect(() => {
    // Check if user has already completed SMS popup
    const smsCompleted = localStorage.getItem("smsPopupCompleted")
    const smsDismissed = localStorage.getItem("smsPopupDismissed")
    
    if (!smsCompleted && !smsDismissed) {
      // Show SMS popup after 2 seconds (before shipping notification at 3 seconds)
      const timer = setTimeout(() => {
        setShowSMSPopup(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleCloseSMSPopup = () => {
    setShowSMSPopup(false)
    // Mark as dismissed (different from completed)
    localStorage.setItem("smsPopupDismissed", "true")
  }

  return (
    <>
      {showSMSPopup && <SMSCouponPopup onClose={handleCloseSMSPopup} />}
    </>
  )
}
