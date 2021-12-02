import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import { Footer as HdsFooter, IconAngleRight, IconArrowUp } from "hds-react";
import { ACCESSIBILITY_URL, TERMS_URL } from "../../types/constants";
import styles from "./Footer.module.scss";

const Footer = (): ReactElement => {
  const i18n = useI18n();

  return (
    <HdsFooter korosType="storm" className={styles.footer} title={i18n.t("common.footer.title")}>
      <HdsFooter.Navigation variant="minimal">
        <div className={styles.tprlogoContainer} aria-hidden>
          <div className={styles.tprlogo} />
          <h2 title="tpr logo" role="img">
            {i18n.t("common.footer.logotext")}
          </h2>
        </div>
        <HdsFooter.Item as="a" href="#content" label={i18n.t("common.footer.backToTop")} icon={<IconArrowUp aria-hidden />} />
      </HdsFooter.Navigation>
      <HdsFooter.Base copyrightHolder={i18n.t("common.footer.copyright")} copyrightText={i18n.t("common.footer.rightsReserved")}>
        <HdsFooter.Item
          as="a"
          href={ACCESSIBILITY_URL}
          label={i18n.t("common.footer.accessibility")}
          icon={<IconAngleRight aria-hidden role="link" />}
        />
        <HdsFooter.Item as="a" href={TERMS_URL} label={i18n.t("common.footer.terms")} icon={<IconAngleRight aria-hidden />} role="link" />
      </HdsFooter.Base>
    </HdsFooter>
  );
};

export default Footer;
