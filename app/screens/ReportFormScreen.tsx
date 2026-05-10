import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FormInput, { Dropdown, RadioGroup } from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { validateReportForm, sanitizeText } from '../utils/validation';
import { handleFormError, createSuccessToast } from '../utils/errorHandling';
import { getRooms, Room, createReport } from '../api/api';

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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    roomId: '',
    problemType: '',
    priority: '',
    description: '',
    contactInfo: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({
    roomId: false,
    problemType: false,
    priority: false,
    description: false,
    contactInfo: false,
  });

  // Load rooms for dropdown and auto-fill roomId
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
        
        // Auto-fill roomId if coming from RoomDetailScreen
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
    const sanitizedValue = sanitizeText(value);
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

    setSubmitting(true);

    try {
      const reportData = {
        roomId: formData.roomId,
        userId: '1', // TODO: Get from auth context
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
        contactInfo: '',
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
        <LoadingSpinner text="Loading rooms..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>

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

          {/* Contact Info (Optional) */}
          <FormInput
            label="Contact Info (Optional)"
            value={formData.contactInfo}
            onChangeText={(value) => handleInputChange('contactInfo', value)}
            onBlur={() => handleBlur('contactInfo')}
            error={errors.contactInfo}
            touched={touched.contactInfo}
            placeholder="Email or phone number for follow-up"
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#353535',
  },
  headerTitle: {
    color: '#e5e2e1',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 16,
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
});