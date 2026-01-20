"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { getProductById, getLargestSizeOption, getSpecificProductImage } from "@/lib/products"
import ProductCard from "@/components/product-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, Target, Dumbbell, TrendingUp, Sparkles, Heart, Brain, ShoppingCart, FileText, Star, Info, Zap, Award, Clock, CheckCircle } from "lucide-react"
import type { ProtocolQuestion, ProtocolRecommendation } from "@/lib/openai"

const GOALS = [
  {
    id: "strength-muscle",
    title: "Strength & Muscle",
    description: "Build muscle mass, increase strength, and improve body composition",
    icon: Dumbbell,
    color: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
  },
  {
    id: "height-growth", 
    title: "Height Growth",
    description: "Support natural growth and development research",
    icon: TrendingUp,
    color: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
  },
  {
    id: "weight-loss",
    title: "Weight Loss", 
    description: "Metabolic enhancement and weight management research",
    icon: Target,
    color: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
  },
  {
    id: "skin-wellness",
    title: "Skin & Wellness",
    description: "Anti-aging, skin health, and overall wellness research", 
    icon: Sparkles,
    color: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
  },
  {
    id: "general-recovery",
    title: "General Recovery",
    description: "Healing, recovery, and tissue regeneration research",
    icon: Heart,
    color: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20"
  },
  {
    id: "cognitive-enhancement",
    title: "Cognitive Enhancement", 
    description: "Nootropic and cognitive function research",
    icon: Brain,
    color: "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
  }
]

type Step = 'goal-selection' | 'questions' | 'recommendations'

export default function GetYourProtocolPage() {
  const [currentStep, setCurrentStep] = useState<Step>('goal-selection')
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const [questions, setQuestions] = useState<ProtocolQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [recommendations, setRecommendations] = useState<ProtocolRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleGoalSelection = async (goalId: string) => {
    setSelectedGoal(goalId)
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/protocol/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalId })
      })
      
      if (!response.ok) throw new Error('Failed to generate questions')
      
      const data = await response.json()
      setQuestions(data.questions)
      setCurrentStep('questions')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmitAnswers = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/protocol/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: selectedGoal, answers })
      })
      
      if (!response.ok) throw new Error('Failed to generate recommendations')
      
      const data = await response.json()
      setRecommendations(data)
      setCurrentStep('recommendations')
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }


  const handleAddAllToCart = () => {
    let addedCount = 0
    
    recommendations?.productIds.forEach(productId => {
      const product = getProductById(productId)
      if (product) {
        const largestSize = getLargestSizeOption(product)
        if (largestSize) {
          const cartItem = {
            id: product.id,
            name: product.name,
            price: largestSize.price,
            quantity: 1,
            sizeId: largestSize.id,
            image: getSpecificProductImage(product) || product.image,
          }
          addItem(cartItem)
          addedCount++
        }
      }
    })
    
    toast({
      title: "Added to Cart",
      description: `${addedCount} items added to cart`
    })
  }

  const handleAddWithProtocol = () => {
    if (!recommendations) return
    
    // Add all recommended peptides
    let addedCount = 0
    recommendations.productIds.forEach(productId => {
      const product = getProductById(productId)
      if (product) {
        const largestSize = getLargestSizeOption(product)
        const selectedSize = largestSize || product.sizeOptions?.[0]
        
        const cartItem = {
          id: product.id,
          name: product.name,
          price: selectedSize?.price || product.price,
          image: getSpecificProductImage(product) || product.image,
          quantity: 1,
          sizeId: selectedSize?.id,
        }
        
        addItem(cartItem)
        addedCount++
      }
    })
    
    // Add protocol consultation
    const protocolProduct = getProductById('peptide-protocol')
    if (protocolProduct) {
      const protocolCartItem = {
        id: protocolProduct.id,
        name: protocolProduct.name,
        price: protocolProduct.price,
        image: getSpecificProductImage(protocolProduct) || protocolProduct.image,
        quantity: 1,
        sizeId: protocolProduct.sizeOptions?.[0]?.id,
      }
      
      addItem(protocolCartItem)
      addedCount++
    }
    
    toast({
      title: "Added to Cart",
      description: `${addedCount} items added including Protocol Consultation`
    })
  }

  const selectedGoalData = GOALS.find(g => g.id === selectedGoal)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Get Your FREE Peptide Protocol
            </h1>
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your personalized peptide stack through our advanced AI system. Get expert recommendations tailored to your specific research goals.
          </p>
        </div>

        {/* Goal Selection */}
        {currentStep === 'goal-selection' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {GOALS.map((goal) => {
              const Icon = goal.icon
              return (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${goal.color}`}
                  onClick={() => handleGoalSelection(goal.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
                    <p className="text-muted-foreground text-sm">{goal.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Questions */}
        {currentStep === 'questions' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedGoalData && <selectedGoalData.icon className="h-6 w-6" />}
                  {selectedGoalData?.title} - Research Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <Label className="text-base font-medium">
                      {index + 1}. {question.question}
                    </Label>
                    
                    {question.type === 'text' && (
                      <Textarea
                        placeholder={question.placeholder}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    )}
                    
                    {question.type === 'select' && question.options && (
                      <Select 
                        value={answers[question.id] || ''} 
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {question.type === 'number' && (
                      <Input
                        type="number"
                        placeholder={question.placeholder}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                
                <div className="flex gap-4 pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('goal-selection')}
                    className="flex-1"
                  >
                    Back to Goals
                  </Button>
                  <Button 
                    onClick={handleSubmitAnswers}
                    disabled={isLoading || Object.keys(answers).length < questions.length}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Get Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        {currentStep === 'recommendations' && recommendations && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedGoalData && <selectedGoalData.icon className="h-6 w-6" />}
                  Your Personalized Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Protocol Summary</h3>
                  <p className="text-muted-foreground">{recommendations.summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Why These Peptides?</h3>
                  <p className="text-muted-foreground">{recommendations.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Products */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Your Recommended Peptides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recommendations.productIds.map(productId => {
                  const product = getProductById(productId)
                  return product ? (
                    <ProductCard key={product.id} product={product} />
                  ) : null
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Button 
                  size="lg" 
                  onClick={handleAddAllToCart}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full py-4 text-base"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add All Peptides to Cart
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="lg" 
                        onClick={handleAddWithProtocol}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full py-4 text-base"
                      >
                        <Zap className="h-5 w-5" />
                        Get Complete Protocol Guide
                        <Info className="h-4 w-4 ml-1 opacity-70" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Complete Protocol Package Includes:
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Detailed dosing schedules & timing
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Cycle protocols & safety guidelines
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Reconstitution & storage instructions
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Progress tracking templates
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Expert consultation session
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Follow-up support & adjustments
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Professional PDF documentation
                          </li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setCurrentStep('goal-selection')
                  setSelectedGoal('')
                  setQuestions([])
                  setAnswers({})
                  setRecommendations(null)
                }}
              >
                Start Over
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {currentStep === 'goal-selection' ? 'Generating questions...' : 'Analyzing your responses...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
