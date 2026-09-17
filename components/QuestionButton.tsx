import { Button, ButtonVariant } from "hds-react";
import styles from "./QuestionButton.module.scss";
import { QuestionButtonProps } from "../types/general";

// usage: general customized button from HDS
const QuestionButton = ({ children, variant, iconStart, iconEnd, disabled = false, onClickHandler, onChange }: QuestionButtonProps): JSX.Element => {

  return (
    <div className={styles.buttonContainer}>
      <Button
        variant={variant}
        iconStart={iconStart}
        iconEnd={iconEnd}
        disabled={disabled}
        className={styles.button}
        onChange={onChange}
        onClick={onClickHandler}
      >
        {children}
      </Button>
    </div>
  );
};
export default QuestionButton;
