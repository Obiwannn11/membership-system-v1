import api from '@/lib/axios';
import { toast } from 'vue-sonner';

export const adminService = {
    
    // Cek koneksi sebelum request
    checkConnection() {
        if (!navigator.onLine) {
            toast.warning('Koneksi Diperlukan', {
                description: 'Fitur admin membutuhkan koneksi internet yang stabil.'
            });
            return false;
        }
        return true;
    },

    // GET ALL ADMINS
    async getAll() {
        if (!this.checkConnection()) return [];
        
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            toast.error('Gagal memuat data admin');
            throw error;
        }
    },

    // GET SINGLE ADMIN
    async get(id) {
        if (!this.checkConnection()) return null;
        
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch admin:', error);
            toast.error('Gagal memuat data admin');
            throw error;
        }
    },

    // CREATE ADMIN
    async create(data) {
        if (!this.checkConnection()) return null;
        
        try {
            const response = await api.post('/users', data);
            toast.success('Admin berhasil dibuat');
            return response.data;
        } catch (error) {
            console.error('Failed to create admin:', error);
            toast.error('Gagal membuat admin', {
                description: error.response?.data?.message || 'Cek data yang diinput.'
            });
            throw error;
        }
    },

    // UPDATE ADMIN
    async update(id, data) {
        if (!this.checkConnection()) return null;
        
        try {
            const response = await api.put(`/users/${id}`, data);
            toast.success('Admin berhasil diperbarui');
            return response.data;
        } catch (error) {
            console.error('Failed to update admin:', error);
            toast.error('Gagal memperbarui admin');
            throw error;
        }
    },

    // DELETE ADMIN
    async delete(id) {
        if (!this.checkConnection()) return false;
        
        try {
            await api.delete(`/users/${id}`);
            toast.success('Admin berhasil dihapus');
            return true;
        } catch (error) {
            console.error('Failed to delete admin:', error);
            toast.error('Gagal menghapus admin');
            throw error;
        }
    }
};