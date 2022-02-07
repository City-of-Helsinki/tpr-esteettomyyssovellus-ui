import { Button, IconAngleDown, IconAngleUp, IconArrowRight } from "hds-react";
import React, { useState } from "react";
import { useI18n } from "next-localization";
import QuestionAdditionalInfoCtrlButton from "./QuestionAdditionalInfoCtrlButton";
import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import styles from "./QuestionBlock.module.scss";
import QuestionInfo from "./QuestionInfo";
import QuestionsList from "./QuestionsList";
import { QuestionBlockProps } from "../types/general";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { setContinue, setFinished, unsetFinished } from "../state/reducers/formSlice";

// usage: in form groups up all questions under a single "question block" / accordion
// notes: used under headlineQuestionContainer in main form
const QuestionBlock = ({ description, questions, answers, extraFields, photoUrl, photoText }: QuestionBlockProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  const [showContinue, setShowContinue] = useState(!isContinueClicked);
  const handleAdditionalInfoToggle = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };
  // todo: what is this onClick? Seems obsolete?
  const onClick = () => {
    dispatch(setContinue());
    setShowContinue(false);
    // TODO: route to main form
    // window.location.reload(false)
  };

  const blockId = questions && questions.length > 0 && questions[0].question_block_id !== undefined ? questions[0].question_block_id : -1;
  const hasInfoAndButtons = questions && questions.length > 0 ? blockId !== 0 : true;
  const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const continueActive = curAnsweredChoices.length !== 0;

  // filter questions to get only correct ones with curAnsweredChoices
  const filteredQuestions = questions
    ? questions.filter(
        (question) =>
          question.visible_if_question_choice === null ||
          question.visible_if_question_choice?.split("+").some((elem) => curAnsweredChoices.includes(Number(elem)))
      )
    : null;

  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const keys = Object.keys(curAnswers);

  // check if block is finished (all visible questions are answered), also used to display icon if finished and with validation
  const blockFinished = filteredQuestions?.every((element) => {
    return element.question_id ? keys.includes(element.question_id.toString()) : false;
  });

  if (blockFinished) {
    dispatch(setFinished(blockId));
  } else {
    dispatch(unsetFinished(blockId));
  }

  // Turn "<BR>" to linebreaks
  const desc = description?.split("<BR>").map((elem, index) => {
    const key = `br_${index}`;
    return <p key={key}>{elem}</p>;
  });

  return (
    <>
      {hasInfoAndButtons ? (
        <div className={styles.mainInfo}>
          <p>{desc ?? null}</p>
          {photoText === null && photoUrl === null ? null : (
            <QuestionInfo
              openText={i18n.t("common.questionBlockShowMoreMainEntrance")}
              openIcon={<IconAngleDown aria-hidden />}
              closeText={i18n.t("common.hideInfo")}
              closeIcon={<IconAngleUp aria-hidden />}
            >
              <div className={styles.infoContainer}>
                {photoText !== null ? photoText : null}
                {photoUrl !== null ? <img alt="wheelchair parking" src={photoUrl} className={styles.infoPicture} /> : null}
              </div>
            </QuestionInfo>
          )}
        </div>
      ) : null}
      {hasInfoAndButtons ? (
        <div className={styles.importAddinfoContainer}>
          <QuestionFormImportExistingData />
          <QuestionAdditionalInfoCtrlButton curState={showAdditionalInfo} onClick={handleAdditionalInfoToggle} />
        </div>
      ) : (
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupi
        </p>
      )}

      {/* TODO: add QuestionBlockExtraFieldList component here, using the extraFields prop */}
      {/* TODO: add QuestionBlockLocationPictureContent component here */}

      {/* QtionList loops the single question row(s) */}
      <QuestionsList additionalInfoVisible={showAdditionalInfo} questions={filteredQuestions} answers={answers} />
      {hasInfoAndButtons || !showContinue ? null : (
        <div className={styles.continueButton}>
          <Button variant="primary" iconRight={<IconArrowRight />} onClick={onClick} disabled={!continueActive}>
            {i18n.t("accessibilityForm.continue")}
          </Button>
        </div>
      )}
    </>
  );
};

export default QuestionBlock;
