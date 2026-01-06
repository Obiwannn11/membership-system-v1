import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Mapping route name ke label Indonesia
const routeLabels = {
  'Dashboard': 'Dashboard',
  'MemberList': 'Daftar Member',
  'MemberCreate': 'Tambah Member',
  'MemberEdit': 'Edit Member',
  'AdminList': 'Kelola Admin',
  'AdminCreate': 'Tambah Admin',
  'AdminEdit': 'Edit Admin',
  'Profile': 'Profil Saya'
};

// Mapping route name ke parent path (untuk generate breadcrumb hierarchy)
const routeParents = {
  'Dashboard': [],
  'MemberList': [{ name: 'Dashboard', path: '/', label: 'Home' }],
  'MemberCreate': [
    { name: 'Dashboard', path: '/', label: 'Home' },
    { name: 'MemberList', path: '/members', label: 'Daftar Member' }
  ],
  'MemberEdit': [
    { name: 'Dashboard', path: '/', label: 'Home' },
    { name: 'MemberList', path: '/members', label: 'Daftar Member' }
  ],
  'AdminList': [{ name: 'Dashboard', path: '/', label: 'Home' }],
  'AdminCreate': [
    { name: 'Dashboard', path: '/', label: 'Home' },
    { name: 'AdminList', path: '/admins', label: 'Kelola Admin' }
  ],
  'AdminEdit': [
    { name: 'Dashboard', path: '/', label: 'Home' },
    { name: 'AdminList', path: '/admins', label: 'Kelola Admin' }
  ],
  'Profile': [{ name: 'Dashboard', path: '/', label: 'Home' }]
};

export function useBreadcrumb() {
  const route = useRoute();

  const breadcrumbs = computed(() => {
    const routeName = route.name;
    const parents = routeParents[routeName] || [];
    const currentLabel = routeLabels[routeName] || routeName;

    // Build breadcrumb array
    const items = [
      ...parents,
      { 
        name: routeName, 
        path: route.path, 
        label: currentLabel,
        isCurrentPage: true 
      }
    ];

    return items;
  });

  const currentPage = computed(() => {
    return routeLabels[route.name] || route.name || 'Page';
  });

  const canGoBack = computed(() => {
    return breadcrumbs.value.length > 1;
  });

  const parentPath = computed(() => {
    if (breadcrumbs.value.length > 1) {
      return breadcrumbs.value[breadcrumbs.value.length - 2].path;
    }
    return '/';
  });

  const parentLabel = computed(() => {
    if (breadcrumbs.value.length > 1) {
      return breadcrumbs.value[breadcrumbs.value.length - 2].label;
    }
    return 'Back';
  });


  return {
    breadcrumbs,
    currentPage,
    canGoBack,
    parentPath,
    parentLabel,
  };
}