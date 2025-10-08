import { useRequestPermission } from '@/hooks/useRequestPermission';
import { useTheme } from '@/providers/themeContext';
import { OutfitElementData } from '@/types/createOutfitTypes';
import { X } from 'lucide-react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ElementFormFields } from './ElementFormFields';
import { PendingImage } from './types';

interface ElementModalProps {
  elementModalVisible: boolean;
  setElementModalVisible: (visible: boolean) => void;
  onElementSubmit: (data: OutfitElementData) => void;
  pendingImagesRef: React.MutableRefObject<Record<string, PendingImage>>;
  selectedImageName: string | null;
  setSelectedImageName: (name: string | null) => void;
  preferredCurrency: string;
}

export const ElementModal: React.FC<ElementModalProps> = ({
  elementModalVisible,
  setElementModalVisible,
  onElementSubmit,
  pendingImagesRef,
  selectedImageName,
  setSelectedImageName,
  preferredCurrency
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[^\s]*)?$/;

  const {
    control: elementControl,
    handleSubmit: handleElementSubmit,
    formState: { errors: elementErrors, isValid: isElementValid },
    reset: resetElementForm,
    setValue: setElementValue,
    getValues: getElementValues,
    watch: watchElement
  } = useForm<OutfitElementData>({
    defaultValues: {
      type: '',
      price: null,
      currency: preferredCurrency || 'USD',
      imageUrl: '',
      siteUrl: ''
    },
    mode: 'onChange'
  });

  const handleImageSelect = async () => {
    const hasPermission = await useRequestPermission();
    if (!hasPermission) {
      Alert.alert(
        t('outfitCreateModal.alerts.permissionDenied.title'),
        t('outfitCreateModal.alerts.permissionDenied.message')
      );
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
            Alert.alert(t('outfitCreateModal.alerts.error.title'), response.errorMessage);
          } else if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            if (asset?.uri) {
              // Build a safe filename fallback when picker doesn't provide one
              const inferredExt = (asset.type?.split('/')?.[1] || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
              const fallbackName = `image.${inferredExt || 'jpg'}`;
              const safeFileName = asset.fileName || fallbackName;

              const tempKey = `temp://${Date.now()}-${safeFileName}`;
              pendingImagesRef.current[tempKey] = {
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                fileName: safeFileName
              };
              setElementValue('imageUrl', tempKey, { shouldDirty: true, shouldValidate: true });

              setElementValue('_localUri' as any, asset.uri as any, { shouldDirty: true });
              setElementValue('_fileName' as any, safeFileName as any, { shouldDirty: true });
              setElementValue('_type' as any, (asset as any).type as any, { shouldDirty: true });
              setSelectedImageName(safeFileName);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error launching image library:', error);
      Alert.alert(t('outfitCreateModal.alerts.error.title'), t('outfitCreateModal.alerts.error.message'));
    }
  };

  const handleRemoveSelectedImage = () => {
    const key = getElementValues('imageUrl');
    if (key && key.startsWith('temp://')) {
      delete pendingImagesRef.current[key];
    }
    setElementValue('imageUrl', '');
    setSelectedImageName(null);
  };

  const handleCloseElementModal = () => {
    resetElementForm();
    setSelectedImageName(null);
    setElementModalVisible(false);
  };

  return (
    <Modal
      visible={elementModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCloseElementModal}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1">
          <View className="flex-row items-center justify-between p-4 border-b" style={{ borderBottomColor: colors.border }}>
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              {t('outfitCreateModal.addElement')}
            </Text>
            <Pressable onPress={handleCloseElementModal} className="p-2">
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            <ElementFormFields
              elementControl={elementControl}
              elementErrors={elementErrors}
              watchElement={watchElement}
              selectedImageName={selectedImageName}
              handleImageSelect={handleImageSelect}
              URL_PATTERN={URL_PATTERN}
              setElementValue={setElementValue}
              imagePreviewUri={((): string | undefined => {
                const key = watchElement('imageUrl');
                if (key && key.startsWith('temp://')) {
                  return pendingImagesRef.current[key]?.uri;
                }
                return key || undefined;
              })()}
              onRemoveSelectedImage={handleRemoveSelectedImage}
              key={watchElement('imageUrl')}
            />
          </ScrollView>

          <View className="p-4 border-t" style={{ borderTopColor: colors.border }}>
            <Pressable
              onPress={handleElementSubmit(onElementSubmit)}
              disabled={!isElementValid || !watchElement('imageUrl')}
              className={`py-4 rounded-lg items-center justify-center ${!isElementValid ? 'opacity-50' : ''}`}
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold text-base">
                {t('outfitCreateModal.addElementToOutfit')}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};