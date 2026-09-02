import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-privacy-policy',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="static-page">
			<div class="container">
				<h1>Privacy Policy</h1>

				<section>
					<h2>1. Introduction</h2>
					<p>
						Revly ("we", "us" or "our") operates the website and related services (the "Service"). This
						Privacy Policy explains how we collect, use, disclose and protect personal data when you
						use our Service and how you can exercise your legal rights under applicable Algerian data
						protection law (Law No. 18-07) and its amendment (Law No. 25-11).
					</p>
				</section>

				<section>
					<h2>2. Scope</h2>
					<p>
						This policy applies to all personal data processed by Revly in connection with the Service,
						whether you are a visitor, registered user, business listed on our platform, moderator, or
						other individual whose information we process. It covers data collected via the website,
						mobile apps, emails, telephone, and other channels.
					</p>
				</section>

				<section>
					<h2>3. Definitions</h2>
					<p>For the purposes of this policy:</p>
					<ul>
						<li>
							<strong>"Personal data"</strong> means any information relating to an identified or
							identifiable natural person.
						</li>
						<li>
							<strong>"Processing"</strong> means any operation performed on personal data
							(collection, storage, use, disclosure, erasure, etc.).
						</li>
						<li>
							<strong>"Controller"</strong> means the natural or legal person who determines the
							purposes and means of processing (Revly).
						</li>
					</ul>
				</section>

				<section>
					<h2>4. What information we collect</h2>
					<h3>4.1 Personal data you provide</h3>
					<ul>
						<li>
							Account and login data: name, email address, password (hashed), phone number (if
							provided).
						</li>
						<li>
							Business information: business name, address, contact phone, opening hours, business
							photos, menus when provided.
						</li>
						<li>
							Content you submit: reviews, ratings, replies, messages, profile pictures or other
							media you upload.
						</li>
						<li>
							Support and communications: correspondence with us, support tickets and related
							details.
						</li>
					</ul>

					<h3>4.2 Data we collect automatically</h3>
					<ul>
						<li>
							Usage data: IP address, browser type/version, pages visited, timestamps, device
							identifiers.
						</li>
						<li>
							Analytics and performance data collected via cookies or similar technologies (see
							Section 7).
						</li>
					</ul>

					<h3>4.3 Third-party sources</h3>
					<p>
						We may receive data from third-party providers (e.g., social login providers, payment
						processors, maps and geolocation services). We record the source of such data in our
						systems.
					</p>
				</section>

				<section>
					<h2>5. Purposes & legal bases for processing</h2>
					<p>
						We process personal data only for specified, explicit and legitimate purposes and only to
						the extent necessary:
					</p>
					<ul>
						<li>
							<strong>Provide and maintain the Service</strong> — create accounts, authenticate
							users, manage listings and display content (legal basis: contract / legitimate
							interest).
						</li>
						<li>
							<strong>Communications</strong> — send transactional emails, respond to support
							requests (legal basis: contract / consent where required).
						</li>
						<li>
							<strong>Reviews & public listings</strong> — publish reviews and business data as
							provided by users (legal basis: consent and legitimate interest; users share reviews
							publicly).
						</li>
						<li>
							<strong>Security & fraud prevention</strong> — detect and prevent abuse, secure our
							platform (legal basis: legitimate interest).
						</li>
						<li>
							<strong>Analytics & product improvement</strong> — measure and improve performance and
							features (legal basis: legitimate interest and/or consent for non-essential cookies).
						</li>
						<li>
							<strong>Legal obligations</strong> — comply with applicable laws and court orders
							(legal basis: legal obligation).
						</li>
					</ul>
					<p>
						Under Algerian law, personal data processing must be proportionate and lawful; we will keep
						records of our processing activities and justify our legal bases in accordance with the
						applicable rules.
					</p>
				</section>

				<section>
					<h2>6. Cookies & similar technologies</h2>
					<p>
						We use cookies and similar technologies to operate the Service, remember your preferences
						and measure performance. Non-essential cookies (analytics, advertising) are enabled only
						with your consent where required. You can manage cookie preferences via the cookie banner
						and your browser settings.
					</p>
				</section>

				<section>
					<h2>7. Data sharing and disclosures</h2>
					<p>We do not sell personal data. We may share personal data with:</p>
					<ul>
						<li>
							Service providers and subprocessors who perform services on our behalf (hosting,
							analytics, email, payments).
						</li>
						<li>
							Authorized partners when you choose to link or share information (e.g., social
							networks).
						</li>
						<li>
							Law enforcement, regulators or courts where required by law or to protect our rights.
						</li>
					</ul>
					<p>
						Where we engage subprocessors or transfer data outside Algeria, we do so under contractual
						safeguards and in compliance with applicable Algerian rules on cross-border transfers (Law
						No. 25-11), including where prior authorization is required.
					</p>
				</section>

				<section>
					<h2>8. Cross-border transfers</h2>
					<p>
						Transfers of personal data outside Algeria are subject to specific legal conditions. We
						will only transfer data to countries or providers that offer adequate protection as
						required by the law, or when appropriate safeguards (e.g., contractual clauses) are in
						place and, if applicable, after securing any authorization required by the Algerian data
						protection authority.
					</p>
				</section>

				<section>
					<h2>9. Data retention</h2>
					<p>
						We retain personal data only for as long as necessary for the purposes described in this
						policy or as required by law. Typical retention periods:
					</p>
					<ul>
						<li>
							Account data: retained for the life of the account and for a reasonable period after
							account deletion to meet legal/audit needs.
						</li>
						<li>
							Reviews and public content: retained until you request removal or we are required to
							delete them for legal reasons.
						</li>
						<li>
							Logs and analytics: retained in aggregated or pseudonymized form for product
							improvement, typically for a limited period (e.g., 12–36 months).
						</li>
					</ul>
				</section>

				<section>
					<h2>10. Your rights</h2>
					<p>
						Under Algerian law (Law No. 18-07) you have rights in relation to your personal data,
						including:
					</p>
					<ul>
						<li>
							<strong>Right to be informed</strong> — you may obtain information about how we process
							your data.
						</li>
						<li><strong>Right of access</strong> — request a copy of your personal data.</li>
						<li>
							<strong>Right to rectification</strong> — request correction of inaccurate or
							incomplete data.
						</li>
						<li>
							<strong>Right to erasure</strong> — request deletion of personal data where permitted
							by law.
						</li>
						<li>
							<strong>Right to object</strong> — object to processing on grounds relating to your
							particular situation.
						</li>
						<li>
							<strong>Right to restriction</strong> — request limitation of processing in certain
							circumstances.
						</li>
						<li>
							<strong>Right to data portability</strong> — where applicable, request transfer of your
							personal data in a structured format.
						</li>
					</ul>
					<p>
						To exercise these rights, contact us at the addresses listed in Section 13. We will respond
						in accordance with applicable timeframes under Algerian law. If you believe your rights
						have not been respected, you may file a complaint with the National Authority for the
						Protection of Personal Data (ANPDP) or the competent Algerian authority.
					</p>
				</section>

				<section>
					<h2>11. Security measures</h2>
					<p>
						We implement appropriate technical and organizational measures to protect personal data
						against accidental or unlawful destruction, loss, alteration, unauthorized disclosure or
						access. Measures include network and application security, encryption in transit (TLS),
						pseudonymization where appropriate, access controls and internal policies.
					</p>
					<p>
						While we aim to protect your data, no electronic transmission or storage can be guaranteed
						to be 100% secure.
					</p>
				</section>

				<section>
					<h2>12. Data protection officer & ANPDP registration</h2>
					<p>
						Where required by law, we appoint a Data Protection Officer (DPO) or a responsible contact
						point for data protection matters. We also comply with Algeria's notification/authorization
						regime and have registered / will register our processing activities with the National
						Authority for the Protection of Personal Data (ANPDP) as required by Law No. 18-07.
					</p>
				</section>

				<section>
					<h2>13. How to contact us</h2>
					<p>If you have questions, wish to exercise your rights, or wish to make a complaint:</p>
					<ul>
						<li>
							Email: <a href="mailto:privacy@userevly.com">privacy{{ '@' }}userevly.com</a>
						</li>
						<li>Contact form: <a href="/contact">https://userevly.com/contact</a></li>
						<li>Postal address: [Insert company postal address]</li>
					</ul>
					<p>
						For complaints to the Algerian regulator (ANPDP) please consult the ANPDP website for
						procedures and forms.
					</p>
				</section>

				<section>
					<h2>14. Changes to this policy</h2>
					<p>
						We may update this Privacy Policy to reflect legal, technical or business changes. When we
						make changes of material importance, we will provide a prominent notice on our site and
						update the "effective date" at the top of this page.
					</p>
				</section>

				<section>
					<h2>15. Additional notes & legal disclaimer</h2>
					<p>
						This Privacy Policy is intended to provide practical compliance with Algerian data
						protection rules, but does not substitute for legal advice. For detailed regulatory
						obligations (declarations, authorisations, cross-border transfer authorisations, record
						filing or specific forms to submit to the ANPDP) please consult a local lawyer or the ANPDP
						guidance.
					</p>
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
				border-bottom: 2px solid #28a745;
				padding-bottom: 0.5rem;
			}

			h3 {
				font-size: 1.2rem;
				margin-top: 1.5rem;
				margin-bottom: 0.5rem;
				color: #666;
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
export class PrivacyPolicyComponent {}
