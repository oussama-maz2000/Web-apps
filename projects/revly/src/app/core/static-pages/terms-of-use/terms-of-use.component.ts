import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-terms-of-use',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="static-page">
			<div class="container">
				<p class="effective-date">
					<strong>Effective date:</strong>
					<!-- INSERT EFFECTIVE DATE HERE -->
				</p>
				<h1>Terms of Use</h1>

				<section>
					<h2>1. Agreement to these Terms</h2>
					<p>
						These Terms of Use ("Terms") govern your access to and use of the website and services
						provided by Revly ("we", "us" or "our") at
						<a href="https://userevly.com">userevly.com</a> (the "Site") and any related mobile
						applications (together, the "Service"). By accessing or using the Service you agree to be
						bound by these Terms. If you do not agree, do not access or use the Service.
					</p>
				</section>

				<section>
					<h2>2. Relationship with the Privacy Policy</h2>
					<p>
						Our <a href="/privacy">Privacy Policy</a> describes how we collect and use personal
						information. By using the Service you also consent to our processing of your information as
						described in the Privacy Policy.
					</p>
				</section>

				<section>
					<h2>3. Eligibility</h2>
					<p>
						The Service is intended for users who are at least the minimum legal age in their
						jurisdiction to form binding contracts. If you are under that age, you must not use the
						Service except with the involvement of a parent or legal guardian.
					</p>
				</section>

				<section>
					<h2>4. Accounts, Credentials & Security</h2>
					<p>To use certain features of the Service you must register for an account. You agree to:</p>
					<ul>
						<li>Provide accurate, complete and up-to-date information when creating your account;</li>
						<li>
							Maintain the security of your account credentials and notify us immediately of any
							unauthorized use;
						</li>
						<li>Be solely responsible for all activity that occurs under your account.</li>
					</ul>
					<p>
						We may suspend or terminate accounts that we reasonably believe are compromised or used in
						violation of these Terms.
					</p>
				</section>

				<section>
					<h2>5. User Content & License</h2>
					<p>
						"User Content" means any reviews, comments, photos, ratings, replies, profiles, or other
						materials you post or submit to the Service.
					</p>
					<ul>
						<li>You retain ownership of your User Content.</li>
						<li>
							By posting User Content you grant Revly a non-exclusive, worldwide, royalty-free,
							transferable, sublicensable license to use, reproduce, distribute, prepare derivative
							works of, display and perform the User Content in connection with the Service and
							Revly's business, including promoting and redistributing part or all of the Service
							(and derivative works).
						</li>
						<li>
							You represent and warrant that you have all rights necessary to grant the license above
							and that the User Content does not violate any laws, third-party rights, or these
							Terms.
						</li>
					</ul>
					<p>
						We may moderate, remove, refuse or edit User Content for any reason, including content that
						violates these Terms, is abusive, spammy, or illegal. We are not required to retain or
						publish any content.
					</p>
				</section>

				<section>
					<h2>6. Rules for Reviews & Moderation</h2>
					<p>
						Reviews should be honest, original and based on real experiences. Prohibited acts include:
					</p>
					<ul>
						<li>Posting fake, misleading, defamatory, or paid reviews without disclosure;</li>
						<li>
							Posting the same review multiple times, mass-posting or using automated tools to
							manipulate ratings;
						</li>
						<li>Posting others' private information or copyrighted material without permission;</li>
						<li>
							Attempting to impersonate others or post on behalf of a business unless authorized.
						</li>
					</ul>
					<p>
						If you are a business owner and want to claim or manage a business listing, you must follow
						the verification process. Owners may be able to respond to reviews; moderators may remove
						or flag inappropriate replies. Repeated violations can result in account suspension or
						removal.
					</p>
				</section>

				<section>
					<h2>7. Paid Services, Subscriptions & Payments</h2>
					<p>
						Some features (e.g., premium listings, featured placements, analytics) are paid. Terms for
						paid services are governed by additional purchase/subscription terms provided at the time
						of purchase. General terms:
					</p>
					<ul>
						<li>
							Payments are processed by third-party payment providers; you agree to the provider's
							terms in addition to ours.
						</li>
						<li>
							Fees, billing cycles and cancellation rules are shown during checkout. Unless otherwise
							stated, subscription fees are non-refundable.
						</li>
						<li>
							We may change prices or introduce new fees; changes will not affect amounts already
							paid for active subscription periods.
						</li>
					</ul>
					<p>
						If you believe you were wrongly charged, contact support and we will investigate in
						accordance with our Refunds Policy.
					</p>
				</section>

				<section>
					<h2>8. Intellectual Property</h2>
					<p>
						All content, trademarks, logos and materials on the Service (other than User Content) are
						the property of Revly or its licensors and are protected by copyright, trademark and other
						laws. You may not copy, reproduce, distribute or create derivative works from our
						proprietary content without prior written permission.
					</p>
				</section>

				<section>
					<h2>9. Prohibited Conduct</h2>
					<p>When using the Service you must not:</p>
					<ul>
						<li>Use the Service for illegal activities or to violate applicable laws;</li>
						<li>
							Attempt to bypass security, reverse engineer the Service, or interfere with other
							users;
						</li>
						<li>Transmit viruses, malware, spam, or unsolicited communications;</li>
						<li>
							Collect other users' information without consent (scraping, harvesting, automated
							collection).
						</li>
					</ul>
					<p>
						We reserve the right to investigate and take appropriate action, including removing
						content, suspending accounts and cooperating with legal authorities.
					</p>
				</section>

				<section>
					<h2>10. Third-party Content & Links</h2>
					<p>
						The Service may contain links to third-party sites, advertisers or services. Those links
						are provided for convenience; we do not endorse or control those third parties and are not
						responsible for their content or practices.
					</p>
				</section>

				<section>
					<h2>11. Disclaimers</h2>
					<p>
						The Service and all content are provided "as is" and "as available" without warranties of
						any kind, either express or implied. We do not warrant that the Service will be
						uninterrupted, error-free, or free from harmful components. We are not responsible for the
						accuracy, completeness or usefulness of User Content.
					</p>
				</section>

				<section>
					<h2>12. Limitation of Liability</h2>
					<p>
						To the maximum extent permitted by applicable law, Revly and its officers, directors,
						employees and partners shall not be liable for any indirect, incidental, special,
						consequential, exemplary or punitive damages arising from your access to, or use of, the
						Service, including loss of profits, revenue, data or goodwill.
					</p>
					<p>
						Our total aggregate liability for direct damages will be limited to the amount paid by you
						(if any) for the relevant paid Service in the 12 months preceding the claim.
					</p>
				</section>

				<section>
					<h2>13. Indemnification</h2>
					<p>
						You agree to indemnify, defend, and hold harmless Revly and its affiliates from any claims,
						liabilities, damages, losses or expenses (including reasonable legal fees) arising out of
						your violation of these Terms or your User Content.
					</p>
				</section>

				<section>
					<h2>14. Termination</h2>
					<p>
						We may suspend or terminate your access to the Service at any time for violation of these
						Terms, for fraudulent activity, or for any other reason in our sole discretion. Upon
						termination, license rights granted by you to Revly for User Content will continue as
						necessary for Revly to operate the Service.
					</p>
				</section>

				<section>
					<h2>15. Governing Law & Dispute Resolution</h2>
					<p>
						These Terms are governed by and construed in accordance with the laws of Algeria. Any
						dispute arising out of or relating to these Terms will be brought exclusively in the
						competent courts of Algeria, unless otherwise required by mandatory law.
					</p>
				</section>

				<section>
					<h2>16. Changes to these Terms</h2>
					<p>
						We may modify these Terms from time to time. Material changes will be highlighted on the
						Site or communicated to you by email before they take effect. Continued use after changes
						constitutes acceptance of the updated Terms.
					</p>
				</section>

				<section>
					<h2>17. Contact</h2>
					<p>For questions about these Terms or the Service, contact us at:</p>
					<ul>
						<li>
							Email: <a href="mailto:support@userevly.com">support{{ '@' }}userevly.com</a>
						</li>
						<li>Contact form: <a href="/contact">https://userevly.com/contact</a></li>
					</ul>
				</section>
			</div>
		</div>
	`,
	styles: [
		`
			.static-page {
				padding: 2rem 0;
				min-height: 100vh;
			}

			.container {
				max-width: 900px;
				margin: 0 auto;
				padding: 0 1rem;
			}

			h1 {
				font-size: 2.5rem;
				margin-bottom: 2rem;
				color: #333;
			}

			h2 {
				font-size: 1.5rem;
				margin-top: 2rem;
				margin-bottom: 1rem;
				color: #555;
				border-bottom: 2px solid #007bff;
				padding-bottom: 0.5rem;
			}

			section {
				margin-bottom: 2rem;
				line-height: 1.8;
			}

			p {
				margin-bottom: 1rem;
				color: #666;
			}

			ul {
				margin: 1rem 0 1rem 2rem;
				color: #666;
			}

			li {
				margin-bottom: 0.5rem;
			}
		`
	]
})
export class TermsOfUseComponent {}
