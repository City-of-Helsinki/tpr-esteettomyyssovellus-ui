import { useI18n } from "next-localization";
import { useState } from "react";
import { IconCrossCircle, IconQuestionCircle } from "hds-react";
import PathTreeComponent from "./PathTreeComponent";
import Button from "../QuestionButton";
import QuestionFormGuide from "./QuestionFormGuide";
import { PageHelpProps } from "../../types/general";
import styles from "./PageHelp.module.scss";

// usage: display help at top of page
const PageHelp = ({ formGuideData, treeItems }: PageHelpProps): JSX.Element => {
  const i18n = useI18n();

  const [showContent, setShowContent] = useState(false);
  const handleToggleContent = () => {
    setShowContent(!showContent);
  };

  return !showContent ? (
    <div className={styles.pageHelp}>
      <div>
        <PathTreeComponent treeItems={treeItems} />
      </div>
      <div className={styles.helpbutton}>
        <Button variant="primary" iconLeft={<IconQuestionCircle aria-hidden />} onClickHandler={handleToggleContent}>
          {i18n.t("common.generalMainInfoIsClose")}
        </Button>
      </div>
    </div>
  ) : (
    <>
      <div className={styles.pageHelp}>
        <div>
          <PathTreeComponent treeItems={treeItems} />
        </div>
        <div className={styles.helpbutton}>
          <Button variant="secondary" iconLeft={<IconCrossCircle aria-hidden />} onClickHandler={handleToggleContent}>
            {i18n.t("common.generalMainInfoIsOpen")}
          </Button>
        </div>
      </div>
      <div>
        <QuestionFormGuide formGuideData={formGuideData} />
      </div>
    </>
  );
};

export default PageHelp;
