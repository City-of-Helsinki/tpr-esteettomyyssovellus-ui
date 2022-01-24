import { IconTrash } from "hds-react";
import { useI18n } from "next-localization";
import QuestionButton from "./QuestionButton";
import { ServicepointLandingSummaryCtrlButtonsProps } from "../types/general";
import styles from "./ServicepointLandingSummaryCtrlButtons.module.scss";

// usage: control buttons for ServicepointLandingSummary
const ServicepointLandingSummaryCtrlButtons = ({ hasData }: ServicepointLandingSummaryCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  return (
    <div className={styles.maincontainer}>
      <QuestionButton variant="secondary">{i18n.t("servicepoint.buttons.mainCtrlReturn")}</QuestionButton>
      {hasData ? (
        <>
          <QuestionButton variant="primary">{i18n.t("servicepoint.buttons.editServicepoint")}</QuestionButton>
          <QuestionButton variant="primary" iconLeft={<IconTrash />}>
            {i18n.t("servicepoint.buttons.mainCtrlDelete")}
          </QuestionButton>
        </>
      ) : null}
    </div>
  );
};

export default ServicepointLandingSummaryCtrlButtons;
