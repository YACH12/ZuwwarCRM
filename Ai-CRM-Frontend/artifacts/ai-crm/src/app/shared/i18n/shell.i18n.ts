import type { Lang } from '../translations';

export const shellTranslations: Record<Lang, {
  sidebar: {
    sectionMain: string; sectionAI: string; sectionSystem: string;
    overview: string; contacts: string; mailbox: string; deals: string; activities: string;
    campaigns: string; campaignsNew: string; integration: string;
    chatbot: string; clients: string; users: string; settings: string; help: string;
    toggleSidebar: string; logout: string;
  };
  topbar: { searchPlaceholder: string; notifications: string };
  notifications: {
    title: string; empty: string; markAllRead: string;
    kinds: { contact: string; deal_won: string; deal_lost: string; deal_new: string; campaign: string };
    time: { justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string };
  };
  roles: { admin: string; manager: string; integrateur: string; client: string; user: string };
  profileModal: {
    title: string; name: string; email: string; role: string;
    changePhoto: string; photoTooLarge: string; photoUpdateError: string; close: string;
  };
}> = {
  fr: {
    sidebar: {
      sectionMain: 'Principal', sectionAI: 'Fonctions IA', sectionSystem: 'Système',
      overview: 'Aperçu', contacts: 'Contacts', mailbox: 'Boîte de messagerie', deals: 'Opportunités', activities: 'Activités',
      campaigns: 'Campagnes', campaignsNew: 'Nouveau', integration: 'Intégrations',
      chatbot: 'Chatbot', clients: 'Clients', users: 'Utilisateurs', settings: 'Paramètres',
      help: 'Aide & Support', toggleSidebar: 'Réduire / agrandir', logout: 'Déconnexion',
    },
    topbar: { searchPlaceholder: 'Rechercher ou taper une commande…', notifications: 'Notifications' },
    notifications: {
      title: 'Notifications', empty: 'Aucune notification récente', markAllRead: 'Tout marquer comme lu',
      kinds: {
        contact: 'Nouveau contact', deal_won: 'Deal gagné', deal_lost: 'Deal perdu',
        deal_new: 'Nouvelle opportunité', campaign: 'Campagne envoyée',
      },
      time: { justNow: "À l'instant", minutesAgo: 'Il y a {n} min', hoursAgo: 'Il y a {n} h', daysAgo: 'Il y a {n} j' },
    },
    roles: { admin: 'Administrateur', manager: 'Manager', integrateur: 'Intégrateur', client: 'Client', user: 'Utilisateur' },
    profileModal: {
      title: 'Mon profil', name: 'Nom', email: 'Email', role: 'Rôle',
      changePhoto: 'Changer la photo', photoTooLarge: "L'image est trop volumineuse (max 2 Mo)",
      photoUpdateError: 'Erreur lors de la mise à jour de la photo', close: 'Fermer',
    },
  },
  en: {
    sidebar: {
      sectionMain: 'Main', sectionAI: 'AI Features', sectionSystem: 'System',
      overview: 'Overview', contacts: 'Contacts', mailbox: 'Mailbox', deals: 'Deals', activities: 'Activities',
      campaigns: 'Campaigns', campaignsNew: 'New', integration: 'Integration',
      chatbot: 'Chatbot', clients: 'Clients', users: 'Users', settings: 'Settings',
      help: 'Help & Support', toggleSidebar: 'Toggle sidebar', logout: 'Logout',
    },
    topbar: { searchPlaceholder: 'Search or type a command…', notifications: 'Notifications' },
    notifications: {
      title: 'Notifications', empty: 'No recent notifications', markAllRead: 'Mark all as read',
      kinds: {
        contact: 'New contact', deal_won: 'Deal won', deal_lost: 'Deal lost',
        deal_new: 'New deal', campaign: 'Campaign sent',
      },
      time: { justNow: 'Just now', minutesAgo: '{n}m ago', hoursAgo: '{n}h ago', daysAgo: '{n}d ago' },
    },
    roles: { admin: 'Admin', manager: 'Manager', integrateur: 'Integrator', client: 'Client', user: 'User' },
    profileModal: {
      title: 'My Profile', name: 'Name', email: 'Email', role: 'Role',
      changePhoto: 'Change photo', photoTooLarge: 'Image is too large (max 2MB)',
      photoUpdateError: 'Error updating photo', close: 'Close',
    },
  },
  ar: {
    sidebar: {
      sectionMain: 'الرئيسية', sectionAI: 'ميزات الذكاء الاصطناعي', sectionSystem: 'النظام',
      overview: 'نظرة عامة', contacts: 'جهات الاتصال', mailbox: 'صندوق البريد', deals: 'الصفقات', activities: 'الأنشطة',
      campaigns: 'الحملات', campaignsNew: 'جديد', integration: 'التكاملات',
      chatbot: 'روبوت الدردشة', clients: 'العملاء', users: 'المستخدمون', settings: 'الإعدادات',
      help: 'المساعدة والدعم', toggleSidebar: 'طي / فتح الشريط الجانبي', logout: 'تسجيل الخروج',
    },
    topbar: { searchPlaceholder: 'ابحث أو اكتب أمراً…', notifications: 'الإشعارات' },
    notifications: {
      title: 'الإشعارات', empty: 'لا توجد إشعارات حديثة', markAllRead: 'وضع علامة مقروء على الكل',
      kinds: {
        contact: 'جهة اتصال جديدة', deal_won: 'صفقة فائزة', deal_lost: 'صفقة خاسرة',
        deal_new: 'صفقة جديدة', campaign: 'حملة مرسلة',
      },
      time: { justNow: 'الآن', minutesAgo: 'منذ {n} د', hoursAgo: 'منذ {n} س', daysAgo: 'منذ {n} ي' },
    },
    roles: { admin: 'مدير', manager: 'مسؤول', integrateur: 'مكامل', client: 'عميل', user: 'مستخدم' },
    profileModal: {
      title: 'ملفي الشخصي', name: 'الاسم', email: 'البريد الإلكتروني', role: 'الدور',
      changePhoto: 'تغيير الصورة', photoTooLarge: 'الصورة كبيرة جدًا (الحد الأقصى 2 ميجابايت)',
      photoUpdateError: 'خطأ في تحديث الصورة', close: 'إغلاق',
    },
  },
};
