import React from "react";
import {
  useAccordion,
  Button,
  IconMinus,
  IconPlus,
  IconCheckCircleFill,
  Card,
  IconAlertCircle,
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
  isValid,
  id = "",
}: HeadlineQuestionContainerProps): JSX.Element => {
  // Handle accordion state with useAccordion hook
  let { isOpen, buttonProps, contentProps, toggleAccordion } = useAccordion({
    initiallyOpen: initOpen,
  });
  let curFinishedBlocks = useAppSelector(
    (state) => state.formReducer.finishedBlocks
  );
  let isContinueClicked = useAppSelector(
    (state) => state.formReducer.isContinueClicked
  );
  let curInvalidBlocks = useAppSelector(
    (state) => state.formReducer.invalidBlocks
  );
  //let isFinished = curFinishedBlocks.includes(number);
  // Change icon based on accordion open state
  const icon = isOpen ? <IconMinus aria-hidden /> : <IconPlus aria-hidden />;
  let iconLeft = curFinishedBlocks.includes(Number(number)) ? (
    <IconCheckCircleFill aria-hidden />
  ) : null;
  !isValid
    ? (iconLeft = (
        <IconAlertCircle aria-hidden color={"#b01038"}></IconAlertCircle>
      ))
    : iconLeft;
  let buttonVariant: "primary" | "secondary" | "danger" =
    isOpen && !(isContinueClicked && number == 0) ? "primary" : "secondary";

  let buttonStyle =
    number != undefined && curInvalidBlocks.includes(number) && !isOpen
      ? { borderColor: "#b01038", borderWidth: "0.2rem" }
      : {};
  buttonVariant =
    number != undefined && curInvalidBlocks.includes(number) && isOpen
      ? "danger"
      : buttonVariant;

  const handleOnClickOnFirstAccordion = () => {
    console.log("CANT OPEN");
    router.reload();
  };

  // for custom toggle and firing event resize for the leaflet maps to render properly
  // if they are hidden and no rerender/window event is triggered they will render poorly
  const handleOnClickAccordions = () => {
    toggleAccordion();
    window.dispatchEvent(new Event("resize"));
  };

  return (
    <div className={styles.headline} id={id}>
      {isContinueClicked && number == 0 ? (
        <Button
          id="headlineButton"
          {...buttonProps}
          iconRight={icon}
          variant={buttonVariant}
          fullWidth
          className={styles.headlineButton}
          onClick={() => handleOnClickOnFirstAccordion()}
          style={buttonStyle}
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
          style={buttonStyle}
          onClick={() => handleOnClickAccordions()}
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
