'use client';

import styles from '@/css/page.module.css';
import InputTest from '@/components/InputTest';

export default function SamplePage() {
  return (
    <main className={styles.main}>
      <h1>Sample Test Page</h1>
      <InputTest />
    </main>
  );
}
