// Composable untuk helper functions terkait member status
export function useMemberStatus() {
  
  // ========== DATE & PHONE FORMATTERS ==========
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'Asia/Makassar'
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('08')) {
      p = '62' + p.substring(1);
    }
    return p;
  };

  const maskPhone = (phone) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length <= 4) return cleaned;
    const lastFour = cleaned.slice(-4);
    const maskedPart = '*'.repeat(cleaned.length - 4);
    return maskedPart + lastFour;
  };

  // ========== MEMBERSHIP STATUS ==========
  const getMembershipStatus = (validUntil) => {
    if (!validUntil) return 'inactive';
    
    const now = new Date();
    const validDate = new Date(validUntil);
    const oneWeekAfter = new Date(validDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const nowMakassar = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
    const validMakassar = new Date(validDate.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
    const oneWeekMakassar = new Date(oneWeekAfter.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
    
    if (nowMakassar <= validMakassar) {
      return 'active';
    } else if (nowMakassar <= oneWeekMakassar) {
      return 'expired';
    } else {
      return 'inactive';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Aktif',
      expired: 'Expired',
      inactive: 'Tidak Aktif'
    };
    return labels[status] || '-';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      expired: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800',
      inactive: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
    };
    return classes[status] || classes.inactive;
  };

  // ========== COUNTDOWN HELPERS ==========
  const getDaysRemaining = (validUntil) => {
    if (!validUntil) return null;
    
    const now = new Date();
    const validDate = new Date(validUntil);
    
    now.setHours(0, 0, 0, 0);
    validDate.setHours(0, 0, 0, 0);
    
    const diffTime = validDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getCountdownText = (validUntil) => {
    const days = getDaysRemaining(validUntil);
    
    if (days === null) return '-';
    if (days > 0) return `${days} hari lagi`;
    if (days === 0) return 'Hari ini';
    return `Lewat ${Math.abs(days)} hari`;
  };

  const getCountdownClass = (validUntil) => {
    const days = getDaysRemaining(validUntil);
    
    if (days === null) return 'text-gray-400';
    if (days > 7) return 'text-green-600';
    if (days > 0) return 'text-orange-600';
    return 'text-red-600';
  };

  // ========== SYNC STATUS HELPERS ==========
  const getSyncBorderClass = (isSynced) => {
    return isSynced 
      ? 'border-l-4 border-l-green-400' 
      : 'border-l-4 border-l-yellow-400';
  };

  return {
    // Formatters
    formatDate,
    formatPhone,
    maskPhone,
    // Status
    getMembershipStatus,
    getStatusLabel,
    getStatusBadgeClass,
    // Countdown
    getDaysRemaining,
    getCountdownText,
    getCountdownClass,
    // Sync
    getSyncBorderClass
  };
}