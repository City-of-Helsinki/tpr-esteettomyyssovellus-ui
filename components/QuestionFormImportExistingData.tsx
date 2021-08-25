import React from "react";
import { useI18n } from "next-localization";
import QuestionDropdown from "./QuestionDropdown";
import Button from "./QuestionButton";
import styles from "./QuestionFormImportExistingData.module.scss";

// usage: button for copying data from existing servicepoint, THIS IS NOT IMPLEMENTED YET
const QuestionFormImportExistingData = (): JSX.Element => {
  const i18n = useI18n();
  // todo: get real data from somewhere
  const mockOptions = [
    { label: "toimipiste 1" },
    { label: "toimipiste 2" },
    { label: "jne ..." },
  ];
  return (
    <div className={styles.mainContainer}>
      <p>{i18n.t("common.copyDataFromSameAddress")}</p>
      <div className={styles.inputContainer}>
        <QuestionDropdown
          options={mockOptions}
          placeholder={i18n.t(
            "QuestionFormImportExistingData.chooseServicepoint"
          )}
        />
        <Button variant="secondary">
          {i18n.t("QuestionFormImportExistingData.bringInformation")}
        </Button>
      </div>
    </div>
  );
};

export default QuestionFormImportExistingData;
