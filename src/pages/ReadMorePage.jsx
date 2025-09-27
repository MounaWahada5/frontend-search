// src/pages/ReadMorePage.jsx

import React from 'react';
import Navbar from '../components/Navbar';
import robotImage from '../assets/fonts/robot.png'; // Gardons cette image pour l'exemple, mais vous pouvez la changer

export default function ReadMorePage() {
  return (
    <div className="min-h-screen flex flex-col
                    bg-gradient-to-br from-[#E6F3F9] to-[#B0D9EE] text-gray-800"> {/* NOUVEAU DÉGRADÉ POUR L'ARRIÈRE-PLAN */}
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-8 pt-20 z-0">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-12 mt-10 mb-10 overflow-hidden">
          {/* Image de fond semi-transparente pour le conteneur du contenu */}
          <img
            src={robotImage} // Remplacez par votre nouvelle image si vous en avez une
            alt="Background illustration"
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm pointer-events-none" // Effet semi-transparent, flou
          />
          {/* Overlay pour assurer la lisibilité du texte sur l'image */}
          <div className="absolute inset-0 bg-white opacity-80"></div> 

          <div className="relative z-10"> {/* Assure que le texte est au-dessus de l'image et de l'overlay */}
            {/* Titre */}
            <h1 className="text-4xl font-extrabold text-center text-[#2F4F4F] mb-8 leading-tight">
              Plongez au Cœur de QueryMind : Votre Moteur de Recherche Intelligent
            </h1>
            {/* Version Anglaise (optionnel, si vous voulez les deux langues)
            <h1 className="text-4xl font-extrabold text-center text-[#2F4F4F] mb-8 leading-tight">
              Dive Deep into QueryMind: Your Smart Search Engine
            </h1>
            */}

            {/* Introduction */}
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Bienvenue dans l'univers de QueryMind, un moteur de recherche pas comme les autres. Conçu pour les professionnels, les chercheurs et toute personne en quête d'informations précises et d'analyses pointues, QueryMind va au-delà de la simple recherche par mots-clés. Nous exploitons des technologies de pointe pour vous offrir des résultats pertinents, contextuels et inédits, transformant votre façon d'interagir avec l'information.
            </p>
            {/* English version of introduction
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Welcome to the world of QueryMind, a search engine like no other. Designed for professionals, researchers, and anyone seeking precise information and sharp analysis, QueryMind goes beyond simple keyword searches. We leverage cutting-edge technologies to provide you with relevant, contextual, and novel results, transforming the way you interact with information.
            </p>
            */}

            {/* Section Comment ça Marche ? */}
            <h2 className="text-3xl font-bold text-[#4682B4] mb-6 border-b-2 border-[#B0D9EE] pb-2"> {/* Couleur de bordure ajustée */}
              Comment ça Marche ? L'Intelligence Derrière QueryMind
            </h2>
            {/* English version of "How it works?"
            <h2 className="text-3xl font-bold text-[#4682B4] mb-6 border-b-2 border-[#B0D9EE] pb-2">
              How It Works: The Intelligence Behind QueryMind
            </h2>
            */}

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-[#2F4F4F] mb-3">1. Puissance des Pré-Modèles Gratuits (Pre-trained Free Models) :</h3>
                <p className="text-gray-700 leading-relaxed">
                  QueryMind intègre et tire parti de plusieurs modèles de langage pré-entraînés et accessibles gratuitement (tels que Llama 2, Llama 3, Mistral, Gemma). Ces modèles sont les fondations de notre intelligence artificielle. Leur utilisation nous permet de traiter et de comprendre des requêtes complexes, de saisir les nuances sémantiques et de générer des réponses cohérentes, sans les coûts associés aux modèles propriétaires. Cela garantit une accessibilité et une évolutivité maximales pour nos utilisateurs.
                </p>
                {/* English version of this section */}
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-[#2F4F4F] mb-3">2. Scraping Ciblé par Domaines Spécifiques :</h3>
                <p className="text-gray-700 leading-relaxed">
                  Contrairement aux moteurs de recherche généralistes, QueryMind ne se contente pas d'indexer le web entier. Nous réalisons un "scraping" (extraction de données) intelligent et ciblé sur des domaines d'intérêt spécifiques, en particulier ceux liés aux affaires, à la stratégie, aux marchés, et aux tactiques industrielles. Cette approche par domaine nous assure une profondeur et une pertinence inégalées dans les informations collectées, vous garantissant des données de haute qualité et des analyses pointues, loin du bruit informationnel.
                </p>
                {/* English version of this section */}
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-[#2F4F4F] mb-3">3. Compréhension Avancée avec le "Zero-Shot Learning" :</h3>
                <p className="text-gray-700 leading-relaxed">
                  Le "Zero-Shot Learning" est au cœur de la capacité de QueryMind à comprendre et à répondre à des requêtes pour lesquelles il n'a pas été explicitement "formé" sur des exemples spécifiques. Grâce à cette technologie, notre IA peut généraliser ses connaissances acquises sur un vaste corpus de données pour interpréter des questions nouvelles ou complexes, même si elles n'ont jamais été vues auparavant. Cela signifie que vous pouvez poser des questions très spécifiques ou nuancées, et QueryMind saura en extraire le sens et trouver les informations les plus pertinentes, offrant une flexibilité et une puissance de recherche sans précédent.
                </p>
                {/* English version of this section */}
              </div>
            </div>

            {/* Pourquoi Choisir QueryMind ? */}
            <h2 className="text-3xl font-bold text-[#4682B4] mt-10 mb-6 border-b-2 border-[#B0D9EE] pb-2"> {/* Couleur de bordure ajustée */}
              Pourquoi Choisir QueryMind ?
            </h2>
            {/* English version of "Why Choose QueryMind?"
            <h2 className="text-3xl font-bold text-[#4682B4] mt-10 mb-6 border-b-2 border-[#B0D9EE] pb-2">
              Why Choose QueryMind?
            </h2>
            */}
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-8">
              <li><span className="font-semibold">Précision Inégalée :</span> Des résultats hautement pertinents grâce à l'IA avancée et au scraping ciblé.</li>
              <li><span className="font-semibold">Rapidité d'Accès :</span> Obtenez des informations complexes en quelques secondes.</li>
              <li><span className="font-semibold">Solutions Innovantes :</span> Une approche de la recherche qui anticipe vos besoins.</li>
            </ul>

            <p className="text-lg text-center text-gray-800 font-semibold mt-10">
              Découvrez la différence QueryMind et transformez votre expérience de recherche.
            </p>
            {/* English version of closing statement
            <p className="text-lg text-center text-gray-800 font-semibold mt-10">
              Discover the QueryMind difference and transform your search experience.
            </p>
            */}

            {/* Optionnel: Bouton pour retourner à la page d'accueil ou au chat */}
            <div className="text-center mt-10">
              <button
                onClick={() => window.history.back()}
                className="px-8 py-3 bg-[#4682B4] text-white rounded-full text-lg font-bold
                           hover:bg-[#34658A] transition-colors shadow-lg"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}