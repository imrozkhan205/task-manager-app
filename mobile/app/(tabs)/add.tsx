// app/(tabs)/add.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AddTab() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the add-task screen when this tab is pressed
    router.push('/add-task');
  }, []);

  return null; // This component doesn't render anything
}