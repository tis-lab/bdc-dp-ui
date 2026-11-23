import type { ReactNode } from "react";
import { TabPanelContainer } from "./TabPanel.styles";

// One place builds the ids, so tabs and panels can't drift apart
export const getTabId = (baseId: string, value: string) =>
  `${baseId}-tab-${value}`;
export const getPanelId = (baseId: string, value: string) =>
  `${baseId}-panel-${value}`;

/** Spread onto each <Tab> */
export const tabProps = (baseId: string, value: string) => ({
  value,
  id: getTabId(baseId, value),
  "aria-controls": getPanelId(baseId, value),
});

type Props = {
  tabId: string;
  value: string;
  /** The currently selected tab */
  current: string;
  /** Unmount when inactive. Default false keeps state like search text. */
  unmountWhenHidden?: boolean;
  children: ReactNode;
};

export default function TabPanel({
  tabId,
  value,
  current,
  unmountWhenHidden = false,
  children,
}: Props) {
  const active = value === current;

  return (
    <TabPanelContainer
      role="tabpanel"
      id={getPanelId(tabId, value)}
      aria-labelledby={getTabId(tabId, value)}
      hidden={!active}
    >
      {active || !unmountWhenHidden ? children : null}
    </TabPanelContainer>
  );
}
