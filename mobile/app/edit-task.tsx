// app/edit-task.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { taskAPI, Task } from "../services/api";

export default function EditTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskAPI.getTasks();
        const found = data.find((t: Task) => t._id === id);
        if (found) {
          setTask(found);
          setTitle(found.title);
          setDescription(found.description || "");
          setPriority(found.priority || "medium");
          setDueDate(found.dueDate ? new Date(found.dueDate) : null);
        }
      } catch (err) {
        console.error("❌ Failed to fetch task:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    try {
      await taskAPI.updateTask(id, {
        title,
        description,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      });
      Alert.alert("✅ Success", "Task updated successfully!");
      router.back();
    } catch (err) {
      console.error("❌ Failed to update task:", err);
      Alert.alert("Error", "Failed to update task. Please try again.");
    }
  };

  if (loading || !task) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading task...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Custom Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginBottom: 20,
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: "#ddd",
          borderRadius: 6,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ fontSize: 16, alignItems:"center" }}>← Back</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Edit Task
      </Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          backgroundColor: "#fff",
        }}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          backgroundColor: "#fff",
          minHeight: 80,
        }}
      />

      {/* Priority Selector */}
      <View style={{ flexDirection: "row", marginBottom: 12, gap: 10 }}>
        {["low", "medium", "high"].map((p) => (
          <TouchableOpacity
            key={p}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              backgroundColor: priority === p ? "#007AFF" : "#ddd",
            }}
            onPress={() => setPriority(p as "low" | "medium" | "high")}
          >
            <Text
              style={{
                textAlign: "center",
                color: priority === p ? "#fff" : "#000",
              }}
            >
              {p.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Due Date Picker */}
      <TouchableOpacity
        style={{
          backgroundColor: "#eee",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{dueDate ? `📅 Due: ${dueDate.toDateString()}` : "Set Due Date"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      {/* Update Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#28A745",
          padding: 14,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={handleUpdate}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          ✅ Update Task
        </Text>
      </TouchableOpacity>
    </View>
  );
}
