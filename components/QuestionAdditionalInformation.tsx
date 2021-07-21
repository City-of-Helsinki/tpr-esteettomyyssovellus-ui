import React, { useState } from "react";
import { IconPlusCircle, IconCrossCircleFill } from "hds-react";
import { useI18n } from "next-localization";
import styles from "./QuestionAdditionalInformation.module.scss";
import { QuestionAdditionalInfoProps } from "../types/general";
import { useRouter } from "next/router";

// todo maybe remove this whole component or at least the changing buttons / functionality
// used to display additional dropdown to add possible picture, location or comment
const QuestionAdditionalInformation = ({
  questionId,
  canAddLocation,
  canAddPhotoMaxCount,
  canAddComment,
}: QuestionAdditionalInfoProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const [
    showAdditionalInformation,
    setAdditionalInformationVisibility,
  ] = useState(false);

  const handleToggleAdditionalInfo = () => {
    //todo maybe delete this -> was old for displaying below add picture/location/comment
    setAdditionalInformationVisibility(!showAdditionalInformation);
    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(`/additionalInfo/${questionId ?? ""}`, undefined, {
      shallow: true,
    });
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
            <IconPlusCircle className={styles.infoButton} aria-hidden />
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
            <IconCrossCircleFill className={styles.infoButton} aria-hidden />
          </span>
          {
            // TODO: Link to the http://localhost:3000/additionalinfo/ page
            // THIS IS NOT NEEDED
            // <div className={styles.lineBreak}>
            //   {canAddPhotoMaxCount != 0 ? (
            //     <div>
            //       PH: Lisää kuva <IconPlusCircle aria-hidden />
            //     </div>
            //   ) : null}
            //   {canAddLocation ? (
            //     <div>
            //       PH: Lisää sijainti <IconPlusCircle aria-hidden />
            //     </div>
            //   ) : null}
            //   {canAddComment ? (
            //     <div>
            //       PH: Lisää kommentti <IconPlusCircle aria-hidden />
            //     </div>
            //   ) : null}
            // </div>
          }
        </>
      )}
    </>
  );
};

export default QuestionAdditionalInformation;
