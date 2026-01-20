"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, FlaskConical, Shield, CheckCircle2, X } from "lucide-react"

interface ResearchWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export default function ResearchWarningModal({ isOpen, onClose, onAccept }: ResearchWarningModalProps) {
  const [hasReadDisclaimer, setHasReadDisclaimer] = useState(false)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)

  if (!isOpen) return null

  const canProceed = hasReadDisclaimer && hasAcceptedTerms

  const handleAccept = () => {
    if (canProceed) {
      onAccept()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-yellow-500/50 bg-background/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-xl font-bold text-yellow-500">Important Notice</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
            <h2 className="text-lg font-semibold text-yellow-500 mb-2">Research Use Only</h2>
            <p className="text-sm text-muted-foreground">
              Please read and acknowledge the following terms before proceeding with your purchase.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Warning */}
          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-2">Critical Warning</h3>
                <p className="text-sm text-destructive">
                  <strong>This product is strictly for research purposes only.</strong> It is not intended for human
                  consumption, injection, or any form of human use. OZPTides is not liable for any adverse effects,
                  health complications, or damages resulting from misuse of this product.
                </p>
              </div>
            </div>
          </div>

          {/* Research Use Explanation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">What Does "Research Use Only" Mean?</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <h4 className="font-medium text-primary mb-2">Intended Use</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Laboratory research and analysis</li>
                  <li>• Scientific studies and experiments</li>
                  <li>• Educational purposes</li>
                  <li>• Quality control testing</li>
                </ul>
              </div>

              <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
                <h4 className="font-medium text-destructive mb-2">Prohibited Use</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Human consumption</li>
                  <li>• Injection or administration</li>
                  <li>• Therapeutic applications</li>
                  <li>• Veterinary use</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Legal Disclaimer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By purchasing this product, you acknowledge that you are a qualified researcher or acting on behalf of
                  a qualified research institution. You understand that this product has not been evaluated by the FDA
                  and is not intended to diagnose, treat, cure, or prevent any disease. You assume full responsibility
                  for proper handling, storage, and use of this product in accordance with applicable laws and
                  regulations.
                </p>
              </div>
            </div>
          </div>

          {/* Age and Legal Requirements */}
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <h3 className="font-semibold text-blue-500 mb-2">Legal Requirements</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• You must be at least 21 years of age</li>
              <li>• You must comply with all local, state, and federal laws</li>
              <li>• You are responsible for proper disposal of the product</li>
              <li>• You understand the risks associated with research chemicals</li>
            </ul>
          </div>

          <Separator />

          {/* Acknowledgment Checkboxes */}
          <div className="space-y-4">
            <h3 className="font-semibold">Required Acknowledgments</h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadDisclaimer}
                  onChange={(e) => setHasReadDisclaimer(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">
                  I have read and understand the disclaimer above. I acknowledge that this product is for research
                  purposes only and is not intended for human consumption or injection.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAcceptedTerms}
                  onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">
                  I accept full responsibility for the proper use of this product and agree that OZPTides is not liable
                  for any adverse effects resulting from misuse. I am at least 21 years of age and legally able to make
                  this purchase.
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!canProceed}
              className={`flex-1 ${
                canProceed ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {canProceed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />I Accept - Proceed to Checkout
                </>
              ) : (
                "Please Accept All Terms"
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By clicking "I Accept", you confirm that you have read, understood, and agree to all terms and conditions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
