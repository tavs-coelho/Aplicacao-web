import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/contexts/AuthContext';
import { MyOrdersScreen } from './src/screens/MyOrdersScreen';
import { OrderDetailsScreen } from './src/screens/OrderDetailsScreen';
import { RatingScreen } from './src/screens/RatingScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MyOrders"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3498db',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen
            name="MyOrders"
            component={MyOrdersScreen}
            options={{
              title: 'Minhas Ordens de Serviço',
            }}
          />
          <Stack.Screen
            name="OrderDetails"
            component={OrderDetailsScreen}
            options={{
              title: 'Detalhes da Ordem',
            }}
          />
          <Stack.Screen
            name="Rating"
            component={RatingScreen}
            options={{
              title: 'Avaliação',
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  );
}
