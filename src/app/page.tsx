import { FaBolt, FaBatteryHalf, FaChartLine, FaUsers } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <header className="px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center mb-6">
            <FaBolt className="text-6xl text-primary mr-4" />
            <h1 className="text-5xl font-bold text-charcoal">
              Creative Energy Flow
            </h1>
          </div>
          
          <p className="text-xl text-charcoal/80 mb-8 max-w-2xl mx-auto">
            Track your creative energy and social battery with AI-powered personalized constraints. 
            Optimize your productivity while maintaining healthy boundaries.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Get Started
            </button>
            <button className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-12">
            Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <FaBolt className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Energy Tracking
              </h3>
              <p className="text-charcoal/70">
                Monitor your creative energy levels throughout the day with intuitive tracking tools.
              </p>
            </div>
            
            <div className="text-center">
              <FaBatteryHalf className="text-4xl text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Social Battery
              </h3>
              <p className="text-charcoal/70">
                Keep track of your social interactions and recharge time needs.
              </p>
            </div>
            
            <div className="text-center">
              <FaChartLine className="text-4xl text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                AI Insights
              </h3>
              <p className="text-charcoal/70">
                Get personalized recommendations based on your energy patterns.
              </p>
            </div>
            
            <div className="text-center">
              <FaUsers className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Community
              </h3>
              <p className="text-charcoal/70">
                Connect with others on similar productivity and wellness journeys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-charcoal mb-6">
            Ready to Optimize Your Energy?
          </h2>
          <p className="text-xl text-charcoal/80 mb-8">
            Join thousands of creative professionals who are already tracking their energy flow and improving their productivity.
          </p>
          <button className="bg-accent text-charcoal px-10 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-lg">
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaBolt className="text-2xl text-primary mr-2" />
            <span className="text-xl font-semibold">Creative Energy Flow</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
