import { defineStore } from 'pinia';
import api from '@/lib/axios';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('auth_token') || null, // Ambil dari storage saat reload
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token, // Mengembalikan true jika token ada
        isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'super_admin'
    },

    actions: {
        async login(credentials) {
            this.loading = true;
            this.error = null;
            
            try {
                // Tembak API Login Laravel
                const response = await api.post('/login', credentials);
                
                // Simpan data ke State Pinia
                this.token = response.data.access_token;
                this.user = response.data.user;

                // Simpan Token ke LocalStorage (agar tidak hilang saat refresh)
                localStorage.setItem('auth_token', this.token);
                
                // Pindah ke Dashboard
                router.push('/');
            } catch (err) {
                this.error = err.response?.data?.message || 'Login gagal.';
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                // Hapus token di server (opsional, tapi disarankan)
                if (this.token) {
                   await api.post('/logout'); 
                }
            } catch (e) {
                console.error(e);
            } finally {
                // Bersihkan data di browser
                this.token = null;
                this.user = null;
                localStorage.removeItem('auth_token');
                router.push('/login');
            }
        },

        // Fungsi untuk mengambil data user (misal saat refresh halaman)
        async fetchUser() {
            if (!this.token) return;
            try {
                const response = await api.get('/user');
                this.user = response.data;
            } catch (error) {
                // Jika token invalid/expired, logout paksa
                this.logout();
            }
        }
    }
});