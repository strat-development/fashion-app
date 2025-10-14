import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Currencies, OutfitColors, OutfitElements, OutfitFit, OutfitGender, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { useTheme } from '@/providers/themeContext';
import { BlurView } from 'expo-blur';
import { ChevronDown, ChevronUp, DollarSign, Layers, Palette, Ruler, Tags, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


type FiltersOverlayProps = {
  visible: boolean;
  onClose: () => void;
  t: (k: string) => string;
  outfitGender: string[];
  setOutfitGender: React.Dispatch<React.SetStateAction<string[]>>;
  outfitTag: string[];
  setOutfitTag: React.Dispatch<React.SetStateAction<string[]>>;
  outfitFit: string[];
  setOutfitFit: React.Dispatch<React.SetStateAction<string[]>>;
  outfitColor: string[];
  setOutfitColor: React.Dispatch<React.SetStateAction<string[]>>;
  outfitElement: string[];
  setOutfitElement: React.Dispatch<React.SetStateAction<string[]>>;
  lowestPrice: number;
  setLowestPrice: (n: number) => void;
  highestPrice: number;
  setHighestPrice: (n: number) => void;
  currency: string;
  setCurrency: (c: string) => void;
};

export const FiltersOverlay = (props: FiltersOverlayProps) => {
  const { visible, onClose, t } = props;
  const { colors, isDark } = useTheme();
  const [swallowNextTap, setSwallowNextTap] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const [openStyles, setOpenStyles] = useState(false);
  const [openFit, setOpenFit] = useState(false);
  const [openColors, setOpenColors] = useState(false);
  const [openElements, setOpenElements] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const insets = useSafeAreaInsets();
  const swallow = () => {
    setSwallowNextTap(true);
    setTimeout(() => setSwallowNextTap(false), 180);
  };
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={Platform.OS === 'android'}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View className='flex-1 z-30 items-center' style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        {swallowNextTap && (
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setSwallowNextTap(false)} />
        )}
        <SafeAreaView style={{ flex: 1, width: '100%' }} edges={['top', 'bottom']}>
          <View className='w-[95vw] mt-4 mb-4 flex-1'>
            <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 16 + insets.bottom, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
            <View className='w-full bg-transparent'>
              <Pressable onPress={() => setOpenGender((v) => !v)} className='w-full flex-row justify-between items-center py-3 px-4'>
                <View className='flex-row items-center gap-2'>
                  <User size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{t('chatSection.selectGender')}</Text>
                </View>
                {openGender ? <ChevronDown size={24} color={colors.text} /> : <ChevronUp size={24} color={colors.text} />}
              </Pressable>
              {openGender && (
                <View style={{ paddingTop: 4, paddingBottom: 12, paddingHorizontal: 16 }}>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitGender.map((gender) => {
                      const selected = props.outfitGender.includes(gender.name);
                      return (
                        <Pressable
                          key={gender.name}
                          onPress={() => props.setOutfitGender((prev) => (selected ? prev.filter((t) => t !== gender.name) : [...prev, gender.name]))}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 9999,
                            borderWidth: 1,
                            backgroundColor: selected ? (isDark ? '#7e22ce33' : '#7e22ce1a') : colors.surface,
                            borderColor: selected ? colors.accent : colors.border,
                          }}
                        >
                          <Text style={{ color: selected ? colors.text : colors.textSecondary, fontSize: 12 }}>{t(`chatSection.genders.${gender.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable onPress={() => setOpenStyles((v) => !v)} className='w-full flex-row justify-between items-center py-3 px-4'>
                <View className='flex-row items-center gap-2'>
                  <Tags size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{t('chatSection.selectOutfitStyles')}</Text>
                </View>
                {openStyles ? <ChevronDown size={24} color={colors.text} /> : <ChevronUp size={24} color={colors.text} />}
              </Pressable>
              {openStyles && (
                <View style={{ paddingTop: 4, paddingBottom: 12, paddingHorizontal: 16 }}>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitStylesTags.map((tag) => {
                      const selected = props.outfitTag.includes(tag.name);
                      return (
                        <Pressable
                          key={tag.name}
                          onPress={() => props.setOutfitTag((prev) => (selected ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]))}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 9999,
                            borderWidth: 1,
                            backgroundColor: selected ? (isDark ? '#7e22ce33' : '#7e22ce1a') : colors.surface,
                            borderColor: selected ? colors.accent : colors.border,
                          }}
                        >
                          <Text style={{ color: selected ? colors.text : colors.textSecondary, fontSize: 12 }}>{t(`chatSection.styles.${tag.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable onPress={() => setOpenFit((v) => !v)} className='w-full flex-row justify-between items-center py-3 px-4'>
                <View className='flex-row items-center gap-2'>
                  <Ruler size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{t('chatSection.selectFit')}</Text>
                </View>
                {openFit ? <ChevronDown size={24} color={colors.text} /> : <ChevronUp size={24} color={colors.text} />}
              </Pressable>
              {openFit && (
                <View style={{ paddingTop: 4, paddingBottom: 12, paddingHorizontal: 16 }}>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitFit.map((fit) => {
                      const selected = props.outfitFit.includes(fit.name);
                      return (
                        <Pressable
                          key={fit.name}
                          onPress={() => props.setOutfitFit((prev) => (selected ? prev.filter((t) => t !== fit.name) : [...prev, fit.name]))}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 9999,
                            borderWidth: 1,
                            backgroundColor: selected ? (isDark ? '#7e22ce33' : '#7e22ce1a') : colors.surface,
                            borderColor: selected ? colors.accent : colors.border,
                          }}
                        >
                          <Text style={{ color: selected ? colors.text : colors.textSecondary, fontSize: 12 }}>{t(`chatSection.fits.${fit.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable onPress={() => setOpenColors((v) => !v)} className='w-full flex-row justify-between items-center py-3 px-4'>
                <View className='flex-row items-center gap-2'>
                  <Palette size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{t('chatSection.selectDominantColors')}</Text>
                </View>
                {openColors ? <ChevronDown size={24} color={colors.text} /> : <ChevronUp size={24} color={colors.text} />}
              </Pressable>
              {openColors && (
                <View style={{ paddingTop: 4, paddingBottom: 12, paddingHorizontal: 16 }}>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitColors.map((color) => {
                      const selected = props.outfitColor.includes(color.name);
                      return (
                        <Pressable
                          key={color.name}
                          onPress={() => props.setOutfitColor((prev) => (selected ? prev.filter((t) => t !== color.name) : [...prev, color.name]))}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 9999,
                            borderWidth: 1,
                            backgroundColor: selected ? (isDark ? '#7e22ce33' : '#7e22ce1a') : colors.surface,
                            borderColor: selected ? colors.accent : colors.border,
                          }}
                        >
                          <View style={{ backgroundColor: color.hex, width: 14, height: 14, borderRadius: 7 }} />
                          <Text style={{ color: selected ? colors.text : colors.textSecondary, fontSize: 12 }}>{t(`chatSection.colors.${color.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable onPress={() => setOpenElements((v) => !v)} className='w-full flex-row justify-between items-center py-3 px-4'>
                <View className='flex-row items-center gap-2'>
                  <Layers size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{t('chatSection.selectOutfitElements')}</Text>
                </View>
                {openElements ? <ChevronDown size={24} color={colors.text} /> : <ChevronUp size={24} color={colors.text} />}
              </Pressable>
              {openElements && (
                <View style={{ paddingTop: 4, paddingBottom: 12, paddingHorizontal: 16 }}>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitElements.map((element) => {
                      const selected = props.outfitElement.includes(element.name);
                      return (
                        <Pressable
                          key={element.name}
                          onPress={() => props.setOutfitElement((prev) => (selected ? prev.filter((t) => t !== element.name) : [...prev, element.name]))}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 9999,
                            borderWidth: 1,
                            backgroundColor: selected ? (isDark ? '#7e22ce33' : '#7e22ce1a') : colors.surface,
                            borderColor: selected ? colors.accent : colors.border,
                          }}
                        >
                          <Text style={{ color: selected ? colors.text : colors.textSecondary, fontSize: 12 }}>{t(`chatSection.elements.${element.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable onPress={() => setOpenPrice((v) => !v)} className='w-full flex-row justify-between items-center py-3 px-4'>
                <View className='flex-row items-center gap-2'>
                  <DollarSign size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{t('chatSection.selectPriceRange')}</Text>
                </View>
                {openPrice ? <ChevronDown size={24} color={colors.text} /> : <ChevronUp size={24} color={colors.text} />}
              </Pressable>
              {openPrice && (
                <View style={{ paddingTop: 4, paddingBottom: 12, paddingHorizontal: 16 }}>
                  <View className='flex-row items-center gap-3 w-full'>
                    <View className='flex-1'>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('chatSection.from')}</Text>
                      <TextInput
                        value={`${props.lowestPrice}`}
                        onChangeText={(text) => props.setLowestPrice(Number(text))}
                        placeholder={t('chatSection.placeholders.lowestPrice')}
                        keyboardType='numeric'
                        style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, borderRadius: 8 }}
                      />
                    </View>
                    <View className='flex-1'>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{t('chatSection.to')}</Text>
                      <TextInput
                        value={`${props.highestPrice}`}
                        onChangeText={(text) => props.setHighestPrice(Number(text))}
                        placeholder={t('chatSection.placeholders.highestPrice')}
                        keyboardType='numeric'
                        style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, borderRadius: 8 }}
                      />
                    </View>
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 12, marginBottom: 4 }}>{t('chatSection.currency')}</Text>
                  <Select selectedValue={props.currency} onValueChange={(value: string) => props.setCurrency(value)}>
                    <SelectTrigger className='rounded-lg h-10' style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
                      <SelectInput placeholder={t('chatSection.placeholders.currency')} value={props.currency} style={{ color: colors.text, fontSize: 12 }} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop onPress={swallow} />
                      <SelectContent style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, overflow: 'hidden' }}>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {Currencies.map((currencyItem: any) => (
                          <SelectItem key={currencyItem.name} value={currencyItem.name} label={t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)} onPress={swallow}>
                            <Text style={{ color: colors.text, fontSize: 14 }}>{t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)}</Text>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </View>
              )}
            </View>
            </ScrollView>
          </View>
          <View className='w-[95vw] mb-4' style={{ paddingBottom: Math.max(insets.bottom - 8, 0) }}>
            <View className='rounded-xl p-3 items-center' style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14 }} onPress={onClose}>Close</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};


