import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { taskAPI } from "@/services/api";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Task title is required");
      return;
    }
  
    setLoading(true);
    try {
      await taskAPI.createTask({
        title,
        description,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      });
      Alert.alert("✅ Success", "Task created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setTitle("");
      setDescription("");
      setDueDate(null);
    } catch (err: any) {
      console.error("❌ Failed to create task:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to create task");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#f8f9fa',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 18, color: '#495057' }}>👈</Text>
          </TouchableOpacity>
          
          <Text style={{ 
            fontSize: 24, 
            fontWeight: '700', 
            color: '#212529',
            flex: 1,
          }}>
            Create New Task
          </Text>
        </View>

        {/* Form Content */}
        <View style={{ 
          flex: 1, 
          paddingHorizontal: 20, 
          paddingTop: 32,
          paddingBottom: 20,
        }}>
          
          {/* Title Section */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#495057' }}>
                📝 Task Title
              </Text>
              <Text style={{ color: '#dc3545', marginLeft: 4 }}>*</Text>
            </View>
            <TextInput
              placeholder="Enter task title..."
              value={title}
              onChangeText={setTitle}
              style={{
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: title ? '#007AFF' : '#e9ecef',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                fontSize: 16,
                color: '#212529',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              placeholderTextColor="#6c757d"
            />
          </View>

          {/* Description Section */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: '#495057',
              marginBottom: 12,
            }}>
              📄 Description
            </Text>
            <TextInput
              placeholder="Add task description (optional)..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: description ? '#007AFF' : '#e9ecef',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                fontSize: 16,
                color: '#212529',
                minHeight: 100,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              placeholderTextColor="#6c757d"
            />
          </View>

          {/* Due Date Section */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: '#495057',
              marginBottom: 12,
            }}>
              📅 Due Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: dueDate ? '#007AFF' : '#e9ecef',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Text style={{
                fontSize: 16,
                color: dueDate ? '#212529' : '#6c757d',
                fontWeight: dueDate ? '500' : '400',
              }}>
                {dueDate
                  ? `📆 ${dueDate.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}`
                  : "Select due date"
                }
              </Text>
              <Text style={{ fontSize: 16, color: '#6c757d' }}>▼</Text>
            </TouchableOpacity>

            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(null)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#6c757d', fontSize: 14 }}>✕ Clear date</Text>
              </TouchableOpacity>
            )}
          </View>

          {showPicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleAddTask}
              disabled={loading || !title.trim()}
              style={{
                backgroundColor: (!title.trim() || loading) ? '#adb5bd' : '#007AFF',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                shadowColor: '#007AFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: (!title.trim() || loading) ? 0 : 0.3,
                shadowRadius: 8,
                elevation: (!title.trim() || loading) ? 0 : 4,
              }}
            >
              <Text style={{ 
                color: 'white', 
                fontWeight: '700', 
                fontSize: 16,
              }}>
                {loading ? '⏳ Creating Task...' : '✅ Create Task'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#dee2e6',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                color: '#6c757d', 
                fontWeight: '600', 
                fontSize: 16,
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}