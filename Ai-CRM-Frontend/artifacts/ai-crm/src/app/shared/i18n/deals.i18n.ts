import type { Lang } from '../translations';

export const dealsTranslations: Record<Lang, {
  breadcrumbCrm: string; title: string;
  viewToggle: { kanban: string; list: string };
  showClosed: string; showActive: string; newDeal: string;
  tabs: { active: string; closed: string };
  kpi: {
    totalDeals: string; totalDealsSub: string;
    activePipeline: string; activePipelineSub: string;
    dealsWon: string; dealsWonSub: string;
    conversionRate: string; conversionRateSub: string;
  };
  loadingPipeline: string;
  stage: { prospect: string; qualification: string; proposition: string; negociation: string; gagne: string; perdu: string };
  colEmpty: string;
  viewProfile: string;
  closedBadge: { gagne: string; perdu: string };
  markWon: string; markLost: string;
  table: { deal: string; contact: string; amount: string; stage: string; probability: string };
  noContact: string;
  emptyDeals: { active: string; closed: string };
  modal: {
    newDealTitle: string;
    titleLabel: string; titlePlaceholder: string;
    amountLabel: string; amountPlaceholder: string;
    contactLabel: string; noContactOption: string;
    initialStageLabel: string;
    cancel: string; create: string;
  };
  confirmDelete: string;
  genericError: string;
}> = {
  fr: {
    breadcrumbCrm: 'CRM · Pipeline', title: 'Deals',
    viewToggle: { kanban: 'Kanban', list: 'Liste' },
    showClosed: 'Voir Fermés', showActive: 'Voir Actifs', newDeal: 'Nouveau Deal',
    tabs: { active: 'Active Deals', closed: 'Closed Deals' },
    kpi: {
      totalDeals: 'Total Deals', totalDealsSub: 'dans le pipeline',
      activePipeline: 'Pipeline Actif', activePipelineSub: 'en cours de traitement',
      dealsWon: 'Deals Gagnés', dealsWonSub: 'deals signés',
      conversionRate: 'Taux de conversion', conversionRateSub: 'prospect → gagné',
    },
    loadingPipeline: 'Chargement du pipeline...',
    stage: { prospect: 'Prospect', qualification: 'Qualification', proposition: 'Proposition', negociation: 'Négociation', gagne: 'Gagné', perdu: 'Perdu' },
    colEmpty: 'Déposer un deal ici',
    viewProfile: 'Voir profil',
    closedBadge: { gagne: '✓ Gagné', perdu: '✗ Perdu' },
    markWon: 'Marquer comme Gagné', markLost: 'Marquer comme Perdu',
    table: { deal: 'Deal', contact: 'Contact', amount: 'Montant', stage: 'Stage', probability: 'Probabilité' },
    noContact: '—',
    emptyDeals: { active: 'Aucun deal actif', closed: 'Aucun deal fermé' },
    modal: {
      newDealTitle: 'Nouveau Deal',
      titleLabel: 'Titre *', titlePlaceholder: 'Ex: Contrat Casablanca Tech',
      amountLabel: 'Montant (MAD) *', amountPlaceholder: '50 000',
      contactLabel: 'Contact lié', noContactOption: '— Aucun contact —',
      initialStageLabel: 'Stage initial',
      cancel: 'Annuler', create: 'Créer le deal',
    },
    confirmDelete: 'Supprimer ce deal ?',
    genericError: 'Une erreur est survenue. Veuillez réessayer.',
  },
  en: {
    breadcrumbCrm: 'CRM · Pipeline', title: 'Deals',
    viewToggle: { kanban: 'Kanban', list: 'List' },
    showClosed: 'View Closed', showActive: 'View Active', newDeal: 'New Deal',
    tabs: { active: 'Active Deals', closed: 'Closed Deals' },
    kpi: {
      totalDeals: 'Total Deals', totalDealsSub: 'in the pipeline',
      activePipeline: 'Active Pipeline', activePipelineSub: 'in progress',
      dealsWon: 'Deals Won', dealsWonSub: 'deals signed',
      conversionRate: 'Conversion Rate', conversionRateSub: 'prospect → won',
    },
    loadingPipeline: 'Loading pipeline...',
    stage: { prospect: 'Prospect', qualification: 'Qualification', proposition: 'Proposal', negociation: 'Negotiation', gagne: 'Won', perdu: 'Lost' },
    colEmpty: 'Drop a deal here',
    viewProfile: 'View profile',
    closedBadge: { gagne: '✓ Won', perdu: '✗ Lost' },
    markWon: 'Mark as Won', markLost: 'Mark as Lost',
    table: { deal: 'Deal', contact: 'Contact', amount: 'Amount', stage: 'Stage', probability: 'Probability' },
    noContact: '—',
    emptyDeals: { active: 'No active deals', closed: 'No closed deals' },
    modal: {
      newDealTitle: 'New Deal',
      titleLabel: 'Title *', titlePlaceholder: 'E.g.: Casablanca Tech Contract',
      amountLabel: 'Amount (MAD) *', amountPlaceholder: '50,000',
      contactLabel: 'Linked contact', noContactOption: '— No contact —',
      initialStageLabel: 'Initial stage',
      cancel: 'Cancel', create: 'Create deal',
    },
    confirmDelete: 'Delete this deal?',
    genericError: 'An error occurred. Please try again.',
  },
  ar: {
    breadcrumbCrm: 'CRM · خط الأنابيب', title: 'الصفقات',
    viewToggle: { kanban: 'كانبان', list: 'قائمة' },
    showClosed: 'عرض المغلقة', showActive: 'عرض النشطة', newDeal: 'صفقة جديدة',
    tabs: { active: 'الصفقات النشطة', closed: 'الصفقات المغلقة' },
    kpi: {
      totalDeals: 'إجمالي الصفقات', totalDealsSub: 'في خط الأنابيب',
      activePipeline: 'خط الأنابيب النشط', activePipelineSub: 'قيد المعالجة',
      dealsWon: 'الصفقات المكسوبة', dealsWonSub: 'صفقة موقعة',
      conversionRate: 'معدل التحويل', conversionRateSub: 'عميل محتمل ← مكسوبة',
    },
    loadingPipeline: 'جاري تحميل خط الأنابيب...',
    stage: { prospect: 'عميل محتمل', qualification: 'التأهيل', proposition: 'العرض', negociation: 'التفاوض', gagne: 'مكسوبة', perdu: 'خاسرة' },
    colEmpty: 'أفلت صفقة هنا',
    viewProfile: 'عرض الملف الشخصي',
    closedBadge: { gagne: '✓ مكسوبة', perdu: '✗ خاسرة' },
    markWon: 'وضع علامة مكسوبة', markLost: 'وضع علامة خاسرة',
    table: { deal: 'الصفقة', contact: 'جهة الاتصال', amount: 'المبلغ', stage: 'المرحلة', probability: 'الاحتمال' },
    noContact: '—',
    emptyDeals: { active: 'لا توجد صفقات نشطة', closed: 'لا توجد صفقات مغلقة' },
    modal: {
      newDealTitle: 'صفقة جديدة',
      titleLabel: 'العنوان *', titlePlaceholder: 'مثال: عقد الدار البيضاء تيك',
      amountLabel: 'المبلغ (درهم) *', amountPlaceholder: '50 000',
      contactLabel: 'جهة الاتصال المرتبطة', noContactOption: '— بدون جهة اتصال —',
      initialStageLabel: 'المرحلة الأولية',
      cancel: 'إلغاء', create: 'إنشاء الصفقة',
    },
    confirmDelete: 'هل تريد حذف هذه الصفقة؟',
    genericError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
  },
};
