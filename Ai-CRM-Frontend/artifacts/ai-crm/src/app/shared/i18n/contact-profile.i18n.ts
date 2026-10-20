import type { Lang } from '../translations';

export const contactProfileTranslations: Record<Lang, {
  loading: string;
  quickActions: { sendEmail: string; call: string; schedule: string };
  toast: { scheduledSuccess: string; scheduledError: string };
  planifierForm: {
    title: string;
    type: string;
    typeOptions: { appel: string; reunion: string; email: string; tache: string };
    dateTime: string;
    titre: string;
    titrePlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    cancel: string;
    save: string;
  };
  sections: { informations: string; dealsLinked: string };
  fields: {
    prenom: string; nom: string; email: string; telephone: string;
    source: string; leadStage: string; createdAt: string; engagementScore: string;
  };
  emptyDeals: string;
  stageLabels: {
    PROSPECT: string; QUALIFICATION: string; PROPOSITION: string; NEGOCIATION: string; GAGNE: string;
  };
  footer: { close: string; viewFullProfile: string };
}> = {
  fr: {
    loading: 'Chargement du profil...',
    quickActions: { sendEmail: 'Envoyer email', call: 'Appeler', schedule: 'Planifier' },
    toast: { scheduledSuccess: 'Activité planifiée avec succès !', scheduledError: 'Impossible de planifier l\'activité. Réessayez.' },
    planifierForm: {
      title: 'Nouvelle activité',
      type: 'Type',
      typeOptions: { appel: '📞 Appel', reunion: '🤝 Réunion', email: '✉️ Email', tache: '✅ Tâche' },
      dateTime: 'Date & heure',
      titre: 'Titre *',
      titrePlaceholder: 'Ex: Appel de suivi deal Property Loan',
      notes: 'Notes',
      notesPlaceholder: 'Notes optionnelles...',
      cancel: 'Annuler',
      save: 'Enregistrer',
    },
    sections: { informations: 'Informations', dealsLinked: 'Deals liés' },
    fields: {
      prenom: 'Prénom', nom: 'Nom', email: 'Email', telephone: 'Téléphone',
      source: 'Source', leadStage: 'Lead Stage', createdAt: 'Créé le', engagementScore: "Score d'engagement",
    },
    emptyDeals: 'Aucun deal associé à ce contact.',
    stageLabels: {
      PROSPECT: 'Prospect', QUALIFICATION: 'Qualification', PROPOSITION: 'Proposition',
      NEGOCIATION: 'Négociation', GAGNE: 'Gagné',
    },
    footer: { close: 'Fermer', viewFullProfile: 'Voir profil complet →' },
  },
  en: {
    loading: 'Loading profile...',
    quickActions: { sendEmail: 'Send email', call: 'Call', schedule: 'Schedule' },
    toast: { scheduledSuccess: 'Activity scheduled successfully!', scheduledError: 'Unable to schedule the activity. Please try again.' },
    planifierForm: {
      title: 'New activity',
      type: 'Type',
      typeOptions: { appel: '📞 Call', reunion: '🤝 Meeting', email: '✉️ Email', tache: '✅ Task' },
      dateTime: 'Date & time',
      titre: 'Title *',
      titrePlaceholder: 'E.g.: Follow-up call for Property Loan deal',
      notes: 'Notes',
      notesPlaceholder: 'Optional notes...',
      cancel: 'Cancel',
      save: 'Save',
    },
    sections: { informations: 'Information', dealsLinked: 'Linked deals' },
    fields: {
      prenom: 'First name', nom: 'Last name', email: 'Email', telephone: 'Phone',
      source: 'Source', leadStage: 'Lead Stage', createdAt: 'Created on', engagementScore: 'Engagement score',
    },
    emptyDeals: 'No deal associated with this contact.',
    stageLabels: {
      PROSPECT: 'Prospect', QUALIFICATION: 'Qualification', PROPOSITION: 'Proposal',
      NEGOCIATION: 'Negotiation', GAGNE: 'Won',
    },
    footer: { close: 'Close', viewFullProfile: 'View full profile →' },
  },
  ar: {
    loading: 'جارٍ تحميل الملف الشخصي...',
    quickActions: { sendEmail: 'إرسال بريد إلكتروني', call: 'اتصال', schedule: 'جدولة' },
    toast: { scheduledSuccess: 'تمت جدولة النشاط بنجاح!', scheduledError: 'تعذّرت جدولة النشاط. حاول مرة أخرى.' },
    planifierForm: {
      title: 'نشاط جديد',
      type: 'النوع',
      typeOptions: { appel: '📞 اتصال', reunion: '🤝 اجتماع', email: '✉️ بريد إلكتروني', tache: '✅ مهمة' },
      dateTime: 'التاريخ والوقت',
      titre: 'العنوان *',
      titrePlaceholder: 'مثال: مكالمة متابعة لصفقة Property Loan',
      notes: 'ملاحظات',
      notesPlaceholder: 'ملاحظات اختيارية...',
      cancel: 'إلغاء',
      save: 'حفظ',
    },
    sections: { informations: 'المعلومات', dealsLinked: 'الصفقات المرتبطة' },
    fields: {
      prenom: 'الاسم الأول', nom: 'الاسم الأخير', email: 'البريد الإلكتروني', telephone: 'الهاتف',
      source: 'المصدر', leadStage: 'مرحلة العميل المحتمل', createdAt: 'تاريخ الإنشاء', engagementScore: 'نقاط التفاعل',
    },
    emptyDeals: 'لا توجد صفقة مرتبطة بهذه جهة الاتصال.',
    stageLabels: {
      PROSPECT: 'محتمل', QUALIFICATION: 'التأهيل', PROPOSITION: 'اقتراح',
      NEGOCIATION: 'تفاوض', GAGNE: 'مكسوبة',
    },
    footer: { close: 'إغلاق', viewFullProfile: 'عرض الملف الكامل ←' },
  },
};
