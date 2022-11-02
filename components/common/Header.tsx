import React, { KeyboardEvent, ReactElement } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { IconSignout, Navigation } from "hds-react";
import { useAppSelector, useAppDispatch } from "../../state/hooks";
import { setChecksum, setUser } from "../../state/reducers/generalSlice";
import { defaultLocale } from "../../utils/i18n";
import styles from "./Header.module.scss";

interface HeaderProps {
  isSummary?: boolean;
  children?: React.ReactNode;
}

// NOTE: The HDS Navigation component does not currently work for mobile views when server-side rendering
// A workaround for this is to only use the Navigation component on the client-side
const DynamicNavigation = dynamic(
  // @ts-ignore: A dynamic import must be used to force client-side rendering regardless of the typescript errors
  () => import("hds-react").then((hds) => hds.Navigation),
  { ssr: false }
);

const Header = ({ isSummary, children }: HeaderProps): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.generalSlice.user);

  const changeLanguage = (locale: string) => {
    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(router.pathname, router.asPath, { locale, shallow: true });
  };

  const signOut = async () => {
    // Nothing to do
    window.open("https://api.hel.fi/sso/openid/end-session/", "_self");
    dispatch(setUser(""));
    dispatch(setChecksum(""));
  };

  const handleKeyPress = (evt: KeyboardEvent<HTMLAnchorElement>, id: string) => {
    if (evt.code === "Enter") {
      document.getElementById(id)?.click();
    }
  };

  return (
    <>
      <DynamicNavigation
        // @ts-ignore: The HDS Navigation component comes from a dynamic import, see above for details
        title={i18n.t("common.header.title")}
        titleAriaLabel={i18n.t("common.header.title")}
        // titleUrl={`${router.basePath}${router.asPath}`}
        menuToggleAriaLabel="menu"
        skipTo="#content"
        skipToContentLabel={i18n.t("common.header.skipToContent")}
        theme={{
          "--header-background-color": "var(--color-bus-medium-light)",
        }}
        className={styles.header}
      >
        {children}
        <Navigation.Actions>
          {/*
          <div className={styles.choices} role="region">
            <Navigation.Row>
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.homepage")}
                href={`${router.basePath}/${router.locale}`}
                active={router.pathname === `/`}
              />
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.servicepoints")}
                href={`${router.basePath}/${router.locale}/servicepoints`}
                active={router.pathname.includes("servicepoint") || router.pathname.includes("accessibilityEdit")}
              />
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.information")}
                href={`${router.basePath}/${router.locale}/about`}
                active={router.pathname === `/about`}
              />
            </Navigation.Row>
          </div>
          */}

          {!isSummary && (
            <Navigation.User label={i18n.t("common.header.login")} authenticated userName={user}>
              <Navigation.Item
                as="a"
                href="#"
                variant="supplementary"
                icon={<IconSignout aria-hidden />}
                label={i18n.t("common.header.logout")}
                onClick={signOut}
              />
            </Navigation.User>
          )}

          <Navigation.LanguageSelector label={(router.locale || defaultLocale).toUpperCase()}>
            <Navigation.Item
              role="button"
              id="fi"
              lang="fi"
              label="Suomeksi"
              tabIndex={0}
              onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "fi")}
              onClick={() => changeLanguage("fi")}
            />
            <Navigation.Item
              role="button"
              id="sv"
              lang="sv"
              label="På svenska"
              tabIndex={0}
              onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "sv")}
              onClick={() => changeLanguage("sv")}
            />
            <Navigation.Item
              role="button"
              id="en"
              lang="en"
              label="In English"
              tabIndex={0}
              onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "en")}
              onClick={() => changeLanguage("en")}
            />
          </Navigation.LanguageSelector>
        </Navigation.Actions>
      </DynamicNavigation>
    </>
  );
};

Header.defaultProps = {
  children: [],
};

export default Header;
