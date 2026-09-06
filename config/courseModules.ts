export interface CourseModule {
  id: number;
  title: string;
  videoSummary?: string;
  videoUrl?: string;        // Lien YouTube intégré de la Semaine 0
  videoSummaryUrl?: string; // Fichier video de synthèse (dans public/summaries/)
  podcastUrl?: string;      // Fichier audio de synthèse (dans public/podcasts/)
  notebookUrl?: string;     // Lien vers le Notebook Google
}

export const CS50_MODULES: CourseModule[] = [
  {
    id: 0,
    title: "Semaine 0 : Introduction & Scratch",
    videoSummary: "Introduction au cours CS50 : exploration de la pensée computationnelle, du système binaire, des algorithmes, de l'abstraction et des bases de la programmation visuelle avec Scratch.",
    videoUrl: "https://www.youtube.com/embed/UuIEbpQms8o",
    podcastUrl: "/podcasts/semaine0.mp3",
    videoSummaryUrl: "/summaries/video0.mp4",
    notebookUrl: "https://notebook.google.com/notebook/65407ca2-0219-4a61-9fa7-27d7da2ed113",
  },
  {
    id: 1,
    title: "Semaine 1 : C",
    videoSummary: "Résumé de la vidéo principale : Transition vers le langage C, syntaxe de base, types de données, conditions et premières lignes de code compilées.",
    videoUrl: "https://www.youtube.com/embed/SlqjA04_dpk",
    podcastUrl: "/podcasts/semaine1.mp3",
    notebookUrl: "https://notebook.google.com/notebook/3f36e2f0-5a38-43c5-91a0-76b368627019",
  },
  {
    id: 2,
    title: "Semaine 2 : Les Tableaux",
    videoSummary: "Résumé de la vidéo principale : Exploration des tableaux, de la mémoire, de la portée des variables et du débogage de code en C.",
    videoUrl: "https://www.youtube.com/embed/h5Gc1n8ZuU8",
    podcastUrl: "/podcasts/semaine2.mp3",
    notebookUrl: "https://notebook.google.com/notebook/4be4999a-6fce-4c17-93d3-b66d0f9f98eb",
  },
  {
    id: 3,
    title: "Semaine 3 : Les Algorithmes",
    videoSummary: "Résumé de la vidéo principale : Analyse de la complexité algorithmique, recherche linéaire, recherche binaire et algorithmes de tri.",
    videoUrl: "https://www.youtube.com/embed/6Svu_ae5ebk",
    podcastUrl: "/podcasts/semaine3.mp3",
    notebookUrl: "https://notebook.google.com/notebook/087eec10-568f-476e-93a1-7784e53c7a55",
  },
  {
    id: 4,
    title: "Semaine 4 : La Mémoire",
    videoSummary: "Résumé de la vidéo principale : Manipulation des pointeurs, gestion dynamique de la mémoire, adresses hexadécimales et manipulation de fichiers.",
    videoUrl: "https://www.youtube.com/embed/db0H0U13YsA",
    podcastUrl: "/podcasts/semaine4.mp3",
    notebookUrl: "https://notebook.google.com/notebook/89d2916a-c08c-4da0-93bd-ffae8a1ebecd",
  },
  {
    id: 5,
    title: "Semaine 5 : Les Structures de données",
    videoSummary: "Résumé de la vidéo principale : Création de structures de données personnalisées, listes chaînées, piles, files et tables de hachage.",
    videoUrl: "https://www.youtube.com/embed/PmAI76OGE_E",
    podcastUrl: "/podcasts/semaine5.mp3",
    notebookUrl: "https://notebook.google.com/notebook/f8826302-5ef7-4970-b979-7d87a2196e22",
  },
  {
    id: 6,
    title: "Semaine 6 : Python",
    videoSummary: "Résumé de la vidéo principale : Transition vers Python, syntaxe simplifiée, structures de données natives et programmation orientée objet.",
    videoUrl: "https://www.youtube.com/embed/Rl0ludWTLxs",
    podcastUrl: "/podcasts/semaine6.mp3",
    notebookUrl: "https://notebook.google.com/notebook/0af54950-3af4-45ac-bf76-b8f44613c079",
  },
  {
    id: 7,
    title: "Semaine 7 : SQL",
    videoSummary: "Résumé de la vidéo principale : Gestion de bases de données relationnelles, requêtes SQL, tables, clés primaires/étrangères et manipulation sécurisée.",
    videoUrl: "https://www.youtube.com/embed/oqRU2So6Z2Y",
    podcastUrl: "/podcasts/semaine7.mp3",
    notebookUrl: "https://notebook.google.com/notebook/69cb4cda-a672-43f3-ba88-901968509476",
  },
  {
    id: 8,
    title: "Semaine 8 : HTML, CSS, JavaScript",
    videoSummary: "Résumé de la vidéo principale : Conception de pages web interactives, manipulation du DOM et introduction au développement front-end.",
    videoUrl: "https://www.youtube.com/embed/yYst7puZXjw",
    podcastUrl: "/podcasts/semaine8.mp3",
    notebookUrl: "https://notebook.google.com/notebook/68cdde5b-64e2-4d9e-a261-ccb816ef6041",
  },
  {
    id: 9,
    title: "Semaine 9 : Flask",
    videoSummary: "Résumé de la vidéo principale : Développement web back-end avec le framework Python Flask, routes, sessions et liaisons avec une base de données.",
    videoUrl: "https://www.youtube.com/embed/am7POvSZ4GE",
    podcastUrl: "/podcasts/semaine9.mp3",
    notebookUrl: "https://notebook.google.com/notebook/fab775cc-c5d4-4df4-bf2e-8608d8216585",
  },
  {
    id: 10,
    title: "Semaine 10 : Emoji & Cybersécurité",
    videoSummary: "Résumé de la vidéo principale : Sensibilisation à la sécurité informatique, cryptographie de base, bonnes pratiques et conclusion du parcours.",
    videoUrl: "https://www.youtube.com/embed/ApQTgFkf8TU",
    podcastUrl: "/podcasts/semaine10.mp3",
    notebookUrl: "https://notebook.google.com/notebook/c694a329-339d-4aa0-b1e4-5ad5788fccd4",
  },
];