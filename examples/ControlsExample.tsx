import { useState } from "react";
import { Text, View } from "react-native";
import Field from "../src/ui/Field.js";
import PrimaryButton from "../src/ui/PrimaryButton.js";
import { useThemeColors } from "../src/ui/theme.js";

/** New usage example for the public selection; render inside a React Native app. */
export default function ControlsExample({
  onSave,
}: {
  onSave: (note: string) => Promise<void>;
}) {
  const colors = useThemeColors();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await onSave(note.trim());
      setMessage("Saved.");
    } catch {
      setMessage("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ gap: 16, padding: 16, backgroundColor: colors.surface }}>
      <Field label="Note" value={note} onChangeText={setNote} multiline editable={!saving} />
      <PrimaryButton label="Save note" loading={saving} disabled={!note.trim()} onPress={save} />
      <Text accessibilityLiveRegion="polite" style={{ color: colors.text }}>{message}</Text>
    </View>
  );
}
