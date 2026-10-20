import type { Lang } from '../translations';

export const usersTranslations: Record<Lang, {
  title: string; subtitle: string; addUser: string;
  stats: { totalUsers: string; totalUsersSub: string; active: string; activeSub: string; admins: string; adminsSub: string; roles: string; rolesSub: string };
  toolbar: { searchPlaceholder: string; allRoles: string; allStatus: string };
  table: { user: string; role: string; permissions: string; status: string; lastLogin: string; created: string; actions: string };
  status: { active: string; inactive: string };
  actions: { edit: string; disable: string; enable: string; delete: string };
  photo: { change: string };
  empty: string;
  modal: {
    editTitle: string; addTitle: string;
    firstName: string; firstNamePlaceholder: string;
    lastName: string; lastNamePlaceholder: string;
    email: string;
    password: string; passwordPlaceholder: string;
    role: string; status: string;
    permissions: string;
    cancel: string; saveChanges: string; createUser: string;
  };
  deleteModal: { confirmText: string; warning: string; cancel: string; deleteUser: string };
  errors: { loadUsers: string; passwordRequired: string; updateError: string; createError: string; generic: string; deleteError: string; photoTooLarge: string; photoUpdateError: string };
}> = {
  fr: {
    title: 'Gestion des utilisateurs', subtitle: 'Gérez les utilisateurs, rôles et permissions du CRM', addUser: 'Ajouter un utilisateur',
    stats: {
      totalUsers: 'Total utilisateurs', totalUsersSub: 'Tous les comptes',
      active: 'Actifs', activeSub: 'Connectés récemment',
      admins: 'Admins', adminsSub: 'Accès complet',
      roles: 'Rôles', rolesSub: 'Admin · Manager · Intégrateur',
    },
    toolbar: { searchPlaceholder: 'Rechercher par nom ou email...', allRoles: 'Tous les rôles', allStatus: 'Tous les statuts' },
    table: { user: 'Utilisateur', role: 'Rôle', permissions: 'Permissions', status: 'Statut', lastLogin: 'Dernière connexion', created: 'Créé le', actions: 'Actions' },
    status: { active: 'Actif', inactive: 'Inactif' },
    actions: { edit: 'Modifier', disable: 'Désactiver', enable: 'Activer', delete: 'Supprimer' },
    photo: { change: 'Changer la photo' },
    empty: 'Aucun utilisateur ne correspond à votre recherche.',
    modal: {
      editTitle: 'Modifier l\'utilisateur', addTitle: 'Ajouter un utilisateur',
      firstName: 'Prénom', firstNamePlaceholder: 'Prénom',
      lastName: 'Nom', lastNamePlaceholder: 'Nom de famille',
      email: 'Email',
      password: 'Mot de passe', passwordPlaceholder: 'Définir le mot de passe initial',
      role: 'Rôle', status: 'Statut',
      permissions: 'Permissions',
      cancel: 'Annuler', saveChanges: 'Enregistrer les modifications', createUser: 'Créer l\'utilisateur',
    },
    deleteModal: {
      confirmText: 'Supprimer {name} ?',
      warning: 'Cette action est irréversible. L\'utilisateur perdra tout accès.',
      cancel: 'Annuler', deleteUser: 'Supprimer l\'utilisateur',
    },
    errors: {
      loadUsers: 'Erreur chargement des utilisateurs',
      passwordRequired: 'Le mot de passe est requis',
      updateError: 'Erreur mise à jour',
      createError: 'Erreur création',
      generic: 'Erreur',
      deleteError: 'Erreur suppression',
      photoTooLarge: "L'image est trop volumineuse (max 2 Mo)",
      photoUpdateError: 'Erreur lors de la mise à jour de la photo',
    },
  },
  en: {
    title: 'User Management', subtitle: 'Manage CRM users, roles and permissions', addUser: 'Add User',
    stats: {
      totalUsers: 'Total Users', totalUsersSub: 'All accounts',
      active: 'Active', activeSub: 'Logged in recently',
      admins: 'Admins', adminsSub: 'Full access',
      roles: 'Roles', rolesSub: 'Admin · Manager · Integrator',
    },
    toolbar: { searchPlaceholder: 'Search by name or email...', allRoles: 'All Roles', allStatus: 'All Status' },
    table: { user: 'User', role: 'Role', permissions: 'Permissions', status: 'Status', lastLogin: 'Last Login', created: 'Created', actions: 'Actions' },
    status: { active: 'Active', inactive: 'Inactive' },
    actions: { edit: 'Edit', disable: 'Disable', enable: 'Enable', delete: 'Delete' },
    photo: { change: 'Change photo' },
    empty: 'No users match your search.',
    modal: {
      editTitle: 'Edit User', addTitle: 'Add New User',
      firstName: 'First Name', firstNamePlaceholder: 'First name',
      lastName: 'Last Name', lastNamePlaceholder: 'Last name',
      email: 'Email',
      password: 'Password', passwordPlaceholder: 'Set initial password',
      role: 'Role', status: 'Status',
      permissions: 'Permissions',
      cancel: 'Cancel', saveChanges: 'Save Changes', createUser: 'Create User',
    },
    deleteModal: {
      confirmText: 'Delete {name}?',
      warning: 'This action cannot be undone. The user will lose all access.',
      cancel: 'Cancel', deleteUser: 'Delete User',
    },
    errors: {
      loadUsers: 'Error loading users',
      passwordRequired: 'Password is required',
      updateError: 'Update error',
      createError: 'Creation error',
      generic: 'Error',
      deleteError: 'Deletion error',
      photoTooLarge: 'Image is too large (max 2MB)',
      photoUpdateError: 'Error updating photo',
    },
  },
  ar: {
    title: 'إدارة المستخدمين', subtitle: 'أدر مستخدمي النظام وأدوارهم وصلاحياتهم', addUser: 'إضافة مستخدم',
    stats: {
      totalUsers: 'إجمالي المستخدمين', totalUsersSub: 'جميع الحسابات',
      active: 'نشطون', activeSub: 'تسجيل دخول حديث',
      admins: 'المسؤولون', adminsSub: 'وصول كامل',
      roles: 'الأدوار', rolesSub: 'مسؤول · مدير · مُدمج',
    },
    toolbar: { searchPlaceholder: 'ابحث بالاسم أو البريد الإلكتروني...', allRoles: 'جميع الأدوار', allStatus: 'جميع الحالات' },
    table: { user: 'المستخدم', role: 'الدور', permissions: 'الصلاحيات', status: 'الحالة', lastLogin: 'آخر تسجيل دخول', created: 'تاريخ الإنشاء', actions: 'الإجراءات' },
    status: { active: 'نشط', inactive: 'غير نشط' },
    actions: { edit: 'تعديل', disable: 'تعطيل', enable: 'تفعيل', delete: 'حذف' },
    photo: { change: 'تغيير الصورة' },
    empty: 'لا يوجد مستخدمون مطابقون لبحثك.',
    modal: {
      editTitle: 'تعديل المستخدم', addTitle: 'إضافة مستخدم جديد',
      firstName: 'الاسم الشخصي', firstNamePlaceholder: 'الاسم الشخصي',
      lastName: 'الاسم العائلي', lastNamePlaceholder: 'الاسم العائلي',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور', passwordPlaceholder: 'حدد كلمة المرور الأولية',
      role: 'الدور', status: 'الحالة',
      permissions: 'الصلاحيات',
      cancel: 'إلغاء', saveChanges: 'حفظ التعديلات', createUser: 'إنشاء المستخدم',
    },
    deleteModal: {
      confirmText: 'حذف {name}؟',
      warning: 'لا يمكن التراجع عن هذا الإجراء. سيفقد المستخدم كل الصلاحيات.',
      cancel: 'إلغاء', deleteUser: 'حذف المستخدم',
    },
    errors: {
      loadUsers: 'خطأ في تحميل المستخدمين',
      passwordRequired: 'كلمة المرور مطلوبة',
      updateError: 'خطأ في التحديث',
      createError: 'خطأ في الإنشاء',
      generic: 'خطأ',
      deleteError: 'خطأ في الحذف',
      photoTooLarge: 'الصورة كبيرة جدًا (الحد الأقصى 2 ميجابايت)',
      photoUpdateError: 'خطأ في تحديث الصورة',
    },
  },
};
