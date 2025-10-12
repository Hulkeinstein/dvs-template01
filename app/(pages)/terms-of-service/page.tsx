'use client';

import Link from 'next/link';
import DarkSwitch from '@/components/Header/dark-switch';
import { useAppContext } from '@/context/Context';

const TermsOfServicePage = (): JSX.Element => {
  const { isLightTheme, toggleTheme } = useAppContext();

  return (
    <div className="container py-5 legal-page">
      {/* Theme Toggle Button - Fixed Top Right */}
      <div
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 999 }}
      >
        <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header */}
          <div className="mb-5">
            <h1 className="mb-3">Terms of Service</h1>
            <div className="alert alert-info">
              <strong>Last Updated:</strong> October 6, 2025 (Version
              v2025-10-06)
            </div>
            <p>
              Welcome to Daniel Vision School. By accessing or using our online
              learning platform, you agree to be bound by these Terms of
              Service. Please read them carefully.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="alert alert-info mb-5">
            <h5 className="alert-heading">Table of Contents</h5>
            <ol className="mb-0 toc-list">
              <li className="toc-item">
                <a href="#definitions" className="toc-link">
                  Definitions
                </a>
              </li>
              <li className="toc-item">
                <a href="#account" className="toc-link">
                  Account Creation and Management
                </a>
              </li>
              <li className="toc-item">
                <a href="#access" className="toc-link">
                  Course Access and License
                </a>
              </li>
              <li className="toc-item">
                <a href="#intellectual" className="toc-link">
                  Intellectual Property Rights
                </a>
              </li>
              <li className="toc-item">
                <a href="#prohibited" className="toc-link">
                  Prohibited Conduct
                </a>
              </li>
              <li className="toc-item">
                <a href="#payments" className="toc-link">
                  Payments and Pricing
                </a>
              </li>
              <li className="toc-item">
                <a href="#modifications" className="toc-link">
                  Service Modifications
                </a>
              </li>
              <li className="toc-item">
                <a href="#disclaimers" className="toc-link">
                  Disclaimers and Limitations
                </a>
              </li>
              <li className="toc-item">
                <a href="#termination" className="toc-link">
                  Termination
                </a>
              </li>
              <li className="toc-item">
                <a href="#governing" className="toc-link">
                  Governing Law and Dispute Resolution
                </a>
              </li>
              <li className="toc-item">
                <a href="#misc" className="toc-link">
                  Miscellaneous
                </a>
              </li>
              <li className="toc-item">
                <a href="#contact" className="toc-link">
                  Contact Information
                </a>
              </li>
            </ol>
          </div>

          {/* 1. Definitions */}
          <section id="definitions" className="mb-5">
            <h2>1. Definitions</h2>
            <ul>
              <li>
                <strong>&quot;Service&quot;</strong> or{' '}
                <strong>&quot;Platform&quot;</strong> refers to the Daniel
                Vision School online learning platform, including all websites,
                applications, and related services.
              </li>
              <li>
                <strong>&quot;You&quot;</strong>,{' '}
                <strong>&quot;User&quot;</strong>, or{' '}
                <strong>&quot;Student&quot;</strong> refers to any individual
                accessing or using our Service.
              </li>
              <li>
                <strong>&quot;We&quot;</strong>, <strong>&quot;Us&quot;</strong>
                , or <strong>&quot;Company&quot;</strong> refers to Daniel
                Vision School.
              </li>
              <li>
                <strong>&quot;Course&quot;</strong> or{' '}
                <strong>&quot;Content&quot;</strong> refers to any educational
                material, including videos, documents, quizzes, and assignments
                available on the Platform.
              </li>
              <li>
                <strong>&quot;Instructor&quot;</strong> refers to content
                creators who provide educational materials on the Platform.
              </li>
            </ul>
          </section>

          {/* 2. Account Creation */}
          <section id="account" className="mb-5">
            <h2>2. Account Creation and Management</h2>

            <h4 className="mt-4">2.1 Eligibility</h4>
            <p>
              You must be at least <strong>13 years old</strong> to create an
              account. Users under 18 must have parental or guardian consent.
            </p>

            <h4 className="mt-4">2.2 Account Registration</h4>
            <ul>
              <li>
                You must provide accurate and complete information during
                registration
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials
              </li>
              <li>
                You must notify us immediately of any unauthorized access to
                your account
              </li>
              <li>One account per person; account sharing is prohibited</li>
            </ul>

            <h4 className="mt-4">2.3 Account Security</h4>
            <p>
              You are solely responsible for all activities that occur under
              your account. We recommend using a strong, unique password and
              enabling two-factor authentication when available.
            </p>
          </section>

          {/* 3. Course Access and License */}
          <section id="access" className="mb-5">
            <h2>3. Course Access and License</h2>

            <h4 className="mt-4">3.1 License Grant</h4>
            <p>
              Upon enrollment, we grant you a limited, non-exclusive,
              non-transferable, revocable license to access and use the Course
              content for personal, non-commercial educational purposes only.
            </p>

            <h4 className="mt-4">3.2 Restrictions</h4>
            <p>You may NOT:</p>
            <ul>
              <li>
                Record, download, or redistribute Course content without
                explicit permission
              </li>
              <li>Share your account credentials with others</li>
              <li>Use Course content for commercial purposes</li>
              <li>
                Modify, reverse engineer, or create derivative works from Course
                materials
              </li>
              <li>
                Remove watermarks, logos, or copyright notices from Course
                content
              </li>
            </ul>

            <h4 className="mt-4">3.3 Lifetime Access</h4>
            <p>
              Unless otherwise stated, purchased courses provide lifetime access
              as long as the Platform remains operational. We reserve the right
              to discontinue courses with reasonable notice.
            </p>
          </section>

          {/* 4. Intellectual Property */}
          <section id="intellectual" className="mb-5">
            <h2>4. Intellectual Property Rights</h2>

            <h4 className="mt-4">4.1 Platform Ownership</h4>
            <p>
              All Course content, trademarks, logos, and service marks displayed
              on the Platform are the property of Daniel Vision School or
              respective content creators. Unauthorized use is strictly
              prohibited.
            </p>

            <h4 className="mt-4">4.2 User-Generated Content</h4>
            <p>
              By submitting comments, reviews, or other content to the Platform,
              you grant us a worldwide, perpetual, royalty-free license to use,
              reproduce, and display such content for Service-related purposes.
            </p>

            <h4 className="mt-4">4.3 Copyright Infringement</h4>
            <p>
              We respect intellectual property rights. If you believe your work
              has been infringed, contact us at{' '}
              <a href="mailto:copyright@dvs-education.com">
                copyright@dvs-education.com
              </a>{' '}
              with:
            </p>
            <ul>
              <li>Identification of the copyrighted work</li>
              <li>Location of the infringing material</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief</li>
              <li>Electronic signature</li>
            </ul>
          </section>

          {/* 5. Prohibited Conduct */}
          <section id="prohibited" className="mb-5">
            <h2>5. Prohibited Conduct</h2>
            <p>You agree NOT to:</p>
            <ul>
              <li>
                <strong>Violate Laws:</strong> Use the Service for any illegal
                purpose
              </li>
              <li>
                <strong>Abuse the System:</strong> Attempt to gain unauthorized
                access or disrupt Service operations
              </li>
              <li>
                <strong>Spam or Harass:</strong> Send unsolicited messages or
                engage in abusive behavior
              </li>
              <li>
                <strong>Fraudulent Refunds:</strong> Abuse our refund policy
                (see <Link href="/refund-policy">Refund Policy</Link>)
              </li>
              <li>
                <strong>Account Sharing:</strong> Share credentials or resell
                course access
              </li>
              <li>
                <strong>Content Theft:</strong> Download and redistribute course
                materials
              </li>
              <li>
                <strong>Bot Usage:</strong> Use automated tools to scrape or
                access the Platform
              </li>
            </ul>
            <p className="alert alert-info mt-3">
              <strong>
                Violation of these terms may result in immediate account
                termination without refund.
              </strong>
            </p>
          </section>

          {/* 6. Payments and Pricing */}
          <section id="payments" className="mb-5">
            <h2>6. Payments and Pricing</h2>

            <h4 className="mt-4">6.1 Pricing</h4>
            <ul>
              <li>All prices are displayed in USD unless otherwise stated</li>
              <li>Prices are subject to change without notice</li>
              <li>
                Promotional discounts are time-limited and non-transferable
              </li>
            </ul>

            <h4 className="mt-4">6.2 Payment Methods</h4>
            <p>
              We accept payments through Stripe (credit/debit cards) and PayPal.
              All transactions are processed securely.
            </p>

            <h4 className="mt-4">6.3 Taxes</h4>
            <p>
              Prices may exclude applicable taxes, which will be added at
              checkout based on your location.
            </p>

            <h4 className="mt-4">6.4 Refunds</h4>
            <p>
              Please see our{' '}
              <Link href="/refund-policy" className="text-primary">
                Refund Policy
              </Link>{' '}
              for details on eligibility and process.
            </p>
          </section>

          {/* 7. Service Modifications */}
          <section id="modifications" className="mb-5">
            <h2>7. Service Modifications and Termination</h2>

            <h4 className="mt-4">7.1 Right to Modify</h4>
            <p>We reserve the right to:</p>
            <ul>
              <li>Modify, suspend, or discontinue any part of the Service</li>
              <li>Update Course content for accuracy or improvements</li>
              <li>Change pricing structures with reasonable notice</li>
            </ul>

            <h4 className="mt-4">7.2 Notice of Changes</h4>
            <p>
              Material changes to these Terms will be communicated via email or
              Platform notification at least 7 days before taking effect.
            </p>

            <h4 className="mt-4">7.3 Service Interruptions</h4>
            <p>
              We do not guarantee uninterrupted or error-free service. Scheduled
              maintenance will be announced in advance when possible.
            </p>
          </section>

          {/* 8. Disclaimers */}
          <section id="disclaimers" className="mb-5">
            <h2>8. Disclaimers and Limitations of Liability</h2>

            <h4 className="mt-4">8.1 &quot;AS IS&quot; Disclaimer</h4>
            <p className="alert alert-info">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF
              ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT.
            </p>

            <h4 className="mt-4">8.2 No Guarantee of Results</h4>
            <p>
              While we strive to provide high-quality education, we do not
              guarantee specific outcomes, certifications, employment, or skill
              levels from Course completion.
            </p>

            <h4 className="mt-4">8.3 Third-Party Links</h4>
            <p>
              The Platform may contain links to third-party websites. We are not
              responsible for their content, accuracy, or practices.
            </p>

            <h4 className="mt-4">8.4 Limitation of Liability</h4>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, DANIEL VISION SCHOOL SHALL
              NOT BE LIABLE FOR:
            </p>
            <ul>
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or technical errors</li>
            </ul>
            <p>
              Our total liability shall not exceed the amount you paid for the
              affected Course in the 12 months preceding the claim.
            </p>
          </section>

          {/* 9. Termination */}
          <section id="termination" className="mb-5">
            <h2>9. Account Termination</h2>

            <h4 className="mt-4">9.1 Your Right to Terminate</h4>
            <p>
              You may close your account at any time by contacting{' '}
              <a href="mailto:support@dvs-education.com">
                support@dvs-education.com
              </a>
              . Termination does not entitle you to refunds unless eligible
              under our <Link href="/refund-policy">Refund Policy</Link>.
            </p>

            <h4 className="mt-4">9.2 Our Right to Terminate</h4>
            <p>
              We may suspend or terminate your account immediately without
              notice if you:
            </p>
            <ul>
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent activity</li>
              <li>Abuse the refund policy repeatedly</li>
              <li>Use the Platform for illegal purposes</li>
            </ul>

            <h4 className="mt-4">9.3 Effect of Termination</h4>
            <p>
              Upon termination, your access to Courses will be revoked, and any
              outstanding fees become immediately due.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section id="governing" className="mb-5">
            <h2>10. Governing Law and Dispute Resolution</h2>

            <h4 className="mt-4">10.1 Governing Law</h4>
            <p>
              These Terms shall be governed by the laws of the Sultanate of
              Oman, without regard to conflict of law principles.
            </p>

            <h4 className="mt-4">10.2 Dispute Resolution</h4>
            <div className="alert alert-warning">
              <p>
                Any disputes arising from these Terms or the Service shall be
                resolved through:
              </p>
              <ol className="mb-0">
                <li>
                  <strong>Informal Negotiation:</strong> Contact us at{' '}
                  <a href="mailto:legal@dvs-education.com">
                    legal@dvs-education.com
                  </a>{' '}
                  for amicable resolution (30 days).
                </li>
                <li>
                  <strong>Mediation:</strong> If negotiation fails, parties
                  agree to mediation before litigation.
                </li>
                <li>
                  <strong>Arbitration/Litigation:</strong> Unresolved disputes
                  shall be settled in the courts of Muscat, Oman.
                </li>
              </ol>
            </div>

            <h4 className="mt-4">10.3 Class Action Waiver</h4>
            <p>
              You agree to resolve disputes on an individual basis and waive the
              right to participate in class action lawsuits.
            </p>
          </section>

          {/* 11. Miscellaneous */}
          <section id="misc" className="mb-5">
            <h2>11. Miscellaneous Provisions</h2>

            <h4 className="mt-4">11.1 Entire Agreement</h4>
            <p>
              These Terms, along with our{' '}
              <Link href="/privacy-policy">Privacy Policy</Link> and{' '}
              <Link href="/refund-policy">Refund Policy</Link>, constitute the
              entire agreement between you and Daniel Vision School.
            </p>

            <h4 className="mt-4">11.2 Severability</h4>
            <p>
              If any provision of these Terms is found invalid or unenforceable,
              the remaining provisions shall remain in full force and effect.
            </p>

            <h4 className="mt-4">11.3 Force Majeure</h4>
            <p>
              We shall not be liable for failure to perform obligations due to
              events beyond reasonable control, including natural disasters,
              war, pandemics, or government actions.
            </p>

            <h4 className="mt-4">11.4 Assignment</h4>
            <p>
              You may not assign or transfer these Terms without our written
              consent. We may assign our rights and obligations without
              restriction.
            </p>

            <h4 className="mt-4">11.5 Waiver</h4>
            <p>
              Our failure to enforce any provision does not constitute a waiver
              of that provision or our right to enforce it in the future.
            </p>

            <h4 className="mt-4">11.6 Language</h4>
            <p>
              These Terms are provided in English. Translated versions are for
              convenience only; the English version prevails in case of
              discrepancies.
            </p>
          </section>

          {/* 12. Contact */}
          <section id="contact" className="mb-5">
            <h2>12. Contact Information</h2>
            <p>
              For questions, concerns, or notices regarding these Terms of
              Service, please contact us:
            </p>
            <div className="alert alert-info">
              <p className="mb-2">
                <strong>Daniel Vision School</strong>
              </p>
              <p className="mb-2">
                Email:{' '}
                <a href="mailto:support@dvs-education.com">
                  support@dvs-education.com
                </a>
              </p>
              <p className="mb-2">
                Legal Inquiries:{' '}
                <a href="mailto:legal@dvs-education.com">
                  legal@dvs-education.com
                </a>
              </p>
              <p className="mb-2">
                Website:{' '}
                <a
                  href="https://dvs-education.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://dvs-education.com
                </a>
              </p>
              <p className="mb-0">Location: Muscat, Sultanate of Oman</p>
            </div>
          </section>

          {/* Footer Notice */}
          <div className="alert alert-info mt-5">
            <h5>Acknowledgment</h5>
            <p className="mb-0">
              By using Daniel Vision School, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service. If
              you do not agree, you must discontinue use of the Platform
              immediately.
            </p>
          </div>

          {/* Back to Top */}
          <div className="text-center mt-4">
            <a href="#" className="btn btn-outline-primary">
              Back to Top ↑
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
