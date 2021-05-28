import { useI18n } from "next-localization";
import { useState } from "react";
import styles from "./QuestionInfo.module.scss";
import { QuestionInfoProps } from "../types/general";

// used to display info for each question respectively
const QuestionInfo = ({ openText, openIcon, closeText, closeIcon, textOnBottom = false, children }: QuestionInfoProps): JSX.Element => {
  const i18n = useI18n();

  const [showContent, setShowContent] = useState(false);
  const handleToggleContent = () => {
    setShowContent(!showContent);
  };

  return (
    <>
      {children && !showContent ? (
        <>
          <span
            className={styles.infobutton}
            onClick={handleToggleContent}
            onKeyPress={handleToggleContent}
            role="button"
            tabIndex={0}
            title="PH: näytä mikä tämä on"
          >
            {openIcon ?? null}
            {/* {i18n.t("questions.singleQuestion.infotextshow")} */}
            {openText}
          </span>
        </>
      ) : (
        <>
          {textOnBottom ? null : (
            <div>
              <p>{children}</p>
            </div>
          )}
          <span
            className={styles.infobutton}
            onClick={handleToggleContent}
            onKeyPress={handleToggleContent}
            role="button"
            tabIndex={0}
            title="PH: sulje mikä tämä on"
          >
            {closeIcon ?? null}
            {/* {i18n.t("questions.singleQuestion.infotextclose")} */}
            {closeText}
          </span>
          {textOnBottom ? (
            <div>
              <p>{children}</p>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default QuestionInfo;
