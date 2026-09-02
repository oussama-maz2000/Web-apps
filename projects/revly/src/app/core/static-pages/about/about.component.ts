import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	selector: 'app-about',
	standalone: true,
	imports: [CommonModule],
	template: ` <div class="static-page">
		<div class="container">
			<h1>À propos de Revly</h1>

			<section>
				<h2>Notre mission</h2>
				<p>
					Revly est né d'une idée simple :
					<strong>redonner de la confiance dans les avis en ligne</strong>
					et aider les commerces à mieux comprendre et servir leurs clients.
				</p>
				<p>
					Nous croyons que des retours clients honnêtes et transparents sont essentiels, à la fois pour
					l'amélioration des services et pour permettre aux consommateurs de faire des choix éclairés.
				</p>
			</section>

			<section>
				<h2>Qui sommes-nous ?</h2>
				<p>
					Revly est une plateforme indépendante conçue pour rapprocher
					<strong>les clients et les commerçants locaux</strong> autour d'avis fiables, utiles et
					constructifs.
				</p>
				<p>
					Notre objectif est de fournir aux commerçants des outils simples et efficaces pour suivre leur
					réputation, répondre aux avis et tirer des enseignements concrets de l'expérience client, sans
					complexité inutile.
				</p>
			</section>

			<section>
				<h2>Nos valeurs</h2>
				<ul>
					<li>
						<strong>Transparence :</strong> des avis authentiques, compréhensibles et accessibles à
						tous.
					</li>
					<li>
						<strong>Équité :</strong> les utilisateurs s'expriment, les propriétaire de commerce
						répondent et s'améliorent.
					</li>
					<li><strong>Simplicité :</strong> l'essentiel, bien présenté, sans jargon inutile.</li>
					<li><strong>Respect des données :</strong> sécurité et confidentialité avant tout.</li>
				</ul>
			</section>

			<section>
				<h2>Ce que Revly apporte aux commerçants</h2>
				<p>Revly aide les propriétaires de commerce à :</p>
				<ul>
					<li>Suivre et gérer les avis et notes laissés par leurs clients</li>
					<li>Répondre rapidement et efficacement aux retours clients</li>
					<li>Identifier les points forts et les axes d'amélioration</li>
					<li>Construire et maintenir une réputation en ligne crédible</li>
					<li>Renforcer la confiance et la fidélité des clients</li>
				</ul>
			</section>

			<section>
				<h2>Ce que Revly apporte aux utilisateurs</h2>
				<p>Revly permet aux utilisateurs de :</p>
				<ul>
					<li>Découvrir des commerces locaux grâce à des avis utiles et vérifiés</li>
					<li>Partager leur expérience de manière simple et constructive</li>
					<li>Aider d'autres consommateurs à faire de meilleurs choix</li>
					<li>Contribuer à une information plus fiable et plus transparente</li>
				</ul>
			</section>

			<section>
				<h2>Technologie & fiabilité</h2>
				<p>
					Revly repose sur des technologies web modernes afin d'offrir une expérience rapide, fluide et
					sécurisée sur tous les appareils.
				</p>
				<p>
					La plateforme est conçue pour être performante, évolutive et respectueuse de la vie privée,
					avec une attention particulière portée à la fiabilité des données et à l'expérience
					utilisateur.
				</p>
			</section>

			<section>
				<h2>Nous contacter</h2>
				<p>
					Une question, une suggestion ou l'envie d'en savoir plus ? Nous serons ravis d'échanger avec
					vous.
				</p>
				<p>
					<a href="/contact" class="link">Contactez-nous</a>
				</p>
			</section>
		</div>
	</div>`,
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

			.link {
				color: #007bff;
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}
		`
	]
})
export class AboutComponent {}
