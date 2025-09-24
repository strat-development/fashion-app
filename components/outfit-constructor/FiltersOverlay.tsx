import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Currencies, OutfitColors, OutfitElements, OutfitFit, OutfitGender, OutfitStylesTags } from '@/consts/chatFilterConsts';
import { CheckBox } from '@rneui/themed';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { ScrollView, Text, TextInput, View } from 'react-native';

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
    <View className='absolute inset-0 bg-black/50 backdrop-blur-md z-30 items-center'>
      <View className='w-[95vw] mt-32 mb-4 flex-1'>
        <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          <Accordion variant='filled' type='multiple' className='w-full bg-transparent'>
          <AccordionItem className='w-full' value='gender'>
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <Text className='text-2xl text-white font-bold'>{t('chatSection.selectGender')}</Text>
                  {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                </>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitGender.map((gender) => (
                  <CheckBox
                    key={gender.name}
                    title={t(`chatSection.genders.${gender.name.toLowerCase()}`)}
                    checked={props.outfitGender.includes(gender.name)}
                    onPress={() => {
                      props.setOutfitGender((prev) => (prev.includes(gender.name) ? prev.filter((t) => t !== gender.name) : [...prev, gender.name]));
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
          <AccordionItem value='styles'>
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <Text className='text-2xl text-white font-bold'>{t('chatSection.selectOutfitStyles')}</Text>
                  {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                </>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitStylesTags.map((tag) => (
                  <CheckBox
                    key={tag.name}
                    title={t(`chatSection.styles.${tag.name.toLowerCase()}`)}
                    checked={props.outfitTag.includes(tag.name)}
                    onPress={() => {
                      props.setOutfitTag((prev) => (prev.includes(tag.name) ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]));
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
          <AccordionItem value='fit'>
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <Text className='text-2xl text-white font-bold'>{t('chatSection.selectFit')}</Text>
                  {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                </>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitFit.map((fit) => (
                  <CheckBox
                    key={fit.name}
                    title={t(`chatSection.fits.${fit.name.toLowerCase()}`)}
                    checked={props.outfitFit.includes(fit.name)}
                    onPress={() => {
                      props.setOutfitFit((prev) => (prev.includes(fit.name) ? prev.filter((t) => t !== fit.name) : [...prev, fit.name]));
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
          <AccordionItem value='colors'>
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <Text className='text-2xl text-white font-bold'>{t('chatSection.selectDominantColors')}</Text>
                  {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                </>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitColors.map((color) => (
                  <CheckBox
                    key={color.name}
                    title={t(`chatSection.colors.${color.name.toLowerCase()}`)}
                    checked={props.outfitColor.includes(color.name)}
                    onPress={() => {
                      props.setOutfitColor((prev) => (prev.includes(color.name) ? prev.filter((t) => t !== color.name) : [...prev, color.name]));
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
          <AccordionItem value='elements'>
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <Text className='text-2xl text-white font-bold'>{t('chatSection.selectOutfitElements')}</Text>
                  {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                </>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <View className='flex flex-row items-center w-full flex-wrap'>
                {OutfitElements.map((element) => (
                  <CheckBox
                    key={element.name}
                    title={t(`chatSection.elements.${element.name.toLowerCase()}`)}
                    checked={props.outfitElement.includes(element.name)}
                    onPress={() => {
                      props.setOutfitElement((prev) => (prev.includes(element.name) ? prev.filter((t) => t !== element.name) : [...prev, element.name]));
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
          <AccordionItem value='price-range'>
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => (
                <>
                  <Text className='text-2xl text-white font-bold'>{t('chatSection.selectPriceRange')}</Text>
                  {isExpanded ? <ChevronDown size={24} color='white' /> : <ChevronUp size={24} color='white' />}
                </>
              )}
            </AccordionTrigger>
            <AccordionContent className='flex flex-col items-start gap-2'>
              <Text className='text-white'>{t('chatSection.from')}</Text>
              <TextInput
                value={`${props.lowestPrice}`}
                onChangeText={(text) => props.setLowestPrice(Number(text))}
                placeholder={t('chatSection.placeholders.lowestPrice')}
                keyboardType='numeric'
                className='p-4 bg-white/5 border-[1px] border-white/10 backdrop-blur-xl text-white/80 rounded-lg mb-2'
              />
              <Text className='text-white'>{t('chatSection.to')}</Text>
              <TextInput
                value={`${props.highestPrice}`}
                onChangeText={(text) => props.setHighestPrice(Number(text))}
                placeholder={t('chatSection.placeholders.highestPrice')}
                keyboardType='numeric'
                className='p-4 bg-white/5 border-[1px] border-white/10 backdrop-blur-xl text-white/80 rounded-lg'
              />
              <Text className='text-white text-sm mt-2'>{t('chatSection.currency')}</Text>
              <Select selectedValue={props.currency} onValueChange={(value: string) => props.setCurrency(value)}>
                <SelectTrigger className='bg-white/5 border border-white/10 backdrop-blur-xl text-white/80 rounded-lg'>
                  <SelectInput placeholder={t('chatSection.placeholders.currency')} className='text-white/80' value={props.currency} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop className='bg-black/50 backdrop-blur-sm' />
                  <SelectContent className='bg-gray-800 border border-white/10 rounded-lg overflow-hidden'>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator className='bg-white/20' />
                    </SelectDragIndicatorWrapper>
                    {Currencies.map((currencyItem: any) => (
                      <SelectItem key={currencyItem.name} value={currencyItem.name} label={t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)} className='px-4 py-3 border-b border-white/10 last:border-b-0 active:bg-gray-700'>
                        <Text className='text-white'>{t(`chatSection.currencies.${currencyItem.name.toLowerCase()}`)}</Text>
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
      <View className='w-[95vw] mb-24'>
        <View className='bg-white/10 border border-white/10 rounded-xl p-3 items-center'>
          <Text className='text-white' onPress={onClose}>Close</Text>
        </View>
      </View>
    </View>
  );
};


