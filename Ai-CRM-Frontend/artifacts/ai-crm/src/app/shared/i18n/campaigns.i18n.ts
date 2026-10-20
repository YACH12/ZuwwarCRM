import type { Lang } from '../translations';

export const campaignsTranslations: Record<Lang, {
  breadcrumbCrm: string; breadcrumbCampaigns: string;
  title: string; subtitle: string;
  newTemplate: string; newCampaign: string;
  kpi: {
    totalCampaigns: string; totalTrend: string;
    activeNow: string; activeSub: string;
    totalSent: string; totalSentSub: string;
    avgOpenRate: string; avgOpenRateSub: string;
  };
  tabs: { campaigns: string; templates: string };
  filters: { all: string; email: string; sms: string; whatsapp: string };
  toolbar: { campaignsBadge: string; templatesBadge: string };
  table: {
    campaign: string; type: string; template: string; status: string;
    audience: string; sent: string; openRate: string; clickRate: string; actions: string;
  };
  status: { active: string; completed: string; draft: string; paused: string };
  actions: {
    sending: string; sent: string; send: string; delete: string;
    confirmDeleteLabel: string; yes: string; no: string;
  };
  empty: {
    campaignsTitle: string; campaignsSub: string;
    templatesTitle: string; templatesSub: string;
  };
  pagination: { pagePrefix: string; ofSeparator: string; campaigns: string; templates: string };
  templateCard: { campaignCountSingular: string; campaignCountPlural: string; use: string; noTemplate: string; unnamed: string; clickToEdit: string };
  campaignModal: {
    title: string; subtitle: string;
    steps: { information: string; contacts: string; confirmation: string };
    step1: {
      campaignName: string; campaignNamePlaceholder: string;
      channel: string;
      subjectLine: string; subjectLinePlaceholder: string;
      chooseTemplate: string;
      cancel: string; next: string;
    };
    step2: {
      selected: string;
      selectAll: string; clear: string;
      back: string; review: string;
    };
    step3: {
      summaryTitle: string;
      name: string; subject: string; channel: string; template: string; recipients: string;
      recipientsUnit: string;
      note: string;
      back: string; createAndSend: string;
    };
  };
  templateModal: {
    title: string; subtitle: string;
    editTitle: string; editSubtitle: string;
    details: string;
    name: string; namePlaceholder: string; nameRequired: string; bodyRequired: string;
    channel: string;
    category: string;
    categories: { onboarding: string; promotion: string; followUp: string; newsletter: string; reEngagement: string; transactional: string };
    subjectLine: string; subjectLinePlaceholder: string; chars: string;
    variables: string; variablesHint: string; variablesTitlePrefix: string;
    editor: { plainText: string; htmlPreview: string; visualEditor: string };
    textPlaceholder: string; textHint: string;
    htmlSource: string; htmlPlaceholder: string; htmlHint: string;
    livePreview: string; testData: string; generatePreview: string; insertImage: string;
    visualPlaceholder: string; visualHint: string;
    cancel: string; saving: string; save: string; updating: string; update: string;
  };
  channels: { email: string; sms: string; whatsapp: string };
  variables: {
    firstName: string; lastName: string; email: string; phone: string;
    engagementScore: string; scoreLevel: string; stage: string; company: string;
    dealTitle: string; dealAmount: string; dealStage: string; dealProbability: string;
    todayDate: string; crmName: string;
  };
  visualBlocks: { title: string; paragraph: string; button: string; separator: string; image: string; signature: string };
  confirmSend: string;
  toast: {
    deleteSuccess: string;
    deleteForbidden: string; deleteGenericError: string;
    templateDeleteSuccess: string; templateDeleteForbidden: string; templateDeleteGenericError: string;
    sendSuccessWithCount: string; sendSuccessNoContacts: string;
    sendForbidden: string; sendNotFound: string; sendGenericError: string;
  };
  errors: { genericSaveError: string };
}> = {
  fr: {
    breadcrumbCrm: 'CRM', breadcrumbCampaigns: 'Campagnes',
    title: 'Campagnes', subtitle: 'Gérez vos campagnes email, SMS & WhatsApp avec des modèles réutilisables',
    newTemplate: 'Nouveau modèle', newCampaign: 'Nouvelle campagne',
    kpi: {
      totalCampaigns: 'Total campagnes', totalTrend: '↑ +2 ce mois-ci',
      activeNow: 'Actives maintenant', activeSub: 'Campagnes en cours',
      totalSent: 'Total envoyé', totalSentSub: 'Tous canaux confondus',
      avgOpenRate: 'Taux d\'ouverture moyen', avgOpenRateSub: 'Campagnes email',
    },
    tabs: { campaigns: 'Campagnes', templates: 'Modèles' },
    filters: { all: 'Tous', email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' },
    toolbar: { campaignsBadge: 'campagnes', templatesBadge: 'modèles' },
    table: {
      campaign: 'Campagne', type: 'Type', template: 'Modèle', status: 'Statut',
      audience: 'Audience', sent: 'Envoyé', openRate: 'Taux d\'ouverture', clickRate: 'Taux de clic', actions: 'Actions',
    },
    status: { active: 'Active', completed: 'Terminée', draft: 'Brouillon', paused: 'En pause' },
    actions: {
      sending: 'Envoi…', sent: 'Envoyée', send: 'Envoyer', delete: 'Supprimer',
      confirmDeleteLabel: 'Supprimer ?', yes: 'Oui', no: 'Non',
    },
    empty: {
      campaignsTitle: 'Aucune campagne trouvée', campaignsSub: 'Modifiez le filtre ou créez votre première campagne.',
      templatesTitle: 'Aucun modèle trouvé', templatesSub: 'Créez un modèle à réutiliser dans vos campagnes.',
    },
    pagination: { pagePrefix: 'Page', ofSeparator: '/', campaigns: 'campagnes', templates: 'modèles' },
    templateCard: { campaignCountSingular: 'campagne', campaignCountPlural: 'campagnes', use: 'Utiliser', noTemplate: 'Aucun modèle', unnamed: 'Sans nom', clickToEdit: 'Cliquer pour modifier' },
    campaignModal: {
      title: 'Créer une nouvelle campagne', subtitle: 'Configurez votre campagne en 3 étapes rapides',
      steps: { information: 'Informations', contacts: 'Contacts', confirmation: 'Confirmation' },
      step1: {
        campaignName: 'Nom de la campagne', campaignNamePlaceholder: 'Ex. Promo Été 2026',
        channel: 'Canal',
        subjectLine: 'Objet', subjectLinePlaceholder: 'Saisissez l\'objet…',
        chooseTemplate: 'Choisir un modèle',
        cancel: 'Annuler', next: 'Suivant — Sélectionner les contacts',
      },
      step2: {
        selected: 'contact(s) sélectionné(s)',
        selectAll: 'Tout sélectionner', clear: 'Effacer',
        back: 'Retour', review: 'Vérifier',
      },
      step3: {
        summaryTitle: 'Résumé de la campagne',
        name: 'Nom', subject: 'Objet', channel: 'Canal', template: 'Modèle', recipients: 'Destinataires',
        recipientsUnit: 'contacts',
        note: 'Les emails seront envoyés par SMTP à {count} contact(s) sélectionné(s).',
        back: 'Retour', createAndSend: 'Créer & envoyer',
      },
    },
    templateModal: {
      title: 'Nouveau modèle', subtitle: 'Créez un modèle de message réutilisable pour vos campagnes',
      editTitle: 'Modifier le modèle', editSubtitle: 'Mettez à jour ce modèle réutilisable',
      details: 'Détails du modèle',
      name: 'Nom', namePlaceholder: 'Ex. Email de bienvenue v2',
      nameRequired: 'Le nom est requis', bodyRequired: 'Le contenu du message ne peut pas être vide',
      channel: 'Canal',
      category: 'Catégorie',
      categories: { onboarding: 'Onboarding', promotion: 'Promotion', followUp: 'Relance', newsletter: 'Newsletter', reEngagement: 'Réengagement', transactional: 'Transactionnel' },
      subjectLine: 'Objet', subjectLinePlaceholder: 'Saisissez l\'objet…', chars: 'caractères',
      variables: 'Variables', variablesHint: 'cliquez pour insérer au curseur', variablesTitlePrefix: 'ex. ',
      editor: { plainText: 'Texte brut', htmlPreview: 'HTML', visualEditor: 'Éditeur visuel' },
      textPlaceholder: 'Bonjour {{prenom}},\n\nVotre message ici...\n\nCordialement,\n{{nomCRM}}',
      textHint: 'Cliquez sur une variable à gauche pour l\'insérer à la position du curseur',
      htmlSource: 'Code HTML', htmlPlaceholder: '<h1>Bonjour {{prenom}} !</h1>\n<p>Votre message...</p>',
      htmlHint: 'Cliquez sur « Générer l\'aperçu » pour visualiser votre template dans une fenêtre dédiée.',
      livePreview: 'Aperçu du template', testData: 'Données de test',
      generatePreview: 'Générer l\'aperçu', insertImage: 'Insérer une image',
      visualPlaceholder: 'Bonjour {{prenom}} !', visualHint: 'Sélectionnez du texte pour le formater · Cliquez sur une variable à gauche pour l\'insérer',
      cancel: 'Annuler', saving: 'Sauvegarde…', save: 'Enregistrer le modèle',
      updating: 'Mise à jour…', update: 'Mettre à jour',
    },
    channels: { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' },
    variables: {
      firstName: 'Prénom', lastName: 'Nom', email: 'Email', phone: 'Téléphone',
      engagementScore: 'Score d\'engagement', scoreLevel: 'Niveau de score', stage: 'Étape', company: 'Entreprise',
      dealTitle: 'Titre de l\'affaire', dealAmount: 'Montant de l\'affaire', dealStage: 'Étape de l\'affaire', dealProbability: 'Probabilité de l\'affaire',
      todayDate: 'Date du jour', crmName: 'Nom du CRM',
    },
    visualBlocks: { title: '📝 Titre', paragraph: '📄 Paragraphe', button: '🔘 Bouton', separator: '➖ Séparateur', image: '🖼️ Image', signature: '✍️ Signature' },
    confirmSend: 'Envoyer cette campagne à tous les contacts liés ?',
    toast: {
      deleteSuccess: 'Campagne supprimée avec succès.',
      deleteForbidden: 'Accès refusé — rôle ADMIN ou MANAGER requis pour supprimer.', deleteGenericError: 'Erreur lors de la suppression.',
      templateDeleteSuccess: 'Modèle supprimé avec succès.',
      templateDeleteForbidden: 'Accès refusé — rôle ADMIN ou CLIENT requis pour supprimer.', templateDeleteGenericError: 'Erreur lors de la suppression du modèle.',
      sendSuccessWithCount: 'Campagne "{name}" envoyée — {count} email(s) transmis.', sendSuccessNoContacts: 'Campagne "{name}" traitée — aucun contact associé.',
      sendForbidden: 'Accès refusé — rôle ADMIN ou INTEGRATEUR requis pour envoyer.', sendNotFound: 'Campagne introuvable.', sendGenericError: 'Erreur envoi — vérifiez la configuration SMTP.',
    },
    errors: { genericSaveError: 'Erreur {status} — vérifiez la console.' },
  },
  en: {
    breadcrumbCrm: 'CRM', breadcrumbCampaigns: 'Campaigns',
    title: 'Campaigns', subtitle: 'Manage email, SMS & WhatsApp campaigns with reusable templates',
    newTemplate: 'New Template', newCampaign: 'New Campaign',
    kpi: {
      totalCampaigns: 'Total Campaigns', totalTrend: '↑ +2 this month',
      activeNow: 'Active Now', activeSub: 'Running campaigns',
      totalSent: 'Total Sent', totalSentSub: 'Across all channels',
      avgOpenRate: 'Avg Open Rate', avgOpenRateSub: 'Email campaigns',
    },
    tabs: { campaigns: 'Campaigns', templates: 'Templates' },
    filters: { all: 'All', email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' },
    toolbar: { campaignsBadge: 'campaigns', templatesBadge: 'templates' },
    table: {
      campaign: 'Campaign', type: 'Type', template: 'Template', status: 'Status',
      audience: 'Audience', sent: 'Sent', openRate: 'Open Rate', clickRate: 'Click Rate', actions: 'Actions',
    },
    status: { active: 'Active', completed: 'Completed', draft: 'Draft', paused: 'Paused' },
    actions: {
      sending: 'Sending…', sent: 'Sent', send: 'Send', delete: 'Delete',
      confirmDeleteLabel: 'Delete?', yes: 'Yes', no: 'No',
    },
    empty: {
      campaignsTitle: 'No campaigns found', campaignsSub: 'Try changing the filter or create your first campaign.',
      templatesTitle: 'No templates found', templatesSub: 'Create a template to reuse across your campaigns.',
    },
    pagination: { pagePrefix: 'Page', ofSeparator: '/', campaigns: 'campaigns', templates: 'templates' },
    templateCard: { campaignCountSingular: 'campaign', campaignCountPlural: 'campaigns', use: 'Use', noTemplate: 'No template', unnamed: 'Unnamed', clickToEdit: 'Click to edit' },
    campaignModal: {
      title: 'Create New Campaign', subtitle: 'Set up your campaign in 3 quick steps',
      steps: { information: 'Information', contacts: 'Contacts', confirmation: 'Confirmation' },
      step1: {
        campaignName: 'Campaign Name', campaignNamePlaceholder: 'e.g. Summer Promo 2026',
        channel: 'Channel',
        subjectLine: 'Subject Line', subjectLinePlaceholder: 'Enter subject line…',
        chooseTemplate: 'Choose Template',
        cancel: 'Cancel', next: 'Next — Select Contacts',
      },
      step2: {
        selected: 'contact(s) selected',
        selectAll: 'Select all', clear: 'Clear',
        back: 'Back', review: 'Review',
      },
      step3: {
        summaryTitle: 'Campaign Summary',
        name: 'Name', subject: 'Subject', channel: 'Channel', template: 'Template', recipients: 'Recipients',
        recipientsUnit: 'contacts',
        note: 'Emails will be sent via SMTP to {count} selected contact(s).',
        back: 'Back', createAndSend: 'Create & Send',
      },
    },
    templateModal: {
      title: 'New Template', subtitle: 'Create a reusable message template for your campaigns',
      editTitle: 'Edit Template', editSubtitle: 'Update this reusable template',
      details: 'Template details',
      name: 'Name', namePlaceholder: 'e.g. Welcome Email v2',
      nameRequired: 'Name is required', bodyRequired: 'Message content cannot be empty',
      channel: 'Channel',
      category: 'Category',
      categories: { onboarding: 'Onboarding', promotion: 'Promotion', followUp: 'Follow-up', newsletter: 'Newsletter', reEngagement: 'Re-engagement', transactional: 'Transactional' },
      subjectLine: 'Subject line', subjectLinePlaceholder: 'Enter subject line…', chars: 'chars',
      variables: 'Variables', variablesHint: 'click to insert at cursor', variablesTitlePrefix: 'e.g. ',
      editor: { plainText: 'Plain text', htmlPreview: 'HTML', visualEditor: 'Visual editor' },
      textPlaceholder: 'Hello {{prenom}},\n\nYour message here...\n\nBest regards,\n{{nomCRM}}',
      textHint: 'Click a variable on the left to insert it at the cursor position',
      htmlSource: 'HTML source', htmlPlaceholder: '<h1>Hello {{prenom}} !</h1>\n<p>Your message...</p>',
      htmlHint: 'Click "Generate preview" to see your template in a dedicated window.',
      livePreview: 'Template preview', testData: 'Test data',
      generatePreview: 'Generate preview', insertImage: 'Insert an image',
      visualPlaceholder: 'Hello {{prenom}} !', visualHint: 'Select text to format it · Click a variable on the left to insert it',
      cancel: 'Cancel', saving: 'Saving…', save: 'Save template',
      updating: 'Updating…', update: 'Update template',
    },
    channels: { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' },
    variables: {
      firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Phone',
      engagementScore: 'Engagement score', scoreLevel: 'Score level', stage: 'Stage', company: 'Company',
      dealTitle: 'Deal title', dealAmount: 'Deal amount', dealStage: 'Deal stage', dealProbability: 'Deal probability',
      todayDate: 'Today\'s date', crmName: 'CRM name',
    },
    visualBlocks: { title: '📝 Title', paragraph: '📄 Paragraph', button: '🔘 Button', separator: '➖ Separator', image: '🖼️ Image', signature: '✍️ Signature' },
    confirmSend: 'Send this campaign to all linked contacts?',
    toast: {
      deleteSuccess: 'Campaign deleted successfully.',
      deleteForbidden: 'Access denied — ADMIN or MANAGER role required to delete.', deleteGenericError: 'An error occurred while deleting.',
      templateDeleteSuccess: 'Template deleted successfully.',
      templateDeleteForbidden: 'Access denied — ADMIN or CLIENT role required to delete.', templateDeleteGenericError: 'An error occurred while deleting the template.',
      sendSuccessWithCount: 'Campaign "{name}" sent — {count} email(s) delivered.', sendSuccessNoContacts: 'Campaign "{name}" processed — no associated contacts.',
      sendForbidden: 'Access denied — ADMIN or INTEGRATEUR role required to send.', sendNotFound: 'Campaign not found.', sendGenericError: 'Send error — check the SMTP configuration.',
    },
    errors: { genericSaveError: 'Error {status} — check the console.' },
  },
  ar: {
    breadcrumbCrm: 'CRM', breadcrumbCampaigns: 'الحملات',
    title: 'الحملات', subtitle: 'أدر حملات البريد الإلكتروني والرسائل النصية وواتساب باستخدام نماذج قابلة لإعادة الاستخدام',
    newTemplate: 'نموذج جديد', newCampaign: 'حملة جديدة',
    kpi: {
      totalCampaigns: 'إجمالي الحملات', totalTrend: '↑ +2 هذا الشهر',
      activeNow: 'نشطة حالياً', activeSub: 'حملات قيد التشغيل',
      totalSent: 'إجمالي المُرسل', totalSentSub: 'عبر جميع القنوات',
      avgOpenRate: 'متوسط معدل الفتح', avgOpenRateSub: 'حملات البريد الإلكتروني',
    },
    tabs: { campaigns: 'الحملات', templates: 'النماذج' },
    filters: { all: 'الكل', email: 'البريد الإلكتروني', sms: 'الرسائل النصية', whatsapp: 'واتساب' },
    toolbar: { campaignsBadge: 'حملة', templatesBadge: 'نموذج' },
    table: {
      campaign: 'الحملة', type: 'النوع', template: 'النموذج', status: 'الحالة',
      audience: 'الجمهور', sent: 'المُرسل', openRate: 'معدل الفتح', clickRate: 'معدل النقر', actions: 'الإجراءات',
    },
    status: { active: 'نشطة', completed: 'مكتملة', draft: 'مسودة', paused: 'متوقفة مؤقتاً' },
    actions: {
      sending: 'جارٍ الإرسال…', sent: 'تم الإرسال', send: 'إرسال', delete: 'حذف',
      confirmDeleteLabel: 'حذف؟', yes: 'نعم', no: 'لا',
    },
    empty: {
      campaignsTitle: 'لا توجد حملات', campaignsSub: 'غيّر المرشح أو أنشئ حملتك الأولى.',
      templatesTitle: 'لا توجد نماذج', templatesSub: 'أنشئ نموذجاً لإعادة استخدامه في حملاتك.',
    },
    pagination: { pagePrefix: 'صفحة', ofSeparator: '/', campaigns: 'حملة', templates: 'نموذج' },
    templateCard: { campaignCountSingular: 'حملة', campaignCountPlural: 'حملات', use: 'استخدام', noTemplate: 'لا يوجد نموذج', unnamed: 'بدون اسم', clickToEdit: 'انقر للتعديل' },
    campaignModal: {
      title: 'إنشاء حملة جديدة', subtitle: 'أعدّ حملتك في 3 خطوات سريعة',
      steps: { information: 'المعلومات', contacts: 'جهات الاتصال', confirmation: 'التأكيد' },
      step1: {
        campaignName: 'اسم الحملة', campaignNamePlaceholder: 'مثال: عروض الصيف 2026',
        channel: 'القناة',
        subjectLine: 'سطر الموضوع', subjectLinePlaceholder: 'أدخل سطر الموضوع…',
        chooseTemplate: 'اختر نموذجاً',
        cancel: 'إلغاء', next: 'التالي — اختيار جهات الاتصال',
      },
      step2: {
        selected: 'جهة/جهات اتصال محددة',
        selectAll: 'تحديد الكل', clear: 'مسح التحديد',
        back: 'رجوع', review: 'مراجعة',
      },
      step3: {
        summaryTitle: 'ملخص الحملة',
        name: 'الاسم', subject: 'الموضوع', channel: 'القناة', template: 'النموذج', recipients: 'المستلمون',
        recipientsUnit: 'جهة اتصال',
        note: 'سيتم إرسال رسائل البريد الإلكتروني عبر SMTP إلى {count} جهة/جهات اتصال محددة.',
        back: 'رجوع', createAndSend: 'إنشاء وإرسال',
      },
    },
    templateModal: {
      title: 'نموذج جديد', subtitle: 'أنشئ نموذج رسالة قابل لإعادة الاستخدام لحملاتك',
      editTitle: 'تعديل النموذج', editSubtitle: 'حدّث هذا النموذج القابل لإعادة الاستخدام',
      details: 'تفاصيل النموذج',
      name: 'الاسم', namePlaceholder: 'مثال: بريد ترحيب v2',
      nameRequired: 'الاسم مطلوب', bodyRequired: 'محتوى الرسالة لا يمكن أن يكون فارغاً',
      channel: 'القناة',
      category: 'الفئة',
      categories: { onboarding: 'الإعداد الأولي', promotion: 'ترويج', followUp: 'متابعة', newsletter: 'نشرة إخبارية', reEngagement: 'إعادة تفعيل', transactional: 'معاملاتي' },
      subjectLine: 'سطر الموضوع', subjectLinePlaceholder: 'أدخل سطر الموضوع…', chars: 'حرف',
      variables: 'المتغيرات', variablesHint: 'انقر للإدراج عند مؤشر الكتابة', variablesTitlePrefix: 'مثال: ',
      editor: { plainText: 'نص عادي', htmlPreview: 'HTML', visualEditor: 'محرر مرئي' },
      textPlaceholder: 'مرحباً {{prenom}}،\n\nرسالتك هنا...\n\nمع أطيب التحيات،\n{{nomCRM}}',
      textHint: 'انقر على متغير من اليسار لإدراجه عند موضع المؤشر',
      htmlSource: 'كود HTML', htmlPlaceholder: '<h1>مرحباً {{prenom}} !</h1>\n<p>رسالتك...</p>',
      htmlHint: 'انقر على «إنشاء المعاينة» لعرض نموذجك في نافذة مخصصة.',
      livePreview: 'معاينة النموذج', testData: 'بيانات تجريبية',
      generatePreview: 'إنشاء المعاينة', insertImage: 'إدراج صورة',
      visualPlaceholder: 'مرحباً {{prenom}} !', visualHint: 'حدد نصاً لتنسيقه · انقر على متغير من اليسار لإدراجه',
      cancel: 'إلغاء', saving: 'جارٍ الحفظ…', save: 'حفظ النموذج',
      updating: 'جارٍ التحديث…', update: 'تحديث النموذج',
    },
    channels: { email: 'البريد الإلكتروني', sms: 'الرسائل النصية', whatsapp: 'واتساب' },
    variables: {
      firstName: 'الاسم الشخصي', lastName: 'الاسم العائلي', email: 'البريد الإلكتروني', phone: 'الهاتف',
      engagementScore: 'نقاط التفاعل', scoreLevel: 'مستوى النقاط', stage: 'المرحلة', company: 'الشركة',
      dealTitle: 'عنوان الصفقة', dealAmount: 'مبلغ الصفقة', dealStage: 'مرحلة الصفقة', dealProbability: 'احتمالية الصفقة',
      todayDate: 'تاريخ اليوم', crmName: 'اسم نظام CRM',
    },
    visualBlocks: { title: '📝 عنوان', paragraph: '📄 فقرة', button: '🔘 زر', separator: '➖ فاصل', image: '🖼️ صورة', signature: '✍️ توقيع' },
    confirmSend: 'هل تريد إرسال هذه الحملة إلى جميع جهات الاتصال المرتبطة؟',
    toast: {
      deleteSuccess: 'تم حذف الحملة بنجاح.',
      deleteForbidden: 'تم رفض الوصول — يلزم دور ADMIN أو MANAGER للحذف.', deleteGenericError: 'حدث خطأ أثناء الحذف.',
      templateDeleteSuccess: 'تم حذف النموذج بنجاح.',
      templateDeleteForbidden: 'تم رفض الوصول — يلزم دور ADMIN أو CLIENT للحذف.', templateDeleteGenericError: 'حدث خطأ أثناء حذف النموذج.',
      sendSuccessWithCount: 'تم إرسال الحملة "{name}" — تم تسليم {count} بريد/رسائل إلكترونية.', sendSuccessNoContacts: 'تمت معالجة الحملة "{name}" — لا توجد جهات اتصال مرتبطة.',
      sendForbidden: 'تم رفض الوصول — يلزم دور ADMIN أو INTEGRATEUR للإرسال.', sendNotFound: 'الحملة غير موجودة.', sendGenericError: 'خطأ في الإرسال — تحقق من إعدادات SMTP.',
    },
    errors: { genericSaveError: 'خطأ {status} — تحقق من وحدة التحكم.' },
  },
};
