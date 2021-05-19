import React from "react";
import { IconArrowRight, IconArrowLeft, Card } from "hds-react";
import Button from "./QuestionButton";
import { QuestionFormCtrlButtonsProps } from "../types/general";
import styles from "./QuestionFormCtrlButtons.module.scss";

const QuestionFormCtrlButtons = ({
  hasCancelButton,
  hasValidateButton,
  hasSaveDraftButton,
  hasPreviewButton,
}: QuestionFormCtrlButtonsProps): JSX.Element => {
  // TODO: save button might need own component of Button
  // also preview view should probably also have own component/buttons

  // testing click handle, edit with real logic later
  // also add handlers for all buttons respectively
  const handleCancel = (): void => {
    console.log("cancel clicked");
  };

  return (
    <Card className={styles.container}>
      <div className={styles.left}>
        {hasCancelButton ? (
          <Button variant="secondary" iconLeft={<IconArrowLeft />} onClickHandler={handleCancel}>
            {" PH: Keskeytä "}
          </Button>
        ) : null}
      </div>
      <div className={styles.right}>
        {hasValidateButton ? <Button variant="secondary"> PH: Tarkista tiedot </Button> : null}
        {hasSaveDraftButton ? (
          <Button variant="secondary" disabled>
            PH: Tallenna Keskeneräisenä
          </Button>
        ) : null}
        {hasPreviewButton ? (
          <Button variant="primary" iconRight={<IconArrowRight />}>
            {" PH: Esikatsele "}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
export default QuestionFormCtrlButtons;
