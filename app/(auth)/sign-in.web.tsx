import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { router } from "expo-router";
import { useWindowDimensions } from "react-native";
import { AnimatePresence, motion } from "framer-motion";

import { AuthCard } from "@/components/web/AuthCard";
import { AuthField } from "@/components/web/AuthField";
import { AuthSpinner } from "@/components/web/AuthSpinner";
import { RideMapPreview } from "@/components/web/RideMapPreview";
import { tokens } from "@/design/tokens";
import { signInWithEmail, signUpWithEmail } from "@/services/auth";
import { isFirebaseConfigured } from "@/services/firebase";

type AuthMode = "sign-in" | "sign-up";
type SubmitState = "idle" | "loading" | "success" | "error";

const palette = tokens.auth.color;
const marketing = tokens.marketing.color;
const radius = tokens.auth.radius;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const ease = [0.16, 1, 0.3, 1] as const;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function CheckIcon() {
  return (
    <svg height="16" viewBox="0 0 24 24" width="16">
      <path d="m5.5 12.5 4.2 4.1L18.5 8" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" />
    </svg>
  );
}

export default function SignInWebScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [riderName, setRiderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorText, setErrorText] = useState("");

  const content = useMemo(
    () =>
      mode === "sign-up"
        ? {
            title: "Create your rider profile.",
            subtitle: "Takes 30 seconds. No credit card.",
            buttonLabel: "Create account",
            switchLabel: "Already riding? Sign in"
          }
        : {
            title: "Welcome back.",
            subtitle: "Your room and ride history are waiting.",
            buttonLabel: "Sign in",
            switchLabel: "New here? Create your rider profile"
          },
    [mode]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFirebaseConfigured) {
      setErrorText("Firebase not configured - add .env values and restart Expo.");
      setSubmitState("error");
      return;
    }

    if (mode === "sign-up" && !riderName.trim()) {
      setErrorText("Add your rider name so the room starts with the right identity.");
      setSubmitState("error");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorText("Enter your email and password to continue.");
      setSubmitState("error");
      return;
    }

    if (mode === "sign-up" && password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      setSubmitState("error");
      return;
    }

    setErrorText("");
    setSubmitState("loading");

    try {
      if (mode === "sign-up") {
        await signUpWithEmail(email, password, riderName);
      } else {
        await signInWithEmail(email, password);
      }

      setSubmitState("success");
      await delay(520);
      router.replace(mode === "sign-up" ? "/(auth)/profile" : "/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setErrorText(message);
      setSubmitState("error");
    }
  }

  const fieldGroups = (
    <div style={fieldGroupShellStyle}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 6 }}
        style={identityGroupStyle}
        transition={{ duration: 0.35, delay: 0.45, ease }}
      >
        {mode === "sign-up" ? <AuthField autoFocus label="Rider name" onChange={setRiderName} value={riderName} /> : null}
        <AuthField autoComplete="email" autoFocus={mode === "sign-in"} label="Email address" onChange={setEmail} type="email" value={email} />
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 6 }}
        style={groupDividerStyle}
        transition={{ duration: 0.35, delay: 0.57, ease }}
      />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 6 }}
        style={credentialGroupStyle}
        transition={{ duration: 0.35, delay: 0.63, ease }}
      >
        <AuthField autoComplete={mode === "sign-in" ? "current-password" : "new-password"} label="Password" onChange={setPassword} passwordToggle value={password} />
        {mode === "sign-up" ? (
          <AuthField autoComplete="new-password" label="Confirm password" onChange={setConfirmPassword} passwordToggle value={confirmPassword} />
        ) : null}
      </motion.div>
    </div>
  );

  const warningNode: ReactNode = !isFirebaseConfigured ? (
    <div style={warningStyle}>
      <span style={warningTextStyle}>
        <span style={warningPrefixStyle}>dev · </span>
        {"\u26A0"} Firebase not configured - add .env values and restart.
      </span>
    </div>
  ) : undefined;

  return (
    <div style={pageStyle}>
      <div style={layoutStyle}>
        <section style={leftColumnStyle}>
          <div style={leftInnerStyle}>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 8 }}
              style={wordmarkBlockStyle}
              transition={{ duration: 0.45, delay: 0.05, ease }}
            >
              <div style={wordmarkRowStyle}>
                <span style={wordmarkDotStyle} />
                <span style={wordmarkStyle}>RideSync</span>
              </div>
              <span style={taglineStyle}>Group ride operations</span>
            </motion.div>

            <AuthCard
              developerWarning={warningNode}
              isMobile={isMobile}
              mode={mode}
              onSwitch={() => {
                setMode((current) => (current === "sign-up" ? "sign-in" : "sign-up"));
                setErrorText("");
                setSubmitState("idle");
              }}
              subtitle={content.subtitle}
              switchLabel={content.switchLabel}
              title={content.title}
            >
              <form onSubmit={handleSubmit} style={formStyle}>
                {fieldGroups}

                <motion.div
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  style={buttonWrapStyle}
                  transition={{ duration: 0.3, delay: 0.7, ease: "easeOut" }}
                >
                  <motion.button
                    animate={
                      submitState === "error"
                        ? {
                            x: [0, -8, 8, -8, 8, 0]
                          }
                        : {
                            x: 0
                          }
                    }
                    disabled={submitState === "loading" || submitState === "success"}
                    style={{
                      ...submitButtonStyle,
                      background:
                        submitState === "error"
                          ? palette.dangerSurface
                          : submitState === "success"
                            ? palette.successSurface
                            : palette.buttonAccent,
                      filter: submitState === "loading" ? "brightness(0.7)" : "none"
                    }}
                    transition={submitState === "error" ? { duration: 0.4, ease: "easeInOut" } : { duration: 0.15, ease: "easeOut" }}
                    type="submit"
                    whileHover={submitState === "idle" ? { filter: "brightness(1.08)" } : undefined}
                    whileTap={submitState === "idle" ? { filter: "brightness(0.95)", scale: 0.99 } : undefined}
                  >
                    <AnimatePresence initial={false} mode="wait">
                      {submitState === "loading" ? (
                        <motion.span
                          key="loading"
                          animate={{ opacity: 1, scale: 1 }}
                          initial={{ opacity: 0, scale: 0.94 }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          style={buttonContentStyle}
                        >
                          <AuthSpinner />
                        </motion.span>
                      ) : submitState === "success" ? (
                        <motion.span
                          key="success"
                          animate={{ opacity: 1, scale: 1 }}
                          initial={{ opacity: 0, scale: 0.7 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          style={buttonContentStyle}
                          transition={{ type: "spring", stiffness: 320, damping: 24 }}
                        >
                          <CheckIcon />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="label"
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          initial={{ opacity: 0, scale: 0.96 }}
                          style={buttonContentStyle}
                        >
                          {content.buttonLabel}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {errorText ? (
                      <motion.p
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        initial={{ opacity: 0, y: 6 }}
                        style={errorStyle}
                      >
                        {errorText}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              </form>
            </AuthCard>
          </div>
        </section>

        {!isMobile ? (
          <section style={rightColumnStyle}>
            <motion.div
              animate={{ opacity: 0.55 }}
              initial={{ opacity: 0 }}
              style={rightMapFrameStyle}
              transition={{ duration: 1.2, delay: 0.1, ease }}
            >
              <RideMapPreview />
            </motion.div>
            <div style={rightOverlayStyle} />
            <div style={rightLabelStyle}>Live visualization - available in product</div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: palette.background,
  overflowX: "hidden",
  overflowY: "auto",
  fontFamily: fontStack
};

const layoutStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex"
};

const leftColumnStyle: CSSProperties = {
  width: "45%",
  minHeight: "100vh",
  background: palette.background,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px"
};

const leftInnerStyle: CSSProperties = {
  width: "100%",
  display: "grid",
  justifyItems: "center",
  gap: 32
};

const rightColumnStyle: CSSProperties = {
  position: "relative",
  width: "55%",
  minHeight: "100vh",
  background: palette.backgroundAside,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 48,
  overflow: "hidden"
};

const rightMapFrameStyle: CSSProperties = {
  width: "100%",
  maxWidth: 900
};

const rightOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to right, #0C0C0E 0%, transparent 18%)",
  pointerEvents: "none"
};

const rightLabelStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: 28,
  transform: "translateX(-50%)",
  fontSize: 12,
  lineHeight: 1.4,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.25
};

const wordmarkBlockStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: 4
};

const wordmarkRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7
};

const wordmarkDotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  background: marketing.accent,
  opacity: 0.8
};

const wordmarkStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: palette.textPrimary
};

const taglineStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.3
};

const warningStyle: CSSProperties = {
  border: `1px solid ${palette.borderSubtle}`,
  background: "rgba(255,255,255,0.02)",
  borderRadius: 6,
  padding: "8px 12px"
};

const warningTextStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1.4,
  fontWeight: 400,
  color: "rgba(255,255,255,0.30)"
};

const warningPrefixStyle: CSSProperties = {
  opacity: 0.2
};

const formStyle: CSSProperties = {
  display: "grid"
};

const fieldGroupShellStyle: CSSProperties = {
  display: "grid",
  gap: 0
};

const identityGroupStyle: CSSProperties = {
  display: "grid",
  gap: 20
};

const groupDividerStyle: CSSProperties = {
  width: "100%",
  height: 1,
  background: palette.divider,
  margin: "24px 0"
};

const credentialGroupStyle: CSSProperties = {
  display: "grid",
  gap: 16
};

const buttonWrapStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 28
};

const submitButtonStyle: CSSProperties = {
  height: 42,
  width: "100%",
  border: "none",
  borderRadius: radius.button,
  color: "#FFFFFF",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 20px",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
  fontFamily: fontStack,
  fontSize: 13,
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: "0.01em",
  transition: "filter 150ms ease, background 150ms ease"
};

const buttonContentStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 120
};

const errorStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.5,
  fontWeight: 400,
  color: "rgba(224,84,84,0.88)"
};
