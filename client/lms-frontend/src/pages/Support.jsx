import React, { useState, useContext } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  HelpCircle, 
  Book, 
  Users, 
  Shield,
  ChevronDown,
  ChevronRight,
  LogIn
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/authcontext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://phish-defence-full.onrender.com';

const Support = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contact');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const faqs = [
    {
      id: 1,
      question: "How do I get started with phishing simulations?",
      answer: "Getting started is easy! First, create your account and log in to your dashboard. Then, you can create your first phishing campaign by selecting templates, choosing target groups, and scheduling the simulation. Our platform provides step-by-step guidance throughout the process."
    },
    {
      id: 2,
      question: "What types of phishing simulations are available?",
      answer: "We offer comprehensive simulation types including email phishing, SMS/text message phishing (smishing), voice call simulations (vishing), and WhatsApp-based attacks. Each simulation type is designed to test different aspects of your team's security awareness."
    },
    {
      id: 3,
      question: "How often should I run phishing simulations?",
      answer: "We recommend running simulations monthly for optimal results. This frequency allows you to maintain security awareness without overwhelming your employees. You can adjust the frequency based on your organization's needs and compliance requirements."
    },
    {
      id: 4,
      question: "Can I customize the phishing templates?",
      answer: "Yes! Our platform offers extensive customization options. You can modify existing templates or create completely custom scenarios that match your organization's specific context, branding, and potential threat landscape."
    },
    {
      id: 5,
      question: "What kind of reporting and analytics are provided?",
      answer: "Our platform provides detailed analytics including click rates, reporting rates, training completion statistics, and trend analysis over time. You can generate executive summaries, detailed departmental reports, and individual user progress tracking."
    },
    {
      id: 6,
      question: "Is my data secure on your platform?",
      answer: "Absolutely. We employ enterprise-grade security measures including end-to-end encryption, secure data centers, regular security audits, and compliance with industry standards like SOC 2 and ISO 27001. Your data privacy and security are our top priorities."
    }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/support/contact`, contactForm);
      alert('Thank you for your message! We\'ll get back to you within 24 hours.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
    } catch (err) {
      alert('Failed to send your message. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleFaq = (id) => {
    setExpandedFaq(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500/20 rounded-full mb-6">
            <HelpCircle className="w-10 h-10 text-teal-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How Can We <span className="text-teal-500">Help You?</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get the support you need to maximize your cybersecurity training effectiveness. 
            Our team is here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/20 rounded-full mb-6">
                <MessageCircle className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {user ? 'Get instant help from our AI assistant' : 'Login to access our AI assistant'}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>{user ? 'Available 24/7' : 'Members only'}</span>
              </div>
              {user ? (
                <button 
                  onClick={() => {
                    // Trigger the Jotform AI agent to open
                    if (window.AgentInitializer) {
                      const agentElement = document.getElementById('JotformAgent-019803871aa976d4b0642ba001eeaeabce5d');
                      if (agentElement) {
                        const iframe = agentElement.querySelector('iframe');
                        if (iframe) {
                          iframe.style.display = 'block';
                          iframe.style.zIndex = '10000';
                        }
                      }
                    }
                  }}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
                >
                  Chat with AI
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login to Access</span>
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-6">
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Email Support</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Send us a detailed message</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>Response within 4 hours</span>
              </div>
              <button 
                onClick={() => setActiveTab('contact')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
              >
                Send Email
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-6">
                <Phone className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Phone Support</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Speak directly with our experts</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>Mon-Fri, 9AM-6PM EST</span>
              </div>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200">
                Call Now
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-xl p-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'contact'
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Contact Form
                </button>
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'faq'
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'resources'
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Resources
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'contact' && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Send Us a Message</h2>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={contactForm.subject}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                      <select
                        name="priority"
                        value={contactForm.priority}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                      placeholder="Please describe your question or issue in detail..."
                      required
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                      <div className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6 border-t border-gray-200 dark:border-slate-700/50">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4">
                    <Book className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Documentation</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Comprehensive guides and tutorials to help you get the most out of our platform.</p>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                    View Docs
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-4">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Community Forum</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Connect with other users, share best practices, and get answers from the community.</p>
                  <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                    Join Forum
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-4">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Best Practices</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Learn about the latest cybersecurity threats and how to protect your organization.</p>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                    Learn More
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-lg mb-4">
                    <MessageCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Video Tutorials</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Step-by-step video guides to help you master every feature of our platform.</p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                    Watch Videos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;