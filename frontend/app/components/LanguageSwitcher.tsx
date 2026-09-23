'use client';

import React, { useState } from 'react';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value);
    // Future integration: update i18n context here
  };

  return (
    <div className={styles.container}>
      <select 
        value={lang} 
        onChange={handleLangChange}
        className={styles.selectBox}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
      </select>
    </div>
  );
}
