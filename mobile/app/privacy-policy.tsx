import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>👈 Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.headerTitle}>Privacy Policy</Text>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.paragraph}>
          We value your privacy. This Task Manager app stores certain
          information so you can manage your tasks effectively.
        </Text>

        <Text style={styles.sectionTitle}>📌 Information We Collect</Text>
        <Text style={styles.paragraph}>
          - Your account details (such as email/username).{"\n"}
          - Tasks you create, including their title, description, status, and
          priority.{"\n"}
          - App usage data (for improving performance).
        </Text>

        <Text style={styles.sectionTitle}>🔐 How We Use This Data</Text>
        <Text style={styles.paragraph}>
          - To securely store and display your tasks across sessions.{"\n"}
          - To allow you to update task status and track progress.{"\n"}
          - To maintain your login and account security.
        </Text>

        <Text style={styles.sectionTitle}>🚫 What We Do NOT Do</Text>
        <Text style={styles.paragraph}>
          - We do not sell your data to third parties.{"\n"}
          - We do not use your personal tasks for advertising.{"\n"}
          - We do not access your tasks unless needed for app maintenance or to
          resolve technical issues.
        </Text>

        <Text style={styles.sectionTitle}>📞 Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or requests (including deleting your data),
          contact us at: imrozkhan2258@gmail.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backButton: {
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginLeft: 16,
    marginBottom: 10,
  },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#2c3e50",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: "#34495e",
    marginBottom: 12,
  },
});
