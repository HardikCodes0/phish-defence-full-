import React, { useContext } from 'react';
import { Mail, Phone, MessageSquare, Shield, Target, Users, BarChart3, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const features = [
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Phishing Simulation",
      description: "Realistic email phishing attacks to test employee awareness and response"
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: "Voice Call Training",
      description: "Vishing simulations to prepare teams for phone-based social engineering"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "SMS & WhatsApp Attacks",
      description: "Mobile-based phishing simulations for comprehensive security training"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Detailed Reporting",
      description: "Comprehensive analytics and reporting on training effectiveness"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Management",
      description: "Organize and track training progress across your entire organization"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-time Monitoring",
      description: "Live tracking of campaign performance and employee interactions"
    }
  ];

  const benefits = [
    "Reduce human error through targeted training",
    "Strengthen security posture organization-wide",
    "Meet compliance requirements effortlessly",
    "Build a security-conscious culture",
    "Protect against evolving cyber threats"
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Phishing Simulation{' '}
                <span className="text-teal-500">&</span>
                <br />
                <span className="text-teal-500">Employee Training</span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Simulate Phishing, SMShing, Voice Call & WhatsApp Attacks – Train Your Team, 
                Minimize Human Error, and Strengthen Your Security Posture
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/courses')} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Our Courses
                </button>
                {!user && (
                  <button onClick={() => navigate('/register')} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Register
                  </button>
                )}
                {user && user.isAdmin && (
                  <button onClick={() => navigate('/addcourse')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Add Course
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-500 mb-2">10,000+</div>
                  <div className="text-gray-600 dark:text-gray-300">Organizations Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-500 mb-2">95%</div>
                  <div className="text-gray-600 dark:text-gray-300">Threat Detection Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-500 mb-2">24/7</div>
                  <div className="text-gray-600 dark:text-gray-300">Security Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Comprehensive Security <span className="text-teal-500">Training Platform</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform provides everything you need to build a security-aware culture 
              and protect your organization from cyber threats
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-slate-600"
              >
                <div className="text-teal-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Choose <span className="text-teal-500">Phish Defense?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
              Our comprehensive platform delivers measurable results and builds lasting security awareness across your organization
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="bg-teal-500 rounded-full p-2 w-10 h-10 mb-4">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{benefit}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Trusted by Industry Leaders
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Join the thousands of organizations that have strengthened their security posture with our platform
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">500M+</div>
                <div className="text-sm opacity-80">Emails Analyzed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm opacity-80">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm opacity-80">Countries</div>
              </div>
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real results from real organizations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Phish Defense transformed our security culture. Our incident rate dropped by 85% in just 6 months.",
                author: "Sarah Johnson",
                role: "CISO, TechCorp"
              },
              {
                quote: "The training modules are engaging and effective. Our employees actually look forward to the sessions.",
                author: "Michael Chen",
                role: "IT Director, FinanceFirst"
              },
              {
                quote: "Best investment we've made in cybersecurity. The ROI was evident within the first quarter.",
                author: "Lisa Rodriguez",
                role: "Security Manager, HealthPlus"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Security Training Solution */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">
              Complete Security <span className="text-teal-500">Training Solution</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to build, maintain, and measure a security-conscious culture
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[
                { icon: <Shield className="h-8 w-8" />, title: "Advanced Protection", desc: "Multi-layered security approach" },
                { icon: <Target className="h-8 w-8" />, title: "Targeted Training", desc: "Personalized learning paths" },
                { icon: <BarChart3 className="h-8 w-8" />, title: "Real-time Analytics", desc: "Comprehensive reporting dashboard" },
                { icon: <Users className="h-8 w-8" />, title: "Team Collaboration", desc: "Organization-wide coordination" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-teal-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 text-white">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Stats Section */}
      <section className="py-24 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Security by the Numbers</h2>
              <p className="text-lg opacity-90">Measurable impact on your organization's security posture</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-400 mb-2">94%</div>
                <div className="text-sm opacity-80">Reduction in successful phishing attacks</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">3x</div>
                <div className="text-sm opacity-80">Faster threat response time</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">89%</div>
                <div className="text-sm opacity-80">Employee engagement rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">$2.4M</div>
                <div className="text-sm opacity-80">Average cost savings per year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Strengthen Your <span className="text-teal-500">Security?</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of organizations protecting themselves with our comprehensive training platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;