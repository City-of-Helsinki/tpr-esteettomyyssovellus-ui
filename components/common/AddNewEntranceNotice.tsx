// this files code from marketing project: needs editing or deleting

import React, { ReactElement, ReactNode, useEffect, useRef } from "react";
import { useI18n } from "next-localization";
import { IconArrowRight, IconSignin } from "hds-react";
import { useRouter } from "next/router";
import styles from "./AddNewEntranceNotice.module.scss";
import QuestionButton from "../QuestionButton";

// usage: in preview page, add new entrances component
// notice: derived from Notice (marketing), removed props due to single use only
// if needed in multiple places maybe add them back or create new component from Notice or this
// if the functionality changes enough
const AddNewEntranceNotice = (): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();

  const handleAddAdditionalEntrance = async () => {
    // todo: add url to add additional entrance
    // router.push("/additionalEntrance/" + maybeIdDunno);
  };

  // note: should both buttons "ei lisää sisäänkäyntejä" and "jatkan myöhemmin"
  // return to details -> if so why 2 buttons if not where should they go?
  const handleReturnToDetailspage = async () => {
    // todo: add url to return to details page
    // router.push("/details/" + detailsIdHereFromProps?);
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
        <QuestionButton
          variant="primary"
          onClickHandler={handleAddAdditionalEntrance}
          iconRight={<IconArrowRight size="l" aria-hidden />}
        >
          {i18n.t("PreviewPage.addNewEntranceButton")}
        </QuestionButton>
        <QuestionButton
          variant="secondary"
          onClickHandler={handleReturnToDetailspage}
        >
          {i18n.t("PreviewPage.addNewEntranceNoEntrances")}
        </QuestionButton>
        <QuestionButton
          variant="secondary"
          onClickHandler={handleReturnToDetailspage}
        >
          {i18n.t("PreviewPage.addNewEntranceContinueLater")}
        </QuestionButton>
      </div>
    </div>
  );
};

export default AddNewEntranceNotice;
