import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const STUDENT_NAME_KEY = 'learnmate_student_name';
const INTERESTS_KEY = 'learnmate_interests_v1';

const roadmaps: Record<string, { title: string; steps: string[] }> = {
  Java: {
    title: 'Java Roadmap',
    steps: ['Learn variables and loops', 'Practice classes and objects', 'Build a mini console app', 'Explore OOP and collections'],
  },
  'React Native': {
    title: 'React Native Roadmap',
    steps: ['Learn JSX and components', 'Build simple screens', 'Use state and props', 'Work with navigation and AsyncStorage'],
  },
  Python: {
    title: 'Python Roadmap',
    steps: ['Master variables and conditions', 'Practice loops and functions', 'Learn lists and dictionaries', 'Build a small project'],
  },
  AI: {
    title: 'AI Roadmap',
    steps: ['Learn the basics of AI concepts', 'Practice Python for data handling', 'Explore machine learning fundamentals', 'Build a mini project'],
  },
  'Web Development': {
    title: 'Web Development Roadmap',
    steps: ['Learn HTML and CSS', 'Practice JavaScript basics', 'Build responsive pages', 'Add simple projects'],
  },
};

export default function ExploreScreen() {
  const [studentName, setStudentName] = useState('Student');
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedName = await AsyncStorage.getItem(STUDENT_NAME_KEY);
        const savedInterests = await AsyncStorage.getItem(INTERESTS_KEY);
        if (savedName) setStudentName(savedName);
        if (savedInterests) setInterests(JSON.parse(savedInterests));
      } catch {
        // ignore
      }
    };

    loadData();
  }, []);

  const selectedRoadmaps = interests.length > 0 ? interests.map((item) => roadmaps[item]).filter(Boolean) : [roadmaps['React Native']];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>🧭 Learning Roadmap</Text>
      <Text style={styles.subtitle}>A simple study path for {studentName} based on interests.</Text>

      {selectedRoadmaps.map((roadmap) => (
        <View key={roadmap.title} style={styles.card}>
          <Text style={styles.cardTitle}>{roadmap.title}</Text>
          {roadmap.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5c6ca9',
  },
  contentContainer: {
    padding: 40,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#b9bfce',
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    color: '#60a5fa',
    fontWeight: '700',
    marginRight: 10,
  },
  stepText: {
    color: '#e2e8f0',
    flex: 1,
  },
});
