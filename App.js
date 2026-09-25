import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { initializeDatabase } from './database/db';
import WelcomeScreen from './components/WelcomeScreen';
import HomeScreen from './components/HomeScreen';
import FeynmanScreen from './components/FeynmanScreen';
import PomodoroScreen from './components/PomodoroScreen';

// Simple state-based navigation (no extra library needed for a few screens).
// If you later add many more screens, consider @react-navigation/native instead.
function AppContent() {
  const { colors, isDark } = useTheme();
  const [screen, setScreen] = useState('welcome');
  const [activeTab, setActiveTab] = useState('home');
  const [dbReady, setDbReady] = useState(false);

  // Create the SQLite tables (if they don't exist yet) before any screen
  // tries to read/write study notes — avoids "no such table" race conditions.
  useEffect(() => {
    let isMounted = true;
    initializeDatabase()
      .catch((err) => console.error('Database initialization failed:', err))
      .finally(() => {
        if (isMounted) setDbReady(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const goHome = () => setScreen('home');

  if (!dbReady) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {screen === 'welcome' && (
        <WelcomeScreen onGetStarted={() => setScreen('home')} />
      )}
      {screen === 'home' && (
        <HomeScreen
          activeTab={activeTab}
          onTabPress={setActiveTab}
          onNavigate={setScreen}
        />
      )}
      {screen === 'feynman' && <FeynmanScreen onBack={goHome} />}
      {screen === 'pomodoro' && <PomodoroScreen onBack={goHome} />}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
