import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import SummaryContent from "./SummaryContent";
import SummaryAccessibilityInnerAccordion from "./SummaryAccessibilityInnerAccordion";
import CustomAccordion from "./common/CustomAccordion";
import { BackendEntranceSentence } from "../types/backendModels";
import { LanguageLocales } from "../types/constants";
import { AccessibilityData, SummaryAccessibilityProps } from "../types/general";
import styles from "./SummaryAccessibility.module.scss";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with SummarySideNavigation
const SummaryAccessibility = ({ entranceKey, sentenceGroupId, accessibilityData, entranceChoiceData }: SummaryAccessibilityProps): JSX.Element => {
  const i18n = useI18n();
  const curLocaleId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];

  const getGroupedAccessibilityData = (sentences?: BackendEntranceSentence[]): AccessibilityData | undefined => {
    if (sentences) {
      return sentences.reduce((acc: AccessibilityData, sentence) => {
        const { sentence_group_id } = sentence;
        return {
          ...acc,
          [sentence_group_id]: acc[sentence_group_id] ? [...acc[sentence_group_id], sentence] : [sentence],
        };
      }, {});
    }
  };

  const groupedAccessibilityData = getGroupedAccessibilityData(accessibilityData ? accessibilityData[entranceKey] : undefined);
  const sentenceGroup = groupedAccessibilityData ? groupedAccessibilityData[sentenceGroupId] : undefined;

  const getSentencesList = () => {
    if (sentenceGroup) {
      return (
        <ul className={styles.sentencelist}>
          {sentenceGroup
            .sort((a: BackendEntranceSentence, b: BackendEntranceSentence) => {
              return (a.sentence_order_text ?? "").localeCompare(b.sentence_order_text ?? "");
            })
            .map((s) => {
              const { sentence_type } = s;
              return (
                <li key={`sentence_${s.sentence_id}`} className={styles.sentence}>
                  {sentence_type === "COMMENT" && <span className={styles.comment}>{`${i18n.t("servicepoint.sentenceComment")}: `}</span>}
                  {s.sentence}
                </li>
              );
            })}
        </ul>
      );
    }
  };

  const getQuestionsAnswersAccordion = () => {
    if (sentenceGroup && entranceChoiceData[entranceKey]) {
      const getQuestionAnswers = () => {
        return entranceChoiceData[entranceKey]
          .filter((qa) => qa.sentence_group_id === Number(sentenceGroupId) && qa.language_id === curLocaleId)
          .sort((a, b) => (a.question_order_text ?? "").localeCompare(b.question_order_text ?? ""));
      };

      const getQuestionAnswerRows = (limit: number, isLessThan: boolean) => {
        return getQuestionAnswers().map((qa, index) => {
          if (qa) {
            const { question_id, question_code, question_text, question_choice_text, question_order_text } = qa;

            return (
              (isLessThan ? index < limit : index >= limit) && (
                <div key={`question_${question_id}_${question_order_text}`} className={styles.questioncontainer}>
                  <span>{`${question_code} ${question_text}`}</span>
                  <span className={styles.answer}>{`${question_choice_text}`}</span>
                </div>
              )
            );
          }
        });
      };

      const rows = getQuestionAnswers().length;
      const rowLimit = 10;

      return (
        <CustomAccordion heading={i18n.t("servicepoint.questionsAndAnswers")}>
          <div className={styles.accordioncontent}>
            {getQuestionAnswerRows(rowLimit, true)}

            {rows > rowLimit && (
              <SummaryAccessibilityInnerAccordion>
                <>{getQuestionAnswerRows(rowLimit, false)}</>
              </SummaryAccessibilityInnerAccordion>
            )}
          </div>
        </CustomAccordion>
      );
    }
  };

  const hasData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;

  return (
    <div className={styles.maincontainer}>
      <h4>{sentenceGroup && sentenceGroup.length > 0 ? sentenceGroup[0].sentence_group_name : ""}</h4>

      {hasData ? (
        <div>
          {getSentencesList()}

          {getQuestionsAnswersAccordion()}
        </div>
      ) : (
        <div className={styles.nodatacontainer}>
          <SummaryContent>
            <span>
              <IconAlertCircle />
              <p>{i18n.t("servicepoint.noDataMainEntrance")}</p>
            </span>
          </SummaryContent>
        </div>
      )}
    </div>
  );
};

export default SummaryAccessibility;
