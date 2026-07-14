import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={session ? '/(app)/(tabs)' : '/login'} />;
}
