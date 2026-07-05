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
    backgroundColor: '#F8FAFC',
  },

  contentContainer: {
    padding: 40,
    paddingBottom: 40,
  },

  title: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: '700',
  },

  subtitle: {
    color: '#64748B',
    marginTop: 6,
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',

    // Shadow
    shadowColor: '#CBD5E1',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  cardTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  stepNumber: {
    color: '#7C83FD',
    fontWeight: '700',
    marginRight: 10,
    fontSize: 16,
  },

  stepText: {
    color: '#475569',
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});