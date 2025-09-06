import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // IMPORTANT: This must be false
        }}
      />
      <Stack.Screen
        name="add-task"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-task"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}