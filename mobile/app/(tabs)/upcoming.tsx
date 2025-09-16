// app/(tabs)/upcoming.tsx - Updated to show Calendar view
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
  ScrollView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { taskAPI, Task } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface EnhancedTask extends Omit<Task, 'completed'> {
  status: 'pending' | 'in progress' | 'done';
  completed?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: EnhancedTask[];
}

export default function CalendarTab() {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  // Generate calendar days for current month
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week containing the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at the last day of the week containing the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      });

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: (
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
        ),
        tasks: dayTasks,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(null); // Clear selection when changing months
  };

  const getTasksForSelectedDate = (): EnhancedTask[] => {
    if (!selectedDate) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === selectedDate.getFullYear() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getDate() === selectedDate.getDate()
      );
    });
  };

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

  const renderCalendarDay = (day: CalendarDay) => {
    const isSelected = selectedDate && 
      day.date.getFullYear() === selectedDate.getFullYear() &&
      day.date.getMonth() === selectedDate.getMonth() &&
      day.date.getDate() === selectedDate.getDate();

    return (
      <TouchableOpacity
        key={day.date.toISOString()}
        style={[
          styles.calendarDay,
          !day.isCurrentMonth && styles.otherMonthDay,
          day.isToday && styles.todayDay,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => setSelectedDate(day.date)}
      >
        <Text style={[
          styles.dayNumber,
          !day.isCurrentMonth && styles.otherMonthText,
          day.isToday && styles.todayText,
          isSelected && styles.selectedDayText,
        ]}>
          {day.date.getDate()}
        </Text>
        {day.tasks.length > 0 && (
          <View style={styles.taskIndicator}>
            <Text style={styles.taskCount}>{day.tasks.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
                  🗓️ {new Date(item.dueDate).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const calendarDays = generateCalendarDays();
  const selectedDateTasks = getTasksForSelectedDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>View your tasks by date</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Week Days Header */}
        <View style={styles.weekHeader}>
          {weekDays.map(day => (
            <View key={day} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map(renderCalendarDay)}
        </View>

        {/* Selected Date Tasks */}
        {selectedDate && (
          <View style={styles.selectedDateSection}>
            <Text style={styles.selectedDateTitle}>
              Tasks for {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            
            {selectedDateTasks.length === 0 ? (
              <View style={styles.noTasksContainer}>
                <Text style={styles.noTasksIcon}>🗓️</Text>
                <Text style={styles.noTasksText}>No tasks scheduled for this date</Text>
              </View>
            ) : (
              <FlatList
                data={selectedDateTasks}
                keyExtractor={(item) => item._id}
                renderItem={renderTaskItem}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}

        {/* Today's Tasks (if no date selected) */}
        {!selectedDate && (
          <View style={styles.todaySection}>
            <Text style={styles.todayTitle}>Today's Tasks</Text>
            {(() => {
              const today = new Date();
              const todayTasks = tasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return (
                  taskDate.getFullYear() === today.getFullYear() &&
                  taskDate.getMonth() === today.getMonth() &&
                  taskDate.getDate() === today.getDate()
                );
              });

              if (todayTasks.length === 0) {
                return (
                  <View style={styles.noTasksContainer}>
                    <Text style={styles.noTasksIcon}>🎉</Text>
                    <Text style={styles.noTasksText}>No tasks due today!</Text>
                  </View>
                );
              }

              return (
                <FlatList
                  data={todayTasks}
                  keyExtractor={(item) => item._id}
                  renderItem={renderTaskItem}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              );
            })()}
          </View>
        )}
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  monthTitle: {
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: '700',
    color: '#2c3e50',
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 2,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  otherMonthDay: {
    backgroundColor: '#f8f9fa',
  },
  todayDay: {
    backgroundColor: '#e8f2ff',
  },
  selectedDay: {
    backgroundColor: '#6366f1',
  },
  dayNumber: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  otherMonthText: {
    color: '#adb5bd',
  },
  todayText: {
    color: '#6366f1',
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedDateSection: {
    backgroundColor: '#fff',
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingVertical: 20,
    marginBottom: 120, // Increased bottom margin for better visibility
  },
  selectedDateTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  todaySection: {
    backgroundColor: '#fff',
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingVertical: 20,
    marginBottom: 120, // Increased space for tab bar
  },
  todayTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
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
    color: '#6c757d',
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
    color: '#7f8c8d',
    fontWeight: '500',
  },
  dueDateText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  noTasksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTasksIcon: {
    fontSize: isSmallDevice ? 48 : 64,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  noTasksText: {
    fontSize: isSmallDevice ? 16 : 18,
    color: '#6c757d',
    textAlign: 'center',
  },
});