import { Link } from 'react-router-dom'
import { CheckCircle, Star, MapPin, Shield, Clock, DollarSign } from 'lucide-react'

const services = [
  { name: 'Mowing', price: 'From $35', icon: '🌱' },
  { name: 'Trimming', price: 'From $25', icon: '✂️' },
  { name: 'Edging', price: 'From $20', icon: '📏' },
  { name: 'Fertilizing', price: 'From $45', icon: '💧' },
]

const features = [
  { icon: MapPin, title: 'GPS Tracking', desc: 'Track your vendor in real-time' },
  { icon: Shield, title: 'Verified Pros', desc: 'Background-checked professionals' },
  { icon: Clock, title: 'Flexible Scheduling', desc: 'Book at your convenience' },
  { icon: DollarSign, title: 'Transparent Pricing', desc: 'No hidden fees or surprises' },
]

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🌱</span>
              <span className="text-xl font-bold text-lawn-700">Lawn Pro</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-600 hover:text-lawn-600">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-lawn-600">How It Works</a>
              <a href="#vendors" className="text-gray-600 hover:text-lawn-600">For Vendors</a>
            </div>
            <div className="flex space-x-4">
              <Link to="/vendor/dashboard" className="text-gray-600 hover:text-lawn-600 px-4 py-2">
                Login
              </Link>
              <button className="btn-primary">Sign Up</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Lawn Care,
            <br />
            <span className="text-lawn-600">Delivered to Your Door</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with trusted lawn care professionals in your area. Book mowing, trimming, edging, and more in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book" className="btn-primary text-lg px-8 py-4">
              Book Lawn Service
            </Link>
            <Link to="/vendor/dashboard" className="btn-secondary text-lg px-8 py-4">
              Become a Pro
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle className="text-lawn-500" />
              <span>Verified & Insured</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="text-yellow-500 fill-current" />
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="text-lawn-500" />
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.name} className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-lawn-600 font-medium">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-16 bg-lawn-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Lawn Pro?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-lawn-600" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lawn-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of happy customers with beautiful lawns
          </p>
          <Link to="/book" className="bg-white text-lawn-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-block">
            Book Your First Service
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-lg font-bold text-white">Lawn Pro</span>
            </div>
            <p className="text-sm">Professional lawn care marketplace connecting homeowners with trusted providers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Safety</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Facebook</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
