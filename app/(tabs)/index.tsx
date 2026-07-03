import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateStars, updateStreakFromCompletion } from './task-stats';

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

const STUDENT_NAME_KEY = 'learnmate_student_name';
const TASKS_KEY = 'learnmate_tasks_v1';
const STREAK_KEY = 'learnmate_streak_v1';

const quotes = [
  'Small steps every day build strong habits.',
  'Consistency beats talent when talent is not consistent.',
  'Focus on one lesson today and your future will thank you.',
  'Progress is built by showing up, not by waiting for motivation.',
];

export default function HomeScreen() {
  const [studentName, setStudentName] = useState('Student');
  const [quote, setQuote] = useState(quotes[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ streak: 0, lastCompletedDate: null as string | null });

  const stars = calculateStars(tasks);
  const streak = streakInfo.streak;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const loadName = async () => {
      try {
        const savedName = await AsyncStorage.getItem(STUDENT_NAME_KEY);
        if (savedName) setStudentName(savedName);
      } catch {
        // ignore
      }
    };

    loadName();
    const dayIndex = new Date().getDate() % quotes.length;
    setQuote(quotes[dayIndex]);
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const savedTasks = await AsyncStorage.getItem(TASKS_KEY);
      const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];
      setTasks(parsedTasks);

      const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
      const parsedStreak = savedStreak ? JSON.parse(savedStreak) : null;
      const hasCompletedTask = parsedTasks.some((task: Task) => task.completed);

      if (hasCompletedTask) {
        const updatedStreak = updateStreakFromCompletion(parsedStreak);
        setStreakInfo(updatedStreak);
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updatedStreak));
      } else if (parsedStreak) {
        setStreakInfo(parsedStreak);
      } else {
        setStreakInfo({ streak: 0, lastCompletedDate: null });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks]),
  );

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleTimer = () => setTimerRunning((current) => !current);

  const resetTimer = () => {
    setTimerSeconds(0);
    setTimerRunning(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(STUDENT_NAME_KEY);
      router.replace('/login');
    } catch {
      // ignore
    }
  };

  // Progress UI removed; no ring variables needed

  const courses = [
    {
      title: 'JavaScript Basics',
      percent: 40,
      playlist: 'https://www.youtube.com/results?search_query=javascript+for+beginners',
    },
    {
      title: 'React Native',
      percent: 65,
      playlist: 'https://www.youtube.com/results?search_query=react+native+full+course',
    },
    {
      title: 'Python for Students',
      percent: 25,
      playlist: 'https://www.youtube.com/results?search_query=python+for+students',
    },
    {
      title: 'IndiaBix Aptitude',
      percent: 10,
      playlist: 'https://www.indiabix.com/aptitude/',
    },
  ];

  const setTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerRunning(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.headerCard, styles.headerRow]}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Welcome back, {studentName} 👋</Text>
            <Text style={styles.dateText}>{today}</Text>
            <Text style={styles.subtitle}>A calm, focused plan helps you learn faster today.</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🔥 Streak</Text>
          <Text style={styles.statValue}>{streak} days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>⭐ Stars</Text>
          <Text style={styles.statValue}>{stars}</Text>
        </View>
      </View>

      {/* Today's Progress card removed as requested */}

      <View style={styles.timerCard}>
        <Text style={styles.cardTitle}>⏱️ Study Timer</Text>
        <Text style={styles.timerValue}>{formatTime(timerSeconds)}</Text>
        <View style={styles.timerOptionsRow}>
          <TouchableOpacity style={styles.timerOption} onPress={() => setTimer(1800)}>
            <Text style={styles.timerOptionText}>30m</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timerOption} onPress={() => setTimer(3600)}>
            <Text style={styles.timerOptionText}>1 hr</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timerOption} onPress={() => setTimer(7200)}>
            <Text style={styles.timerOptionText}>2 hr</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timerActionsRow}>
          <TouchableOpacity style={styles.startButton} onPress={toggleTimer}>
            <Text style={styles.startButtonText}>{timerRunning ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.sectionCard, styles.timelineCard]}>
        <Text style={styles.cardTitle}>📅 Study Timeline</Text>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>Add tasks in the Tasks tab to build your timeline.</Text>
        ) : (
          tasks.map((task) => (
            <View key={task.id} style={styles.timelineRow}>
              <Text style={styles.timelineDot}>{task.completed ? '✔' : '•'}</Text>
              <Text style={[styles.timelineText, task.completed && styles.timelineCompleted]}>{task.text}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.cardTitle}>💡 Daily Motivation</Text>
        <Text style={styles.quoteText}>“{quote}”</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>📚 Continue Learning</Text>
        {courses.map((course) => (
          <View key={course.title} style={styles.courseRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.coursePercent}>{course.percent}% completed</Text>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(course.playlist)}>
              <Text style={styles.linkText}>Open</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5c6ca9',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 36,
  },
  headerCard: {
    backgroundColor: '#111c3f',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  greeting: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  dateText: {
    color: '#8fb6ff',
    marginTop: 6,
    fontSize: 15,
  },
  subtitle: {
    color: '#9aa4bf',
    marginTop: 8,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#14224b',
    borderRadius: 16,
    padding: 14,
  },
  statLabel: {
    color: '#8fb6ff',
    fontSize: 13,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    color: '#afbdd8',
    marginBottom: 10,
  },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#22335b',
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 999,
  },
  quoteCard: {
    backgroundColor: '#111c3f',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  timerCard: {
    backgroundColor: '#111c3f',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  timerValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 12,
  },
  startButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  timelineCard: {
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timelineDot: {
    color: '#60a5fa',
    fontWeight: '700',
    marginRight: 10,
  },
  timelineText: {
    color: '#f8faff',
    flex: 1,
  },
  timelineCompleted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 8,
  },
  quoteText: {
    color: '#f8faff',
    fontSize: 15,
    lineHeight: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  logoutButton: {
    backgroundColor: '#f97316',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#111c3f',
    borderRadius: 20,
    padding: 18,
  },
  timerOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  timerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  startButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 28,
    flex: 1,
  },
  resetButton: {
    backgroundColor: '#1f2937',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 28,
    flex: 1,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  resetButtonText: {
    color: '#60a5fa',
    fontWeight: '700',
    textAlign: 'center',
  },
  timerOption: {
    backgroundColor: '#22335b',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  timerOptionText: {
    color: '#8fb6ff',
    fontWeight: '700',
  },
  courseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#22335b',
    borderBottomWidth: 1,
  },
  courseTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  coursePercent: {
    color: '#8fb6ff',
    fontSize: 13,
    marginTop: 2,
  },
  linkText: {
    color: '#60a5fa',
    fontWeight: '700',
  },
});