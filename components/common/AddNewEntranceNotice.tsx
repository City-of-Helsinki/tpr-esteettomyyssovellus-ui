import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import { ButtonVariant, IconSignin, IconSize } from "hds-react";
import { useRouter } from "next/router";
import styles from "./AddNewEntranceNotice.module.scss";
import QuestionButton from "../QuestionButton";
import { useAppSelector } from "../../state/hooks";

// usage: in preview page, add new entrances component
function AddNewEntranceNotice(): ReactElement {
  const i18n = useI18n();
  const router = useRouter();

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);

  const handleAddAdditionalEntrance = async () => {
    router.push(`/entranceAccessibility/${curServicepointId}?checksum=${checksum}`);
  };

  const handleReturnToDetailspage = async () => {
    router.push(`/details/${curServicepointId}?checksum=${checksum}`);
  };

  return (
    <div className={styles.notice}>
      <div className={styles.titlecontainer}>
        <div className={styles.icon}>
          <IconSignin size={IconSize.ExtraLarge} aria-hidden />
        </div>
        <div className={styles.title}>
          <h3>{i18n.t("PreviewPage.addNewEntranceLabel")}</h3>
        </div>
      </div>
      <div className={styles.text}>
        <p>{i18n.t("PreviewPage.addNewEntranceBody")}</p>
      </div>
      <div className={styles.flexButtonsContainer}>
        <QuestionButton variant={ButtonVariant.Secondary} onClickHandler={handleReturnToDetailspage}>
          {i18n.t("PreviewPage.addNewEntranceContinueLater")}
        </QuestionButton>
        <QuestionButton variant={ButtonVariant.Secondary} onClickHandler={handleAddAdditionalEntrance}>
          {i18n.t("PreviewPage.addNewEntranceButton")}
        </QuestionButton>
      </div>
    </div>
  );
}

export default AddNewEntranceNotice;
