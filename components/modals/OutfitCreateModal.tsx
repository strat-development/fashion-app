import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';
import { OutfitElements, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { useRequestPermission } from '@/hooks/useRequestPermission';
import { useCreateOutfitMutation } from '@/mutations/outfits/CreateOutfitMutation';
import { ThemedGradient, useTheme } from '@/providers/themeContext';
import { useUserContext } from '@/providers/userContext';
import { ModalProps, OutfitElementData } from '@/types/createOutfitTypes';
import { DevTool } from '@hookform/devtools';
import { Plus, Trash2, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface OutfitState {
  outfit_name: string;
  description: string | null;
  outfit_tags: string[];
  outfit_elements_data: OutfitElementData[];
  created_at: string;
  created_by: string | null;
  outfit_id: string;
}

interface PendingImage {
  uri: string;
  type?: string;
  fileName?: string;
}

export const OutfitCreateModal = ({
  isVisible,
  onClose,
  isAnimated
}: ModalProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [elementModalVisible, setElementModalVisible] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  const pendingImagesRef = useRef<Record<string, PendingImage>>({});
  const { userId, preferredCurrency } = useUserContext();
  const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[^\s]*)?$/;

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
      created_by: userId || null,
      outfit_id: ""
    },
    mode: 'onChange'
  });

  const {
    control: elementControl,
    handleSubmit: handleElementSubmit,
    formState: { errors: elementErrors, isValid: isElementValid },
    reset: resetElementForm,
    watch: watchElement,
    trigger,
    setValue: setElementValue
  } = useForm<OutfitElementData>({
    defaultValues: {
      type: '',
      price: null,
      currency: preferredCurrency || "USD",
      imageUrl: '',
      siteUrl: ''
    },
    mode: 'onChange'
  });

  const { mutate: createOutfit, isPending } = useCreateOutfitMutation(
    () => {
      reset();
      resetElementForm();
      setSelectedImageName(null);
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
        created_by: userId || null
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
    setValue('outfit_elements_data', [...currentElements, data], {
      shouldValidate: true
    });
    resetElementForm();
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

  const handleImageSelect = async () => {
    const hasPermission = await useRequestPermission();
    if (!hasPermission) {
      Alert.alert(t('outfitCreateModal.alerts.permissionDenied.title'), t('outfitCreateModal.alerts.permissionDenied.message'));
      return;
    }

    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 1,
          includeBase64: false,
        },
        (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.error('Image picker error:', response.errorMessage);
            Alert.alert(t('outfitCreateModal.alerts.imagePickerErrorMessage.title'), t('outfitCreateModal.alerts.imagePickerErrorMessage') + ' ' + response.errorMessage);;
          } else if (response.assets && response.assets[0]) {
            const { uri, fileName, type } = response.assets[0];

            if (uri) {
              const tempUrl = `temp://${Date.now()}`;
              pendingImagesRef.current[tempUrl] = { uri, fileName: fileName || 'image.jpg', type };
              setElementValue('imageUrl', tempUrl, { shouldValidate: true });
              setSelectedImageName(fileName || 'image.jpg');
              trigger('imageUrl');
            } else {
              console.error('No URI in image picker response');
              Alert.alert(t('outfitCreateModal.alerts.imageSelectError.title'), t('outfitCreateModal.alerts.imageSelectError.message'));
            }
          } else {
            console.error('No assets in image picker response');
            Alert.alert(t('outfitCreateModal.alerts.noImageSelected.title'), t('outfitCreateModal.alerts.noImageSelected.message'));
          }
        }
      );
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('outfitCreateModal.alerts.imagePickerError.title'), t('outfitCreateModal.alerts.imagePickerError.message'));
    }
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
          <View className="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface }}>
            <Pressable onPress={onClose} className="p-2">
              <X size={24} color={colors.textMuted} />
            </Pressable>
            <Text className="font-semibold text-lg" style={{ color: colors.text }}>{t('outfitCreateModal.title')}</Text>
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || outfitElements.length === 0 || isPending}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, overflow: 'hidden', backgroundColor: (!isValid || outfitElements.length === 0 || isPending) ? colors.borderVariant : 'transparent' }}
            >
              <ThemedGradient active={isValid && outfitElements.length > 0 && !isPending} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              <Text className="font-medium text-sm" style={{ color: colors.white }}>{isPending ? t('outfitCreateModal.saving') : t('outfitCreateModal.save')}</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-4">
            <View className="pt-6 pb-20">
              {/* Images Section */}
              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.outfitElements')}</Text>
                <View className='flex flex-col gap-4'>
                  <ScrollView horizontal
                    showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-4">
                      <Pressable
                        onPress={() => setElementModalVisible(true)}
                        className="w-24 h-32 border-2 border-dashed rounded-xl items-center justify-center"
                        style={{ backgroundColor: colors.surfaceVariant, borderColor: colors.borderVariant }}
                      >
                        <Plus size={24} color={colors.textMuted} />
                        <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{t('outfitCreateModal.addElement')}</Text>
                      </Pressable>
                      {outfitElements.map((element, index) => (
                        <View key={index} className="relative border-2 rounded-xl overflow-hidden" style={{ borderColor: colors.borderVariant }}>
                          <Image
                            source={{ uri: element?.imageUrl.startsWith('temp://') ? pendingImagesRef.current[element.imageUrl]?.uri : element.imageUrl }}
                            className="w-24 h-32 rounded-xl"
                            resizeMode="cover"
                          />
                          <Pressable
                            onPress={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 rounded-full overflow-hidden"
                            style={{ borderWidth: 2, borderColor: colors.black }}
                          >
                            <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                            <Trash2 size={12} color={colors.white} />
                          </Pressable>
                          <View className="absolute bottom-0 left-0 right-0 px-2 py-1" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)' }}>
                            <Text className="text-xs" style={{ color: colors.white }}>{element?.type}</Text>
                            <Text className="text-xs" style={{ color: colors.textMuted }}>
                              {element?.price !== null ? `$${element?.price.toFixed(2)}` : 'Free'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                  <View className="flex-row items-center justify-between self-end w-full">
                    <Text className={`text-sm`} style={{ color: outfitElements.length === 0 ? colors.error : colors.textMuted }}>
                      {outfitElements.length === 0 && (
                        t('outfitCreateModal.elementCount.zero')
                      ) ||
                        outfitElements.length + t('outfitCreateModal.elementCount.one')
                        ||
                        outfitElements.length + t('outfitCreateModal.elementCount.other')} </Text>
                    <Text className={`text-sm ${outfitElements.length === 0 ? 'hidden' : ''}`} style={{ color: colors.textMuted }}>
                      {t('outfitCreateModal.totalPrice')} {calculateTotalPrice(outfitElements).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Title Field */}
              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.name')}</Text>
                <Controller
                  control={control}
                  name="outfit_name"
                  rules={{ required: t('outfitCreateModal.errors.nameRequired') }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('outfitCreateModal.placeholders.name')}
                      placeholderTextColor={colors.textMuted}
                      className={`px-4 py-3 rounded-lg text-base`}
                      style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.outfit_name ? colors.error : colors.border, color: colors.text }}
                      maxLength={50}
                    />
                  )}
                />
                <View className="flex-row items-center justify-between mt-1">
                  {errors.outfit_name ? (
                    <Text className="text-xs" style={{ color: colors.error }}>{errors.outfit_name.message}</Text>
                  ) : (
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
                      {outfitName?.length || 0} / 50
                    </Text>
                  )}
                </View>
              </View>

              {/* Description Field */}
              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.description')}</Text>
                <Controller
                  control={control}
                  name="description"
                  rules={{ required: t('outfitCreateModal.errors.descriptionRequired') }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('outfitCreateModal.placeholders.description')}
                      placeholderTextColor={colors.textMuted}
                      className={`px-4 py-3 rounded-lg text-base`}
                      style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.description ? colors.error : colors.border, color: colors.text }}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={200}
                    />
                  )}
                />
                <View className="flex-row items-center justify-between mt-1">
                  {errors.description ? (
                    <Text className="text-xs" style={{ color: colors.error }}>{errors.description.message}</Text>
                  ) : (
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
                      {description?.length || 0}
                    </Text>
                  )}
                </View>
              </View>

              {/* Style Tags */}
              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.styleTags')}</Text>
                <View className="flex-row flex-wrap">
                  {OutfitStylesTags.map((style) => {
                    const selected = outfitTags.includes(style.name);
                    return (
                      <Pressable
                        key={style.name}
                        onPress={() => toggleTag(style.name)}
                        className={`px-3 py-1.5 rounded-full mr-2 mb-2 border`}
                        style={{
                          backgroundColor: selected ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                          borderColor: selected ? '#A855F7' : colors.borderVariant,
                        }}
                      >
                        <Text className="text-xs" style={{ color: selected ? colors.white : '#D1D5DB' }}>{style.name}</Text>
                      </Pressable>
                    );
                  })}
                  {errors.outfit_tags && (
                    <Text className="text-xs w-full" style={{ color: colors.error }}>
                      {t('outfitCreateModal.errors.styleTagsRequired')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
        <DevTool control={control} />
      </Modal>

      {/* Element Modal */}
      <Modal
        visible={elementModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center px-4 backdrop-blur-lg" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="rounded-2xl p-4 w-full" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <View className="flex-row items-center justify-between mb-4">
              <Pressable onPress={() => {
                setElementModalVisible(false);
                setSelectedImageName(null);
                setElementValue('imageUrl', '');
                trigger('imageUrl');
              }} className="p-2">
                <X size={24} color={colors.textMuted} />
              </Pressable>
              <Text className="font-semibold text-lg" style={{ color: colors.text }}>{t('outfitCreateModal.addElement')}</Text>
              <Pressable
                onPress={handleElementSubmit(onElementSubmit)}
                disabled={!isElementValid}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, overflow: 'hidden', backgroundColor: !isElementValid ? colors.borderVariant : 'transparent' }}
              >
                <ThemedGradient active={isElementValid} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                <Text className="font-medium text-sm" style={{ color: colors.white }}>{t('outfitCreateModal.save')}</Text>
              </Pressable>
            </View>

            <ScrollView>
              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.elementType')}</Text>
                <Controller
                  control={elementControl}
                  name="type"
                  rules={{ required: t('outfitCreateModal.errors.elementTypeRequired') }}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      selectedValue={value}
                      onValueChange={(val) => {
                        onChange(val);
                        trigger('type');
                      }}
                    >
                      <SelectTrigger className={`rounded-lg`} style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: elementErrors.type ? colors.error : colors.border }}>
                        <SelectInput
                          placeholder={t('outfitCreateModal.placeholders.elementType')}
                          placeholderTextColor={colors.textMuted}
                          value={value}
                        />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent className="rounded-lg" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                          {OutfitElements.map((element, index) => (
                            <SelectItem
                              key={index}
                              label={element.name}
                              value={element.name}
                              className="px-4 py-3 border-b last:border-b-0"
                              style={{ borderColor: colors.borderVariant }}
                            />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  )}
                />
                {elementErrors.type && (
                  <Text className="text-xs mt-1" style={{ color: colors.error }}>
                    {elementErrors.type.message}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.price')}</Text>
                <Controller
                  control={elementControl}
                  name="price"
                  rules={{
                    validate: (value) => {
                      if (value === null) return true;
                      if (isNaN(value)) return t('outfitCreateModal.errors.priceInvalid');
                      if (value < 0) return t('outfitCreateModal.errors.priceNegative');
                      return true;
                    }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder={t('outfitCreateModal.placeholders.price')}
                      placeholderTextColor={colors.textMuted}
                      value={value !== null ? value.toString() : ''}
                      onChangeText={(text) => {
                        const num = text ? parseFloat(text) : null;
                        onChange(num);
                        trigger('price');
                      }}
                      keyboardType="numeric"
                      className={`px-4 py-3 rounded-lg text-base`}
                      style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: elementErrors.price ? colors.error : colors.border, color: colors.text }}
                    />
                  )}
                />
                {elementErrors.price && (
                  <Text className="text-xs mt-1" style={{ color: colors.error }}>
                    {elementErrors.price.message}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.siteUrl')}</Text>
                <Controller
                  control={elementControl}
                  name="siteUrl"
                  rules={{
                    required: t('outfitCreateModal.errors.siteUrlRequired'),
                    pattern: {
                      value: URL_PATTERN,
                      message: t('outfitCreateModal.errors.siteUrlInvalid')
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        trigger('siteUrl');
                      }}
                      onBlur={onBlur}
                      placeholder={t('outfitCreateModal.placeholders.siteUrl')}
                      placeholderTextColor={colors.textMuted}
                      className={`px-4 py-3 rounded-lg text-base`}
                      style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: elementErrors.siteUrl ? colors.error : colors.border, color: colors.text }}
                    />
                  )}
                />
                {elementErrors.siteUrl && (
                  <Text className="text-xs mt-1" style={{ color: colors.error }}>
                    {elementErrors.siteUrl.message}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>{t('outfitCreateModal.image')}</Text>
                <Controller
                  control={elementControl}
                  name="imageUrl"
                  rules={{
                    required: t('outfitCreateModal.errors.imageRequired')
                  }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      {value && selectedImageName ? (
                        <View className="mb-4">
                          <View className="relative rounded-lg p-4" style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }}>
                            <Text className="text-sm font-medium truncate" style={{ color: colors.text }}>
                              {selectedImageName}
                            </Text>
                            <Pressable
                              onPress={() => {
                                if (value.startsWith('temp://')) {
                                  delete pendingImagesRef.current[value];
                                }
                                onChange('');
                                setSelectedImageName(null);
                                trigger('imageUrl');
                              }}
                              className="absolute top-2 right-2 p-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: colors.error }}
                            >
                              <ThemedGradient style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                              <Trash2 size={16} color={colors.white} />
                            </Pressable>
                          </View>
                          <View className="mt-2 flex-row items-center justify-center py-1 px-2 rounded-full" style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.12)' }}>
                            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                            <Text className="text-xs" style={{ color: colors.success }}>
                              {t('outfitCreateModal.imageSelected')}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View className="flex-col items-center">
                          <Pressable
                            onPress={handleImageSelect}
                            className="w-full rounded-lg p-4 items-center justify-center"
                            style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.border }}
                          >
                            <View className="items-center justify-center mb-2">
                              <Plus size={24} color={colors.textMuted} />
                            </View>
                            <Text className="text-sm font-medium" style={{ color: colors.text }}>{t('outfitCreateModal.placeholders.image')}</Text>
                            <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{t('outfitCreateModal.imageFormat')}</Text>
                          </Pressable>
                          {elementErrors.imageUrl && (
                            <Text className="text-xs mt-2 text-center" style={{ color: colors.error }}>
                              {elementErrors.imageUrl.message}
                            </Text>
                          )}
                        </View>
                      )}
                    </>
                  )}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};