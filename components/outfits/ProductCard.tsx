import { Image, Linking, Text, View } from 'react-native';

export type ProductCardProps = {
  title: string;
  url: string;
  image?: string;
  price?: string;
  merchant?: string;
  reason?: string;
};

export const ProductCard = ({ title, url, image, price, merchant, reason }: ProductCardProps) => {
  return (
    <View className='bg-white/5 border border-white/10 rounded-2xl p-3 mb-3 flex-row gap-3'>
      {image ? (
        <Image source={{ uri: image }} style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: '#ffffff10' }} />
      ) : (
        <View style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: '#ffffff10' }} />
      )}
      <View className='flex-1'>
        <Text className='text-white font-semibold'>{title}</Text>
        {merchant ? <Text className='text-white/60 text-xs mt-0.5'>{merchant}</Text> : null}
        {reason ? <Text className='text-white/80 mt-1'>{reason}</Text> : null}
        <View className='flex-row items-center justify-between mt-2'>
          {price ? <Text className='text-white font-semibold'>{price}</Text> : <View />}
          <Text className='text-blue-300' onPress={() => Linking.openURL(url)}>View</Text>
        </View>
      </View>
    </View>
  );
};


