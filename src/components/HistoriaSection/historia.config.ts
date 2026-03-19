export type HistoriaBlock = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
};

export const HISTORIA_CONFIG = {
  badge: "Nuestra historia",
  heading: "Lo nuestro nació en un tiempo extraño, pero terminó convirtiéndose en lo más bonito de mi vida.",
  intro:
    "Nos conocimos cuando el mundo parecía detenido, en medio de días inciertos y pantallas de por medio. Y aun así, entre conversaciones, emociones sinceras y momentos que fueron creciendo poco a poco, empezó una historia que hasta hoy sigue significando muchísimo para mí.",

  blocks: [
    {
      id: "universidad-virtual",
      eyebrow: "El comienzo",
      title: "Nos conocimos de una forma inesperada, en plena etapa universitaria y en tiempos de pandemia.",
      text:
        "Todo empezó de manera virtual, cuando quizás nadie imaginaba que una conexión tan real podía nacer a través de una pantalla. En medio de clases, conversaciones y días tan distintos, comenzaste a volverte alguien especial para mí, alguien que poco a poco ocupó un lugar muy importante en mi corazón.",
    },
    {
      id: "primeros-recuerdos",
      eyebrow: "Nuestros primeros momentos",
      title: "Después llegaron los paseos, las salidas y esos recuerdos que empezaron a marcarnos.",
      text:
        "Uno de esos momentos que guardo con más cariño fue Pucusana, porque no solo fue un paseo, fue uno de esos recuerdos que se quedan viviendo dentro del alma. Desde ahí, cada salida, cada lugar compartido y cada instante a tu lado fue haciendo más fuerte esto que estábamos construyendo.",
    },
    {
      id: "vinculo-mas-profundo",
      eyebrow: "Más cerca de ti",
      title: "Con el tiempo, nuestro amor fue creciendo de una manera más profunda y verdadera.",
      text:
        "Nuestra historia siguió avanzando con emoción, con ilusión y con esa sensación de estar descubriendo algo muy especial. Nos fuimos entregando más al cariño, a la confianza y a la cercanía, viviendo momentos que significaron mucho para ambos y que hicieron nuestro vínculo todavía más fuerte.",
    },
    {
      id: "mesesarios",
      eyebrow: "Cada etapa contigo",
      title: "Celebrar nuestros mesesarios siempre fue una forma de recordarnos lo bonito que era seguir eligiéndonos.",
      text:
        "Cada fecha, cada detalle y cada momento vivido juntos tenía algo que me emocionaba de verdad. Me hacía feliz ver cómo seguíamos avanzando como pareja, construyendo recuerdos, compartiendo sueños y sintiendo que lo nuestro seguía creciendo con ternura, emoción y amor sincero.",
    },
    {
      id: "superar-juntos",
      eyebrow: "Lo más valioso",
      title: "Tuvimos momentos difíciles, pero nunca dejamos de intentarlo.",
      text:
        "No todo fue fácil, y justamente por eso valoro tanto lo nuestro. Pasamos por problemas fuertes, por días complicados y por situaciones que pudieron alejarnos, pero aun así seguimos luchando, seguimos volviendo a escogernos y seguimos creyendo en nosotros. Y quizás eso fue lo más importante de todo: que nunca nos cansamos de seguir juntos.",
    },
  ] as HistoriaBlock[],
} as const;