import React from "react";
import { IconPlus, IconMinus } from "hds-react"
import { useI18n } from "next-localization";
import styles from "./AdditionalInfoCommentContent.module.scss";
import { TextArea } from "hds-react";
import QuestionInfo from "./QuestionInfo";
import { AdditionalContentProps } from "../types/general"

const AdditionalInfoCommentContent = ({ questionNumber }: AdditionalContentProps ): JSX.Element => {
  const i18n = useI18n();

  return (
    <div className={styles.maincontainer}>
      <div className={styles.contentcontainer}>
        <div className={styles.descriptioncontainer}>
            <p>PH: voit tarkentaa esteettömyystietoja vapaamuotoisella lisätekstillä</p>
        </div>
        <div className={styles.commentscontainer}>
            <TextArea id="comment-1" label="ph: Kuvaile, mitä kuva esittää (alt-teksti) " helperText="Lisäteksti" required draggable/>
            <QuestionInfo openText="ph: Lisää teksti ruotsiksi" closeText="sulje kuvailu" openIcon={<IconPlus/>} closeIcon={<IconMinus/>} textOnBottom>
                <TextArea id="comment-2"  label="ph: lisäteksti ruotsiksi *" helperText="Kerro lisää esteettömyydestä ruotsiksi"/>
            </QuestionInfo>
            <QuestionInfo openText="ph: Lisää teksti englanniksi" closeText="sulje kuvailu" openIcon={<IconPlus/>} closeIcon={<IconMinus/>} textOnBottom>
                <TextArea id="comment-3"  label="ph: teksti englanniksi *" helperText="Kerro lisää esteettömyydestä englanniksi"/>
            </QuestionInfo>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoCommentContent;
