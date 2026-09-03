import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import { Footer as HdsFooter, IconArrowUp, IconLinkExternal, Logo, logoFi } from "hds-react";
import { useAppDispatch } from "../../state/hooks";
import { setHelpOpen } from "../../state/reducers/generalSlice";
import { ACCESSIBILITY_URL, TERMS_URL } from "../../types/constants";
import styles from "./Footer.module.scss";

interface FooterProps {
  isSummary?: boolean;
}

const Footer = ({ isSummary }: FooterProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const openHelp = () => {
    dispatch(setHelpOpen(true));
  };

  return (
    <HdsFooter
      korosType="basic"
      className={styles.footer}
      title={i18n.t("common.footer.title")}
      theme={{
        "--footer-background": "var(--color-bus-medium-light)",
      }}
    >
      <HdsFooter.Navigation>
        {!isSummary && (
          <HdsFooter.Link as="a" href="#help" onClick={openHelp} label={i18n.t("common.footer.instructions")} icon={<IconArrowUp aria-hidden />} />
        )}
        <HdsFooter.Link as="a" href="#content" label={i18n.t("common.footer.backToTop")} icon={<IconArrowUp aria-hidden />} />
      </HdsFooter.Navigation>
      <HdsFooter.Base
        copyrightHolder={i18n.t("common.footer.copyright")}
        copyrightText={i18n.t("common.footer.rightsReserved")}
        logo={<Logo src={logoFi} size="medium" alt={i18n.t("common.header.titleAlt")} />}
        backToTopLabel={i18n.t("common.footer.backToTop")}
      >
        <HdsFooter.Link as="div" className={styles.helsinkiLogoItem}>
          <div className={styles.helsinkiLogoContainer}>
            <Logo src={logoFi} size="medium" aria-hidden />
            <span className={styles.helsinkiLogoText}>{i18n.t("common.footer.logotext")}</span>
          </div>
        </HdsFooter.Link>
        <HdsFooter.Link
          as="a"
          href={ACCESSIBILITY_URL}
          target="_blank"
          label={i18n.t("common.footer.accessibility")}
          icon={<IconLinkExternal aria-hidden role="link" />}
        />
        <HdsFooter.Link
          as="a"
          href={TERMS_URL}
          target="_blank"
          label={i18n.t("common.footer.terms")}
          icon={<IconLinkExternal aria-hidden />}
          role="link"
        />
      </HdsFooter.Base>
    </HdsFooter>
  );
};

export default Footer;
