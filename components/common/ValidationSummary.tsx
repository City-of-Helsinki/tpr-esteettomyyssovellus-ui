import React, { ReactElement, useEffect, useRef } from "react";
import { useI18n } from "next-localization";
import { Link as HdsLink, Notification as HdsNotification } from "hds-react";
import { Validation } from "../../types/general";
import styles from "./ValidationSummary.module.scss";

interface ValidationSummaryProps {
  pageValid: boolean;
  validationSummary: Validation[];
  validationTime?: number;
}

const ValidationSummary = ({ pageValid, validationSummary, validationTime }: ValidationSummaryProps): ReactElement => {
  const i18n = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  // The validationTime value can be updated to force the summary to be scrolled into view if already visible
  useEffect(() => {
    if (ref.current) {
      window.scrollTo(0, 0);
      ref.current.scrollIntoView();
      ref.current.focus();
    }
  }, [pageValid, validationTime]);

  return (
    <div className={styles.validationSummary} ref={ref} tabIndex={-1}>
      <HdsNotification size="default" className="formNotification" type="error" label={i18n.t("common.message.validationFailed.title")}>
        <div>{i18n.t("common.message.validationFailed.message")}</div>

        <div className={styles.linkContainer}>
          {validationSummary
            .filter((validation) => !validation.valid)
            .map((validation) => {
              const { fieldId, fieldLabel, message } = validation;
              return (
                <div key={fieldId}>
                  <HdsLink href={`#${fieldId}`} size="M" disableVisitedStyles>
                    {fieldLabel}
                  </HdsLink>
                  <span>{` - ${message}`}</span>
                </div>
              );
            })}
        </div>
      </HdsNotification>
    </div>
  );
};

export default ValidationSummary;
