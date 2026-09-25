import { getWikimediaThumbnail } from "@/app/lib/wikimedia";
import artworkPlaceholders from "@/generated/artwork-placeholders.json";

const PRELOADER_IMAGE_WIDTH = 500;

const artworks = [
  {
    slug: "the-creation-of-adam",
    title: "The Creation of Adam",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/2560px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
  },
  {
    slug: "dance-at-the-moulin-de-la-galette",
    title: "Dance at the Moulin de la Galette",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Mus%C3%A9e_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg/2560px-Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Mus%C3%A9e_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg",
  },
  {
    slug: "impression-sunrise",
    title: "Impression, Sunrise",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/2560px-Monet_-_Impression%2C_Sunrise.jpg",
  },
  {
    slug: "the-garden-of-earthly-delights",
    title: "The Garden of Earthly Delights",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/The_Garden_of_earthly_delights.jpg/2880px-The_Garden_of_earthly_delights.jpg",
  },
  {
    slug: "nighthawks",
    title: "Nighthawks",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/2560px-Nighthawks_by_Edward_Hopper_1942.jpg",
  },
  {
    slug: "the-last-supper",
    title: "The Last Supper",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/%C3%9Altima_Cena_-_Da_Vinci_5.jpg/2880px-%C3%9Altima_Cena_-_Da_Vinci_5.jpg",
  },
  {
    slug: "la-grande-odalisque",
    title: "La Grande Odalisque",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Jean_Auguste_Dominique_Ingres%2C_La_Grande_Odalisque%2C_1814.jpg/2560px-Jean_Auguste_Dominique_Ingres%2C_La_Grande_Odalisque%2C_1814.jpg",
  },
  {
    slug: "the-third-of-may-1808",
    title: "The Third of May 1808",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/El_Tres_de_Mayo%2C_by_Francisco_de_Goya%2C_from_Prado_thin_black_margin.jpg/2560px-El_Tres_de_Mayo%2C_by_Francisco_de_Goya%2C_from_Prado_thin_black_margin.jpg",
  },
  {
    slug: "guernica",
    title: "Guernica",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/PicassoGuernica.jpg/500px-PicassoGuernica.jpg",
  },
  {
    slug: "starry-night",
    title: "Starry Night",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/2560px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
  },
  {
    slug: "the-birth-of-venus",
    title: "The Birth of Venus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/2560px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
  },
  {
    slug: "the-milkmaid",
    title: "The Milkmaid",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg/3840px-Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg",
  },
];

export const PRELOADER_ARTWORKS = artworks.map((artwork) => ({
  ...artwork,
  image: getWikimediaThumbnail(artwork.image, PRELOADER_IMAGE_WIDTH),
  blurDataURL: artworkPlaceholders[artwork.slug]?.blurDataURL,
}));
