import React, { useState } from 'react';
import axios from 'axios';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Contact Form Inquiry', // Default subject
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/email/contact`, formData);
      setMessage('✅ Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: 'Contact Form Inquiry',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      setMessage('❌ Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center px-6 py-12 ">
      <div className="bg-gradient-to-r from-green-200 via-green-100 to-green-200  w-full max-w-3xl  shadow-lg rounded-lg p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-2  rounded-t-lg" />
        
        <h1 className="text-3xl font-bold text-green-800 mb-4 text-center">Get in Touch with Nature 🌿</h1>
        <p className="text-gray-700 mb-6 text-center">
          Have questions, ideas, or just want to say hello? We’d love to hear from you. Let's grow together!
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className={`p-3 rounded-lg text-center ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-green-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full text-gray-700 px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-green-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 text-gray-700 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-green-700 font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What's this about?"
              required
              className="w-full px-4 text-gray-700 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-green-700 font-medium mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Your message..."
              required
              className="w-full px-4 text-gray-700 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message 🌱'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-700">
          
        </div>
      </div>
    </div>
  );
}

export default Contact;
