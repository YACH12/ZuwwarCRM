## Définition des stages du pipeline de vente

Le pipeline de Zuwwar comporte six étapes : PROSPECT (premier contact, probabilité 20%), QUALIFICATION (besoin confirmé, probabilité 40%), PROPOSITION (devis envoyé, probabilité 60%), NEGOCIATION (discussion des termes, probabilité 80%), GAGNE (deal signé, probabilité 100%), PERDU (deal perdu, probabilité 0%). La probabilité de closing est ajustée automatiquement selon le stage.

## Définition du score IA des contacts

Le score IA est calculé automatiquement par un modèle de Machine Learning de type Random Forest entraîné sur les comportements des prospects (temps passé sur le site, pages vues, source d'acquisition). Un score entre 0 et 25 correspond à un nouveau prospect peu engagé. Entre 25 et 62, le prospect est considéré comme engagé. Entre 62 et 90, le prospect a une haute intention d'achat. Au-dessus de 90, le prospect est prêt à convertir et doit être contacté en priorité.

## Politique de gestion des campagnes email

Une campagne email passe par les statuts suivants : DRAFT (brouillon, non envoyée), SCHEDULED (programmée), SENDING (en cours d'envoi), SENT (envoyée avec succès), CANCELLED (annulée). Chaque campagne doit être liée à au moins un contact avant de pouvoir être envoyée. L'envoi se fait via une configuration SMTP active enregistrée dans le système.

## Comment créer et envoyer une campagne email

Pour créer une campagne email dans Zuwwar : 1) Ouvrir le menu "Campagnes". 2) Pour créer une nouvelle campagne, cliquer sur "Nouvelle campagne" et renseigner le nom, le sujet et le type (EMAIL, SMS ou WHATSAPP) ; il est possible de choisir un modèle (template) existant pour préremplir le contenu. 3) Sélectionner les contacts qui recevront la campagne. 4) Valider : la campagne créée est au statut DRAFT (brouillon), elle n'est pas encore envoyée. 5) Depuis la liste des campagnes, cliquer sur le bouton d'envoi pour lancer l'envoi de la campagne — elle passe en SENDING puis SENT une fois l'envoi terminé. Deux conditions sont nécessaires pour envoyer une campagne : au moins un contact associé à la campagne, et une configuration SMTP active enregistrée dans Paramètres (sinon l'envoi échoue).

## Comment créer un contact

Pour créer un contact dans Zuwwar, deux façons d'ajouter un contact : 1) Créer un contact manuellement — depuis l'écran "Contacts", cliquer sur "Nouveau contact", choisir le type de contact (Individu ou Entreprise), renseigner au minimum le Nom et l'Email du contact (seuls champs obligatoires), puis cliquer sur "Enregistrer le contact" pour créer le contact. 2) Créer plusieurs contacts par import CSV — bouton "Importer CSV" pour ajouter une liste de contacts en une seule fois ; le système reconnaît automatiquement les colonnes courantes (email/mail/courriel, nom/name/last_name/lastname) et filtre les doublons d'email.

## Comment créer un deal (opportunité)

Pour créer un deal dans Zuwwar : 1) Depuis l'écran "Deals", cliquer sur "Nouveau Deal". 2) Renseigner le Titre et le Montant (MAD) — les deux seuls champs obligatoires. 3) Sélectionner optionnellement un contact lié. 4) Choisir le stage initial (Prospect, Qualification, Proposition ou Négociation — Prospect par défaut). 5) Cliquer sur "Créer le deal". Chaque changement d'étape ultérieur est automatiquement enregistré dans l'historique du contact lié.

## Comment créer un template email (modèle d'email)

Pour créer un template email (aussi appelé modèle d'email) dans Zuwwar : 1) Ouvrir "Campagnes" puis l'onglet "Modèles". 2) Cliquer sur "Nouveau modèle". 3) Renseigner le Nom du template (seul champ obligatoire) et choisir le canal (Email, SMS ou WhatsApp). 4) Renseigner optionnellement une catégorie et l'objet de l'email. 5) Rédiger le contenu du template via l'un des trois modes disponibles (Texte, HTML ou Éditeur visuel), avec possibilité d'insérer des variables de personnalisation ({{prenom}}, {{nom}}, {{entreprise}}...). 6) Cliquer sur "Enregistrer le modèle". Un template email créé peut ensuite être réutilisé dans plusieurs campagnes.

## Comment créer une tâche ou une note (activité)

Pour créer une activité dans Zuwwar : 1) Depuis l'écran "Activités", cliquer sur "Nouvelle activité". 2) Choisir le type : Tâche (par défaut) ou Note. 3) Renseigner le Titre (seul champ obligatoire) et une description optionnelle. 4) Pour une tâche, choisir la priorité (Basse/Normale/Haute) et la date d'échéance. 5) Lier optionnellement un contact et/ou un deal. 6) Cliquer sur "Créer l'activité". Un raccourci existe aussi depuis la fiche d'un contact via le bouton "Planifier", qui crée directement une tâche liée à ce contact.

## Comment ajouter une configuration SMTP

Pour ajouter une configuration SMTP dans Zuwwar : 1) Ouvrir "Paramètres" puis la section "Configurations SMTP". 2) Cliquer sur "Ajouter SMTP". 3) Renseigner les quatre champs obligatoires : Hôte SMTP, Port (587 pour TLS, 465 pour SSL), Nom d'utilisateur (email) et Mot de passe (pour Gmail, utiliser un mot de passe d'application). 4) Cliquer sur "Créer". 5) Depuis la liste, utiliser "Tester" pour vérifier la connexion sans envoyer d'email réel, puis "Activer" pour la rendre active. Une seule configuration SMTP peut être active à la fois : activer une nouvelle configuration désactive automatiquement les autres.

## Comment créer un compte utilisateur interne (staff)

Seul un compte avec le rôle ADMIN peut créer un utilisateur interne. Étapes : 1) Ouvrir l'écran "Utilisateurs" (réservé à ADMIN) et cliquer sur "Ajouter un utilisateur". 2) Renseigner Prénom, Nom, Email et un mot de passe provisoire. 3) Choisir le rôle : Admin, Manager ou Intégrateur. 4) Choisir le statut (Actif/Inactif). 5) Cliquer sur "Créer l'utilisateur". La création déclenche automatiquement la création du compte dans Keycloak et l'attribution du rôle correspondant.

## Comment créer une entreprise

Il n'existe pas encore d'écran dédié pour créer une entreprise directement dans Zuwwar. Une entreprise se sélectionne dans la liste existante au moment de créer un contact de type "Entreprise" (menu déroulant Entreprise dans le formulaire de création de contact).

## Rôles et permissions du CRM

Le rôle ADMIN a accès à toutes les fonctionnalités, y compris la gestion des utilisateurs et la suppression de données. Le rôle MANAGER peut créer et modifier des contacts, deals et campagnes, mais ne peut pas supprimer ni gérer les utilisateurs. Le rôle INTEGRATEUR peut uniquement créer des templates et envoyer des campagnes déjà configurées.

## Classification automatique des messages entrants

Le module NLP de Zuwwar classifie automatiquement chaque message entrant en trois catégories : Demande de Vente (intérêt commercial), Support Technique (problème ou question technique), ou Spam. Cette classification utilise un modèle de langage pré-entraîné en mode zero-shot, sans nécessiter de données d'entraînement spécifiques.