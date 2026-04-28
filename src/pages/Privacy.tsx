import React from 'react';
import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-indigo max-w-none space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: April 28, 2026</p>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information you provide directly to us when you create an account, complete profile information, or communicate with us. This includes your name, email address, payment information, and professional history.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">2. How We Use Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We use the information we collect to operate, maintain, and provide the features of the Orbit platform. This includes processing payments, verifying identities, and improving our AI matching algorithms.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">3. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your personal data from unauthorized access, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">4. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time through your account settings or by contacting our support team.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
