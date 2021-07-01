import { Button, IconAngleDown, IconAngleUp, IconArrowRight } from "hds-react";
import React, { useState } from "react";
import QuestionAdditionalInfoCtrlButton from "./QuestionAdditionalInfoCtrlButton";
import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import styles from "./QuestionBlock.module.scss";
import QuestionInfo from "./QuestionInfo";
import QuestionsList from "./QuestionsList";
import { QuestionBlockProps } from "../types/general";
import router from "next/router";
import { useAppSelector, useAppDispatch } from "../state/hooks";


const QuestionBlock = ({ description, questions, answers }: QuestionBlockProps): JSX.Element => {
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const handleAdditionalInfoToggle = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };
  const onClick = () => {
    console.log("Continue clicked")
    // TODO: route to main form 
    // window.location.reload(false)
  }
  const hasInfoAndButtons = questions != null ? questions[0].question_block_id != 0 : true;
  let curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const continueActive = curAnsweredChoices.length != 0;
  return (
    <>
      { hasInfoAndButtons ? 
      (<div className={styles.mainInfo}>
        <p>{description ?? null}</p>
        <QuestionInfo
          openText="PH: näytä lisää pääsisäänkäynnin kulkureiteistä?"
          openIcon={<IconAngleDown aria-hidden />}
          closeText="PH: pienennä ohje"
          closeIcon={<IconAngleUp aria-hidden />}
        >
          PH: tähän LISÄpääinfot jostain tähän LISÄpääinfot jostain tähän
        </QuestionInfo>
      </div>) : null}
      { hasInfoAndButtons ? 
      (<div className={styles.importAddinfoContainer}>
        <QuestionFormImportExistingData />
        <QuestionAdditionalInfoCtrlButton curState={showAdditionalInfo} onClick={handleAdditionalInfoToggle} />
      </div>) : <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
                  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
                  nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                   in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
                   pariatur. Excepteur sint occaecat cupi </p>
      }
      {/* TODO: add questions as params to QuestionsList, from fetch data */}
      <QuestionsList additionalInfoVisible={showAdditionalInfo} questions={questions} answers={answers} />
      {hasInfoAndButtons ? null : (
        <Button variant="primary" iconRight={<IconArrowRight />} onClick={onClick} disabled={!continueActive}>
          {"PH: Jatka "}
        </Button>)}
    
    </>
  );
};

export default QuestionBlock;
