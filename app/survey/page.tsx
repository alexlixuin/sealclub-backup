"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Mail, MessageSquare, ShoppingCart, TrendingUp, Gift, Copy } from "lucide-react"

interface SurveyData {
  email: string
  steroidsInterest: 'yes' | 'no' | ''
  steroidsPurchaseIntent: string
  customerBarrier: string
  confidenceFactors: string
  primaryInterest: string
}

export default function SurveyPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [referenceCode, setReferenceCode] = useState('')
  
  const [surveyData, setSurveyData] = useState<SurveyData>({
    email: '',
    steroidsInterest: '',
    steroidsPurchaseIntent: '',
    customerBarrier: '',
    confidenceFactors: '',
    primaryInterest: ''
  })

  const confidenceOptions = [
    'More detailed product information',
    'Customer reviews and testimonials',
    'Clearer pricing and shipping costs',
    'Better website security indicators',
    'Live chat support',
    'Money-back guarantee',
    'Third-party lab testing results',
    'Faster shipping options'
  ]

  const interestOptions = [
    'Anabolic muscle gains',
    'Personal experimentation',
    'Fitness and bodybuilding research',
    'Nootropics and cognitive enhancement',
    'Growth hormone',
    'Professional research purposes'
  ]

  const generateReferenceCode = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `SRV-${timestamp}-${random}`.toUpperCase()
  }

  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Copied!",
          description: "Reference code copied to clipboard",
        })
      } else {
        // Fallback method for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          toast({
            title: "Copied!",
            description: "Reference code copied to clipboard",
          })
        } catch (err) {
          console.error('Fallback copy failed:', err)
          toast({
            title: "Copy Failed",
            description: "Please manually copy the reference code",
            variant: "destructive",
          })
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err)
      toast({
        title: "Copy Failed",
        description: "Please manually copy the reference code",
        variant: "destructive",
      })
    }
  }

  const submitSurvey = async () => {
    setIsSubmitting(true)
    
    try {
      const refCode = generateReferenceCode()
      
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...surveyData,
          referenceCode: refCode
        }),
      })

      if (response.ok) {
        setReferenceCode(refCode)
        setIsCompleted(true)
        toast({
          title: "Survey Submitted!",
          description: "Your discount reference code has been generated.",
        })
      } else {
        throw new Error('Failed to submit survey')
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      submitSurvey()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return surveyData.email.includes('@')
      case 1: return surveyData.steroidsInterest !== ''
      case 2: return surveyData.customerBarrier.trim() !== ''
      case 3: return surveyData.confidenceFactors.trim() !== ''
      case 4: return surveyData.primaryInterest.trim() !== ''
      default: return false
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Survey Complete!</h2>
            <p className="text-gray-400 mb-6">Thank you for your valuable feedback. Your discount is ready!</p>
            
            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Your Discount Reference Code</h3>
              <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg p-3 mb-3">
                <code className="text-primary font-mono text-lg">{referenceCode}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(referenceCode)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-400 space-y-2">
                <p>• Contact our live support with this code</p>
                <p>• Minimum 5% discount guaranteed</p>
                <p>• Discount amount based on answer quality</p>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary hover:bg-primary/90 mb-3"
            >
              Return to Home
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://tawk.to/chat/YOUR_CHAT_ID', '_blank')}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Contact Live Support
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-white mb-2">FREE Discount Survey</CardTitle>
          <p className="text-gray-400 mb-4">Help us improve your experience</p>
          
          {/* Discount Incentive */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">Discount Reward</span>
            </div>
            <p className="text-sm text-gray-300">Complete this survey to receive a personalized discount code (minimum 5% off). The more detailed your answers, the better your discount!</p>
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-primary' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Email Collection */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-white">Contact Information</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={surveyData.email}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-sm text-gray-500">We'll use this to follow up on insights and send your discount code.</p>
              </div>
            </div>
          )}

          {/* Step 1: Steroids & Oils Interest */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-white">Product Interest</h3>
              </div>
              <div className="space-y-4">
                <Label className="text-gray-300 text-lg">Would you be interested in anabolic steroids (oils, tablets) dispatched from Australia?</Label>
                <RadioGroup
                  value={surveyData.steroidsInterest}
                  onValueChange={(value: 'yes' | 'no') => setSurveyData(prev => ({ ...prev, steroidsInterest: value }))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                    <RadioGroupItem value="yes" id="steroids-yes" />
                    <Label htmlFor="steroids-yes" className="text-white cursor-pointer">Yes, I would be interested</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                    <RadioGroupItem value="no" id="steroids-no" />
                    <Label htmlFor="steroids-no" className="text-white cursor-pointer">No, not interested</Label>
                  </div>
                </RadioGroup>

                {surveyData.steroidsInterest === 'yes' && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="purchase-intent" className="text-gray-300">Would you purchase them when available? Please elaborate:</Label>
                    <Textarea
                      id="purchase-intent"
                      value={surveyData.steroidsPurchaseIntent}
                      onChange={(e) => setSurveyData(prev => ({ ...prev, steroidsPurchaseIntent: e.target.value }))}
                      placeholder="Tell us about your purchase intentions, budget considerations, preferred products..."
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Customer Barriers */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-white">Customer Feedback</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barriers" className="text-gray-300 text-lg">If you haven't made a purchase yet, what's holding you back?</Label>
                <p className="text-sm text-gray-500">Share any concerns, doubts, or barriers that prevent you from becoming a customer. Be specific for a better discount!</p>
                <Textarea
                  id="barriers"
                  value={surveyData.customerBarrier}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, customerBarrier: e.target.value }))}
                  placeholder="e.g., pricing concerns, product quality doubts, shipping issues, trust factors, payment methods, customer service experiences..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Confidence Factors */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-white">Purchase Confidence</h3>
              </div>
              <div className="space-y-4">
                <Label className="text-gray-300 text-lg">What would make you more confident in placing an order?</Label>
                <p className="text-sm text-gray-500">Write your own answer below. You can reference these suggestions if helpful:</p>
                
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Suggestions (optional):</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {confidenceOptions.map((option) => (
                      <div key={option}>• {option}</div>
                    ))}
                  </div>
                </div>

                <Textarea
                  value={surveyData.confidenceFactors}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, confidenceFactors: e.target.value }))}
                  placeholder="Describe what would increase your confidence in making a purchase. Be specific about features, guarantees, or improvements you'd like to see..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Primary Interest */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-white">Research Interests</h3>
              </div>
              <div className="space-y-4">
                <Label className="text-gray-300 text-lg">What's your primary interest in "research chemicals"?</Label>
                <p className="text-sm text-gray-500">Tell us about your specific interests and goals. You can reference these categories if helpful:</p>
                
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Categories (optional):</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {interestOptions.map((option) => (
                      <div key={option}>• {option}</div>
                    ))}
                  </div>
                </div>

                <Textarea
                  value={surveyData.primaryInterest}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, primaryInterest: e.target.value }))}
                  placeholder="Describe your specific interests, research goals, or what you're looking to achieve with research chemicals..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Submitting...' : currentStep === 4 ? 'Get My Discount Code' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
