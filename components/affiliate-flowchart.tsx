"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, CreditCard, Banknote, Store, ArrowRight, Play, Users, Wallet } from "lucide-react"

export default function AffiliateFlowchart() {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const steps = [
    {
      id: 1,
      icon: ShoppingCart,
      title: "Customer Uses Your Code",
      description: "Customer enters your affiliate code at checkout",
      details:
        "When a customer uses your unique affiliate code (e.g., JOE10) during checkout, the system automatically tracks this referral and links it to your account.",
      color: "blue",
    },
    {
      id: 2,
      icon: CreditCard,
      title: "You Get Credits",
      description: "Earn commission credits instantly",
      details:
        "As soon as the order is confirmed, you receive commission credits in your affiliate account. Credits are calculated based on the order total and your commission rate.",
      color: "green",
    },
    {
      id: 3,
      icon: Wallet,
      title: "Withdraw or Use Credits",
      description: "Cash out to bank or spend on our platform",
      details:
        "Choose to withdraw your earnings to your bank account or use the credits for purchases on our platform. Both options give you flexibility in how you use your commissions.",
      color: "purple",
    },
  ]

  const playAnimation = () => {
    setIsAnimating(true)
    setActiveStep(1)

    setTimeout(() => setActiveStep(2), 1500)
    setTimeout(() => setActiveStep(3), 3000)
    setTimeout(() => {
      setActiveStep(null)
      setIsAnimating(false)
    }, 4500)
  }

  const getStepColor = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-400 bg-blue-600/20 border-blue-500/30"
      case "green":
        return "text-green-400 bg-green-600/20 border-green-500/30"
      case "purple":
        return "text-purple-400 bg-purple-600/20 border-purple-500/30"
      default:
        return "text-slate-400 bg-slate-600/20 border-slate-500/30"
    }
  }

  const getActiveStepColor = (color: string) => {
    switch (color) {
      case "blue":
        return "ring-4 ring-blue-400/50 bg-blue-600/30 border-blue-400"
      case "green":
        return "ring-4 ring-green-400/50 bg-green-600/30 border-green-400"
      case "purple":
        return "ring-4 ring-purple-400/50 bg-purple-600/30 border-purple-400"
      default:
        return "ring-4 ring-slate-400/50 bg-slate-600/30 border-slate-400"
    }
  }

  return (
    <div className="text-center mb-16">
      <div className="mb-12">
        <Badge className="mb-4 bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-sm border-purple-500/30">
          <Users className="w-4 h-4 mr-2" />
          How It Works
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Interactive Affiliate Process</h2>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
          See exactly how our affiliate program works from customer purchase to your earnings
        </p>
        <Button
          onClick={playAnimation}
          disabled={isAnimating}
          className="bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-sm border border-purple-500/30"
        >
          <Play className="w-4 h-4 mr-2" />
          {isAnimating ? "Playing..." : "Watch Process Flow"}
        </Button>
      </div>

      {/* Flowchart Steps */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = activeStep === step.id
          const isClickedActive = activeStep === step.id && !isAnimating

          return (
            <div key={step.id} className="flex flex-col lg:flex-row items-center">
              {/* Step Circle */}
              <div
                className={`
                  relative w-24 h-24 rounded-full border-2 backdrop-blur-sm cursor-pointer transition-all duration-500
                  ${isActive ? getActiveStepColor(step.color) : getStepColor(step.color)}
                  ${isActive ? "scale-110" : "hover:scale-105"}
                  ${isActive && isAnimating ? "animate-pulse" : ""}
                `}
                onClick={() => setActiveStep(isClickedActive ? null : step.id)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{step.id}</span>
                </div>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center lg:mx-4 my-4 lg:my-0">
                  <ArrowRight className="w-8 h-8 text-slate-500 rotate-90 lg:rotate-0" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Step Details */}
      {activeStep && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-center">
              {(() => {
                const step = steps.find((s) => s.id === activeStep)
                if (!step) return null
                const Icon = step.icon
                return (
                  <>
                    <Icon className="w-6 h-6 mr-3" />
                    {step.title}
                  </>
                )
              })()}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {steps.find((s) => s.id === activeStep)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{steps.find((s) => s.id === activeStep)?.details}</p>
          </CardContent>
        </Card>
      )}

      {/* Additional Benefits Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-green-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Banknote className="w-6 h-6 mr-3 text-green-400" />
              Bank Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">
              Transfer your earnings directly to your bank account. Minimum withdrawal amounts and processing times
              apply. Perfect for those who want to cash out their commissions.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Store className="w-6 h-6 mr-3 text-blue-400" />
              Platform Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">
              Use your commission credits for purchases on our platform. Often includes bonus credit multipliers and
              exclusive access to new products.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
