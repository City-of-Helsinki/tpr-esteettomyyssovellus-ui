import React from "react";
import { IconPlus, IconMinus, IconCross } from "hds-react";
import { useI18n } from "next-localization";
import styles from "./AdditionalInfoCommentContent.module.scss";
import { TextArea } from "hds-react";
import QuestionInfo from "./QuestionInfo";
import { AdditionalContentProps } from "../types/general";
import {
  addComment,
  removeComment,
} from "../state/reducers/additionalInfoSlice";
import { useAppDispatch } from "../state/hooks";
import QuestionButton from "./QuestionButton";

const AdditionalInfoCommentContent = ({
  questionId,
  onDelete,
  initValue,
}: AdditionalContentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // on delete button clicked chain delete image from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveComment();
    onDelete ? onDelete() : null;
  };

  const handleRemoveComment = () => {
    dispatch(removeComment({ questionId }));
  };

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
  };

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
                handleAddComment(e, "comment_fi")
              }
              onLoad={() =>
                handleAddComment(initValue?.comment_fi, "comment_fi")
              }
              defaultValue={initValue?.comment_fi ?? null}
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
                    handleAddComment(e, "comment_sv")
                  }
                  onLoad={() =>
                    handleAddComment(initValue?.comment_sv, "comment_sv")
                  }
                  defaultValue={initValue?.comment_sv ?? null}
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
                    handleAddComment(e, "comment_en")
                  }
                  onLoad={() =>
                    handleAddComment(initValue?.comment_en, "comment_en")
                  }
                  defaultValue={initValue?.comment_en ?? null}
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
