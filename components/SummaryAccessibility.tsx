import React from "react";
import { Accordion, IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import SummaryAccessibilityInnerAccordion from "./SummaryAccessibilityInnerAccordion";
import { BackendEntranceSentence } from "../types/backendModels";
import { LanguageLocales } from "../types/constants";
import { SummaryAccessibilityProps } from "../types/general";
import styles from "./SummaryAccessibility.module.scss";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with SummarySideNavigation
const SummaryAccessibility = ({
  entranceKey,
  sentenceGroupId,
  sentenceGroup,
  questionAnswerData,
  hasData,
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
    if (sentenceGroup && questionAnswerData[entranceKey]) {
      const getQuestionAnswerRows = (limit: number, isLessThan: boolean) => {
        return questionAnswerData[entranceKey]
          .filter((qa) => qa.sentence_group_id === Number(sentenceGroupId) && qa.language_id === curLocaleId)
          .sort((a, b) => (a.question_order_text ?? "").localeCompare(b.question_order_text ?? ""))
          .map((qa, index) => {
            if (qa) {
              const { question_id, question_code, question_text, question_choice_text } = qa;

              return (
                (isLessThan ? index < limit : index >= limit) && (
                  <div key={`question_${question_id}`} className={styles.questioncontainer}>
                    <span>{`${question_code} ${question_text}`}</span>
                    <span className={styles.answer}>{`${question_choice_text}`}</span>
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
