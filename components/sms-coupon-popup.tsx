"use client"

import { useState, useEffect } from "react"
import { X, Phone, MessageSquare, Clock, Check, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { COUNTRY_CODES, POPULAR_COUNTRIES, getCountryByCode, type CountryCode } from "@/lib/country-codes"

interface SMSCouponPopupProps {
  onClose: () => void
}

type PopupStep = "phone" | "verification" | "success"

export function SMSCouponPopup({ onClose }: SMSCouponPopupProps) {
  const [step, setStep] = useState<PopupStep>("phone")
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryOpen, setCountryOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Set default country to US
  useEffect(() => {
    const defaultCountry = getCountryByCode("US")
    if (defaultCountry) {
      setSelectedCountry(defaultCountry)
    }
  }, [])

  // Get full phone number for API calls
  const getFullPhoneNumber = () => {
    if (!selectedCountry || !phoneNumber) return ""
    return `${selectedCountry.dialCode}${phoneNumber}`
  }

  // Countdown timer for discount expiry
  useEffect(() => {
    if (step === "success" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendCode = async () => {
    if (!selectedCountry) {
      setError("Please select a country")
      return
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number")
      return
    }

    // Basic phone validation (digits only, reasonable length)
    const phoneRegex = /^\d{6,15}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number (6-15 digits)")
      return
    }

    const fullPhone = getFullPhoneNumber()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("verification")
      } else {
        setError(data.error || "Failed to send verification code")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      return
    }

    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits")
      return
    }

    const fullPhone = getFullPhoneNumber()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, code: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setDiscountCode(data.discountCode)
        setTimeLeft(Math.floor(data.expiresIn / 1000))
        setStep("success")
        
        // Store discount code in localStorage for cart integration
        localStorage.setItem("smsDiscountCode", data.discountCode)
        localStorage.setItem("smsDiscountExpiry", (Date.now() + data.expiresIn).toString())
      } else {
        setError(data.error || "Failed to verify code")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode)
  }

  const handleStartShopping = () => {
    // Mark popup as completed
    localStorage.setItem("smsPopupCompleted", "true")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm border-primary/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Want a 10% discount?</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {step === "phone" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Subscribe to our SMS newsletter and unlock new deals everyday along with a 10% discount code.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryOpen}
                        className="w-[140px] justify-between text-left font-normal"
                        disabled={loading}
                      >
                        {selectedCountry ? (
                          <div className="flex items-center gap-2">
                            <span className="text-base">{selectedCountry.flag}</span>
                            <span className="text-sm">{selectedCountry.dialCode}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Select...</span>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search countries..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No countries found.</CommandEmpty>
                          <CommandGroup heading="Popular">
                            {POPULAR_COUNTRIES.map((code) => {
                              const country = getCountryByCode(code)
                              if (!country) return null
                              return (
                                <CommandItem
                                  key={country.code}
                                  value={`${country.name} ${country.code} ${country.dialCode}`}
                                  onSelect={() => {
                                    setSelectedCountry(country)
                                    setCountryOpen(false)
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{country.flag}</span>
                                    <span className="flex-1">{country.name}</span>
                                    <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                                  </div>
                                  {selectedCountry?.code === country.code && (
                                    <Check className="ml-2 h-4 w-4" />
                                  )}
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                          <CommandGroup heading="All Countries">
                            {COUNTRY_CODES.filter(country => !POPULAR_COUNTRIES.includes(country.code)).map((country) => (
                              <CommandItem
                                key={country.code}
                                value={`${country.name} ${country.code} ${country.dialCode}`}
                                onSelect={() => {
                                  setSelectedCountry(country)
                                  setCountryOpen(false)
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{country.flag}</span>
                                  <span className="flex-1">{country.name}</span>
                                  <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                                </div>
                                {selectedCountry?.code === country.code && (
                                  <Check className="ml-2 h-4 w-4" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Phone Number Input */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedCountry ? `Full number: ${getFullPhoneNumber()}` : "Select country and enter phone number"}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to receive SMS messages. Standard rates may apply.
              </p>
            </div>
          )}

          {step === "verification" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit verification code to <strong>{getFullPhoneNumber()}</strong>
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  disabled={loading}
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full text-sm"
                  disabled={loading}
                >
                  Change Phone Number
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Success!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your discount expires in 10 minutes! 
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Discount Code</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="text-xs"
                  >
                    Copy
                  </Button>
                </div>
                <div className="text-lg font-mono font-bold text-primary">
                  {discountCode}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Expires in {formatTime(timeLeft)}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleStartShopping}
                  className="w-full"
                >
                  Start Shopping
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Your discount will be automatically applied at checkout
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
