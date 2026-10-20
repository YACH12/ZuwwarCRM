import type { Lang } from '../translations';

export const contactsTranslations: Record<Lang, {
  breadcrumbCrm: string; title: string; subtitle: string;
  importCsv: string; newContact: string;
  kpi: { total: string; subscribed: string; inactive: string; avgScore: string };
  searchPlaceholder: string;
  filters: { all: string; subscribed: string; unsubscribed: string; bounced: string };
  bulk: { selected: string; deleteSelection: string };
  totalBadge: string;
  table: { contact: string; phone: string; status: string; source: string; score: string; actions: string };
  status: { subscribed: string; unsubscribed: string; bounced: string };
  source: { manual: string; import: string; api: string };
  actions: { edit: string; delete: string };
  empty: { title: string; sub: string };
  pagination: string;
  modal: {
    addTitle: string; editTitle: string;
    contactType: string; individual: string; companyTab: string;
    lastName: string; lastNamePlaceholder: string;
    firstName: string; firstNamePlaceholder: string;
    email: string; emailPlaceholder: string;
    phone: string; phonePlaceholder: string;
    company: string; companySelectPlaceholder: string;
    position: string; positionPlaceholder: string;
    source: string; status: string;
    cancel: string;
    creating: string; saveContact: string;
    saving: string; updateContact: string;
  };
  deleteModal: {
    deleteSelectionTitle: string; bulkSub: string;
    deleteContactTitle: string; irreversible: string;
    bulkWarning: string; singleWarning: string;
    deleting: string; deleteCount: string; deletePermanently: string;
  };
  toast: {
    contactCreatedTitle: string; contactCreatedSub: string;
    contactMaybeCreatedTitle: string; serverErrorCreateSub: string;
    validationError: string; requiredFields: string;
    contactUpdatedTitle: string; contactUpdatedSub: string;
    contactMaybeUpdatedTitle: string; serverErrorUpdateSub: string;
    contactDeletedTitle: string; contactDeletedSub: string;
    deleteFailedTitle: string; deleteFailedRetrySub: string;
    deleteFailedCountSub: string;
    bulkDeletedTitle: string; bulkDeletedSub: string;
    bulkPartialTitle: string; bulkPartialSub: string;
    readErrorTitle: string; readErrorSub: string;
    emptyFileTitle: string; emptyFileSub: string;
    missingColumnsTitle: string; missingColumnsSub: string;
    noValidContactsTitle: string;
    importingTitle: string;
    importSuccessTitle: string; importSuccessSub: string;
    importPartialTitle: string;
    importErrorTitle: string; importErrorGeneric: string;
    loadErrorTitle: string; loadErrorSub: string;
  };
}> = {
  fr: {
    breadcrumbCrm: 'CRM', title: 'Contacts', subtitle: 'Gérez et suivez toutes vos relations clients',
    importCsv: 'Importer CSV', newContact: 'Nouveau contact',
    kpi: { total: 'Total contacts', subscribed: 'Abonnés', inactive: 'Inactifs', avgScore: "Score moyen d'engagement" },
    searchPlaceholder: 'Rechercher un contact...',
    filters: { all: 'Tous', subscribed: 'Abonnés', unsubscribed: 'Désabonnés', bounced: 'Bounced' },
    bulk: { selected: 'sélectionné(s)', deleteSelection: 'Supprimer la sélection' },
    totalBadge: 'contacts',
    table: { contact: 'Contact', phone: 'Téléphone', status: 'Statut', source: 'Source', score: 'Score', actions: 'Actions' },
    status: { subscribed: 'Abonné', unsubscribed: 'Désabonné', bounced: 'Bounced' },
    source: { manual: 'Manuel', import: 'Import', api: 'API' },
    actions: { edit: 'Modifier', delete: 'Supprimer' },
    empty: { title: 'Aucun contact trouvé', sub: 'Modifiez vos filtres ou créez un nouveau contact.' },
    pagination: 'Affichage de {shown} sur {total} contacts',
    modal: {
      addTitle: 'Nouveau contact', editTitle: 'Modifier le contact',
      contactType: 'Type de contact', individual: 'Individu', companyTab: 'Entreprise',
      lastName: 'Nom', lastNamePlaceholder: 'Ex : Dupont',
      firstName: 'Prénom', firstNamePlaceholder: 'Ex : Jean',
      email: 'Email', emailPlaceholder: 'jean.dupont@email.com',
      phone: 'Téléphone', phonePlaceholder: '+212 6 00 00 00 00',
      company: 'Entreprise', companySelectPlaceholder: '— Sélectionner —',
      position: 'Poste', positionPlaceholder: 'Ex : Directeur Commercial',
      source: 'Source', status: 'Statut',
      cancel: 'Annuler',
      creating: 'Création...', saveContact: 'Enregistrer le contact',
      saving: 'Sauvegarde...', updateContact: 'Mettre à jour',
    },
    deleteModal: {
      deleteSelectionTitle: 'Supprimer la sélection', bulkSub: '{count} contact(s) seront supprimés.',
      deleteContactTitle: 'Supprimer le contact', irreversible: 'Cette action est irréversible.',
      bulkWarning: 'Cette action est irréversible. Toutes les activités liées seront supprimées.',
      singleWarning: 'Toutes les activités liées à ce contact seront également supprimées.',
      deleting: 'Suppression...', deleteCount: 'Supprimer {count} contact(s)', deletePermanently: 'Supprimer définitivement',
    },
    toast: {
      contactCreatedTitle: 'Contact créé', contactCreatedSub: '{name} a été ajouté.',
      contactMaybeCreatedTitle: 'Contact peut-être créé', serverErrorCreateSub: 'Une erreur serveur s\'est produite — vérifiez si le contact apparaît dans la liste.',
      validationError: 'Erreur de validation', requiredFields: 'Nom et email sont obligatoires',
      contactUpdatedTitle: 'Contact mis à jour', contactUpdatedSub: 'Les modifications ont été enregistrées.',
      contactMaybeUpdatedTitle: 'Modification peut-être enregistrée', serverErrorUpdateSub: 'Une erreur serveur s\'est produite — vérifiez si les changements sont visibles.',
      contactDeletedTitle: 'Contact supprimé', contactDeletedSub: '{name} a été supprimé.',
      deleteFailedTitle: 'Échec de la suppression', deleteFailedRetrySub: 'Une erreur est survenue. Réessayez.',
      deleteFailedCountSub: '{count} contact(s) n\'ont pas pu être supprimés.',
      bulkDeletedTitle: '{count} contact(s) supprimé(s)', bulkDeletedSub: 'La sélection a été supprimée.',
      bulkPartialTitle: '{done} supprimé(s), {errors} échec(s)', bulkPartialSub: 'Certains contacts n\'ont pas pu être supprimés.',
      readErrorTitle: 'Erreur de lecture', readErrorSub: 'Impossible de lire le fichier.',
      emptyFileTitle: 'Fichier vide', emptyFileSub: 'Le CSV ne contient aucune ligne de données.',
      missingColumnsTitle: 'Colonnes manquantes', missingColumnsSub: 'En-têtes détectés : [{headers}]. Le CSV doit avoir les colonnes Nom et Email.',
      noValidContactsTitle: 'Aucun contact valide',
      importingTitle: 'Import de {count} contact(s)…',
      importSuccessTitle: 'Import réussi', importSuccessSub: '{count} contact(s) importé(s).',
      importPartialTitle: '{success} importé(s), {errors} erreur(s)',
      importErrorTitle: 'Erreur d\'import', importErrorGeneric: 'Une erreur s\'est produite',
      loadErrorTitle: 'Erreur de chargement', loadErrorSub: 'Impossible de récupérer les données. Réessayez plus tard.',
    },
  },
  en: {
    breadcrumbCrm: 'CRM', title: 'Contacts', subtitle: 'Manage and track all your customer relationships',
    importCsv: 'Import CSV', newContact: 'New contact',
    kpi: { total: 'Total contacts', subscribed: 'Subscribed', inactive: 'Inactive', avgScore: 'Avg. engagement score' },
    searchPlaceholder: 'Search a contact...',
    filters: { all: 'All', subscribed: 'Subscribed', unsubscribed: 'Unsubscribed', bounced: 'Bounced' },
    bulk: { selected: 'selected', deleteSelection: 'Delete selection' },
    totalBadge: 'contacts',
    table: { contact: 'Contact', phone: 'Phone', status: 'Status', source: 'Source', score: 'Score', actions: 'Actions' },
    status: { subscribed: 'Subscribed', unsubscribed: 'Unsubscribed', bounced: 'Bounced' },
    source: { manual: 'Manual', import: 'Import', api: 'API' },
    actions: { edit: 'Edit', delete: 'Delete' },
    empty: { title: 'No contacts found', sub: 'Adjust your filters or create a new contact.' },
    pagination: 'Showing {shown} of {total} contacts',
    modal: {
      addTitle: 'New contact', editTitle: 'Edit contact',
      contactType: 'Contact type', individual: 'Individual', companyTab: 'Company',
      lastName: 'Last name', lastNamePlaceholder: 'E.g.: Smith',
      firstName: 'First name', firstNamePlaceholder: 'E.g.: John',
      email: 'Email', emailPlaceholder: 'john.smith@email.com',
      phone: 'Phone', phonePlaceholder: '+212 6 00 00 00 00',
      company: 'Company', companySelectPlaceholder: '— Select —',
      position: 'Position', positionPlaceholder: 'E.g.: Sales Director',
      source: 'Source', status: 'Status',
      cancel: 'Cancel',
      creating: 'Creating...', saveContact: 'Save contact',
      saving: 'Saving...', updateContact: 'Update',
    },
    deleteModal: {
      deleteSelectionTitle: 'Delete selection', bulkSub: '{count} contact(s) will be deleted.',
      deleteContactTitle: 'Delete contact', irreversible: 'This action is irreversible.',
      bulkWarning: 'This action is irreversible. All related activities will be deleted.',
      singleWarning: 'All activities related to this contact will also be deleted.',
      deleting: 'Deleting...', deleteCount: 'Delete {count} contact(s)', deletePermanently: 'Delete permanently',
    },
    toast: {
      contactCreatedTitle: 'Contact created', contactCreatedSub: '{name} has been added.',
      contactMaybeCreatedTitle: 'Contact may have been created', serverErrorCreateSub: 'A server error occurred — check whether the contact appears in the list.',
      validationError: 'Validation error', requiredFields: 'Last name and email are required',
      contactUpdatedTitle: 'Contact updated', contactUpdatedSub: 'Your changes have been saved.',
      contactMaybeUpdatedTitle: 'Changes may have been saved', serverErrorUpdateSub: 'A server error occurred — check whether your changes are visible.',
      contactDeletedTitle: 'Contact deleted', contactDeletedSub: '{name} has been deleted.',
      deleteFailedTitle: 'Deletion failed', deleteFailedRetrySub: 'An error occurred. Please try again.',
      deleteFailedCountSub: '{count} contact(s) could not be deleted.',
      bulkDeletedTitle: '{count} contact(s) deleted', bulkDeletedSub: 'The selection has been deleted.',
      bulkPartialTitle: '{done} deleted, {errors} failed', bulkPartialSub: 'Some contacts could not be deleted.',
      readErrorTitle: 'Read error', readErrorSub: 'Unable to read the file.',
      emptyFileTitle: 'Empty file', emptyFileSub: 'The CSV file has no data rows.',
      missingColumnsTitle: 'Missing columns', missingColumnsSub: 'Detected headers: [{headers}]. The CSV must include Name and Email columns.',
      noValidContactsTitle: 'No valid contacts',
      importingTitle: 'Importing {count} contact(s)…',
      importSuccessTitle: 'Import successful', importSuccessSub: '{count} contact(s) imported.',
      importPartialTitle: '{success} imported, {errors} error(s)',
      importErrorTitle: 'Import error', importErrorGeneric: 'An error occurred',
      loadErrorTitle: 'Loading error', loadErrorSub: 'Unable to fetch data. Please try again later.',
    },
  },
  ar: {
    breadcrumbCrm: 'CRM', title: 'جهات الاتصال', subtitle: 'أدر وتابع جميع علاقاتك مع العملاء',
    importCsv: 'استيراد CSV', newContact: 'جهة اتصال جديدة',
    kpi: { total: 'إجمالي جهات الاتصال', subscribed: 'مشتركون', inactive: 'غير نشطين', avgScore: 'متوسط نقاط التفاعل' },
    searchPlaceholder: 'ابحث عن جهة اتصال...',
    filters: { all: 'الكل', subscribed: 'مشتركون', unsubscribed: 'ملغى الاشتراك', bounced: 'مرتد' },
    bulk: { selected: 'محدد', deleteSelection: 'حذف التحديد' },
    totalBadge: 'جهة اتصال',
    table: { contact: 'جهة الاتصال', phone: 'الهاتف', status: 'الحالة', source: 'المصدر', score: 'النقاط', actions: 'الإجراءات' },
    status: { subscribed: 'مشترك', unsubscribed: 'ملغى الاشتراك', bounced: 'مرتد' },
    source: { manual: 'يدوي', import: 'استيراد', api: 'API' },
    actions: { edit: 'تعديل', delete: 'حذف' },
    empty: { title: 'لا توجد جهات اتصال', sub: 'عدّل مرشحاتك أو أنشئ جهة اتصال جديدة.' },
    pagination: 'عرض {shown} من {total} جهة اتصال',
    modal: {
      addTitle: 'جهة اتصال جديدة', editTitle: 'تعديل جهة الاتصال',
      contactType: 'نوع جهة الاتصال', individual: 'فرد', companyTab: 'شركة',
      lastName: 'الاسم العائلي', lastNamePlaceholder: 'مثال: العلوي',
      firstName: 'الاسم الشخصي', firstNamePlaceholder: 'مثال: أحمد',
      email: 'البريد الإلكتروني', emailPlaceholder: 'ahmed.alaoui@email.com',
      phone: 'الهاتف', phonePlaceholder: '+212 6 00 00 00 00',
      company: 'الشركة', companySelectPlaceholder: '— اختر —',
      position: 'المنصب', positionPlaceholder: 'مثال: مدير المبيعات',
      source: 'المصدر', status: 'الحالة',
      cancel: 'إلغاء',
      creating: 'جارٍ الإنشاء...', saveContact: 'حفظ جهة الاتصال',
      saving: 'جارٍ الحفظ...', updateContact: 'تحديث',
    },
    deleteModal: {
      deleteSelectionTitle: 'حذف التحديد', bulkSub: 'سيتم حذف {count} جهة/جهات اتصال.',
      deleteContactTitle: 'حذف جهة الاتصال', irreversible: 'لا يمكن التراجع عن هذا الإجراء.',
      bulkWarning: 'لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع الأنشطة المرتبطة.',
      singleWarning: 'سيتم أيضًا حذف جميع الأنشطة المرتبطة بجهة الاتصال هذه.',
      deleting: 'جارٍ الحذف...', deleteCount: 'حذف {count} جهة/جهات اتصال', deletePermanently: 'حذف نهائي',
    },
    toast: {
      contactCreatedTitle: 'تم إنشاء جهة الاتصال', contactCreatedSub: 'تمت إضافة {name}.',
      contactMaybeCreatedTitle: 'ربما تم إنشاء جهة الاتصال', serverErrorCreateSub: 'حدث خطأ في الخادم — تحقق مما إذا كانت جهة الاتصال تظهر في القائمة.',
      validationError: 'خطأ في التحقق من صحة البيانات', requiredFields: 'الاسم والبريد الإلكتروني إلزاميان',
      contactUpdatedTitle: 'تم تحديث جهة الاتصال', contactUpdatedSub: 'تم حفظ التعديلات.',
      contactMaybeUpdatedTitle: 'ربما تم حفظ التعديل', serverErrorUpdateSub: 'حدث خطأ في الخادم — تحقق مما إذا كانت التغييرات ظاهرة.',
      contactDeletedTitle: 'تم حذف جهة الاتصال', contactDeletedSub: 'تم حذف {name}.',
      deleteFailedTitle: 'فشل الحذف', deleteFailedRetrySub: 'حدث خطأ. حاول مرة أخرى.',
      deleteFailedCountSub: 'تعذّر حذف {count} جهة/جهات اتصال.',
      bulkDeletedTitle: 'تم حذف {count} جهة/جهات اتصال', bulkDeletedSub: 'تم حذف التحديد.',
      bulkPartialTitle: 'تم حذف {done}، فشل {errors}', bulkPartialSub: 'تعذّر حذف بعض جهات الاتصال.',
      readErrorTitle: 'خطأ في القراءة', readErrorSub: 'تعذّرت قراءة الملف.',
      emptyFileTitle: 'ملف فارغ', emptyFileSub: 'لا يحتوي ملف CSV على أي بيانات.',
      missingColumnsTitle: 'أعمدة ناقصة', missingColumnsSub: 'الرؤوس المكتشفة: [{headers}]. يجب أن يحتوي ملف CSV على عمودي الاسم والبريد الإلكتروني.',
      noValidContactsTitle: 'لا توجد جهة اتصال صالحة',
      importingTitle: 'جارٍ استيراد {count} جهة/جهات اتصال…',
      importSuccessTitle: 'تم الاستيراد بنجاح', importSuccessSub: 'تم استيراد {count} جهة/جهات اتصال.',
      importPartialTitle: 'تم استيراد {success}، فشل {errors}',
      importErrorTitle: 'خطأ في الاستيراد', importErrorGeneric: 'حدث خطأ',
      loadErrorTitle: 'خطأ في التحميل', loadErrorSub: 'تعذّر جلب البيانات. حاول مرة أخرى لاحقًا.',
    },
  },
};
