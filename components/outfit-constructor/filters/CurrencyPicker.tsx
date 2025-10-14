import { useTheme } from '@/providers/themeContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';

interface Currency {
  name: string;
}

interface CurrencyPickerProps {
  currencies: Currency[];
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export const CurrencyPicker = ({
  currencies,
  selectedCurrency,
  onCurrencyChange,
}: CurrencyPickerProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (currencyName: string) => {
    onCurrencyChange(currencyName);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          height: 40,
        }}
      >
        <Text style={{ color: selectedCurrency ? colors.text : colors.textMuted, fontSize: 14 }}>
          {selectedCurrency 
            ? t(`chatSection.currencies.${selectedCurrency.toLowerCase()}`)
            : t('chatSection.placeholders.currency')
          }
        </Text>
        <ChevronDown size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              width: '80%',
              maxWidth: 400,
              maxHeight: '70%',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                {t('chatSection.currency')}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Currency List */}
            <ScrollView style={{ maxHeight: 400 }}>
              {currencies.map((currency) => {
                const isSelected = selectedCurrency === currency.name;
                return (
                  <TouchableOpacity
                    key={currency.name}
                    onPress={() => handleSelect(currency.name)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: isSelected ? colors.accent + '20' : 'transparent',
                      borderLeftWidth: isSelected ? 3 : 0,
                      borderLeftColor: colors.accent,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? colors.accent : colors.text,
                        fontSize: 14,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {t(`chatSection.currencies.${currency.name.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
