import { motion } from "framer-motion";

import { ease, footerCenterStyle, footerDotStyle, footerLeftStyle, footerRightStyle, footerStyle } from "./adminConsoleStyles";

export function AdminConsoleFooter() {
  return (
    <motion.footer animate={{ opacity: 1 }} initial={{ opacity: 0 }} style={footerStyle} transition={{ duration: 0.3, delay: 0.45, ease }}>
      <div style={footerLeftStyle}>
        <span style={footerDotStyle} />
        <span>System · All services operational</span>
      </div>
      <div style={footerCenterStyle}>RideSync Operations Console · Internal use only</div>
      <div style={footerRightStyle}>build beta-web-01</div>
    </motion.footer>
  );
}
