import React, { useState } from "react";
import { useI18n } from "next-localization";
import { Select } from "hds-react";
import Button from "./QuestionButton";
import { InputOption, QuestionBlockImportProps } from "../types/general";
import styles from "./QuestionBlockImportExistingData.module.scss";

// usage: button for copying data from existing servicepoint
const QuestionBlockImportExistingData = ({ block, copyableEntrances }: QuestionBlockImportProps): JSX.Element => {
  const i18n = useI18n();

  const [selectedOption, setSelectedOption] = useState<InputOption>();

  const copyOptions = copyableEntrances
    .map((copy) => {
      const { copyable_entrance_id, copyable_servicepoint_name } = copy;
      return { value: copyable_entrance_id, label: copyable_servicepoint_name };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleCopy = () => {
    // TODO - copy functionality
    if (selectedOption) {
      console.log("copy from entrance id", selectedOption.value, "block", block.question_block_id);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <p>{i18n.t("common.copyDataFromSameAddress")}</p>
      <div className={styles.inputContainer}>
        <Select
          className={styles.selectDropdown}
          label=""
          placeholder={i18n.t("QuestionFormImportExistingData.chooseServicepoint")}
          options={copyOptions}
          onChange={(selected: InputOption) => setSelectedOption(selected)}
        />
        <Button variant="secondary" onClickHandler={handleCopy}>
          {i18n.t("QuestionFormImportExistingData.bringInformation")}
        </Button>
      </div>
    </div>
  );
};

export default QuestionBlockImportExistingData;
