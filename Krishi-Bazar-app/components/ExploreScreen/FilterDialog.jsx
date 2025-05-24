import React from 'react';
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  Platform
} from 'react-native';

const FilterDialog = ({ activeFilters, onFilterChange, visible, setVisible, ProductData }) => {
  const handleFilterSelect = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: activeFilters[filterType] === value ? '' : value,
    };
    onFilterChange(newFilters);
  };

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Quantity: High to Low', value: 'quantity_desc' },
    { label: 'Quantity: Low to High', value: 'quantity_asc' }
  ];

  const dateRanges = [
    { label: 'Last 7 days', value: '7days' },
    { label: 'Last 30 days', value: '30days' },
    { label: 'Last 3 months', value: '3months' },
    { label: 'Last 6 months', value: '6months' }
  ];

  const closeModal = () => {
    setVisible(false);
  };

  return (
    <GluestackUIProvider mode="light">
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.card}>
            <View style={styles.modalHead}>
              <Text style={styles.title}>Filter Options</Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.subtitle}>Product Category</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      activeFilters.category === 'zari' && styles.activeOption,
                    ]}
                    onPress={() => handleFilterSelect('category', 'zari')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        activeFilters.category === 'zari' && styles.activeOptionText,
                      ]}
                    >
                      Zari Products
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      activeFilters.category === 'mushroom' && styles.activeOption,
                    ]}
                    onPress={() => handleFilterSelect('category', 'mushroom')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        activeFilters.category === 'mushroom' && styles.activeOptionText,
                      ]}
                    >
                      Mushroom Products
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.subtitle}>Sort By</Text>
                <View style={styles.optionsRow}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.option,
                        activeFilters.sortBy === option.value && styles.activeOption,
                      ]}
                      onPress={() => handleFilterSelect('sortBy', option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          activeFilters.sortBy === option.value && styles.activeOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.subtitle}>Date Range</Text>
                <View style={styles.optionsRow}>
                  {dateRanges.map((range) => (
                    <TouchableOpacity
                      key={range.value}
                      style={[
                        styles.option,
                        activeFilters.dateRange === range.value && styles.activeOption,
                      ]}
                      onPress={() => handleFilterSelect('dateRange', range.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          activeFilters.dateRange === range.value && styles.activeOptionText,
                        ]}
                      >
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </GluestackUIProvider>
  );
};

const { width, height } = Dimensions.get('window');
const scale = width / 375; // Base width of 375 for scaling

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: scale * 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: scale * 16,
    width: '100%',
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale * 2 },
    shadowOpacity: 0.15,
    shadowRadius: scale * 4,
    elevation: 5,
  },
  scrollContainer: {
    padding: scale * 16,
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale * 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: scale * 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    marginBottom: scale * 20,
  },
  subtitle: {
    fontSize: scale * 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    marginBottom: scale * 12,
    color: '#374151',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -scale * 4,
  },
  option: {
    marginHorizontal: scale * 4,
    marginVertical: scale * 4,
    paddingVertical: scale * 10,
    paddingHorizontal: scale * 16,
    borderRadius: scale * 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: scale * 8,
    borderRadius: scale * 20,
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    fontSize: scale * 18,
    color: '#4B5563',
    fontWeight: '500',
  },
  activeOption: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  optionText: {
    color: '#4B5563',
    fontSize: scale * 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
  },
  activeOptionText: {
    color: '#fff',
  },
});

export default FilterDialog;
