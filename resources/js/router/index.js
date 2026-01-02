import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Import Store

import MainLayout from '@/components/layout/MainLayout.vue';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import MemberList from '@/views/MemberList.vue';
import MemberCreate from '@/views/MemberCreate.vue';
import MemberEdit from '@/views/MemberEdit.vue';


const routes = [
    // 1. Route LOGIN (Tanpa Layout / Full Screen)
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guest: true }
    },

    // 2. Route UTAMA (Menggunakan MainLayout)
    {
        path: '/',
        component: MainLayout, // Wrapper Layout
        meta: { requiresAuth: true },
        children: [
            {
                path: '', // Default (Dashboard)
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: 'members', // /members
                name: 'MemberList',
                component: MemberList
            },
            {
                path: 'members/create', // /members/create
                name: 'MemberCreate',
                component: MemberCreate
            },
            {
                path: 'members/:id/edit',
                name: 'MemberEdit',
                component: MemberEdit
            },
            // Route Profile
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue') // Lazy load
            },

            // Route Kelola Admin (Dengan Guard sederhana)
            {
                path: 'admins',
                name: 'AdminList',
                component: () => import('@/views/AdminList.vue'),
                beforeEnter: (to, from, next) => {
                    const auth = useAuthStore();
                    if (auth.user?.role !== 'super_admin') {
                        alert('Akses Ditolak');
                        next('/');
                    } else {
                        next();
                    }
                }
            },
            {
                path: 'admins/create',
                name: 'AdminCreate',
                component: () => import('@/views/AdminCreate.vue')
            },
            {
                path: 'admins/:id/edit',
                name: 'AdminEdit',
                component: () => import('@/views/AdminEdit.vue')
            },
        ]
    },
    
    // Catch all 404 handled by Laravel fallback mostly, but good to have wildcard here too for Vue
    { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Penjaga Pintu (Navigation Guard)
router.beforeEach((to, from, next) => {
    const auth = useAuthStore();
    
    // 1. Jika halaman butuh login TAPI user belum login -> Tendang ke Login
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next('/login');
    }
    // 2. Jika user sudah login TAPI mau ke halaman Login -> Tendang ke Dashboard
    else if (to.meta.guest && auth.isAuthenticated) {
        next('/');
    }
    // 3. Lanjut boleh lewat
    else {
        next();
    }
});

export default router;