import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import { Footer as HdsFooter, IconArrowUp, IconLinkExternal, Logo } from "hds-react";
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
    <HdsFooter korosType="storm" className={styles.footer} title={i18n.t("common.footer.title")}>
      <HdsFooter.Navigation variant="minimal">
        {!isSummary && (
          <HdsFooter.Item as="a" href="#help" onClick={openHelp} label={i18n.t("common.footer.instructions")} icon={<IconArrowUp aria-hidden />} />
        )}
        <HdsFooter.Item as="a" href="#content" label={i18n.t("common.footer.backToTop")} icon={<IconArrowUp aria-hidden />} />
      </HdsFooter.Navigation>
      <HdsFooter.Base copyrightHolder={i18n.t("common.footer.copyright")} copyrightText={i18n.t("common.footer.rightsReserved")}>
        <HdsFooter.Item as="div" className={styles.helsinkiLogoItem}>
          <div className={styles.helsinkiLogoContainer} aria-hidden>
            <Logo size="medium" />
            <span className={styles.helsinkiLogoText}>{i18n.t("common.footer.logotext")}</span>
          </div>
        </HdsFooter.Item>
        <HdsFooter.Item
          as="a"
          href={ACCESSIBILITY_URL}
          label={i18n.t("common.footer.accessibility")}
          icon={<IconLinkExternal aria-hidden role="link" />}
        />
        <HdsFooter.Item as="a" href={TERMS_URL} label={i18n.t("common.footer.terms")} icon={<IconLinkExternal aria-hidden />} role="link" />
      </HdsFooter.Base>
    </HdsFooter>
  );
};

export default Footer;
