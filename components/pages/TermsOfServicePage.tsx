import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
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
          <FileText className="text-emerald-500" size={32} />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <p className="text-zinc-400 mb-8">Last updated: January 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-300 leading-relaxed">
              By accessing or using Photovid's services at photovid.studio, you agree to be bound
              by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-zinc-300 leading-relaxed">
              Photovid provides AI-powered image and video generation tools for real estate professionals,
              auto dealerships, and other businesses. Our services include virtual staging, photo enhancement,
              video creation, and related features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">To use our services, you must:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Create an account with accurate information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Notify us immediately of any unauthorized account access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">You agree NOT to use our services to:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Generate misleading or fraudulent real estate listings</li>
              <li>Create deepfakes or deceptive media of real people without consent</li>
              <li>Attempt to reverse engineer or hack our systems</li>
              <li>Use automated systems to abuse our services</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Content Ownership</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              <strong>Your Content:</strong> You retain ownership of images and videos you upload.
              By uploading content, you grant us a limited license to process it through our AI systems.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong>Generated Content:</strong> You own the AI-generated outputs created from your
              content and may use them for commercial purposes in accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Credits and Payment</h2>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Our services operate on a credit-based system</li>
              <li>Credits are non-refundable once purchased</li>
              <li>Credit costs vary by tool and generation type</li>
              <li>We reserve the right to modify pricing with notice</li>
              <li>Unused credits do not expire</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Service Availability</h2>
            <p className="text-zinc-300 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted service.
              We may modify, suspend, or discontinue features with reasonable notice. Scheduled
              maintenance will be communicated in advance when possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-zinc-300 leading-relaxed">
              Our services are provided "as is" without warranties of any kind. AI-generated
              content may not always meet expectations. We do not guarantee specific results
              from our tools. You are responsible for reviewing generated content before use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-zinc-300 leading-relaxed">
              To the maximum extent permitted by law, Photovid shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use
              of our services. Our total liability shall not exceed the amount you paid us
              in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Termination</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may terminate or suspend your account at any time for violation of these terms.
              You may delete your account at any time. Upon termination, your right to use our
              services ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may modify these terms at any time. Continued use of our services after changes
              constitutes acceptance of the new terms. Material changes will be communicated via
              email or prominent notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p className="text-zinc-300 leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws.
              Any disputes shall be resolved through binding arbitration or in the courts of
              competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">13. Contact</h2>
            <p className="text-zinc-300 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-emerald-400 mt-2">legal@photovid.studio</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
