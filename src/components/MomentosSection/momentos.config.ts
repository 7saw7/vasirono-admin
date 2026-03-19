export type MomentoItem = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  image: string;
};

export const MOMENTOS_CONFIG = {
  badge: "Nuestros momentos",
  heading: "Recuerdos que siguen latiendo fuerte dentro de mí.",
  intro:
    "Hay instantes que no se quedan solo en la memoria, sino también en el corazón. Cada etapa contigo tuvo algo especial, algo que convirtió lo cotidiano en una historia hermosa para recordar.",

  items: [
    {
      id: "momento-1",
      kicker: "Bajo la noche",
      title: "Esa noche en la playa quedó guardada como un recuerdo muy especial.",
      text:
        "No era solo el lugar ni la oscuridad tranquila alrededor, eras tú a mi lado. Ese momento tuvo algo tan bonito y sincero que se quedó viviendo en mí como uno de esos recuerdos que abrazan el corazón.",
      image: "/assets/others/momento1.png",
    },
    {
      id: "momento-2",
      kicker: "Orgullo y admiración",
      title: "Verte en la exposición de la universidad fue uno de esos momentos que me llenaron de orgullo.",
      text:
        "No solo recuerdo ese día por la presentación, sino por lo especial que fue compartirlo contigo. Verte ahí, dando lo mejor de ti, me hizo admirarte aún más y sentirme feliz de acompañarte en esa etapa.",
      image: "/assets/others/momento2.png",
    },
    {
      id: "momento-3",
      kicker: "Después del evento",
      title: "Tras aquel evento en la universidad, también nos regalamos otro recuerdo bonito.",
      text:
        "A veces no hace falta un gran plan para crear algo especial. Estar contigo después de ese momento, compartir la cercanía y quedarnos con esa foto, hizo que todo se sintiera más nuestro y más memorable.",
      image: "/assets/others/momento3.png",
    },
    {
      id: "momento-4",
      kicker: "Entre risas y pasillos",
      title: "Hasta ver ropa en Tottus contigo se volvió un recuerdo hermoso.",
      text:
        "Porque contigo incluso lo más simple tenía algo especial. Caminar, mirar cosas, reírnos y pasar tiempo juntos hacía que cualquier salida se sintiera distinta, más cálida y más feliz.",
      image: "/assets/others/momento4.png",
    },
    {
      id: "momento-5",
      kicker: "En camino contigo",
      title: "Ese momento en el tren también quedó grabado en mi memoria con mucho cariño.",
      text:
        "No era un viaje cualquiera, porque estabas tú. A tu lado, incluso un trayecto sencillo se convertía en algo especial, en uno de esos recuerdos tranquilos pero valiosos que siempre vuelven al corazón.",
      image: "/assets/others/momento5.png",
    },
    {
      id: "momento-6",
      kicker: "Una noche distinta",
      title: "Aquella fiesta también nos dejó un recuerdo bonito entre luces y sonrisas.",
      text:
        "Entre el ambiente, la música y ese instante compartido, quedó una imagen que hoy se siente como parte de nuestra historia. Fue uno de esos momentos en los que simplemente me gustaba estar contigo y disfrutarte.",
      image: "/assets/others/momento6.png",
    },
    {
      id: "momento-7",
      kicker: "Kallpa",
      title: "Nuestro momento en Kallpa también ocupa un lugar muy especial en mis recuerdos.",
      text:
        "Entre luces, gente y el ambiente de esa noche, lo más bonito seguía siendo compartirlo contigo. Hay fotos que no solo capturan un instante, sino también todo lo que uno sentía en ese momento.",
      image: "/assets/others/momento7.png",
    },
    {
      id: "momento-8",
      kicker: "Halloween",
      title: "Halloween contigo fue otro de esos recuerdos únicos que nunca voy a olvidar.",
      text:
        "Fue una noche divertida, distinta y llena de ese encanto que tenían nuestras salidas. Entre disfraces, risas y el momento compartido, quedó un recuerdo que hasta hoy me sigue sacando una sonrisa.",
      image: "/assets/others/mmmomento8.png",
    },
  ] as MomentoItem[],
} as const;