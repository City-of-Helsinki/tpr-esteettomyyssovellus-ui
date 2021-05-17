import { useI18n } from "next-localization";
import styles from "./QuestionInfo.module.scss";
import { QuestionInfoProps } from "../types/general";

// used to display info for each question respectively
const QuestionInfo = ({
  openText,
  openIcon,
  closeText,
  closeIcon,
  textOnBottom = false,
  questionInfo,
  showInfoText,
  clickHandler,
}: QuestionInfoProps): JSX.Element => {
  const i18n = useI18n();
  return (
    <>
      {questionInfo && !showInfoText ? (
        <>
          <span
            className={styles.infobutton}
            onClick={clickHandler}
            onKeyPress={clickHandler}
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
              <p>{questionInfo}</p>
            </div>
          )}
          <span
            className={styles.infobutton}
            onClick={clickHandler}
            onKeyPress={clickHandler}
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
              <p>{questionInfo}</p>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default QuestionInfo;
