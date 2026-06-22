import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppModal } from "@/components/primitives/AppModal";
import { AppText } from "@/components/primitives/AppText";
import { Avatar } from "@/components/primitives/Avatar";
import { BottomSheet } from "@/components/primitives/BottomSheet";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { EmptyState } from "@/components/primitives/EmptyState";
import { IconButton } from "@/components/primitives/IconButton";
import { ListRow } from "@/components/primitives/ListRow";
import { OTPInput } from "@/components/primitives/OTPInput";
import { PermissionStateCard } from "@/components/primitives/PermissionStateCard";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { ToastDemoCard } from "@/components/primitives/Toast";

export default function DesignShowcaseScreen() {
  const [segment, setSegment] = useState<"active" | "queued" | "offline">("active");
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [code, setCode] = useState("A7Q9K");
  const [fieldValue, setFieldValue] = useState("Nederland Loop");

  return (
    <Screen scroll>
      <AppHeader
        eyebrow="INTERNAL"
        subtitle="Hidden route for validating primitives, spacing rhythm, semantic states, and light/dark theming."
        title="Design Showcase"
      />

      <Surface style={styles.block}>
        <AppText variant="title3">Buttons</AppText>
        <View style={styles.row}>
          <Button label="Primary" />
          <Button label="Secondary" variant="secondary" />
        </View>
        <View style={styles.row}>
          <Button label="Ghost" variant="ghost" />
          <Button label="Danger" variant="danger" />
        </View>
      </Surface>

      <Surface style={styles.block}>
        <AppText variant="title3">Icon actions, chips, and avatar</AppText>
        <View style={styles.row}>
          <IconButton icon="map-marker-radius-outline" />
          <IconButton icon="microphone" tone="accent" />
          <IconButton icon="alert-outline" tone="danger" />
          <Avatar accent name="Alex Mercer" />
        </View>
        <View style={styles.rowWrap}>
          <Chip label="Voice live" tone="accent" />
          <Chip label="Low fuel" tone="warning" />
          <Chip label="Stable" tone="success" />
          <Chip label="SOS" tone="danger" />
        </View>
      </Surface>

      <Surface style={styles.block}>
        <AppText variant="title3">Inputs</AppText>
        <TextField label="Destination" onChangeText={setFieldValue} value={fieldValue} />
        <OTPInput digits={5} label="Room code" onChangeText={setCode} value={code} />
        <SegmentedControl
          onChange={setSegment}
          options={[
            { label: "Active", value: "active" },
            { label: "Queued", value: "queued" },
            { label: "Offline", value: "offline" }
          ]}
          value={segment}
        />
      </Surface>

      <Surface style={styles.block}>
        <AppText variant="title3">Rows and loaders</AppText>
        <ListRow
          chevron
          leading={<Chip label="Provider" tone="neutral" />}
          subtitle="LiveKit-first voice and Firebase-backed room state."
          title="Stack status"
        />
        <SkeletonLoader />
        <SkeletonLoader width="64%" />
      </Surface>

      <PermissionStateCard
        actionLabel="Grant access"
        body="Precise location powers spacing, stale-state detection, and regroup awareness during an active ride."
        icon="crosshairs-gps"
        title="Location access"
      />

      <ToastDemoCard />

      <EmptyState
        actionLabel="Create route"
        body="When no route or destination is staged yet, the empty state stays calm and operational rather than decorative."
        icon="map-search-outline"
        title="No route staged"
      />

      <Surface style={styles.block}>
        <AppText variant="title3">Modal</AppText>
        <View style={styles.row}>
          <Button label="Open modal" onPress={() => setModalVisible(true)} variant="secondary" />
          <Button label="Open sheet" onPress={() => setSheetVisible(true)} variant="ghost" />
        </View>
      </Surface>

      <AppModal onClose={() => setModalVisible(false)} title="Modal primitive" visible={modalVisible}>
        <AppText tone="secondary">
          This dialog is tuned for short confirmations and scoped secondary decisions inside the shell.
        </AppText>
        <Button label="Close" onPress={() => setModalVisible(false)} />
      </AppModal>

      <BottomSheet onClose={() => setSheetVisible(false)} visible={sheetVisible}>
        <AppText variant="title2">Bottom sheet primitive</AppText>
        <AppText tone="secondary">
          Use this for compact, reversible ride actions that belong near the current context rather than in a full route.
        </AppText>
        <Button label="Dismiss" onPress={() => setSheetVisible(false)} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    padding: 16,
    gap: 14,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  }
});
