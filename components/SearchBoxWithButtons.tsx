import React, { ChangeEvent } from "react";
import { IconSearch, IconAngleDown, TextInput } from "hds-react";
import styles from "./SearchBoxWithButtons.module.scss";
import Button from "./QuestionButton";

const SearchBoxWithButtons = (): JSX.Element => {
  const submitSearch = () => {
    // TODO: functionality
    console.log("Search");
  };

  const emptySearch = () => {
    // TODO: Add functionality
    console.log("Empty search");
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.search}>
          <p className={styles.searchText}> Hae toimipistettä</p>
          <div className={styles.input}>
            <TextInput id="search" placeholder="Anna toimipisteen nimi tai joku muu hakusana" />
            <div>
              <a
                // TODO: Add functionality
                className={styles.helpText}
              >
                {" "}
                näytä hakuohje <IconAngleDown style={{ marginLeft: "1px" }} />
              </a>
            </div>
          </div>
          <div className={styles.button}>
            <Button variant="primary" iconLeft={<IconSearch />} onClickHandler={() => submitSearch()}>
              Hae
            </Button>
          </div>
          <div id="empty" className={styles.button}>
            <Button variant="secondary" onClickHandler={() => emptySearch()}>
              Tyhjennä
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBoxWithButtons;
