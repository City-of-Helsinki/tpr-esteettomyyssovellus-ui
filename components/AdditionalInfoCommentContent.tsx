import React, { useEffect } from "react";
import { IconPlus, IconMinus, IconCross } from "hds-react";
import { useI18n } from "next-localization";
import styles from "./AdditionalInfoCommentContent.module.scss";
import { TextArea } from "hds-react";
import QuestionInfo from "./QuestionInfo";
import { AdditionalContentProps } from "../types/general";
import {
  addComment,
  addInvalidValues,
  removeComment,
  removeInvalidValues,
} from "../state/reducers/additionalInfoSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import QuestionButton from "./QuestionButton";

const AdditionalInfoCommentContent = ({
  questionId,
  onDelete,
  compId,
  initValue,
}: AdditionalContentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // on delete button clicked chain delete comment from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveComment();
    onDelete ? onDelete() : null;
  };

  const handleRemoveComment = () => {
    dispatch(removeComment({ questionId }));
  };

  const currentInvalids = useAppSelector((state) =>
    state.additionalInfoReducer[questionId].invalidValues?.find(
      (invs) => invs.id === compId
    )
  );

  // only update state after .5 sec from prev KeyDown, set Alt text with correct lang
  let timer: NodeJS.Timeout;
  const handleAddComment = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    language: string
  ) => {
    const value: string = e.currentTarget.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(addComment({ questionId, language, value }));
    }, 500);
    // validation for fi comment field
    if (value && value !== "" && language === "fi") {
      dispatch(
        removeInvalidValues({
          questionId: questionId,
          compId: compId,
          removeTarget: "fi",
        })
      );
    } else if (value === "" && language === "fi") {
      dispatch(
        addInvalidValues({
          questionId: questionId,
          compId: compId,
          invalidAnswers: ["fi"],
        })
      );
    }
  };

  useEffect(() => {
    if (!initValue?.fi || initValue?.fi === "") {
      dispatch(
        addInvalidValues({
          questionId: questionId,
          compId: compId,
          invalidAnswers: ["fi"],
        })
      );
    }
  }, []);

  return (
    <div className={styles.maincontainer}>
      <div className={styles.contentcontainer}>
        <div className={styles.descriptioncontainer}>
          <h4>
            PH: voit tarkentaa esteettömyystietoja vapaamuotoisella
            lisätekstillä
          </h4>
        </div>
        <div className={styles.flexcontainer}>
          <div className={styles.commentscontainer}>
            <TextArea
              id="comment-1"
              label="ph: Kuvaile, mitä kuva esittää (alt-teksti) "
              helperText="Lisäteksti"
              required
              tooltipButtonLabel={i18n.t(
                "additionalInfo.generalTooptipButtonLabel"
              )}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                handleAddComment(e, "fi")
              }
              onLoad={() => handleAddComment(initValue?.fi, "fi")}
              defaultValue={initValue?.fi ?? null}
              invalid={
                currentInvalids?.invalidAnswers?.includes("fi") ? true : false
              }
              errorText={
                currentInvalids?.invalidAnswers?.includes("fi")
                  ? "PH: olkaa hyvä ja syöttäkää arvo"
                  : ""
              }
            />
            <div className={styles.optionalaltscontainer}>
              <QuestionInfo
                openText="ph: Lisää teksti ruotsiksi"
                closeText="sulje kuvailu"
                openIcon={<IconPlus />}
                closeIcon={<IconMinus />}
                textOnBottom
              >
                <TextArea
                  id="comment-2"
                  label="ph: lisäteksti ruotsiksi *"
                  helperText="Kerro lisää esteettömyydestä ruotsiksi"
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleAddComment(e, "sv")
                  }
                  onLoad={() => handleAddComment(initValue?.sv, "sv")}
                  defaultValue={initValue?.sv ?? null}
                />
              </QuestionInfo>
              <QuestionInfo
                openText="ph: Lisää teksti englanniksi"
                closeText="sulje kuvailu"
                openIcon={<IconPlus />}
                closeIcon={<IconMinus />}
                textOnBottom
              >
                <TextArea
                  id="comment-3"
                  label="ph: teksti englanniksi *"
                  helperText="Kerro lisää esteettömyydestä englanniksi"
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleAddComment(e, "en")
                  }
                  onLoad={() => handleAddComment(initValue?.en, "en")}
                  defaultValue={initValue?.en ?? null}
                />
              </QuestionInfo>
            </div>
          </div>
          <div className={styles.buttonscontainer}>
            <QuestionButton
              variant="secondary"
              iconRight={<IconCross />}
              onClickHandler={() => handleOnDelete()}
            >
              PH: Peruteksti
            </QuestionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoCommentContent;
