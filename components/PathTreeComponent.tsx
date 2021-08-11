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
import { FRONT_URL_BASE } from "../types/constants";

const PathTreeComponent = ({ treeItems }: PathTreeProps): JSX.Element => {
  const i18n = useI18n();
  const length = treeItems.length;
  const curServicepointId = useAppSelector(
    (state) => state.formReducer.currentServicepointId
  );
  const pathTree = treeItems.map((elem, index) => {
    const treeItem =
      treeItems.indexOf(elem) == length - 1 ? (
        <div key={index}>
          <a>
            {" > "}
            {elem}
          </a>
        </div>
      ) : (
        <div key={index}>
          {" > "}
          <a
            className={styles.link}
            href={FRONT_URL_BASE + "details/" + curServicepointId}
          >
            {elem}
          </a>
        </div>
      );

    return treeItem;
  });

  return (
    <>
      <a href={FRONT_URL_BASE} className={styles.link}>
        {"PH: Haku"}
      </a>{" "}
      {pathTree}
    </>
  );
};

export default PathTreeComponent;
