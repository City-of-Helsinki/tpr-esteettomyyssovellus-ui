import React from "react";
import { IconSearch, IconAngleDown, TextInput } from "hds-react";
import styles from "./SearchBoxWithButtons.module.scss";
import Button from "./QuestionButton";

// usage: not used / implemented atm, was designed to be used in the search page -> which will not be doned
// todo: delete this component if not used
const SearchBoxWithButtons = (): JSX.Element => {
  const submitSearch = () => {
    // TODO: functionality
  };

  const emptySearch = () => {
    // TODO: Add functionality
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.search}>
          <p className={styles.searchText}> Hae toimipistettä</p>
          <div className={styles.input}>
            <TextInput
              id="search"
              placeholder="Anna toimipisteen nimi tai joku muu hakusana"
            />
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
            <Button
              variant="primary"
              iconLeft={<IconSearch />}
              onClickHandler={() => submitSearch()}
            >
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
