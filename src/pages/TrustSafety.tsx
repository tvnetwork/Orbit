import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';

export default function TrustSafety() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center"
        >
          <div className="inline-flex p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Trust & Safety</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Your security is our highest priority. We use industry-leading systems to protect every transaction and interaction on Orbit.
          </p>
        </motion.div>

        <div className="mt-20 space-y-16">
          <section className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Secure Payments</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every payment on Orbit is handled via our encrypted escrow system. Funds are securely held and only released when you authorize release after milestone completion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl flex-shrink-0">
                <Eye className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Identity Verification</h3>
                <p className="text-gray-600 leading-relaxed">
                  We verify the identity of every user on Orbit to maintain a professional and safe environment for collaboration. Verified profiles are marked with a badge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Dispute Resolution</h3>
                <p className="text-gray-600 leading-relaxed">
                  In the rare case of a disagreement, our dedicated support team is here to mediate and ensure a fair outcome based on contract terms and work evidence.
                </p>
              </div>
            </div>
          </section>

          <footer className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <h4 className="font-bold mb-4">How to stay safe:</h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-2">• Never share passwords or private keys.</li>
              <li className="flex gap-2">• Keep communication and payments on the platform.</li>
              <li className="flex gap-2">• Use strong, unique passwords and enable 2FA.</li>
              <li className="flex gap-2">• Report any suspicious behavior immediately.</li>
            </ul>
          </footer>
        </div>
      </div>
    </div>
  );
}
