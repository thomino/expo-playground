import { Stack, Color, router } from 'expo-router';
import { ScrollView, View, Text, Platform, Pressable, Image, ImageBackground } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NativeToolbarScreen() {
    const insets = useSafeAreaInsets();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState<'recent' | 'date'>('recent');
    const [isBoxOpen, setIsBoxOpen] = useState(false);

    if (Platform.OS !== 'ios') {
        return (
            <View className="flex-1 bg-background items-center justify-center px-6">
                <Text className="text-text text-xl font-bold text-center">
                    Stack.Toolbar is iOS only
                </Text>
                <Text className="text-text/50 text-center mt-2">
                    This feature requires Expo Router v7 beta on iOS
                </Text>
            </View>
        );
    }

    return (
        <>
            <ImageBackground source={require('@/assets/img/scify.jpg')} className="w-full h-full relative">

                <View style={{ paddingTop: insets.top }} className='flex flex-row w-full justify-between items-center px-global mt-4'>
                    <Pressable onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color="white" />
                    </Pressable>
                </View>

                {/* Bottom toolbar */}
                <Stack.Toolbar placement="bottom">
                    
                <Stack.Toolbar.Spacer />
                    <Stack.Toolbar.Button
                        tintColor="white"
                        icon="clock"
                        selected={isFilterOpen}
                        onPress={() => {setIsBoxOpen(false); setIsFilterOpen((prev) => !prev)}}
                        variant="plain"
                    >
                        <Text>24</Text>

                    </Stack.Toolbar.Button>

                    <Stack.Toolbar.View hidden={!isFilterOpen}>
                        <View className="flex-row items-center w-[80px] -ml-[16px] ">

                            <View className="h-8 justify-center">
                                <Text className="text-xs text-white">Made by</Text>
                                <Text className="text-xs font-bold text-white">
                                    Thomino
                                </Text>
                            </View>
                        </View>
                    </Stack.Toolbar.View>
                    <Stack.Toolbar.Spacer />
                    <Stack.Toolbar.Menu icon="ellipsis">
                        <Stack.Toolbar.Menu inline>
                            <Stack.Toolbar.Menu inline title="Sort By">
                                <Stack.Toolbar.MenuAction
                                    isOn={selectedSort === 'recent'}
                                    onPress={() => setSelectedSort('recent')}
                                >
                                    Recently Added
                                </Stack.Toolbar.MenuAction>
                                <Stack.Toolbar.MenuAction
                                    isOn={selectedSort === 'date'}
                                    onPress={() => setSelectedSort('date')}
                                >
                                    Date Captured
                                </Stack.Toolbar.MenuAction>
                            </Stack.Toolbar.Menu>
                        </Stack.Toolbar.Menu>
                        <Stack.Toolbar.MenuAction icon="heart">
                            Favorites
                        </Stack.Toolbar.MenuAction>
                        <Stack.Toolbar.MenuAction icon="trash" destructive>
                            Delete All
                        </Stack.Toolbar.MenuAction>
                    </Stack.Toolbar.Menu>
                    



                    <Stack.Toolbar.Button icon="bag" onPress={() => router.push('/screens/native-sheet')} />

                    <Stack.Toolbar.Spacer />
                    <Stack.Toolbar.View hidden={!isBoxOpen}>
                        <View className="flex-row items-center w-[80px] ">

                            <View className="h-8 justify-center pl-4">
                                <Text className="text-xs text-white">Delivery</Text>
                                <Text className="text-xs font-bold text-white">
                                    Standard
                                </Text>
                            </View>
                        </View>
                    </Stack.Toolbar.View>
                    <Stack.Toolbar.Button
                        icon="shippingbox"
                        selected={isBoxOpen}
                        onPress={() => {setIsFilterOpen(false); setIsBoxOpen((prev) => !prev)}}
                        variant="plain"
                    >

                    </Stack.Toolbar.Button>
                    <Stack.Toolbar.Spacer />

                    



                </Stack.Toolbar>
            </ImageBackground>
        </>
    );
}
