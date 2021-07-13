import React from "react";
import { useI18n } from "next-localization";
import QuestionDropdown from "./QuestionDropdown";
import Button from "./QuestionButton";
import styles from "./QuestionFormImportExistingData.module.scss";

const QuestionFormImportExistingData = (): JSX.Element => {
  const i18n = useI18n();
  const mockOptions = [
    { label: "toimipiste 1" },
    { label: "toimipiste 2" },
    { label: "jne ..." }
  ];
  return (
    <div className={styles.mainContainer}>
      {/* {i18n.t("questions.infos" as string)} */}
      <p>ph: kopioi samassa osoitteessa olevan toimipisteen tiedot</p>
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
