import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Trophy, Users, Swords } from 'lucide-react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Trophy size={64} color="#FFD700" />
        <Text style={styles.title}>Kabaddi Pulse</Text>
        <Text style={styles.subtitle}>Mobile Experience Redefined</Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Swords size={24} color="#fff" />
          <Text style={styles.featureText}>Live Scoring Engine</Text>
        </View>
        <View style={styles.featureItem}>
          <Users size={24} color="#fff" />
          <Text style={styles.featureText}>Team Management</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  hero: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginTop: 10,
  },
  features: {
    width: '100%',
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  featureText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

