import { Button } from "hds-react";
import styles from "./QuestionButton.module.scss";
import { QuestionButtonProps } from "../types/general";

// usage: general customized button from HDS
const QuestionButton = ({
  children,
  variant,
  iconLeft,
  iconRight,
  disabled = false,
  onClickHandler,
  onChange,
}: QuestionButtonProps): JSX.Element => {
  return (
    <div>
      <Button
        variant={variant}
        iconLeft={iconLeft}
        iconRight={iconRight}
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
