import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

const TASKS_KEY = 'learnmate_tasks_v1';
const INTERESTS_KEY = 'learnmate_interests_v1';

const interestOptions = ['Java', 'React Native', 'Python', 'AI', 'Web Development'];

export default function ProfileScreen() {
  const [interests, setInterests] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadData = useCallback(async () => {
    try {
      const savedInterests = await AsyncStorage.getItem(INTERESTS_KEY);
      const savedTasks = await AsyncStorage.getItem(TASKS_KEY);

      if (savedInterests) setInterests(JSON.parse(savedInterests));
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.log('Failed to load profile data', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    const saveInterests = async () => {
      try {
        await AsyncStorage.setItem(INTERESTS_KEY, JSON.stringify(interests));
      } catch (error) {
        console.log('Failed to save interests', error);
      }
    };

    saveInterests();
  }, [interests]);

  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks]);
  const stars = completedTasks.length * 10;
  const level = stars >= 250 ? 'Gold' : stars >= 100 ? 'Silver' : 'Bronze';

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    );
  };

  const recommendedCourses = useMemo(() => {
    const recs: { title: string; teacher: string; link: string }[] = [];

    if (interests.includes('Java')) {
      recs.push({ title: 'Java Full Course', teacher: 'EMC Tamil', link: 'https://www.youtube.com/results?search_query=java+full+course' });
    }
    if (interests.includes('React Native')) {
      recs.push({ title: 'React Native Playlist', teacher: 'Codevolution', link: 'https://www.youtube.com/results?search_query=react+native+playlist' });
    }
    if (interests.includes('Python')) {
      recs.push({ title: 'Python for Beginners', teacher: 'Programming with Mosh', link: 'https://www.youtube.com/results?search_query=python+for+beginners' });
    }
    if (interests.includes('AI')) {
      recs.push({ title: 'AI Essentials', teacher: 'Simplilearn', link: 'https://www.youtube.com/results?search_query=artificial+intelligence+basics' });
    }

    return recs;
  }, [interests]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>👤 Profile & Achievements</Text>
      <Text style={styles.subtitle}>Track your learning habits and interests.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Total Stars</Text>
        <Text style={styles.bigValue}>{stars}</Text>
        <Text style={styles.badge}>{level} Learner</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Choose your interests</Text>
        <View style={styles.interestRow}>
          {interestOptions.map((item) => {
            const selected = interests.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleInterest(item)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📌 Recommended Courses</Text>
        {recommendedCourses.length === 0 ? (
          <Text style={styles.emptyText}>Pick an interest to see suggestions.</Text>
        ) : (
          recommendedCourses.map((course) => (
            <View key={course.title} style={styles.recommendRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recommendTitle}>{course.title}</Text>
                <Text style={styles.recommendTeacher}>{course.teacher}</Text>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL(course.link)}>
                <Text style={styles.linkText}>Open</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Learning Timeline</Text>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks yet. Add some in the Tasks tab.</Text>
        ) : (
          tasks.map((task) => (
            <View key={task.id} style={styles.timelineRow}>
              <Text style={styles.timelineDot}>{task.completed ? '✔' : '•'}</Text>
              <Text style={[styles.timelineText, task.completed && styles.timelineCompleted]}>{task.text}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    color: '#dadee9',
    marginTop: 6,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111c3f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  bigValue: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  badge: {
    color: '#60a5fa',
    marginTop: 6,
    fontWeight: '700',
  },
  interestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#4f46e5',
  },
  chipText: {
    color: '#cbd5e1',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  recommendTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  recommendTeacher: {
    color: '#8fb6ff',
    marginTop: 2,
  },
  linkText: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  timelineDot: {
    color: '#60a5fa',
    marginRight: 8,
    fontWeight: '700',
  },
  timelineText: {
    color: '#fff',
  },
  timelineCompleted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
});
