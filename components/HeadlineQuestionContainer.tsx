import React from "react";
import { useAccordion, Button, IconMinus, IconPlus, Card } from "hds-react";
import { HeadlineQuestionContainerProps } from "../types/general";
import styles from "./HeadlineQuestionContainer.module.scss";

// used for mainlevel blue accordions
const HeadlineQuestionContainer = ({ headline, initOpen = false, children }: HeadlineQuestionContainerProps): JSX.Element => {
  // Handle accordion state with useAccordion hook
  const { isOpen, buttonProps, contentProps } = useAccordion({ initiallyOpen: initOpen });
  // Change icon based on accordion open state
  const icon = isOpen ? <IconMinus aria-hidden /> : <IconPlus aria-hidden />;
  const buttonVariant = isOpen ? "primary" : "secondary";
  return (
    // TODO: define unique id (?)
    <div className={styles.headline}>
      <Button id="headlineButton" {...buttonProps} iconRight={icon} variant={buttonVariant} fullWidth className={styles.headlineButton}>
        <p>{headline}</p>
      </Button>
      <Card aria-label="Advanced filters" {...contentProps} className={styles.card}>
      { children }
      </Card>
    </div>
  );
};

export default HeadlineQuestionContainer;
