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
  const [taskStatus, setTaskStatus] = useState<"pending" | "in progress" | "done">("pending");
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
          setTaskStatus(found.status || "pending"); // ✅ load status from backend
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
        status: taskStatus, // ✅ now properly defined
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
          paddingVertical: 2,
          paddingHorizontal: 2,
          // backgroundColor: "#ddd",
          borderRadius: 6,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ fontSize: 16, alignItems:"center", color:'#007AFF' }}>👈 Back</Text>
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
  {["low", "medium", "high"].map((p) => {
    let bgColor = "#ddd";
    let textColor = "#000";

    if (priority === p) {
      if (p === "low") bgColor = "#28A745";   // Green
      if (p === "medium") bgColor = "#FFC107"; // Yellow
      if (p === "high") bgColor = "#DC3545";   // Red
      textColor = "#fff";
    }

    return (
      <TouchableOpacity
        key={p}
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor:"#ccc",
        }}
        onPress={() => setPriority(p as "low" | "medium" | "high")}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: "500",
            color: textColor,
          }}
        >
          {p.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


      {/* Status Selector */}
      <View style={{ flexDirection: "row", marginBottom: 12, gap: 10 }}>
  {[
    { key: "pending", label: "Pending", activeColor: "#343A40" },   // Yellow
    { key: "in progress", label: "In Progress", activeColor: "#0D6EFD" }, // Blue
    { key: "done", label: "Done", activeColor: "#28A745" },         // Green
  ].map((s) => {
    const isActive = taskStatus === s.key;

    return (
      <TouchableOpacity
        key={s.key}
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: isActive ? s.activeColor : "#E9ECEF", // gray fallback
          borderWidth: 1,
          borderColor: isActive ? s.activeColor : "#ccc",
        }}
        onPress={() => setTaskStatus(s.key as "pending" | "in progress" | "done")}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: "600",
            color: isActive ? "#fff" : "#333",
          }}
        >
          {s.label.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  })}
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
