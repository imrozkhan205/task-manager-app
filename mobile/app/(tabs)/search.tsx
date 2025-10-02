// app/(tabs)/search.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { taskAPI, Task } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface EnhancedTask extends Omit<Task, 'completed'> {
  status: 'pending' | 'in progress' | 'done';
  completed?: boolean;
}

export default function SearchTab() {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<EnhancedTask[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in progress' | 'done'>('all');

  const fetchTasks = async () => {
    try {
      const data = await taskAPI.getTasks();
      const enhancedTasks = data.map((task: Task) => ({
        ...task,
        status: task.status || (task.completed ? 'done' : 'pending'),
      }));
      setTasks(enhancedTasks);
      setFilteredTasks(enhancedTasks);
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
    }
  };

  const filterTasks = useCallback(() => {
    let filtered = tasks;

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(task => task.status === selectedFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      filterTasks();
    }, [filterTasks])
  );

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

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>
        {searchQuery ? '🔍' : '📝'}
      </Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No Results Found' : 'Start Searching'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? `No tasks found for "${searchQuery}"`
          : 'Search your tasks by title or description'
        }
      </Text>
    </View>
  );

  const router = useRouter();

  // Navigation function to push to the edit screen
  const handlePush = (taskId: string) => {
    // Navigates to the /edit-task route, passing the task's _id as a URL parameter
    router.push({pathname: "/edit-task", params: {id: taskId}})
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Tasks</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              // Call filterTasks immediately on change
              filterTasks();
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {(['all', 'pending', 'in progress', 'done'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilterButton
              ]}
              onPress={() => {
                setSelectedFilter(filter);
                filterTasks();
              }}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.activeFilterButtonText
              ]}>
                {filter === 'all' ? 'All' : 
                 filter === 'in progress' ? 'In Progress' : 
                 filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filteredTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            
            return (
              // 💡 The card is now a TouchableOpacity with the navigation logic
              <TouchableOpacity
                style={[styles.taskCard, { backgroundColor: statusInfo.bgColor }]}
                onPress={() => handlePush(item._id)}
                activeOpacity={0.8}
              >
                <View style={styles.taskHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
                  </View>
                  <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, item.status === 
                "done" && { textDecorationLine: 'line-through'}
              ]}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.taskDescription}>{item.description}</Text>
                    )}
                    {item.dueDate && (
                      <Text style={styles.dueDateText}>
                        📅 {new Date(item.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Results count */}
      {searchQuery && (
        <View style={styles.resultsFooter}>
          <Text style={styles.resultsText}>
            {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''} found
          </Text>
        </View>
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
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeFilterButtonText: {
    color: '#fff',
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
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: isSmallDevice ? 18 : 22,
  },
  dueDateText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#1C1C1E',
    fontWeight: '400',
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
  resultsFooter: {
    // This style block was changed to ensure the footer is correctly positioned
    // The previous implementation used an absolute-like style within a ScrollView/FlatList context which can be tricky.
    // Assuming you want the footer *above* the tab bar when search results are shown. 
    position: 'absolute', // Use absolute positioning for the footer
    bottom: 0, // Position it at the bottom of the screen
    left: 0,
    right: 0,
    // Add height of the tab bar (approx 80-100) to bottom padding if not covered by SafeAreaView/tab bar component
    paddingBottom: 100, // Adjust this padding based on your tab bar height
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingTop:10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  resultsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});