import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from "@/components/ui/select";
import { Currencies, OutfitColors, OutfitElements, OutfitFit, OutfitGender, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { CheckBox } from '@rneui/themed';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { ChatSwitch } from './ChatSwitch';
import { useTranslation } from 'react-i18next';

export const ChatSection = () => {
  const { t } = useTranslation();
  const [outfitTag, setOutfitTag] = useState<string[]>(['']);
  const [outfitElement, setOutfitElement] = useState<string[]>(['']);
  const [outfitColor, setOutfitColor] = useState<string[]>(['']);
  const [outfitGender, setOutfitGender] = useState<string[]>(['']);
  const [outfitFit, setOutfitFit] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lowestPrice, setLowestPrice] = useState<number>(0);
  const [highestPrice, setHighestPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('');

  return (
    <View className='flex flex-col items-center justify-center w-full h-full'>
      <ChatSwitch />
      <ScrollView className='flex flex-col bg-gray-800 w-full items-center justify-start gap-4'>
        <Accordion
          variant="filled"
          type="multiple"
          className='w-[95vw] bg-transparent mt-24 mb-32'>
          <AccordionItem className='w-full' value="gender">
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => {
                return (
                  <>
                    <Text className='text-2xl text-white font-bold'>{t('chatSection.selectGender')}</Text>
                    {
                      isExpanded ? (
                        <ChevronDown size={24} color="white" />
                      ) : (
                        <ChevronUp size={24} color="white" />
                      )
                    }
                  </>
                )
              }}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitGender.map((gender) => (
                  <CheckBox
                    key={gender.name}
                    title={t(`chatSection.genders.${gender.name.toLowerCase()}`)}
                    checked={outfitGender.includes(gender.name)}
                    onPress={() => {
                      setOutfitGender((prev) => {
                        if (prev.includes(gender.name)) {
                          return prev.filter((t) => t !== gender.name);
                        } else {
                          return [...prev, gender.name];
                        }
                      });
                    }}
                    checkedIcon='check-square'
                    uncheckedIcon='square-o'
                    containerStyle={{ backgroundColor: 'transparent' }}
                    textStyle={{ color: 'white' }}
                    checkedColor='white'
                  />
                ))}
              </View>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="styles">
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => {
                return (
                  <>
                    <Text className='text-2xl text-white font-bold'>{t('chatSection.selectOutfitStyles')}</Text>
                    {
                      isExpanded ? (
                        <ChevronDown size={24} color="white" />
                      ) : (
                        <ChevronUp size={24} color="white" />
                      )
                    }
                  </>
                )
              }}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitStylesTags.map((tag) => (
                  <CheckBox
                    key={tag.name}
                    title={t(`chatSection.styles.${tag.name.toLowerCase()}`)}
                    checked={outfitTag.includes(tag.name)}
                    onPress={() => {
                      setOutfitTag((prev) => {
                        if (prev.includes(tag.name)) {
                          return prev.filter((t) => t !== tag.name);
                        } else {
                          return [...prev, tag.name];
                        }
                      });
                    }}
                    checkedIcon='check-square'
                    uncheckedIcon='square-o'
                    containerStyle={{ backgroundColor: 'transparent' }}
                    textStyle={{ color: 'white' }}
                    checkedColor='white'
                  />
                ))}
              </View>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fit">
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => {
                return (
                  <>
                    <Text className='text-2xl text-white font-bold'>{t('chatSection.selectFit')}</Text>
                    {
                      isExpanded ? (
                        <ChevronDown size={24} color="white" />
                      ) : (
                        <ChevronUp size={24} color="white" />
                      )
                    }
                  </>
                )
              }}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitFit.map((fit) => (
                  <CheckBox
                    key={fit.name}
                    title={t(`chatSection.fits.${fit.name.toLowerCase()}`)}
                    checked={outfitFit.includes(fit.name)}
                    onPress={() => {
                      setOutfitFit((prev) => {
                        if (prev.includes(fit.name)) {
                          return prev.filter((t) => t !== fit.name);
                        } else {
                          return [...prev, fit.name];
                        }
                      });
                    }}
                    checkedIcon='check-square'
                    uncheckedIcon='square-o'
                    containerStyle={{ backgroundColor: 'transparent' }}
                    textStyle={{ color: 'white' }}
                    checkedColor='white'
                  />
                ))}
              </View>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="colors">
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => {
                return (
                  <>
                    <Text className='text-2xl text-white font-bold'>{t('chatSection.selectDominantColors')}</Text>
                    {
                      isExpanded ? (
                        <ChevronDown size={24} color="white" />
                      ) : (
                        <ChevronUp size={24} color="white" />
                      )
                    }
                  </>
                )
              }}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitColors.map((color) => (
                  <CheckBox
                    key={color.name}
                    title={t(`chatSection.colors.${color.name.toLowerCase()}`)}
                    checked={outfitColor.includes(color.name)}
                    onPress={() => {
                      setOutfitColor((prev) => {
                        if (prev.includes(color.name)) {
                          return prev.filter((t) => t !== color.name);
                        } else {
                          return [...prev, color.name];
                        }
                      });
                    }}
                    checkedIcon={<View style={{ backgroundColor: color.hex, width: 24, height: 24, borderRadius: 12 }} />}
                    uncheckedIcon={<View style={{ backgroundColor: '#ccc', width: 24, height: 24, borderRadius: 12 }} />}
                    containerStyle={{ backgroundColor: 'transparent' }}
                    textStyle={{ color: 'white' }}
                    checkedColor='white'
                  />
                ))}
              </View>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="elements">
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => {
                return (
                  <>
                    <Text className='text-2xl text-white font-bold'>{t('chatSection.selectOutfitElements')}</Text>
                    {
                      isExpanded ? (
                        <ChevronDown size={24} color="white" />
                      ) : (
                        <ChevronUp size={24} color="white" />
                      )
                    }
                  </>
                )
              }}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitElements.map((element) => (
                  <CheckBox
                    key={element.name}
                    title={t(`chatSection.elements.${element.name.toLowerCase()}`)}
                    checked={outfitElement.includes(element.name)}
                    onPress={() => {
                      setOutfitElement((prev) => {
                        if (prev.includes(element.name)) {
                          return prev.filter((t) => t !== element.name);
                        } else {
                          return [...prev, element.name];
                        }
                      });
                    }}
                    checkedIcon='check-square'
                    uncheckedIcon='square-o'
                    containerStyle={{ backgroundColor: 'transparent' }}
                    textStyle={{ color: 'white' }}
                    checkedColor='white'
                  />
                ))}
              </View>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-range">
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <Text className="text-2xl text-white font-bold">{t('chatSection.selectPriceRange')}</Text>
                  {isExpanded ? (
                    <ChevronDown size={24} color="white" />
                  ) : (
                    <ChevronUp size={24} color="white" />
                  )}
                </>
              )}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col items-start gap-2">
              <Text className="text-white">{t('chatSection.from')}</Text>
              <TextInput
                value={`${lowestPrice}`}
                onChangeText={(text) => setLowestPrice(Number(text))}
                placeholder={t('chatSection.placeholders.lowestPrice')}
                keyboardType="numeric"
                className="p-4 bg-gray/10 border-[1px] border-white/10 backdrop-blur-xl text-white/80 rounded-lg mb-2"
              />
              <Text className="text-white">{t('chatSection.to')}</Text>
              <TextInput
                value={`${highestPrice}`}
                onChangeText={(text) => setHighestPrice(Number(text))}
                placeholder={t('chatSection.placeholders.highestPrice')}
                keyboardType="numeric"
                className="p-4 bg-gray/10 border-[1px] border-white/10 backdrop-blur-xl text-white/80 rounded-lg"
              />
              <Text className="text-white text-sm mt-2">{t('chatSection.currency')}</Text>
              <Select
                selectedValue={currency}
                onValueChange={(value: string) => setCurrency(value)}
              >
                <SelectTrigger className="bg-gray-800/10 border border-white/10 backdrop-blur-xl text-white/80 rounded-lg">
                  <SelectInput
                    placeholder={t('chatSection.placeholders.currency')}
                    className="text-white/80"
                    value={currency}
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop className="bg-black/50 backdrop-blur-sm" />
                  <SelectContent className="bg-gray-800 border border-white/10 rounded-lg overflow-hidden">
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator className="bg-white/20" />
                    </SelectDragIndicatorWrapper>
                    {Currencies.map((currencyItem: any) => (
                      <SelectItem
                        key={currencyItem.name}
                        value={currencyItem.name}
                        label={t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)}
                        className="px-4 py-3 border-b border-white/10 last:border-b-0 active:bg-gray-700"
                      >
                        <Text className="text-white">{t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)}</Text>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollView>

      <View className='fixed bottom-12 w-full bg-transparent p-4'>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          multiline={true}
          numberOfLines={4}
          placeholder={t('chatSection.placeholders.outfitDescription')}
          className='p-4 bg-gray/10 border-[1px] border-white/10 backdrop-blur-xl text-white/80 rounded-lg'
        />
      </View>
    </View>
  );
}