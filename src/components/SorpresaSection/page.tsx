"use client";

import { useState } from "react";
import styles from "./SorpresaSection.module.css";
import { SORPRESA_CONFIG } from "./sorpresa.config";

export default function SorpresaSection() {
  const [revealed, setRevealed] = useState(false);

  return (
    <section id="sorpresa" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <span className={styles.badge}>{SORPRESA_CONFIG.badge}</span>
          <h2 className={styles.heading}>{SORPRESA_CONFIG.heading}</h2>

          <button
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            className={styles.button}
          >
            {SORPRESA_CONFIG.buttonLabel}
          </button>

          <div
            className={`${styles.revealBox} ${
              revealed ? styles.revealBoxVisible : ""
            }`}
          >
            <h3 className={styles.revealTitle}>
              {SORPRESA_CONFIG.revealTitle}
            </h3>
            <p className={styles.revealText}>{SORPRESA_CONFIG.revealText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}