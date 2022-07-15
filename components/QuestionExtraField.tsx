import React from "react";
import { IconInfoCircle, IconCrossCircle } from "hds-react";
import { useI18n } from "next-localization";
import TextWithLinks from "./common/TextWithLinks";
import { QuestionExtraFieldProps } from "../types/general";
import QuestionInfo from "./QuestionInfo";
import styles from "./QuestionExtraField.module.scss";

// usage: container for single extra field row e.g. header/text, text input
const QuestionExtraField = ({
  fieldNumber,
  questionText,
  questionInfo,
  isMandatory,
  isTextInvalid,
  children,
}: QuestionExtraFieldProps): JSX.Element => {
  const i18n = useI18n();

  const questionInfos = questionInfo?.split("<BR>");

  // set invalid style if validation errors
  const questionStyle = isTextInvalid
    ? {
        marginBottom: "0.1rem",
        borderStyle: "solid",
        borderColor: "#b01038",
      }
    : {};

  return (
    <div className={styles.maincontainer} style={questionStyle} id={`fieldnumber-${fieldNumber}`}>
      <div className={styles.questioncontainer}>
        <div className={styles.maintext}>
          <p id={`fieldlabel-${fieldNumber}`}>{`${questionText}${!isMandatory ? ` (${i18n.t("accessibilityForm.optional")})` : ""}`}</p>

          {questionInfo ? (
            <QuestionInfo
              openText={i18n.t("accessibilityForm.whatDoesThisMean")}
              openIcon={<IconInfoCircle aria-hidden />}
              closeText={i18n.t("accessibilityForm.closeGuidance")}
              closeIcon={<IconCrossCircle aria-hidden />}
              textOnBottom
            >
              <div className={styles.infoContainer}>
                {questionInfos?.map((text, index) => {
                  const key = `br_${index}`;
                  return <TextWithLinks key={key} text={text} />;
                })}
              </div>
            </QuestionInfo>
          ) : null}
        </div>

        <div className={styles.children}>{children}</div>

        {/*isTextInvalid ? <IconAlertCircle className={styles.alertCircle} aria-hidden /> : null*/}
      </div>
    </div>
  );
};

export default QuestionExtraField;
