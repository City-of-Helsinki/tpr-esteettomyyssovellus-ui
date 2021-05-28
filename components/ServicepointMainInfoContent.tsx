import { useI18n } from "next-localization";
import { IconClock, IconPenLine, IconPersonWheelchair, IconLinkExternal } from "hds-react";
import styles from "./ServicepointMainInfoContent.module.scss";

const ServicepointMainInfoContent = (): JSX.Element => {
  const i18n = useI18n();
  return (
    <div className={styles.maincontainer}>
      <div className={styles.card}>
        <IconClock />
        <p> PH: Kysymyksiin vastaaminen vie aikaa toimipisteestä ja sisäänkäynnistä riippuen oin 5-15 minuuttia</p>
        <a href="google.com" target="_blank">
          PH: Täyttöohje
          <IconLinkExternal />
        </a>
      </div>
      <div className={styles.card}>
        <IconPenLine />
        <p>
          {" "}
          PH: Voit tallentaa uuden kohteen esteettömyystiedot keskeneräisenä ja jatkaa myöhemmin. Voit myös tutustua ennalta kaikkiin kysymyksiin
        </p>
        <a href="google.com" target="_blank">
          PH: Tutustu kysymyksiin
          <IconLinkExternal />
        </a>
      </div>
      <div className={styles.card}>
        <IconPersonWheelchair />
        <p> PH: Vastausten perusteella muodostuu esteettömyyslauseet suoeksi, ruotiksi ja englanniksi</p>
        <a href="google.com" target="_blank">
          PH: Esteettömyysohje
          <IconLinkExternal />
        </a>
      </div>
    </div>
  );
};

export default ServicepointMainInfoContent;
