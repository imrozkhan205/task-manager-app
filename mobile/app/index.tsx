import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { taskAPI, Task } from "../services/api";
import { useRouter, useFocusEffect } from "expo-router";

// Enhanced Task type with status field
interface EnhancedTask extends Omit<Task, 'completed'> {
  status: 'pending' | 'progress' | 'done';
  completed?: boolean; // Keep for backward compatibility
}

export default function Index() {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      setTasks(prevTasks => data.map((task: Task) => {
        const existing = prevTasks.find(t => t._id === task._id);
        return {
          ...task,
          status: existing ? existing.status : (task.completed ? 'done' : 'pending')
        };
      }));
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: 'pending' | 'progress' | 'done') => {
    try {
      const task = tasks.find(t => t._id === id);
      if (!task) return;

      // Update local state
      setTasks(prev =>
        prev.map(t => t._id === id ? { ...t, status: newStatus } : t)
      );

      // Toggle backend only if switching between done/pending
      if ((newStatus === 'done') !== task.completed) {
        await taskAPI.toggleTask(id);
      }
    } catch (err) {
      console.error("❌ Failed to update task status:", err);
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await taskAPI.deleteTask(id);
            fetchTasks();
          } catch (err) {
            console.error("❌ Failed to delete task:", err);
          }
        },
      },
    ]);
  };

  const getStatusInfo = (status: 'pending' | 'progress' | 'done') => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', label: 'Pending', color: '#FF6B6B', bgColor: '#FFE8E8' };
      case 'progress':
        return { icon: '🔄', label: 'In Progress', color: '#4ECDC4', bgColor: '#E8F9F8' };
      case 'done':
        return { icon: '✅', label: 'Done', color: '#45B7D1', bgColor: '#E8F4FD' };
      default:
        return { icon: '⏳', label: 'Pending', color: '#FF6B6B', bgColor: '#FFE8E8' };
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>📝</Text>
      <Text style={styles.emptyStateTitle}>No Tasks Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create your first task to get started with managing your productivity
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => router.push("/add-task")}
      >
        <Text style={styles.emptyStateButtonText}>✨ Create First Task</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'progress').length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'done').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() => router.push("/add-task")}
      >
        <View style={styles.addTaskButtonContent}>
          <Text style={styles.addTaskIcon}>+</Text>
          <Text style={styles.addTaskButtonText}>Add New Task</Text>
        </View>
      </TouchableOpacity>

      {/* Task List */}
      {tasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <View style={[styles.taskCard, { backgroundColor: statusInfo.bgColor }]}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                  <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
                </View>

                {/* Task Content */}
                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      // Apply the line-through style conditionally
                      item.status === 'done' && styles.completedTaskTitle,
                    ]}
                  >
                    {item.title}
                  </Text>

                  {item.description ? (
                    <Text style={styles.taskDescription}>{item.description}</Text>
                  ) : null}

                  {item.dueDate ? (
                    <View style={styles.dueDateContainer}>
                      <Text style={styles.dueDateIcon}>📅</Text>
                      <Text style={styles.dueDateText}>
                        {new Date(item.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  ) : null}

                  {/* Quick Status Buttons */}
                  <View style={styles.quickStatusButtons}>
                    {(['pending', 'progress', 'done'] as const).map((status) => {
                      const info = getStatusInfo(status);
                      const isCurrentStatus = item.status === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.quickStatusButton,
                            {
                              backgroundColor: isCurrentStatus ? info.color : '#fff',
                              borderColor: info.color,
                            },
                          ]}
                          onPress={() => !isCurrentStatus && updateTaskStatus(item._id, status)}
                          disabled={isCurrentStatus}
                        >
                          <Text style={styles.quickStatusIcon}>{info.icon}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push({ pathname: "/edit-task", params: { id: item._id } })}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteTask(item._id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },

  // Stats Section (Header)
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10, // Reduced padding
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },

  // Add Task Button
  addTaskButton: {
    marginHorizontal: 20,
    marginBottom: 10, // Reduced margin
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addTaskButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  addTaskIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
    marginRight: 12,
  },
  addTaskButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Task Cards
  taskCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    fontSize: 18,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: 24,
  },
  // Correct style for the line-through effect
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  taskDescription: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dueDateIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  dueDateText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  quickStatusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickStatusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatusIcon: {
    fontSize: 16,
  },

  // Action Buttons
  actionButtons: {
    marginLeft: 12,
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});