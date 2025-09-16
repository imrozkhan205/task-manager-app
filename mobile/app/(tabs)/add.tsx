import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function AddTab() {
  // Redirect to the add-task page without keeping this component in the history stack
  return <Redirect href="/add-task" />;
}