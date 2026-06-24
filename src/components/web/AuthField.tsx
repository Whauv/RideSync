import { useId, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.auth.color;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg height="16" viewBox="0 0 24 24" width="16">
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" fill="none" opacity="0.7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" fill="none" opacity="0.7" r="2.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ) : (
    <svg height="16" viewBox="0 0 24 24" width="16">
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" fill="none" opacity="0.7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" fill="none" opacity="0.7" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 20 20 4" fill="none" opacity="0.7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function AuthField({
  autoComplete,
  autoFocus,
  label,
  onChange,
  passwordToggle = false,
  type = "text",
  value
}: {
  autoComplete?: string;
  autoFocus?: boolean;
  label: string;
  onChange: (value: string) => void;
  passwordToggle?: boolean;
  type?: "email" | "password" | "text";
  value: string;
}) {
  const inputId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const hasValue = value.trim().length > 0;
  const raised = isFocused || hasValue;

  return (
    <div style={fieldWrapStyle}>
      <motion.label
        animate={{
          y: raised ? -22 : 0,
          fontSize: raised ? 11 : 14,
          opacity: raised ? 0.7 : 0.4,
          color: raised ? palette.accent : palette.textSecondary
        }}
        htmlFor={inputId}
        initial={false}
        style={labelStyle}
        transition={{ type: "spring", stiffness: 320, damping: 30, bounce: 0 }}
      >
        {label}
      </motion.label>
      <input
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        id={inputId}
        onBlur={() => setIsFocused(false)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder=""
        style={{
          ...inputStyle,
          borderBottomColor: isFocused ? palette.accent : palette.borderMuted,
          borderColor: isFocused ? palette.accent : "transparent",
          paddingRight: passwordToggle ? 30 : 0
        }}
        type={passwordToggle ? (visible ? "text" : "password") : type}
        value={value}
      />
      {passwordToggle ? (
        <motion.button
          whileHover={{ opacity: 0.7 }}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          style={toggleButtonStyle}
          type="button"
        >
          <span style={toggleIconStyle}>
            <EyeIcon open={visible} />
          </span>
        </motion.button>
      ) : null}
    </div>
  );
}

const fieldWrapStyle: CSSProperties = {
  position: "relative",
  height: 52
};

const labelStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 18,
  fontFamily: fontStack,
  fontWeight: 400,
  lineHeight: 1,
  pointerEvents: "none"
};

const inputStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 52,
  background: "transparent",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 0,
  borderTopColor: "transparent",
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  outline: "none",
  color: palette.textPrimary,
  fontFamily: fontStack,
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1,
  padding: "18px 0 8px",
  transition: "border-color 150ms ease, border-bottom-color 150ms ease"
};

const toggleButtonStyle: CSSProperties = {
  position: "absolute",
  right: 2,
  bottom: 14,
  width: 14,
  height: 14,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  color: palette.textPrimary,
  opacity: 0.3,
  transition: "opacity 150ms ease"
};

const toggleIconStyle: CSSProperties = {
  display: "inline-flex"
};
