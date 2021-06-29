import { IconAngleDown, IconAngleUp } from "hds-react";
import React, { useState } from "react";
import QuestionAdditionalInfoCtrlButton from "./QuestionAdditionalInfoCtrlButton";
import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import styles from "./QuestionBlock.module.scss";
import QuestionInfo from "./QuestionInfo";
import QuestionsList from "./QuestionsList";
import { QuestionBlockProps } from "../types/general";

const QuestionBlock = ({ description, questions, answers }: QuestionBlockProps): JSX.Element => {
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const handleAdditionalInfoToggle = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };
  return (
    <>
      <div className={styles.mainInfo}>
        <p>{description ?? null}</p>
        <QuestionInfo
          openText="PH: näytä lisää pääsisäänkäynnin kulkureiteistä?"
          openIcon={<IconAngleDown aria-hidden />}
          closeText="PH: pienennä ohje"
          closeIcon={<IconAngleUp aria-hidden />}
        >
          PH: tähän LISÄpääinfot jostain tähän LISÄpääinfot jostain tähän
        </QuestionInfo>
      </div>

      <div className={styles.importAddinfoContainer}>
        {/* TODO: maybe add checking if should exist on all headline accs */}
        <QuestionFormImportExistingData />
        {/* TODO: add here prop for question number for additional */}
        <QuestionAdditionalInfoCtrlButton curState={showAdditionalInfo} onClick={handleAdditionalInfoToggle} />
      </div>
      {/* TODO: add questions as params to QuestionsList, from fetch data */}
      <QuestionsList additionalInfoVisible={showAdditionalInfo} questions={questions} answers={answers} />
    </>
  );
};

export default QuestionBlock;
