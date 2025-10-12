import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Currencies, OutfitColors, OutfitElements, OutfitFit, OutfitGender, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { ChevronDown, ChevronUp, DollarSign, Layers, Palette, Ruler, Tags, User } from 'lucide-react-native';
import React from 'react';
import { Modal , Pressable, ScrollView, Text, TextInput, View } from 'react-native';


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
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-black/60 backdrop-blur-xl z-30 items-center'>
        <View className='w-[95vw] mt-4 mb-4 flex-1'>
          <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            <Accordion variant='filled' type='multiple' className='w-full bg-transparent'>
              <AccordionItem className='w-full' value='gender'>
                <AccordionTrigger>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <View className='flex-row items-center gap-2'>
                        <User size={16} color='white' />
                        <Text className='text-white text-sm font-semibold'>{t('chatSection.selectGender')}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                    </>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitGender.map((gender) => {
                      const selected = props.outfitGender.includes(gender.name);
                      return (
                        <Pressable
                          key={gender.name}
                          onPress={() => props.setOutfitGender((prev) => (selected ? prev.filter((t) => t !== gender.name) : [...prev, gender.name]))}
                          className={`px-3 py-1.5 rounded-full border ${selected ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10'}`}
                        >
                          <Text className={`text-xs ${selected ? 'text-white' : 'text-gray-300'}`}>{t(`chatSection.genders.${gender.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='styles'>
                <AccordionTrigger>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <View className='flex-row items-center gap-2'>
                        <Tags size={16} color='white' />
                        <Text className='text-white text-sm font-semibold'>{t('chatSection.selectOutfitStyles')}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                    </>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitStylesTags.map((tag) => {
                      const selected = props.outfitTag.includes(tag.name);
                      return (
                        <Pressable
                          key={tag.name}
                          onPress={() => props.setOutfitTag((prev) => (selected ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]))}
                          className={`px-3 py-1.5 rounded-full border ${selected ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10'}`}
                        >
                          <Text className={`text-xs ${selected ? 'text-white' : 'text-gray-300'}`}>{t(`chatSection.styles.${tag.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='fit'>
                <AccordionTrigger>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <View className='flex-row items-center gap-2'>
                        <Ruler size={16} color='white' />
                        <Text className='text-white text-sm font-semibold'>{t('chatSection.selectFit')}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                    </>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitFit.map((fit) => {
                      const selected = props.outfitFit.includes(fit.name);
                      return (
                        <Pressable
                          key={fit.name}
                          onPress={() => props.setOutfitFit((prev) => (selected ? prev.filter((t) => t !== fit.name) : [...prev, fit.name]))}
                          className={`px-3 py-1.5 rounded-full border ${selected ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10'}`}
                        >
                          <Text className={`text-xs ${selected ? 'text-white' : 'text-gray-300'}`}>{t(`chatSection.fits.${fit.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='colors'>
                <AccordionTrigger>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <View className='flex-row items-center gap-2'>
                        <Palette size={16} color='white' />
                        <Text className='text-white text-sm font-semibold'>{t('chatSection.selectDominantColors')}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                    </>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitColors.map((color) => {
                      const selected = props.outfitColor.includes(color.name);
                      return (
                        <Pressable
                          key={color.name}
                          onPress={() => props.setOutfitColor((prev) => (selected ? prev.filter((t) => t !== color.name) : [...prev, color.name]))}
                          className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${selected ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10'}`}
                        >
                          <View style={{ backgroundColor: color.hex, width: 14, height: 14, borderRadius: 7 }} />
                          <Text className={`text-xs ${selected ? 'text-white' : 'text-gray-300'}`}>{t(`chatSection.colors.${color.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='elements'>
                <AccordionTrigger>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <View className='flex-row items-center gap-2'>
                        <Layers size={16} color='white' />
                        <Text className='text-white text-sm font-semibold'>{t('chatSection.selectOutfitElements')}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                    </>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <View className='flex-row flex-wrap gap-2'>
                    {OutfitElements.map((element) => {
                      const selected = props.outfitElement.includes(element.name);
                      return (
                        <Pressable
                          key={element.name}
                          onPress={() => props.setOutfitElement((prev) => (selected ? prev.filter((t) => t !== element.name) : [...prev, element.name]))}
                          className={`px-3 py-1.5 rounded-full border ${selected ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10'}`}
                        >
                          <Text className={`text-xs ${selected ? 'text-white' : 'text-gray-300'}`}>{t(`chatSection.elements.${element.name.toLowerCase()}`)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='price-range'>
                <AccordionTrigger>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <View className='flex-row items-center gap-2'>
                        <DollarSign size={16} color='white' />
                        <Text className='text-white text-sm font-semibold'>{t('chatSection.selectPriceRange')}</Text>
                      </View>
                      {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                    </>
                  )}
                </AccordionTrigger>
                <AccordionContent className='flex flex-col items-start gap-2'>
                  <View className='flex-row items-center gap-3 w-full'>
                    <View className='flex-1'>
                      <Text className='text-gray-300 text-xs mb-1'>{t('chatSection.from')}</Text>
                      <TextInput
                        value={`${props.lowestPrice}`}
                        onChangeText={(text) => props.setLowestPrice(Number(text))}
                        placeholder={t('chatSection.placeholders.lowestPrice')}
                        keyboardType='numeric'
                        className='px-3 py-2 bg-white/5 border border-white/10 text-white/80 rounded-lg'
                      />
                    </View>
                    <View className='flex-1'>
                      <Text className='text-gray-300 text-xs mb-1'>{t('chatSection.to')}</Text>
                      <TextInput
                        value={`${props.highestPrice}`}
                        onChangeText={(text) => props.setHighestPrice(Number(text))}
                        placeholder={t('chatSection.placeholders.highestPrice')}
                        keyboardType='numeric'
                        className='px-3 py-2 bg-white/5 border border-white/10 text-white/80 rounded-lg'
                      />
                    </View>
                  </View>
                  <Text className='text-gray-300 text-xs mt-3 mb-1'>{t('chatSection.currency')}</Text>
                  <Select selectedValue={props.currency} onValueChange={(value: string) => props.setCurrency(value)}>
                    <SelectTrigger className='bg-white/5 border border-white/10 text-white/80 rounded-lg h-10'>
                      <SelectInput placeholder={t('chatSection.placeholders.currency')} className='text-white/80 text-xs' value={props.currency} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop className='bg-black/50 backdrop-blur-sm' />
                      <SelectContent className='bg-gray-900/95 border border-white/10 rounded-lg overflow-hidden'>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator className='bg-white/20' />
                        </SelectDragIndicatorWrapper>
                        {Currencies.map((currencyItem: any) => (
                          <SelectItem key={currencyItem.name} value={currencyItem.name} label={t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)} className='px-4 py-3 border-b border-white/10 last:border-b-0 active:bg-gray-800'>
                            <Text className='text-white text-sm'>{t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)}</Text>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollView>
        </View>
        <View className='w-[95vw] mb-4'>
          <View className='bg-white/10 border border-white/10 rounded-xl p-3 items-center'>
            <Text className='text-white text-sm' onPress={onClose}>Close</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};


