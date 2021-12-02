import React from "react";
import { IconPlusCircle, IconCrossCircle } from "hds-react";
import { useI18n } from "next-localization";
import Button from "./QuestionButton";
import { QuestionAdditionalInfoCtrlButtonProps } from "../types/general";
import styles from "./QuestionAdditionalInfoCtrlButton.module.scss";

// usage: button to handle visibility of additional info buttons on questions, this toggles those
const QuestionAdditionalInfoCtrlButton = ({
  onClick,
  curState,
}: QuestionAdditionalInfoCtrlButtonProps): JSX.Element => {
  const i18n = useI18n();
  return (
    <>
      {!curState ? (
        <div className={styles.container}>
          <Button
            variant="secondary"
            iconRight={<IconPlusCircle />}
            onClickHandler={onClick}
          >
            {i18n.t("QuestionFormImportExistingData.addAdditionalInfo")}
          </Button>
        </div>
      ) : (
        <div className={styles.container}>
          <Button
            variant="secondary"
            iconRight={<IconCrossCircle />}
            onClickHandler={onClick}
          >
            {i18n.t("QuestionFormImportExistingData.hideAddButtons")}
          </Button>
        </div>
      )}
    </>
  );
};

export default QuestionAdditionalInfoCtrlButton;
