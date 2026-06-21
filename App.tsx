import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.logo}>⚽</Text>
        <Text style={[styles.title, { color: theme.text }]}>What's The Score</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Football scores, live.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>No matches yet</Text>
        <Text style={[styles.cardBody, { color: theme.muted }]}>
          Live scores and fixtures will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const colors = {
  light: {
    background: '#f4f6f8',
    card: '#ffffff',
    border: '#e2e6ea',
    text: '#0b1f17',
    muted: '#5b6b63',
  },
  dark: {
    background: '#0b1411',
    card: '#13211b',
    border: '#1f3329',
    text: '#f1f5f3',
    muted: '#90a79b',
  },
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
