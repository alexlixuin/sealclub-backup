"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  DollarSign,
  Code,
  Mail,
  MessageCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Globe,
  Shield,
} from "lucide-react"
import Link from "next/link"
import AffiliateFlowchart from "@/components/affiliate-flowchart"

export default function PartnersPageClient() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="mt-6">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            Partner Applications
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto">
            Join our affiliate program and earn commissions by promoting clinical-luxury skincare and wellness.
            No experience required — anyone can become a partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm border border-blue-500/30 text-white px-8 py-3 text-lg"
              asChild
            >
              <Link href="mailto:partners@sealclubbeauty.com?subject=Affiliate Partnership Application">
                <Mail className="w-5 h-5 mr-2" />
                Apply Now
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-800/50 backdrop-blur-sm px-8 py-3 text-lg"
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).$crisp) {
                  ;(window as any).$crisp.push(["do", "chat:open"])
                }
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Ask Questions
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16 relative z-10">
        {/* Interactive Flowchart */}
        <section className="mb-16">
          <AffiliateFlowchart />
        </section>

        {/* What is the Affiliate Program */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">What is the SealClub Beauty Affiliate Program?</h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Our affiliate program lets you earn commissions by sharing SealClub Beauty skincare and wellness with your
              audience. It's a win-win partnership that benefits both you and your customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-white">
                  <Code className="w-6 h-6 mr-3 text-blue-400" />
                  Your Unique Affiliate Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  As an affiliate partner, you'll receive a personalized discount code (e.g.,{" "}
                  <strong className="text-blue-400">JOE10</strong>) that your customers can use during checkout.
                </p>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <p className="font-mono text-sm text-slate-300">
                    Example: Customer uses code{" "}
                    <span className="bg-blue-600/20 px-2 py-1 rounded font-bold text-blue-300 border border-blue-500/30">
                      JOE10
                    </span>{" "}
                    at checkout
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-green-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-white">
                  <DollarSign className="w-6 h-6 mr-3 text-green-400" />
                  Earn Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Every time a customer uses your affiliate code, you earn a percentage of their purchase. The more
                  customers you refer, the more you earn!
                </p>
                <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                  <p className="text-green-300 font-semibold">💰 Competitive commission rates on all sales</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Apply to Join</h3>
              <p className="text-slate-300">
                Send us an email at partners@sealclubbeauty.com to start your application. No specific requirements — everyone
                is welcome!
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Get Your Code</h3>
              <p className="text-slate-300">
                Once approved, you'll receive your unique affiliate code and promotional materials to help you succeed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Start Earning</h3>
              <p className="text-slate-300">
                Share your code with your audience and earn commissions on every sale made using your affiliate code.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Partner Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-white">Competitive Commissions</h3>
                <p className="text-sm text-slate-300">Earn attractive commission rates on all referred sales</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-green-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-white">Global Reach</h3>
                <p className="text-sm text-slate-300">Promote to customers worldwide with international shipping</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-white">Quality Products</h3>
                <p className="text-sm text-slate-300">Promote premium skincare and wellness with proven quality</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-white">Marketing Support</h3>
                <p className="text-sm text-slate-300">Access promotional materials and marketing resources</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-green-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-white">Easy Tracking</h3>
                <p className="text-sm text-slate-300">Monitor your referrals and earnings with detailed reporting</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-white">Dedicated Support</h3>
                <p className="text-sm text-slate-300">Get help from our affiliate support team whenever you need it</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Eligibility */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-300">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                No Eligibility Criteria Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-white mb-4">
                <strong>Anyone can become a SealClub Beauty affiliate partner!</strong>
              </p>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Whether you're a creator, skincare enthusiast, wellness coach, or someone who believes in our
                products — we welcome all applications. No minimum followers, no experience requirements, no complicated
                criteria.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How to Apply */}
        <section className="mb-16">
          <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4 text-white">Ready to Get Started?</CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Join our affiliate program today and start earning commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">How to Apply:</h3>
                <div className="bg-slate-800/50 p-6 rounded-lg mb-6 border border-slate-700">
                  <p className="text-slate-300 mb-2">Send an email to:</p>
                  <p className="text-2xl font-bold text-blue-400">partners@sealclubbeauty.com</p>
                  <p className="text-slate-300 mt-2">
                    Include a brief introduction about yourself and why you'd like to become a partner
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm border border-blue-500/30 text-white px-12 py-4 text-lg"
                asChild
              >
                <Link href="mailto:partners@sealclubbeauty.com?subject=Affiliate Partnership Application&body=Hi SealClub Beauty Team,%0D%0A%0D%0AI'm interested in becoming an affiliate partner. Here's a brief introduction about myself:%0D%0A%0D%0A[Please tell us about yourself and why you'd like to become a partner]%0D%0A%0D%0AThank you for considering my application!%0D%0A%0D%0ABest regards">
                  <Mail className="w-6 h-6 mr-3" />
                  Apply Now - Send Email
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* FAQ and Support */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Questions & Support</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <MessageCircle className="w-6 h-6 mr-3 text-blue-400" />
                  Have Questions?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Our support team is here to help! Click the button below to start a live chat and get immediate
                  answers to your questions about the affiliate program.
                </p>
                <Button
                  className="w-full bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm border border-blue-500/30"
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as any).$crisp) {
                      ;(window as any).$crisp.push(["do", "chat:open"])
                    }
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Mail className="w-6 h-6 mr-3 text-green-400" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Prefer email? Send us your questions about the affiliate program and we'll get back to you within 24
                  hours.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50"
                  asChild
                >
                  <Link href="mailto:partners@sealclubbeauty.com?subject=Affiliate Program Inquiry">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick FAQ */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-white">Quick FAQ</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2 text-white">How much can I earn?</h4>
                  <p className="text-sm text-slate-300">
                    Commission rates vary based on product categories and sales volume. Contact us for specific details
                    about our current commission structure.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2 text-white">When do I get paid?</h4>
                  <p className="text-sm text-slate-300">
                    Commissions are calculated monthly and paid out according to our payment schedule. Details will be
                    provided upon acceptance.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2 text-white">Can I use my own code?</h4>
                  <p className="text-sm text-slate-300">
                    Yes! You can use your own affiliate code for personal purchases, but commission terms may vary for
                    self-referrals.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2 text-white">How long does approval take?</h4>
                  <p className="text-sm text-slate-300">
                    Most applications are reviewed within 2-3 business days. You'll receive an email with your decision
                    and next steps.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
