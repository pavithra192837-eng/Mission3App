import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Course = {
  id: string;
  title: string;
  teacher: string;
  playlist: string;
  progress: string;
};

const STORAGE_KEY = 'learnmate_courses_v1';

const defaultCourses: Course[] = [
  {
    id: '1',
    title: 'JavaScript Basics',
    teacher: 'EMC Tamil',
    progress: '40%',
    playlist: 'https://www.youtube.com/results?search_query=javascript+for+beginners',
  },
  {
    id: '2',
    title: 'React Native Crash Course',
    teacher: 'Codevolution',
    progress: '65%',
    playlist: 'https://www.youtube.com/results?search_query=react+native+full+course',
  },
  {
    id: '3',
    title: 'Python for Students',
    teacher: 'FreeCodeCamp',
    progress: '25%',
    playlist: 'https://www.youtube.com/results?search_query=python+for+students',
  },
  {
    id: '4',
    title: 'IndiaBix Aptitude',
    teacher: 'IndiaBix',
    progress: '10%',
    playlist: 'https://www.indiabix.com/aptitude/',
  },
];

export default function CoursesScreen() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseTeacher, setCourseTeacher] = useState('');
  const [courseLink, setCourseLink] = useState('');
  const [storedCourses, setStoredCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setStoredCourses(JSON.parse(saved));
          return;
        }
      } catch {
        // ignore
      }
      setStoredCourses(defaultCourses);
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const saveCourses = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedCourses));
      } catch {
        // ignore
      }
    };

    saveCourses();
  }, [storedCourses]);

  const addCourse = () => {
    if (!courseTitle.trim()) {
      Alert.alert('Missing course', 'Enter a course title to add.');
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseTitle.trim(),
      teacher: courseTeacher.trim() || 'Self-study',
      playlist: courseLink.trim() || 'https://www.youtube.com',
      progress: '0%',
    };

    setStoredCourses([newCourse, ...storedCourses]);
    setCourseTitle('');
    setCourseTeacher('');
    setCourseLink('');
  };

  const deleteCourse = (id: string) => {
    Alert.alert('Delete course', 'Remove this course from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setStoredCourses((current) => current.filter((course) => course.id !== id)),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>📚 My Courses</Text>
      <Text style={styles.subtitle}>Continue learning from your saved playlists.</Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Course title"
          placeholderTextColor="#94a3b8"
          value={courseTitle}
          onChangeText={setCourseTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Teacher or source"
          placeholderTextColor="#94a3b8"
          value={courseTeacher}
          onChangeText={setCourseTeacher}
        />
        <TextInput
          style={styles.input}
          placeholder="Playlist or link"
          placeholderTextColor="#94a3b8"
          value={courseLink}
          onChangeText={setCourseLink}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCourse}>
          <Text style={styles.addButtonText}>Add Course</Text>
        </TouchableOpacity>
      </View>

      {storedCourses.map((course) => (
        <View key={course.id} style={styles.card}>
          <Text style={styles.cardTitle}>{course.title}</Text>
          <Text style={styles.cardTeacher}>By {course.teacher}</Text>
          <Text style={styles.cardProgress}>{course.progress} completed</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL(course.playlist)}
          >
            <Text style={styles.buttonText}>Open Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteCourse(course.id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
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
  card: {
    backgroundColor: '#111c3f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  inputCard: {
    backgroundColor: '#111c3f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#d946ef',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cardTeacher: {
    color: '#8fb6ff',
    marginTop: 4,
  },
  cardProgress: {
    color: '#cbd5e1',
    marginTop: 6,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
