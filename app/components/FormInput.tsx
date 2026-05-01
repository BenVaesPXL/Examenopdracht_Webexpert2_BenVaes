import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity, ScrollView } from 'react-native';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: any;
}

export default function FormInput({
  label,
  error,
  touched,
  containerStyle,
  ...textInputProps
}: FormInputProps) {
  const showError = error && touched;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          showError && styles.inputError,
          textInputProps.multiline && styles.inputMultiline
        ]}
        placeholderTextColor="#4d4637"
        {...textInputProps}
      />
      {showError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#d0c5b2',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#353535',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#e5e2e1',
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
});

// Dropdown component for selections
interface DropdownProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  error?: string;
  touched?: boolean;
  placeholder?: string;
  containerStyle?: any;
}

export function Dropdown({
  label,
  value,
  onValueChange,
  items,
  error,
  touched,
  placeholder = 'Select an option',
  containerStyle,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const showError = error && touched;

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectItem = (itemValue: string) => {
    onValueChange(itemValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TouchableOpacity 
        style={[dropdownStyles.dropdown, showError && dropdownStyles.dropdownError]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={dropdownStyles.selectedText}>
          {value ? items.find(item => item.value === value)?.label || value : placeholder}
        </Text>
        <Text style={[dropdownStyles.arrow, isOpen && dropdownStyles.arrowUp]}>▼</Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={dropdownStyles.dropdownOverlay}>
          <View style={dropdownStyles.dropdownList}>
            <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    dropdownStyles.dropdownItem,
                    value === item.value && dropdownStyles.selectedItem
                  ]}
                  onPress={() => handleSelectItem(item.value)}
                >
                  <Text style={[
                    dropdownStyles.itemText,
                    value === item.value && dropdownStyles.selectedItemText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {showError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#353535',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownError: {
    borderColor: '#f44336',
  },
  selectedText: {
    color: '#e5e2e1',
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    color: '#d0c5b2',
    fontSize: 12,
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownList: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#353535',
    borderRadius: 4,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#353535',
  },
  selectedItem: {
    backgroundColor: 'rgba(230, 195, 100, 0.1)',
  },
  itemText: {
    color: '#e5e2e1',
    fontSize: 16,
  },
  selectedItemText: {
    color: '#e6c364',
    fontWeight: 'bold',
  },
});

// Radio button group component
interface RadioGroupProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  error?: string;
  touched?: boolean;
  containerStyle?: any;
}

export function RadioGroup({
  label,
  value,
  onValueChange,
  options,
  error,
  touched,
  containerStyle,
}: RadioGroupProps) {
  const showError = error && touched;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={radioGroupStyles.radioContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={radioGroupStyles.radioOption}
            onPress={() => onValueChange(option.value)}
          >
            <View style={[
              radioGroupStyles.radioCircle,
              value === option.value && radioGroupStyles.radioCircleSelected
            ]}>
              {value === option.value && (
                <View style={radioGroupStyles.radioInnerCircle} />
              )}
            </View>
            <Text style={radioGroupStyles.radioLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {showError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const radioGroupStyles = StyleSheet.create({
  radioContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#353535',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#e6c364',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e6c364',
  },
  radioLabel: {
    color: '#e5e2e1',
    fontSize: 16,
    flex: 1,
  },
});
