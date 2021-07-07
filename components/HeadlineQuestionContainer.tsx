import React from "react";
import { useAccordion, Button, IconMinus, IconPlus, IconCheckCircleFill, Card } from "hds-react";
import { HeadlineQuestionContainerProps } from "../types/general";
import styles from "./HeadlineQuestionContainer.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";

// used for mainlevel blue accordions
const HeadlineQuestionContainer = ({ text, number, initOpen = false, children }: HeadlineQuestionContainerProps): JSX.Element => {
  // Handle accordion state with useAccordion hook
  let { isOpen, buttonProps, contentProps } = useAccordion({ initiallyOpen: initOpen });
  let curFinishedBlocks = useAppSelector((state) => state.formReducer.finishedBlocks);
  let isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  //let isFinished = curFinishedBlocks.includes(number);
  // Change icon based on accordion open state
  const icon = isOpen ? <IconMinus aria-hidden /> : <IconPlus aria-hidden />;
  let iconLeft = curFinishedBlocks.includes(Number(number)) ? <IconCheckCircleFill aria-hidden /> : null;
  const buttonVariant = isOpen && !(isContinueClicked && number == 0) ? "primary" : "secondary";

  return (
    // TODO: define unique id (?)
    <div className={styles.headline}>
      <Button
        id="headlineButton"
        {...buttonProps}
        iconRight={icon}
        iconLeft={iconLeft}
        variant={buttonVariant}
        fullWidth
        className={styles.headlineButton}
        //onClick={() => handleOnClick()}
      >
        <p>{text}</p>
      </Button>
      {isContinueClicked && number == 0 ? null : (
        <Card aria-label="Advanced filters" {...contentProps} className={styles.card}>
          {children}
        </Card>
      )}
    </div>
  );
};

export default HeadlineQuestionContainer;
