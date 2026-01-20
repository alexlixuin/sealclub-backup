'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check, Building2, CreditCard, MapPin, Hash, Banknote } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { BankDetails, formatCurrency, convertCurrency } from '@/lib/bank-details'

interface InternationalBankModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCurrency: string
  bankDetails: Record<string, BankDetails>
  totalAmount: number
}

export default function InternationalBankModal({
  isOpen,
  onClose,
  selectedCurrency,
  bankDetails,
  totalAmount
}: InternationalBankModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const currentBankDetails = bankDetails[selectedCurrency]
  
  if (!currentBankDetails) {
    return null
  }

  const convertedAmount = convertCurrency(totalAmount, 'USD', selectedCurrency)

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} has been copied to your clipboard.`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the text manually.",
        variant: "destructive"
      })
    }
  }

  const copyAllDetails = async () => {
    const allDetails = `
Bank Transfer Details for ${selectedCurrency}

Bank Name: ${currentBankDetails.bankName}
Account Holder: ${currentBankDetails.accountHolder}
Account Number: ${currentBankDetails.accountNumber}
SWIFT Code: ${currentBankDetails.swiftCode}
${currentBankDetails.iban ? `IBAN: ${currentBankDetails.iban}` : ''}
${currentBankDetails.routingNumber ? `Routing Number: ${currentBankDetails.routingNumber}` : ''}
${currentBankDetails.bsb ? `BSB: ${currentBankDetails.bsb}` : ''}
${currentBankDetails.sortCode ? `Sort Code: ${currentBankDetails.sortCode}` : ''}
Bank Address: ${currentBankDetails.address}

Amount to Transfer: ${formatCurrency(convertedAmount, selectedCurrency)}
    `.trim()

    try {
      await navigator.clipboard.writeText(allDetails)
      toast({
        title: "All details copied",
        description: "All bank details have been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the details manually.",
        variant: "destructive"
      })
    }
  }

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="h-8 w-8 p-0 hover:bg-gray-800"
    >
      {copiedField === fieldName ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400" />
      )}
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Bank Transfer Details - {selectedCurrency}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount to Transfer */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Amount to Transfer</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(convertedAmount, selectedCurrency)}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Converted from USD ${totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Bank Information
            </h3>

            <div className="grid gap-4">
              {/* Bank Name */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <div>
                  <p className="text-sm text-gray-400">Bank Name</p>
                  <p className="font-medium text-white">{currentBankDetails.bankName}</p>
                </div>
                <CopyButton text={currentBankDetails.bankName} fieldName="Bank Name" />
              </div>

              {/* Account Holder */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <div>
                  <p className="text-sm text-gray-400">Account Holder</p>
                  <p className="font-medium text-white">{currentBankDetails.accountHolder}</p>
                </div>
                <CopyButton text={currentBankDetails.accountHolder} fieldName="Account Holder" />
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <div>
                  <p className="text-sm text-gray-400">Account Number</p>
                  <p className="font-mono text-white">{currentBankDetails.accountNumber}</p>
                </div>
                <CopyButton text={currentBankDetails.accountNumber} fieldName="Account Number" />
              </div>

              {/* SWIFT Code */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <div>
                  <p className="text-sm text-gray-400">SWIFT Code</p>
                  <p className="font-mono text-white">{currentBankDetails.swiftCode}</p>
                </div>
                <CopyButton text={currentBankDetails.swiftCode} fieldName="SWIFT Code" />
              </div>

              {/* IBAN (if available) */}
              {currentBankDetails.iban && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-gray-400">IBAN</p>
                    <p className="font-mono text-white">{currentBankDetails.iban}</p>
                  </div>
                  <CopyButton text={currentBankDetails.iban} fieldName="IBAN" />
                </div>
              )}

              {/* Routing Number (if available) */}
              {currentBankDetails.routingNumber && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-gray-400">Routing Number</p>
                    <p className="font-mono text-white">{currentBankDetails.routingNumber}</p>
                  </div>
                  <CopyButton text={currentBankDetails.routingNumber} fieldName="Routing Number" />
                </div>
              )}

              {/* BSB (if available) */}
              {currentBankDetails.bsb && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-gray-400">BSB</p>
                    <p className="font-mono text-white">{currentBankDetails.bsb}</p>
                  </div>
                  <CopyButton text={currentBankDetails.bsb} fieldName="BSB" />
                </div>
              )}

              {/* Sort Code (if available) */}
              {currentBankDetails.sortCode && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-gray-400">Sort Code</p>
                    <p className="font-mono text-white">{currentBankDetails.sortCode}</p>
                  </div>
                  <CopyButton text={currentBankDetails.sortCode} fieldName="Sort Code" />
                </div>
              )}

              {/* Bank Address */}
              <div className="flex items-start justify-between bg-gray-800/50 rounded-lg p-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Bank Address
                  </p>
                  <p className="text-white mt-1">{currentBankDetails.address}</p>
                </div>
                <CopyButton text={currentBankDetails.address} fieldName="Bank Address" />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-amber-400 mb-2">Transfer Instructions</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Use the exact amount shown above: <strong>{formatCurrency(convertedAmount, selectedCurrency)}</strong></li>
              <li>• Include your order number in the transfer reference</li>
              <li>• Transfers typically take 1-3 business days to process</li>
              <li>• Contact us if you need assistance with the transfer</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={copyAllDetails}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All Details
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-700 text-white hover:bg-gray-800"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
