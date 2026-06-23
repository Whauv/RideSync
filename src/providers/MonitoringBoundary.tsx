import { Component, PropsWithChildren, ReactNode } from "react";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { captureError } from "@/services/monitoring";

interface MonitoringBoundaryState {
  hasError: boolean;
}

export class MonitoringBoundary extends Component<PropsWithChildren, MonitoringBoundaryState> {
  state: MonitoringBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error) {
    void captureError("Unhandled render error", error, {
      source: "monitoring_boundary"
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Screen>
          <AppText variant="title2">RideSync hit a critical error</AppText>
          <AppText tone="secondary">
            The error was recorded locally for beta diagnostics. Restart the app before rejoining the ride.
          </AppText>
          <Button
            label="Dismiss"
            onPress={() => {
              this.setState({ hasError: false });
            }}
          />
        </Screen>
      );
    }

    return this.props.children;
  }
}
