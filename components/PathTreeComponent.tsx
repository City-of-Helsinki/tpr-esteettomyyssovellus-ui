import React from "react";
import {
  useAccordion,
  Button,
  IconMinus,
  IconPlus,
  IconCheckCircleFill,
  Card
} from "hds-react";
import {
  HeadlineQuestionContainerProps,
  PathTreeProps
} from "../types/general";
import styles from "./PathTreeComponent.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { useI18n } from "next-localization";

const PathTreeComponent = ({ treeItems }: PathTreeProps): JSX.Element => {
  const i18n = useI18n();
  const length = treeItems.length;
  const curServicepointId = useAppSelector(
    (state) => state.formReducer.currentServicepointId
  );
  const pathTree = treeItems.map((elem) => {
    const treeItem =
      treeItems.indexOf(elem) == length - 1 ? (
        <>
          <a>
            {" > "}
            {elem}
          </a>
        </>
      ) : (
        <>
          <p>{" > "}</p>
          <a
            className={styles.link}
            href={"http://localhost:3000/servicepoint/" + curServicepointId}
          >
            {elem}
          </a>
        </>
      );

    return treeItem;
  });

  return (
    <>
      <a href={"http://localhost:3000/"} className={styles.link}>
        {"PH: Haku"}
      </a>{" "}
      {pathTree}
    </>
  );
};

export default PathTreeComponent;
