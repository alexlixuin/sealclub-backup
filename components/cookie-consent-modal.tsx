"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CookieConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export function CookieConsentModal({ isOpen, onClose, onAccept }: CookieConsentModalProps) {
  const handleAccept = () => {
    // Enable all cookies by setting document.cookie properties
    // This attempts to override browser cookie blocking for PayPal functionality
    try {
      // Set a test cookie to verify functionality
      document.cookie = "paypal_cookies_enabled=true; path=/; SameSite=None; Secure"
      
      // Attempt to enable third-party cookies programmatically
      // Note: Modern browsers may still block this, but we try anyway
      if ('cookieStore' in window) {
        // Use Cookie Store API if available
        (window as any).cookieStore.set({
          name: 'third_party_enabled',
          value: 'true',
          sameSite: 'none',
          secure: true
        }).catch(() => {
          // Fallback if Cookie Store API fails
          console.log('Cookie Store API not available or blocked')
        })
      }
      
      // Set localStorage flag to remember user's choice
      localStorage.setItem('cookies_accepted', 'true')
      localStorage.setItem('third_party_cookies_enabled', 'true')
      
      onAccept()
    } catch (error) {
      console.warn('Could not programmatically enable cookies:', error)
      // Still call onAccept to proceed with PayPal
      onAccept()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Enable Cookies for PayPal
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            PayPal requires third-party cookies to function properly. To complete your payment securely, we need to enable cookies for this session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">Why are cookies needed?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• PayPal uses cookies for secure payment processing</li>
              <li>• Prevents fraud and ensures transaction security</li>
              <li>• Required for PayPal's authentication system</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Yes, Enable Cookies
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 text-center">
            Cookies will only be enabled for this payment session and PayPal functionality.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
