import { Button, Card, useAccordion } from "hds-react";
import { QuestionInfoProps } from "../types/general";
import styles from "./QuestionInfo.module.scss";

// usage: display info (dropdown) for each question respectively
const QuestionInfo = ({ openText, openIcon, closeIcon, textOnBottom = false, children }: QuestionInfoProps): JSX.Element => {
  const { isOpen, buttonProps, contentProps } = useAccordion({ initiallyOpen: false });

  return (
    <div className={styles.infocontainer}>
      {textOnBottom && (
        <Button variant="supplementary" size="small" iconLeft={isOpen ? closeIcon ?? null : openIcon ?? null} {...buttonProps}>
          {openText}
        </Button>
      )}
      <Card className={styles.contentcontainer} {...contentProps}>
        {children}
      </Card>
      {!textOnBottom && (
        <Button variant="supplementary" size="small" iconLeft={isOpen ? closeIcon ?? null : openIcon ?? null} {...buttonProps}>
          {openText}
        </Button>
      )}
    </div>
  );
};

export default QuestionInfo;
