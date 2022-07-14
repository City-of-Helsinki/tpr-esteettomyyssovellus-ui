import React, { useState } from "react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import Button from "./QuestionButton";
import ModalConfirmation from "./common/ModalConfirmation";
import SaveSpinner from "./common/SaveSpinner";
import { SummaryRemoveButtonProps } from "../types/general";
import { deleteEntrance } from "../utils/utilFunctions";

// usage: remove button for ServicepointLandingSummary
const SummaryRemoveButton = ({ entranceData }: SummaryRemoveButtonProps): JSX.Element => {
  const i18n = useI18n();
  // const curLocale = i18n.locale();
  const router = useRouter();

  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const openDeletionConfirmation = () => {
    setConfirmDeletion(true);
  };

  const closeDeletionConfirmation = () => {
    setConfirmDeletion(false);
  };

  const { entrance_id } = entranceData || {};
  // const entranceName = entranceData && entranceData[`name_${curLocale}`] ? entranceData[`name_${curLocale}`] : "";

  const handleEditorRemovePointData = async () => {
    closeDeletionConfirmation();

    if (entrance_id) {
      setDeleting(true);
      await deleteEntrance(entrance_id, router);
      setDeleting(false);

      router.reload();
    }
  };

  return (
    <div>
      <Button
        variant="secondary"
        onClickHandler={openDeletionConfirmation}
        disabled={isDeleting}
        iconRight={
          isDeleting ? (
            <SaveSpinner savingText={i18n.t("servicepoint.buttons.deleting")} savingFinishedText={i18n.t("servicepoint.buttons.deletingFinished")} />
          ) : undefined
        }
      >
        {i18n.t("servicepoint.buttons.deleteEntrance")}
      </Button>

      {confirmDeletion && (
        <ModalConfirmation
          open={confirmDeletion}
          titleKey="servicepoint.buttons.deleteEntrance"
          messageKey="servicepoint.confirmation.deleteEntrance"
          cancelKey="common.buttons.no"
          confirmKey="common.buttons.yes"
          closeCallback={closeDeletionConfirmation}
          confirmCallback={handleEditorRemovePointData}
        />
      )}
    </div>
  );
};

export default SummaryRemoveButton;
