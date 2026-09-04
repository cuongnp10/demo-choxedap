import imgCyclist from "figma:asset/11e51ea09636be86ff19757ecd6df6a099ecaa6d.png";
import imgFavorite from "figma:asset/d44ee4f7c67e8005c7aedad495f2d819d86be9cd.png";
import imgIconMap from "figma:asset/8800c660f23853a36e062a5cba9055fb442305df.png";
import imgIconCalendar from "figma:asset/c8aabdc53c43e4920938ab1d5b577a5f7bd043e2.png";
import imgVerifiedAccount from "figma:asset/68efd1c938c7029b9195ebba05e121ae8aa24ac2.png";
import imgImage8 from "figma:asset/c9daa4804c8134a1fd28006199218ae030046762.png";
import imgImage9 from "figma:asset/609e0c385a685ec4aeef898a08ba272ffa9b6008.png";
import imgImage10 from "figma:asset/7d7126a88d8234a67c6a507d22f99f7d2d9f9e61.png";
import imgImage11 from "figma:asset/b6452b7525cfd18641b93cfe09b71a5096d30592.png";
import imgProductVip from "../assets/product-vip.png";
import { getCloudinaryUrl } from "./cloudinary";

const mockLogoId = "v1772163526/anhavatarvuong_gzeusq.png";
const MOCK_LOGO_URL = getCloudinaryUrl(mockLogoId);

const mockHeroImageId = "v1772165231/9598d90d2e372895ebcfa169659cf75959678482_w8kclu.png";
const MOCK_HERO_URL = getCloudinaryUrl(mockHeroImageId);

const mockAvartaImageId = "550e8400-e29b-41d4-a716-446655440000/avatar.webp";
const MOCK_AVARTA_URL = getCloudinaryUrl(mockAvartaImageId);

const mockProductImageId = "v1772163935/1ed126f879f1d1efab8f4ec2211ac75514d965d5_jctv0d.png";
const MOCK_PRODUCT_URL = getCloudinaryUrl(mockProductImageId);

export const assets = {
  logoHeader: MOCK_LOGO_URL,
  heroSearchIcon: imgCyclist,
  heroBg: [MOCK_HERO_URL, MOCK_HERO_URL, MOCK_HERO_URL],
  favorite: imgFavorite,
  bikes: {
    featured: [MOCK_PRODUCT_URL, MOCK_PRODUCT_URL, MOCK_PRODUCT_URL],
    certified: [MOCK_PRODUCT_URL, MOCK_PRODUCT_URL, MOCK_PRODUCT_URL]
  },
  icons: {
    map: imgIconMap,
    calendar: imgIconCalendar,
    verified: imgVerifiedAccount
  },
  features: [imgImage8, imgImage9, imgImage10, imgImage11],
  bannerAd: MOCK_HERO_URL,
  logoFooter: MOCK_LOGO_URL,
  avatarUser: MOCK_AVARTA_URL,
  productVip: imgProductVip
};
