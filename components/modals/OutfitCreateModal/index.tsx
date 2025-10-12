import { X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateOutfitMutation } from '@/mutations/outfits/CreateOutfitMutation';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { ModalProps, OutfitElementData } from '@/types/createOutfitTypes';

import { ElementModal } from './ElementModal';
import { ElementsListSection } from './ElementsListSection';
import { OutfitFormFields } from './OutfitFormFields';
import { StyleTagsSection } from './StyleTagsSection';
import { OutfitState, PendingImage } from './types';

export const OutfitCreateModal = ({
  isVisible,
  onClose,
  isAnimated
}: ModalProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [elementModalVisible, setElementModalVisible] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  const pendingImagesRef = useRef<Record<string, PendingImage>>({});
  const { userId, preferredCurrency } = useUserContext();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<OutfitState>({
    defaultValues: {
      outfit_name: '',
      description: '',
      outfit_tags: [],
      outfit_elements_data: [],
      created_at: new Date().toISOString(),
      created_by: userId || '',
      outfit_id: ""
    },
    mode: 'onChange'
  });

  const { mutate: createOutfit, isPending } = useCreateOutfitMutation(
    () => {
      reset();
      pendingImagesRef.current = {};
      onClose?.();
      Alert.alert(t('outfitCreateModal.alerts.success.title'), t('outfitCreateModal.alerts.success.message'));
    },
    (error) => {
      Alert.alert(t('outfitCreateModal.alerts.error.title'), error.message || t('outfitCreateModal.alerts.error.message'));
    }
  );

  const onSubmit = async (data: OutfitState) => {
    if (data.outfit_elements_data.length === 0) {
      Alert.alert(t('outfitCreateModal.alerts.error.title'), t('outfitCreateModal.errors.elementRequired'));
      return;
    }

    try {
      const enrichedElements = data.outfit_elements_data.map((el) => {
        if (el.imageUrl.startsWith('temp://')) {
          const pending = pendingImagesRef.current[el.imageUrl];
          if (pending?.uri) {
            return { ...el, _localUri: pending.uri, _fileName: pending.fileName, _type: pending.type } as any;
          }
        }
        return el as any;
      });

      createOutfit({
        ...data,
        outfit_elements_data: enrichedElements as any,
        created_by: userId || ''
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert(t('outfitCreateModal.alerts.error.title'), error.message || t('outfitCreateModal.alerts.error.message'));
      } else {
        Alert.alert(t('outfitCreateModal.alerts.error.title'), t('outfitCreateModal.alerts.unknownError'));
      }
    }
  };

  const onElementSubmit = (data: OutfitElementData) => {
    const currentElements = getValues('outfit_elements_data') || [];
    const tempKey = data.imageUrl;
    const pending = tempKey && tempKey.startsWith('temp://') ? pendingImagesRef.current[tempKey] : undefined;
    const enriched = pending
      ? ({ ...data, _localUri: pending.uri, _fileName: pending.fileName, _type: pending.type } as any)
      : (data as any);
    setValue('outfit_elements_data', [...currentElements, enriched], {
      shouldValidate: true
    });
    setSelectedImageName(null);
    setElementModalVisible(false);
  };

  const removeImage = (index: number) => {
    const currentElements = getValues('outfit_elements_data') || [];
    const elementToRemove = currentElements[index];

    if (elementToRemove.imageUrl.startsWith('temp://')) {
      delete pendingImagesRef.current[elementToRemove.imageUrl];
    }

    setValue('outfit_elements_data', currentElements.filter((_, i) => i !== index), {
      shouldValidate: true
    });
  };

  const toggleTag = (tag: string) => {
    const currentTags = getValues('outfit_tags') || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setValue('outfit_tags', newTags, {
      shouldValidate: true
    });
  };

  const calculateTotalPrice = (elements: OutfitElementData[]): number => {
    if (!Array.isArray(elements)) return 0;
    return elements.reduce((total, element) => {
      return total + (element.price || 0);
    }, 0);
  };

  const outfitElements = watch('outfit_elements_data') || [];
  const outfitName = watch('outfit_name');
  const description = watch('description');
  const outfitTags = watch('outfit_tags') || [];

  return (
    <>
      <Modal
        visible={isVisible}
        animationType={isAnimated ? 'slide' : 'none'}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
          <View 
            className="flex-row items-center justify-between px-4 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface }}
          >
            <Pressable onPress={onClose} className="p-2">
              <X size={24} color={colors.textMuted} />
            </Pressable>
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || outfitElements.length === 0 || isPending}
              style={{ 
                paddingHorizontal: 16, 
                paddingVertical: 8, 
                borderRadius: 9999, 
                overflow: 'hidden', 
                backgroundColor: (!isValid || outfitElements.length === 0 || isPending) ? colors.borderVariant : 'transparent'
              }}
            >
              <ThemedGradient 
                active={isValid && outfitElements.length > 0 && !isPending} 
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
              />
              <Text className="font-medium text-sm" style={{ color: colors.white }}>
                {isPending ? t('outfitCreateModal.saving') : t('outfitCreateModal.save')}
              </Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-4">
            <View className="pt-6 pb-20">
              <ElementsListSection
                outfitElements={outfitElements}
                calculateTotalPrice={calculateTotalPrice}
                removeImage={removeImage}
                setElementModalVisible={setElementModalVisible}
              />

              <OutfitFormFields
                control={control}
                errors={errors}
                outfitName={outfitName}
                description={description || ''}
              />

              <StyleTagsSection
                outfitTags={outfitTags}
                toggleTag={toggleTag}
                errors={errors}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ElementModal
        elementModalVisible={elementModalVisible}
        setElementModalVisible={setElementModalVisible}
        onElementSubmit={onElementSubmit}
        pendingImagesRef={pendingImagesRef}
        selectedImageName={selectedImageName}
        setSelectedImageName={setSelectedImageName}
        preferredCurrency={preferredCurrency || 'USD'}
      />
    </>
  );
};