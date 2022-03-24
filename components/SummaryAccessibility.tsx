import React from "react";
import { Accordion, IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import SummaryAccessibilityInnerAccordion from "./SummaryAccessibilityInnerAccordion";
import { BackendEntranceSentence, BackendQuestion, BackendQuestionBlock } from "../types/backendModels";
import { LanguageLocales } from "../types/constants";
import { SummaryAccessibilityProps } from "../types/general";
import styles from "./SummaryAccessibility.module.scss";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with SummarySideNavigation
const SummaryAccessibility = ({
  entranceKey,
  sentenceGroup,
  hasData,
  questionsData,
  questionChoicesData,
  questionBlocksData,
  questionAnswerData,
}: SummaryAccessibilityProps): JSX.Element => {
  const i18n = useI18n();
  const curLocaleId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];

  const getSentencesList = () => {
    if (sentenceGroup) {
      return (
        <ul className={styles.sentencelist}>
          {sentenceGroup
            .sort((a: BackendEntranceSentence, b: BackendEntranceSentence) => {
              return a.sentence_order_text.localeCompare(b.sentence_order_text);
            })
            .map((s) => {
              return (
                <li key={`sentence_${s.sentence_id}`} className={styles.sentence}>
                  {s.sentence}
                </li>
              );
            })}
        </ul>
      );
    }
  };

  const getQuestionsAnswersAccordion = () => {
    if (questionBlocksData[entranceKey] && questionsData[entranceKey] && questionChoicesData[entranceKey]) {
      const answeredChoices = questionAnswerData[entranceKey]
        ? questionAnswerData[entranceKey].reduce((acc: number[], a) => {
            const questionId = a.question_id;
            const answer = a.question_choice_id;
            return questionId !== undefined && questionId !== null && answer !== undefined && answer !== null ? [...acc, answer] : acc;
          }, [])
        : [];
      const answers = questionAnswerData[entranceKey]
        ? questionAnswerData[entranceKey].reduce((acc: { [key: number]: number }, a) => {
            const questionId = a.question_id;
            const answer = a.question_choice_id;
            return questionId !== undefined && questionId !== null && answer !== undefined && answer !== null
              ? { ...acc, [questionId]: answer }
              : acc;
          }, [])
        : {};

      const questionsAnswers = questionBlocksData[entranceKey].flatMap((block: BackendQuestionBlock) => {
        const visibleQuestions = block.visible_if_question_choice?.split("+");

        const answersIncludeAllVisibleQuestions = visibleQuestions ? visibleQuestions.some((elem) => answeredChoices.includes(Number(elem))) : false;

        const isVisible =
          (block.visible_if_question_choice === null && block.language_id === curLocaleId) ||
          (answersIncludeAllVisibleQuestions && block.language_id === curLocaleId);

        const blockQuestions = isVisible
          ? questionsData[entranceKey].filter(
              (question) => question.question_block_id === block.question_block_id && question.language_id === curLocaleId
            )
          : undefined;

        const answerChoices = isVisible
          ? questionChoicesData[entranceKey].filter(
              (choice) => choice.question_block_id === block.question_block_id && choice.language_id === curLocaleId
            )
          : undefined;

        const filteredQuestions = blockQuestions
          ? blockQuestions.filter(
              (question) =>
                question.visible_if_question_choice === null ||
                question.visible_if_question_choice?.split("+").some((elem) => answeredChoices.includes(Number(elem)))
            )
          : undefined;

        return isVisible && filteredQuestions && answerChoices && block.question_block_id !== undefined
          ? filteredQuestions.map((question: BackendQuestion) => {
              const answerChoice = answerChoices.find(
                (choice) => choice.question_id === question.question_id && choice.question_choice_id === answers[question.question_id]
              );
              const answerText = answerChoice?.text ?? "";

              return { question, answerText };
            })
          : undefined;
      });

      const getQuestionAnswerRows = (limit: number, isLessThan: boolean) => {
        return questionsAnswers
          .filter((qa) => qa)
          .map((qa, index) => {
            if (qa) {
              const { question, answerText } = qa;
              const { question_id, question_code, text } = question;

              return (
                (isLessThan ? index < limit : index >= limit) && (
                  <div key={`question_${question_id}`} className={styles.questioncontainer}>
                    <span>{`${question_code} ${text}`}</span>
                    <span className={styles.answer}>{`${answerText}`}</span>
                  </div>
                )
              );
            }
          });
      };

      const rowLimit = 10;

      return (
        <Accordion className={styles.accordion} heading={i18n.t("servicepoint.questionsAndAnswers")}>
          {getQuestionAnswerRows(rowLimit, true)}

          <SummaryAccessibilityInnerAccordion>
            <>{getQuestionAnswerRows(rowLimit, false)}</>
          </SummaryAccessibilityInnerAccordion>
        </Accordion>
      );
    }
  };

  return (
    <div className={styles.maincontainer}>
      {hasData ? (
        <div>
          <h4>{sentenceGroup && sentenceGroup.length > 0 ? sentenceGroup[0].sentence_group_name : ""}</h4>

          {getSentencesList()}

          {getQuestionsAnswersAccordion()}
        </div>
      ) : (
        <div className={styles.nodatacontainer}>
          <ServicepointLandingSummaryContent>
            <span>
              <IconAlertCircle />
              <p>{i18n.t("servicepoint.noDataMainEntrance")}</p>
            </span>
          </ServicepointLandingSummaryContent>
        </div>
      )}
    </div>
  );
};

export default SummaryAccessibility;
