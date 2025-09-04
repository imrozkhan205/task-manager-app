import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Home screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // ❌ No default header, using a custom one in index.tsx
        }}
      />

      {/* Add Task - hide header */}
      <Stack.Screen
        name="add-task"
        options={{
          headerShown: false, // ❌ no header
        }}
      />

      {/* Edit Task - hide header */}
      <Stack.Screen
        name="edit-task"
        options={{
          headerShown: false, // ❌ no header
        }}
      />
    </Stack>
  );
}