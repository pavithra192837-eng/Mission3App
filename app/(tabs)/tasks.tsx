import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

const STORAGE_KEY = 'learnmate_tasks_v1';

export default function TasksScreen() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedAlert, setCompletedAlert] = useState('');
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setTasks(JSON.parse(saved));
        }
      } catch (error) {
        console.log('Failed to load tasks', error);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.log('Failed to save tasks', error);
      }
    };

    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (taskText.trim() === '') {
      Alert.alert('Missing task', 'Please enter a task name.');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText.trim(),
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id === id && !task.completed) {
          triggerCompletionAnimation(task.text);
          return { ...task, completed: true };
        }
        return task.id === id ? { ...task, completed: !task.completed } : task;
      }),
    );
  };

  const triggerCompletionAnimation = (taskText: string) => {
    setCompletedAlert(`Congrats! You completed “${taskText}”`);
    animationValue.setValue(0);
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => setCompletedAlert(''), 1800);
    });
  };

  const deleteTask = (id: string) => {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setTasks((current) => current.filter((task) => task.id !== id)),
      },
    ]);
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>✅ Daily Tasks</Text>
      <Text style={styles.subtitle}>Plan your study goals and mark them as done.</Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressText}>{completedCount}/{tasks.length} tasks done</Text>
        <Text style={styles.progressPercent}>{progressPercent}%</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={taskText}
          onChangeText={setTaskText}
          placeholder="Add a task"
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={styles.taskCard}
          onPress={() => toggleTask(task.id)}
          onLongPress={() => deleteTask(task.id)}
        >
          <View style={styles.checkbox}>{task.completed ? <Text style={styles.checkmark}>✓</Text> : null}</View>
          <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>{task.text}</Text>
          <Text style={styles.deleteLabel}>Delete</Text>
        </TouchableOpacity>
      ))}
      {completedAlert ? (
        <Animated.View
          style={[
            styles.congratsOverlay,
            {
              opacity: animationValue,
              transform: [
                {
                  scale: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.05],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.congratsText}>{completedAlert}</Text>
          <Text style={styles.lightningText}>⚡⚡⚡</Text>
        </Animated.View>
      ) : null}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5c6ca9',
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 40,
    paddingBottom: 36,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9aa4bf',
    marginTop: 6,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#111c3f',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressPercent: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#111c3f',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: '#111c3f',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#60a5fa',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  taskText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  deleteLabel: {
    color: '#f97316',
    fontWeight: '700',
    marginLeft: 12,
  },
  congratsOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 120,
    backgroundColor: 'rgba(79, 70, 229, 0.95)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  congratsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  lightningText: {
    color: '#ffe066',
    fontSize: 26,
  },
});
