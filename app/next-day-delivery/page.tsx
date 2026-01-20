import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle, 
  Heart,
  Package,
  ArrowRight,
  AlertCircle,
  Users
} from "lucide-react"

export default function NextDayDeliveryPage() {
  const eligibleProducts = [
    { name: "Retatrutide", description: "GIPR/GLP-1r Agonist" },
    { name: "Semaglutide", description: "GLP-1 Receptor Agonist" },
    { name: "Tirzepatide", description: "GIP/GLP-1 Receptor Agonist" },
    { name: "CJC-1295 + Ipamorelin", description: "Growth Hormone Releasing Peptide" },
    { name: "Cagrilintide", description: "Amylin Receptor Agonist" },
    { name: "HGH", description: "Human Growth Hormone" },
    { name: "IGF-1 LR3", description: "Insulin-like Growth Factor" },
    { name: "Semax", description: "Nootropic Peptide" },
    { name: "Semax", description: "Nootropic Peptide" },
    { name: "Bacteriostatic Water", description: "Sterile Diluent for Reconstitution" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
              <Clock className="h-3 w-3 mr-1" />
              Melbourne Only
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 gradient-text">
              Next Day Delivery
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get your research compounds delivered the next business day in Melbourne. 
              Made possible by our dedicated family network who care about your research needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/categories">
                  Shop Eligible Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Next Day Delivery Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our unique powered delivery network ensures your research compounds arrive safely and quickly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Order by 2 PM</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Place your order for eligible products before 2 PM on any business day for next day delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Family Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our willing family members across Melbourne personally handle your delivery with care and dedication.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Next Day Arrival</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive your research compounds the next business day, carefully packaged and temperature controlled.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">A Personal Touch to Research Delivery</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're fortunate to have dedicated family members throughout Melbourne who understand 
                the importance of research work. They volunteer their time to ensure your compounds 
                reach you quickly and safely.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                This personal approach means your packages are handled with extra care, proper 
                temperature control, and the reliability that only comes from people who truly 
                care about your research success.
              </p>
              <div className="flex items-start gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <Heart className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-400">Family-Powered Service</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Every delivery is handled by caring family members who understand the value of your research.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image 
                  src="/conv.png" 
                  alt="Melbourne Delivery Network" 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligible Products */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Currently Eligible Products</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These premium research compounds are available for next day delivery in Melbourne. 
              More products are being added regularly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleProducts.map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                More products being added soon! Check back regularly for updates.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-secondary/30 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Melbourne Service Area</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Greater Melbourne Area</h4>
                      <p className="text-muted-foreground">All Melbourne suburbs and surrounding areas covered</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Business Days Only</h4>
                      <p className="text-muted-foreground">Monday to Friday delivery service</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Secure Packaging</h4>
                      <p className="text-muted-foreground">Temperature-controlled, discreet delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-6">Melbourne Residents Only</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our next day delivery service is currently exclusive to Melbourne residents. 
                This allows us to maintain the highest quality standards and personal touch 
                that our family network provides.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                If you're located outside Melbourne, don't worry! We still offer fast 
                standard shipping across Australia and international express delivery worldwide.
              </p>
              <Button asChild>
                <Link href="/categories">
                  Browse All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Have You Seen Any Other Peptide Company Offer Next Day Delivery?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              We didn't think so. This is what sets us apart from every other research peptide supplier in the world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Why We're Different</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Industry First</h4>
                    <p className="text-muted-foreground">
                      No other peptide company offers genuine next day delivery. We're pioneering this service because we understand "research" can't wait.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Personal Touch</h4>
                    <p className="text-muted-foreground">
                      While others use impersonal courier services, our family owned enterprise ensures your compounds are handled with genuine care.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Research-Focused</h4>
                    <p className="text-muted-foreground">
                      We understand that research timelines are critical. When you need compounds urgently, we deliver.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-6">What to Expect</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">30-Minute Pre-Delivery Contact</p>
                    <p className="text-sm text-muted-foreground">We'll contact you 30 minutes before delivery to ensure you're ready</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Immediate Delivery Confirmation</p>
                    <p className="text-sm text-muted-foreground">You'll receive an instant message confirming successful delivery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Guarantee</p>
                    <p className="text-sm text-muted-foreground">
                      While we strive for next day delivery, if your order doesn't arrive within 2-3 days, 
                      we'll provide store credit as compensation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & CTA */}
      <section className="py-16 bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/80" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Clock className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready for Next Day Delivery?</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Next day delivery is available for just <span className="font-bold text-primary">$45</span> 
              on eligible products. Order before 2 PM for next business day arrival.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Experience the convenience of having your research compounds delivered by people who care 
              about your work as much as you do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/categories">Start Shopping</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Have Questions?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
