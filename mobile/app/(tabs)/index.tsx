// app/(tabs)/index.tsx - Optimized with Pagination
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { taskAPI, Task } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useFocusEffect, router } from "expo-router";
import { BlurView } from "expo-blur";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const isLargeDevice = screenWidth >= 414;

interface EnhancedTask extends Omit<Task, 'completed'> {
  status: 'pending' | 'in progress' | 'done';
  completed?: boolean;
}

interface StickyHeaderProps {
  tasks: EnhancedTask[];
}

// Authentication Header Component (unchanged)
const AuthenticatedHeader = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }
        }
      ]
    );
  };

  const closeMenu = () => {
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  };

  return (
    <>
      <View style={headerStyles.container}>
        <View style={headerStyles.content}>
          <View>
            <Text style={headerStyles.title}>Noteify</Text>
            <Text style={headerStyles.subtitle}>Welcome back, {user?.name}!</Text>
          </View>

          <TouchableOpacity
            style={headerStyles.userButton}
            onPress={() => setShowUserMenu(!showUserMenu)}
          >
            <Text style={headerStyles.userIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showUserMenu && (
        <TouchableOpacity
          style={headerStyles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={headerStyles.dropdown}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={headerStyles.userInfo}>
                <Text style={headerStyles.userName}>{user?.name}</Text>
                <Text style={headerStyles.userEmail}>{user?.email}</Text>
              </View>
              <TouchableOpacity
                style={headerStyles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={headerStyles.logoutIcon}>🚪</Text>
                <Text style={headerStyles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={headerStyles.privacyButton}
              onPress={() => {
                setShowUserMenu(false);
                router.push("/privacy-policy");
              }}
            >
              <Text style={headerStyles.privacyIcon}>📜</Text>
              <Text style={headerStyles.privacyText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

// Sticky Header Component (unchanged)
const StickyHeader: React.FC<StickyHeaderProps> = ({ tasks }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
  const statsPerRow = orientation === 'landscape' ? 3 : (isSmallDevice ? 3 : 3);
  const statCardWidth = (screenWidth - 40 - (statsPerRow - 1) * 12) / statsPerRow;

  return (
    <View style={styles.stickyHeader}>
      <BlurView
        style={styles.blurContainer}
        intensity={80}
        tint="light"
      >
        <View style={[styles.statsContainer, {
          flexDirection: orientation === 'landscape' ? 'row' : 'row',
          paddingHorizontal: isSmallDevice ? 12 : 20,
          paddingTop: 16,
        }]}>
          <View style={[styles.statCard, { width: statCardWidth }]}>
            <Text style={[styles.statNumber, { fontSize: isSmallDevice ? 20 : 24 }]}>
              {pendingCount}
            </Text>
            <Text style={[styles.statLabel, { fontSize: isSmallDevice ? 10 : 12 }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { width: statCardWidth }]}>
            <Text style={[styles.statNumber, { fontSize: isSmallDevice ? 20 : 24 }]}>
              {inProgressCount}
            </Text>
            <Text style={[styles.statLabel, { fontSize: isSmallDevice ? 10 : 12 }]}>In Progress</Text>
          </View>
          <View style={[styles.statCard, { width: statCardWidth }]}>
            <Text style={[styles.statNumber, { fontSize: isSmallDevice ? 20 : 24 }]}>
              {doneCount}
            </Text>
            <Text style={[styles.statLabel, { fontSize: isSmallDevice ? 10 : 12 }]}>Completed</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addTaskButton,
            { 
              marginBottom: 16,
              marginHorizontal: isSmallDevice ? 12 : 20,
              paddingVertical: isSmallDevice ? 14 : 18,
            }
          ]}
          onPress={() => router.push("/add-task")}
        >
          <View style={styles.addTaskButtonContent}>
            <Text style={[styles.addTaskIcon, { fontSize: isSmallDevice ? 20 : 24 }]}>+</Text>
            <Text style={[styles.addTaskButtonText, { fontSize: isSmallDevice ? 16 : 18 }]}>Add New Task</Text>
          </View>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const Footer = () => {
  return (
    <View style={footerStyles.container}>
      <Text style={footerStyles.text}>Made by Imroz</Text>
    </View>
  );
};

export default function HomeTab() {
  // 🚀 NEW: Pagination states
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [displayedTasks, setDisplayedTasks] = useState<EnhancedTask[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5; // Load 5 tasks at a time
  
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orientation, setOrientation] = useState(
    screenWidth > screenHeight ? 'landscape' : 'portrait'
  );
  const router = useRouter();

  const getPriorityInfo = (priority: 'low' | 'medium' | 'high') => {
    switch(priority) {
      case 'low':
        return { label: '⏳ LOW', color: '#2ecc71' };
      case 'medium':
        return { label: '🔖 MEDIUM', color: '#f1c40f' };
      case 'high':
        return { label: '🚩 HIGH', color: '#e74c3c' };
      default:
        return { label: '🔖 MEDIUM', color: '#f1c40f' };
    }
  };

  const updateOrientation = () => {
    const { width, height } = Dimensions.get('window');
    setOrientation(width > height ? 'landscape' : 'portrait');
  };

  // 🚀 OPTIMIZED: Fetch only initial batch
  const fetchTasks = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }
      
      const data = await taskAPI.getTasks();
      const enhancedTasks = data.map((task: Task) => ({
        ...task,
        status: task.status || (task.completed ? 'done' : 'pending'),
      }));
      
      setTasks(enhancedTasks);
      
      // Load only first batch
      const initialBatch = enhancedTasks.slice(0, ITEMS_PER_PAGE);
      setDisplayedTasks(initialBatch);
      setPage(1);
      setHasMore(enhancedTasks.length > ITEMS_PER_PAGE);
      
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
      Alert.alert("Error", "Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🚀 NEW: Load more tasks when scrolling
  const loadMoreTasks = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Simulate slight delay for smooth loading (optional)
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newTasks = tasks.slice(startIndex, endIndex);
      
      if (newTasks.length > 0) {
        setDisplayedTasks(prev => [...prev, ...newTasks]);
        setPage(nextPage);
        setHasMore(endIndex < tasks.length);
      } else {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 300);
  };

  const updateTaskStatus = async (id: string, newStatus: "pending" | "in progress" | "done") => {
    try {
      const task = displayedTasks.find(t => t._id === id);
      if (!task) return;

      const mappedStatus = newStatus === "in progress" ? "in progress" : newStatus;

      // Update both lists
      setDisplayedTasks(prev =>
        prev.map(t =>
          t._id === id ? { ...t, status: mappedStatus } : t
        )
      );
      
      setTasks(prev =>
        prev.map(t =>
          t._id === id ? { ...t, status: mappedStatus } : t
        )
      );

      await taskAPI.updateTask(id, { status: newStatus });
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
            // Remove from both lists
            setDisplayedTasks(prev => prev.filter(t => t._id !== id));
            setTasks(prev => prev.filter(t => t._id !== id));
          } catch (err) {
            console.error("❌ Failed to delete task:", err);
            Alert.alert("Error", "Failed to delete task. Please try again.");
          }
        },
      },
    ]);
  };

  const getStatusInfo = (status: 'pending' | 'in progress' | 'done') => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', label: 'Pending', color: '#FF6B6B', bgColor: '#FFE8E8' };
      case 'in progress':
        return { icon: '🔄', label: 'In Progress', color: '#4ECDC4', bgColor: '#E8F9F8' };
      case 'done':
        return { icon: '✅', label: 'Done', color: '#45B7D1', bgColor: '#9a9cf6' };
      default:
        return { icon: '⏳', label: 'Pending', color: '#FF6B6B', bgColor: '#FFE8E8' };
    }
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 100);

      fetchTasks();
      
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
      <Footer />
    </View>
  );

  // 🚀 NEW: Footer loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4ECDC4" />
        <Text style={styles.footerLoaderText}>Loading more tasks...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statsPerRow = orientation === 'landscape' ? 3 : (isSmallDevice ? 3 : 3);
  const statCardWidth = (screenWidth - 40 - (statsPerRow - 1) * 12) / statsPerRow;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <AuthenticatedHeader />

      {tasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={displayedTasks}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 80,
            paddingHorizontal: isSmallDevice ? 12 : 20,
          }}
          ListHeaderComponent={tasks.length > 0 ? <StickyHeader tasks={tasks} /> : null}
          stickyHeaderIndices={[0]}
          refreshing={refreshing}
          onRefresh={() => fetchTasks(true)}
          // 🚀 NEW: Infinite scroll
          onEndReached={loadMoreTasks}
          onEndReachedThreshold={0.5} // Load more when 50% from bottom
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <View style={[
                styles.taskCard,
                {
                  backgroundColor: statusInfo.bgColor,
                  marginHorizontal: 0,
                  marginBottom: isSmallDevice ? 12 : 16,
                  padding: isSmallDevice ? 16 : 20,
                  flexDirection: orientation === 'landscape' && isLargeDevice ? 'row' : 'column',
                }
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, marginBottom: 6 }}>
                  <Text style={{ fontWeight: '600', color: '#555', marginRight: 8 }}>Priority:</Text>
                  <View style={{
                    backgroundColor: getPriorityInfo(item.priority).color,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12
                  }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 10 }}>
                      {getPriorityInfo(item.priority).label}
                    </Text>
                  </View>
                </View>

                <View style={[
                  styles.taskMainContent,
                  {
                    flex: orientation === 'landscape' && isLargeDevice ? 1 : undefined,
                    marginRight: orientation === 'landscape' && isLargeDevice ? 16 : 0,
                  }
                ]}>
                  <View style={styles.taskHeader}>
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

                  <View style={[
                    styles.quickStatusButtons,
                    {
                      flexWrap: 'wrap',
                      justifyContent: isSmallDevice ? 'flex-start' : 'flex-start',
                      marginTop: 12,
                    }
                  ]}>
                    {(['pending', 'in progress', 'done'] as const).map((status) => {
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
          ListEmptyComponent={tasks.length === 0 ? renderEmptyState : null}
        />
      )}
    </SafeAreaView>
  );
}

// Styles remain the same, just adding footer loader styles
const headerStyles = StyleSheet.create({
  privacyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  privacyIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  privacyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  container: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: isSmallDevice ? 20 : 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: isSmallDevice ? 20 : 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  userButton: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 20 : 22,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    fontSize: isSmallDevice ? 18 : 20,
    color: '#fff',
  },
  userInfo: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 12,
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
});

const footerStyles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  text: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#6c757d',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

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
  // 🚀 NEW: Footer loader styles
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  stickyHeader: {
    backgroundColor: 'transparent',
    paddingTop: 0,
  },
  blurContainer: {
    paddingBottom: 2,
    overflow: 'hidden',
    borderBottomEndRadius:10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statsContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
    paddingLeft:7
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
  addTaskButton: {
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
    minWidth: 0,
  },
  taskTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: isSmallDevice ? 20 : 24,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#2c3e50',
  },
  taskDescription: {
    color: '#1C1C1E',
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
    color: '#1C1C1E',
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