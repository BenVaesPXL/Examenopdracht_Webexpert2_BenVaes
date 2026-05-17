import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FormInput, { Dropdown, RadioGroup } from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../providers/AuthContext';
import { useToast } from '../providers/ToastContext';
import { validateReportForm, sanitizeText } from '../utils/validation';
import { handleFormError } from '../utils/errorHandling';
import { getRooms, Room, createReport } from '../api/api';
import OfflineBanner from '../components/OfflineBanner';

interface FormData {
  roomId: string;
  problemType: string;
  priority: string;
  description: string;
  contactInfo: string;
}

interface FormErrors {
  roomId?: string;
  problemType?: string;
  priority?: string;
  description?: string;
  contactInfo?: string;
}

interface Touched {
  roomId: boolean;
  problemType: boolean;
  priority: boolean;
  description: boolean;
  contactInfo: boolean;
}

type RootStackParamList = {
  ReportForm: { roomId?: string };
};

type ReportFormRouteProp = RouteProp<RootStackParamList, 'ReportForm'>;

export default function ReportFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReportFormRouteProp>();
  const toast = useToast();
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    roomId: '',
    problemType: '',
    priority: '',
    description: '',
    contactInfo: currentUser?.email || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({
    roomId: false,
    problemType: false,
    priority: false,
    description: false,
    contactInfo: false,
  });

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
        
        if (route.params?.roomId) {
          setFormData(prev => ({ ...prev, roomId: route.params.roomId! }));
        }
      } catch (error) {
        toast.showError('Failed to Load', 'Unable to load rooms. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [toast, route.params?.roomId]);

  useEffect(() => {
    if (!currentUser?.email) {
      return;
    }

    setFormData(prev => {
      if (prev.contactInfo) {
        return prev;
      }

      return { ...prev, contactInfo: currentUser.email };
    });
  }, [currentUser?.email]);

  const roomOptions = rooms.map(room => ({
    label: `${room.id} - ${room.name}`,
    value: room.id,
  }));

  const problemTypeOptions = [
    { label: 'Technisch', value: 'Technisch' },
    { label: 'Infrastructuur', value: 'Infrastructuur' },
    { label: 'Netwerk', value: 'Netwerk' },
    { label: 'Overig', value: 'Overig' },
  ];

  const priorityOptions = [
    { label: 'Laag', value: 'Laag' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hoog', value: 'Hoog' },
  ];

  const validateField = (name: keyof FormData, value: string) => {
    const tempFormData = { ...formData, [name]: value };
    const validation = validateReportForm(tempFormData);
    
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
    const sanitizedValue = name ==='description' ? value: sanitizeText(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    if (touched[name]) {
      validateField(name, sanitizedValue);
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      roomId: true,
      problemType: true,
      priority: true,
      description: true,
      contactInfo: true,
    });

    // Validate entire form
    const validation = validateReportForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.showWarning('Validation Error', 'Please fix all errors before submitting.');
      return;
    }

    if (!currentUser) {
      toast.showError('Not Signed In', 'Please sign in before submitting a report.');
      return;
    }

    setSubmitting(true);

    try {
      const reportData = {
        roomId: formData.roomId,
        userId: currentUser.id,
        type: formData.problemType,
        description: formData.description,
        status: 'Open',
        createdAt: new Date().toISOString().split('T')[0],
      };

      await createReport(reportData);
      
      // Show success message
      toast.showSuccess('Report Submitted', 'Your issue has been reported successfully.');
      
      // Reset form
      setFormData({
        roomId: '',
        problemType: '',
        priority: '',
        description: '',
        contactInfo: currentUser.email,
      });
      setErrors({});
      setTouched({
        roomId: false,
        problemType: false,
        priority: false,
        description: false,
        contactInfo: false,
      });

    } catch (error) {
      const errorToast = handleFormError(error, 'Report Form');
      toast.showToast(errorToast);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 && 
           Object.values(formData).some(value => value !== '');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <OfflineBanner />
        <LoadingSpinner text="Loading rooms..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Report an Issue</Text>
            <Text style={styles.subtitle}>Let us know what needs attention in the room.</Text>
          </View>

          {/* Room Selection */}
          <Dropdown
            label="Room"
            value={formData.roomId}
            onValueChange={(value) => handleInputChange('roomId', value)}
            items={roomOptions}
            error={errors.roomId}
            touched={touched.roomId}
            placeholder="Select a room"
          />

          {/* Problem Type */}
          <Dropdown
            label="Problem Type"
            value={formData.problemType}
            onValueChange={(value) => handleInputChange('problemType', value)}
            items={problemTypeOptions}
            error={errors.problemType}
            touched={touched.problemType}
            placeholder="Select problem type"
          />

          {/* Priority */}
          <RadioGroup
            label="Priority"
            value={formData.priority}
            onValueChange={(value) => handleInputChange('priority', value)}
            options={priorityOptions}
            error={errors.priority}
            touched={touched.priority}
          />

          {/* Description */}
          <FormInput
            label="Description"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            onBlur={() => handleBlur('description')}
            error={errors.description}
            touched={touched.description}
            placeholder="Please describe the issue in detail (minimum 10 characters)"
            multiline
            numberOfLines={4}
          />

          <FormInput
            label="School Email (Optional)"
            value={formData.contactInfo}
            onChangeText={(value) => handleInputChange('contactInfo', value)}
            onBlur={() => handleBlur('contactInfo')}
            error={errors.contactInfo}
            touched={touched.contactInfo}
            placeholder="student@pxl.be or name@pxl.be"
            keyboardType="email-address"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid() || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid() || submitting}
          >
            {submitting ? (
              <LoadingSpinner size="small" text="Submitting..." />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    color: '#e6c364',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: '#e5e2e1',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#d0c5b2',
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#e6c364',
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#353535',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#131313',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
