import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

        <div className="prose prose-invert max-w-none">
          <p>Please read these Terms of Service ("Terms") carefully before using the SealClub Beauty website and services.</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website, you agree to be bound by these Terms and our Privacy Policy. If you do
            not agree to these Terms, you may not access or use our website or services.
          </p>

          <h2>2. Research Use Only</h2>
          <p>
            All products sold by SealClub Beauty are strictly for laboratory research and testing purposes only. They are not
            intended for human consumption, diagnostic use, therapeutic use, or any type of in vivo use.
          </p>
          <p>
            By purchasing our products, you confirm that you will use them in compliance with all applicable laws and
            regulations. SealClub Beauty assumes no responsibility for any misuse of our products.
          </p>

          <h2>3. Age Restriction</h2>
          <p>
            You must be at least 21 years of age to access our website and purchase our products. By using our website,
            you represent and warrant that you are at least 21 years of age.
          </p>

          <h2>4. Account Registration</h2>
          <p>
            To access certain features of our website, you may be required to register for an account. You agree to
            provide accurate, current, and complete information during the registration process and to update such
            information to keep it accurate, current, and complete.
          </p>

          <h2>5. Ordering and Payment</h2>
          <p>
            All orders are subject to acceptance and availability. We reserve the right to refuse any order for any
            reason. Payment must be made at the time of ordering. We accept various payment methods as indicated on our
            website.
          </p>

          <h2>6. Shipping and Delivery</h2>
          <p>
            We ship to addresses within the United States and select international destinations. Shipping times and
            costs vary depending on the destination and shipping method selected. We are not responsible for any delays,
            damages, or losses that occur during shipping.
          </p>

          <h2>7. Returns and Refunds</h2>
          <div className="space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <h3 className="font-semibold text-red-300 mb-2">IMPORTANT: ALL SALES ARE FINAL</h3>
              <p className="text-red-100">
                By completing your purchase, you acknowledge and agree that all sales are final. We do not accept returns or issue refunds for change of mind, incorrect ordering, or any other reason not related to product defects.
              </p>
            </div>

            <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
              <h3 className="font-semibold text-amber-300 mb-2">Defective Product Policy</h3>
              <p className="text-amber-100">
                Refunds or replacements will ONLY be considered for products that are defective upon arrival. To be eligible for a refund or replacement, you must:
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li>Notify us within <strong>48 hours</strong> of receiving your order</li>
                <li>Provide clear photographic evidence of the defect</li>
                <li>Include your order number and a detailed description of the issue</li>
              </ol>
              <p className="mt-2 text-amber-100">
                All claims are subject to verification. We reserve the right to deny any refund or replacement request that does not meet these criteria.
              </p>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <h3 className="font-semibold text-blue-300 mb-2">No Exceptions Policy</h3>
              <p className="text-blue-100">
                We strictly adhere to this policy without exception. By placing an order, you acknowledge that you have read, understood, and agreed to these terms.
              </p>
            </div>
          </div>

          <h2>8. Intellectual Property</h2>
          <p>
            All content on our website, including text, graphics, logos, images, and software, is the property of
            SealClub Beauty and is protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            SealClub Beauty shall not be liable for any direct, indirect, incidental, special, consequential, or punitive
            damages resulting from your use of or inability to use our website or products.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without
            regard to its conflict of law provisions.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Any changes will be effective immediately upon
            posting on our website. Your continued use of our website after any changes to these Terms constitutes your
            acceptance of the revised Terms.
          </p>

          <h2>12. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>
            Email: support@ozptides.com
            <br />
            Phone: +1 (888) 123-4567
          </p>
        </div>

        <Separator className="my-8" />

        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
