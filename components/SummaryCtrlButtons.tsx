import { ButtonVariant, IconTrash } from "hds-react";
import { useI18n } from "next-localization";
import QuestionButton from "./QuestionButton";
import { SummaryCtrlButtonsProps } from "../types/general";
import styles from "./SummaryCtrlButtons.module.scss";

// usage: control buttons for ServicepointLandingSummary
function SummaryCtrlButtons({ hasData }: SummaryCtrlButtonsProps): JSX.Element {
  const i18n = useI18n();
  return (
    <div className={styles.maincontainer}>
      <QuestionButton variant={ButtonVariant.Secondary}>{i18n.t("servicepoint.buttons.mainCtrlReturn")}</QuestionButton>
      {hasData ? (
        <>
          <QuestionButton variant={ButtonVariant.Primary}>{i18n.t("servicepoint.buttons.editServicepoint")}</QuestionButton>
          <QuestionButton variant={ButtonVariant.Primary} iconStart={<IconTrash />}>
            {i18n.t("servicepoint.buttons.mainCtrlDelete")}
          </QuestionButton>
        </>
      ) : null}
    </div>
  );
}

export default SummaryCtrlButtons;
