// app/(tabs)/upcoming.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { taskAPI, Task } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface EnhancedTask extends Omit<Task, 'completed'> {
  status: 'pending' | 'in progress' | 'done';
  completed?: boolean;
}

export default function UpcomingTab() {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      const upcomingTasks = data
        .filter((task: Task) => task.dueDate && new Date(task.dueDate) > new Date())
        .sort((a: Task, b: Task) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .map((task: Task) => ({
          ...task,
          status: task.status || (task.completed ? 'done' : 'pending'),
        }));
      setTasks(upcomingTasks);
    } catch (err) {
      console.error("❌ Failed to fetch upcoming tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const getStatusInfo = (status: 'pending' | 'in progress' | 'done') => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', color: '#FF6B6B', bgColor: '#FFE8E8' };
      case 'in progress':
        return { icon: '🔄', color: '#4ECDC4', bgColor: '#E8F9F8' };
      case 'done':
        return { icon: '✅', color: '#45B7D1', bgColor: '#ADD8E6' };
      default:
        return { icon: '⏳', color: '#FF6B6B', bgColor: '#FFE8E8' };
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>📅</Text>
      <Text style={styles.emptyStateTitle}>No Upcoming Tasks</Text>
      <Text style={styles.emptyStateSubtitle}>
        Tasks with due dates will appear here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading upcoming tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Tasks</Text>
        <Text style={styles.headerSubtitle}>{tasks.length} tasks scheduled</Text>
      </View>

      {tasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            const daysUntil = getDaysUntilDue(item.dueDate!);
            
            return (
              <View style={[styles.taskCard, { backgroundColor: statusInfo.bgColor }]}>
                <View style={styles.taskHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.taskDescription}>{item.description}</Text>
                    )}
                    <View style={styles.dueDateInfo}>
                      <Text style={styles.dueDateText}>
                        📅 {new Date(item.dueDate!).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text style={[
                        styles.daysUntilText,
                        { color: daysUntil <= 3 ? '#e74c3c' : '#6c757d' }
                      ]}>
                        {daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </Text>
                    </View>
                  </View>
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
    backgroundColor: '#f8f9fa',
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
  listContainer: {
    paddingHorizontal: isSmallDevice ? 12 : 20,
    paddingTop: 20,
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
  taskTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: isSmallDevice ? 13 : 15,
    color: '#6c757d',
    marginBottom: 12,
    lineHeight: isSmallDevice ? 18 : 22,
  },
  dueDateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  daysUntilText: {
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 24 : 40,
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