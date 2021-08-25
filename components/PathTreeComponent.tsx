import React from "react";
import { PathTreeProps } from "../types/general";
import styles from "./PathTreeComponent.module.scss";
import { useAppSelector } from "../state/hooks";
import { useI18n } from "next-localization";
import { FRONT_URL_BASE } from "../types/constants";

// usage: general breadcrumb component
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
        {i18n.t("common.search")}
      </a>
      {pathTree}
    </>
  );
};

export default PathTreeComponent;
