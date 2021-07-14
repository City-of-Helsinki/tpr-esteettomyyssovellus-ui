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
import {
  setContinue,
  setFinished,
  unsetFinished
} from "../state/reducers/formSlice";
import { useI18n } from "next-localization";

const QuestionBlock = ({
  description,
  questions,
  answers,
  photoUrl,
  photoText
}: QuestionBlockProps): JSX.Element => {
  const i18n = useI18n();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showContinue, setShowContinue] = useState(true);
  const handleAdditionalInfoToggle = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };
  const dispatch = useAppDispatch();
  const onClick = () => {
    console.log("Continue clicked");
    dispatch(setContinue());
    setShowContinue(false);
    // TODO: route to main form
    // window.location.reload(false)
  };
  const blockId: number =
    questions != null && questions[0].question_block_id != undefined
      ? questions[0].question_block_id
      : -1;
  const hasInfoAndButtons = questions != null ? blockId != 0 : true;
  let curAnsweredChoices = useAppSelector(
    (state) => state.formReducer.answeredChoices
  );
  const continueActive = curAnsweredChoices.length != 0;

  const filteredQuestions =
    questions != null
      ? questions.filter(
          (question) =>
            question.visible_if_question_choice == null ||
            question.visible_if_question_choice
              ?.split("+")
              // @ts-ignore: TODO:
              .some((elem) => curAnsweredChoices.includes(Number(elem)))
        )
      : null;

  let curAnswers = useAppSelector((state) => state.formReducer.answers);
  let keys = Object.keys(curAnswers);

  const blockFinished = filteredQuestions?.every((element) => {
    return element.question_id
      ? keys.includes(element.question_id.toString())
      : false;
  });

  if (blockFinished) {
    console.log("BLOCK NUMBER " + blockId + " FINISHED");
    dispatch(setFinished(blockId));
  } else {
    dispatch(unsetFinished(blockId));
  }

  // Turn "<BR>" to linebreaks
  const desc = description?.split("<BR>").map((elem) => {
    return <p>{elem}</p>;
  });

  return (
    <>
      {hasInfoAndButtons ? (
        <div className={styles.mainInfo}>
          <p>{desc ?? null}</p>
          {photoText == null && photoUrl == null ? null : (
            <QuestionInfo
              openText="PH: näytä lisää pääsisäänkäynnin kulkureiteistä?"
              openIcon={<IconAngleDown aria-hidden />}
              closeText="PH: pienennä ohje"
              closeIcon={<IconAngleUp aria-hidden />}
            >
              <div className={styles.infoContainer}>
                {photoText != null ? photoText : null}
                {photoUrl != null ? (
                  <img
                    alt="wheelchair parking"
                    src={photoUrl}
                    className={styles.infoPicture}
                  ></img>
                ) : null}
              </div>
            </QuestionInfo>
          )}
        </div>
      ) : null}
      {hasInfoAndButtons ? (
        <div className={styles.importAddinfoContainer}>
          <QuestionFormImportExistingData />
          <QuestionAdditionalInfoCtrlButton
            curState={showAdditionalInfo}
            onClick={handleAdditionalInfoToggle}
          />
        </div>
      ) : (
        <p>
          {" "}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupi{" "}
        </p>
      )}
      {/* TODO: add questions as params to QuestionsList, from fetch data */}
      <QuestionsList
        additionalInfoVisible={showAdditionalInfo}
        questions={filteredQuestions}
        answers={answers}
        isContactQuestionList={false}
      />
      {hasInfoAndButtons || !showContinue ? null : (
        <div className={styles.continueButton}>
          <Button
            variant="primary"
            iconRight={<IconArrowRight />}
            onClick={onClick}
            disabled={!continueActive}
          >
            {i18n.t("accessibilityForm.continue")}
          </Button>
        </div>
      )}
    </>
  );
};

export default QuestionBlock;
