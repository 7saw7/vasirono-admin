"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "./MomentosSection.module.css";
import { MOMENTOS_CONFIG } from "./momentos.config";

export default function MomentosSection() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>(`[data-momento-card="true"]`);
    const gap = 24;
    const amount = firstCard ? firstCard.offsetWidth + gap : 320;

    track.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="momentos" className={styles.section}>
      <div className={styles.bgGlowA} />
      <div className={styles.bgGlowB} />
      <div className={styles.bgGlowC} />
      <div className={styles.hearts} />

      <div className={styles.container}>
        <div className={styles.head}>
          <span className={styles.badge}>{MOMENTOS_CONFIG.badge}</span>
          <h2 className={styles.heading}>{MOMENTOS_CONFIG.heading}</h2>
          <p className={styles.intro}>{MOMENTOS_CONFIG.intro}</p>
        </div>

        <div className={styles.carouselWrap}>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => scrollByCard("left")}
              aria-label="Ver momentos anteriores"
            >
              ←
            </button>

            <button
              type="button"
              className={styles.navButton}
              onClick={() => scrollByCard("right")}
              aria-label="Ver siguientes momentos"
            >
              →
            </button>
          </div>

          <div className={styles.viewport} ref={trackRef}>
            {MOMENTOS_CONFIG.items.map((item, index) => (
              <article
                key={item.id}
                className={styles.card}
                data-momento-card="true"
              >
                <div className={styles.media}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 86vw, (max-width: 1200px) 46vw, 30vw"
                    className={styles.image}
                    priority={index < 2}
                  />

                  <div className={styles.imageShade} />
                  <div className={styles.imageGlow} />
                  <div className={styles.cardNumber}>
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                </div>

                <div className={styles.content}>
                  <span className={styles.kicker}>{item.kicker}</span>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.text}>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}