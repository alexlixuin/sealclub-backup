import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p>
            This Privacy Policy describes how SealClub Beauty collects, uses, and shares your personal information when you
            visit our website or make a purchase.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            When you visit our website, we automatically collect certain information about your device, including
            information about your web browser, IP address, time zone, and some of the cookies that are installed on
            your device.
          </p>
          <p>
            When you make a purchase, we collect personal information such as your name, billing address, shipping
            address, payment information, email address, and phone number.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process orders and send order confirmations</li>
            <li>Communicate with you about your order or account</li>
            <li>Screen orders for potential risk or fraud</li>
            <li>Improve and optimize our website</li>
            <li>Provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
          </ul>

          <h2>3. Sharing Your Information</h2>
          <p>
            We share your information with third parties to help us use your personal information as described above.
            For example, we use Stripe to process payments—you can read more about how Stripe uses your personal
            information here: https://stripe.com/privacy.
          </p>
          <p>
            We may also share your information to comply with applicable laws and regulations, to respond to a subpoena,
            search warrant, or other lawful request for information we receive, or to otherwise protect our rights.
          </p>

          <h2>4. Behavioral Advertising</h2>
          <p>
            We use your personal information to provide you with targeted advertisements or marketing communications we
            believe may be of interest to you. You can opt out of targeted advertising by:
          </p>
          <ul>
            <li>Facebook: https://www.facebook.com/settings/?tab=ads</li>
            <li>Google: https://www.google.com/settings/ads/anonymous</li>
            <li>Bing: https://advertise.bingads.microsoft.com/en-us/resources/policies/personalized-ads</li>
          </ul>

          <h2>5. Cookies</h2>
          <p>
            We use cookies to maintain session information and to track user activity on our website. Most web browsers
            automatically accept cookies, but you can usually modify your browser setting to decline cookies if you
            prefer.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We will maintain your order information for our records unless and until you ask us to delete this
            information.
          </p>

          <h2>7. Changes</h2>
          <p>
            We may update this privacy policy from time to time in order to reflect changes to our practices or for
            other operational, legal, or regulatory reasons.
          </p>

          <h2>8. Contact Information</h2>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a
            complaint, please contact us by email at privacy@sealclubbeauty.com or by mail using the details provided below:
          </p>
          <p>
            SealClub Beauty
            <br />
            123 Research Blvd, Suite 456
            <br />
            San Francisco, CA 94103
            <br />
            United States
          </p>
        </div>

        <Separator className="my-8" />

        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/terms">Terms of Service</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
