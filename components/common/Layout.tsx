// this files code from marketing project: needs editing or deleting

import React, { ReactNode, ReactElement, useEffect, useRef } from "react";
import Head from "next/head";
import Footer from "./Footer";
import Header from "./Header";
import styles from "./Layout.module.scss";

interface LayoutProps {
  isSummary?: boolean;
  children: ReactNode;
}

// usage: general layout for including head, footer etc for all pages
const Layout = ({ isSummary, children }: LayoutProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The layout is hidden during server-side rendering so that large svg icons are not shown momentarily (in production mode)
    // Restore the proper layout styling after client-side rendering here
    if (ref.current) {
      ref.current.className = styles.layout;
    }
  });

  return (
    <div className="hidden" ref={ref}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.left} />
      <div className={styles.main}>
        <Header isSummary={isSummary} />
        {children}
        <Footer isSummary={isSummary} />
      </div>
      <div className={styles.right} />
    </div>
  );
};

export default Layout;
