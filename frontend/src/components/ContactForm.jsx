import React, { useState } from 'react';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiSend, 
  FiCheckCircle, 
  FiUser, 
  FiMessageSquare, 
  FiClock, 
  FiLoader,
  FiHelpCircle
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import axios from 'axios';
import { toast } from 'react-toastify';
import { serverUrl } from '../App';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Course Curriculum & Guidance',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/contact/submit`, formData);
      if (res.data?.success) {
        toast.success(res.data.message || 'Message sent successfully!');
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Course Curriculum & Guidance',
          message: '',
        });
      } else {
        toast.error(res.data?.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50/60 to-white border-t border-gray-100 relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-10 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wider mb-3">
            <HiSparkles className="text-indigo-600" />
            <span>Get in Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Have Questions? Let's Talk
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            Need guidance choosing a learning path, technical assistance, or have questions about live classes? Our academic team is here to support you.
          </p>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Contact Information & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Direct Channels</span>
              </h3>
              <p className="text-sm text-gray-500">
                Reach out to us directly through any of the channels below or fill out the form for a fast follow-up.
              </p>

              <div className="space-y-4 pt-2">
                {/* Email Card */}
                <a
                  href="mailto:support@codecrafters.io"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50/50 border border-gray-100 hover:border-indigo-100 transition-all duration-200 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <FiMail className="text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Us</span>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      support@codecrafters.io
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Response within 2-4 hours</p>
                  </div>
                </a>

                {/* Phone Card */}
                <a
                  href="tel:+919876543210"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50/50 border border-gray-100 hover:border-emerald-100 transition-all duration-200 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <FiPhone className="text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Support</span>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      +91 98765 43210
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Mon – Sat, 9:00 AM to 7:00 PM IST</p>
                  </div>
                </a>

                {/* Location Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FiMapPin className="text-lg" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campus Location</span>
                    <p className="text-sm font-bold text-gray-900">
                      CodeCrafters Academy HQ
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Electronic City, Bangalore, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Guarantee Badge */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="text-indigo-400 text-lg" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Dedicated Support</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold">Guaranteed 24-Hour Resolution</h4>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 leading-relaxed">
                Every inquiry is directly reviewed by our education counselors and technical leads so you get accurate, actionable answers quickly.
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-md">
              
              {submitted ? (
                <div className="text-center py-12 px-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    <FiCheckCircle />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Message Received!</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Thank you for reaching out to CodeCrafters Academy. An academic advisor has been assigned to your query and will reply shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">Send us a Message</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Fill out the form below and our team will get back to you promptly.
                    </p>
                  </div>

                  {/* Name & Email (2 columns on tablet/desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Rahul Sharma"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Subject Topic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Phone Number <span className="text-gray-400 text-[11px] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Topic / Subject
                      </label>
                      <div className="relative">
                        <FiHelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs cursor-pointer"
                        >
                          <option value="Course Curriculum & Guidance">Course Curriculum & Guidance</option>
                          <option value="Live Classes & Doubt Clearing">Live Classes & Doubt Clearing</option>
                          <option value="Recommended Books & Resources">Recommended Books & Resources</option>
                          <option value="Payment & Billing Inquiries">Payment & Billing Inquiries</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Partnership / Campus Training">Partnership / Campus Training</option>
                          <option value="General Inquiry">General Inquiry</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMessageSquare className="absolute left-3.5 top-3 text-gray-400 text-base pointer-events-none" />
                      <textarea
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us what you need help with or ask any question..."
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <FiLoader className="text-lg animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <FiSend className="text-base" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-2.5">
                      We respect your privacy. Your information is never shared with third parties.
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default ContactForm;
