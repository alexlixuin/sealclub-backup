import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FlaskRoundIcon as Flask, 
  ShieldCheck, 
  Truck, 
  Globe, 
  Clock, 
  Award,
  Users,
  MessageCircle,
  ArrowRight
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">Global Research Leader</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 gradient-text">
              About OZPTides
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Global leading research compound and chemical producer, delivering premium peptides and SARMs 
              with unmatched quality and the best available prices worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Leading the Research Industry</h2>
              <p className="text-lg text-muted-foreground mb-6">
                OZPTides stands as a global leader in research compound production, specializing in 
                high-quality peptides and SARMs. With strategically located warehouses in Australia 
                and China, we ensure rapid delivery and exceptional service to researchers worldwide.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our commitment to quality, competitive pricing, and customer satisfaction has made us 
                the preferred choice for research institutions, laboratories, and individual researchers 
                seeking reliable compounds for their studies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/categories">
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image 
                  src="/conv.png" 
                  alt="OZPTides Laboratory" 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose OZPTides?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine global reach with local expertise to deliver the best research compounds at unbeatable prices.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Best Available Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We're committed to being the cheapest peptide seller while maintaining the highest quality standards.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Global Warehouses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Two strategic warehouses in Australia and China ensure fast, reliable shipping worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Next Day Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Next day shipping available for Australia, with fast international delivery options.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Flask className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>99% Purity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All products guarantee 99% purity with comprehensive testing and certificates of analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Custom Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Can't find what you need? We handle all peptide custom orders through our live chat support.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Research Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All compounds are strictly for research purposes only and meet the highest laboratory standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Shipping & Logistics */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-secondary/30 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Global Shipping Network</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Australia & New Zealand</h4>
                      <p className="text-muted-foreground">Next day delivery available from our Australian warehouse</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Worldwide Shipping</h4>
                      <p className="text-muted-foreground">10-day delivery to most international destinations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Secure Packaging</h4>
                      <p className="text-muted-foreground">Discreet, temperature-controlled shipping for all products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold mb-6">Fast, Reliable Delivery</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our dual-warehouse system in Australia and China allows us to serve customers globally 
                with unprecedented speed and efficiency. Whether you're conducting research in Sydney 
                or Shanghai, we ensure your compounds arrive quickly and safely.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                All shipments are carefully packaged with proper temperature control and discrete labeling 
                to maintain product integrity and privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Orders CTA */}
      <section className="py-16 bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/80" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Need Something Specific?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Can't find the compound you need in our store? We specialize in custom peptide orders. 
              Our live chat team is ready to help you source exactly what your research requires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">Start Live Chat</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/categories">Browse Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Commitment */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Quality Promise</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every product we ship meets the highest standards for research applications.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Flask className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">In-house Tested</h3>
              <p className="text-muted-foreground">
                All compounds undergo rigorous In-house testing to verify purity and composition.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certificates Available</h3>
              <p className="text-muted-foreground">
                Comprehensive certificates of analysis provided with every order upon request.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Research Only</h3>
              <p className="text-muted-foreground">
                All products are strictly for laboratory research use and not for human consumption.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}