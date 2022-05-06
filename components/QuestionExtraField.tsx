import React from "react";
import { IconInfoCircle, IconCrossCircle, Link as HdsLink } from "hds-react";
import { useI18n } from "next-localization";
import styles from "./QuestionExtraField.module.scss";
import { QuestionExtraFieldProps } from "../types/general";
import { splitTextUrls } from "../utils/utilFunctions";
import QuestionInfo from "./QuestionInfo";

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

  const questionInfos = questionInfo?.split("<BR><BR>");

  // set invalid style if validation errors
  const questionStyle = isTextInvalid
    ? {
        marginBottom: "0.1rem",
        borderStyle: "solid",
        borderColor: "#b01038",
      }
    : {};

  const convertTextUrlsToLinks = (splitUrls: string[]) => {
    return splitUrls.map((textOrLink) => {
      if (textOrLink.startsWith("http")) {
        // Link
        return (
          <HdsLink
            href={textOrLink}
            size="M"
            openInNewTab
            openInNewTabAriaLabel={i18n.t("common.opensInANewTab")}
            external
            openInExternalDomainAriaLabel={i18n.t("common.opensExternal")}
            disableVisitedStyles
          >
            {textOrLink}
          </HdsLink>
        );
      } else {
        // Text
        return textOrLink.trim();
      }
    });
  };

  return (
    <div className={styles.maincontainer} style={questionStyle} id={`fieldnumber-${fieldNumber}`}>
      <div className={styles.questioncontainer}>
        <div className={styles.maintext}>
          <p>{`${questionText}${!isMandatory ? ` (${i18n.t("accessibilityForm.optional")})` : ""}`}</p>

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
                  const splitUrls = splitTextUrls(text);
                  const key = `br_${index}`;
                  return <p key={key}>{convertTextUrlsToLinks(splitUrls)}</p>;
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
