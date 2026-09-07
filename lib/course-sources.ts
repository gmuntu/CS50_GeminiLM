import fs from 'fs';
import path from 'path';
import { CS50_MODULES } from '@/config/courseModules';

export interface DayPedagogyGuide {
  theme: string;
  focus: string;
  analogiesAndConcepts: string[];
  pitfallsOrKeyInsights: string[];
  socraticQuestion: string;
}

export interface CourseDefinition {
  id: number;
  slug: string;
  title: string;
  videoUrl?: string;
  videoGuidance: {
    hook: string;
    demonstration: string;
    coreTakeaway: string;
  };
  audioGuidance: {
    MONDAY: DayPedagogyGuide;
    WEDNESDAY: DayPedagogyGuide;
    FRIDAY: DayPedagogyGuide;
  };
  canonicalSummary: string;
}

export const CS50_CANONICAL_CURRICULUM: Record<number, CourseDefinition> = {
  0: {
    id: 0,
    slug: 'semaine-0-introduction-scratch',
    title: 'Semaine 0 : Introduction & Scratch',
    videoUrl: 'https://www.youtube.com/embed/UuIEbpQms8o',
    videoGuidance: {
      hook: "Allumer et éteindre une ampoule : comment des milliards de simples interrupteurs créent l'intelligence artificielle, les jeux vidéo et le web.",
      demonstration: "Le comptage binaire sur les doigts (1, 2, 4, 8, 16...) et l'annuaire téléphonique déchiré en deux pour trouver Mike Smith.",
      coreTakeaway: "Un ordinateur ne 'pense' pas : il applique des instructions non ambiguës à une vitesse vertigineuse."
    },
    audioGuidance: {
      MONDAY: {
        theme: "L'Intuition du Binaire & Encodage de l'Information",
        focus: "La physique du transistor, la base 2, comment transformer des 0 et des 1 en nombres, lettres (ASCII/Unicode) et couleurs (RGB 24 bits).",
        analogiesAndConcepts: ["Interrupteur ouvert/fermé", "Alphabet binaire", "Octet de 8 bits", "RGB 3 octets par pixel"],
        pitfallsOrKeyInsights: ["Confondre bit et octet (byte)", "Penser que l'ordinateur comprend nativement les lettres"],
        socraticQuestion: "Si chaque bit double le nombre d'états possibles, combien de nuances distinctes peux-tu exprimer avec seulement 8 interrupteurs ?"
      },
      WEDNESDAY: {
        theme: "Les Briques de la Pensée Algorithmique avec Scratch",
        focus: "Variables d'état, boucles finies et infinies, embranchements conditionnels (if/else), et coordination d'actions multiples par diffusion d'événements (broadcast).",
        analogiesAndConcepts: ["Recette de cuisine algorithmique", "Messages radio entre lutins", "Boucle d'écoute d'événements"],
        pitfallsOrKeyInsights: ["Boucles infinies bloquant le fil d'exécution", "Oublier de réinitialiser les variables au démarrage"],
        socraticQuestion: "Quelle différence fondamentale y a-t-il entre répéter une action 10 fois et répéter une action jusqu'à ce qu'une condition soit vérifiée ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Recherche Linéaire vs Dichotomique",
        focus: "Notion d'efficacité algorithmique, diviser pour régner, comparaison entre feuilleter un annuaire page par page (n) ou le déchirer en deux (log2 n).",
        analogiesAndConcepts: ["Déchirer l'annuaire téléphonique", "Élimination de la moitié de l'espace de recherche à chaque coup", "Échelle logarithmique"],
        pitfallsOrKeyInsights: ["La dichotomie impose que la liste soit impérativement triée à l'avance"],
        socraticQuestion: "Pour chercher parmi 4 milliards d'individus, pourquoi 32 questions binaires suffisent-elles amplement ?"
      }
    },
    canonicalSummary: "La Semaine 0 pose les fondations de l'informatique : système binaire, encodage ASCII/Unicode, modèle RGB, pensée computationnelle et programmation visuelle événementielle avec Scratch."
  },
  1: {
    id: 1,
    slug: 'semaine-1-c',
    title: 'Semaine 1 : C',
    videoUrl: 'https://www.youtube.com/embed/SlqjA04_dpk',
    videoGuidance: {
      hook: "Pourquoi Harvard débute par le langage C de 1972 plutôt que Python ? Parce que le C ne vous cache rien : il vous confronte directement à la mémoire vive et au processeur.",
      demonstration: "La chaîne de compilation (make/clang), le bogue de l'an 2038 et la construction de la pyramide de Mario avec deux boucles imbriquées.",
      coreTakeaway: "En langage C, chaque octet a un coût, un type et une responsabilité."
    },
    audioGuidance: {
      MONDAY: {
        theme: "De la Pensée au Langage Machine : La Chaîne de Compilation",
        focus: "Que fait le compilateur sous le capot ? Les 4 étapes incontournables : préprocesseur, compilateur, assembleur et éditeur de liens (linker).",
        analogiesAndConcepts: ["Traducteur universel en 4 phases", "Code source .c vers binaire exécutable", "Fichiers d'en-tête (#include)"],
        pitfallsOrKeyInsights: ["Confondre avertissement (warning) et erreur fatale", "Oublier d'inclure les bibliothèques comme stdio.h ou cs50.h"],
        socraticQuestion: "Pourquoi le processeur est-il incapable d'exécuter directement ton fichier main.c sans ces 4 étapes intermédiaires ?"
      },
      WEDNESDAY: {
        theme: "Typage Statique, Boucles et Précision Numérique",
        focus: "Types int, long, float, double, char. Troncature de la division entière (1/2 = 0), validation d'entrées avec do-while, construction des pyramides Mario.",
        analogiesAndConcepts: ["Boîtes étiquetées de tailles fixes", "Boucle extérieure = lignes, boucle intérieure = colonnes"],
        pitfallsOrKeyInsights: ["Division entière silencieuse : float x = 1 / 2 vaut 0.0", "Débordement d'entier (Integer Overflow)"],
        socraticQuestion: "Pourquoi le résultat de 1 divisé par 2 donne-t-il 0.0 à un compilateur C si tu n'écris pas explicitement 1.0 ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Les Limites Physiques de la Machine & Algorithme Glouton",
        focus: "Bogue de l'an 2038 (dépassement 32 bits signé), imprécision des nombres à virgule flottante (0.1 + 0.2 != 0.3), algorithme glouton (Greedy Cash) et algorithme de Luhn.",
        analogiesAndConcepts: ["Compteur kilométrique qui repasse à zéro", "Monnayeur automatique rendant les plus grosses pièces d'abord"],
        pitfallsOrKeyInsights: ["Un algorithme glouton ne donne pas toujours la solution optimale dans tous les systèmes de monnaie"],
        socraticQuestion: "Si la mémoire d'un entier 32 bits a un plafond fixe, que se passe-t-il à la seconde précise où l'on tente d'ajouter 1 au maximum absolu ?"
      }
    },
    canonicalSummary: "La Semaine 1 explore le langage C, la syntaxe impérative, les types de données, la compilation en 4 phases, les boucles imbriquées, la validation et les limites matérielles du processeur."
  },
  2: {
    id: 2,
    slug: 'semaine-2-les-tableaux',
    title: 'Semaine 2 : Les Tableaux',
    videoUrl: 'https://www.youtube.com/embed/h5Gc1n8ZuU8',
    videoGuidance: {
      hook: "Comment l'ordinateur stocke-t-il votre prénom ? En C, un mot n'existe pas : c'est une suite de cases mémoire contiguës gardée par une sentinelle invisible : le caractère nul \\0.",
      demonstration: "Inspection de la RAM avec debug50, chaîne 'HI!' sur 4 octets et chiffrement de César par arithmétique modulaire.",
      coreTakeaway: "En C, dépasser les bornes d'un tableau ne déclenche aucun message d'alerte : vous lisez directement la mémoire du voisin."
    },
    audioGuidance: {
      MONDAY: {
        theme: "La Mémoire Vive comme un Casier Géant : Tableaux et Contiguïté",
        focus: "Tableaux en C, taille fixe déclarée, contiguïté en mémoire vive, formule d'adressage en O(1) : Base + (Index * Taille).",
        analogiesAndConcepts: ["Casiers postaux numérotés", "Saut direct par calcul d'offset", "Tableaux d'entiers et de caractères"],
        pitfallsOrKeyInsights: ["Indexation commençant à 0 (l'élément n est à l'indice n-1)", "Absence de vérification des limites (Out of bounds)"],
        socraticQuestion: "Pourquoi le fait que les cases mémoires soient collées les unes aux autres permet-il un accès instantané à n'importe quel élément ?"
      },
      WEDNESDAY: {
        theme: "Anatomie d'une Chaîne : Le Caractère Sentinelle et la Ligne de Commande",
        focus: "Les chaînes comme tableaux de caractères (char[]), le terminateur nul '\\0' (code ASCII 0), argc et argv pour paramétrer les programmes en CLI.",
        analogiesAndConcepts: ["Point final obligatoire d'une phrase", "Valise de paramètres passée au programme au décollage"],
        pitfallsOrKeyInsights: ["Oublier le +1 pour le '\\0' lors du dimensionnement", "Confondre argv[1] (chaîne) avec un entier sans conversion"],
        socraticQuestion: "Comment la fonction printf sait-elle où s'arrêter d'afficher des lettres si un tableau ne retient pas sa propre longueur ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Le Piège de Performance O(n²) et l'Art du Débogage",
        focus: "L'erreur classique for(int i=0; i<strlen(s); i++) qui recalcule la longueur à chaque tour, débogage avec debug50, méthode du canard en plastique.",
        analogiesAndConcepts: ["Mesurer la piste de course à chaque foulée", "Rubber Duck Debugging", "Arithmétique modulaire du chiffrement de César"],
        pitfallsOrKeyInsights: ["Ne pas mettre en cache la taille de la chaîne transforme une boucle linéaire en O(n²)"],
        socraticQuestion: "Si tu mesures la longueur de ton texte à chaque pas de ta boucle, quel est le coût réel si le texte fait un million de lettres ?"
      }
    },
    canonicalSummary: "La Semaine 2 aborde les tableaux, la contiguïté mémoire, la représentation des chaînes avec le terminateur nul, les arguments en ligne de commande (argc, argv), et le débogage rigoureux."
  },
  3: {
    id: 3,
    slug: 'semaine-3-les-algorithmes',
    title: 'Semaine 3 : Les Algorithmes',
    videoUrl: 'https://www.youtube.com/embed/6Svu_ae5ebk',
    videoGuidance: {
      hook: "Trier 1 million de cartes avec un algorithme inefficace prend des semaines ; avec un algorithme optimisé, cela prend 2 secondes. La machine ne sauvera jamais un mauvais algorithme.",
      demonstration: "Comparaison visuelle entre le Tri par sélection, le Tri à bulles et le Tri fusion récursif.",
      coreTakeaway: "L'analyse asymptotique permet de prédire le comportement d'un code face à des volumes de données infinis."
    },
    audioGuidance: {
      MONDAY: {
        theme: "Le Langage Universel de la Performance : Big-O, Big-Omega et Recherche",
        focus: "Notations O (pire cas), Omega (meilleur cas), Theta (cas moyen). Recherche linéaire O(n) vs Recherche binaire O(log n).",
        analogiesAndConcepts: ["Le pire scénario possible", "Le coup de chance absolu", "La courbe qui s'aplatit"],
        pitfallsOrKeyInsights: ["La recherche dichotomique nécessite un prérequis strict : que la liste soit déjà triée"],
        socraticQuestion: "Quand un ingénieur dit qu'un algorithme est en O(log n), que se passe-t-il pour le temps d'exécution quand la taille des données double ?"
      },
      WEDNESDAY: {
        theme: "Dissection des Tris Simples et Création de Types Personnalisés",
        focus: "Tri par sélection O(n²), Tri à bulles (Bubble Sort) et son optimisation par drapeau booléen, structures de données en C avec typedef struct.",
        analogiesAndConcepts: ["Chercher la plus petite carte et la placer au début", "Faire remonter les bulles les plus lourdes à la surface", "Création d'une fiche d'identité (struct person)"],
        pitfallsOrKeyInsights: ["Ne pas optimiser le Bubble sort laisse le meilleur cas en O(n²) au lieu de Omega(n)"],
        socraticQuestion: "Comment une simple variable booléenne 'swapped' peut-elle faire passer un tri à bulles de millions d'opérations à quelques unes ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : La Puissance du Diviser pour Régner et de la Récursion",
        focus: "Récursion, cas de base (base case) et cas récursif, débordement de pile (Stack Overflow), Tri Fusion (Merge Sort) en O(n log n) et compromis mémoire.",
        analogiesAndConcepts: ["Les poupées russes de fonctions", "Découper un gâteau jusqu'à la miette puis fusionner", "Payer en mémoire pour gagner en vitesse"],
        pitfallsOrKeyInsights: ["Oublier le cas de base entraîne un crash immédiat par dépassement de pile"],
        socraticQuestion: "Pourquoi le Tri Fusion est-il bien plus rapide sur de grands tableaux que le Tri par sélection, tout en exigeant deux fois plus de RAM ?"
      }
    },
    canonicalSummary: "La Semaine 3 explore la complexité algorithmique (Big-O, Omega, Theta), la recherche linéaire et binaire, les tris (Sélection, Bulles, Fusion), la récursion et les structures de données personnalisées."
  },
  4: {
    id: 4,
    slug: 'semaine-4-la-memoire',
    title: 'Semaine 4 : La Mémoire',
    videoUrl: 'https://www.youtube.com/embed/db0H0U13YsA',
    videoGuidance: {
      hook: "Le concept le plus craint et le plus fondamental de l'informatique : les Pointeurs. En réalité, un pointeur n'est rien d'autre qu'un numéro de boîte aux lettres dans la mémoire vive.",
      demonstration: "Le dévoilement : string est en réalité char *, allocation avec malloc, segfault en direct et reconstruction médico-légale de fichiers JPEG effacés.",
      coreTakeaway: "Tout octet alloué manuellement avec malloc doit être libéré avec free : vous êtes le seul maître à bord de votre mémoire."
    },
    audioGuidance: {
      MONDAY: {
        theme: "Démystifier les Adresses : L'Hexadécimal et les Opérateurs & et *",
        focus: "Représentation hexadécimale (base 16), structure de la RAM, opérateur d'adresse (&) et de déréférencement (*), révélation de string = char *.",
        analogiesAndConcepts: ["Numéro de boîte aux lettres vs le courrier dans la boîte", "La clé qui ouvre la porte", "Notation 0x"],
        pitfallsOrKeyInsights: ["Confondre la valeur stockée et l'adresse où elle réside", "Déréférencer un pointeur non initialisé ou NULL"],
        socraticQuestion: "Si j'écris 'int *p = &x;', que contient réellement p : la valeur du nombre ou l'endroit exact où il habite en mémoire ?"
      },
      WEDNESDAY: {
        theme: "L'Allocation Dynamique : Le Heap, malloc, free et la Manipulation de Fichiers",
        focus: "Le tas (Heap) vs la pile (Stack), allocation manuelle avec malloc(), libération impérative avec free(), copie profonde avec strcpy, manipulation de fichiers (fopen, fread, fwrite).",
        analogiesAndConcepts: ["Louer un casier à la gare et rendre la clé", "Copie de surface (copier l'adresse) vs copie profonde (dupliquer les données)"],
        pitfallsOrKeyInsights: ["Fuites de mémoire (Memory Leaks)", "Pointeurs pendants (dangling pointers)"],
        socraticQuestion: "Si tu copies un pointeur avec 'char *t = s;', as-tu dupliqué ton texte ou simplement donné un double des clés du même appartement ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : L'Audit Valgrind et la Police Scientifique Numérique",
        focus: "Détection des bogues mémoire avec Valgrind (fuites, lectures invalides), dépassement de tampon (Buffer Overflow), récupération de JPEG effacés (signatures binaires 0xff 0xd8 0xff).",
        analogiesAndConcepts: ["L'inspecteur de santé qui traque les fuites", "L'archéologue numérique lisant les blocs de carte SD"],
        pitfallsOrKeyInsights: ["Un buffer overflow peut être exploité pour écraser des adresses de retour et injecter du code malveillant"],
        socraticQuestion: "Quand tu 'supprimes' une photo sur ton ordinateur, pourquoi est-il souvent possible de la restaurer octet par octet avec un simple script en C ?"
      }
    },
    canonicalSummary: "La Semaine 4 plonge au cœur de la mémoire vive : hexadécimal, pointeurs, malloc/free, architecture Heap vs Stack, fuites mémoire avec Valgrind et manipulation de fichiers binaires."
  },
  5: {
    id: 5,
    slug: 'semaine-5-les-structures-de-donnees',
    title: 'Semaine 5 : Les Structures de données',
    videoUrl: 'https://www.youtube.com/embed/PmAI76OGE_E',
    videoGuidance: {
      hook: "Que faire quand votre tableau est plein et qu'une nouvelle donnée arrive ? Soit vous déménagez tout le monde ailleurs, soit vous reliez vos données avec des cordes : voici la naissance des listes chaînées.",
      demonstration: "De la liste chaînée lente à l'arbre binaire de recherche, puis à la table de hachage ultra-rapide et au Trie préfixe dans le projet Speller.",
      coreTakeaway: "En ingénierie logicielle, il n'existe pas de structure magique : il n'y a que des compromis entre temps de calcul et mémoire vive."
    },
    audioGuidance: {
      MONDAY: {
        theme: "Dépasser la Contiguïté : Anatomie des Listes Chaînées",
        focus: "Limites des tableaux rigides, coût de realloc, nœuds autoréférentiels (struct node avec pointeur next), insertion en tête en O(1).",
        analogiesAndConcepts: ["Chasse au trésor où chaque indice mène au suivant", "Wagons d'un train reliés par des attaches"],
        pitfallsOrKeyInsights: ["Impossible de faire une recherche binaire sur une liste chaînée (accès non indexé)", "Perdre le pointeur de tête fait disparaître toute la liste"],
        socraticQuestion: "Pourquoi ne peut-on pas sauter directement au milieu d'une liste chaînée comme on le fait si facilement dans un tableau ?"
      },
      WEDNESDAY: {
        theme: "Arbres Binaires de Recherche et Tables de Hachage",
        focus: "Arbres binaires (BST) pour retrouver O(log n), tables de hachage (Hash Tables), fonctions de hachage et résolution des collisions par chaînage séparé.",
        analogiesAndConcepts: ["Arbre généalogique ordonné (plus petit à gauche, plus grand à droite)", "Trier son linge dans des tiroirs étiquetés"],
        pitfallsOrKeyInsights: ["Un arbre binaire non équilibré dégénère en une simple liste chaînée lente en O(n)", "Une mauvaise fonction de hachage crée des collisions massives"],
        socraticQuestion: "Que devient la vitesse d'un arbre binaire de recherche si tu as le malheur d'y insérer des données déjà parfaitement triées ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Le Défi Speller et les Tries Préfixes",
        focus: "La structure du Trie (arbre préfixe) : recherche en O(k) où k est la longueur du mot, indépendamment du nombre de mots. Comparaison empirique dans Speller.",
        analogiesAndConcepts: ["L'arborescence des lettres d'un dictionnaire", "Payer une montagne de mémoire pour obtenir une vitesse de recherche instantanée"],
        pitfallsOrKeyInsights: ["La consommation mémoire gigantesque des Tries face aux tables de hachage compactes"],
        socraticQuestion: "Si ton Trie met exactement le même temps pour trouver un mot parmi 10 mots ou parmi 10 millions de mots, quel lourd tribut payes-tu en échange ?"
      }
    },
    canonicalSummary: "La Semaine 5 explore les structures de données dynamiques : listes chaînées, arbres binaires de recherche, tables de hachage, arbres préfixes (Tries) et compromis espace-temps."
  },
  6: {
    id: 6,
    slug: 'semaine-6-python',
    title: 'Semaine 6 : Python',
    videoUrl: 'https://www.youtube.com/embed/Rl0ludWTLxs',
    videoGuidance: {
      hook: "Souvenez-vous des 150 lignes de code C avec pointeurs, malloc et tables de hachage pour vérifier un mot... En Python, cela s'écrit en 2 lignes : words = set(), word in words.",
      demonstration: "Le même programme écrit en C puis en Python. Disparition des points-virgules, typage dynamique et ramasse-miettes automatique.",
      coreTakeaway: "Vous n'avez pas souffert en C pour rien : parce que vous comprenez la mémoire, vous savez exactement ce que Python automatise sous le capot."
    },
    audioGuidance: {
      MONDAY: {
        theme: "L'Ascension vers l'Abstraction : Interpréteur, Typage Dynamique et Indentation",
        focus: "Langage interprété vs compilé, typage dynamique, gestion automatique de la mémoire (Garbage Collector), précision arithmétique arbitraire (pas d'overflow).",
        analogiesAndConcepts: ["Le traducteur simultané qui lit ligne par ligne", "La syntaxe épurée guidée par l'indentation", "Le Zen de Python"],
        pitfallsOrKeyInsights: ["Erreurs de type découvertes à l'exécution plutôt qu'à la compilation", "Sensibilité aux espaces et tabulations"],
        socraticQuestion: "Si Python ne te force pas à déclarer la taille de tes variables, comment la machine sait-elle où ranger tes données ?"
      },
      WEDNESDAY: {
        theme: "Les 4 Géants de Python : Listes, Tuples, Dictionnaires et Ensembles",
        focus: "Structures de données natives, mutabilité vs immutabilité, slicing de chaînes, recherche en O(1) dans les dicts et sets, gestionnaire de contexte 'with open()'.",
        analogiesAndConcepts: ["La liste élastique modifiable", "Le tuple scellé au coffre-fort", "Le dictionnaire à clés instantanées"],
        pitfallsOrKeyInsights: ["Copie superficielle vs copie profonde en Python (b = a copie la référence, pas la liste)"],
        socraticQuestion: "Pourquoi vérifier la présence d'un mot dans un ensemble (set) est-il des milliers de fois plus rapide que dans une liste ordinaire ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Vitesse Humaine vs Vitesse Machine & Profilage ADN",
        focus: "Compromis de performance : Python est 10 à 50 fois plus lent que le C pour les calculs bruts mais 5 fois plus rapide à développer pour l'humain. Étude du projet DNA (STRs).",
        analogiesAndConcepts: ["La Formule 1 complexe (C) vs la berline automatique tout confort (Python)", "L'analyse médico-légale des séquences génétiques"],
        pitfallsOrKeyInsights: ["Utiliser de mauvaises structures dans de grandes boucles Python peut geler un serveur"],
        socraticQuestion: "Si le langage C est tellement plus rapide à l'exécution, pourquoi l'industrie moderne écrit-elle l'immense majorité de ses outils en Python ?"
      }
    },
    canonicalSummary: "La Semaine 6 marque le passage à Python : typage dynamique, interpréteur, ramasse-miettes, listes/tuples/dictionnaires/ensembles, manipulation de fichiers et projet d'analyse ADN."
  },
  7: {
    id: 7,
    slug: 'semaine-7-sql',
    title: 'Semaine 7 : SQL',
    videoUrl: 'https://www.youtube.com/embed/oqRU2So6Z2Y',
    videoGuidance: {
      hook: "Pourquoi Netflix ou Spotify ne stockent pas leurs millions de films dans un gigantesque fichier Excel ? Parce qu'à la moindre modification simultanée, le fichier serait corrompu ou mettrait 10 minutes à répondre.",
      demonstration: "Requête SQL multi-tables avec JOIN sur 10 millions d'enregistrements résolue en 0,002 seconde grâce à un index B-Tree.",
      coreTakeaway: "En C ou Python, vous dites à la machine 'comment' faire. En SQL, vous déclarez simplement 'ce que' vous voulez obtenir."
    },
    audioGuidance: {
      MONDAY: {
        theme: "La Révolution Relationnelle : Du Fichier Plat CSV aux Tables Normalisées",
        focus: "Limites des fichiers plats (redondance, corruption, absence de concurrence, recherche en O(n)), bases de données relationnelles (SGBDR / SQLite), schéma de données.",
        analogiesAndConcepts: ["Le fichier Excel qui plante dès que deux personnes écrivent dedans", "Chaque entité dans son tiroir dédié relié par des clés"],
        pitfallsOrKeyInsights: ["La redondance des données engendre des anomalies catastrophiques lors des mises à jour"],
        socraticQuestion: "Si tu stockes le nom de l'auteur directement dans chaque ligne d'emprunt de livre, que se passe-t-il le jour où cet auteur change de nom ?"
      },
      WEDNESDAY: {
        theme: "Le Pouvoir du Langage Déclaratif : CRUD, Jointures et Agrégations",
        focus: "Syntaxe SQL déclarative, opérations CRUD (INSERT, SELECT, UPDATE, DELETE), clés primaires et clés étrangères, jointures (JOIN ... ON), GROUP BY et HAVING.",
        analogiesAndConcepts: ["Commander un plat au restaurant sans devoir expliquer la recette au chef", "Le pont qui relie deux tables par leur identifiant unique"],
        pitfallsOrKeyInsights: ["Confondre WHERE (filtrage avant agrégation) et HAVING (filtrage après regroupement)"],
        socraticQuestion: "Quelle différence fondamentale y a-t-il entre filtrer des lignes individuelles avec WHERE et filtrer des groupes de données avec HAVING ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Index B-Tree, Injections SQL et Transactions Atomiques",
        focus: "Accélération des recherches avec les index B-Tree (passage de O(n) à O(log n)), compromis d'écriture, attaques par injection SQL (' OR '1'='1), requêtes paramétrées et transactions ACID.",
        analogiesAndConcepts: ["L'index alphabétique à la fin d'un livre", "L'injection malveillante qui fait exécuter du code à la base de données", "Le virement bancaire tout-ou-rien"],
        pitfallsOrKeyInsights: ["Ne JAMAIS concaténer de chaînes utilisateur dans une requête SQL", "Trop d'index ralentit lourdement les insertions"],
        socraticQuestion: "Comment une simple apostrophe injectée dans un formulaire de connexion peut-elle ouvrir l'accès administrateur d'une banque sans mot de passe ?"
      }
    },
    canonicalSummary: "La Semaine 7 aborde la modélisation relationnelle, le langage SQL, les jointures multi-tables, les index B-Tree, l'intégration Python et la sécurité critique face aux injections SQL."
  },
  8: {
    id: 8,
    slug: 'semaine-8-html-css-javascript',
    title: 'Semaine 8 : HTML, CSS, JavaScript',
    videoUrl: 'https://www.youtube.com/embed/yYst7puZXjw',
    videoGuidance: {
      hook: "Que se passe-t-il exactement pendant le quart de seconde entre le moment où vous tapez une URL et où la page s'affiche ? DNS, poignée de main TCP, requête HTTP, et réception d'un flux de texte brut.",
      demonstration: "Décomposition d'une page web : suppression du CSS pour voir la page nue, puis injection de JavaScript pour interagir sans recharger.",
      coreTakeaway: "Le navigateur web est un compilateur visuel qui transforme trois langages textuels en une interface vivante."
    },
    audioGuidance: {
      MONDAY: {
        theme: "L'Autoroute Invisible du Web : DNS, Protocoles HTTP/HTTPS et Codes de Statut",
        focus: "Architecture Client/Serveur, résolution DNS (nom de domaine vers adresse IP), requêtes HTTP, verbes GET vs POST, en-têtes et codes d'état (200, 301, 404, 500).",
        analogiesAndConcepts: ["Le coursier postal qui livre des colis numériques", "Les cartes postales (GET visible) vs les enveloppes scellées (POST protégé)"],
        pitfallsOrKeyInsights: ["Confondre l'infrastructure réseau (Internet) avec le service de pages web (World Wide Web)"],
        socraticQuestion: "Pourquoi le navigateur envoie-t-il des informations confidentielles avec la méthode POST plutôt que GET ?"
      },
      WEDNESDAY: {
        theme: "Structure et Esthétique : HTML Sémantique, Box Model et Flexbox",
        focus: "HTML5 sémantique (<main>, <article>, <form>), arbre DOM, modèle de boîte CSS (margin, border, padding, content), Flexbox et design responsive avec Bootstrap.",
        analogiesAndConcepts: ["Le squelette (HTML) et la peau/vêtements (CSS)", "L'emballage d'un colis postal (le Box Model)"],
        pitfallsOrKeyInsights: ["Confondre la marge extérieure (margin) et le rembourrage intérieur (padding)"],
        socraticQuestion: "Pourquoi entourer un paragraphe d'un cadre rouge modifie-t-il l'espace occupé si tu oublies de prendre en compte le padding ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Le DOM Dynamique et la Validation Côté Client",
        focus: "JavaScript côté client, manipulation de l'arbre DOM avec querySelector(), écouteurs d'événements (addEventListener), validation instantanée des formulaires.",
        analogiesAndConcepts: ["Les muscles et les réflexes qui animent le corps", "Le gardien à l'entrée qui vérifie ton formulaire avant de l'envoyer par la poste"],
        pitfallsOrKeyInsights: ["Ne jamais se fier uniquement à la validation JavaScript client : un attaquant peut contourner le navigateur"],
        socraticQuestion: "Si JavaScript peut valider les entrées de l'utilisateur directement dans son navigateur, pourquoi le serveur doit-il impérativement tout re-vérifier ?"
      }
    },
    canonicalSummary: "La Semaine 8 présente les fondamentaux du front-end web : protocoles Internet, HTML sémantique, Box Model et mise en page CSS/Flexbox, et programmation événementielle avec JavaScript."
  },
  9: {
    id: 9,
    slug: 'semaine-9-flask',
    title: 'Semaine 9 : Flask',
    videoUrl: 'https://www.youtube.com/embed/am7POvSZ4GE',
    videoGuidance: {
      hook: "Comment un site web se rappelle-t-il que vous êtes connecté alors que le protocole HTTP oublie qui vous êtes à chaque seconde ?",
      demonstration: "De la soumission d'un formulaire de connexion à la création d'un cookie de session chiffré, suivi de la génération dynamique d'un portefeuille boursier avec Flask et SQLite.",
      coreTakeaway: "Le serveur est le chef d'orchestre : il vérifie la sécurité, interroge la base de données et assemble la page HTML avant de l'envoyer au client."
    },
    audioGuidance: {
      MONDAY: {
        theme: "L'Émergence du Back-End : Pourquoi un Serveur et Découverte de Flask",
        focus: "Limites des pages web statiques, cycle Requête/Réponse dynamique, micro-framework Flask, routage avec décorateurs (@app.route), architecture MVC.",
        analogiesAndConcepts: ["L'imprimerie à la demande", "Le standard téléphonique qui aiguille les appels selon l'URL"],
        pitfallsOrKeyInsights: ["Penser que le code Python de Flask tourne dans le navigateur de l'utilisateur"],
        socraticQuestion: "Pourquoi le code Python de ton serveur Flask ne peut-il jamais être consulté directement par un utilisateur inspectant le code source de sa page web ?"
      },
      WEDNESDAY: {
        theme: "Le Templating Dynamique avec Jinja et la Gestion des Formulaires",
        focus: "Moteur de templates Jinja2, héritage de mise en page (layout.html et {% extends %}), passage de variables, extraction des données formulaires (request.form vs request.args).",
        analogiesAndConcepts: ["Le formulaire à trous complété par le serveur", "La matrice commune partagée par toutes les pages du site"],
        pitfallsOrKeyInsights: ["Oublier le bloc {% block main %} dans les templates enfants", "Ne pas gérer le verbe POST dans les méthodes autorisées de la route"],
        socraticQuestion: "Comment Jinja2 parvient-il à générer un tableau HTML de mille lignes à partir d'une simple boucle Python sur le serveur ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Vaincre l'Amnésie du Web avec Sessions et Hachage Sécurisé",
        focus: "Nature sans état (stateless) de HTTP, cookies et sessions chiffrées côté serveur, authentification robuste, interdiction absolue du stockage en clair, salage et hachage PBKDF2/bcrypt. Projet C$50 Finance.",
        analogiesAndConcepts: ["Le tampon invisible apposé sur ta main en boîte de nuit", "Le hachoir à viande irréversible", "Le sel qui rend chaque empreinte unique"],
        pitfallsOrKeyInsights: ["Stocker des mots de passe en clair ou utiliser des algorithmes obsolètes comme MD5"],
        socraticQuestion: "Si deux utilisateurs choisissent exactement le même mot de passe '123456', comment le sel garantit-il que leurs hachages en base sont totalement différents ?"
      }
    },
    canonicalSummary: "La Semaine 9 traite du développement back-end avec Python Flask, de l'architecture MVC, du templating Jinja2, de la gestion des sessions HTTP et du hachage sécurisé des identifiants."
  },
  10: {
    id: 10,
    slug: 'semaine-10-emoji-cybersecurite',
    title: 'Semaine 10 : Emoji & Cybersécurité',
    videoUrl: 'https://www.youtube.com/embed/ApQTgFkf8TU',
    videoGuidance: {
      hook: "Votre code est propre, vos algorithmes sont rapides... mais êtes-vous prêts pour le jour où quelqu'un essaiera délibérément de détruire votre application ?",
      demonstration: "Attaque Man-in-the-Middle sur Wi-Fi public, explication du cadenas HTTPS, cryptographie à clé publique et soutenance du Projet Final.",
      coreTakeaway: "La sécurité n'est pas un produit qu'on achète à la fin : c'est un état d'esprit et une responsabilité éthique à chaque ligne de code."
    },
    audioGuidance: {
      MONDAY: {
        theme: "Les Fondements de la Sécurité : La Triade CIA et l'Ingénierie Sociale",
        focus: "Confidentialité, Intégrité, Disponibilité (Triade CIA), vecteurs d'attaques psychologiques (hameçonnage / phishing, ingénierie sociale), attaques par force brute et dictionnaire.",
        analogiesAndConcepts: ["Les trois piliers du coffre-fort", "L'escroc qui se fait passer pour le banquier plutôt que de percer le mur"],
        pitfallsOrKeyInsights: ["La plus grande faille de sécurité est presque toujours humaine, pas algorithmique"],
        socraticQuestion: "Pourquoi est-il infiniment plus rentable pour un cybercriminel de tromper un employé que de casser un algorithme de chiffrement ?"
      },
      WEDNESDAY: {
        theme: "La Cryptographie Moderne : Chiffrement Asymétrique et Autorités de Certification",
        focus: "Chiffrement symétrique (clé partagée) vs asymétrique (clé publique / clé privée RSA), protocole HTTPS, rôle des Autorités de Certification (CA) et signatures numériques.",
        analogiesAndConcepts: ["La boîte aux lettres à fente : tout le monde peut y déposer un mot (clé publique), seul le facteur a la clé pour ouvrir (clé privée)", "Le notaire officiel du web"],
        pitfallsOrKeyInsights: ["Confondre chiffrement (réversible avec clé) et hachage (irréversible à sens unique)"],
        socraticQuestion: "Comment deux ordinateurs à l'autre bout du monde peuvent-ils échanger une clé secrète sans qu'un espion placé au milieu ne puisse la déduire ?"
      },
      FRIDAY: {
        theme: "L'Œil de l'Ingénieur : Défense en Profondeur et Cap sur le Projet Final CS50x",
        focus: "Revue des failles de l'ingénieur (Buffer Overflow, SQL Injection, XSS), principe de défense en profondeur, authentification multifacteur (2FA/TOTP), éthique et conception du Projet Final.",
        analogiesAndConcepts: ["Les châteaux forts à plusieurs murailles concentriques", "Le passeport du diplômé : créer sa propre application pour le monde réel"],
        pitfallsOrKeyInsights: ["Penser qu'un pare-feu suffit si le code applicatif contient des failles critiques"],
        socraticQuestion: "Maintenant que tu as traversé la mémoire vive, les algorithmes, les bases de données et le web, quel problème du monde réel vas-tu résoudre avec ton code ?"
      }
    },
    canonicalSummary: "La Semaine 10 conclut le cursus : sécurité des systèmes d'information, Triade CIA, ingénierie sociale, cryptographie symétrique/asymétrique, HTTPS, éthique du développeur et orientation vers le Projet Final."
  }
};

/**
 * Charge les sources complètes pour un module donné.
 * Si un fichier texte existe dans content/course-sources, son contenu est utilisé en complément
 * de la base de connaissances canonique afin de garantir une génération IA d'une richesse maximale.
 */
export async function getCourseSource(moduleId: number): Promise<{
  module: CourseDefinition;
  rawText: string;
  sourceFilesFound: string[];
}> {
  const canonical = CS50_CANONICAL_CURRICULUM[moduleId] || CS50_CANONICAL_CURRICULUM[0];
  const sourceFilesFound: string[] = [];
  let extraContent = '';

  const possibleFiles = [
    path.join(process.cwd(), 'content', 'course-sources', `semaine${moduleId}.txt`),
    path.join(process.cwd(), 'content', 'course-sources', `week${moduleId}_*.md`),
  ];

  // Lecture du fichier texte principal s'il existe
  const mainTxtPath = path.join(process.cwd(), 'content', 'course-sources', `semaine${moduleId}.txt`);
  if (fs.existsSync(mainTxtPath)) {
    try {
      const content = fs.readFileSync(mainTxtPath, 'utf-8').trim();
      if (content.length > 50) {
        extraContent += `\n\n--- NOTES DE COURS LOCALES RELEVÉES (semaine${moduleId}.txt) ---\n${content}`;
        sourceFilesFound.push(`semaine${moduleId}.txt`);
      }
    } catch (e) {
      console.warn(`Impossible de lire ${mainTxtPath}`, e);
    }
  }

  // Assemblage du contexte pédagogique exhaustif
  const rawText = `
TITRE DU MODULE : ${canonical.title}
SEMAINE CS50x : Semaine ${canonical.id}
URL VIDÉO DE RÉFÉRENCE : ${canonical.videoUrl || 'Non spécifiée'}

RÉSUMÉ CANONIQUE DE HARVARD :
${canonical.canonicalSummary}

CADRAGE VIDÉO PÉDAGOGIQUE :
- Accroche (Hook) : ${canonical.videoGuidance.hook}
- Démonstration centrale : ${canonical.videoGuidance.demonstration}
- Ce qu'il faut absolument retenir : ${canonical.videoGuidance.coreTakeaway}

PROGRESSION PÉDAGOGIQUE DES 3 SESSIONS HEBDOMADAIRES :
1. LUNDI (Éveil & Intuition Socratique) :
   - Thème : ${canonical.audioGuidance.MONDAY.theme}
   - Focus : ${canonical.audioGuidance.MONDAY.focus}
   - Analogies clés : ${canonical.audioGuidance.MONDAY.analogiesAndConcepts.join(', ')}
   - Pièges & Idées reçues : ${canonical.audioGuidance.MONDAY.pitfallsOrKeyInsights.join(', ')}
   - Question Socratique d'éveil : "${canonical.audioGuidance.MONDAY.socraticQuestion}"

2. MERCREDI (Atelier de Code & Mécanique Profonde) :
   - Thème : ${canonical.audioGuidance.WEDNESDAY.theme}
   - Focus : ${canonical.audioGuidance.WEDNESDAY.focus}
   - Concepts & Code : ${canonical.audioGuidance.WEDNESDAY.analogiesAndConcepts.join(', ')}
   - Pièges classiques : ${canonical.audioGuidance.WEDNESDAY.pitfallsOrKeyInsights.join(', ')}
   - Question Socratique d'investigation : "${canonical.audioGuidance.WEDNESDAY.socraticQuestion}"

3. VENDREDI (L'Œil de l'Ingénieur & Défi Pratique) :
   - Thème : ${canonical.audioGuidance.FRIDAY.theme}
   - Focus : ${canonical.audioGuidance.FRIDAY.focus}
   - Métriques & Vision : ${canonical.audioGuidance.FRIDAY.analogiesAndConcepts.join(', ')}
   - Pièges d'architecture : ${canonical.audioGuidance.FRIDAY.pitfallsOrKeyInsights.join(', ')}
   - Défi réflexif de fin de semaine : "${canonical.audioGuidance.FRIDAY.socraticQuestion}"
${extraContent}
  `.trim();

  return {
    module: canonical,
    rawText,
    sourceFilesFound
  };
}
