import type { Lang } from '../translations';

export const mailboxTranslations: Record<Lang, {
  title: string;
  subtitle: string;
  columns: { expediteur: string; sujet: string; contact: string; categorie: string; date: string };
  noSubject: string;
  noCategory: string;
  createContactBtn: string;
  loading: string;
  empty: string;
  pagination: string;
  categoryLabels: {
    devis_info_produit: string; reclamation: string; support_technique: string;
    suivi_commande: string; spam_hors_sujet: string;
  };
  detailModal: { title: string; from: string; subject: string; category: string; receivedOn: string; message: string; close: string };
  createModal: {
    title: string; email: string; nom: string; prenom: string; telephone: string;
    cancel: string; save: string; requiredFields: string;
  };
  toast: {
    contactCreatedTitle: string; contactCreatedSub: string;
    linkErrorTitle: string; linkErrorSub: string;
    createErrorTitle: string; createErrorSub: string;
    loadErrorTitle: string; loadErrorSub: string;
  };
}> = {
  fr: {
    title: 'Boîte de messagerie',
    subtitle: 'Emails reçus automatiquement via IMAP, liés à vos contacts',
    columns: { expediteur: 'Expéditeur', sujet: 'Sujet', contact: 'Contact', categorie: 'Catégorie', date: 'Reçu le' },
    noSubject: '(sans sujet)',
    noCategory: 'Non classé',
    createContactBtn: '+ Créer un contact',
    loading: 'Chargement des emails...',
    empty: 'Aucun email reçu pour le moment.',
    pagination: '{shown} sur {total} emails',
    categoryLabels: {
      devis_info_produit: 'Devis / info produit', reclamation: 'Réclamation', support_technique: 'Support technique',
      suivi_commande: 'Suivi de commande', spam_hors_sujet: 'Spam / hors sujet',
    },
    detailModal: { title: 'Email reçu', from: 'Expéditeur', subject: 'Sujet', category: 'Catégorie', receivedOn: 'Reçu le', message: 'Message', close: 'Fermer' },
    createModal: {
      title: 'Créer un contact depuis cet email',
      email: 'Email', nom: 'Nom *', prenom: 'Prénom', telephone: 'Téléphone',
      cancel: 'Annuler', save: 'Créer et lier',
      requiredFields: 'Le nom est obligatoire.',
    },
    toast: {
      contactCreatedTitle: 'Contact créé', contactCreatedSub: 'Le contact a été créé et lié à cet email.',
      linkErrorTitle: 'Contact créé, liaison échouée', linkErrorSub: 'Le contact existe mais n\'a pas pu être lié à cet email.',
      createErrorTitle: 'Erreur', createErrorSub: 'Impossible de créer le contact.',
      loadErrorTitle: 'Erreur de chargement', loadErrorSub: 'Impossible de charger les emails.',
    },
  },
  en: {
    title: 'Mailbox',
    subtitle: 'Emails received automatically via IMAP, linked to your contacts',
    columns: { expediteur: 'Sender', sujet: 'Subject', contact: 'Contact', categorie: 'Category', date: 'Received on' },
    noSubject: '(no subject)',
    noCategory: 'Unclassified',
    createContactBtn: '+ Create contact',
    loading: 'Loading emails...',
    empty: 'No emails received yet.',
    pagination: '{shown} of {total} emails',
    categoryLabels: {
      devis_info_produit: 'Quote / product info', reclamation: 'Complaint', support_technique: 'Technical support',
      suivi_commande: 'Order follow-up', spam_hors_sujet: 'Spam / off-topic',
    },
    detailModal: { title: 'Received email', from: 'From', subject: 'Subject', category: 'Category', receivedOn: 'Received on', message: 'Message', close: 'Close' },
    createModal: {
      title: 'Create a contact from this email',
      email: 'Email', nom: 'Last name *', prenom: 'First name', telephone: 'Phone',
      cancel: 'Cancel', save: 'Create and link',
      requiredFields: 'Last name is required.',
    },
    toast: {
      contactCreatedTitle: 'Contact created', contactCreatedSub: 'The contact was created and linked to this email.',
      linkErrorTitle: 'Contact created, link failed', linkErrorSub: 'The contact exists but could not be linked to this email.',
      createErrorTitle: 'Error', createErrorSub: 'Unable to create the contact.',
      loadErrorTitle: 'Loading error', loadErrorSub: 'Unable to load emails.',
    },
  },
  ar: {
    title: 'صندوق البريد',
    subtitle: 'رسائل مستلمة تلقائياً عبر IMAP، مرتبطة بجهات اتصالك',
    columns: { expediteur: 'المرسل', sujet: 'الموضوع', contact: 'جهة الاتصال', categorie: 'الفئة', date: 'تاريخ الاستلام' },
    noSubject: '(بدون موضوع)',
    noCategory: 'غير مصنف',
    createContactBtn: '+ إنشاء جهة اتصال',
    loading: 'جارٍ تحميل الرسائل...',
    empty: 'لا توجد رسائل مستلمة بعد.',
    pagination: '{shown} من {total} رسالة',
    categoryLabels: {
      devis_info_produit: 'عرض سعر / معلومات المنتج', reclamation: 'شكوى', support_technique: 'دعم تقني',
      suivi_commande: 'متابعة الطلب', spam_hors_sujet: 'سبام / خارج الموضوع',
    },
    detailModal: { title: 'البريد المستلم', from: 'المرسل', subject: 'الموضوع', category: 'الفئة', receivedOn: 'تاريخ الاستلام', message: 'الرسالة', close: 'إغلاق' },
    createModal: {
      title: 'إنشاء جهة اتصال من هذا البريد',
      email: 'البريد الإلكتروني', nom: 'الاسم الأخير *', prenom: 'الاسم الأول', telephone: 'الهاتف',
      cancel: 'إلغاء', save: 'إنشاء وربط',
      requiredFields: 'الاسم الأخير مطلوب.',
    },
    toast: {
      contactCreatedTitle: 'تم إنشاء جهة الاتصال', contactCreatedSub: 'تم إنشاء جهة الاتصال وربطها بهذا البريد.',
      linkErrorTitle: 'تم الإنشاء، فشل الربط', linkErrorSub: 'جهة الاتصال موجودة لكن تعذر ربطها بهذا البريد.',
      createErrorTitle: 'خطأ', createErrorSub: 'تعذر إنشاء جهة الاتصال.',
      loadErrorTitle: 'خطأ في التحميل', loadErrorSub: 'تعذر تحميل الرسائل.',
    },
  },
};
