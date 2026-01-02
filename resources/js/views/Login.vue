<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-100">
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Login Admin</CardTitle>
        <CardDescription>Masuk untuk mengelola member.</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin">
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" v-model="form.email" placeholder="admin@mail.com" required />
            </div>
            
            <div class="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" v-model="form.password" required />
            </div>

            <div v-if="auth.error" class="text-red-500 text-sm font-medium">
                {{ auth.error }}
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
             <Button class="w-full" type="submit" :disabled="auth.loading">
                {{ auth.loading ? 'Memproses...' : 'Masuk' }}
             </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const auth = useAuthStore();

// State Lokal untuk form input
const form = reactive({
    email: '',
    password: ''
});

const handleLogin = () => {
    auth.login(form);
};
</script>