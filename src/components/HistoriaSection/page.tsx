import styles from "./HistoriaSection.module.css";
import { HISTORIA_CONFIG } from "./historia.config";

export default function HistoriaSection() {
  return (
    <section id="historia" className={styles.section}>
      <div className={styles.bgGlowA} />
      <div className={styles.bgGlowB} />
      <div className={styles.bgGlowC} />
      <div className={styles.sparkleA} />
      <div className={styles.sparkleB} />

      <div className={styles.container}>
        <div className={styles.head}>
          <span className={styles.badge}>{HISTORIA_CONFIG.badge}</span>
          <h2 className={styles.heading}>{HISTORIA_CONFIG.heading}</h2>
          <p className={styles.intro}>{HISTORIA_CONFIG.intro}</p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineLine} />

          {HISTORIA_CONFIG.blocks.map((block, index) => (
            <article key={block.id} className={styles.card}>
              <div className={styles.cardDot} />
              <div className={styles.cardInner}>
                <div className={styles.cardIndex}>
                  {(index + 1).toString().padStart(2, "0")}
                </div>

                <span className={styles.eyebrow}>{block.eyebrow}</span>
                <h3 className={styles.cardTitle}>{block.title}</h3>
                <p className={styles.cardText}>{block.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}