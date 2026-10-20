import type { Lang } from '../translations';

export const dashboardTranslations: Record<Lang, {
  greeting: { morning: string; afternoon: string; evening: string };
  banner: { newContact: string; newDeal: string };
  kpi: { contacts: string; pipeline: string; won: string; avgScore: string };
  delta: { contactsThisMonth: string; inProgress: string; thisQuarter: string; allContacts: string };
  sections: {
    pipelineByStage: string; leadFunnel: string;
    closingRate: string; recentActivities: string; campaignsByType: string;
    pipelineForecast: string; activityHeatmap: string;
  };
  meta: { dealsAnd: string; contactsCount: string; campaignsCount: string; activitiesCount: string };
  link: { view: string; viewAll: string };
  empty: { noDeals: string; createOne: string; noLeads: string; noRecentActivity: string; noRecentActivitySub: string; createActivityCta: string; noCampaignData: string; noForecastData: string; noActivityData: string };
  gauge: { won: string; lost: string; inProgress: string; pipeline: string; campaigns: string; winRateLabel: string };
  stage: { prospect: string; qualification: string; proposal: string; negotiation: string; won: string; lost: string };
  leadStage: { new: string; contacted: string; qualified: string; proposal: string; converted: string; lost: string };
  activityType: { tasks: string; notes: string; system: string };
  campaignType: { email: string; sms: string; whatsapp: string };
  time: { daysAgo: string; hoursAgo: string; minutesAgo: string; justNow: string; today: string; yesterday: string };
  trends: {
    sectionTitle: string; newContacts: string; pipelineValue: string; wonVsLost: string;
    lastNMonths: string; nextNMonths: string; monthsSuffix: string;
    legendWon: string; legendLost: string; noData: string;
  };
  monthsShort: string[];
  daysShort: string[];
}> = {
  fr: {
    greeting: { morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir' },
    banner: { newContact: 'Nouveau contact', newDeal: 'Nouveau deal' },
    kpi: { contacts: 'Contacts', pipeline: 'Pipeline', won: 'Gagnés', avgScore: 'Score IA moy.' },
    delta: { contactsThisMonth: '+12 ce mois', inProgress: 'en cours', thisQuarter: 'ce trimestre', allContacts: 'tous contacts' },
    sections: {
      pipelineByStage: 'Pipeline par étape', leadFunnel: 'Entonnoir des leads',
      closingRate: 'Taux de closing', recentActivities: 'Activités récentes', campaignsByType: 'Campagnes par type',
      pipelineForecast: 'Prévision pipeline pondérée', activityHeatmap: 'Activité par jour & heure',
    },
    meta: { dealsAnd: 'deals ·', contactsCount: 'contacts', campaignsCount: 'campagnes', activitiesCount: 'activités' },
    link: { view: 'Voir →', viewAll: 'Tout voir →' },
    empty: { noDeals: 'Aucun deal —', createOne: 'en créer un', noLeads: 'Aucun lead', noRecentActivity: 'Aucune activité récente', noRecentActivitySub: 'Les tâches, notes et événements liés à vos contacts et deals apparaîtront ici.', createActivityCta: 'Créer une activité', noCampaignData: 'Aucune campagne', noForecastData: 'Aucune date de clôture estimée renseignée', noActivityData: "Pas encore de données d'activité" },
    gauge: { won: 'Gagnés', lost: 'Perdus', inProgress: 'En cours', pipeline: 'Pipeline', campaigns: 'Campagnes', winRateLabel: 'taux de gain' },
    stage: { prospect: 'Prospect', qualification: 'Qualification', proposal: 'Proposition', negotiation: 'Négociation', won: 'Gagné', lost: 'Perdu' },
    leadStage: { new: 'Nouveau', contacted: 'Contacté', qualified: 'Qualifié', proposal: 'Proposition', converted: 'Converti', lost: 'Perdu' },
    activityType: { tasks: 'Tâches', notes: 'Notes', system: 'Système' },
    campaignType: { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' },
    time: { daysAgo: 'il y a {n}j', hoursAgo: 'il y a {n}h', minutesAgo: 'il y a {n}min', justNow: "À l'instant", today: "Aujourd'hui", yesterday: 'Hier' },
    trends: {
      sectionTitle: 'Tendances',
      newContacts: 'Nouveaux contacts', pipelineValue: 'Valeur du pipeline', wonVsLost: 'Gagnés vs Perdus',
      lastNMonths: '{n} derniers mois', nextNMonths: '{n} prochains mois', monthsSuffix: 'M',
      legendWon: 'Gagnés', legendLost: 'Perdus', noData: 'Pas encore de données',
    },
    monthsShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    daysShort: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  },
  en: {
    greeting: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
    banner: { newContact: 'New contact', newDeal: 'New deal' },
    kpi: { contacts: 'Contacts', pipeline: 'Pipeline', won: 'Won', avgScore: 'Avg. AI Score' },
    delta: { contactsThisMonth: '+12 this month', inProgress: 'in progress', thisQuarter: 'this quarter', allContacts: 'all contacts' },
    sections: {
      pipelineByStage: 'Pipeline by stage', leadFunnel: 'Lead funnel',
      closingRate: 'Closing rate', recentActivities: 'Recent activities', campaignsByType: 'Campaigns by type',
      pipelineForecast: 'Weighted pipeline forecast', activityHeatmap: 'Activity by day & hour',
    },
    meta: { dealsAnd: 'deals ·', contactsCount: 'contacts', campaignsCount: 'campaigns', activitiesCount: 'activities' },
    link: { view: 'View →', viewAll: 'View all →' },
    empty: { noDeals: 'No deals —', createOne: 'create one', noLeads: 'No leads', noRecentActivity: 'No recent activity', noRecentActivitySub: 'Tasks, notes and events linked to your contacts and deals will show up here.', createActivityCta: 'Create an activity', noCampaignData: 'No campaigns', noForecastData: 'No estimated close dates set', noActivityData: 'No activity data yet' },
    gauge: { won: 'Won', lost: 'Lost', inProgress: 'In progress', pipeline: 'Pipeline', campaigns: 'Campaigns', winRateLabel: 'win rate' },
    stage: { prospect: 'Prospect', qualification: 'Qualification', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' },
    leadStage: { new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal', converted: 'Converted', lost: 'Lost' },
    activityType: { tasks: 'Tasks', notes: 'Notes', system: 'System' },
    campaignType: { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' },
    time: { daysAgo: '{n}d ago', hoursAgo: '{n}h ago', minutesAgo: '{n}min ago', justNow: 'Just now', today: 'Today', yesterday: 'Yesterday' },
    trends: {
      sectionTitle: 'Trends',
      newContacts: 'New contacts', pipelineValue: 'Pipeline value', wonVsLost: 'Won vs Lost',
      lastNMonths: 'Last {n} months', nextNMonths: 'Next {n} months', monthsSuffix: 'M',
      legendWon: 'Won', legendLost: 'Lost', noData: 'No data yet',
    },
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  ar: {
    greeting: { morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'مساء الخير' },
    banner: { newContact: 'جهة اتصال جديدة', newDeal: 'صفقة جديدة' },
    kpi: { contacts: 'جهات الاتصال', pipeline: 'خط الأنابيب', won: 'الصفقات الرابحة', avgScore: 'متوسط نقاط الذكاء الاصطناعي' },
    delta: { contactsThisMonth: '+12 هذا الشهر', inProgress: 'قيد التنفيذ', thisQuarter: 'هذا الفصل', allContacts: 'كل جهات الاتصال' },
    sections: {
      pipelineByStage: 'خط الأنابيب حسب المرحلة', leadFunnel: 'قمع العملاء المحتملين',
      closingRate: 'معدل الإغلاق', recentActivities: 'الأنشطة الأخيرة', campaignsByType: 'الحملات حسب النوع',
      pipelineForecast: 'توقع خط الأنابيب المرجّح', activityHeatmap: 'النشاط حسب اليوم والساعة',
    },
    meta: { dealsAnd: 'صفقة ·', contactsCount: 'جهة اتصال', campaignsCount: 'حملة', activitiesCount: 'نشاط' },
    link: { view: '← عرض', viewAll: '← عرض الكل' },
    empty: { noDeals: 'لا توجد صفقات —', createOne: 'أنشئ واحدة', noLeads: 'لا يوجد عملاء محتملون', noRecentActivity: 'لا يوجد نشاط حديث', noRecentActivitySub: 'ستظهر هنا المهام والملاحظات والأحداث المرتبطة بجهات اتصالك وصفقاتك.', createActivityCta: 'إنشاء نشاط', noCampaignData: 'لا توجد حملات', noForecastData: 'لا توجد تواريخ إغلاق متوقعة', noActivityData: 'لا توجد بيانات نشاط بعد' },
    gauge: { won: 'رابحة', lost: 'خاسرة', inProgress: 'قيد التنفيذ', pipeline: 'خط الأنابيب', campaigns: 'الحملات', winRateLabel: 'معدل الفوز' },
    stage: { prospect: 'محتمل', qualification: 'تأهيل', proposal: 'عرض', negotiation: 'تفاوض', won: 'رابحة', lost: 'خاسرة' },
    leadStage: { new: 'جديد', contacted: 'تم التواصل', qualified: 'مؤهَّل', proposal: 'عرض', converted: 'محوَّل', lost: 'خاسر' },
    activityType: { tasks: 'مهام', notes: 'ملاحظات', system: 'نظام' },
    campaignType: { email: 'بريد إلكتروني', sms: 'رسالة نصية', whatsapp: 'واتساب' },
    time: { daysAgo: 'منذ {n} يوم', hoursAgo: 'منذ {n} ساعة', minutesAgo: 'منذ {n} دقيقة', justNow: 'الآن', today: 'اليوم', yesterday: 'أمس' },
    trends: {
      sectionTitle: 'الاتجاهات',
      newContacts: 'جهات اتصال جديدة', pipelineValue: 'قيمة خط الأنابيب', wonVsLost: 'رابحة مقابل خاسرة',
      lastNMonths: 'آخر {n} أشهر', nextNMonths: '{n} أشهر قادمة', monthsSuffix: 'ش',
      legendWon: 'رابحة', legendLost: 'خاسرة', noData: 'لا توجد بيانات بعد',
    },
    monthsShort: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
    daysShort: ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'],
  },
};
