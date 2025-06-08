"use client";
import { useState, useEffect } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Download, Close, PhoneIphone } from '@mui/icons-material';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (showInstallBanner) {
      document.body.style.paddingTop = '70px';
      document.body.style.transition = 'padding-top 0.3s ease-out';
    } else {
      document.body.style.paddingTop = '0px';
    }

    return () => {
      document.body.style.paddingTop = '0px';
    };
  }, [showInstallBanner]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showInstallBanner) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        background: 'linear-gradient(135deg, #3359C6 0%, #2847A3 100%)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: '0 2px 12px rgba(51, 89, 198, 0.3)',
        animation: 'slideDown 0.3s ease-out',
        '@keyframes slideDown': {
          from: {
            transform: 'translateY(-100%)',
            opacity: 0,
          },
          to: {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PhoneIphone sx={{ fontSize: 20 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            fontSize: '14px',
            lineHeight: 1.2,
            marginBottom: '2px'
          }}
        >
          Install GesturePro
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            opacity: 0.9,
            fontSize: '12px',
            lineHeight: 1.2
          }}
        >
          Get the full app experience.
        </Typography>
      </Box>

      <Button
        onClick={handleInstallClick}
        variant="contained"
        size="small"
        startIcon={<Download sx={{ fontSize: 16 }} />}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '20px',
          padding: '6px 12px',
          minWidth: 'auto',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      >
        Install
      </Button>

      <IconButton
        onClick={handleDismiss}
        size="small"
        sx={{
          color: 'white',
          opacity: 0.8,
          padding: '4px',
          '&:hover': {
            opacity: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Close sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
} 