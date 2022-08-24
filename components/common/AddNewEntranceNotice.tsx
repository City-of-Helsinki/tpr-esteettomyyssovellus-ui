// this files code from marketing project: needs editing or deleting

import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import { IconSignin } from "hds-react";
import { useRouter } from "next/router";
import styles from "./AddNewEntranceNotice.module.scss";
import QuestionButton from "../QuestionButton";
import { useAppSelector } from "../../state/hooks";

// usage: in preview page, add new entrances component
// notice: derived from Notice (marketing), removed props due to single use only
// if needed in multiple places maybe add them back or create new component from Notice or this
// if the functionality changes enough
const AddNewEntranceNotice = (): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);

  const handleAddAdditionalEntrance = async () => {
    router.push(`/entranceAccessibility/${curServicepointId}`);
  };

  const handleReturnToDetailspage = async () => {
    router.push(`/details/${curServicepointId}`);
  };

  return (
    <div className={styles.notice}>
      <div className={styles.titlecontainer}>
        <div className={styles.icon}>
          <IconSignin size="xl" aria-hidden />
        </div>
        <div className={styles.title}>
          <h3>{i18n.t("PreviewPage.addNewEntranceLabel")}</h3>
        </div>
      </div>
      <div className={styles.text}>
        <p>{i18n.t("PreviewPage.addNewEntranceBody")}</p>
      </div>
      <div className={styles.flexButtonsContainer}>
        <QuestionButton variant="secondary" onClickHandler={handleReturnToDetailspage}>
          {i18n.t("PreviewPage.addNewEntranceContinueLater")}
        </QuestionButton>
        <QuestionButton variant="secondary" onClickHandler={handleAddAdditionalEntrance}>
          {i18n.t("PreviewPage.addNewEntranceButton")}
        </QuestionButton>
      </div>
    </div>
  );
};

export default AddNewEntranceNotice;
