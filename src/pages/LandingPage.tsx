import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Users,
  Trophy,
  Zap,
  Target,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
const logoUrl = 'https://i.imghippo.com/files/PZi2232jXA.png'

// Vibrant color palette from logo
const colors = {
  pink: '#FF3EBF',
  orange: '#FFB340',
  yellow: '#FFE156',
  teal: '#00E1D3',
  blue: '#3B82F6',
  purple: '#A259FF',
}

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized learning paths adapted to each student's unique pace and style",
      color: "from-[#FF3EBF] to-[#A259FF]"
    },
    {
      icon: Target,
      title: "Adaptive Assessment",
      description: "Dynamic evaluations that adjust difficulty in real-time based on performance",
      color: "from-[#FFB340] to-[#FFE156]"
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Engaging achievements, badges, and progress tracking to motivate learning",
      color: "from-[#00E1D3] to-[#3B82F6]"
    },
    {
      icon: Users,
      title: "Family Dashboard",
      description: "Comprehensive insights for parents to track and support their child's progress",
      color: "from-[#A259FF] to-[#FF3EBF]"
    }
  ]

  const subjects = [
    { name: "Mathematics", icon: "🔢", progress: 85 },
    { name: "Reading & Language", icon: "📚", progress: 92 },
    { name: "Science", icon: "🔬", progress: 78 },
    { name: "Social Studies", icon: "🌍", progress: 88 }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Parent of 3rd grader",
      quote: "My daughter's math skills improved dramatically in just 2 months. The AI tutor explains concepts so clearly!",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Elementary Teacher",
      quote: "This platform perfectly complements our classroom instruction. Students are more engaged than ever.",
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Homeschool Mom",
      quote: "The adaptive learning paths have been a game-changer for my kids' different learning styles.",
      avatar: "ER"
    }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#FF3EBF]/30 via-[#A259FF]/10 to-transparent z-0" />
      {/* Subtle bottom gradient accent */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#00E1D3]/30 via-[#FFB340]/10 to-transparent z-0" />

      {/* Navigation */}
      <nav className="px-4 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 relative z-10">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo container with reduced margin */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center mr-4"
          >
            <img src={logoUrl} alt="ElevatED Logo" className="w-[320px] h-[320px]" style={{ boxShadow: 'none', borderRadius: 0, background: 'none' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <a href="#features" className="text-gray-700 hover:text-[#FF3EBF] transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-[#FF3EBF] transition-colors font-medium">
              Pricing
            </a>
            <a href="#faq" className="text-gray-700 hover:text-[#FF3EBF] transition-colors font-medium">
              FAQ
            </a>
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-[#FF3EBF]">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-[#FF3EBF] to-[#00E1D3] hover:from-[#A259FF] hover:to-[#3B82F6] text-white">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        {/* Removed the oval/ellipse shape here */}
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-[#FFE156] text-[#FF3EBF] hover:bg-[#FFB340]">
              <Zap className="w-4 h-4 mr-1" />
              Smart Learning - Elevated Results
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Personalized Learning for
              <span className="text-[#FF3EBF] font-bold"> Every Child</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Unlock your child's potential with our AI-powered adaptive learning platform.
              Tailored curriculum, real-time feedback, and engaging gamification for ages 5-18.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-[#FF3EBF] to-[#00E1D3] hover:from-[#A259FF] hover:to-[#3B82F6] text-lg px-8 text-white shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 border-[#FF3EBF] text-[#FF3EBF] hover:bg-[#FF3EBF]/10">
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-gray-400 mt-4">
              Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Why Choose ElevatED?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with proven educational methods to create
            the most effective learning experience for your child.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transform transition-transform duration-300 ${hoveredFeature === index ? 'scale-110' : ''}`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2 text-[#FF3EBF]">{feature.title}</CardTitle>
                  <CardDescription className="text-[#3B82F6]">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="container mx-auto px-6 py-20 bg-white/90 backdrop-blur-sm rounded-3xl my-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-[#FF3EBF]">Comprehensive Curriculum</h2>
          <p className="text-xl text-[#3B82F6] max-w-2xl mx-auto">
            Core subjects aligned with educational standards, adapted to your child's grade level and learning style.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">{subject.icon}</div>
              <h3 className="font-semibold text-lg mb-3 text-[#A259FF]">{subject.name}</h3>
              <div className="w-full bg-[#FFE156]/40 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-[#FF3EBF] to-[#00E1D3] h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${subject.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-[#3B82F6]">{subject.progress}% Average Progress</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Loved by Families & Educators</h2>
          <p className="text-xl text-gray-600">
            See how ElevatED is transforming education for thousands of students.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full bg-white/90 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-[#FFB340] fill-current" />
                    ))}
                  </div>
                  <p className="text-[#3B82F6] mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF3EBF] to-[#00E1D3] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-[#FF3EBF]">{testimonial.name}</p>
                      <p className="text-sm text-[#3B82F6]">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">
            Start free and upgrade when you're ready for advanced features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2 text-[#FF3EBF]">Free Plan</CardTitle>
              <div className="text-4xl font-bold mb-4 text-[#3B82F6]">$0<span className="text-lg text-[#A259FF]">/month</span></div>
              <CardDescription className="text-[#A259FF]">Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#00E1D3] mr-3" />
                  <span>Basic assessment and learning paths</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#00E1D3] mr-3" />
                  <span>5 AI tutor interactions per day</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#00E1D3] mr-3" />
                  <span>2 core subjects</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#00E1D3] mr-3" />
                  <span>Basic progress tracking</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FF3EBF] to-[#00E1D3] text-white border-0 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-white text-[#FF3EBF]">Most Popular</Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Premium Plan</CardTitle>
              <div className="text-4xl font-bold mb-4">$9.99<span className="text-lg opacity-80">/month</span></div>
              <CardDescription className="text-[#FFE156]">Unlock full potential</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>Unlimited AI tutor access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>All subjects and grade levels</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>Parent dashboard features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-[#FF3EBF] hover:bg-[#FFE156]">
                Start Premium Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="bg-gradient-to-r from-[#FF3EBF] via-[#FFB340] to-[#00E1D3] rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Child's Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families already using ElevatED to unlock their children's potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-[#FF3EBF] hover:bg-[#FFE156] text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#FF3EBF] text-lg px-8">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-[#FF3EBF]">Frequently Asked Questions</h2>
          <p className="text-xl text-[#3B82F6]">
            Find answers to common questions about ElevatED.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Example FAQ Item */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-[#A259FF]">What age groups is ElevatED for?</h3>
            <p className="text-[#3B82F6]">
              ElevatED is designed for students in grades K-12 (ages 5-18). The content and difficulty adapt to each student's level.
            </p>
          </div>

          {/* Example FAQ Item */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-[#A259FF]">How does the adaptive learning work?</h3>
            <p className="text-[#3B82F6]">
              Our AI-powered engine constantly analyzes your child's performance to adjust the learning path, providing content that is challenging but not overwhelming.
            </p>
          </div>

          {/* Example FAQ Item */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-[#A259FF]">Is there a free trial?</h3>
            <p className="text-[#3B82F6]">
              Yes, we offer a 14-day free trial with no credit card required. You can explore core features during this period.
            </p>
          </div>

          {/* Add more FAQ items as needed */}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-100 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src={logoUrl} alt="ElevatED Logo" className="w-24 h-24" style={{ boxShadow: 'none', borderRadius: 0, background: 'none' }} />
          </div>

          <div className="flex space-x-6 text-[#3B82F6]">
            <a href="#" className="hover:text-[#FF3EBF] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#FF3EBF] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#FF3EBF] transition-colors">Support</a>
            <a href="#" className="hover:text-[#FF3EBF] transition-colors">Contact</a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-[#3B82F6]">
          <p>&copy; 2024 ElevatED. All rights reserved. Empowering the next generation of learners.</p>
        </div>
      </footer>
    </div>
  )
}