import React, { useState } from "react";
import { IconPlusCircle, IconCrossCircleFill } from "hds-react";
import { useI18n } from "next-localization";
import styles from "./QuestionAdditionalInformation.module.scss";
import { QuestionAdditionalInfoProps } from "../types/general";

// used to display additional dropdown to add possible picture, location or comment
const QuestionAdditionalInformation = ({
  canAddLocation,
  canAddPhotoMaxCount,
  canAddComment
}: QuestionAdditionalInfoProps): JSX.Element => {
  const i18n = useI18n();
  const [showAdditionalInformation, setAdditionalInformationVisibility] =
    useState(false);

  const handleToggleAdditionalInfo = () => {
    setAdditionalInformationVisibility(!showAdditionalInformation);
  };
  return (
    <>
      {!showAdditionalInformation ? (
        <>
          <span
            className={styles.addInfoButton}
            onClick={handleToggleAdditionalInfo}
            onKeyPress={handleToggleAdditionalInfo}
            role="button"
            tabIndex={0}
            title="PH: avaa lisää lisätietoja"
          >
            <IconPlusCircle aria-hidden />
          </span>
        </>
      ) : (
        <>
          <span
            className={styles.addInfoButton}
            onClick={handleToggleAdditionalInfo}
            onKeyPress={handleToggleAdditionalInfo}
            role="button"
            tabIndex={0}
            title="PH: sulje lisää lisätietoja"
          >
            <IconCrossCircleFill aria-hidden />
          </span>

          <div className={styles.lineBreak}>
            {canAddPhotoMaxCount != 0 ? (
              <div>
                PH: Lisää kuva <IconPlusCircle aria-hidden />
              </div>
            ) : null}
            {canAddLocation ? (
              <div>
                PH: Lisää sijainti <IconPlusCircle aria-hidden />
              </div>
            ) : null}
            {canAddComment ? (
              <div>
                PH: Lisää kommentti <IconPlusCircle aria-hidden />
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
};

export default QuestionAdditionalInformation;
