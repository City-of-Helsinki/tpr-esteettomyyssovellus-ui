import { useI18n } from "next-localization";
import { useState } from "react";
import styles from "./QuestionInfo.module.scss";
import { QuestionInfoProps } from "../types/general";

// usage: display info (dropdown) for each question respectively
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
            className={`${styles.infobutton} ${styles.closed}`}
            onClick={handleToggleContent}
            onKeyPress={handleToggleContent}
            role="button"
            tabIndex={0}
            title={i18n.t("common.openInfoWhatIsThis")}
          >
            {openIcon ?? null}
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
            title={i18n.t("common.generalMainInfoIsOpen")}
          >
            {closeIcon ?? null}
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
