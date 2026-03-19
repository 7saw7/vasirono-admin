import styles from "./CartaSection.module.css";
import { CARTA_CONFIG } from "./carta.config";

export default function CartaSection() {
  return (
    <section id="carta" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.paperGlow} />

          <div className={styles.head}>
            <span className={styles.badge}>{CARTA_CONFIG.badge}</span>
            <h2 className={styles.heading}>{CARTA_CONFIG.heading}</h2>
          </div>

          <div className={styles.body}>
            {CARTA_CONFIG.paragraphs.map((paragraph, i) => (
              <p key={i} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className={styles.footer}>
            <span className={styles.signature}>{CARTA_CONFIG.signature}</span>
          </div>
        </div>
      </div>
    </section>
  );
}