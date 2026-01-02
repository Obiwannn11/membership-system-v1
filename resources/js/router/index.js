import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import MemberList from '@/views/MemberList.vue';
import MemberCreate from '@/views/MemberCreate.vue';
import { useAuthStore } from '@/stores/auth'; // Import Store

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guest: true } // Penanda halaman tamu
    },
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true } // Penanda halaman butuh login
    },
    {
    path: '/members',
    name: 'MemberList',
    component: MemberList,
    meta: { requiresAuth: true }
    },
    {
    path: '/members/create',
    name: 'MemberCreate',
    component: MemberCreate,
    meta: { requiresAuth: true }
},
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