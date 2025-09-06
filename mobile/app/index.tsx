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
  Dimensions,
  Platform,
} from "react-native";
import { taskAPI, Task } from "../services/api";
import { useRouter, useFocusEffect } from "expo-router";

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const isLargeDevice = screenWidth >= 414;

// Enhanced Task type with status field
interface EnhancedTask extends Omit<Task, 'completed'> {
  status: 'pending' | 'progress' | 'done';
  completed?: boolean; // Keep for backward compatibility
}

export default function Index() {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [orientation, setOrientation] = useState(
    screenWidth > screenHeight ? 'landscape' : 'portrait'
  );
  const router = useRouter();

  // Update orientation on dimension changes
  const updateOrientation = () => {
    const { width, height } = Dimensions.get('window');
    setOrientation(width > height ? 'landscape' : 'portrait');
  };

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
      
      // Listen for orientation changes
      const subscription = Dimensions.addEventListener('change', updateOrientation);
      
      return () => subscription?.remove();
    }, [])
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={[styles.emptyStateIcon, { fontSize: isSmallDevice ? 48 : 64 }]}>📝</Text>
      <Text style={[styles.emptyStateTitle, { fontSize: isSmallDevice ? 20 : 24 }]}>No Tasks Yet</Text>
      <Text style={[styles.emptyStateSubtitle, { fontSize: isSmallDevice ? 14 : 16 }]}>
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

  // Responsive stats layout
  const statsPerRow = orientation === 'landscape' ? 3 : (isSmallDevice ? 3 : 3);
  const statCardWidth = (screenWidth - 40 - (statsPerRow - 1) * 12) / statsPerRow;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header Stats - Responsive Grid */}
      <View style={[styles.statsContainer, { 
        flexDirection: orientation === 'landscape' ? 'row' : 'row',
        paddingHorizontal: isSmallDevice ? 12 : 20,
      }]}>
        <View style={[styles.statCard, { width: statCardWidth }]}>
          <Text style={[styles.statNumber, { fontSize: isSmallDevice ? 20 : 24 }]}>
            {tasks.filter(t => t.status === 'pending').length}
          </Text>
          <Text style={[styles.statLabel, { fontSize: isSmallDevice ? 10 : 12 }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { width: statCardWidth }]}>
          <Text style={[styles.statNumber, { fontSize: isSmallDevice ? 20 : 24 }]}>
            {tasks.filter(t => t.status === 'progress').length}
          </Text>
          <Text style={[styles.statLabel, { fontSize: isSmallDevice ? 10 : 12 }]}>In Progress</Text>
        </View>
        <View style={[styles.statCard, { width: statCardWidth }]}>
          <Text style={[styles.statNumber, { fontSize: isSmallDevice ? 20 : 24 }]}>
            {tasks.filter(t => t.status === 'done').length}
          </Text>
          <Text style={[styles.statLabel, { fontSize: isSmallDevice ? 10 : 12 }]}>Completed</Text>
        </View>
      </View>

      {/* Add Task Button - Responsive */}
      <TouchableOpacity
        style={[styles.addTaskButton, { 
          marginHorizontal: isSmallDevice ? 12 : 20,
          paddingVertical: isSmallDevice ? 14 : 18,
        }]}
        onPress={() => router.push("/add-task")}
      >
        <View style={styles.addTaskButtonContent}>
          <Text style={[styles.addTaskIcon, { fontSize: isSmallDevice ? 20 : 24 }]}>+</Text>
          <Text style={[styles.addTaskButtonText, { fontSize: isSmallDevice ? 16 : 18 }]}>Add New Task</Text>
        </View>
      </TouchableOpacity>

      {/* Task List - Responsive */}
      {tasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 20,
            paddingHorizontal: isSmallDevice ? 12 : 20,
          }}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <View style={[
                styles.taskCard, 
                { 
                  backgroundColor: statusInfo.bgColor,
                  marginHorizontal: 0, // Remove margin since we're using contentContainerStyle
                  marginBottom: isSmallDevice ? 12 : 16,
                  padding: isSmallDevice ? 16 : 20,
                  flexDirection: orientation === 'landscape' && isLargeDevice ? 'row' : 'column',
                }
              ]}>
                
                {/* Top Section: Status Badge + Task Content */}
                <View style={[
                  styles.taskMainContent,
                  { 
                    flex: orientation === 'landscape' && isLargeDevice ? 1 : undefined,
                    marginRight: orientation === 'landscape' && isLargeDevice ? 16 : 0,
                  }
                ]}>
                  <View style={styles.taskHeader}>
                    {/* Status Badge */}
                    <View style={[
                      styles.statusBadge, 
                      { 
                        backgroundColor: statusInfo.color,
                        width: isSmallDevice ? 36 : 44,
                        height: isSmallDevice ? 36 : 44,
                        borderRadius: isSmallDevice ? 18 : 22,
                      }
                    ]}>
                      <Text style={[styles.statusIcon, { fontSize: isSmallDevice ? 14 : 18 }]}>
                        {statusInfo.icon}
                      </Text>
                    </View>

                    {/* Task Content */}
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          styles.taskTitle,
                          item.status === 'done' && styles.completedTaskTitle,
                          { fontSize: isSmallDevice ? 16 : 18 }
                        ]}
                      >
                        {item.title}
                      </Text>

                      {item.description ? (
                        <Text style={[
                          styles.taskDescription,
                          { fontSize: isSmallDevice ? 13 : 15 }
                        ]}>
                          {item.description}
                        </Text>
                      ) : null}

                      {item.dueDate ? (
                        <View style={styles.dueDateContainer}>
                          <Text style={[styles.dueDateIcon, { fontSize: isSmallDevice ? 12 : 14 }]}>📅</Text>
                          <Text style={[styles.dueDateText, { fontSize: isSmallDevice ? 12 : 14 }]}>
                            {new Date(item.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Action Buttons - Mobile optimized position */}
                    {orientation !== 'landscape' && (
                      <View style={styles.actionButtonsVertical}>
                        <TouchableOpacity
                          style={[styles.editButton, { 
                            width: isSmallDevice ? 32 : 40,
                            height: isSmallDevice ? 32 : 40,
                          }]}
                          onPress={() => router.push({ pathname: "/edit-task", params: { id: item._id } })}
                        >
                          <Text style={[styles.editButtonText, { fontSize: isSmallDevice ? 12 : 16 }]}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deleteButton, { 
                            width: isSmallDevice ? 32 : 40,
                            height: isSmallDevice ? 32 : 40,
                          }]}
                          onPress={() => deleteTask(item._id)}
                        >
                          <Text style={[styles.deleteButtonText, { fontSize: isSmallDevice ? 12 : 16 }]}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Quick Status Buttons - Responsive layout */}
                  <View style={[
                    styles.quickStatusButtons,
                    { 
                      flexWrap: 'wrap',
                      justifyContent: isSmallDevice ? 'flex-start' : 'flex-start',
                      marginTop: 12,
                    }
                  ]}>
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
                              paddingVertical: isSmallDevice ? 6 : 8,
                              paddingHorizontal: isSmallDevice ? 8 : 12,
                              marginRight: 6,
                              marginBottom: 6,
                            },
                          ]}
                          onPress={() => !isCurrentStatus && updateTaskStatus(item._id, status)}
                          disabled={isCurrentStatus}
                        >
                          <View style={styles.quickStatusButtonContent}>
                            <Text style={[styles.quickStatusIcon, { fontSize: isSmallDevice ? 12 : 16 }]}>
                              {info.icon}
                            </Text>
                            <Text style={[
                              styles.quickStatusText, 
                              { 
                                color: isCurrentStatus ? '#fff' : info.color,
                                fontSize: isSmallDevice ? 10 : 12,
                              }
                            ]}>
                              {info.label}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Landscape Action Buttons */}
                {orientation === 'landscape' && (
                  <View style={styles.actionButtonsHorizontal}>
                    <TouchableOpacity
                      style={[styles.editButton, { marginBottom: 8 }]}
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
                )}
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

  // Custom Header Styles
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },

  // Stats Section (Header) - Responsive
  statsContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 12 : 16,
    paddingHorizontal: isSmallDevice ? 8 : 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    color: '#6c757d',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Add Task Button - Responsive
  addTaskButton: {
    marginBottom: 10,
    backgroundColor: '#4ECDC4',
    borderRadius: isSmallDevice ? 12 : 16,
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
    paddingHorizontal: 24,
  },
  addTaskIcon: {
    color: '#fff',
    fontWeight: '300',
    marginRight: 12,
  },
  addTaskButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Task Cards - Responsive
  taskCard: {
    borderRadius: isSmallDevice ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskMainContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 12 : 16,
    flexShrink: 0,
  },
  statusIcon: {
    color: '#fff',
  },
  taskContent: {
    flex: 1,
    minWidth: 0, // Prevents text overflow
  },
  taskTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: isSmallDevice ? 20 : 24,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  taskDescription: {
    color: '#6c757d',
    lineHeight: isSmallDevice ? 18 : 22,
    marginBottom: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 8 : 16,
  },
  dueDateIcon: {
    marginRight: 6,
  },
  dueDateText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  quickStatusButtons: {
    flexDirection: 'row',
  },
  quickStatusButton: {
    borderRadius: isSmallDevice ? 16 : 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatusButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatusIcon: {
    marginRight: isSmallDevice ? 4 : 6,
  },
  quickStatusText: {
    fontWeight: '600',
  },

  // Action Buttons - Responsive positioning
  actionButtonsVertical: {
    marginLeft: 8,
    flexDirection: 'column',
    gap: 6,
    alignSelf: 'flex-start',
  },
  actionButtonsHorizontal: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Empty State - Responsive
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 24 : 40,
  },
  emptyStateIcon: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  emptyStateTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 20 : 24,
    marginBottom: isSmallDevice ? 24 : 32,
  },
  emptyStateButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: isSmallDevice ? 12 : 16,
    paddingHorizontal: isSmallDevice ? 24 : 32,
    borderRadius: 25,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
  },
});