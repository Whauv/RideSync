import { motion } from "framer-motion";

import { HeaderPulseDot, RefreshIcon } from "./AdminConsoleIndicators";
import {
  clockStyle,
  ease,
  headerAccentStyle,
  headerDividerStyle,
  headerInnerStyle,
  headerLeftStyle,
  headerRightStyle,
  headerStyle,
  headerSublineStyle,
  headerTitleStyle,
  marketingLinkStyle,
  metaInlineStyle,
  metaValueStyle,
  palette,
  refreshButtonStyle,
  shellStyle
} from "./adminConsoleStyles";

interface AdminConsoleHeaderProps {
  clock: string;
  refreshSpin: number;
  onRefresh: () => void;
  onNavigateMarketing: () => void;
}

export function AdminConsoleHeader({ clock, refreshSpin, onRefresh, onNavigateMarketing }: AdminConsoleHeaderProps) {
  return (
    <motion.header animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -4 }} style={headerStyle} transition={{ duration: 0.35, ease }}>
      <div style={shellStyle}>
        <div style={headerInnerStyle}>
          <div style={headerLeftStyle}>
            <div style={headerAccentStyle} />
            <div style={{ display: "grid", gap: 2 }}>
              <div style={headerTitleStyle}>Operations Console</div>
              <div style={headerSublineStyle}>RideSync · Internal moderation, incident triage, and support visibility</div>
            </div>
          </div>

          <div style={headerRightStyle}>
            <div style={metaInlineStyle}>
              <HeaderPulseDot />
              <span style={metaValueStyle}>Operational</span>
            </div>
            <div style={headerDividerStyle} />
            <div style={clockStyle}>{clock}</div>
            <motion.button
              animate={{ rotate: refreshSpin * 360 }}
              onClick={onRefresh}
              style={refreshButtonStyle}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              whileHover={{ opacity: 0.75 }}
            >
              <RefreshIcon />
            </motion.button>
            <motion.button onClick={onNavigateMarketing} style={marketingLinkStyle} whileHover={{ color: palette.textSecondary }}>
              Marketing ↗
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
