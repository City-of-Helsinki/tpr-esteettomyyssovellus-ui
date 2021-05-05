// this files code from marketing project: needs editing -> google.coms

import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import { Footer as HdsFooter, IconArrowRight, IconArrowUp } from "hds-react";
import styles from "./Footer.module.scss";

const Footer = (): ReactElement => {
  const i18n = useI18n();

  return (
    <HdsFooter korosType="basic" className={styles.footer} title={i18n.t("common.footer.title")}>
      <HdsFooter.Navigation variant="minimal">
        <HdsFooter.Item as="a" href="www.google.com" label={i18n.t("common.footer.contact")} icon={<IconArrowRight aria-hidden />} />
        <HdsFooter.Item as="a" href="#content" label={i18n.t("common.footer.backToTop")} icon={<IconArrowUp aria-hidden />} />
      </HdsFooter.Navigation>
      <HdsFooter.Base copyrightHolder={i18n.t("common.footer.copyright")} copyrightText={i18n.t("common.footer.rightsReserved")}>
        <HdsFooter.Item as="a" href="www.google.com" label={i18n.t("common.footer.terms")} />
        <HdsFooter.Item as="a" href="www.google.com" label={i18n.t("common.footer.accessibility")} />
      </HdsFooter.Base>
    </HdsFooter>
  );
};

export default Footer;
