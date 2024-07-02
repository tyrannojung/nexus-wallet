'use client';

import styles from '@/css/page.module.css';
import InputTest from '@/components/InputTest';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Test code</h1>
      <InputTest />
    </main>
  );
}
