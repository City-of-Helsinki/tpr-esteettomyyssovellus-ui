import React from "react";
import {
  useAccordion,
  Button,
  IconMinus,
  IconPlus,
  IconCheckCircleFill,
  Card,
  IconAlertCircle
} from "hds-react";
import { HeadlineQuestionContainerProps } from "../types/general";
import styles from "./HeadlineQuestionContainer.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import router from "next/router";

// used for mainlevel blue accordions
const HeadlineQuestionContainer = ({
  text,
  number,
  initOpen = false,
  children,
  isValid
}: HeadlineQuestionContainerProps): JSX.Element => {
  // Handle accordion state with useAccordion hook
  let { isOpen, buttonProps, contentProps } = useAccordion({
    initiallyOpen: initOpen
  });
  let curFinishedBlocks = useAppSelector(
    (state) => state.formReducer.finishedBlocks
  );
  let isContinueClicked = useAppSelector(
    (state) => state.formReducer.isContinueClicked
  );
  //let isFinished = curFinishedBlocks.includes(number);
  // Change icon based on accordion open state
  const icon = isOpen ? <IconMinus aria-hidden /> : <IconPlus aria-hidden />;
  let iconLeft = curFinishedBlocks.includes(Number(number)) ? (
    <IconCheckCircleFill aria-hidden />
  ) : null;
  !isValid
    ? (iconLeft = (
        <IconAlertCircle aria-hidden color={"red"}>
          tietoja puuttuu
        </IconAlertCircle>
      ))
    : iconLeft;
  const buttonVariant =
    isOpen && !(isContinueClicked && number == 0) ? "primary" : "secondary";

  const handleOnClick = () => {
    console.log("CANT OPEN");

    router.reload();
  };
  return (
    // TODO: define unique id (?)
    <div className={styles.headline}>
      {isContinueClicked && number == 0 ? (
        <Button
          id="headlineButton"
          {...buttonProps}
          iconRight={icon}
          variant={buttonVariant}
          fullWidth
          className={styles.headlineButton}
          onClick={() => handleOnClick()}
        >
          <div className={styles.blockHeadline}>
            <p className={styles.heading}>{text}</p> {iconLeft}
          </div>
        </Button>
      ) : (
        <Button
          id="headlineButton"
          {...buttonProps}
          iconRight={icon}
          variant={buttonVariant}
          fullWidth
          className={styles.headlineButton}
          //onClick={() => handleOnClick()}
        >
          <div className={styles.blockHeadline}>
            <p className={styles.heading}>{text}</p>
            {iconLeft}
          </div>
        </Button>
      )}
      {isContinueClicked && number == 0 ? null : (
        <Card
          aria-label="Advanced filters"
          {...contentProps}
          className={styles.card}
        >
          {children}
        </Card>
      )}
    </div>
  );
};

export default HeadlineQuestionContainer;
