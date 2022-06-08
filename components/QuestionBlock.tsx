import { IconAngleDown, IconAngleUp } from "hds-react";
import React, { useEffect } from "react";
import { useI18n } from "next-localization";
import TextWithLinks from "./common/TextWithLinks";
import QuestionBlockComment from "./QuestionBlockComment";
import QuestionBlockExtraFieldList from "./QuestionBlockExtraFieldList";
import QuestionBlockLocationPhoto from "./QuestionBlockLocationPhoto";
import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import QuestionInfo from "./QuestionInfo";
import QuestionsList from "./QuestionsList";
import { QuestionBlockProps } from "../types/general";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { setFinished, unsetFinished } from "../state/reducers/formSlice";
import styles from "./QuestionBlock.module.scss";

// usage: in form groups up all questions under a single "question block" / accordion
// notes: used under headlineQuestionContainer in main form
const QuestionBlock = ({ block, questions, answerChoices, extraFields, accessibilityPlaces }: QuestionBlockProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  // const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  // const [showContinue, setShowContinue] = useState(!isContinueClicked);

  const { question_block_id, description, photo_url, photo_text, put_fields_before_questions, add_location_possible, add_photo_possible } = block;

  // todo: what is this onClick? Seems obsolete?
  /*
  const onClick = () => {
    dispatch(setContinue());
    setShowContinue(false);
    // TODO: route to main form
    // window.location.reload(false)
  };
  */

  // const blockId = questions && questions.length > 0 && questions[0].question_block_id !== undefined ? questions[0].question_block_id : -1;
  const blockId = question_block_id;
  const hasInfoAndButtons = questions && questions.length > 0 ? blockId !== 0 : true;
  const putFieldsBeforeQuestions = put_fields_before_questions === "Y";
  const canAddLocation = add_location_possible === "Y";
  const canAddPhoto = add_photo_possible === "Y";
  // const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const curAnsweredChoices = Object.values(curAnswers);
  // const continueActive = curAnsweredChoices.length !== 0;
  const keys = Object.keys(curAnswers);

  // filter questions to get only correct ones with curAnsweredChoices
  const filteredQuestions = questions
    ? questions.filter(
        (question) =>
          question.visible_if_question_choice === null ||
          question.visible_if_question_choice?.split("+").some((elem) => curAnsweredChoices.includes(Number(elem)))
      )
    : undefined;

  useEffect(() => {
    // check if block is finished (all visible questions are answered), also used to display icon if finished and with validation
    const blockFinished = filteredQuestions?.every((element) => {
      return element.question_id ? keys.includes(element.question_id.toString()) : false;
    });

    if (blockFinished) {
      dispatch(setFinished(blockId));
    } else {
      dispatch(unsetFinished(blockId));
    }
  }, [blockId, filteredQuestions, keys, dispatch]);

  // Turn "<BR>" to linebreaks
  const desc = description?.split("<BR>");
  const photoText = photo_text?.split("<BR>");

  return (
    <>
      {hasInfoAndButtons ? (
        <div className={styles.mainInfo}>
          {desc?.map((text, index) => {
            const key = `br_${index}`;
            return <TextWithLinks key={key} text={text} />;
          })}

          {(photo_text || photo_url) && (
            <QuestionInfo
              openText={i18n.t("common.questionBlockShowMoreMainEntrance")}
              openIcon={<IconAngleDown aria-hidden />}
              closeText={i18n.t("common.hideInfo")}
              closeIcon={<IconAngleUp aria-hidden />}
            >
              <div className={styles.infoContainer}>
                {photo_url && (
                  <div>
                    <img alt={photo_text ?? ""} src={photo_url} className={styles.infoPicture} />
                  </div>
                )}
                {photoText?.map((text, index) => {
                  const key = `br_${index}`;
                  return <TextWithLinks key={key} text={text} />;
                })}
              </div>
            </QuestionInfo>
          )}

          <div className={styles.importAddinfoContainer}>
            <QuestionFormImportExistingData />
          </div>
        </div>
      ) : (
        <div>
          <p>{i18n.t("accessibilityForm.generalInfo1")}</p>
          <p>{i18n.t("accessibilityForm.generalInfo2")}</p>
        </div>
      )}

      {putFieldsBeforeQuestions && <QuestionBlockExtraFieldList extraFields={extraFields} />}

      {(canAddLocation || canAddPhoto) && <QuestionBlockLocationPhoto block={block} canAddLocation={canAddLocation} canAddPhoto={canAddPhoto} />}

      {/* QtionList loops the single question row(s) */}
      <QuestionsList questions={filteredQuestions} answerChoices={answerChoices} accessibilityPlaces={accessibilityPlaces} />

      {!putFieldsBeforeQuestions && <QuestionBlockExtraFieldList extraFields={extraFields} />}

      {blockId > 0 && <QuestionBlockComment block={block} />}

      {/*hasInfoAndButtons || !showContinue ? null : (
        <div className={styles.continueButton}>
          <Button variant="primary" iconRight={<IconArrowRight />} onClick={onClick} disabled={!continueActive}>
            {i18n.t("accessibilityForm.continue")}
          </Button>
        </div>
      )*/}
    </>
  );
};

export default QuestionBlock;
