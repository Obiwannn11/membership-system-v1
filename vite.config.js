import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        VitePWA({
            registerType: 'autoUpdate',
            outDir: 'public/build', // Simpan hasil build di folder public Laravel
            manifest: {
                name: 'Membership App',
                short_name: 'MemberApp',
                description: 'Aplikasi Manajemen Membership Offline-First',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone', // Agar tampil seperti aplikasi native (tanpa address bar)
                icons: [
                    {
                        src: '/logo-192.png', // Kita harus siapkan gambar ini nanti
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/logo-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                // Pola file yang akan disimpan di cache (Offline)
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Pastikan dia membersihkan cache lama
                cleanupOutdatedCaches: true,
                // Arahkan navigasi offline ke index
                navigateFallback: null 
            }
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'), // Alias @ menunjuk ke folder JS Laravel
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
