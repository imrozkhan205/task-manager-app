// app/(tabs)/browse.tsx

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { taskAPI, Task } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface EnhancedTask extends Omit<Task, 'completed'> {
  status: 'pending' | 'in progress' | 'done';
  completed?: boolean;
}

type CategoryType = 'all' | 'priority' | 'status' | 'recent';

export default function BrowseTab() {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      const enhancedTasks = data.map((task: Task) => ({
        ...task,
        status: task.status || (task.completed ? 'done' : 'pending'),
      }));
      setTasks(enhancedTasks);
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const getTasksByCategory = () => {
    switch (selectedCategory) {
      case 'priority':
        return [...tasks].sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      case 'status':
        return [...tasks].sort((a, b) => {
          const statusOrder = { 'pending': 1, 'in progress': 2, 'done': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
      case 'recent':
        return [...tasks].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      default:
        return tasks;
    }
  };

  const getStatsData = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in progress').length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const overdue = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    return { total, pending, inProgress, completed, highPriority, overdue };
  };

  const getStatusInfo = (status: 'pending' | 'in progress' | 'done') => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', color: '#FF6B6B', bgColor: '#FFE8E8' };
      case 'in progress':
        return { icon: '🔄', color: '#4ECDC4', bgColor: '#E8F9F8' };
      case 'done':
        return { icon: '✅', color: '#45B7D1', bgColor: '#9a9cf6' };
      default:
        return { icon: '⏳', color: '#FF6B6B', bgColor: '#FFE8E8' };
    }
  };

  const getPriorityInfo = (priority: 'low' | 'medium' | 'high') => {
    switch(priority) {
      case 'low':
        return { label: 'LOW', color: '#2ecc71' };
      case 'medium':
        return { label: 'MEDIUM', color: '#f1c40f' };
      case 'high':
        return { label: 'HIGH', color: '#e74c3c' };
      default:
        return { label: 'MEDIUM', color: '#f1c40f' };
    }
  };

  // Header component for stats overview
  const StatsHeader = () => {
    const stats = getStatsData();
    
    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#4ECDC4' }]}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#45B7D1' }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#e74c3c' }]}>{stats.highPriority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#f39c12' }]}>{stats.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      </View>
    );
  };

  // Category filter component
  const CategoryFilter = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>Browse by</Text>
      <View style={styles.categoryButtons}>
        {(['all', 'priority', 'status', 'recent'] as CategoryType[]).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.activeCategoryButtonText
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Task item renderer
  const renderTaskItem = ({ item }: { item: EnhancedTask }) => {
    const statusInfo = getStatusInfo(item.status);
    const priorityInfo = getPriorityInfo(item.priority);
   
    return (
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: statusInfo.bgColor }]}
        onPress={() => router.push({ pathname: "/edit-task", params: { id: item._id } })}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          </View>
          <View style={styles.taskContent}>
            <View style={styles.taskTitleRow}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color }]}>
                <Text style={styles.priorityText}>{priorityInfo.label}</Text>
              </View>
            </View>
            {item.description && (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.taskMeta}>
              <Text style={styles.statusText}>
                {statusInfo.icon} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
              {item.dueDate && (
                <Text style={styles.dueDateText}>
                  📅 {new Date(item.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Tasks Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create your first task to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categorizedTasks = getTasksByCategory();

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <Text style={styles.headerSubtitle}>Explore your tasks by category</Text>
      </View>

      {/* Scrollable Content */}
      <FlatList
        data={categorizedTasks}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={renderTaskItem}
        ListHeaderComponent={() => (
          <View>
            <StatsHeader />
            <CategoryFilter />
          </View>
        )}
        ListEmptyComponent={EmptyState}
        // Add some bounce effect for better UX
        bounces={true}
        // Improve scroll performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: isSmallDevice ? 20 : 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  statsSection: {
    backgroundColor: '#fff',
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 12,
    color: '#6c757d',
    fontWeight: '500',
    textAlign: 'center',
  },
  categorySection: {
    backgroundColor: '#fff',
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingVertical: 16,
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeCategoryButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: isSmallDevice ? 12 : 20,
    paddingTop: 0, // Remove top padding since header handles it
    paddingBottom: 100, // Space for tab bar
  },
  taskCard: {
    borderRadius: isSmallDevice ? 16 : 20,
    padding: isSmallDevice ? 16 : 20,
    marginBottom: isSmallDevice ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusBadge: {
    width: isSmallDevice ? 36 : 44,
    height: isSmallDevice ? 36 : 44,
    borderRadius: isSmallDevice ? 18 : 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 12 : 16,
  },
  statusIcon: {
    fontSize: isSmallDevice ? 14 : 18,
    color: '#fff',
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  taskDescription: {
    fontSize: isSmallDevice ? 13 : 15,
    color: '#1C1C1E',
    marginBottom: 12,
    lineHeight: isSmallDevice ? 18 : 22,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  dueDateText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 24 : 40,
    paddingTop: 100,
  },
  emptyStateIcon: {
    fontSize: isSmallDevice ? 48 : 64,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  emptyStateTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 20 : 24,
  },
});