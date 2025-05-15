import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { setupAutoTranslate } from "./auto-translate";

type Language = "fr" | "en" | "mg";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const translationMap = {
  // PageHeader
  Paramètres: {
    en: "Settings",
    mg: "Fanovana",
  },

  // Profil
  "Votre Profil": {
    en: "Your Profile",
    mg: "Ny momba anao",
  },
  "Informations personnelles et paramètres de compte": {
    en: "Personal information and account settings",
    mg: "Ny mombamomba anao sy ny kaontinao",
  },
  "Nom complet": {
    en: "Full name",
    mg: "Anarana feno",
  },
  Email: {
    en: "Email",
    mg: "Mailaka",
  },
  "Mot de passe": {
    en: "Password",
    mg: "Tenimiafina",
  },
  "Changer le mot de passe": {
    en: "Change password",
    mg: "Hanova ny tenimiafina",
  },
  "Ajouté le :": {
    en: "Added on:",
    mg: "Nampidirina tamin'ny:",
  },
  "Dernière connexion :": {
    en: "Last login:",
    mg: "Fidirana farany:",
  },

  // Préférences
  Préférences: {
    en: "Preferences",
    mg: "Safidy",
  },
  "Personnalisez votre expérience utilisateur": {
    en: "Customize your user experience",
    mg: "Ampifanaraho ny fahitanao",
  },
  Apparence: {
    en: "Appearance",
    mg: "Endrika",
  },
  Thème: {
    en: "Theme",
    mg: "Lohahevitra",
  },
  "Choisissez entre thème clair ou sombre": {
    en: "Choose between light or dark theme",
    mg: "Misafidy endrika maivana na maizina",
  },
  Clair: {
    en: "Light",
    mg: "Maivana",
  },
  Sombre: {
    en: "Dark",
    mg: "Maizina",
  },
  Système: {
    en: "System",
    mg: "Rafitra",
  },
  "Langue de l'interface": {
    en: "Interface language",
    mg: "Ny fiteny amin'ny interface",
  },
  "Choisissez votre langue préférée": {
    en: "Choose your preferred language",
    mg: "Misafidy ny fiteny tianao",
  },
  Langue: {
    en: "Language",
    mg: "Fiteny",
  },
  Français: {
    en: "French",
    mg: "Frantsay",
  },
  English: {
    en: "English",
    mg: "Anglisy",
  },
  Malagasy: {
    en: "Malagasy",
    mg: "Malagasy",
  },
  Notifications: {
    en: "Notifications",
    mg: "Fampandrenesana",
  },
  "Notifications sonores": {
    en: "Sound notifications",
    mg: "Fampandrenesana feo",
  },
  "Activer les sons pour les notifications": {
    en: "Enable sounds for notifications",
    mg: "Alefaso ny feo ho an'ny fampandrenesana",
  },
  "Options avancées": {
    en: "Advanced options",
    mg: "Safidy avo lenta",
  },
  "Exporter mes données": {
    en: "Export my data",
    mg: "Hanondrana ny angon-drakiko",
  },
  "Enregistrer les modifications": {
    en: "Save changes",
    mg: "Tehirizo ny fanovana",
  },

  // Dashboard
  "Tableau de bord": {
    en: "Dashboard",
    mg: "Tabilao fampisehoana"
  },
  "Nouvelle demande": {
    en: "New request",
    mg: "Fangatahana vaovao"
  },
  "Demandes en attente de traitement": {
    en: "Pending requests",
    mg: "Fangatahana miandry"
  },
  "En attente de validation": {
    en: "Pending approval",
    mg: "Miandry fanamarinana"
  },
  "Budget consommé": {
    en: "Consumed budget",
    mg: "Volam-panjakana lany"
  },
  "Alertes stock": {
    en: "Stock alerts",
    mg: "Fampandrenesana stock"
  },
  "Produits sous le seuil minimal": {
    en: "Products below minimum threshold",
    mg: "Vokatra ambany fetra farany"
  },
  "vs. prévision": {
    en: "vs forecast",
    mg: "vs vinavina"
  },
  "nouveau": {
    en: "new",
    mg: "vaovao"
  },
  "Répartition budgétaire (MGA)": {
    en: "Budget allocation (MGA)",
    mg: "Fizarana volam-panjakana (MGA)"
  },
  "Dépenses par département": {
    en: "Expenses by department",
    mg: "Fandaniana isan'ny sampana"
  },
  "État des stocks": {
    en: "Stock status",
    mg: "Toetran'ny stock"
  },
  "Quantités disponibles et seuils minimaux": {
    en: "Available quantities and minimum thresholds",
    mg: "Habe misy sy fetra farany"
  },
  "Demandes récentes": {
    en: "Recent requests",
    mg: "Fangatahana farany"
  },
  "Voir tout": {
    en: "View all",
    mg: "Hijery ny rehetra"
  },
  "Les dernières demandes d'achat soumises": {
    en: "Latest purchase requests submitted",
    mg: "Ny fangatahana fividianana farany natsipy"
  },
  "Alertes de stock": {
    en: "Stock alerts",
    mg: "Fampandrenesana stock"
  },
  "Produits en dessous du seuil minimal": {
    en: "Products below minimum threshold",
    mg: "Vokatra ambany fetra farany"
  },
  "Quantité": {
    en: "Quantity",
    mg: "Habe"
  },
  "seuil": {
    en: "threshold",
    mg: "fetra"
  },
  "Chargement en cours...": {
    en: "Loading...",
    mg: "Ampidirina..."
  },
  "Erreur lors du chargement des données": {
    en: "Error loading data",
    mg: "Hadisoana nandritra ny fampidirana angona"
  },

  // Demandes d'achat
  "Demande {reference}": {
    en: "Request {reference}",
    mg: "Fangatahana {reference}"
  },
  "Informations générales": {
    en: "General information",
    mg: "Fampahalalana ankapobeny"
  },
  "Référence": {
    en: "Reference",
    mg: "Fanondroana"
  },
  "Date de demande": {
    en: "Request date",
    mg: "Daty fangatahana"
  },
  "Nature": {
    en: "Type",
    mg: "Karazana"
  },
  "Département": {
    en: "Department",
    mg: "Sampana"
  },
  "Quantité": {
    en: "Quantity",
    mg: "Habe"
  },
  "Évaluation": {
    en: "Evaluation",
    mg: "Fanombanana"
  },
  "Niveau d'urgence": {
    en: "Urgency level",
    mg: "Haavon'ny maika"
  },
  "Impact stratégique": {
    en: "Strategic impact",
    mg: "Vokany stratejika"
  },
  "Statut": {
    en: "Status",
    mg: "Sata"
  },
  "Confidentiel": {
    en: "Confidential",
    mg: "Tsiambaratelo"
  },
  "Description et justification": {
    en: "Description and justification",
    mg: "Famariparitana sy antony"
  },
  "Description": {
    en: "Description",
    mg: "Famariparitana"
  },
  "Justification": {
    en: "Justification",
    mg: "Antony"
  },
  "Pièce justificative": {
    en: "Supporting document",
    mg: "Antontan-taratasy manamarina"
  },
  "Voir le fichier joint": {
    en: "View attached file",
    mg: "Hijery ny rakitra mifamatotra"
  },
  "Demandes d'achat": {
    en: "Purchase requests",
    mg: "Fangatahana fividianana"
  },
  "Nouvelle demande": {
    en: "New request",
    mg: "Fangatahana vaovao"
  },
  "Liste des demandes": {
    en: "Requests list",
    mg: "Lisitry ny fangatahana"
  },
  "Formulaire de demande d'achat": {
    en: "Purchase request form",
    mg: "Fomba fangatahana fividianana"
  },
  "Complétez ce formulaire pour soumettre une nouvelle demande d'achat.": {
    en: "Complete this form to submit a new purchase request.",
    mg: "Fenoy ity fomba ity hamandrihana fangatahana fividianana vaovao."
  },
  "Urgence": {
    en: "Urgency",
    mg: "Maika"
  },
  "Actions": {
    en: "Actions",
    mg: "Fandidiana"
  },
  "Voir les détails": {
    en: "View details",
    mg: "Hijery ny antsipirihany"
  },
  "Chargement...": {
    en: "Loading...",
    mg: "Ampidirina..."
  },
  "Rejetée": {
    en: "Rejected",
    mg: "Nolavina"
  },
  "Approuvée": {
    en: "Approved",
    mg: "Nekena"
  },
  "En attente": {
    en: "Pending",
    mg: "Miandry"
  },
  "En cours": {
    en: "In progress",
    mg: "Mandroso"
  },
  "Oui": {
    en: "Yes",
    mg: "Eny"
  },
  "Non": {
    en: "No",
    mg: "Tsia"
  },
  // Demandes d'achat - Formulaire
  "Nature de la demande": {
    en: "Request type",
    mg: "Karazan'ny fangatahana"
  },
  "Département": {
    en: "Department",
    mg: "Sampana"
  },
  "Description détaillée": {
    en: "Detailed description",
    mg: "Famariparitana antsipirihany"
  },
  "Décrivez en détail votre demande...": {
    en: "Describe your request in detail...",
    mg: "Lazao amin'ny antsipirihany ny fangatahanao..."
  },
  "Quantité": {
    en: "Quantity",
    mg: "Habe"
  },
  "Niveau d'urgence": {
    en: "Urgency level",
    mg: "Haavon'ny maika"
  },
  "Impact stratégique": {
    en: "Strategic impact",
    mg: "Vokany stratejika"
  },
  "Sélectionner": {
    en: "Select",
    mg: "Misafidy"
  },
  "Faible": {
    en: "Low",
    mg: "Kely"
  },
  "Moyenne": {
    en: "Medium",
    mg: "Antonony"
  },
  "Élevée": {
    en: "High",
    mg: "Avobe"
  },
  "Critique": {
    en: "Critical",
    mg: "Tena maika"
  },
  "Moyen": {
    en: "Medium",
    mg: "Antonony"
  },
  "Important": {
    en: "Important",
    mg: "Zava-dehibe"
  },
  "Justification": {
    en: "Justification",
    mg: "Antony"
  },
  "Pourquoi cet achat est-il nécessaire?": {
    en: "Why is this purchase necessary?",
    mg: "Nahoana no ilaina ity fividianana ity?"
  },
  "Demande confidentielle": {
    en: "Confidential request",
    mg: "Fangatahana tsiambaratelo"
  },
  "Cochez cette case si la demande contient des informations sensibles": {
    en: "Check this box if the request contains sensitive information",
    mg: "Asio marika amin'ity boaty ity raha misy fampahalalana tsiambaratelo ao amin'ny fangatahana"
  },
  "Pièce justificative (optionnelle)": {
    en: "Supporting document (optional)",
    mg: "Antontan-taratasy manamarina (tsy voatery)"
  },
  "Vous pouvez joindre un devis, une facture proforma ou tout autre document justificatif.": {
    en: "You can attach a quote, proforma invoice or any other supporting document.",
    mg: "Afaka mampifandray tati-bola, faktiora proforma na antontan-taratasy manamarina hafa ianao."
  },
  "Annuler": {
    en: "Cancel",
    mg: "Hanafoana"
  },
  "Envoi en cours...": {
    en: "Submitting...",
    mg: "Ampidirina..."
  },
  "Soumettre la demande": {
    en: "Submit request",
    mg: "Alefa ny fangatahana"
  },
  "Demande créée avec succès": {
    en: "Request created successfully",
    mg: "Nahomby ny famoronana ny fangatahana"
  },
  "Référence": {
    en: "Reference",
    mg: "Fanondroana"
  },
  "Erreur lors de la création de la demande": {
    en: "Error creating request",
    mg: "Hadisoana nandritra ny famoronana ny fangatahana"
  },

  // Budgets
  "Gestion budgétaire": {
    en: "Budget Management",
    mg: "Fitantanana vola"
  },
  "Exporter": {
    en: "Export",
    mg: "Hanondrana"
  },
  "Nouvelle allocation": {
    en: "New allocation",
    mg: "Fizarana vaovao"
  },
  "Budget total": {
    en: "Total budget",
    mg: "Volam-panjakana totaly"
  },
  "Budget annuel alloué": {
    en: "Annual allocated budget",
    mg: "Volam-panjakana isan-taona"
  },
  "Consommé": {
    en: "Consumed",
    mg: "Lany"
  },
  "du budget total": {
    en: "of total budget",
    mg: "ny totalin'ny volam-panjakana"
  },
  "Disponible": {
    en: "Available",
    mg: "Misy"
  },
  "Réallouer des fonds": {
    en: "Reallocate funds",
    mg: "Hanova ny fizarana vola"
  },
  "Répartition budgétaire": {
    en: "Budget allocation",
    mg: "Fizarana volam-panjakana"
  },
  "Par département": {
    en: "By department",
    mg: "Araka ny sampana"
  },
  "Dépenses": {
    en: "Expenses",
    mg: "Fandaniana"
  },
  "Prévisionnel": {
    en: "Forecast",
    mg: "Vinavina"
  },
  "Budget alloué": {
    en: "Allocated budget",
    mg: "Volam-panjakana nomena"
  },
  "Progression": {
    en: "Progress",
    mg: "Fandrosoana"
  },
  "Répartition budgétaire détaillée": {
    en: "Detailed budget allocation",
    mg: "Fizarana volam-panjakana antsipirihany"
  },
  "Vue d'ensemble des budgets par département": {
    en: "Overview of budgets by department",
    mg: "Fijery ankapobeny ny volam-panjakana isan'ny sampana"
  },
  "Rechercher un département...": {
    en: "Search a department...",
    mg: "Mitady sampana..."
  },
   // Documentation
   "Processus d'Achat Entreprise": {
    en: "Company Purchasing Process",
    mg: "Dingana fividianana an'ny orinasa"
  },
  "Télécharger le guide": {
    en: "Download guide",
    mg: "Hanintona ny torolalana"
  },
  "Rechercher...": {
    en: "Search...",
    mg: "Mitady..."
  },
  "Vue d'ensemble": {
    en: "Overview",
    mg: "Fijery ankapobeny"
  },
  "Processus complet": {
    en: "Complete process",
    mg: "Dingana feno"
  },
  "Rôles et responsabilités": {
    en: "Roles and responsibilities",
    mg: "Andraikitra sy andraikitry ny anjara"
  },
  "Circuit de validation": {
    en: "Validation workflow",
    mg: "Dingana fanamarinana"
  },
  "Gestion financière": {
    en: "Financial management",
    mg: "Fitantanana vola"
  },
  "Cas particuliers": {
    en: "Special cases",
    mg: "Tranga manokana"
  },
  "FAQ": {
    en: "FAQ",
    mg: "Fanontaniana matetika"
  },
  "Processus d'Achat": {
    en: "Purchasing Process",
    mg: "Dingana fividianana"
  },
  "Workflow complet de la demande à la réception": {
    en: "Complete workflow from request to reception",
    mg: "Dingana feno manomboka amin'ny fangatahana ka hatramin'ny fandraisana"
  },
  "Processus": {
    en: "Process",
    mg: "Dingana"
  },
  "Acteurs": {
    en: "Actors",
    mg: "Mpikambana"
  },
  "Validation": {
    en: "Validation",
    mg: "Fanamarinana"
  },
  "Finance": {
    en: "Finance",
    mg: "Vola"
  },
  "Règles de validation": {
    en: "Validation rules",
    mg: "Fitsipika fanamarinana"
  },
  "Les seuils de validation sont déterminés par le montant de l'achat": {
    en: "Validation thresholds are determined by the purchase amount",
    mg: "Ny fetra fanamarinana dia miankina amin'ny volavolan-dalana"
  },
  "Montant": {
    en: "Amount",
    mg: "Vola"
  },
  "Valideurs requis": {
    en: "Required approvers",
    mg: "Mpanamarina ilaina"
  },
  "Délai moyen": {
    en: "Average delay",
    mg: "Faharetan'ny fotoana"
  },
  "Exceptions": {
    en: "Exceptions",
    mg: "Fitsipika tsy azo ampiharina"
  },
  "Engagements budgétaires": {
    en: "Budget commitments",
    mg: "Fametrahana tetibola"
  },
  "Les budgets sont réservés dès la validation de la demande": {
    en: "Budgets are reserved as soon as the request is validated",
    mg: "Ny tetibola dia voatahiry avy hatrany rehefa voamarina ny fangatahana"
  },
  "Alertes automatiques en cas de dépassement": {
    en: "Automatic alerts in case of overspending",
    mg: "Fampandrenesana mandeha ho azy raha mihoatra ny fetra"
  },
  "Suivi mensuel par centre de coût": {
    en: "Monthly monitoring by cost center",
    mg: "Fandinihana isam-bolana araka ny ivon'ny fandaniana"
  },
  "Processus de paiement": {
    en: "Payment process",
    mg: "Dingana fandoavam-bola"
  },
  "Paiement sous 30 jours après réception conforme": {
    en: "Payment within 30 days after compliant reception",
    mg: "Fandoavana ao anatin'ny 30 andro aorian'ny fandraisana ara-dalàna"
  },
  "Triple validation (réception, achat, finance)": {
    en: "Triple validation (reception, purchase, finance)",
    mg: "Fanamarinana telo heny (fandraisana, fividianana, vola)"
  },
  "Archivage numérique des pièces justificatives": {
    en: "Digital archiving of supporting documents",
    mg: "Fitehirizana nomerikan'ny antontan-taratasy manamarina"
  },
  "Demande de matériel": {
    en: "Material request",
    mg: "Fangatahana fitaovana"
  },
  "Le collaborateur initie une demande d'achat via le portail dédié": {
    en: "The employee initiates a purchase request via the dedicated portal",
    mg: "Ny mpiasa no manomboka fangatahana fividianana amin'ny alalan'ny vavahady natokana"
  },
  "Formulaire de demande": {
    en: "Request form",
    mg: "Fomba fangatahana"
  },
  "Validation hiérarchique": {
    en: "Hierarchical validation",
    mg: "Fanamarinana araka ny ambaratongam-pitantanana"
  },
  "Approval par le manager selon les besoins et le budget": {
    en: "Approval by the manager according to needs and budget",
    mg: "Fankatoavana ny mpitantana araka ny ilaina sy ny tetibola"
  },
  "Analyse financière": {
    en: "Financial analysis",
    mg: "Fandinihana ara-bola"
  },
  "Vérification de la disponibilité budgétaire": {
    en: "Checking budget availability",
    mg: "Fanamarinana ny fisian'ny tetibola"
  },
  "Avis financier": {
    en: "Financial opinion",
    mg: "Hevitra ara-bola"
  },
  "Traitement achats": {
    en: "Purchase processing",
    mg: "Fikarakarana fividianana"
  },
  "Sélection fournisseur et négociation": {
    en: "Supplier selection and negotiation",
    mg: "Fisafidianana mpamatsy sy fifampiraharahana"
  },
  "Bon de commande": {
    en: "Purchase order",
    mg: "Baiko fividianana"
  },
  "Validation DG": {
    en: "CEO validation",
    mg: "Fanamarinana ny Filoha"
  },
  "Pour les achats stratégiques ou importants": {
    en: "For strategic or important purchases",
    mg: "Ho an'ny fividianana stratejika na lehibe"
  },
  "Approbation DG": {
    en: "CEO approval",
    mg: "Fankatoavana ny Filoha"
  },
  "Réception": {
    en: "Reception",
    mg: "Fandraisana"
  },
  "Contrôle qualité et conformité": {
    en: "Quality and compliance control",
    mg: "Fanamarinana kalitao sy fanarahana"
  },
  "Bon de livraison": {
    en: "Delivery note",
    mg: "Taratasy fanaterana"
  },
  "Paiement": {
    en: "Payment",
    mg: "Fandoavam-bola"
  },
  "Traitement comptable et règlement": {
    en: "Accounting processing and settlement",
    mg: "Fikarakarana kaonty sy fanatanterahana"
  },
  "Facture": {
    en: "Invoice",
    mg: "Faktiora"
  },
  "Demandeur": {
    en: "Requester",
    mg: "Mpangataka"
  },
  "Collaborateur à l'origine du besoin": {
    en: "Employee at the origin of the need",
    mg: "Mpiasa izay nanomboka ny ilaina"
  },
  "Saisie de la demande complète": {
    en: "Complete request entry",
    mg: "Fampidirana ny fangatahana feno"
  },
  "Fourniture des spécifications": {
    en: "Provision of specifications",
    mg: "Fanomezana ny fepetra takiana"
  },
  "Justification du besoin": {
    en: "Justification of the need",
    mg: "Fanamafisana ny ilaina"
  },
  "Suivi du processus": {
    en: "Process follow-up",
    mg: "Fandaharan'asa"
  },
  "Responsable hiérarchique": {
    en: "Hierarchical manager",
    mg: "Mpitantana araka ny ambaratongam-pitantanana"
  },
  "Validation opérationnelle": {
    en: "Operational validation",
    mg: "Fanamarinana asa"
  },
  "Vérification budgétaire": {
    en: "Budget verification",
    mg: "Fanamarinana tetibola"
  },
  "Priorisation des demandes": {
    en: "Request prioritization",
    mg: "Fanamarihana ny fangatahana"
  },
  "Délégation si absent": {
    en: "Delegation if absent",
    mg: "Fandraisana andraikitra raha tsy eo"
  },
  "Service Achats": {
    en: "Purchasing Department",
    mg: "Sampana fividianana"
  },
  "Gestion des fournisseurs": {
    en: "Supplier management",
    mg: "Fitantanana mpamatsy"
  },
  "Comparaison des offres": {
    en: "Offer comparison",
    mg: "Fampitahana tolotra"
  },
  "Négociation commerciale": {
    en: "Commercial negotiation",
    mg: "Fifampiraharahana ara-barotra"
  },
  "Émission des commandes": {
    en: "Order issuance",
    mg: "Famoahana baiko"
  },
  "Suivi des livraisons": {
    en: "Delivery follow-up",
    mg: "Fandaharan'asa fanaterana"
  },
  "Gestion des budgets": {
    en: "Budget management",
    mg: "Fitantanana tetibola"
  },
  "Contrôle des budgets": {
    en: "Budget control",
    mg: "Fanamarinana tetibola"
  },
  "Analyse financière": {
    en: "Financial analysis",
    mg: "Fandinihana ara-bola"
  },
  "Validation des paiements": {
    en: "Payment validation",
    mg: "Fanamarinana fandoavam-bola"
  },
  "Reporting comptable": {
    en: "Accounting reporting",
    mg: "Tatitra kaonty"
  },
  "Logistique": {
    en: "Logistics",
    mg: "Fitaovana"
  },
  "Gestion des stocks": {
    en: "Inventory management",
    mg: "Fitantanana stock"
  },
  "Réception des marchandises": {
    en: "Goods reception",
    mg: "Fandraisana entana"
  },
  "Contrôle qualité": {
    en: "Quality control",
    mg: "Fanamarinana kalitao"
  },
  "Gestion des retours": {
    en: "Returns management",
    mg: "Fitantanana famerenana"
  },
  "Mise à jour des stocks": {
    en: "Stock update",
    mg: "Fanavaozana stock"
  },
  "Direction": {
    en: "Management",
    mg: "Fitondrana"
  },
  "Validation stratégique": {
    en: "Strategic validation",
    mg: "Fanamarinana stratejika"
  },
  "Approbation des gros achats": {
    en: "Approval of large purchases",
    mg: "Fankatoavana ny fividianana lehibe"
  },
  "Décision stratégique": {
    en: "Strategic decision",
    mg: "Fanapahan-kevitra stratejika"
  },
  "Supervision globale": {
    en: "Global supervision",
    mg: "Fitantanana ankapobeny"
  },
  "Analyse des performances": {
    en: "Performance analysis",
    mg: "Fandinihana ny fahombiazana"
  },
  // Factures
  "Gestion des Factures": {
    en: "Invoice Management",
    mg: "Fitantanana faktiora"
  },
  "Nouvelle Facture": {
    en: "New Invoice",
    mg: "Faktiora vaovao"
  },
  "Créer une nouvelle facture": {
    en: "Create a new invoice",
    mg: "Mamorona faktiora vaovao"
  },
  "Scanner une facture": {
    en: "Scan an invoice",
    mg: "Mandinika faktiora"
  },
  "Numéro de facture": {
    en: "Invoice number",
    mg: "Laharana faktiora"
  },
  "Date de facture": {
    en: "Invoice date",
    mg: "Daty faktiora"
  },
  "Fournisseur": {
    en: "Supplier",
    mg: "Mpamatsy"
  },
  "Matériel": {
    en: "Material",
    mg: "Fitaovana"
  },
  "Département": {
    en: "Department",
    mg: "Sampana"
  },
  "Montant (MGA)": {
    en: "Amount (MGA)",
    mg: "Vola (MGA)"
  },
  "Annuler": {
    en: "Cancel",
    mg: "Hanafoana"
  },
  "Enregistrer la facture": {
    en: "Save invoice",
    mg: "Tehirizo ny faktiora"
  },
  "Prendre une photo": {
    en: "Take a photo",
    mg: "Maka sary"
  },
  "Uploader une image": {
    en: "Upload an image",
    mg: "Mampiditra sary"
  },
  "Formats supportés: JPG, PNG (max 1MB)": {
    en: "Supported formats: JPG, PNG (max 1MB)",
    mg: "Karazana rakitra azo ekena: JPG, PNG (max 1MB)"
  },
  "Nouveau scan": {
    en: "New scan",
    mg: "Fandinihana vaovao"
  },
  "Utiliser les données scannées": {
    en: "Use scanned data",
    mg: "Ampiasao ny angona voajinja"
  },
  "Factures matériels": {
    en: "Material invoices",
    mg: "Faktioran'ny fitaovana"
  },
  "Gérez toutes les factures liées aux achats de matériels.": {
    en: "Manage all invoices related to material purchases.",
    mg: "Tantano ny faktiora rehetra mifandraika amin'ny fividianana fitaovana."
  },
  "Rechercher une facture...": {
    en: "Search an invoice...",
    mg: "Mitady faktiora..."
  },
  "Tous les départements": {
    en: "All departments",
    mg: "Sampana rehetra"
  },
  "Informatique": {
    en: "IT",
    mg: "Informatika"
  },
  "Marketing": {
    en: "Marketing",
    mg: "Marketing"
  },
  "Direction": {
    en: "Management",
    mg: "Fitondrana"
  },
  "Logistique": {
    en: "Logistics",
    mg: "Logistika"
  },
  "Finance": {
    en: "Finance",
    mg: "Vola"
  },
  "N° Facture": {
    en: "Invoice No.",
    mg: "Faktiora No."
  },
  "Date": {
    en: "Date",
    mg: "Daty"
  },
  "Montant": {
    en: "Amount",
    mg: "Vola"
  },
  "Actions": {
    en: "Actions",
    mg: "Fandidiana"
  },
  "Aucune facture trouvée": {
    en: "No invoice found",
    mg: "Tsy misy faktiora hita"
  },
  "Voir les détails": {
    en: "View details",
    mg: "Hijery ny antsipirihany"
  },
  "Télécharger PDF": {
    en: "Download PDF",
    mg: "Hanintona PDF"
  },
  "Supprimer": {
    en: "Delete",
    mg: "Fafao"
  },
  "Analyse en cours...": {
    en: "Analysis in progress...",
    mg: "Fandinihana mandeha..."
  },
  "Facture analysée avec succès!": {
    en: "Invoice analyzed successfully!",
    mg: "Voamarina soa aman-tsara ny faktiora!"
  },
  "Changer de caméra": {
    en: "Change camera",
    mg: "Hanova fakantsary"
  },
  "Ou": {
    en: "Or",
    mg: "Na"
  },
  "Prendre une photo": {
    en: "Take a photo",
    mg: "Maka sary"
  },
  "Erreur lors du chargement des factures": {
    en: "Error loading invoices",
    mg: "Hadisoana nandritra ny fampidirana faktiora"
  },
  "Une erreur inconnue est survenue": {
    en: "An unknown error occurred",
    mg: "Nisy hadisoana tsy fantatra nitranga"
  },
  "Erreur lors de l'ajout de la facture": {
    en: "Error adding invoice",
    mg: "Hadisoana nandritra ny fanampiana faktiora"
  },
  "Une erreur est survenue lors de l'ajout": {
    en: "An error occurred while adding",
    mg: "Nisy hadisoana nitranga nandritra ny fanampiana"
  },
  "Réessayer": {
    en: "Try again",
    mg: "Andramo indray"
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Récupérer la langue depuis le localStorage ou utiliser 'fr' par défaut
  const [language, setLanguage] = useState<Language>(() => {
    // Vérifiez d'abord si window existe (Next.js/SSR)
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      // Validation supplémentaire pour s'assurer que la langue est valide
      return ["fr", "en", "mg"].includes(savedLang)
        ? (savedLang as Language)
        : "fr";
    }
    return "fr";
  });

  const translate = (text: string): string => {
    if (language === "fr") return text;

    if (translationMap[text as keyof typeof translationMap]) {
      return translationMap[text as keyof typeof translationMap][language];
    }

    for (const [french, translations] of Object.entries(translationMap)) {
      if (translations.en === text || translations.mg === text) {
        if (language === "fr") return french;
        return translations[language];
      }
    }

    return text;
  };

  // Fonction pour mettre à jour la langue et la stocker
  const handleSetLanguage = (newLanguage: Language) => {
    localStorage.setItem("language", newLanguage);
    setLanguage(newLanguage);
  };

  useEffect(() => {
    const event = new CustomEvent("languageChanged");
    window.dispatchEvent(event);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  // Ajouter cet effet pour retraduire à chaque changement de langue
  useEffect(() => {
    setupAutoTranslate(context.language);
  }, [context.language]);

  return context;
}
