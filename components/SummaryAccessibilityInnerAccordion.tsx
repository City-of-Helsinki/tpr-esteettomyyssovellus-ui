import React from "react";
import { useI18n } from "next-localization";
import { Button, Card, useAccordion } from "hds-react";
import styles from "./SummaryAccessibilityInnerAccordion.module.scss";

const SummaryAccessibilityInnerAccordion = ({ children }: { children: JSX.Element }) => {
  const i18n = useI18n();

  const { isOpen, buttonProps, contentProps } = useAccordion({ initiallyOpen: false });

  return (
    <div className={styles.maincontainer}>
      <Button variant="supplementary" size="small" iconRight {...buttonProps}>
        {isOpen ? i18n.t("servicepoint.showLess") : i18n.t("servicepoint.showMore")}
      </Button>
      <Card className={styles.contentcontainer} {...contentProps}>
        {children}
      </Card>
    </div>
  );
};

export default SummaryAccessibilityInnerAccordion;
