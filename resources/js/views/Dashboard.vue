<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Dashboard Membership</h1>
    <div class="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader><CardTitle>Total Member</CardTitle></CardHeader>
            <CardContent><p class="text-4xl font-bold">1,204</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Member Baru</CardTitle></CardHeader>
            <CardContent><p class="text-4xl font-bold text-green-600">+45</p></CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Pending Sync</CardTitle></CardHeader>
            <CardContent><p class="text-4xl font-bold text-yellow-600">0</p></CardContent>
        </Card>
    </div>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
</script>