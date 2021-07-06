import React from "react";
import { useAccordion, Button, IconMinus, IconPlus, IconCheckCircleFill, Card } from "hds-react";
import { HeadlineQuestionContainerProps, PathTreeProps } from "../types/general";
import styles from "./PathTreeComponent.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";

const PathTreeComponent = ({treeItems}: PathTreeProps): JSX.Element => {

    const pathTree = treeItems.map((elem) => {

        const treeItem = treeItems.indexOf(elem) != 0 ?
                        <><a>{" > "}{elem}</a></> :
                        <><p>{" > "}</p><a className={styles.link} href={"#"}>{elem}</a></>;

        return (
            treeItem
        )
    })

    return (
      <>
        <a href={"http://localhost:3000/"} className={styles.link}>{"PH: Haku"}</a> {pathTree}
      </>
    );
  };

  export default PathTreeComponent;