import type { Lang } from '../translations';

export const settingsTranslations: Record<Lang, {
  title: string; subtitle: string;
  smtp: {
    sectionTitle: string; sectionDesc: string; addSmtp: string;
    loading: string; emptyText: string;
    table: { host: string; port: string; username: string; status: string; actions: string };
    status: { active: string; inactive: string };
    actions: { activate: string; test: string; edit: string; delete: string };
  };
  modal: {
    editTitle: string; addTitle: string;
    hostLabel: string; hostPlaceholder: string;
    portLabel: string; portPlaceholder: string; portHint: string;
    protocolLabel: string;
    usernameLabel: string; usernamePlaceholder: string;
    passwordLabel: string; passwordPlaceholder: string; passwordHint: string;
    cancel: string; update: string; create: string;
  };
  confirm: { deleteSmtp: string };
  toast: {
    loadFailed: string;
    requiredFields: string;
    smtpUpdated: string; smtpCreated: string; saveFailed: string;
    activateSuccess: string; activateFailed: string;
    connectionTestFailed: string;
    smtpDeleted: string; deleteFailed: string;
  };
}> = {
  fr: {
    title: 'Paramètres',
    subtitle: 'Gérez les configurations SMTP pour l\'envoi d\'emails',
    smtp: {
      sectionTitle: 'Configurations SMTP',
      sectionDesc: 'Une seule configuration peut être active à la fois',
      addSmtp: 'Ajouter SMTP',
      loading: 'Chargement des configurations...',
      emptyText: 'Aucune configuration SMTP pour le moment. Ajoutez-en une pour activer l\'envoi d\'emails.',
      table: { host: 'Hôte', port: 'Port', username: 'Nom d\'utilisateur', status: 'Statut', actions: 'Actions' },
      status: { active: 'Actif', inactive: 'Inactif' },
      actions: { activate: 'Activer', test: 'Tester', edit: 'Modifier', delete: 'Supprimer' },
    },
    modal: {
      editTitle: 'Modifier le SMTP', addTitle: 'Ajouter une configuration SMTP',
      hostLabel: 'Hôte SMTP *', hostPlaceholder: 'smtp.gmail.com',
      portLabel: 'Port *', portPlaceholder: '587', portHint: '587 pour TLS, 465 pour SSL',
      protocolLabel: 'Protocole',
      usernameLabel: 'Nom d\'utilisateur (Email) *', usernamePlaceholder: 'votre@email.com',
      passwordLabel: 'Mot de passe / Mot de passe d\'application *', passwordPlaceholder: '••••••••••••',
      passwordHint: 'Pour Gmail, utilisez un mot de passe d\'application (pas votre mot de passe de compte)',
      cancel: 'Annuler', update: 'Mettre à jour', create: 'Créer',
    },
    confirm: { deleteSmtp: 'Supprimer cette configuration SMTP ?' },
    toast: {
      loadFailed: 'Échec du chargement des configurations SMTP',
      requiredFields: 'Veuillez remplir tous les champs obligatoires',
      smtpUpdated: 'SMTP mis à jour', smtpCreated: 'SMTP créé', saveFailed: 'Échec de l\'enregistrement du SMTP',
      activateSuccess: 'SMTP activé avec succès', activateFailed: 'Échec de l\'activation du SMTP',
      connectionTestFailed: 'Échec du test de connexion',
      smtpDeleted: 'SMTP supprimé', deleteFailed: 'Échec de la suppression du SMTP',
    },
  },
  en: {
    title: 'Settings',
    subtitle: 'Manage SMTP configurations for email sending',
    smtp: {
      sectionTitle: 'SMTP Configurations',
      sectionDesc: 'Only one configuration can be active at a time',
      addSmtp: 'Add SMTP',
      loading: 'Loading configurations...',
      emptyText: 'No SMTP configuration yet. Add one to enable email sending.',
      table: { host: 'Host', port: 'Port', username: 'Username', status: 'Status', actions: 'Actions' },
      status: { active: 'Active', inactive: 'Inactive' },
      actions: { activate: 'Activate', test: 'Test', edit: 'Edit', delete: 'Delete' },
    },
    modal: {
      editTitle: 'Edit SMTP', addTitle: 'Add SMTP Configuration',
      hostLabel: 'SMTP Host *', hostPlaceholder: 'smtp.gmail.com',
      portLabel: 'Port *', portPlaceholder: '587', portHint: '587 for TLS, 465 for SSL',
      protocolLabel: 'Protocol',
      usernameLabel: 'Username (Email) *', usernamePlaceholder: 'your@email.com',
      passwordLabel: 'Password / App Password *', passwordPlaceholder: '••••••••••••',
      passwordHint: 'For Gmail, use an App Password (not your account password)',
      cancel: 'Cancel', update: 'Update', create: 'Create',
    },
    confirm: { deleteSmtp: 'Delete this SMTP configuration?' },
    toast: {
      loadFailed: 'Failed to load SMTP configurations',
      requiredFields: 'Please fill in all required fields',
      smtpUpdated: 'SMTP updated', smtpCreated: 'SMTP created', saveFailed: 'Failed to save SMTP',
      activateSuccess: 'SMTP activated successfully', activateFailed: 'Failed to activate SMTP',
      connectionTestFailed: 'Connection test failed',
      smtpDeleted: 'SMTP deleted', deleteFailed: 'Failed to delete SMTP',
    },
  },
  ar: {
    title: 'الإعدادات',
    subtitle: 'أدر إعدادات SMTP لإرسال البريد الإلكتروني',
    smtp: {
      sectionTitle: 'إعدادات SMTP',
      sectionDesc: 'يمكن تفعيل إعداد واحد فقط في كل مرة',
      addSmtp: 'إضافة SMTP',
      loading: 'جارٍ تحميل الإعدادات...',
      emptyText: 'لا يوجد إعداد SMTP بعد. أضف واحدًا لتفعيل إرسال البريد الإلكتروني.',
      table: { host: 'المضيف', port: 'المنفذ', username: 'اسم المستخدم', status: 'الحالة', actions: 'الإجراءات' },
      status: { active: 'نشط', inactive: 'غير نشط' },
      actions: { activate: 'تفعيل', test: 'اختبار', edit: 'تعديل', delete: 'حذف' },
    },
    modal: {
      editTitle: 'تعديل إعداد SMTP', addTitle: 'إضافة إعداد SMTP',
      hostLabel: 'مضيف SMTP *', hostPlaceholder: 'smtp.gmail.com',
      portLabel: 'المنفذ *', portPlaceholder: '587', portHint: '587 لـ TLS، 465 لـ SSL',
      protocolLabel: 'البروتوكول',
      usernameLabel: 'اسم المستخدم (البريد الإلكتروني) *', usernamePlaceholder: 'your@email.com',
      passwordLabel: 'كلمة المرور / كلمة مرور التطبيق *', passwordPlaceholder: '••••••••••••',
      passwordHint: 'بالنسبة لـ Gmail، استخدم كلمة مرور خاصة بالتطبيق (وليس كلمة مرور حسابك)',
      cancel: 'إلغاء', update: 'تحديث', create: 'إنشاء',
    },
    confirm: { deleteSmtp: 'هل تريد حذف إعداد SMTP هذا؟' },
    toast: {
      loadFailed: 'فشل تحميل إعدادات SMTP',
      requiredFields: 'يرجى ملء جميع الحقول المطلوبة',
      smtpUpdated: 'تم تحديث SMTP', smtpCreated: 'تم إنشاء SMTP', saveFailed: 'فشل حفظ SMTP',
      activateSuccess: 'تم تفعيل SMTP بنجاح', activateFailed: 'فشل تفعيل SMTP',
      connectionTestFailed: 'فشل اختبار الاتصال',
      smtpDeleted: 'تم حذف SMTP', deleteFailed: 'فشل حذف SMTP',
    },
  },
};
