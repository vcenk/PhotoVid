import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="text-emerald-500" size={32} />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <p className="text-zinc-400 mb-8">Last updated: January 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-zinc-300 leading-relaxed">
              Welcome to Photovid ("we," "our," or "us"). We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our website and services at photovid.studio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Account information (email address, name, password)</li>
              <li>Profile information you choose to provide</li>
              <li>Images and videos you upload for processing</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Communications with us (support requests, feedback)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
            <p className="text-zinc-300 leading-relaxed">
              Your data is stored securely using industry-standard encryption. Images and videos
              you upload are processed by our AI systems and stored temporarily. We use Cloudflare R2
              for secure file storage and Supabase for database management, both of which employ
              robust security measures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Services</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">We use the following third-party services:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li><strong>Supabase</strong> - Authentication and database services</li>
              <li><strong>Cloudflare R2</strong> - File storage</li>
              <li><strong>FAL AI</strong> - AI image and video processing</li>
              <li><strong>Vercel</strong> - Website hosting</li>
              <li><strong>Google</strong> - OAuth authentication (optional)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of your personal data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Cookies</h2>
            <p className="text-zinc-300 leading-relaxed">
              We use essential cookies to maintain your session and preferences. We do not use
              tracking cookies for advertising purposes. You can control cookie settings through
              your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-zinc-300 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="text-zinc-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-emerald-400 mt-2">support@photovid.studio</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
