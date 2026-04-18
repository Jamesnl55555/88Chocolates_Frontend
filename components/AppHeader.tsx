import { useAuth } from '@/contexts/AuthContext';
import { IconUser } from '@tabler/icons-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type AppHeaderProps = {
  routeName?: string;
};

export default function AppHeader({ routeName }: AppHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();


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

  const noBackRoutes = [
    'HomePage'
  ];

  const showBackButton = navigation.canGoBack() && !noBackRoutes.includes(routeName ?? '');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {showBackButton && (
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={{ color: '#fff', fontSize: 18 }}>{'<'}</Text>
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      

      {user.profile_image && routeName !== 'ReceiptPage' && routeName !== 'RecordReceiptPage' ? (
        <Pressable onPress={() => router.push('/ProfilePage')}>
          <Image
            source={{ uri: user.profile_image }}
            style={styles.profileImage}
          />
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push('/ProfilePage')}>
          <View style={styles.placeholderImage}>
            <IconUser size={20} color="#411C0E"/>
          </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    backgroundColor: '#411C0E'
  },
});