'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onLoadingComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 3 seconds (increased from 2)
    const timer = setTimeout(() => {
      setIsVisible(false);
      onLoadingComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.splashContainer}>
      <div className={styles.splashContent}>
        <div className={styles.logoWrapper}>
          <Image
            src="/assets/svg/logo.svg"
            alt="GesturePro logo"
            width={240}
            height={67}
            priority
          />
        </div>
      </div>
    </div>
  );
} 