import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppHeaderProps = {
  routeName?: string;
};

export default function AppHeader({ routeName }: AppHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;
  let title = 'My App';
  if (routeName === 'ProfilePage') title = 'Profile';
  if (routeName === 'HomePage') title = 'Home';
  if (routeName === 'MakeTransactionPage') title = 'Make a Transaction';
  if (routeName === 'AddProductsPage') title = 'Add a Product';
  if (routeName === 'ReceiptPage') title = 'Receipt';
  if (routeName === 'InventoryPage') title = 'Inventory';
  if (routeName === 'TransactionRecordPage') title = 'Transaction Records';
  if (routeName === 'EditProductPage') title = 'Edit Product';



  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
    <View style={styles.headerContainer}>
      <Text style={styles.title}>{title}</Text>

      {user.profile_image ? (
        <Pressable onPress={() => router.push('/ProfilePage')}>
          <Image
            source={{ uri: user.profile_image }}
            style={styles.profileImage}
          />
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push('/ProfilePage')}>
          <View style={styles.placeholderImage} />
        </Pressable>
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: '#411C0E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  placeholderImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#411C0E'
  },
});