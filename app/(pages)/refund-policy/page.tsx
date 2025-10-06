import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy - Daniel Vision School',
  description:
    'Refund and cancellation policy for Daniel Vision School courses',
};

const RefundPolicyPage = (): JSX.Element => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header */}
          <div className="mb-5">
            <h1 className="mb-3">Refund Policy</h1>
            <div className="alert alert-info">
              <strong>Last Updated:</strong> October 6, 2025 (Version
              v2025-10-06)
            </div>
            <p className="text-muted">
              At Daniel Vision School, we are committed to your satisfaction.
              This Refund Policy explains the conditions under which you may
              request a refund for purchased courses.
            </p>
          </div>

          {/* Quick Summary */}
          <div className="card bg-light mb-5">
            <div className="card-body">
              <h5 className="card-title">Quick Summary</h5>
              <ul className="mb-0">
                <li>
                  <strong>14-Day Refund Window:</strong> Request a refund within
                  14 days of purchase
                </li>
                <li>
                  <strong>Progress Limit:</strong> Must have completed less than
                  30% of the course
                </li>
                <li>
                  <strong>Processing Time:</strong> 7-10 business days after
                  approval
                </li>
                <li>
                  <strong>Contact:</strong> Email{' '}
                  <a href="mailto:support@dvs-education.com">
                    support@dvs-education.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 1. Eligibility */}
          <section className="mb-5">
            <h2>1. Refund Eligibility</h2>

            <h4 className="mt-4">1.1 Standard Refund Conditions</h4>
            <p>
              You are eligible for a full refund if ALL of the following
              conditions are met:
            </p>
            <div className="card border-success mb-3">
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <strong>Time Limit:</strong> Request submitted within{' '}
                    <strong>14 calendar days</strong> of purchase
                  </li>
                  <li>
                    <strong>Progress Limit:</strong> You have completed less
                    than <strong>30% of the course content</strong> (based on
                    lessons watched, quizzes taken, and assignments submitted)
                  </li>
                  <li>
                    <strong>No Downloads:</strong> You have not downloaded any
                    downloadable resources (PDFs, templates, bonus materials)
                  </li>
                  <li>
                    <strong>No Certificate:</strong> You have not requested or
                    received a course completion certificate
                  </li>
                </ul>
              </div>
            </div>

            <h4 className="mt-4">1.2 Quality Issues</h4>
            <p>
              If you experience technical issues that prevent you from accessing
              the course, you may be eligible for a refund regardless of
              progress, provided:
            </p>
            <ul>
              <li>The issue is reported within 14 days of discovery</li>
              <li>
                You have attempted to resolve the issue with our support team
              </li>
              <li>The issue cannot be resolved within 5 business days</li>
            </ul>
            <p className="text-muted">
              <small>
                Examples: Video playback errors, missing content, incompatible
                file formats. Note: Slow internet connection or personal device
                issues do not qualify.
              </small>
            </p>

            <h4 className="mt-4">1.3 Duplicate Purchases</h4>
            <p>
              If you accidentally purchase the same course twice, contact us
              within 14 days for a full refund of the duplicate purchase.
            </p>
          </section>

          {/* 2. Non-Refundable */}
          <section className="mb-5">
            <h2>2. Non-Refundable Cases</h2>
            <div className="alert alert-danger">
              <h5 className="alert-heading">
                ⚠️ No Refunds Will Be Issued For:
              </h5>
              <ul className="mb-0">
                <li>
                  <strong>Late Requests:</strong> Requests made after 14 days
                  from purchase date
                </li>
                <li>
                  <strong>Excessive Progress:</strong> Course completion of 30%
                  or more
                </li>
                <li>
                  <strong>Downloaded Materials:</strong> Any downloadable
                  resources have been accessed
                </li>
                <li>
                  <strong>Live Sessions:</strong> Live webinars, workshops, or
                  coaching sessions that have already occurred
                </li>
                <li>
                  <strong>Certificates Issued:</strong> Course completion
                  certificates have been generated
                </li>
                <li>
                  <strong>Bundle Courses:</strong> Individual courses within a
                  discounted bundle (unless the entire bundle is refunded)
                </li>
                <li>
                  <strong>Promotional Codes:</strong> Courses purchased with
                  promotional codes or during special sales (unless quality
                  issues are proven)
                </li>
                <li>
                  <strong>Repeat Offenders:</strong> Users who have abused the
                  refund policy in the past
                </li>
                <li>
                  <strong>Changed Mind:</strong> &quot;I changed my mind&quot;
                  after completing significant portions of the course
                </li>
              </ul>
            </div>
          </section>

          {/* 3. How to Request */}
          <section className="mb-5">
            <h2>3. How to Request a Refund</h2>

            <h4 className="mt-4">Step 1: Submit Request</h4>
            <p>
              Send an email to{' '}
              <a href="mailto:support@dvs-education.com">
                support@dvs-education.com
              </a>{' '}
              with the following information:
            </p>
            <div className="card mb-3">
              <div className="card-body">
                <ul className="mb-0">
                  <li>
                    <strong>Subject:</strong> Refund Request - [Course Name]
                  </li>
                  <li>
                    <strong>Order ID:</strong> Found in your purchase
                    confirmation email
                  </li>
                  <li>
                    <strong>Purchase Date:</strong> Date of transaction
                  </li>
                  <li>
                    <strong>Reason for Refund:</strong> Brief explanation
                    (required)
                  </li>
                  <li>
                    <strong>Account Email:</strong> Email used to register your
                    account
                  </li>
                </ul>
              </div>
            </div>

            <h4 className="mt-4">Step 2: Review Process</h4>
            <p>
              Our team will review your request within{' '}
              <strong>2-3 business days</strong> and verify:
            </p>
            <ul>
              <li>Eligibility based on our refund policy</li>
              <li>Course progress and activity logs</li>
              <li>Any technical issues reported</li>
            </ul>

            <h4 className="mt-4">Step 3: Approval & Processing</h4>
            <p>
              If approved, your refund will be processed within{' '}
              <strong>7-10 business days</strong> to your original payment
              method:
            </p>
            <ul>
              <li>
                <strong>Credit/Debit Card (Stripe):</strong> 5-7 business days
              </li>
              <li>
                <strong>PayPal:</strong> Immediate to PayPal balance, 3-5 days
                to bank account
              </li>
            </ul>
            <p className="text-muted">
              <small>
                Note: Bank processing times may vary by institution.
              </small>
            </p>
          </section>

          {/* 4. Fees & Deductions */}
          <section className="mb-5">
            <h2>4. Refund Fees and Deductions</h2>

            <h4 className="mt-4">4.1 Transaction Fees</h4>
            <p>
              Payment gateway fees (Stripe: 2.9% + $0.30, PayPal: 2.9% + $0.30)
              incurred during the original transaction are{' '}
              <strong>non-refundable</strong> and will be deducted from your
              refund amount.
            </p>
            <div className="alert alert-warning">
              <strong>Example:</strong> If you paid $100 for a course,
              transaction fees of $3.20 were charged. Your refund will be{' '}
              <strong>$96.80</strong>.
            </div>

            <h4 className="mt-4">4.2 Currency Exchange</h4>
            <p>
              For international transactions, refunds are processed in the
              original currency. Currency conversion rates are determined at the
              time of refund and may differ from the purchase rate. Any exchange
              rate differences are borne by the customer.
            </p>

            <h4 className="mt-4">4.3 Taxes</h4>
            <p>
              Taxes paid at the time of purchase will be refunded according to
              applicable tax laws in your jurisdiction. Please consult your
              local tax authority for details.
            </p>
          </section>

          {/* 5. Partial Refunds */}
          <section className="mb-5">
            <h2>5. Partial Refunds</h2>
            <p>
              In exceptional cases, we may offer partial refunds at our
              discretion. This typically applies when:
            </p>
            <ul>
              <li>You have completed between 30-50% of the course content</li>
              <li>
                Technical issues prevented full course access for an extended
                period
              </li>
              <li>
                Course content was significantly updated, making your completed
                work obsolete
              </li>
            </ul>
            <p className="text-muted">
              Partial refund amounts are determined on a case-by-case basis and
              are final once agreed upon.
            </p>
          </section>

          {/* 6. Abuse Prevention */}
          <section className="mb-5">
            <h2>6. Refund Abuse Prevention</h2>
            <div className="alert alert-danger">
              <h5 className="alert-heading">
                ⚠️ Abuse of this Policy Will Result In:
              </h5>
              <ul className="mb-0">
                <li>
                  <strong>Account Suspension:</strong> Repeated refund requests
                  may lead to account termination
                </li>
                <li>
                  <strong>Refund Denial:</strong> Users with a history of
                  excessive refunds (3+ in 12 months) will be flagged
                </li>
                <li>
                  <strong>Blacklist:</strong> Fraudulent refund attempts will
                  result in permanent ban
                </li>
                <li>
                  <strong>Legal Action:</strong> Course content piracy or
                  reselling will be prosecuted
                </li>
              </ul>
            </div>
            <p>
              We track refund patterns to identify abuse. Examples of abuse
              include:
            </p>
            <ul>
              <li>
                Completing most of a course, then requesting a refund
                (&quot;course raiding&quot;)
              </li>
              <li>Downloading all materials before requesting a refund</li>
              <li>Requesting refunds for multiple courses in a short period</li>
              <li>Creating multiple accounts to exploit the 14-day policy</li>
            </ul>
          </section>

          {/* 7. Exceptions */}
          <section className="mb-5">
            <h2>7. Special Circumstances</h2>

            <h4 className="mt-4">7.1 Medical or Emergency Situations</h4>
            <p>
              If you cannot complete a course due to a medical emergency or
              unforeseen life event, contact us with documentation. We may
              offer:
            </p>
            <ul>
              <li>Extended access to the course (freeze account)</li>
              <li>Course transfer to another user (one-time only)</li>
              <li>Refund consideration on a case-by-case basis</li>
            </ul>

            <h4 className="mt-4">7.2 Course Discontinuation</h4>
            <p>
              If we discontinue a course you purchased, you will be offered:
            </p>
            <ul>
              <li>Full refund of the purchase price</li>
              <li>
                OR equivalent course credit for another course of equal or
                lesser value
              </li>
              <li>
                OR lifetime access to archived course materials (if available)
              </li>
            </ul>
            <p className="text-muted">
              We will provide at least 30 days&apos; notice before discontinuing
              any paid course.
            </p>
          </section>

          {/* 8. Chargebacks */}
          <section className="mb-5">
            <h2>8. Chargebacks and Disputes</h2>
            <div className="alert alert-warning">
              <h5 className="alert-heading">
                ⚠️ Important: Contact Us Before Filing a Chargeback
              </h5>
              <p>
                If you file a chargeback with your credit card company or PayPal
                without first contacting us, we will:
              </p>
              <ul className="mb-0">
                <li>
                  Immediately suspend your account and revoke course access
                </li>
                <li>Contest the chargeback with transaction evidence</li>
                <li>Report fraudulent chargebacks to payment processors</li>
                <li>Blacklist your account from future purchases</li>
              </ul>
            </div>
            <p>
              <strong>Please reach out to us first.</strong> Most issues can be
              resolved quickly through our support team without the need for
              chargebacks, which cost us significant fees.
            </p>
          </section>

          {/* 9. Changes to Policy */}
          <section className="mb-5">
            <h2>9. Changes to This Policy</h2>
            <p>
              We reserve the right to modify this Refund Policy at any time.
              Changes will be effective immediately upon posting to this page.
              Purchases made before policy changes are governed by the policy in
              effect at the time of purchase.
            </p>
            <p>
              <strong>Your Rights:</strong> If you disagree with policy changes,
              you may request a refund under the previous policy terms within 7
              days of the change notification.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="mb-5">
            <h2>10. Contact Information</h2>
            <p>
              For refund requests, questions, or concerns, please contact us:
            </p>
            <div className="card">
              <div className="card-body">
                <p className="mb-2">
                  <strong>Refund Support:</strong>{' '}
                  <a href="mailto:support@dvs-education.com">
                    support@dvs-education.com
                  </a>
                </p>
                <p className="mb-2">
                  <strong>Billing Inquiries:</strong>{' '}
                  <a href="mailto:billing@dvs-education.com">
                    billing@dvs-education.com
                  </a>
                </p>
                <p className="mb-2">
                  <strong>Response Time:</strong> Within 24-48 hours (business
                  days)
                </p>
                <p className="mb-0">
                  <strong>Website:</strong>{' '}
                  <a
                    href="https://dvs-education.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://dvs-education.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Related Policies */}
          <div className="card bg-light mt-5">
            <div className="card-body">
              <h5 className="card-title">Related Policies</h5>
              <ul className="mb-0">
                <li>
                  <Link href="/terms-of-service" className="text-primary">
                    Terms of Service
                  </Link>{' '}
                  - Understand your rights and obligations
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-primary">
                    Privacy Policy
                  </Link>{' '}
                  - How we protect your personal information
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="alert alert-secondary mt-5">
            <h5>Acknowledgment</h5>
            <p className="mb-0">
              By making a purchase on Daniel Vision School, you acknowledge that
              you have read, understood, and agree to this Refund Policy.
              Disagreement with these terms should be communicated before
              completing your purchase.
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

export default RefundPolicyPage;
