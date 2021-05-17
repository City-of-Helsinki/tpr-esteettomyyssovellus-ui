import React, { useState } from "react";
import { IconInfoCircle, IconCrossCircle } from "hds-react";
import styles from "./QuestionContainer.module.scss";
import { QuestionContainerProps } from "../types/general";
import QuestionInfo from "./QuestionInfo";
import QuestionAdditionalInformation from "./QuestionAdditionalInformation";

// used for wrapping question text and additional infos with question 'data component' e.g. dropdown
const QuestionContainer = ({
  questionNumber,
  questionText,
  questionInfo,
  children,
  hasAdditionalInfo,
  backgroundColor,
}: QuestionContainerProps): JSX.Element => {
  const [showInfoText, setInfoTextVisibility] = useState(false);
  const handleToggleInfo = () => {
    setInfoTextVisibility(!showInfoText);
  };

  return (
    <div className={styles.maincontainer} style={{ backgroundColor }}>
      <div className={styles.questioncontainer}>
        <div className={styles.maintext}>
          <p>
            {questionNumber} {questionText}
          </p>
          {questionInfo ? (
            <QuestionInfo
              questionInfo={questionInfo}
              showInfoText={showInfoText}
              clickHandler={handleToggleInfo}
              openText="PH: mitä tämä tarkoittaa?"
              openIcon={<IconInfoCircle aria-hidden />}
              closeText="PH: sulje ohje"
              closeIcon={<IconCrossCircle aria-hidden />}
              textOnBottom
            />
          ) : null}
        </div>
        <div className={styles.children}>{children}</div>
        {hasAdditionalInfo ? <QuestionAdditionalInformation /> : null}
      </div>
    </div>
  );
};

export default QuestionContainer;
