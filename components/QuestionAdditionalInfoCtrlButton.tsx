import React from "react";
import { IconPlusCircle, IconCrossCircle } from "hds-react";
import Button from "./QuestionButton";
import { QuestionAdditionalInfoCtrlButtonProps } from "../types/general";
import styles from "./QuestionAdditionalInfoCtrlButton.module.scss";

// button ctrl to handle visibility of additional info buttons on questions
const QuestionAdditionalInfoCtrlButton = ({ onClick, curState }: QuestionAdditionalInfoCtrlButtonProps): JSX.Element => {
  return (
    <>
      {!curState ? (
        <div className={styles.container}>
          <Button variant="secondary" iconRight={<IconPlusCircle />} onClickHandler={onClick}>
            ph: Lisää kuva, siainti tai lisäteksti
          </Button>
        </div>
      ) : (
        <div className={styles.container}>
          <Button variant="secondary" iconRight={<IconCrossCircle />} onClickHandler={onClick}>
            ph: piilota lisää- painikkeet
          </Button>
        </div>
      )}
    </>
  );
};

export default QuestionAdditionalInfoCtrlButton;
