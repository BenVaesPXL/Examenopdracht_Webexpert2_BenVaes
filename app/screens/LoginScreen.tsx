import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../providers/AuthContext';
import { useToast } from '../providers/ToastContext';
import { FormErrors, validateLoginForm } from '../utils/validation';

export default function LoginScreen() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });

    const validation = validateLoginForm(email, password);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password);
      toast.showSuccess('Welcome back', 'You are signed in.');
    } catch (error) {
      toast.showError('Login Failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>FindIt</Text>
          <Text style={styles.subtitle}>Sign in with your PXL account</Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            error={errors.email}
            touched={touched.email}
            placeholder="name@pxl.be"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            error={errors.password}
            touched={touched.password}
            placeholder="Password"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <LoadingSpinner size="small" text="Signing in..." />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: '#e6c364',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 0,
    marginBottom: 8,
  },
  subtitle: {
    color: '#d0c5b2',
    fontSize: 16,
  },
  form: {
    gap: 8,
  },
  button: {
    backgroundColor: '#e6c364',
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#353535',
    opacity: 0.6,
  },
  buttonText: {
    color: '#131313',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
