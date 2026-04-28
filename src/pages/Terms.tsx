import React from 'react';
import { motion } from 'motion/react';

export default function Terms() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-indigo max-w-none space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-gray-500">Last updated: April 28, 2026</p>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Orbit, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use our services.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">2. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">3. Platform Fees</h2>
            <p className="text-gray-600 leading-relaxed">
              Orbit charges fees for successful project completions. These fees are detailed in our Fee Schedule and are subject to change with notice.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">4. Conduct</h2>
            <p className="text-gray-600 leading-relaxed">
              Users must interact professionally and honestly. Misrepresentation of skills, failure to complete agreed work, or harassment of other users will result in immediate account termination.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Orbit is a marketplace platform. We are not responsible for the quality of work performed by freelancers or the conduct of clients, except as expressly stated in our policies.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
