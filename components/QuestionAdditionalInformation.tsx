import React from "react";
import { IconPlusCircle } from "hds-react";
import { useI18n } from "next-localization";
import styles from "./QuestionAdditionalInformation.module.scss";
import { QuestionAdditionalInfoProps } from "../types/general";
import { useRouter } from "next/router";
import { setCurrentlyEditingBlock } from "../state/reducers/generalSlice";
import { useAppDispatch } from "../state/hooks";

// usage: button in form question row level for adding additional info
// notes: was refactored to match new functionality -> previously was displaying dropdown
// and different buttons for comment, picture and location, this component remains for it's still quite valid

const QuestionAdditionalInformation = ({
  questionId,
  blockId,
}: QuestionAdditionalInfoProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // redirect to the corresponding addinfo edit page
  const handleToggleAdditionalInfo = () => {
    if (blockId && blockId !== undefined) {
      dispatch(setCurrentlyEditingBlock(blockId));
    }

    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(`/additionalInfo/${questionId ?? ""}`, undefined, {
      shallow: true,
    });
  };
  return (
    <span
      className={styles.addInfoButton}
      onClick={handleToggleAdditionalInfo}
      onKeyPress={handleToggleAdditionalInfo}
      role="button"
      tabIndex={0}
      title={i18n.t("common.GoToAdditionalInfoEdit")}
    >
      <IconPlusCircle className={styles.infoButton} aria-hidden />
    </span>
  );
};

export default QuestionAdditionalInformation;
