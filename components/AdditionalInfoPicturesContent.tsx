import React, { useRef, useState } from "react";
import { IconPlus, IconMinus } from "hds-react"
import { useI18n } from "next-localization";
import styles from "./AdditionalInfoPicturesContent.module.scss";
import QuestionTextInput from "./QuestionTextInput";
import QuestionButton from "./QuestionButton";
import QuestionInfo from "./QuestionInfo";
import { addPicture, removePicture } from "../state/reducers/additionalInfoSlice"
import  { useAppDispatch, useAppSelector }  from "../state/hooks";
import { AdditionalContentProps } from "../types/general"

const AdditionalInfoPicturesContent = ({ questionNumber }: AdditionalContentProps): JSX.Element => {
    // also use filename for conditionally displaying buttons and alt-text & preview picture
  const dispatch = useAppDispatch();
  const [filename, setFilename] = useState("");
  const [currentId, setCurrentId] = useState("");

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const i18n = useI18n();
  const handleAddImageToInput = (): void => {
    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };
  const handleImageAdded = (e: any) => {
    if (e.target && e.target.files.length > 0) {
      const img = e.target.files[0];
      const imgBase64 = window.URL.createObjectURL(img);
      const idSuffix = imgBase64.toString().split("-")[1]
      const id = `${questionNumber}-${idSuffix}`
      const payload = {
        qNumber: questionNumber, 
        id: id,
        name: img.name,
        base64: imgBase64,
        url: "ph: urlii",
        altTextLocales: {
            fi: "ph: suomi alt",
            en: "",
            sv: ""
        }}
      dispatch(addPicture(payload))
      setFilename(img.name);
      setCurrentId(id)
    }
  };

  const handleRemoveImage = () => {
    dispatch(removePicture({questionNumber, currentId}))
    setFilename("");
    setCurrentId("")
  };


  return (
    // todo: ehkä tee kuvalinkistä ja kuva laitteelta omat komponentit ?!
    <div className={styles.maincontainer}>
      <div className={styles.inputcontainer}>
        <span className={styles.inputfield}>
          <QuestionTextInput label="ph: Valitse kuva laitteeltasi" placeholder={filename} disabled />
        </span>
        {filename ? (
          <QuestionButton variant="secondary" onClickHandler={handleRemoveImage}>
            PH: Poista
          </QuestionButton>
        ) : (
          <QuestionButton variant="secondary" onClickHandler={handleAddImageToInput}>
            PH: Valitse laitteelta
          </QuestionButton>
        )}

        <input
          type="file"
          className={styles.hidden}
          ref={hiddenFileInput}
          onChange={handleImageAdded}
        ></input>
      </div>
      { filename ?
      <div className={styles.lowercontentcontainer}>
        <div className={styles.altcontainer}>
            <QuestionTextInput label="ph: Kuvaile, mitä kuva esittää (alt-teksti)" helperText="Kerro kuvasta niille, jotka eivät näe kuvaa." required/>
            <QuestionInfo openText="ph: Lisää kuvailu ruotsiksi" closeText="sulje kuvailu" openIcon={<IconPlus/>} closeIcon={<IconMinus/>} textOnBottom>
                <QuestionTextInput label="ph: alt-teksti ruotsiksi *" helperText="Kerro kuvasta niille, jotka eivät näe kuvaa."/>
            </QuestionInfo>
            <QuestionInfo openText="ph: Lisää kuvailu ruotsiksi" closeText="sulje kuvailu" openIcon={<IconPlus/>} closeIcon={<IconMinus/>} textOnBottom>
                <QuestionTextInput label="ph: alt-teksti englanniksi *" helperText="Kerro kuvasta niille, jotka eivät näe kuvaa."/>
            </QuestionInfo>
        </div>
        <div className={styles.picrutepreviewcontainer}>
            <div style={{backgroundImage: "url("+ "https://i.pinimg.com/originals/2a/3e/15/2a3e152383712a5f4e5e1d42fa51ba2b.jpg" + ")"}} />
        </div>
      </div>
      : null}
    </div>
  );
};

export default AdditionalInfoPicturesContent;
