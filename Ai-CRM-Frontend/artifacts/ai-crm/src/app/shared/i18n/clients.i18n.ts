import type { Lang } from '../translations';

export const clientsTranslations: Record<Lang, {
  title: string; subtitle: string;
  recalculateAll: string; recalculating: string;
  stats: { total: string; active: string; prospects: string; trial: string; suspended: string };
  searchPlaceholder: string;
  filters: {
    allStatuses: string; allPlans: string;
    statut: Record<'ACTIF' | 'PROSPECT' | 'ESSAI' | 'SUSPENDU' | 'EXPIRE' | 'CHURNED', string>;
    plan: Record<'FREE' | 'DEMO' | 'PREMIUM', string>;
  };
  resultCount: string; resultCountPlural: string;
  table: { client: string; company: string; plan: string; status: string; aiScore: string; signup: string; actions: string };
  actions: { suspend: string; reactivate: string; changePlan: string; aiScore: string; delete: string };
  photo: { change: string };
  empty: { title: string; sub: string };
  planModal: {
    title: string; newPlanLabel: string;
    freeOption: string; demoOption: string; premiumOption: string;
    cancel: string; confirm: string;
  };
  deleteModal: { confirmPrefix: string; confirmSuffix: string; warning: string; cancel: string; confirmDelete: string };
  errors: { loadClients: string; suspend: string; reactivate: string; changePlan: string; delete: string; photoTooLarge: string; photoUpdateError: string };
}> = {
  fr: {
    title: 'Clients',
    subtitle: 'Gestion des comptes clients et abonnements',
    recalculateAll: 'Recalculer scores IA',
    recalculating: 'Calcul en cours…',
    stats: { total: 'Total', active: 'Actifs', prospects: 'Prospects', trial: 'Essai', suspended: 'Suspendus' },
    searchPlaceholder: 'Rechercher par nom, email ou entreprise…',
    filters: {
      allStatuses: 'Tous les statuts',
      allPlans: 'Tous les plans',
      statut: { ACTIF: 'ACTIF', PROSPECT: 'PROSPECT', ESSAI: 'ESSAI', SUSPENDU: 'SUSPENDU', EXPIRE: 'EXPIRE', CHURNED: 'CHURNED' },
      plan: { FREE: 'FREE', DEMO: 'DEMO', PREMIUM: 'PREMIUM' },
    },
    resultCount: 'résultat',
    resultCountPlural: 'résultats',
    table: { client: 'Client', company: 'Entreprise', plan: 'Plan', status: 'Statut', aiScore: 'Score IA', signup: 'Inscription', actions: 'Actions' },
    actions: { suspend: 'Suspendre', reactivate: 'Réactiver', changePlan: 'Changer le plan', aiScore: 'Score IA', delete: 'Supprimer' },
    photo: { change: 'Changer la photo' },
    empty: { title: 'Aucun client trouvé', sub: "Essayez d'ajuster vos filtres" },
    planModal: {
      title: 'Changer le plan',
      newPlanLabel: "Nouveau plan d'abonnement",
      freeOption: 'FREE — Gratuit',
      demoOption: "DEMO — Période d'essai",
      premiumOption: 'PREMIUM — Complet',
      cancel: 'Annuler',
      confirm: 'Confirmer',
    },
    deleteModal: {
      confirmPrefix: 'Supprimer',
      confirmSuffix: '?',
      warning: 'Cette action est irréversible et supprimera toutes les données associées.',
      cancel: 'Annuler',
      confirmDelete: 'Supprimer définitivement',
    },
    errors: {
      loadClients: 'Erreur chargement des clients',
      suspend: 'Erreur suspension',
      reactivate: 'Erreur réactivation',
      changePlan: 'Erreur changement de plan',
      delete: 'Erreur suppression',
      photoTooLarge: "L'image est trop volumineuse (max 2 Mo)",
      photoUpdateError: 'Erreur lors de la mise à jour de la photo',
    },
  },
  en: {
    title: 'Clients',
    subtitle: 'Manage customer accounts and subscriptions',
    recalculateAll: 'Recalculate AI scores',
    recalculating: 'Calculating…',
    stats: { total: 'Total', active: 'Active', prospects: 'Prospects', trial: 'Trial', suspended: 'Suspended' },
    searchPlaceholder: 'Search by name, email or company…',
    filters: {
      allStatuses: 'All statuses',
      allPlans: 'All plans',
      statut: { ACTIF: 'ACTIVE', PROSPECT: 'PROSPECT', ESSAI: 'TRIAL', SUSPENDU: 'SUSPENDED', EXPIRE: 'EXPIRED', CHURNED: 'CHURNED' },
      plan: { FREE: 'FREE', DEMO: 'DEMO', PREMIUM: 'PREMIUM' },
    },
    resultCount: 'result',
    resultCountPlural: 'results',
    table: { client: 'Client', company: 'Company', plan: 'Plan', status: 'Status', aiScore: 'AI Score', signup: 'Signup', actions: 'Actions' },
    actions: { suspend: 'Suspend', reactivate: 'Reactivate', changePlan: 'Change plan', aiScore: 'AI Score', delete: 'Delete' },
    photo: { change: 'Change photo' },
    empty: { title: 'No clients found', sub: 'Try adjusting your filters' },
    planModal: {
      title: 'Change plan',
      newPlanLabel: 'New subscription plan',
      freeOption: 'FREE — Free',
      demoOption: 'DEMO — Trial period',
      premiumOption: 'PREMIUM — Full',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
    deleteModal: {
      confirmPrefix: 'Delete',
      confirmSuffix: '?',
      warning: 'This action is irreversible and will delete all associated data.',
      cancel: 'Cancel',
      confirmDelete: 'Delete permanently',
    },
    errors: {
      loadClients: 'Error loading clients',
      suspend: 'Error suspending client',
      reactivate: 'Error reactivating client',
      changePlan: 'Error changing plan',
      delete: 'Error deleting client',
      photoTooLarge: 'Image is too large (max 2MB)',
      photoUpdateError: 'Error updating photo',
    },
  },
  ar: {
    title: 'العملاء',
    subtitle: 'إدارة حسابات العملاء والاشتراكات',
    recalculateAll: 'إعادة حساب نقاط الذكاء الاصطناعي',
    recalculating: 'جارٍ الحساب…',
    stats: { total: 'الإجمالي', active: 'نشطون', prospects: 'عملاء محتملون', trial: 'تجريبي', suspended: 'موقوفون' },
    searchPlaceholder: 'ابحث بالاسم أو البريد الإلكتروني أو الشركة…',
    filters: {
      allStatuses: 'جميع الحالات',
      allPlans: 'جميع الخطط',
      statut: { ACTIF: 'نشط', PROSPECT: 'عميل محتمل', ESSAI: 'تجريبي', SUSPENDU: 'موقوف', EXPIRE: 'منتهي', CHURNED: 'مفقود' },
      plan: { FREE: 'مجاني', DEMO: 'تجريبي', PREMIUM: 'مميز' },
    },
    resultCount: 'نتيجة',
    resultCountPlural: 'نتائج',
    table: { client: 'العميل', company: 'الشركة', plan: 'الخطة', status: 'الحالة', aiScore: 'نقاط الذكاء الاصطناعي', signup: 'تاريخ التسجيل', actions: 'الإجراءات' },
    actions: { suspend: 'إيقاف', reactivate: 'إعادة تفعيل', changePlan: 'تغيير الخطة', aiScore: 'نقاط الذكاء الاصطناعي', delete: 'حذف' },
    photo: { change: 'تغيير الصورة' },
    empty: { title: 'لم يتم العثور على أي عميل', sub: 'حاول تعديل عوامل التصفية' },
    planModal: {
      title: 'تغيير الخطة',
      newPlanLabel: 'خطة الاشتراك الجديدة',
      freeOption: 'مجاني — Free',
      demoOption: 'تجريبي — فترة تجريبية',
      premiumOption: 'مميز — كامل',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
    },
    deleteModal: {
      confirmPrefix: 'حذف',
      confirmSuffix: '؟',
      warning: 'هذا الإجراء لا رجعة فيه وسيؤدي إلى حذف جميع البيانات المرتبطة.',
      cancel: 'إلغاء',
      confirmDelete: 'حذف نهائي',
    },
    errors: {
      loadClients: 'خطأ في تحميل العملاء',
      suspend: 'خطأ في إيقاف العميل',
      reactivate: 'خطأ في إعادة تفعيل العميل',
      changePlan: 'خطأ في تغيير الخطة',
      delete: 'خطأ في حذف العميل',
      photoTooLarge: 'الصورة كبيرة جدًا (الحد الأقصى 2 ميجابايت)',
      photoUpdateError: 'خطأ في تحديث الصورة',
    },
  },
};
