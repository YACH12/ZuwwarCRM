import type { Lang } from '../translations';

export const activitiesTranslations: Record<Lang, {
  breadcrumbCrm: string; breadcrumbActivities: string; title: string; subtitle: string;
  searchPlaceholder: string; newActivity: string;
  kpi: { total: string; todo: string; inProgress: string; done: string };
  sidebar: { filters: string; clear: string; type: string; status: string; priority: string };
  typeOptions: { all: string; task: string; note: string; system: string };
  statusOptions: { todo: string; inProgress: string; done: string; cancelled: string };
  priorityOptions: { high: string; normal: string; low: string };
  groups: { today: string; yesterday: string; thisWeek: string; older: string };
  empty: { title: string; noResults: string; noActivities: string };
  overdue: string;
  dueDatePrefix: string;
  deleteTitle: string;
  confirmDelete: string;
  modal: {
    title: string; task: string; note: string;
    fieldTitle: string; fieldTitlePlaceholder: string;
    fieldDescription: string; fieldDescriptionPlaceholder: string;
    fieldPriority: string; fieldDueDate: string;
    fieldContact: string; fieldDeal: string; none: string;
    cancel: string; submit: string;
  };
}> = {
  fr: {
    breadcrumbCrm: 'CRM', breadcrumbActivities: 'Activités', title: 'Activités', subtitle: 'Gérez vos tâches, notes et événements',
    searchPlaceholder: 'Rechercher une activité...', newActivity: 'Nouvelle activité',
    kpi: { total: 'Total activités', todo: 'À faire', inProgress: 'En cours', done: 'Terminées' },
    sidebar: { filters: 'Filtres', clear: 'Effacer', type: 'Type', status: 'Statut', priority: 'Priorité' },
    typeOptions: { all: 'Tous', task: 'Tâches', note: 'Notes', system: 'Système' },
    statusOptions: { todo: 'À faire', inProgress: 'En cours', done: 'Terminée', cancelled: 'Annulée' },
    priorityOptions: { high: 'Haute', normal: 'Normale', low: 'Basse' },
    groups: { today: "Aujourd'hui", yesterday: 'Hier', thisWeek: 'Cette semaine', older: 'Plus ancien' },
    empty: { title: 'Aucune activité', noResults: 'Aucun résultat pour ces filtres.', noActivities: 'Commencez par créer votre première activité.' },
    overdue: 'En retard',
    dueDatePrefix: 'Éch.',
    deleteTitle: 'Supprimer',
    confirmDelete: 'Supprimer cette activité ?',
    modal: {
      title: 'Nouvelle activité', task: 'Tâche', note: 'Note',
      fieldTitle: 'Titre', fieldTitlePlaceholder: 'Ex : Rappeler Ahmed pour la démo',
      fieldDescription: 'Description', fieldDescriptionPlaceholder: 'Détails supplémentaires...',
      fieldPriority: 'Priorité', fieldDueDate: "Date d'échéance",
      fieldContact: 'Contact lié', fieldDeal: 'Deal lié', none: '— Aucun —',
      cancel: 'Annuler', submit: "Créer l'activité",
    },
  },
  en: {
    breadcrumbCrm: 'CRM', breadcrumbActivities: 'Activities', title: 'Activities', subtitle: 'Manage your tasks, notes and events',
    searchPlaceholder: 'Search an activity...', newActivity: 'New activity',
    kpi: { total: 'Total activities', todo: 'To do', inProgress: 'In progress', done: 'Completed' },
    sidebar: { filters: 'Filters', clear: 'Clear', type: 'Type', status: 'Status', priority: 'Priority' },
    typeOptions: { all: 'All', task: 'Tasks', note: 'Notes', system: 'System' },
    statusOptions: { todo: 'To do', inProgress: 'In progress', done: 'Completed', cancelled: 'Cancelled' },
    priorityOptions: { high: 'High', normal: 'Normal', low: 'Low' },
    groups: { today: 'Today', yesterday: 'Yesterday', thisWeek: 'This week', older: 'Older' },
    empty: { title: 'No activities', noResults: 'No results for these filters.', noActivities: 'Get started by creating your first activity.' },
    overdue: 'Overdue',
    dueDatePrefix: 'Due',
    deleteTitle: 'Delete',
    confirmDelete: 'Delete this activity?',
    modal: {
      title: 'New activity', task: 'Task', note: 'Note',
      fieldTitle: 'Title', fieldTitlePlaceholder: 'Ex: Call Ahmed back for the demo',
      fieldDescription: 'Description', fieldDescriptionPlaceholder: 'Additional details...',
      fieldPriority: 'Priority', fieldDueDate: 'Due date',
      fieldContact: 'Linked contact', fieldDeal: 'Linked deal', none: '— None —',
      cancel: 'Cancel', submit: 'Create activity',
    },
  },
  ar: {
    breadcrumbCrm: 'CRM', breadcrumbActivities: 'الأنشطة', title: 'الأنشطة', subtitle: 'أدر مهامك وملاحظاتك وأحداثك',
    searchPlaceholder: 'ابحث عن نشاط...', newActivity: 'نشاط جديد',
    kpi: { total: 'إجمالي الأنشطة', todo: 'قيد الانتظار', inProgress: 'قيد التنفيذ', done: 'منجزة' },
    sidebar: { filters: 'المرشحات', clear: 'مسح', type: 'النوع', status: 'الحالة', priority: 'الأولوية' },
    typeOptions: { all: 'الكل', task: 'المهام', note: 'الملاحظات', system: 'النظام' },
    statusOptions: { todo: 'قيد الانتظار', inProgress: 'قيد التنفيذ', done: 'منجزة', cancelled: 'ملغاة' },
    priorityOptions: { high: 'عالية', normal: 'عادية', low: 'منخفضة' },
    groups: { today: 'اليوم', yesterday: 'أمس', thisWeek: 'هذا الأسبوع', older: 'أقدم' },
    empty: { title: 'لا توجد أنشطة', noResults: 'لا توجد نتائج لهذه المرشحات.', noActivities: 'ابدأ بإنشاء أول نشاط لك.' },
    overdue: 'متأخر',
    dueDatePrefix: 'الاستحقاق',
    deleteTitle: 'حذف',
    confirmDelete: 'هل تريد حذف هذا النشاط؟',
    modal: {
      title: 'نشاط جديد', task: 'مهمة', note: 'ملاحظة',
      fieldTitle: 'العنوان', fieldTitlePlaceholder: 'مثال: معاودة الاتصال بأحمد للعرض التوضيحي',
      fieldDescription: 'الوصف', fieldDescriptionPlaceholder: 'تفاصيل إضافية...',
      fieldPriority: 'الأولوية', fieldDueDate: 'تاريخ الاستحقاق',
      fieldContact: 'جهة الاتصال المرتبطة', fieldDeal: 'الصفقة المرتبطة', none: '— لا شيء —',
      cancel: 'إلغاء', submit: 'إنشاء النشاط',
    },
  },
};
