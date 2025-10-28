import { useTheme } from '@/providers/themeContext';
import { OutfitElementData } from '@/types/createOutfitTypes';
import * as ImagePicker from 'expo-image-picker';
import { X } from 'lucide-react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
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
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('outfitCreateModal.alerts.permissionDenied.title'),
          t('outfitCreateModal.alerts.permissionDenied.message')
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaTypeOptions.Images as any],
        quality: 1,
        allowsMultipleSelection: false,
        exif: false,
        base64: false,
      });

      if (pickerResult.canceled) return;
      const asset = pickerResult.assets?.[0];
      if (!asset?.uri) return;

      const uri = asset.uri;
      const mimeType = asset.type === 'image' ? 'image/jpeg' : (asset as any).mimeType || 'image/jpeg';
      const filenameFromUri = uri.split('?')[0].split('/').pop() || 'image.jpg';
      const safeFileName = (asset as any).fileName || filenameFromUri;

      const tempKey = `temp://${Date.now()}-${safeFileName}`;
      pendingImagesRef.current[tempKey] = {
        uri,
        type: mimeType,
        fileName: safeFileName,
      };

      setElementValue('imageUrl', tempKey, { shouldDirty: true, shouldValidate: true });
      setElementValue('_localUri' as any, uri as any, { shouldDirty: true });
      setElementValue('_fileName' as any, safeFileName as any, { shouldDirty: true });
      setElementValue('_type' as any, mimeType as any, { shouldDirty: true });
      setSelectedImageName(safeFileName);
    } catch (error) {
      console.error('Error launching image library (expo-image-picker):', error);
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

  const content = (
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
  );

  if (Platform.OS === 'ios') {
    if (!elementModalVisible) return null;
    return (
      <View
        pointerEvents="auto"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
      >
        <Pressable
          onPress={handleCloseElementModal}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
        />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {content}
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={elementModalVisible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={handleCloseElementModal}
    >
      {content}
    </Modal>
  );
};